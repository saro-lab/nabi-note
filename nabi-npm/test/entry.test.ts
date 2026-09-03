// 패키지의 바깥 면을 잰다 — 엔트리 둘(코어·viewer)의 경계, 공개 심볼, 발행 CSS 접기, 데모, CDN 예문의 이름 짝.
// Measures the package's outer surface — the core/viewer entry boundary, public symbols, published-CSS folding, the demo, and CDN sample name matching.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { done, eq, ok } from './net.js';

import {
  CORE_CSS,
  collectSheets,
  createNabiWith,
  defaultWings,
  makeRegistry,
  mountContextToolbar,
  mountFile,
  mountHints,
  mountLocalHistory,
  mountSticky,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountViewTools,
  openPreview,
  renderStoredEditorHtml,
  renderStoredHtml,
  simpleMark,
  translate,
} from '../src/index.js';
// 이름 하나하나가 아니라 내보내는 목록 자체가 필요한 자리다 (CDN 예문 이름 맞춰 보기).
// Needs the export list itself, not individual names — used to cross-check the CDN sample.
import * as entry from '../src/index.js';
// SSR 엔트리는 화면을 안 무는 것 자체가 값이라 별도로 시험한다.
// The SSR entry's value is precisely that it pulls in no UI code, so it's tested on its own.
import * as ssrEntry from '../src/ssr.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (rel: string): string => readFileSync(join(ROOT, rel.split('/').join(sep)), 'utf8');
const has = (rel: string): boolean => existsSync(join(ROOT, rel.split('/').join(sep)));

// --- 1. viewer 는 코어를 안 문다 ---------------------------------------------------------------
// 주석을 지우고(주석 속 경로가 import로 오인되면 안 된다) 상대 경로를 따라 닫힐 때까지 걷는다.
// Strips comments first (so a path mentioned in one isn't mistaken for an import) and walks relative paths to closure.
const strip = (source: string): string => source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');

function closure(entry: string): string[] {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const rel = queue.shift() as string;
    if (seen.has(rel) || !has(rel)) continue;
    seen.add(rel);
    const code = strip(read(rel));
    for (const match of code.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g)) {
      const spec = match[1] as string;
      if (!spec.startsWith('.')) continue;
      queue.push(join(dirname(rel), spec.replace(/\.js$/, '.ts')).split(sep).join('/'));
    }
  }
  return [...seen].sort();
}

const viewerFiles = closure('src/viewer/index.ts');
const viewerLayers = [...new Set(viewerFiles.map((rel) => rel.split('/')[1] as string))].sort();

