// 발행 CSS를 굳힌다(`dist/nabi.css` = 코어 시트 + 등록된 wing 시트) — 접는 열쇠가 문자열 내용이라 가족이 시트 하나를 나눠 써도 중복되지 않는다.
// Freezes the published CSS (`dist/nabi.css` = core sheet + registered wing sheets) — folding keys on sheet content, so a family sharing one sheet never duplicates it.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HEADER = '/* nabi-note — 코어 시트 + wing 시트. scripts/build-css.mjs 가 냈다. 손으로 고치지 마라. */';

// 시트 목록 하나 → 발행 CSS 한 장. 빈 시트는 버리고, 같은 글은 한 번만 싣는다.
// One sheet list becomes one published stylesheet — empty sheets are dropped, identical text is kept only once.
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
// Only freezes to disk when run directly — a test net importing this module gets just the pure function.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
