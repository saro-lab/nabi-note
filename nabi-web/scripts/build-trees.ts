// 예문을 나비트리로 굳힌다 — 로케일 사전(`docs/.vitepress/locales/<lang>.ts`)의
// `demo_html`·`demo_html_*` → `docs/.vitepress/trees/<lang>.ts`.
//
// **원고는 사전에 그대로 산다.** 예문은 열넷의 번역문이라 다른 글과 같은 자리에서 고쳐야 하고,
// 트리는 거기서 뽑은 생성물이다 — 사람이 손으로 적을 것이 아니다. 사전을 고쳤으면 이것을 돌린다.
//
//   npm run build:trees      (nabi-web 폴더에서)
//
// 변환은 **패키지의 공식 문**만 쓴다: `createNabiWith(wings, { parseHtml })` 로 세우고
// `setHtml()` 로 들여보낸 뒤 `getJson()` 으로 받는다. 데모가 쓰던 그 문 그대로다.
//
// `parseHtml` 에 꽂는 것만 다르다 — 브라우저의 `parseNodes` 는 `DOMParser` 를 타는데 노드에는
// 그것이 없다. `html/parse.ts` 머리말이 말하는 그 자리라 ("서버가 HTML 을 읽어야 하면 최소 모양을
// 손수 지어 importDoc 을 직접 부른다 — 그물이 그렇게 한다") 그물의 토크나이저를 그대로 꽂는다.
// 패키지가 DOM 없는 들여오기 문을 열면 이 줄만 갈아 끼우면 된다 (ailog/todo/094).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 굳히기(HTML → 트리)는 편집기를 한 번 세워야 해서 코어 엔트리를 문다 — `setHtml` 이 거기 산다.
import { createNabiWith, defaultWings, makeTranslator } from 'nabi-note';
// 그리는 쪽은 **서버 진입점**이면 충분하다 — 편집 표면·화면 도구를 한 파일도 안 딛는다 (095).
import { makeRegistry, renderStoredEditorHtml, renderToolbarHtml, renderViewToolsHtml } from 'nabi-note/ssr';
import { tinyHtml } from '../../nabi-npm/test/tiny-html.ts';
import { messages } from '../docs/.vitepress/locales/index.ts';
import { SAMPLE_KEYS, messageKeyFor } from '../docs/.vitepress/src/sample.ts';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../docs/.vitepress/trees');

// `--check` — **쓰지 않고 견준다.** 굳혀 둔 파일이 지금 코드가 내는 것과 같은지만 본다.
//
// 이 그물이 없으면 조용히 퇴행한다(096 §4 ⓓ): 패키지 판을 올려 아이콘이나 단추 목록이 바뀌었는데
// 여기를 다시 안 돌리면, 심어 둔 옛 글자와 새 글자가 달라 브라우저가 **매번 새로 그린다** —
// 화면은 멀쩡하고 미리 그린 값만 사라지므로 아무도 모른다. 굳힌 것은 전부 이 그물이 지킨다:
// 나비트리 · 홈 미리그리기 · 툴바 글자 · wing 칩.
const checking = process.argv.includes('--check');
const stale: string[] = [];

function freeze(name: string, text: string): void {
  const at = resolve(out, name);
  if (!checking) {
    writeFileSync(at, text);
    return;
  }
  let had = '';
  try {
    had = readFileSync(at, 'utf8');
  } catch {
    stale.push(`${name} — 파일이 없다`);
    return;
  }
  if (had !== text) stale.push(`${name} — 굳힌 것이 지금 코드가 내는 것과 다르다`);
}

// 예문에는 `blob:`·상대 주소가 없지만, 데모가 세우는 편집기와 같은 조건으로 읽는다 —
// 들여오기의 답이 옵션 하나로 갈리면 굳힌 트리와 화면이 어긋난다.
const open = { allowLocalUrls: true } as const;

