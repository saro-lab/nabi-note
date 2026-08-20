// 판 하나를 두 곳에 맞춘다 — `package.json` 이 정본이고 `NABI_VERSION` 이 그것을 따라간다.
//
// **왜 소스에 판이 또 있나**: `NABI_VERSION` 은 저장되는 `.nabi` 파일에 박히는 값이다(앞 둘만
// 쓴다 — `1.2.3` → `1.2`). 코어는 `package.json` 을 못 읽는다 — 번들러마다 JSON 을 읽는 법이
// 다르고, 서버에서도 돌아야 하기 때문이다. 그래서 값이 소스에 글자로 적혀 있고, 이 스크립트가
// 그것을 맞춘다.
//
// **손으로 안 맞춰도 되게 하는 자리**가 여기다. `npm version` 이 부르므로
// `npm version patch` 한 번이면 둘이 함께 올라간다. 그래도 그물은 그대로 둔다 — 누가 손으로
// 고치거나 스크립트를 건너뛰면 `npm test` 가 잡는다(두 겹이라 조용히 어긋날 자리가 없다).
//
// 실행: node scripts/sync-version.mjs   (`npm version` 이 자동으로 부른다)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'src', 'wings', 'file', 'file.ts');
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
  console.log(`판 ${was} → ${version} (src/wings/file/file.ts)`);
}

if (process.argv[1] && process.argv[1].endsWith('sync-version.mjs')) main();
