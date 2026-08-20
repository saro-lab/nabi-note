// 발행 CSS 를 굳힌다 — `dist/nabi.css` = 코어 시트 + 등록된 wing 시트 합집합.
//
// 이 파일 하나로 옛 판의 "가족 수만큼 중복" 이 재발하지 않는다: 접는 열쇠가 **문자열**이다.
// 한 가족이 시트 하나를 나눠 쓰므로(정렬·드롭캡·제목 셋이 문단 시트 하나, 목록 셋이 목록 시트
// 하나) wing 이름으로 세면 같은 규칙이 가족 수만큼 실린다.
//
// 순수부(`nabiCss`)와 굳히는 부분(`main`)이 갈려 있다 — 그물(test/entry.test.ts)이 순수부를
// 그대로 부르고, 굳히는 쪽만 파일과 `dist/` 를 안다. 실제 시트는 `tsup` 이 낸 `dist/index.js`
// 에서 읽는다(빌드가 낸 엔트리가 정말 도는지까지 이 걸음이 함께 확인한다).
//
// 실행: node scripts/build-css.mjs   (`npm run build` 가 tsup 뒤에 부른다)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HEADER = '/* nabi-note — 코어 시트 + wing 시트. scripts/build-css.mjs 가 냈다. 손으로 고치지 마라. */';

// 시트 목록 하나 → 발행 CSS 한 장. 빈 시트는 버리고, 같은 글은 한 번만 싣는다.
export function nabiCss(sheets) {
  const seen = new Set();
  const kept = [];
  for (const sheet of sheets) {
    const text = typeof sheet === 'string' ? sheet.trim() : '';
    if (text === '' || seen.has(text)) continue;
    seen.add(text);
    kept.push(text);
  }
  return `${HEADER}\n${kept.join('\n\n')}\n`;
}

async function main() {
  const dist = new URL('../dist/', import.meta.url);
  const { CORE_CSS, collectSheets, defaultWings, makeRegistry } = await import(new URL('index.js', dist));
  const css = nabiCss(collectSheets(makeRegistry(defaultWings), CORE_CSS));
  const out = fileURLToPath(new URL('nabi.css', dist));
  writeFileSync(out, css);
  console.log(`built ${out} (${css.length} bytes)`);
}

// 직접 돌렸을 때만 굳힌다 — 그물이 import 할 때는 순수부만 가져간다.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
