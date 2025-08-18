#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

const MARK_BEGIN = '# --- cdj hook (BEGIN) ---';
const MARK_END = '# --- cdj hook (END) ---';

function rcFiles() {
  const home = os.homedir();
  return [
    path.join(home, '.zshrc'),
    path.join(home, '.bashrc'),
    path.join(home, '.bash_profile'),
  ];
}

function removeBlock(file) {
  if (!fs.existsSync(file)) return false;
  const contents = fs.readFileSync(file, 'utf8');
  const start = contents.indexOf(MARK_BEGIN);
  const end = contents.indexOf(MARK_END);
  if (start === -1 || end === -1) return false;

  const before = contents.slice(0, start);
  const after = contents.slice(end + MARK_END.length);
  fs.writeFileSync(file, before.trimEnd() + '\n' + after.trimStart());
  return true;
}

(function main() {
  const targets = rcFiles();
  let removedAny = false;

  for (const f of targets) {
    if (removeBlock(f)) {
      console.log(`[cdj] Removed shell hook from ${f}`);
      removedAny = true;
    }
  }

  if (!removedAny) {
    console.log('[cdj] No shell hook blocks were found to remove.');
    console.log('[cdj] If you still see a cdj() function in your shell, it may be defined elsewhere (e.g., a custom dotfile).');
  }

  // Friendly tip to keep behavior consistent with postinstall.js
  console.log('[cdj] Tip: to re-enable later without reinstalling, you can run:');
  console.log('  cdj hook >> ~/.zshrc      # or ~/.bashrc');
})();
