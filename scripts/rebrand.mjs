import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);
const EXTENSIONS = new Set([
  '.astro', '.ts', '.tsx', '.js', '.mjs', '.json', '.css', '.md',
  '.toml', '.txt', '.yaml', '.yml', '.html', '.svg',
]);

const replacements = [
  ['www.zen-browser.app', 'astra-browser.app'],
  ['docs.zen-browser.app', 'github.com/Hrishikeshmind/astradesktop'],
  ['zen-browser.github.io/theme-store/themes.json', 'raw.githubusercontent.com/Hrishikeshmind/astradesktop/main/themes.json'],
  ['zen-browser.github.io', 'github.com/Hrishikeshmind/astradesktop'],
  ['github.com/zen-browser/desktop', 'github.com/Hrishikeshmind/astradesktop'],
  ['github.com/zen-browser/www', 'github.com/Hrishikeshmind/astrawebsite'],
  ['github.com/zen-browser', 'github.com/Hrishikeshmind/astradesktop'],
  ['zen-browser.app', 'astra-browser.app'],
  ['discord.gg/zen-browser', 'github.com/Hrishikeshmind/astradesktop/discussions'],
  ['patreon.com/zen_browser', 'github.com/sponsors/Hrishikeshmind'],
  ['ko-fi.com/zen_browser', 'github.com/sponsors/Hrishikeshmind'],
  ['zen-browser-checksum-fetcher', 'astra-browser-checksum-fetcher'],
  ['app.zen_browser.zen', 'app.astra_browser.astra'],
  ['io.github.zen_browser.zen', 'io.github.Hrishikeshmind.astradesktop'],
  ['zen.macos-universal.dmg', 'astra.macos-universal.dmg'],
  ['zen.installer-arm64.exe', 'astra.installer-arm64.exe'],
  ['zen.installer.exe', 'astra.installer.exe'],
  ['zen.linux-x86_64.tar.xz', 'astra.linux-x86_64.tar.xz'],
  ['zen.linux-aarch64.tar.xz', 'astra.linux-aarch64.tar.xz'],
  ['Zen Browser', 'Astra Browser'],
  ['Zen Mods', 'Astra Mods'],
  ['Zen Mod', 'Astra Mod'],
  ['Zen team', 'Astra team'],
  ['zen_browser', 'astra_browser'],
  ['zen-browser', 'astra-browser'],
  ['zenbrowser-www', 'astrabrowser-www'],
  ['zen-link', 'astra-link'],
  ['--color-zen-', '--color-astra-'],
  ['--zen-', '--astra-'],
  ['zen-paper', 'astra-paper'],
  ['zen-dark', 'astra-dark'],
  ['zen-muted', 'astra-muted'],
  ['zen-subtle', 'astra-subtle'],
  ["Zen's", "Astra's"],
  ['Zen', 'Astra'],
  ['zen.', 'astra.'],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (EXTENSIONS.has(path.extname(entry.name)) && entry.name !== 'rebrand.mjs') {
      files.push(full);
    }
  }
  return files;
}

let count = 0;
for (const file of walk(ROOT)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [oldStr, newStr] of replacements) {
    content = content.split(oldStr).join(newStr);
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
}

console.log(`Rebranded ${count} files`);