// 미리 그리기가 쓰는 어휘 — 데모가 세우는 것과 같은 목록이라야 브라우저가 이어받는다.
// (데모는 img·upload 를 `allowLocalUrls` 판으로 갈아 끼우는데, 그것은 **들여오기** 쪽 판정이라
//  조립 결과를 안 바꾼다 — 조립의 로컬 주소 허용은 아래 `open` 이 정한다.)
const registry = makeRegistry(defaultWings);

function treeOf(html: string): unknown[] {
  const { nabi } = createNabiWith(defaultWings, { ...open, parseHtml: tinyHtml });
  if (!nabi.setHtml(html)) throw new Error('setHtml 이 거절했다');
  const tree = nabi.getJson();

  // 굳힌 트리가 원고와 같은 문서인가 — 트리로 세운 편집기의 HTML 이 원고를 들여온 편집기의
  // 것과 한 글자도 다르지 않아야 한다. 다르면 그 자리에서 멈춘다.
  const seen = createNabiWith(defaultWings, { ...open, doc: tree });
  if (seen.nabi.getHtml() !== nabi.getHtml()) throw new Error('트리 왕복이 원고와 어긋난다');
  return tree;
}

mkdirSync(out, { recursive: true });

let count = 0;
// wing 칩의 이름 — 언어마다 한 벌. 데모가 **뜨자마자** 칩을 그리려고 여기서 미리 뽑는다.
// 이 이름은 패키지 사전의 것이라 코어가 도착해야 알 수 있었고, 그래서 칩 줄이 늦게 채워지며
// 그 아래 문서가 통째로 밀렸다. 굳혀 두면 서버가 보내는 HTML 에 이미 칩이 서 있다.
const chipRows: string[] = [];

