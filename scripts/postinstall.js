#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

const MARK_BEGIN = '# --- cdj hook (BEGIN) ---';
const MARK_END = '# --- cdj hook (END) ---';
const HOOK = `
${MARK_BEGIN}
cdj() {
  # Pass through alias generation so output can be eval'ed or appended
  if [[ "$1" == "-g" || "$1" == "--gen-aliases" ]]; then
    command cdj "$@"
    return
  fi
  
  local resolver target
  # Resolve the real binary (avoid recursion into this function)
  resolver="$(type -P cdj 2>/dev/null || true)"
  if [ -n "$resolver" ]; then
    target="$("$resolver" "$@")" || return 1
  else
    # Fallback if the binary isn't on PATH for some reason
    target="$(npx -y cdj "$@")" || return 1
  fi

  # Only cd if we actually got a destination
  [ -n "$target" ] && cd -- "$target" || return 1
}
${MARK_END}
`.trim() + '\n';

function detectRcFiles() {
  const shell = process.env.SHELL || '';
  const home = os.homedir();
  const prefs = [];

  if (shell.includes('zsh')) {
    prefs.push(path.join(home, '.zshrc'));
  } else if (shell.includes('bash')) {
    // WSL/Linux: .bashrc is typical; macOS login shells may use .bash_profile
    prefs.push(path.join(home, '.bashrc'), path.join(home, '.bash_profile'));
  } else if (shell.includes('fish')) {
    // Not a fish script, but we include it so users see where to adapt
    prefs.push(path.join(home, '.config', 'fish', 'config.fish'));
  }

  // Fallbacks if SHELL isn't set / unknown
  prefs.push(path.join(home, '.zshrc'));
  prefs.push(path.join(home, '.bashrc'));
  prefs.push(path.join(home, '.bash_profile'));

  // De-dup
  return [...new Set(prefs)];
}

function installTo(file) {
  try {
    let contents = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';

    const start = contents.indexOf(MARK_BEGIN);
    const end = contents.indexOf(MARK_END);

    if (start !== -1 && end !== -1 && end > start) {
      // Replace existing block in-place (upgrades cleanly)
      const before = contents.slice(0, start).trimEnd();
      const after = contents.slice(end + MARK_END.length).trimStart();
      const next = [before, HOOK.trim(), after].filter(Boolean).join('\n') + '\n';
      fs.writeFileSync(file, next);
      return { file, action: 'replaced' };
    }

    // Append fresh block
    const next = (contents ? contents.replace(/\s*$/,'\n') : '') + '\n' + HOOK;
    fs.writeFileSync(file, next);
    return { file, action: 'installed' };
  } catch (e) {
    return { file, action: 'error', error: e };
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
  let result = null;

  for (const file of candidates) {
    const r = installTo(file);
    if (r.action === 'installed' || r.action === 'replaced') {
      result = r;
      console.log(`[cdj] ${r.action === 'installed' ? 'Installed' : 'Updated'} shell hook in ${r.file}`);
      break;
    }
  }

  if (!result) {
    console.log('[cdj] Could not auto-install a shell hook.');
    console.log('[cdj] Run one of:');
    console.log('  source <(cdj hook)      # current session only');
    console.log('  cdj hook >> ~/.bashrc    # persist for bash');
    console.log('  cdj hook >> ~/.zshrc     # persist for zsh');
  } else {
    // Friendly tips match README
    const home = os.homedir();
    console.log('[cdj] Reload your shell or run:  source ~/.bashrc  (or ~/.zshrc)');
    console.log('[cdj] Tip: to generate aliases without cd’ing, use:  cdj -g >> ~/.bashrc');
    console.log('[cdj] Tip: you can always re-install the hook manually with:');
    console.log('  cdj hook >> ~/.bashrc      # or ~/.zshrc');
    console.log(`[cdj] (Your base can be overridden with:  export CDJ_BASE="${home}/Projects")`);
  }
})();

