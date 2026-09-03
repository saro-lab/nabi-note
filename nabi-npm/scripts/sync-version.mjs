// 판 하나를 두 곳에 맞춘다 — package.json이 정본이고, 코어가 못 읽는 package.json 대신 소스에 글자로 박힌 `NABI_VERSION`(.nabi 파일에 저장되는 값)을 이 스크립트가 따라가게 한다.
// Syncs one version into two places — package.json is the source of truth, and since the core can't read it, this keeps the hand-written `NABI_VERSION` in source (the value stored in .nabi files) in step with it.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'src', 'io', 'file.ts');
const MARK = /export const NABI_VERSION = '([^']*)';/;

export function synced(source, version) {
  if (!MARK.test(source)) throw new Error('sync-version — NABI_VERSION 을 못 찾았다');
  return source.replace(MARK, `export const NABI_VERSION = '${version}';`);
}

function main() {
  const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const before = readFileSync(SOURCE, 'utf8');
  const was = MARK.exec(before)?.[1];
  if (was === version) {
    console.log(`판 ${version} — 이미 맞다`);
    return;
  }
  writeFileSync(SOURCE, synced(before, version), 'utf8');
  console.log(`판 ${was} → ${version} (src/io/file.ts)`);
}

if (process.argv[1] && process.argv[1].endsWith('sync-version.mjs')) main();
