#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

const MARK_BEGIN = '# --- cdj hook (BEGIN) ---';
const MARK_END = '# --- cdj hook (END) ---';
const HOOK = `
${MARK_BEGIN}
cdj() {
  local resolver target
  # Find the actual binary path, not this function
  resolver="$(type -P cdj 2>/dev/null || true)"
  if [ -n "$resolver" ]; then
    target="$("$resolver" "$@")" || return 1
  else
    target="$(npx -y cdj "$@")" || return 1
  fi
  cd "$target" || return 1
}
${MARK_END}
`.trim() + '\n';

function detectRcFiles() {
  const shell = process.env.SHELL || '';
  const home = os.homedir();
  const prefs = [];

  // Common rc files by shell
  if (shell.includes('zsh')) {
    prefs.push(path.join(home, '.zshrc'));
  } else if (shell.includes('bash')) {
    // WSL, Linux usually .bashrc; macOS login maybe .bash_profile
    prefs.push(path.join(home, '.bashrc'), path.join(home, '.bash_profile'));
  } else if (shell.includes('fish')) {
    prefs.push(path.join(home, '.config', 'fish', 'config.fish')); // (Fish users will need a fish variant)
  }

  // Fallbacks if SHELL isn’t set or user uses other shells
  prefs.push(path.join(home, '.zshrc'));
  prefs.push(path.join(home, '.bashrc'));
  prefs.push(path.join(home, '.bash_profile'));

  // De-dup
  return [...new Set(prefs)];
}

function alreadyInstalled(contents) {
  return contents.includes(MARK_BEGIN) && contents.includes(MARK_END);
}

function installTo(file) {
  try {
    let contents = '';
    if (fs.existsSync(file)) contents = fs.readFileSync(file, 'utf8');
    if (alreadyInstalled(contents)) return false; // been there, done that
    // Ensure file exists
    if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, '\n' + HOOK);
    return true;
  } catch (e) {
    return false;
  }
}

(function main() {
  // Respect users who disable lifecycle scripts or CI environs
  if (process.env.npm_config_ignore_scripts === 'true' || process.env.CI) {
    console.log('[cdj] Skipping hook install (ignore-scripts/CI detected).');
    console.log('[cdj] You can run:  source <(cdj hook)  or  cdj hook >> ~/.zshrc');
    return;
  }

  const candidates = detectRcFiles();
  let done = false;

  for (const file of candidates) {
    if (installTo(file)) {
      console.log(`[cdj] Installed shell hook to ${file}`);
      done = true;
      break;
    }
  }

  if (!done) {
    console.log('[cd] Could not auto-install a shell hook.');
    console.log('[cdj] Run one of:');
    console.log('  source <(cdj hook)      # current session only');
    console.log('  cdj hook >> ~/.bashrc    # persist for bash');
    console.log('  cdj hook >> ~/.zshrc     # persist for zsh');
  } else {
    console.log('[cdj] Reload your shell or run:  source ~/.bashrc  (or ~/.zshrc)');
    console.log('[cdj] Tip: you can always re-install the hook manually with:');
    console.log('  cdj hook >> ~/.bashrc      # or ~/.zshrc');
  }
})();

