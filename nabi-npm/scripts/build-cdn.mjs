// CDN 배포 한 벌을 `cdn/dist/`에 모은다 — 빌드 산출물에 손으로 쓴 예문(index.html·cdn.css)과 생성된 시작 문서(sample.js)를 더해, 상대 경로만으로 서버 없이도(file://) 선다.
// Assembles the CDN release into `cdn/dist/` — build output plus hand-written samples (index.html, cdn.css) and a generated sample doc (sample.js), all relative paths so it works even opened as a local file (file://).
import { cpSync, copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'cdn', 'dist');

// 시작 문서 → 전역 하나. `cdn/index.html` 은 모듈을 안 쓰므로 import 로 못 받는다.
// Sample doc becomes one global — `cdn/index.html` uses no modules, so it can't receive it via import.
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
  // The sample doc lives in a TypeScript file — loaded via tsx, the same runner the test nets use.
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
  cpSync(join(root, 'dist', 'icons'), join(out, 'icons'), { recursive: true });
  writeFileSync(join(out, 'sample.js'), sampleScript(SAMPLE));

  const size = (name) => `${(readFileSync(join(out, name)).length / 1024).toFixed(1)}KB`;
  console.log(
    `cdn/dist — nabi-note.min.js ${size('nabi-note.min.js')} · nabi.css ${size('nabi.css')} · ` +
      `sample.js ${size('sample.js')} · index.html ${size('index.html')}`,
  );
}

// 그물이 순수부(`sampleScript`)만 가져다 쓸 수 있게, 직접 돌 때만 모은다.
// Only assembles when run directly, so test nets can import just the pure part (`sampleScript`).
if (process.argv[1] && process.argv[1].endsWith('build-cdn.mjs')) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