ok('viewer 엔트리가 있다', has('src/viewer/index.ts'));
ok('코어 엔트리가 있다', has('src/index.ts'));
// viewer가 딛는 층은 locale·code·제 층뿐이다 — code가 낀 것은 편집 화면과 발행 페이지가 같은 토크나이저를 써야 해서다.
// The only layers viewer touches are locale, code, and itself — code is included because the editor and the published page must share one tokenizer.
eq('viewer 가 딛는 층은 viewer·locale·code·lifecycle 뿐이다', viewerLayers, [
  'code',
  'lifecycle.ts',
  'locale',
  'viewer',
]);
ok(
  'viewer 가 editor·surface·ui·wing 파일을 하나도 안 문다',
  viewerFiles.every((rel) => !/^src\/(editor|surface|ui|wing|wings|html|doc|caret|schema)\//.test(rel)),
  viewerFiles,
);
ok(
  'viewer 소스에 코어 조립 어휘가 없다',
  !/\b(createNabi|mountSurface|defaultWings|makeRegistry)\b/.test(
    viewerFiles.map((rel) => strip(read(rel))).join('\n'),
  ),
);

// --- 1-b. ssr 엔트리는 화면을 한 파일도 안 문다 ------------------------------------------
// 이 엔트리의 값은 그것 하나다 — 화면 층이 한 파일이라도 새면 서버 묶음에 DOM 코드가 실려 엔트리를 둔 까닭이 없어진다.
// This entry's whole point is that — if even one UI-layer file leaked in, the server bundle would carry DOM code and this entry would lose its reason to exist.
const ssrFiles = closure('src/ssr.ts');

ok('ssr 엔트리가 있다', has('src/ssr.ts'));
ok(
  'ssr 이 surface·ui·viewer 파일을 하나도 안 문다',
  ssrFiles.every((rel) => !/^src\/(surface|ui|viewer)\//.test(rel)),
  ssrFiles.filter((rel) => /^src\/(surface|ui|viewer)\//.test(rel)),
);
// 코어 엔트리보다 정말로 작은가 — 작지 않다면 나눈 뜻이 없다.
// Is it really smaller than the core entry? If not, splitting it out was pointless.
const coreFiles = closure('src/index.ts');
ok(`ssr 이 코어 엔트리보다 작다 (${ssrFiles.length} < ${coreFiles.length} 파일)`, ssrFiles.length < coreFiles.length);
// 그리는 문이 실제로 나간다.
ok(
  'ssr 엔트리: 저장본 문과 어휘',
  [ssrEntry.renderStoredHtml, ssrEntry.renderStoredEditorHtml, ssrEntry.makeRegistry].every(
    (value) => typeof value === 'function',
  ),
);
{
  const registry = ssrEntry.makeRegistry(ssrEntry.defaultWings);
  const doc = [{ w: 'p', a: { h: 1 }, ch: ['나비'] }];
  ok('ssr 엔트리만으로 저장본이 그려진다', ssrEntry.renderStoredHtml(doc, registry) === '<h1>나비</h1>');
  ok('ssr 엔트리도 나비트리가 아니면 null 이다', ssrEntry.renderStoredHtml({ w: 'p' }, registry) === null);
}

// --- 2. 코어 엔트리 스모크 ---------------------------------------------------------------------
const isFn = (value: unknown): boolean => typeof value === 'function';

ok('엔트리: 조립 문(createNabiWith·makeRegistry)', isFn(createNabiWith) && isFn(makeRegistry));
ok(
  '엔트리: mount 5종(툴바·상황 줄·힌트·스티키·보기 도구)과 미리보기',
  [mountToolbar, mountContextToolbar, mountHints, mountSticky, mountViewTools, openPreview].every(isFn),
);
ok('엔트리: 표면과 그 부속 셋', [mountSurface, mountUpload, mountFile, mountLocalHistory].every(isFn));
ok('엔트리: 정규화된 저장본 HTML', [renderStoredHtml, renderStoredEditorHtml].every(isFn));
ok(
  '엔트리: parser와 저수준 renderer 및 옛 extra 묶음은 공개하지 않는다',
  ['parseNodes', 'parseHtml', 'renderHtml', 'renderEditorHtml', 'extraWings'].every((name) => !(name in entry)) &&
    ['renderHtml', 'renderEditorHtml', 'extraWings'].every((name) => !(name in ssrEntry)),
);
ok('엔트리: 팩토리와 말', isFn(simpleMark) && translate('close', 'ko') === '닫기');
ok(
  '엔트리: defaultWings 가 비지 않고 전부 w 를 든다',
  defaultWings.length > 0 && defaultWings.every((wing) => typeof wing.w === 'string'),
);

// 엔트리만으로 정말 조립되는가 — 데모가 하는 그 걸음을 DOM 없이 한 번 밟는다.
// Does the entry alone actually assemble an editor? Retraces the demo's own steps, without a DOM.
const { nabi, registry } = createNabiWith(defaultWings, { doc: [{ w: 'p', a: { h: 1 }, ch: ['나비'] }] });
ok(
  '엔트리로 세운 에디터가 문서를 든다',
  JSON.stringify(nabi.getJson()) === JSON.stringify([{ w: 'p', a: { h: 1 }, ch: ['나비'] }]),
);
ok('엔트리로 세운 에디터가 보기 HTML 을 낸다', nabi.getHtml().includes('<h1'), nabi.getHtml());
ok(
  '엔트리로 세운 에디터의 커맨드 문이 이름을 가린다',
  nabi.applyCommand('없는커맨드') === false && nabi.undo() === false,
);

// 저장본 문은 registry만으로 에디터가 낼 것과 같은 HTML을 낸다 — data-key가 같아야 hydrate가 산다.
// The stored-render gate produces the same HTML as the live editor using only the registry — hydration depends on matching data-key values (cocoon's _id is deterministic, so they match).
ok('저장본 문이 에디터와 같은 보기 HTML 을 낸다', renderStoredHtml(nabi.getJson(), registry) === nabi.getHtml());
ok(
  '저장본 문이 에디터와 같은 편집기 HTML(data-key 포함)을 낸다',
  renderStoredEditorHtml(nabi.getJson(), registry) === nabi.getEditorHtml(),
);
ok(
  '저장본 문의 편집기 HTML 이 data-key 를 든다',
  (renderStoredEditorHtml(nabi.getJson(), registry) ?? '').includes('data-key='),
);
ok('저장본이 아니면 null 로 거절한다', renderStoredHtml({ not: 'tree' }, registry) === null);
{
  // 조립 중에 던지는 값도 같은 답(null)이다 — 읽기 쪽 문이라 예외가 페이지로 못 번진다.
  // A value that throws during assembly gets the same answer (null) — this is a read-side gate, so exceptions can't spread to the page.
  const real = console.error;
  let told = 0;
  let getterCalls = 0;
  console.error = () => {
    told += 1;
  };
  try {
    const poison = [
      {
        get w(): string {
          getterCalls += 1;
          throw new Error('독이 든 getter');
        },
      },
    ];
    ok('던지는 값 — renderStoredHtml 은 null', renderStoredHtml(poison, registry) === null);
    ok('던지는 값 — renderStoredEditorHtml 도 null', renderStoredEditorHtml(poison, registry) === null);
    ok('저장본 renderer도 getter를 실행하지 않는다', getterCalls === 0);
    ok('모양 거절은 예외 보고를 만들지 않는다', told === 0);
  } finally {
    console.error = real;
  }
}

// 안쪽 것은 안 나간다 — 이름이 엔트리 소스에 없으면 나갈 길도 없다.
// Internal names stay internal — if a name isn't in the entry source, it has no way out.
const entrySource = strip(read('src/index.ts'));
const INTERNAL = [
  'planRedraw',
  'pressedOf',
  'fromDomPoint',
  'tryInputRule',
  'contextGroupsAt',
  'bandOf',
  'revealFix',
  'revealWalk',
  'underWalk',
  'placeWalk',
  'iconButton',
];
ok(
  '엔트리가 내부 잡동사니를 안 내보낸다',
  INTERNAL.every((name) => !entrySource.includes(name)),
  INTERNAL.filter((name) => entrySource.includes(name)),
);

// --- 3. 발행 CSS ---------------------------------------------------------------------------------
// 정적 경로로 적으면 타입 검사가 .mjs 선언을 찾는다 — URL 로 넘겨 런타임 해석에 맡긴다.
// A static path would make typechecking look for a .mjs declaration — passed as a URL instead, resolved at runtime.
const { nabiCss } = (await import(new URL('../scripts/build-css.mjs', import.meta.url).href)) as {
  nabiCss(sheets: readonly string[]): string;
};

const dedup = nabiCss(['.a { color: red; }', '.b { color: blue; }', '.a { color: red; }']);
ok('CSS: 같은 시트는 한 번만 실린다', dedup.split('.a { color: red; }').length === 2, dedup);
ok(
  'CSS: 빈 시트는 버린다 (머리말 + 시트 하나)',
  nabiCss(['', '   ', '.a{}'])
    .split('\n')
    .filter((line) => line !== '').length === 2,
);

const published = nabiCss(collectSheets(makeRegistry(defaultWings), CORE_CSS));
ok('CSS: 코어 시트가 실린다', published.includes('.nabi-content {') && published.includes('.nabi-btn {'));
ok(
  'CSS: wing 시트가 실린다 (표·목록·코드)',
  published.includes('.nabi-content table {') &&
    published.includes('.nabi-sort {') &&
    published.includes('.nabi-content li'),
);
ok(
  'CSS: 한 시트를 나눠 쓰는 가족이 한 번만 실린다 (제목·정렬·드롭캡)',
  published.split('.nabi-content h1 { font-size: 1.9em; }').length === 2,
);
ok('CSS: 머리말 한 줄로 시작한다', published.startsWith('/* nabi-note'));

// --- 4. 데모 -------------------------------------------------------------------------------------
ok('데모: 파일 셋이 있다', ['demo/index.html', 'demo/editor.ts', 'demo/main.ts'].every(has));
const page = read('demo/index.html');
ok('데모: 뷰포트 메타가 있다', /<meta\s+name="viewport"[^>]*width=device-width/.test(page));
ok(
  '데모: 편집기 선언부가 갈려 있다 (main 이 editor.ts 를 부른다)',
  read('demo/main.ts').includes("from './editor.js'"),
);
// 발행되는 엔트리(코어·viewer·diff)만 허용한다 — 층 소스를 직접 파는 것만 막는 규칙이라 이 셋은 열려 있다.
// Only the published entries (core, viewer, diff) are allowed — the rule blocks reaching into layer source directly, so these three stay open.
const DEMO_ENTRIES = ['../src/index.js', '../src/viewer/index.js', '../src/diff/index.js'];
ok(
  '데모: 선언부가 발행 엔트리만 문다 (층 소스를 직접 안 판다)',
  [...strip(read('demo/editor.ts')).matchAll(/\bfrom\s*['"](\.\.[^'"]+)['"]/g)].every((m) =>
    DEMO_ENTRIES.includes(m[1] as string),
  ),
);

ok('데모: 시작 문서가 제 파일에 산다 (CDN 예문과 나눠 쓴다)', has('demo/sample.ts'));

// --- 4-b. CDN 예문 -------------------------------------------------------------------------------
// 이 한 장은 베껴 쓰라고 있는 글이라 이름이 하나라도 틀리면 베낀 사람의 페이지가 죽는다 — 타입 검사도 번들도 안 거치므로 여기서 엔트리와 이름을 맞춰 본다.
// This page exists to be copy-pasted, so one wrong name breaks whoever copies it — it skips typechecking and bundling by design, so names are cross-checked against the entry here instead.
ok('CDN: 파일 셋이 있다', ['cdn/index.html', 'cdn/cdn.css'].every(has) && has('scripts/build-cdn.mjs'));
const cdnPage = read('cdn/index.html');
ok('CDN: 뷰포트 메타가 있다', /<meta\s+name="viewport"[^>]*width=device-width/.test(cdnPage));
ok(
  'CDN: 묶음과 시트를 태그로 문다 (모듈이 아니다)',
  cdnPage.includes('src="./nabi-note.min.js"') && cdnPage.includes('href="./nabi.css"'),
);
ok('CDN: 시작 문서는 생성물을 쓴다 (예문을 손으로 안 베낀다)', cdnPage.includes('window.NABI_SAMPLE'));
ok(
  'CDN: 실제 build 명령과 localStorage 기록 저장소를 설명한다',
  cdnPage.includes('npm run build:cdn') &&
    cdnPage.includes('localStorage') &&
    !cdnPage.includes('IndexedDB') &&
    cdnPage.includes('browserHistoryStorage(window)'),
);
{
  // `N` 은 전역 `NabiNote` 의 별명이다 — 이 페이지가 부르는 이름 전부를 뽑는다.
  // `N` is a shorthand for the global `NabiNote` — extracts every name this page calls.
  const called = new Set([...cdnPage.matchAll(/\bN\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1] as string));
  const exported = new Set(Object.keys(entry));
  const missing = [...called].filter((name) => !exported.has(name)).sort();
  ok('CDN: 예문이 부르는 이름이 전부 엔트리에서 나온다', missing.length === 0, [missing.join(', ')]);
  ok('CDN: 부르는 이름이 실제로 여럿이다 (정규식이 헛돌지 않았다)', called.size >= 8, [String(called.size)]);
}

// --- 5. 발행 자리 --------------------------------------------------------------------------------
const pkg = JSON.parse(read('package.json')) as {
  version: string;
  exports: Record<string, unknown>;
  files: string[];
  unpkg: string;
  scripts: Record<string, string>;
};
ok(
  'package: exports 가 코어·viewer·시트 셋을 연다',
  ['.', './viewer', './nabi.css'].every((key) => key in pkg.exports),
);
ok('package: files 에 dist 가 든다', pkg.files.includes('dist'));
ok(
  'package: unpkg 가 tsup 이 내는 자리를 가리킨다',
  pkg.unpkg === './dist/browser/nabi-note.min.js' && read('tsup.config.mjs').includes("'nabi-note.min'"),
);
// 발행 판과 파일 형식 판(NABI_VERSION, 손으로 맞춘 값)이 같아야 한다 — 안 맞으면 내보낸 파일이 엉뚱한 판을 자기 판이라 적는다.
// The published version and the file-format version (NABI_VERSION, kept in sync by hand since the core doesn't read package.json) must match — otherwise saved files would carry the wrong version stamp.
eq(
  'package: 발행 판과 NABI_VERSION 이 같다',
  /NABI_VERSION = '([^']+)'/.exec(read('src/io/file.ts'))?.[1],
  pkg.version,
);

ok(
  'package: build 가 tsup·선언·CSS 셋을 잇는다',
  /tsup/.test(pkg.scripts['build'] ?? '') &&
    /emitDeclarationOnly/.test(pkg.scripts['build'] ?? '') &&
    /build-css/.test(pkg.scripts['build'] ?? ''),
);

done(`entry(viewer 소스 ${viewerFiles.length}개)`);

// registry 는 조립 스모크의 짝이다 — 안 쓰면 린트가 운다.
// registry is the pair from the assembly smoke test above — kept referenced so lint doesn't complain.
void registry;
