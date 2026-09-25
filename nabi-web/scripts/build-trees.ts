// 예문과 미리 그린 화면을 검증하고 굳힌다(npm run build:trees, nabi-web 폴더에서).
// Verifies and freezes the samples and pre-rendered screens (npm run build:trees, from nabi-web).
// ko는 trees/ko.ts를 사람이 직접 고치는 원본이고, 다른 언어는 사전의 demo_html*에서 굳힌다.
// ko's tree is hand-edited directly; other languages are frozen from the dictionary's demo_html*.
// 브라우저의 createNabiWith()는 DOMParser를 쓰지만 이 Node 생성기엔 DOM이 없어 테스트 adapter를 대신 넘긴다.
// The browser's createNabiWith() wires a DOMParser; this Node generator has none, so it passes a test adapter instead.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 굳히기(HTML → 트리)는 편집기를 한 번 세워야 해서 코어 엔트리를 문다 — setHtml이 거기 산다.
// Freezing (HTML to tree) stands up one editor, so this imports the core entry where setHtml lives.
import { defaultWings, makeTranslator } from 'nabi-note';
import { $createNabiWith } from '../../nabi-npm/src/wing/index.ts';
import { defaultWings as sourceWings } from '../../nabi-npm/src/wings/index.ts';
// 그리는 쪽은 서버 진입점이면 충분하다 — 편집 표면·화면 도구를 한 파일도 안 딛는다.
// Rendering needs only the server entry — it touches no edit surface or view tool files.
import { makeRegistry, renderStoredEditorHtml, renderToolbarHtml, renderViewToolsHtml } from 'nabi-note/ssr';
import { tinyHtml } from '../../nabi-npm/test/tiny-html.ts';
import { messages } from '../docs/.vitepress/locales/index.ts';
import { SAMPLE_KEYS, messageKeyFor, type SampleTree, type SampleTrees } from '../docs/.vitepress/src/sample.ts';
import { trees as koTrees } from '../docs/.vitepress/trees/ko.ts';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../docs/.vitepress/trees');

// --check는 쓰지 않고 견준다 — 없으면 패키지를 올려도 여기를 안 돌려 굳힌 값이 조용히 낡는다.
// --check compares without writing; without it, a package bump can leave the frozen output silently stale.
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

// 예문에 blob:·상대 주소는 없지만 데모와 같은 조건으로 읽는다 — 옵션이 갈리면 굳힌 트리와 화면이 어긋난다.
// Samples carry no blob:/relative URLs, but read under the same option as the demo, or the frozen tree drifts.
const open = { allowLocalUrls: true } as const;

// 미리 그리기가 쓰는 어휘는 데모가 세우는 것과 같은 목록이라야 브라우저가 이어받는다.
// The pre-render vocabulary must match what the demo assembles, or the browser can't adopt it.
const registry = makeRegistry(defaultWings);

// 한국어는 이 트리 자체가 원본이다 — 다른 언어도 번역이 확정되면 같은 방식으로 옮긴다.
// ko's tree is itself the source; other languages move to direct trees the same way once translated.
const directTrees: Readonly<Partial<Record<string, SampleTrees>>> = { ko: koTrees };

function treeOf(html: string): unknown[] {
  const { nabi } = $createNabiWith(sourceWings, { ...open, parseHtml: tinyHtml });
  if (!nabi.setHtml(html)) throw new Error('setHtml 이 거절했다');
  const tree = nabi.getJson();

  // 굳힌 트리가 원고와 같은 문서인가 — 트리로 세운 편집기의 HTML이 원고를 들여온 것과 한 글자도 달라선 안 된다.
  // Confirms the frozen tree matches the source: the HTML from the tree must equal the HTML from importing it.
  const seen = $createNabiWith(sourceWings, { ...open, doc: tree });
  if (seen.nabi.getHtml() !== nabi.getHtml()) throw new Error('트리 왕복이 원고와 어긋난다');
  return tree;
}

