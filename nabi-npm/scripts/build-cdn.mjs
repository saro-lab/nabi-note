// CDN 배포 한 벌을 모은다 — `cdn/dist/` 하나를 그대로 올리면 끝이다.
//
// **왜 따로 모으는가**: `dist/browser/nabi-note.min.js` 는 이미 있고 package.json 의
// `unpkg`·`jsdelivr` 가 그것을 가리킨다. 없는 것은 **그 파일 하나로 편집기가 서는 것을 보이는
// 자리** 였다(옛 판의 `standalone/`). 예문 없이 묶음만 두면, 태그 둘로 무엇을 어떻게 부르는지는
// 아무 데도 안 적혀 있게 된다.
//
// 모으는 것 다섯:
//   index.html· cdn.css   — 손으로 쓴 예문 (cdn/)
//   sample.js              — **생성물**. 시작 문서는 데모와 한 벌이라 `demo/sample.ts` 에서 낸다.
//   nabi-note.min.js       — 빌드가 낸 iife 묶음 (dist/browser/)
//   nabi.css               — 빌드가 낸 발행 시트 (dist/)
//
// 나온 폴더는 **아무것도 안 물고 돈다** — 경로가 전부 상대이고 모듈도 fetch 도 안 쓰므로
// 서버에 올려도 되고 서버 없이 파일로 열어도(file://) 선다.
//
// 실행: node scripts/build-cdn.mjs   (`npm run build:cdn`, `npm run build` 의 마지막 걸음)
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'cdn', 'dist');

// 시작 문서 → 전역 하나. `cdn/index.html` 은 모듈을 안 쓰므로 import 로 못 받는다.
export function sampleScript(sample) {
  return [
    '// 생성물 — `demo/sample.ts` 에서 나왔다. 손으로 고치지 마라 (scripts/build-cdn.mjs).',
    '// 데모 페이지와 이 예문이 같은 문서를 쓰게 하는 자리다.',
    `window.NABI_SAMPLE = ${JSON.stringify(sample, null, 2)};`,
    '',
  ].join('\n');
}

function need(path, what) {
  try {
    return readFileSync(path);
  } catch {
    throw new Error(`build:cdn — ${what} 가 없다 (${path}). \`npm run build\` 를 먼저 돌려라.`);
  }
}

async function main() {
  // 시작 문서는 타입스크립트 파일에 산다 — tsx 로 불러온다(그물이 쓰는 그 러너다).
  const { SAMPLE } = await import('../demo/sample.ts');

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const bundle = join(root, 'dist', 'browser', 'nabi-note.min.js');
  const sheet = join(root, 'dist', 'nabi.css');
  need(bundle, 'CDN 묶음');
  need(sheet, '발행 시트');

  copyFileSync(join(root, 'cdn', 'index.html'), join(out, 'index.html'));
  copyFileSync(join(root, 'cdn', 'cdn.css'), join(out, 'cdn.css'));
  copyFileSync(bundle, join(out, 'nabi-note.min.js'));
  copyFileSync(sheet, join(out, 'nabi.css'));
  writeFileSync(join(out, 'sample.js'), sampleScript(SAMPLE));

  const size = (name) => `${(readFileSync(join(out, name)).length / 1024).toFixed(1)}KB`;
  console.log(
    `cdn/dist — nabi-note.min.js ${size('nabi-note.min.js')} · nabi.css ${size('nabi.css')} · ` +
      `sample.js ${size('sample.js')} · index.html ${size('index.html')}`,
  );
}

// 그물이 순수부(`sampleScript`)만 가져다 쓸 수 있게, 직접 돌 때만 모은다.
if (process.argv[1] && process.argv[1].endsWith('build-cdn.mjs')) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
