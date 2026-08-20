// 표면 그물 (13) — 패키지의 **바깥 면**을 잰다: 엔트리 둘·발행 CSS·데모.
//
// 여기서 지키는 것 넷:
//   1. viewer 엔트리가 코어를 안 문다 — 소스를 정적으로 훑는다(boundaries 와 같은 방식).
//      읽는 페이지가 편집기 무게를 안 지는 값이 여기서만 지켜진다.
//   2. 코어 엔트리에서 호스트가 쓰는 심볼이 실제로 나온다 — 이름 오탈자·빠뜨림을 여기서 잡는다.
//   3. 발행 CSS 의 접기 — `scripts/build-css.mjs` 의 순수부를 그대로 부른다(빌드 없이).
//   4. 데모가 산다 — 파일 셋과 뷰포트 메타. 데모의 **타입 통과**는 `npm run typecheck` 의 몫이다.
//   5. CDN 예문이 부르는 이름이 전부 엔트리에서 나온다 — 그 한 장은 타입 검사를 안 지나서다.
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
  parseNodes,
  renderEditorHtml,
  renderHtml,
  renderStoredEditorHtml,
  renderStoredHtml,
  simpleMark,
  translate,
} from '../src/index.js';
// 이름 하나하나가 아니라 **내보내는 목록 자체**가 필요한 자리가 있다 (CDN 예문 맞춰 보기).
import * as entry from '../src/index.js';
// SSR 엔트리 — 화면을 안 무는 것이 값이라 그 자체를 시험한다 (095).
import * as ssrEntry from '../src/ssr.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (rel: string): string => readFileSync(join(ROOT, rel.split('/').join(sep)), 'utf8');
const has = (rel: string): boolean => existsSync(join(ROOT, rel.split('/').join(sep)));

