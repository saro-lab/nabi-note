#!/usr/bin/env node
// The site bites the real npm tarball, not the source folder — packing mistakes stay invisible through a symlink
// 사이트는 소스 폴더가 아니라 실제 npm 배포물을 문다 — 심볼릭 링크로는 담기 실수가 안 보인다
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkgDir = resolve(web, '..', 'nabi-npm');

// npm.cmd 를 shell 없이 spawn 하면 Windows 에서 EINVAL 이 난다(Node 의 CVE-2024-27980 대응 이후 동작)
// node 로 npm 의 실제 진입점(js)을 직접 실행하면 이 문제를 피한다
const npmCli = process.platform === 'win32'
  ? join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
  : null;
const run = (args, cwd, capture = false) =>
  execFileSync(npmCli ? process.execPath : 'npm', npmCli ? [npmCli, ...args] : args, {
    cwd,
    encoding: 'utf8',
    stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit',
  });

const log = (message) => console.log(`[pack-note] ${message}`);

log('nabi-note 빌드');
run(['run', 'build'], pkgDir);

// A version bump renames the tarball, so leftovers would sit next to the new one forever
// 버전이 오르면 파일 이름이 바뀐다 — 치우지 않으면 옛 것이 새 것 옆에 계속 남는다
for (const name of readdirSync(web)) {
  if (/^nabi-note-.*\.tgz$/.test(name)) {
    rmSync(resolve(web, name));
    log(`옛 압축 패키지 삭제: ${name}`);
  }
}

log('nabi-note 압축 패키지 생성');
const tarball = run(['pack', '--pack-destination', web], pkgDir, true).trim().split('\n').pop().trim();
if (!tarball || !existsSync(resolve(web, tarball))) {
  console.error('[pack-note] npm pack 이 만든 파일을 찾지 못했습니다.');
  process.exit(1);
}
log(`생성됨: ${tarball}`);

// The file name does not change between builds, so npm would keep the stale copy it already installed
// 파일 이름은 빌드마다 그대로다 — 지우지 않으면 npm 이 이미 깔아 둔 옛 사본을 그대로 둔다
rmSync(resolve(web, 'node_modules/nabi-note'), { recursive: true, force: true });

// Installing by explicit spec is what writes the tarball name into package.json and the lockfile
// 명시한 사양으로 설치하는 것이 package.json 과 잠금 파일에 이 파일 이름을 적어 넣는 일이다
log('nabi-web 에 설치');
run(['install', `nabi-note@file:./${tarball}`], web);
log('완료');