for (const [code, sheet] of Object.entries(messages)) {
  const lines: string[] = [
    '// 만들어진 파일이다 — 손으로 고치지 않는다.',
    '// 원고는 `docs/.vitepress/locales/' + code + '.ts` 의 `demo_html`·`demo_html_*` 이고,',
    '// `npm run build:trees` 가 이것을 낸다.',
    "import type { SampleTrees } from '../src/sample.ts'",
    '',
    'export const trees: SampleTrees = {',
  ];
  let mainTree: unknown[] | null = null;
  for (const key of SAMPLE_KEYS) {
    const html = (sheet as Record<string, string>)[messageKeyFor(key)];
    // 사전에 예문이 빠졌으면 그 자리에서 멈춘다 — 조용히 빈 문서를 굳히면 화면에서야 드러난다.
    if (typeof html !== 'string') throw new Error(`${code} 사전에 ${messageKeyFor(key)} 가 없다`);
    const tree = treeOf(html);
    if (key === 'main') mainTree = tree;
    lines.push(`  ${key}: ${JSON.stringify(tree)},`);
    count += 1;
  }
  lines.push('}', '');
  freeze(`${code}.ts`, lines.join('\n'));

  // --- 홈 예문을 **미리 그려 둔다** (095 ⓐ) ---------------------------------------------------
  // 데모는 브라우저에서만 서므로, 아무것도 안 하면 서버가 보내는 데모 자리는 빈 상자다.
  // 코어가 오고 mount 될 때까지 그 상자가 납작하게 접혀 있다가 갑자기 채워지며 페이지가 밀린다.
  // 그 구간을 없애는 길은 **편집기 HTML 을 미리 그려 페이지에 심어 두는 것**이고,
  // `renderStoredEditorHtml` 이 DOM 없이 도니 여기서 그대로 뽑힌다.
  //
  // `data-key` 가 붙은 편집기 HTML 이라야 한다 — 브라우저가 `mountSurface({ hydrate: true })`
  // 로 그 DOM 을 **다시 그리지 않고 이어받는다**. 같은 저장본은 언제나 같은 키를 얻으므로
  // 서버가 그린 것과 브라우저가 그릴 것이 맞아떨어진다.
  //
  // 홈(`main`)만 뽑는다 — wing 문서의 예문은 한두 문단이라 밀림이 눈에 안 띄고, 그것까지
  // 심으면 페이지마다 제 HTML 을 또 싣게 된다.
  if (mainTree === null) throw new Error(`${code} 에 홈 예문(main)이 없다`);
  const mainHtml = renderStoredEditorHtml(mainTree, registry, open);
  if (mainHtml === null) throw new Error(`${code} 의 홈 예문을 미리 그리지 못했다`);
  freeze(
    `${code}.ssr.ts`,
    [
      '// 만들어진 파일이다 — 손으로 고치지 않는다.',
      '// 홈 예문을 미리 그린 **편집기 HTML** 이다 (data-key 포함). 홈 페이지가 이것을 그대로',
      '// 심어 내보내고, 브라우저는 mountSurface({ hydrate: true }) 로 이어받는다 (095 ⓐ).',
      `export const mainHtml = ${JSON.stringify(mainHtml)}`,
      '',
      '// 홈 데모의 **툴바 글자** (096). 단추 줄은 (registry, 말, 그룹 순서)만 보는 상수라 여기서',
      '// 굳힐 수 있다. 브라우저의 mountToolbar 가 같은 함수로 그리므로, 이미 서 있으면 배선만',
      '// 걸고 넘어간다 — 아이콘 서른셋이 뒤늦게 들어차는 구간이 사라진다.',
      `export const toolbarHtml = ${JSON.stringify(renderToolbarHtml({ registry, locale: code }))}`,
      '',
      '// 미리보기·전체화면 두 단추 (097). 날개가 아니라 덮개의 부품이라 위의 툴바 글자에 안 든다 —',
      '// 096 이 툴바를 미리 그린 뒤에도 이 둘만 늦게 뜨던 자리다.',
      `export const viewToolsHtml = ${JSON.stringify(renderViewToolsHtml({ locale: code }))}`,
      '',
    ].join('\n'),
  );

  // --- wing 칩 한 벌 (칩 줄이 늦게 서는 것을 없앤다) -------------------------------------------
  // 고르는 규칙도 이름을 찾는 길도 데모(`EditorDemo.vue` 의 catalog·labelOf)와 **같아야 한다** —
  // 어긋나면 미리 그린 칩과 코어가 도착해 다시 그리는 칩의 폭이 달라 그 순간 줄이 다시 접힌다.
  const t = makeTranslator(code);
  const chips = defaultWings
    .filter((wing) => wing.button !== undefined || wing.buttons !== undefined)
    .map((wing) => ({ id: wing.w, label: t.pick(wing.button?.label, `wing.${wing.w}`) }));
  chipRows.push(`  ${JSON.stringify(code)}: ${JSON.stringify(chips)},`);

  console.log(`[build-trees] ${code} — 예문 ${SAMPLE_KEYS.length}, 홈 미리그리기 ${mainHtml.length}자, 칩 ${chips.length}`);
}

freeze(
  'chips.ts',
  [
    '// 만들어진 파일이다 — 손으로 고치지 않는다.',
    '// wing 칩의 이름 한 벌이다(언어마다). 데모가 코어를 기다리지 않고 칩 줄을 그리려고',
    '// `npm run build:trees` 가 패키지 사전에서 뽑아 굳힌다.',
    'export interface Chip {',
    '  readonly id: string',
    '  readonly label: string',
    '}',
    '',
    'export const chips: Readonly<Record<string, readonly Chip[]>> = {',
    ...chipRows,
    '}',
    '',
  ].join('\n'),
);

if (checking) {
  if (stale.length > 0) {
    console.error('[build-trees] 굳힌 것이 낡았다 — `npm run build:trees` 를 돌려라:');
    for (const line of stale) console.error(`  - ${line}`);
    process.exit(1);
  }
  console.log('[build-trees] 굳힌 것이 지금 코드와 같다 (트리·홈 미리그리기·툴바·칩).');
} else {
  console.log(`[build-trees] 나비트리 ${count} 벌을 docs/.vitepress/trees 에 굳혔다.`);
}