// --- 1. viewer 는 코어를 안 문다 ---------------------------------------------------------------
// 주석을 지우고(주석 속 경로가 import 로 오인되면 안 된다) 상대 경로를 따라 닫힐 때까지 걷는다.
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
// 딛는 층 셋 — `locale`(말)·`code`(색칠의 지식)·제 층이다. `code` 가 는 자리다(088): 색칠은
// 편집 화면과 발행 페이지가 **같은 토크나이저**로 해야 해서, 그 지식이 둘 모두의 아래층에 산다.
// 여기서 지키는 값은 그대로다 — 이 셋 중 어느 것도 편집기를 안 끌고 온다.
eq('viewer 가 딛는 층은 viewer·locale·code 뿐이다', viewerLayers, ['code', 'locale', 'viewer']);
ok(
  'viewer 가 editor·surface·ui·wing 파일을 하나도 안 문다',
  viewerFiles.every((rel) => !/^src\/(editor|surface|ui|wing|wings|html|doc|caret|schema)\//.test(rel)),
  viewerFiles,
);
ok(
  'viewer 소스에 코어 조립 어휘가 없다',
  !/\b(createNabi|mountSurface|defaultWings|makeRegistry)\b/.test(viewerFiles.map((rel) => strip(read(rel))).join('\n')),
);

// --- 1-b. ssr 엔트리는 화면을 한 파일도 안 문다 (095) ------------------------------------------
// 이 엔트리의 값이 그것 하나다 — 서버가 저장본을 그리는 데 드는 것만 싣는다. 화면 층이 한
// 파일이라도 새어 들면 서버 묶음에 DOM 코드가 실리고, 그러면 이 엔트리를 둘 까닭이 없어진다.
const ssrFiles = closure('src/ssr.ts');

ok('ssr 엔트리가 있다', has('src/ssr.ts'));
ok(
  'ssr 이 surface·ui·viewer 파일을 하나도 안 문다',
  ssrFiles.every((rel) => !/^src\/(surface|ui|viewer)\//.test(rel)),
  ssrFiles.filter((rel) => /^src\/(surface|ui|viewer)\//.test(rel)),
);
// 코어 엔트리보다 정말로 작은가 — 작지 않다면 나눈 뜻이 없다.
const coreFiles = closure('src/index.ts');
ok(
  `ssr 이 코어 엔트리보다 작다 (${ssrFiles.length} < ${coreFiles.length} 파일)`,
  ssrFiles.length < coreFiles.length,
);
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
ok('엔트리: 조립 HTML(SSR)과 들여오기 어댑터', [renderHtml, renderEditorHtml, renderStoredHtml, renderStoredEditorHtml, parseNodes].every(isFn));
ok('엔트리: 팩토리와 말', isFn(simpleMark) && translate('close', 'ko') === '닫기');
ok('엔트리: defaultWings 가 비지 않고 전부 w 를 든다', defaultWings.length > 0 && defaultWings.every((wing) => typeof wing.w === 'string'));

// 엔트리만으로 정말 조립되는가 — 데모가 하는 그 걸음을 DOM 없이 한 번 밟는다.
const { nabi, registry } = createNabiWith(defaultWings, { doc: [{ w: 'p', a: { h: 1 }, ch: ['나비'] }] });
ok('엔트리로 세운 에디터가 문서를 든다', JSON.stringify(nabi.getJson()) === JSON.stringify([{ w: 'p', a: { h: 1 }, ch: ['나비'] }]));
ok('엔트리로 세운 에디터가 보기 HTML 을 낸다', nabi.getHtml().includes('<h1'), nabi.getHtml());
ok('엔트리로 세운 에디터의 커맨드 문이 이름을 가린다', nabi.applyCommand('없는커맨드') === false && nabi.undo() === false);

// 저장본 문 (090) — 에디터가 낼 것과 같은 HTML 을 registry 만으로 낸다. 편집기 HTML 의
// data-key 가 에디터의 것과 같아야 hydrate 가 산다 (cocoon 의 _id 가 결정적이라 같다).
ok('저장본 문이 에디터와 같은 보기 HTML 을 낸다', renderStoredHtml(nabi.getJson(), registry) === nabi.getHtml());
ok('저장본 문이 에디터와 같은 편집기 HTML(data-key 포함)을 낸다', renderStoredEditorHtml(nabi.getJson(), registry) === nabi.getEditorHtml());
ok('저장본 문의 편집기 HTML 이 data-key 를 든다', (renderStoredEditorHtml(nabi.getJson(), registry) ?? '').includes('data-key='));
ok('저장본이 아니면 null 로 거절한다', renderStoredHtml({ not: 'tree' }, registry) === null);
{
  // 조립 중에 던지는 값도 같은 답(null)이다 — 읽기 쪽 문이라 예외가 페이지로 못 번진다.
  const real = console.error;
  let told = 0;
  console.error = () => {
    told += 1;
  };
  try {
    const poison = [
      {
        get w(): string {
          throw new Error('독이 든 getter');
        },
      },
    ];
    ok('던지는 값 — renderStoredHtml 은 null', renderStoredHtml(poison, registry) === null);
    ok('던지는 값 — renderStoredEditorHtml 도 null', renderStoredEditorHtml(poison, registry) === null);
    ok('둘 다 console.error 로 알렸다', told === 2);
  } finally {
    console.error = real;
  }
}

// 안쪽 것은 안 나간다 — 이름이 엔트리 소스에 없으면 나갈 길도 없다.
const entrySource = strip(read('src/index.ts'));
const INTERNAL = ['planRedraw', 'pressedOf', 'fromDomPoint', 'tryInputRule', 'contextGroupsAt', 'bandOf', 'iconButton'];
ok(
  '엔트리가 내부 잡동사니를 안 내보낸다',
  INTERNAL.every((name) => !entrySource.includes(name)),
  INTERNAL.filter((name) => entrySource.includes(name)),
);

// --- 3. 발행 CSS ---------------------------------------------------------------------------------
// 정적 경로로 적으면 타입 검사가.mjs 선언을 찾는다 — URL 로 넘겨 런타임 해석에 맡긴다.
const { nabiCss } = (await import(new URL('../scripts/build-css.mjs', import.meta.url).href)) as {
  nabiCss(sheets: readonly string[]): string;
};

const dedup = nabiCss(['.a { color: red; }', '.b { color: blue; }', '.a { color: red; }']);
ok('CSS: 같은 시트는 한 번만 실린다', dedup.split('.a { color: red; }').length === 2, dedup);
ok(
  'CSS: 빈 시트는 버린다 (머리말 + 시트 하나)',
  nabiCss(['', '   ', '.a{}']).split('\n').filter((line) => line !== '').length === 2,
);

const published = nabiCss(collectSheets(makeRegistry(defaultWings), CORE_CSS));
ok('CSS: 코어 시트가 실린다', published.includes('.nabi-content {') && published.includes('.nabi-btn {'));
ok('CSS: wing 시트가 실린다 (표·목록·코드)', published.includes('.nabi-content table {') && published.includes('.nabi-sort {') && published.includes('.nabi-content li'));
ok(
  'CSS: 한 시트를 나눠 쓰는 가족이 한 번만 실린다 (제목·정렬·드롭캡)',
  published.split('.nabi-content h1 { font-size: 1.9em; }').length === 2,
);
ok('CSS: 머리말 한 줄로 시작한다', published.startsWith('/* nabi-note'));

// --- 4. 데모 -------------------------------------------------------------------------------------
ok('데모: 파일 셋이 있다', ['demo/index.html', 'demo/editor.ts', 'demo/main.ts'].every(has));
const page = read('demo/index.html');
ok('데모: 뷰포트 메타가 있다', /<meta\s+name="viewport"[^>]*width=device-width/.test(page));
ok('데모: 편집기 선언부가 갈려 있다 (main 이 editor.ts 를 부른다)', read('demo/main.ts').includes("from './editor.js'"));
// 무는 것은 **발행되는 엔트리뿐**이다 — `nabi-note` 와 `nabi-note/viewer` 둘. 층 소스를 직접
// 파는 것(`../src/ui/parts/…`)만 막는 규칙이라 엔트리는 둘 다 열려 있다. 보는 쪽 런타임을
// 여기서 무는 까닭: 미리보기의 표 정렬은 **호스트의 일**이다(viewer 는 ui 의 위층이라 코어가
// 대신 걸 수 없다 — 경계 그물이 그것을 막는다).
const DEMO_ENTRIES = ['../src/index.js', '../src/viewer/index.js'];
ok(
  '데모: 선언부가 발행 엔트리만 문다 (층 소스를 직접 안 판다)',
  [...strip(read('demo/editor.ts')).matchAll(/\bfrom\s*['"](\.\.[^'"]+)['"]/g)].every((m) =>
    DEMO_ENTRIES.includes(m[1] as string),
  ),
);

ok('데모: 시작 문서가 제 파일에 산다 (CDN 예문과 나눠 쓴다)', has('demo/sample.ts'));

// --- 4-b. CDN 예문 -------------------------------------------------------------------------------
//
// 이 한 장은 **베껴 쓰라고 있는 글**이라, 여기 적힌 이름이 하나라도 틀리면 그것을 베낀 사람의
// 페이지가 죽는다. 그런데 이 페이지는 타입 검사도 번들도 안 지난다(일부러 그렇다 — 태그 둘이
// 곧 설치라는 것을 보이는 자리다). 그래서 **부르는 이름을 여기서 엔트리와 맞춰 본다.**
ok('CDN: 파일 셋이 있다', ['cdn/index.html', 'cdn/cdn.css'].every(has) && has('scripts/build-cdn.mjs'));
const cdnPage = read('cdn/index.html');
ok('CDN: 뷰포트 메타가 있다', /<meta\s+name="viewport"[^>]*width=device-width/.test(cdnPage));
ok('CDN: 묶음과 시트를 태그로 문다 (모듈이 아니다)', cdnPage.includes('src="./nabi-note.min.js"') && cdnPage.includes('href="./nabi.css"'));
ok('CDN: 시작 문서는 생성물을 쓴다 (예문을 손으로 안 베낀다)', cdnPage.includes('window.NABI_SAMPLE'));
{
  // `N` 은 전역 `NabiNote` 의 별명이다 — 이 페이지가 부르는 이름 전부를 뽑는다.
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
ok('package: exports 가 코어·viewer·시트 셋을 연다', ['.', './viewer', './nabi.css'].every((key) => key in pkg.exports));
ok('package: files 에 dist 가 든다', pkg.files.includes('dist'));
ok('package: unpkg 가 tsup 이 내는 자리를 가리킨다', pkg.unpkg === './dist/browser/nabi-note.min.js' && read('tsup.config.mjs').includes("'nabi-note.min'"));
// 발행 판과 **파일 형식 판**이 같아야 한다 — `NABI_VERSION` 은 저장되는 `.nabi` 파일에 박히는
// 값이고(앞 둘만 쓴다: `1.2.3` → `1.2`), 코어가 package.json 을 안 읽으므로 손으로 맞춘다
// (번들러마다 JSON 을 읽는 법이 다르고 서버에서도 돌아야 한다). 판을 올리면서 이 한 줄을
// 빠뜨리면 **내보낸 파일이 남의 판을 자기 판이라고 적는다** — 나중에 "이 판을 읽을 수 있나" 를
// 물을 때 답할 것이 없어진다. 발행 전에 여기서 걸린다.
eq('package: 발행 판과 NABI_VERSION 이 같다', /NABI_VERSION = '([^']+)'/.exec(read('src/wings/file/file.ts'))?.[1], pkg.version);

ok('package: build 가 tsup·선언·CSS 셋을 잇는다', /tsup/.test(pkg.scripts['build'] ?? '') && /emitDeclarationOnly/.test(pkg.scripts['build'] ?? '') && /build-css/.test(pkg.scripts['build'] ?? ''));

done(`entry(viewer 소스 ${viewerFiles.length}개)`);

// registry 는 조립 스모크의 짝이다 — 안 쓰면 린트가 운다.
void registry;