function checkedTree(tree: SampleTree, code: string, key: string): unknown[] {
  const { nabi } = $createNabiWith(sourceWings, { ...open, doc: tree });
  const normalized = nabi.getJson();
  if (JSON.stringify(normalized) !== JSON.stringify(tree)) {
    throw new Error(`${code} ${key} NABI TREE가 정규형이 아니다`);
  }
  return normalized;
}

mkdirSync(out, { recursive: true });

let count = 0;
// wing 칩의 이름 — 코어가 와야 알 수 있어 칩 줄이 늦게 채워졌다. 여기서 미리 뽑아 서버 HTML에 심는다.
// Chip labels used to wait for the core to arrive; freezing them here lets the server ship them already set.
const chipRows: string[] = [];

for (const [code, sheet] of Object.entries(messages)) {
  const direct = directTrees[code];
  const lines: string[] | null = direct
    ? null
    : [
        '// 만들어진 파일이다 — 손으로 고치지 않는다.',
        '// 원고는 `docs/.vitepress/locales/' + code + '.ts` 의 `demo_html`·`demo_html_*` 이고,',
        '// `npm run build:trees` 가 이것을 낸다.',
        "import type { SampleTrees } from '../src/sample.ts'",
        '',
        'export const trees: SampleTrees = {',
      ];
  let mainTree: unknown[] | null = null;
  for (const key of SAMPLE_KEYS) {
    let tree: unknown[];
    if (direct) {
      tree = checkedTree(direct[key], code, key);
    } else {
      const html = (sheet as Record<string, string>)[messageKeyFor(key)];
      // 사전에 예문이 빠졌으면 그 자리에서 멈춘다 — 조용히 빈 문서를 굳히면 화면에서야 드러난다.
      // Stops here if the dictionary is missing a sample; freezing an empty doc silently would only show up on screen.
      if (typeof html !== 'string') throw new Error(`${code} 사전에 ${messageKeyFor(key)} 가 없다`);
      tree = treeOf(html);
    }
    if (key === 'main') mainTree = tree;
    lines?.push(`  ${key}: ${JSON.stringify(tree)},`);
    count += 1;
  }
  if (lines) {
    lines.push('}', '');
    freeze(`${code}.ts`, lines.join('\n'));
  }

  // 홈 예문을 미리 그려 둔다 — 안 그러면 서버가 보내는 데모 자리가 빈 채로 있다 코어 도착 후 갑자기 채워진다.
  // Pre-renders the home sample; otherwise the server ships an empty box that fills suddenly once the core lands.
  // 홈만 뽑는다 — wing 문서의 예문은 한두 문단이라 밀림이 안 보이고, 다 심으면 페이지마다 HTML을 또 싣는다.
  // Only the home page: wing samples are short enough that the shift is invisible, and pre-rendering all would bloat every page.
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

  // 고르는 규칙과 이름 찾는 길이 데모(EditorDemo.vue의 catalog·labelOf)와 같아야 한다 — 어긋나면 줄이 다시 접힌다.
  // The picking rule and name lookup must match the demo's catalog/labelOf, or the row refolds once the core arrives.
  const t = makeTranslator(code);
  const chips = defaultWings
    .filter((wing) => wing.button !== undefined || wing.buttons !== undefined)
    .map((wing) => ({ id: wing.w, label: t.pick(wing.button?.label, `wing.${wing.w}`) }));
  chipRows.push(`  ${JSON.stringify(code)}: ${JSON.stringify(chips)},`);

  console.log(
    `[build-trees] ${code} — 예문 ${SAMPLE_KEYS.length}${direct ? ' 직접 트리' : ''}, 홈 미리그리기 ${mainHtml.length}자, 칩 ${chips.length}`,
  );
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
  console.log(`[build-trees] 예문 ${count}벌을 검증하고 생성물을 굳혔다.`);
}
