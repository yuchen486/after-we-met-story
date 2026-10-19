import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2];
if (!/^\d{8}-[1-9]\d*$/.test(version ?? '')) {
  throw new Error('Provide a release version, for example: node scripts/release.mjs 20261019-3');
}
const outputs = [];
function asset(source, stem, extension) {
  const bytes = readFileSync(resolve(root, source));
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  const name = `assets/${stem}.${hash}.${extension}`;
  outputs.push([name, bytes]);
  return name;
}
const css = asset('style.css', 'style', 'css');
const story = asset('story.js', 'story', 'js');
const app = asset('app.js', 'app', 'js');
const updater = asset('version-check.js', 'version-check', 'js');
const photo = asset('assets/rain-window.jpg', 'rain-window', 'jpg');
const manuscript = asset('话到这里.md', 'essay', 'md');
let html = readFileSync(resolve(root, 'index.html'), 'utf8');
html = html.replace(/href="(?:assets\/)?style(?:\.[a-f0-9]+)?\.css(?:\?[^"]*)?"/, `href="${css}"`)
  .replace(/src="(?:assets\/)?story(?:\.[a-f0-9]+)?\.js(?:\?[^"]*)?"/, `src="${story}"`)
  .replace(/src="(?:assets\/)?app(?:\.[a-f0-9]+)?\.js(?:\?[^"]*)?"/, `src="${app}"`)
  .replace(/src="(?:assets\/)?version-check(?:\.[a-f0-9]+)?\.js(?:\?[^"]*)?"/, `src="${updater}"`)
  .replace(/((?:src|href)="|https:\/\/yuchen486\.github\.io\/after-we-met-story\/)assets\/rain-window(?:\.[a-f0-9]+)?\.jpg/g, `$1${photo}`)
  .replace(/href="(?:话到这里\.md|assets\/essay\.[a-f0-9]+\.md)"/g, `href="${manuscript}"`)
  .replace(/(<meta name="site-version" content=")[^"]+/, `$1${version}`)
  .replace(/(<meta name="site-root" content=")[^"]+/, '$1./')
  .replace(/(<span id="page-version">)[^<]+/, `$1修订 ${version}`);
for (const required of [css, story, app, updater, photo, manuscript]) {
  if (!html.includes(required)) throw new Error(`Missing release reference: ${required}`);
}
const snapshot = html.replace(/((?:href|src)=")assets\//g, '$1../../assets/')
  .replace('<meta name="site-root" content="./">', '<meta name="site-root" content="../../">');
const releasePath = `releases/${version}/index.html`;
if (existsSync(resolve(root, releasePath)) && readFileSync(resolve(root, releasePath), 'utf8') !== snapshot) {
  throw new Error('This release already exists with different content; choose a new version.');
}
outputs.push(['index.html', html], [releasePath, snapshot], ['release.json', JSON.stringify({
  version, path: `releases/${version}/`, title: '话到这里'
}, null, 2) + '\n']);
for (const [filename, data] of outputs) {
  mkdirSync(dirname(resolve(root, filename)), { recursive: true });
  writeFileSync(resolve(root, filename), data);
}
console.log(JSON.stringify({ version, path: `releases/${version}/`, generatedFiles: outputs.length }));
