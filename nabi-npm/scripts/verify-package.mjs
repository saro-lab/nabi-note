import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const expectedExports = ['.', './diff', './icons/*', './nabi.css', './package.json', './ssr', './viewer'];

const fail = (message) => {
  throw new Error(message);
};

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

if (JSON.stringify(Object.keys(pkg.exports).sort()) !== JSON.stringify(expectedExports))
  fail('public export snapshot changed');

for (const file of walk(dist)) {
  if (!file.endsWith('.js') && !file.endsWith('.d.ts')) continue;
  const map = `${file}.map`;
  if (!statSync(map).isFile()) fail(`missing map: ${relative(root, map)}`);
  const source = readFileSync(file, 'utf8');
  if (!source.includes(`sourceMappingURL=${basename(map)}`)) fail(`broken sourceMappingURL: ${relative(root, file)}`);
  JSON.parse(readFileSync(map, 'utf8'));
}

const iconFiles = walk(join(dist, 'icons'));
if (!iconFiles.length || iconFiles.some((file) => !readFileSync(file, 'utf8').includes('<svg')))
  fail('missing icon assets');
const cssSource = readFileSync(join(dist, 'nabi.css'), 'utf8');
if (cssSource.includes('file://')) fail('filesystem URL in published CSS');
for (const [, name] of cssSource.matchAll(/url\("\.\/icons\/([^"/]+)"\)/g)) {
  if (!iconFiles.includes(join(dist, 'icons', name.split('?')[0]))) fail(`missing CSS icon: ${name}`);
}

const browserBytes = statSync(join(dist, 'browser', 'nabi-note.min.js')).size;
const cssBytes = statSync(join(dist, 'nabi.css')).size;
if (browserBytes > 600 * 1024) fail(`browser bundle budget exceeded: ${browserBytes}`);
if (cssBytes > 128 * 1024) fail(`CSS budget exceeded: ${cssBytes}`);

const temp = mkdtempSync(join(tmpdir(), 'nabi-pack-'));
try {
  const cache = join(temp, 'npm-cache');
  const packed = spawnSync(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--cache', cache, '--pack-destination', temp],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );
  if (packed.status !== 0) fail(packed.stderr || 'npm pack failed');
  const tarball = join(temp, JSON.parse(packed.stdout)[0].filename);
  const consumer = join(temp, 'consumer');
  mkdirSync(consumer);
  writeFileSync(join(consumer, 'package.json'), '{"type":"module"}\n');
  const installed = spawnSync(
    'npm',
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', cache, tarball],
    {
      cwd: consumer,
      encoding: 'utf8',
    },
  );
  if (installed.status !== 0) fail(installed.stderr || 'tarball install failed');
  const smoke = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "await import('nabi-note'); await import('nabi-note/ssr'); await import('nabi-note/viewer'); await import('nabi-note/diff'); console.log(import.meta.resolve('nabi-note/nabi.css'))",
    ],
    { cwd: consumer, encoding: 'utf8' },
  );
  if (smoke.status !== 0) fail(smoke.stderr || 'installed package smoke failed');
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log(`package: exports=${expectedExports.length} browser=${browserBytes}B css=${cssBytes}B maps=ok install=ok`);
