// test/*.test.ts 를 전부 tsx 로 돌리고, 깨지는 그물이 있으면 실패로 끝낸다.
//
// vitest 가 아니다 — 이 패키지는 의존성을 가볍게 늘리지 않는다. 그물은 평범한 스크립트이고
// 러너가 하는 일은 파일을 찾아 하나씩 프로세스로 띄우는 것뿐이다. 그물 한 장 = 프로세스 하나라
// 한 장이 죽어도 나머지는 계속 돌고, 그물끼리 전역 상태를 나눌 길이 없다(과 같은 정신).
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

// `npx` 는 Windows 에서 `npx.cmd` 로 풀리는데, shell 없이 `.cmd` 를 spawn 하면 거기서 EINVAL 이
// 난다(Node 의 CVE-2024-27980 대응 이후 동작) — tsx 자신의 CLI 진입점을 이 `node` 로 직접 돌리면
// npx·.cmd 를 거칠 일이 아예 없다.
const tsxCli = createRequire(import.meta.url).resolve('tsx/cli');

let failed = 0;
for (const name of files) {
  const result = spawnSync(process.execPath, [tsxCli, join(dir, name)], { stdio: 'inherit', cwd: root });
  if (result.status !== 0) failed += 1;
}

console.log(`\n그물 ${files.length - failed}/${files.length} 통과`);
process.exit(failed === 0 ? 0 : 1);
