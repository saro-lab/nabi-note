// test/*.test.ts 를 전부 tsx로 돌리고, 깨지는 그물이 있으면 실패로 끝낸다. vitest가 아니다 — 그물은 평범한 스크립트라 파일마다 프로세스 하나씩 띄우기만 하면 된다(전역 상태를 안 나눈다).
// Runs every test/*.test.ts under tsx and fails if any net breaks. Not vitest — nets are plain scripts, so the runner just spawns one process per file (no shared global state between them).
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dir = join(root, 'test');
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.test.ts'))
  .sort();

// Windows의 `npx.cmd`를 shell 없이 spawn하면 EINVAL이 난다(Node CVE-2024-27980 대응 이후) — tsx loader를 node의 `--import`로 직접 걸어 npx·.cmd를 아예 거치지 않는다.
// Spawning Windows's `npx.cmd` without a shell throws EINVAL (since Node's CVE-2024-27980 fix) — loading the tsx loader directly via node's `--import` sidesteps npx/.cmd entirely.
const tsxLoader = createRequire(import.meta.url).resolve('tsx');

let failed = 0;
for (const name of files) {
  const result = spawnSync(process.execPath, ['--import', tsxLoader, join(dir, name)], { stdio: 'inherit', cwd: root });
  if (result.status !== 0) failed += 1;
}

console.log(`\n그물 ${files.length - failed}/${files.length} 통과`);
process.exit(failed === 0 ? 0 : 1);
