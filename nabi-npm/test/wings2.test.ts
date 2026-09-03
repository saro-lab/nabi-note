// wings 2차 그물 — 물건 계열(img·youtube)과 도구 계열(upload·file·localHistory·clearFormat), mount 부속의 순수부(토크나이저·체크 토글)를 검사한다. 옛 확실 버그 넷 회귀 포함.
// Second-round wings test net for the object-family wings (img, youtube), tool-family wings (upload, file, localHistory, clearFormat), and the pure parts of mount helpers (tokenizer, checkbox toggling) — including regressions for four historical confirmed bugs.
import type { ElementNode, NabiNode } from '../src/schema/index.js';
import { positionExists, type Position } from '../src/doc/index.js';
import type { Selection } from '../src/caret/index.js';
import { createNabiWith, makeRegistry, nabiOptionsOf, simpleMark, type Wing } from '../src/wing/index.js';
import { createNabi, hostOf } from '../src/editor/index.js';
import { defaultWings, makeTypefaceWing, wingNames, wings } from '../src/wings/index.js';
import { $isBasic } from '../src/wings/builder.js';
import {
  CLEARED_MARKS,
  IMAGE_WIDTHS,
  NABI_FILE_VERSION,
  NABI_VERSION,
  saveFileWing,
  today,
  YOUTUBE_WIDTHS,
  acceptFiles,
  clearFormatWing,
  exactTime,
  extensionOf,
  historyStorageAlive,
  historyView,
  imageWing,
  isImageFile,
  makeImageWing,
  makeUploadWing,
  readNabiFile,
  showsCreated,
  summarize,
  tokenize,
  tokensFor,
  uploadWing,
  usableTokens,
  writeNabiFile,
  youtubeWing,
  type HistoryStorage,
  type UploadFile,
} from '../src/wings/extra.js';
import { ioFiltersOf, mountFile, mountLocalHistory, mountUpload, readExtensions } from '../src/surface/index.js';
import { LOCALES, translate } from '../src/locale/index.js';
import type { IoFilter } from '../src/io/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

// media와 integration wing까지 포함한 공식 기본 목록을 그대로 쓴다.
// Uses the official default list as-is, including media and integration wings.
const allWings = [...defaultWings];
const registry = makeRegistry(allWings);
const env = registry.env;

const el = (w: string, ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode =>
  a ? { w, a, ch } : { w, ch };
const p = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode => el('p', ch, a);
const at = (path: readonly number[], offset: number): Position => ({ path, offset });
const range = (a: Position, b: Position): Selection => ({ anchor: a, focus: b });

const make = (doc: readonly unknown[]) => createNabiWith(allWings, { doc }).nabi;

// --- registry — 2차 묶음이 계약을 지난다 --------------------------------------------------------

ok('defaultWings 전체가 makeRegistry 를 지난다', registry.wings.length === allWings.length);
eq(
  '물건 둘이 조립을 갖는다',
  ['img', 'youtube'].every((w) => registry.builders[w] !== undefined),
  true,
);
eq(
  '도구 wing 은 노드를 안 세운다(조립 없음)',
  [uploadWing, clearFormatWing].every((w) => w.toHtml === undefined),
  true,
);
eq(
  'lumps 에 img·youtube 가 들었다',
  ['img', 'youtube'].every((w) => env.lumps.has(w)),
  true,
);
eq(
  'voids 에 img·youtube 가 들었다',
  ['img', 'youtube'].every((w) => env.voids.has(w)),
  true,
);
eq(
  '가속키 — 저장은 mod+s, 열기는 mod+o',
  [registry.wingOf('save')?.button?.accelerator, registry.wingOf('open')?.button?.accelerator],
  ['mod+s', 'mod+o'],
);
eq(
  '2차 커맨드가 전부 등록됐다',
  [
    'insertImage',
    'setImageWidth',
    'insertYoutube',
    'commitUpload',
    'saveFile',
    'openFile',
    'restoreHistory',
    'clearFormat',
    'toggleCheck',
  ].every((name) => registry.commands[name] !== undefined),
  true,
);
// 표면 부속은 선언이다 — DOM 에 손을 대는 셋이 리스너를 직접 안 달고 mount 에 맡긴다.
// Surface parts are declarative — the three that touch the DOM don't attach listeners themselves, they leave it to mount.
for (const w of ['img', 'code', 'tl']) {
  const wing = registry.wingOf(w);
  ok(`${w} 의 표면 부속이 선언형으로 실린다`, wing?.attach !== undefined && registry.attaches.includes(wing.attach));
}
try {
  makeRegistry([uploadWing]);
  ok('upload 은 img·a 없이 등록되면 죽는다', false, '안 죽었다');
} catch (error) {
  ok('upload 은 img·a 없이 등록되면 죽는다', (error as Error).message.includes('upload'));
}

// --- img — 값 거절이 스냅이 아니다 (옛 확실 버그 4 회귀) ---------------------------------------

function imgOf(doc: readonly unknown[]): Record<string, unknown> | undefined {
  const json = make(doc).getJson() as { ch?: { w?: string; a?: Record<string, unknown> }[] }[];
  const wrapper = json[0];
  const lump = wrapper?.ch?.[0];
  return lump?.w === 'img' ? (lump.a ?? {}) : undefined;
}

eq('img — 목록 안의 폭은 그대로 산다', imgOf([p([el('img', [], { src: '/a.png', w: '40' })])]), {
  src: '/a.png',
  w: '40',
});
eq(
  'img — 목록 밖 폭(55)은 **거절**된다(가까운 단계로 스냅하지 않는다)',
  imgOf([p([el('img', [], { src: '/a.png', w: '55' })])]),
  { src: '/a.png' },
);
eq('img — 폭 999 도 100 으로 깎이지 않고 거절된다', imgOf([p([el('img', [], { src: '/a.png', w: '999' })])]), {
  src: '/a.png',
});
eq('img — 숫자 40 은 문자열 표기로 맞춰진다(값은 같다)', imgOf([p([el('img', [], { src: '/a.png', w: 40 })])]), {
  src: '/a.png',
  w: '40',
});
eq(
  'img — 정렬 attr 은 계약 밖이라 떨어진다 (정렬은 래퍼문단의 것)',
  imgOf([p([el('img', [], { src: '/a.png', a: 'center' })])]),
  { src: '/a.png' },
);
// 주소를 잃은 그림은 노드째 사라진다 — 빈 껍데기를 남기면 HTML 입구만 막고 JSON 입구는 유령으로 남긴다.
// An image that loses its src disappears node and all — leaving an empty shell would block only the HTML entry point while leaving a ghost via the JSON entry point.
ok(
  'img — javascript: 주소를 문 그림은 안 선다',
  imgOf([p([el('img', [], { src: 'javascript:alert(1)' })])]) === undefined,
);
ok(
  'img — data:text/html 을 문 그림은 안 선다',
  imgOf([p([el('img', [], { src: 'data:text/html,<b>x' })])]) === undefined,
);
ok('img — 기본 wing 은 blob: 을 안 받는다', imgOf([p([el('img', [], { src: 'blob:https://x/1' })])]) === undefined);
eq('img — 낯선 attr(srcset)은 떨어진다', imgOf([p([el('img', [], { src: '/a.png', srcset: '/a2.png' })])]), {
  src: '/a.png',
});
// 대체 글은 갈래에서 걷혔다 — 들어와도 안 실린다(깨진 그림 자리에 우리 그림이 선다).
// Alt text was dropped from the schema — even on import it's discarded (our broken-image graphic stands in its place).
eq('img — 대체 글은 안 실린다', imgOf([p([el('img', [], { src: '/a.png', alt: '설명' })])]), { src: '/a.png' });
eq(
  'img — 폭 단계 목록은 30~100',
  [IMAGE_WIDTHS[0], IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1], IMAGE_WIDTHS.length],
  ['30', '100', 8],
);

{
  // 로컬 주소는 옵션으로만 열린다 — 업로드 미리보기의 길이다.
  // Local URLs open only via an option — the path used for upload previews.
  const local = createNabiWith(
    [...defaultWings.filter((w) => w.w !== 'img'), makeImageWing({ allowLocalUrls: true })],
    {
      doc: [p([el('img', [], { src: 'blob:https://x/1' })])],
    },
  ).nabi;
  const json = local.getJson() as { ch?: { a?: Record<string, unknown> }[] }[];
  eq('img — allowLocalUrls 를 켜면 blob: 이 산다', json[0]?.ch?.[0]?.a, { src: 'blob:https://x/1' });
}

{
  const n = make([p(['글'])]);
  ok('insertImage — 화이트리스트 밖 주소는 안 돈다', !n.applyCommand('insertImage', { src: 'javascript:x' }));
  ok('insertImage — 목록 밖 폭을 든 삽입도 안 돈다', !n.applyCommand('insertImage', { src: '/a.png', w: '55' }));
  ok('insertImage — 주소가 맞으면 선다', n.applyCommand('insertImage', { src: '/a.png', w: '40' }));
  eq('insertImage — 래퍼문단을 입고 캐럿 뒤에 선다 (문단은 가운데)', n.getJson(), [
    { w: 'p', ch: ['글'] },
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/a.png', w: '40' }, ch: [] }] },
  ]);
  ok('insertImage — 폭을 안 주면 기본 60 이 붙는다', make([p(['글'])]).applyCommand('insertImage', { src: '/a.png' }));
  ok('insertImage — 반환 자리는 반환 트리에 실재한다', positionExists(hostOf(n).doc(), n.getSelection().focus, env));
  ok('setImageWidth — 목록 밖 값은 안 돈다', !n.applyCommand('setImageWidth', { w: '55' }));
  ok('setImageWidth — 목록 안 값은 돈다', n.applyCommand('setImageWidth', { w: '70' }));
  eq('setImageWidth — 폭만 갈린다', (n.getJson() as { ch?: { a?: Record<string, unknown> }[] }[])[1]?.ch?.[0]?.a, {
    src: '/a.png',
    w: '70',
  });
  ok('setImageWidth — 같은 값이면 침묵한다 (무변화면 침묵)', !n.applyCommand('setImageWidth', { w: '70' }));
}

// --- youtube — 영상 id 패턴 ---------------------------------------------------------------------

function youtubeOf(doc: readonly unknown[]): Record<string, unknown> | undefined {
  const json = make(doc).getJson() as { ch?: { w?: string; a?: Record<string, unknown> }[] }[];
  const lump = json[0]?.ch?.[0];
  return lump?.w === 'youtube' ? (lump.a ?? {}) : undefined;
}

eq('youtube — 11 글자 id 는 산다', youtubeOf([p([el('youtube', [], { v: '6j-gQmaZ9Zk' })])]), { v: '6j-gQmaZ9Zk' });
// 영상 id 를 잃은 영상도 노드째 사라진다 — 그림의 `src` 와 같은 규칙이다.
// A video that loses its id also disappears node and all — the same rule as an image's src.
ok('youtube — 짧은 id 를 문 영상은 안 선다', youtubeOf([p([el('youtube', [], { v: 'abc' })])]) === undefined);
ok(
  'youtube — 주소를 그대로 담은 v 는 거절된다(값은 id 다)',
  youtubeOf([p([el('youtube', [], { v: 'https://youtu.be/6j-gQmaZ9Zk' })])]) === undefined,
);
eq('youtube — 목록 밖 폭(30)은 거절된다', youtubeOf([p([el('youtube', [], { v: '6j-gQmaZ9Zk', w: '30' })])]), {
  v: '6j-gQmaZ9Zk',
});
eq('youtube — 폭 50 은 산다', youtubeOf([p([el('youtube', [], { v: '6j-gQmaZ9Zk', w: '50' })])]), {
  v: '6j-gQmaZ9Zk',
  w: '50',
});
eq('youtube — 폭 단계는 50 부터다', [YOUTUBE_WIDTHS[0], YOUTUBE_WIDTHS.length], ['50', 6]);

// 상황 줄에 주소 고치기가 없다 — 그림이 이미 그렇게 서 있었고 영상만 혼자 갖고 있었다. 물건의 주소는 고치는 게 아니라 지우고 다시 놓는 것이다.
// The context bar has no address-edit field — images already worked this way and video was the odd one out. An object's address isn't edited, it's removed and re-placed.
eq(
  '유튜브·그림 상황 줄 — 주소를 고치는 칸이 없다',
  [youtubeWing, imageWing].map((wing) => (wing.context?.controls ?? []).some((c) => c.kind === 'prompt')),
  [false, false],
);

{
  const n = make([p([])]);
  ok('insertYoutube — 아무 글자나 안 받는다', !n.applyCommand('insertYoutube', { v: '영상이아님' }));
  ok(
    'insertYoutube — watch 주소에서 id 를 되읽는다',
    n.applyCommand('insertYoutube', { v: 'https://www.youtube.com/watch?v=6j-gQmaZ9Zk' }),
  );
  // 넣는 순간 기본값이 트리에 적힌다 — 폭 70(영상은 제 크롬으로 한 겹 더 줄어든다)에 래퍼문단은 가운데.
  // Defaults get written into the tree the moment it's inserted — width 70 (video shrinks by one more layer for its own chrome), wrapper paragraph centered.
  eq('insertYoutube — 빈 문단 자리를 쓴다(빈 줄이 안 남는다)', n.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'youtube', a: { v: '6j-gQmaZ9Zk', w: '70' }, ch: [] }] },
  ]);
  const n2 = make([p([])]);
  ok(
    'insertYoutube — youtu.be 짧은 주소도 읽는다',
    n2.applyCommand('insertYoutube', { v: 'https://youtu.be/6j-gQmaZ9Zk' }),
  );
  ok('insertYoutube — id 를 그대로 줘도 받는다', make([p([])]).applyCommand('insertYoutube', { v: '6j-gQmaZ9Zk' }));
}

// --- 왕복 — 트리 → HTML → 트리 -----------------------------------------------------------------

function roundTrip(name: string, doc: readonly unknown[]): void {
  const source = make(doc);
  const back = createNabi({ ...nabiOptionsOf(registry), doc: [], parseHtml: tinyHtml });
  back.setHtml(source.getHtml());
  eq(`왕복 — ${name}`, back.getJson(), source.getJson());
}

roundTrip('이미지', [p([el('img', [], { src: '/logo/x.svg', alt: '설명', w: '40' })], { a: 'c' })]);
roundTrip('유튜브', [p([el('youtube', [], { v: '6j-gQmaZ9Zk', w: '60' })])]);
roundTrip('첨부 링크', [p([el('a', ['첨부.png'], { href: '/f/x.png', file: 'png' })])]);
roundTrip('정렬된 제목', [p(['제목'], { h: 2, a: 'c' })]);

// --- clearFormat — 마크 표 + 문단 속성 ----------------------------------------------------------

// 마크 하나만 걸린 문단을 짓고, 범위 전체에 서식 지우기를 돌린다.
// Builds a paragraph with a single mark applied, then runs clear-format over the whole range.
function clearedMark(w: string, a?: Record<string, string>): unknown[] {
  const n = make([p([el(w, ['글자'], a)])]);
  n.select(range(at([0], 0), at([0], 2)));
  n.applyCommand('clearFormat');
  return n.getJson() as unknown[];
}

for (const w of ['b', 'i', 'u', 's', 'sub', 'sup']) {
  eq(`clearFormat — 마크 ${w} 를 벗긴다`, clearedMark(w), [{ w: 'p', ch: ['글자'] }]);
}
eq('clearFormat — 형광펜(hl)을 벗긴다', clearedMark('hl', { c: 'yellow' }), [{ w: 'p', ch: ['글자'] }]);
eq('clearFormat — 글자색(tc)을 벗긴다', clearedMark('tc', { c: 'coral' }), [{ w: 'p', ch: ['글자'] }]);
eq('clearFormat — 글자 크기(fs)를 벗긴다', clearedMark('fs', { v: 'lg' }), [{ w: 'p', ch: ['글자'] }]);
eq('clearFormat — 서체(tf)를 벗긴다', clearedMark('tf', { v: 'serif' }), [{ w: 'p', ch: ['글자'] }]);
eq('clearFormat — 링크(a)를 벗긴다', clearedMark('a', { href: 'https://example.com/' }), [{ w: 'p', ch: ['글자'] }]);
eq('clearFormat — 지우는 마크는 열하나다', CLEARED_MARKS.length, 11);

{
  const removable = simpleMark({ w: 'exClear', clearable: true });
  const preserved = simpleMark({ w: 'exKeep' });
  const n = createNabiWith([...allWings, removable, preserved], {
    doc: [p([el('exClear', ['A']), el('exKeep', ['B'])])],
  }).nabi;
  n.select(range(at([0], 0), at([0], 2)));
  ok('clearFormat — custom mark는 clearable capability를 명시하면 벗긴다', n.applyCommand('clearFormat'));
  eq('clearFormat — capability가 없는 custom mark는 보존한다', n.getJson(), [
    { w: 'p', ch: ['A', { w: 'exKeep', ch: ['B'] }] },
  ]);
}

{
  // 첨부 링크는 불가침이다 — 껍데기를 벗기면 되살릴 수 없는 죽은 평문이 된다.
  // Attachment links are untouchable — stripping the wrapper turns it into dead plain text with no way back.
  const n = make([p([el('a', ['첨부.png'], { href: '/f/x.png', file: 'png' })])]);
  n.select(range(at([0], 0), at([0], 5)));
  n.applyCommand('clearFormat');
  eq('clearFormat — 첨부 링크(file)는 안 벗긴다', n.getJson(), [
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/x.png', file: 'png' }, ch: ['첨부.png'] }] },
  ]);
}

{
  // 옛 확실 버그 3 — 정렬된 제목을 못 지웠다. 제목이 문단 속성이 된 새 판에서는 한 켜로 진다.
  // Historical confirmed bug 3 — clearing format couldn't strip an aligned heading. Now that heading is a paragraph attribute, it clears as one layer.
  const n = make([p(['제목'], { h: 1, a: 'c', dc: 1 })]);
  n.select(range(at([0], 0), at([0], 2)));
  ok('clearFormat — 정렬된 제목에서도 돈다', n.applyCommand('clearFormat'));
  eq('clearFormat — 제목·정렬·드롭캡이 한 번에 진다 (옛 버그 3 회귀)', n.getJson(), [{ w: 'p', ch: ['제목'] }]);
}

{
  const n = make([p([el('b', ['굵은 제목'])], { h: 3, a: 'r' })]);
  n.select(range(at([0], 0), at([0], 5)));
  n.applyCommand('clearFormat');
  eq('clearFormat — 마크와 문단 속성이 한 번에 간다', n.getJson(), [{ w: 'p', ch: ['굵은 제목'] }]);
}

{
  const n = make([p(['앞'], { h: 2 }), p([el('i', ['뒤'])], { a: 'c' })]);
  ok('clearFormat — 두 문단에 걸친 선택이 선다', n.select(range(at([0], 0), at([1], 1))));
  n.applyCommand('clearFormat');
  eq('clearFormat — 걸친 문단 전부가 대상이다', n.getJson(), [
    { w: 'p', ch: ['앞'] },
    { w: 'p', ch: ['뒤'] },
  ]);
}

{
  // 래퍼문단의 정렬은 그 물건이 어디 서 있는가다 — 글 서식을 지웠다고 그림이 옮겨 다니면 안 된다.
  // A wrapper paragraph's alignment is where the object sits — clearing text formatting shouldn't make an image move.
  const n = make([p([el('img', [], { src: '/a.png' })], { a: 'c' }), p(['글'])]);
  n.select(range(at([0], 0), at([1], 1)));
  n.applyCommand('clearFormat');
  eq('clearFormat — 래퍼문단의 정렬은 남는다', n.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/a.png' }, ch: [] }] },
    { w: 'p', ch: ['글'] },
  ]);
}

{
  const n = make([p(['앞', el('b', ['굵게']), '뒤'], { h: 1 })]);
  n.select(range(at([0], 3), at([0], 3)));
  ok('clearFormat — 접힌 캐럿도 돈다', n.applyCommand('clearFormat'));
  eq('clearFormat — 접힌 캐럿은 가장 안쪽 마크를 그 구간 전체로 벗긴다', n.getJson(), [
    { w: 'p', a: { h: 1 }, ch: ['앞굵게뒤'] },
  ]);
  ok('clearFormat — 마크가 없어진 뒤 한 번 더 누르면 문단 속성이 진다', n.applyCommand('clearFormat'));
  eq('clearFormat — 접힌 캐럿의 두 번째 누름', n.getJson(), [{ w: 'p', ch: ['앞굵게뒤'] }]);
  ok('clearFormat — 지울 것이 없으면 침묵한다 (무변화면 침묵)', !n.applyCommand('clearFormat'));
}

// --- upload — 잠금·배치·갈래 ------------------------------------------------------------

{
  const n = make([p(['글'])]);
  const release = hostOf(n).lock('upload');
  eq('잠금 — 누가 잠갔는지 이름으로 답한다', hostOf(n).lockedBy(), 'upload');
  ok('잠금 중 — 커맨드가 안 돈다', !n.applyCommand('insertText', { text: 'x' }));
  ok('잠금 중 — 되돌리기도 안 돈다', !n.undo());
  ok('잠금 중 — 문서 교체도 안 된다', !n.setJson([{ w: 'p', ch: ['다른 글'] }]));
  eq('잠금 중 — 문서는 한 글자도 안 변했다', n.getJson(), [{ w: 'p', ch: ['글'] }]);
  release();
  eq('잠금 풀림 — 이름이 사라진다', hostOf(n).lockedBy(), null);
  ok('잠금 풀림 — 커맨드가 다시 돈다', n.applyCommand('insertText', { text: 'x' }));
  release();
  eq('잠금 — 두 번 풀어도 탈이 없다', hostOf(n).lockedBy(), null);
}

{
  const n = make([p([])]);
  ok('commitUpload — 항목이 없으면 안 돈다', !n.applyCommand('commitUpload', { items: [] }));
  ok(
    'commitUpload — 배치 하나가 커맨드 한 번이다',
    n.applyCommand('commitUpload', {
      items: [
        { kind: 'image', uri: '/f/a.png', name: 'a.png' },
        { kind: 'file', uri: '/f/b.pdf', name: 'b.pdf' },
      ],
    }),
  );
  // 첨부의 글자는 파일 이름이 아니다 — 부르는 쪽이 준 말이고, 안 주면 주소가 글자다(커맨드는 말을 모른다).
  // An attachment's display text isn't the file name — it's whatever the caller passed, falling back to the address if nothing was given (the command doesn't know the label).
  eq('commitUpload — 이미지는 img(폭 60·가운데), 그 밖은 첨부 링크가 된다', n.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/f/a.png', w: '60' }, ch: [] }] },
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/b.pdf', file: 'pdf' }, ch: ['/f/b.pdf'] }] },
  ]);
  {
    const named = make([{ w: 'p', ch: [] }]);
    named.applyCommand('commitUpload', {
      items: [{ kind: 'file', uri: '/f/b.pdf', name: 'b.pdf' }],
      label: '첨부파일',
    });
    eq('commitUpload — 넘겨받은 글자가 첨부의 글자다', named.getJson(), [
      { w: 'p', ch: [{ w: 'a', a: { href: '/f/b.pdf', file: 'pdf' }, ch: ['첨부파일'] }] },
    ]);
  }
  ok('commitUpload — 반환 자리는 반환 트리에 실재한다', positionExists(hostOf(n).doc(), n.getSelection().focus, env));
  ok('commitUpload — 되돌리기 한 번에 배치가 통째로 걷힌다', n.undo());
  eq('commitUpload — 배치 = undo 한 점', n.getJson(), [{ w: 'p', ch: [] }]);
}

{
  const n = make([p([])]);
  n.applyCommand('commitUpload', { items: [{ kind: 'file', uri: 'javascript:alert(1)', name: '나쁜.pdf' }] });
  eq('commitUpload — 못 믿을 주소는 이름만 남는 평문이 된다', n.getJson(), [{ w: 'p', ch: ['나쁜.pdf'] }]);
}

eq(
  'acceptFiles — 큰 파일은 그 파일만 빠진다',
  acceptFiles(
    [
      { name: 'a.png', size: 10, type: 'image/png' },
      { name: 'b.png', size: 999, type: 'image/png' },
    ],
    { maxFileSize: 100, maxTotalSize: 0 },
  ).map((f) => f.name),
  ['a.png'],
);
eq(
  'acceptFiles — 총합 초과는 묶음 전체를 거절한다',
  acceptFiles(
    [
      { name: 'a.png', size: 80, type: 'image/png' },
      { name: 'b.png', size: 80, type: 'image/png' },
    ],
    { maxFileSize: 0, maxTotalSize: 100 },
  ).length,
  0,
);
eq(
  'acceptFiles — 확장자 목록 밖은 빠진다',
  acceptFiles(
    [
      { name: 'a.exe', size: 1, type: '' },
      { name: 'b.png', size: 1, type: '' },
    ],
    { extensions: ['png'] },
  ).map((f) => f.name),
  ['b.png'],
);
eq('acceptFiles — 빈 파일은 빠진다', acceptFiles([{ name: 'a.png', size: 0, type: '' }], {}).length, 0);
eq(
  'extensionOf — 맨 앞의 점은 확장자가 아니다',
  [extensionOf('a.PNG'), extensionOf('.gitignore'), extensionOf('a')],
  ['png', '', ''],
);
eq(
  'isImageFile — mime 이 없으면 확장자로 본다',
  [isImageFile({ name: 'a.png', size: 1, type: '' }), isImageFile({ name: 'a.pdf', size: 1, type: '' })],
  [true, false],
);

{
  // mountUpload — 잠금이 걸린 채 도는지, 끝나고 한 번에 커밋되는지.
  // mountUpload — whether it runs with the lock held, and commits everything at once when done.
  const n = make([p([])]);
  const files: UploadFile[] = [
    { name: 'a.png', size: 10, type: 'image/png' },
    { name: 'b.pdf', size: 10, type: 'application/pdf' },
  ];
  let lockedDuringUpload: string | null = 'not-run';
  const mount = mountUpload({
    nabi: n,
    uploader: (task) => {
      lockedDuringUpload = hostOf(n).lockedBy();
      return Promise.resolve({ uri: `/f/${task.name}` });
    },
    maxFileSize: 0,
    maxTotalSize: 0,
  });
  mount.take(files);
  ok('mountUpload — 배치가 도는 동안 진행 중이다', mount.isRunning());
  ok('mountUpload — 도는 동안 편집은 잠긴다', !n.applyCommand('insertText', { text: 'x' }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  eq('mountUpload — 전송 훅이 도는 동안에도 잠겨 있다', lockedDuringUpload, 'upload');
  eq('mountUpload — 끝나면 잠금이 풀린다', hostOf(n).lockedBy(), null);
  // mountUpload 는 로케일을 아는 자리라 첨부의 말을 골라 커맨드에 넘긴다(기본 en).
  // mountUpload knows the locale, so it picks the attachment label and passes it to the command (defaults to en).
  eq('mountUpload — 배치가 한 번에 커밋됐다', n.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/f/a.png', w: '60' }, ch: [] }] },
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/b.pdf', file: 'pdf' }, ch: ['Attachment'] }] },
  ]);
  ok('mountUpload — 되돌리기 한 번이면 배치 전이다', n.undo());
  eq('mountUpload — undo 한 점', n.getJson(), [{ w: 'p', ch: [] }]);
  mount.unmount();
}

// --- upload — 오류는 전부 toast 로 --------------------------------------------------------------
// 예전에 오류가 나가던 세 길(인라인 쪽지·`catch {}` 의 침묵·`return` 하나의 침묵)이 전부 이 한 문으로 모였는지 잰다. toast 는 인스턴스의 문이라 DOM 없이도 잡힌다.
// Checks that three old error paths (an inline note, a silent catch{}, a silent lone return) all now funnel through this one gate. toast is an instance-level door, so it's testable without a DOM.
function toasting(doc: readonly unknown[]): { nabi: ReturnType<typeof make>; said: string[] } {
  const said: string[] = [];
  const nabi = createNabiWith(allWings, {
    doc,
    toast: (level, message) => said.push(`${level}:${message}`),
  }).nabi;
  return { nabi, said };
}

const png: UploadFile = { name: 'a.png', size: 10, type: 'image/png' };
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

{
  // ① 거절 — 호스트가 안 받으면 우리가 말한다. 급은 warn(다른 파일을 고르면 되는 일이다).
  // (1) Rejected — if the host won't take it, we say so. Level is warn (picking a different file fixes it).
  const { nabi, said } = toasting([p([])]);
  const mount = mountUpload({ nabi, uploader: () => null, extensions: ['png'] });
  mount.take([{ name: 'a.exe', size: 5, type: '' }]);
  eq('업로드 — 거절이 toast 로 나온다', said, [
    `warn:${translate('upload.unsupported_type', 'en', undefined, { name: 'a.exe', max: '' })}`,
  ]);
  mount.unmount();
}

{
  // ② 거절 — 호스트가 받겠다고 하면 그쪽이 이긴다(ask·toast 와 같은 규칙). 두 번 말하지 않는다.
  // (2) Rejected — if the host says it'll accept it, the host wins (same rule as ask/toast). No double-reporting.
  const { nabi, said } = toasting([p([])]);
  const caught: string[] = [];
  const mount = mountUpload({
    nabi,
    uploader: () => null,
    extensions: ['png'],
    onReject: (problem) => caught.push(problem.code),
  });
  mount.take([{ name: 'a.exe', size: 5, type: '' }]);
  eq('업로드 — 호스트가 거절을 받으면 toast 는 안 뜬다', said, []);
  eq('업로드 — 거절은 호스트에게 갔다', caught, ['unsupported_type']);
  mount.unmount();
}

{
  // ③ 도는 중에 떨어진 파일 — 무시하되 무시했다는 것은 말한다.
  // (3) A file dropped mid-flight — ignored, but the fact it was ignored is reported.
  const { nabi, said } = toasting([p([])]);
  const mount = mountUpload({ nabi, uploader: () => new Promise(() => undefined) });
  mount.take([png]);
  mount.take([{ name: 'b.png', size: 10, type: 'image/png' }]);
  eq('업로드 — 도는 중에 온 파일은 말과 함께 무시된다', said, [`warn:${translate('upload.busy', 'en')}`]);
  mount.unmount();
}

{
  // ④ 전송이 터진 파일 — 예전에는 `catch {}` 가 삼켜 아무 데도 안 남았다. 급은 error.
  // (4) A file whose upload threw — a `catch {}` used to swallow this with no trace. Level is error.
  const { nabi, said } = toasting([p([])]);
  const mount = mountUpload({
    nabi,
    uploader: () => {
      throw new Error('서버가 끊겼다');
    },
  });
  mount.take([png]);
  await tick();
  eq('업로드 — 터진 파일 하나는 이름으로 말한다', said, [
    `error:${translate('upload.failed', 'en', undefined, { name: 'a.png' })}`,
  ]);
  mount.unmount();
}

{
  // ⑤ 빈 답도 실패다 — 주소를 못 받으면 문서에 세울 것이 없다. 여럿이면 이름이 아니라 수다.
  // (5) An empty response is still a failure — with no address, there's nothing to insert. With several, it reports a count, not names.
  const { nabi, said } = toasting([p([])]);
  const mount = mountUpload({ nabi, uploader: () => null });
  mount.take([png, { name: 'b.pdf', size: 10, type: 'application/pdf' }]);
  await tick();
  eq('업로드 — 여럿이 빠지면 수로 말한다', said, [
    `error:${translate('upload.failed_many', 'en', undefined, { n: 2 })}`,
  ]);
  mount.unmount();
}

{
  // ⑥ 취소는 오류가 아니다 — 사람이 제 손으로 끊은 것이라 말할 것이 없다.
  // (6) A cancel isn't an error — the person stopped it themselves, so there's nothing to report.
  const { nabi, said } = toasting([p([])]);
  const mount = mountUpload({ nabi, uploader: () => Promise.resolve(null) });
  mount.take([png]);
  mount.cancel();
  await tick();
  eq('업로드 — 취소된 배치는 오류로 말하지 않는다', said, []);
  mount.unmount();
}

// --- file — `.nabi` 왕복 --------------------------------------------------------------------

// 판 이름은 나비 자신의 판이고 앞의 둘만 쓴다(`1.2.3` → `1.2`) — 셋째 자리는 파일 모양과 상관없는 패치 번호다.
// The version is nabi's own version, using only the first two parts (1.2.3 -> 1.2) — the third digit is a patch count unrelated to the file shape.
eq('writeNabiFile — 판 이름과 몸이 함께 나간다', JSON.parse(writeNabiFile([1])), {
  version: NABI_FILE_VERSION,
  body: [1],
});
eq('판 이름은 나비 판의 앞 둘이다', NABI_FILE_VERSION, NABI_VERSION.split('.').slice(0, 2).join('.'));

// 읽을 때는 판을 안 본다 — 거를 판이 아직 하나도 없다. 문을 세우면 읽을 수 있는 파일을 우리가 막는다.
// Reading doesn't check the version — there's nothing to reject yet. A gate here would only block files we could otherwise read.
eq('읽기: 앞선 판도 그대로 읽는다', readNabiFile(JSON.stringify({ version: '99.9', body: [1] })), [1]);
eq('읽기: 옛 판도 그대로 읽는다', readNabiFile(JSON.stringify({ version: '0.0', body: [1] })), [1]);
eq('읽기: 판이 아예 없어도 읽는다', readNabiFile(JSON.stringify({ body: [1] })), [1]);
eq('읽기: 판이 글자가 아니어도 몸만 본다', readNabiFile(JSON.stringify({ version: 7, body: [1] })), [1]);
eq('읽기: 나비트리를 통째로 담은 파일(손으로 만든 것)도 읽는다', readNabiFile(JSON.stringify([1])), [1]);
eq('읽기: 모양이 아니면 null — 거기서만 거절한다', readNabiFile('{'), null);
eq('readNabiFile — 몸만 되읽는다', readNabiFile(writeNabiFile([{ w: 'p', ch: ['글'] }])), [{ w: 'p', ch: ['글'] }]);
eq('readNabiFile — 나비트리를 통째로 담은 옛 파일도 읽는다', readNabiFile('[{"w":"p","ch":["글"]}]'), [
  { w: 'p', ch: ['글'] },
]);
eq('readNabiFile — 형식이 아니면 null 이다(던지지 않는다)', readNabiFile('not json'), null);

{
  // 가짜 저장소 — 이름·글자·형식(mime) 셋을 그대로 받아 둔다. mime 은 필터가 말하는 값이라, 저장소가 그것을 받는지도 함께 본다.
  // A fake store — records name, text, and format (mime) as given. mime comes from the filter, so this also checks the store receives it.
  const source = make([p(['저장할 글'], { h: 2 }), p([el('img', [], { src: '/a.png', w: '40' })])]);
  let saved = '';
  let savedName = '';
  let savedMime = '';
  const store = {
    save({ name, text, mime }: { name: string; text: string; mime?: string }): void {
      savedName = name;
      saved = text;
      savedMime = mime ?? '';
    },
    open: () => Promise.resolve({ name: savedName, text: saved, ...(savedMime ? { mime: savedMime } : {}) }),
  };
  // html 을 읽는 문은 주입이다 — 그물은 제 손 토크나이저를 준다(브라우저는 parseNodes).
  // The html parser is injected — the test net supplies its own tokenizer (the browser uses parseNodes).
  const mounted = (nabi: ReturnType<typeof make>) =>
    mountFile({ nabi, registry, store, parse: tinyHtml, name: () => '메모', allowLocalUrls: true });
  const mount = mounted(source);
  ok('mountFile — saveFile 커맨드가 저장소로 이어진다', source.applyCommand('saveFile') === false); // 문서를 안 바꾸므로 문은 false 다
  ok('mountFile — 파일 이름은 날짜 + 이름 + 확장자다', /^\d{4}-\d{2}-\d{2} 메모\.nabi$/.test(savedName));
  ok('mountFile — 저장한 글자가 `.nabi` 모양이다', readNabiFile(saved) !== null);
  eq('mountFile — 형식은 필터가 말한다 (`.nabi` = json)', savedMime, 'application/json');

  // 저장하면 그 문서가 기준선이 된다 — 저장 직후는 안 바뀐 문서이고, 그 뒤에 친 글자부터 다시 바뀐 것이다.
  // Saving makes that document the baseline — right after a save it's unchanged, and only edits after that count as changed.
  ok('mountFile — 저장 직후에는 안 바뀐 문서다', !source.isChanged());
  source.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  source.applyCommand('insertText', { text: 'x' });
  ok('mountFile — 저장 뒤에 친 글자는 다시 바뀐 것이다', source.isChanged());

  // 이름을 주면 그것으로 — 판이 준 이름이 이 길로 온다.
  // If a name is given, use it — the dialog's chosen name arrives via this path.
  source.applyCommand('saveFile', { name: '2026-08-17 내 글' });
  eq('mountFile — 준 이름에 확장자만 붙는다', savedName, '2026-08-17 내 글.nabi');

  // --- 형식 셋 ----------------------------------------------------------------------------------
  // 저장 판이 세울 단추의 재료다. 순서는 nabi → html → md — 원본이 맨 앞이고, 되돌아오지 못하는 것이 맨 뒤다.
  // The material the save dialog builds its buttons from. Order is nabi -> html -> md — the original format first, the lossy one last.
  const formats = mount.formats();
  eq(
    'formats — 순서는 nabi → html → md',
    formats.map((format) => format.id),
    ['nabi', 'html', 'markdown'],
  );
  // html 형식이 내는 이름은 `.nhtml` 이다 — 담기는 글자와 mime 은 여전히 html 한 장이고, 바뀐 것은 파일 이름의 꼬리뿐이다.
  // The html format's output name is .nhtml — the content and mime are still plain html, only the file extension changed.
  eq(
    'formats — 확장자도 그 순서다',
    formats.map((format) => format.extension),
    ['.nabi', '.nhtml', '.md'],
  );
  eq(
    'formats — 되돌아오지 못하는 것은 md 뿐이다',
    formats.filter((format) => format.lossy).map((f) => f.id),
    ['markdown'],
  );

  // `.html` — 자립형 한 장이다. 조각만 내리면 서식 없는 문서가 나오므로 껍데기와 시트를 얹는다.
  // .html — a standalone single file. Dumping just the fragment would produce an unstyled document, so it's wrapped with shell and stylesheet.
  // 사본을 내리기 전에 바뀐 문서로 만들어 둔다 — 기준선을 옮기는지 여기서 갈린다.
  // The doc is marked changed before downloading a copy — this is where baseline-shifting is decided.
  source.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  source.applyCommand('insertText', { text: 'y' });
  ok('saveAs — 사본을 내리기 전에는 바뀐 문서다', source.isChanged());
  const kept = source.getJson();
  mount.saveAs('html', '내 글');
  eq('saveAs — html 은 `.nhtml` 로 나가고 형식은 html 그대로다', `${savedName} ${savedMime}`, '내 글.nhtml text/html');
  ok('saveAs — html 은 doctype 으로 시작한다', saved.startsWith('<!doctype html>'), saved.slice(0, 40));
  ok(
    'saveAs — html 이 charset·제목·시트를 든다',
    saved.includes('<meta charset="utf-8">') &&
      saved.includes('<title>내 글</title>') &&
      saved.includes('.nabi-content {'),
  );
  ok(
    'saveAs — html 본문이 `.nabi-content` 안에 든다',
    saved.includes('<div class="nabi-content">') && saved.includes('<h2>'),
  );

  mount.saveAs('markdown', '내 글');
  eq('saveAs — md 는 확장자와 형식이 제 것이다', `${savedName} ${savedMime}`, '내 글.md text/markdown');
  ok('saveAs — md 가 제목을 `##` 로 적는다', saved.startsWith('## '), saved.slice(0, 20));
  ok('saveAs — md 는 줄바꿈으로 끝난다', saved.endsWith('\n'));

  // 사본은 기준선을 안 옮긴다 — `.md` 로 내린 뒤 창을 닫으면 여전히 물어야 한다.
  // A copy doesn't move the baseline — closing the window after downloading a .md still needs to ask.
  eq('saveAs — 사본을 내려도 문서는 그대로다', source.getJson(), kept);
  ok('saveAs — 사본 저장은 "저장됨" 이 아니다 (기준선을 안 옮긴다)', source.isChanged());
  // 없는 형식은 조용히 아무 일도 안 한다 — 판이 낸 id 만 이 문에 온다.
  // An unknown format quietly does nothing — only ids the dialog itself produced reach this door.
  mount.saveAs('없는형식', '내 글');
  eq('saveAs — 모르는 형식이면 저장소를 안 부른다', savedName, '내 글.md');

  // --- 열기 -------------------------------------------------------------------------------------
  // 파일 대화상자가 받는 확장자는 read 를 든 필터가 제 save.extension 으로 말한다.
  // The extensions the file dialog accepts come from each read-capable filter's own save.extension.
  // 여는 목록에 `.html` 이 빠져 있다 — 그 이름을 읽는 것은 저장 칸이 없는 짝(`html-open`)이고, 이 함수는 `save.extension` 을 든 필터만 센다.
  // .html is missing from the open list — reading that name belongs to a save-less counterpart (html-open), and this function only counts filters that carry save.extension.
  eq('열기 — 명시된 확장자 전체', readExtensions(ioFiltersOf({ registry, parse: tinyHtml })), [
    '.nabi',
    '.nhtml',
    '.html',
    '.htm',
    '.xhtml',
    '.shtml',
    '.md',
    '.markdown',
  ]);

  // 이름을 실은 새 모양 — 확장자가 어느 필터로 읽을지를 정한다.
  // A shape that carries a name — the extension decides which filter reads it.
  const named = (name: string, text: string) => ({
    save: (): void => {},
    open: (): Promise<{ name: string; text: string }> => Promise.resolve({ name, text }),
  });
  {
    const target = make([]);
    const opened = mountFile({
      nabi: target,
      registry,
      store: named('메모.nabi', writeNabiFile(kept)),
      parse: tinyHtml,
    });
    eq('mountFile — `.nabi` 가 열린다', await opened.open(), true);
    eq('mountFile — 왕복한 값이 그대로다', target.getJson(), kept);
  }
  {
    // 우리가 내린 이름 — 저장 판이 내는 그 확장자다. 저장한 것을 다시 열 수 있어야 한다.
    // A name we downloaded ourselves — the same extension the save dialog produces. What we save must open again.
    const target = make([]);
    const opened = mountFile({
      nabi: target,
      registry,
      store: named('메모.nhtml', '<h1>연 제목</h1>'),
      parse: tinyHtml,
    });
    eq('mountFile — `.nhtml` 은 html 필터가 읽는다', await opened.open(), true);
    eq('mountFile — 연 nhtml 이 문서가 됐다', target.getJson(), [{ w: 'p', a: { h: 1 }, ch: ['연 제목'] }]);
  }
  {
    // 밖에서 온 평범한 html — 여는 길을 막지 않는다. 저장 칸 없는 짝이 받는다.
    // Plain html from outside — the open path isn't blocked. The save-less counterpart handles it.
    const target = make([]);
    const opened = mountFile({
      nabi: target,
      registry,
      store: named('메모.html', '<h1>연 제목</h1>'),
      parse: tinyHtml,
    });
    eq('mountFile — `.html` 도 그대로 열린다', await opened.open(), true);
    eq('mountFile — 연 html 이 문서가 됐다', target.getJson(), [{ w: 'p', a: { h: 1 }, ch: ['연 제목'] }]);
  }
  {
    const target = make([]);
    const opened = mountFile({ nabi: target, registry, store: named('메모.md', '# 마크다운 제목'), parse: tinyHtml });
    eq('mountFile — `.md` 는 md 필터가 읽는다', await opened.open(), true);
    eq('mountFile — 연 md 가 문서가 됐다', target.getJson(), [{ w: 'p', a: { h: 1 }, ch: ['마크다운 제목'] }]);
  }
  {
    // 모르는 확장자 — 평문으로 연다.
    // An unknown extension — opens as plain text.
    const target = make([{ w: 'p', ch: ['쓰던 글'] }]);
    const opened = mountFile({ nabi: target, registry, store: named('메모.txt', '그냥 글자'), parse: tinyHtml });
    eq('mountFile — 모르는 확장자는 평문으로 연다', await opened.open(), true);
    eq('mountFile — 평문이 문서가 된다', target.getJson(), [{ w: 'p', ch: ['그냥 글자'] }]);
  }
  {
    const target = make([]);
    const unnamed = named('', '확장자 없는 평문');
    const opened = mountFile({ nabi: target, registry, store: unnamed });
    eq('mountFile — 확장자 없는 이름은 평문으로 열린다', await opened.open(), true);
    eq('mountFile — 확장자 없는 값이 문단이 된다', target.getJson(), [{ w: 'p', ch: ['확장자 없는 평문'] }]);
  }
  {
    const errors: unknown[] = [];
    const target = make([{ w: 'p', ch: ['원문'] }]);
    const reject: IoFilter = { id: 'reject', label: 'reject', read: { extensions: ['.reject'], run: () => null } };
    const opened = mountFile({
      nabi: target,
      registry,
      store: named('bad.reject', 'x'),
      ioFilters: [reject],
      onError: (error) => errors.push(error),
    });
    eq('mountFile — known reader가 모두 null이면 원자적으로 거절한다', await opened.open(), false);
    eq('mountFile — null reader 뒤 문서는 그대로다', target.getJson(), [{ w: 'p', ch: ['원문'] }]);
    eq('mountFile — null reader 실패를 정확히 한 번 보고한다', errors.length, 1);
  }
  {
    const errors: unknown[] = [];
    const target = make([{ w: 'p', ch: ['원문'] }]);
    const invalid: IoFilter = {
      id: 'invalid',
      label: 'invalid',
      read: { extensions: ['.invalid'], run: () => ({ nope: true }) },
    };
    const opened = mountFile({
      nabi: target,
      registry,
      store: named('bad.invalid', 'x'),
      ioFilters: [invalid],
      onError: (error) => errors.push(error),
    });
    eq('mountFile — reader의 invalid body를 원자적으로 거절한다', await opened.open(), false);
    eq('mountFile — invalid body 뒤 문서는 그대로다', target.getJson(), [{ w: 'p', ch: ['원문'] }]);
    eq('mountFile — invalid body 실패를 정확히 한 번 보고한다', errors.length, 1);
  }
  ok(
    'mountFile — 취소(null)는 오류가 아니다',
    (await mountFile({
      nabi: make([]),
      registry,
      store: { save: () => {}, open: () => Promise.resolve(null) },
    }).open()) === false,
  );

  // 쓰던 글이 있으면 먼저 묻는다 — 묻는 길은 인스턴스의 것이라 호스트가 제 상자를 끼운다.
  // If there's unsaved work, it asks first — the ask path belongs to the instance, so the host plugs in its own dialog.
  {
    const asked: string[] = [];
    const dirty = createNabiWith(allWings, {
      doc: [{ w: 'p', ch: ['쓰던 글'] }],
      ask: {
        message: () => {},
        confirm: (text) => {
          asked.push(text);
          return false;
        },
      },
    }).nabi;
    const mounted2 = mountFile({ nabi: dirty, registry, store: named('메모.nabi', writeNabiFile(kept)) });
    dirty.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
    dirty.applyCommand('insertText', { text: 'x' });
    const mine = dirty.getJson();
    eq('mountFile — 안 저장한 글이 있으면 열기가 묻는다', await mounted2.open(), false);
    eq('mountFile — 물은 것은 한 번', asked.length, 1);
    eq('mountFile — 아니오면 쓰던 글이 그대로다', dirty.getJson(), mine);
  }
  // 아무것도 안 끼운 인스턴스는 아무도 예라고 안 했다 로 답한다 — 물을 사람이 없다고 쓰던 글을 버리지 않는다.
  // An instance with nothing wired in answers "no one said yes" — having no one to ask doesn't mean it discards unsaved work.
  {
    const silent = make([{ w: 'p', ch: ['글'] }]);
    const mounted2 = mountFile({ nabi: silent, registry, store: named('메모.nabi', writeNabiFile(kept)) });
    silent.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
    silent.applyCommand('insertText', { text: 'x' });
    eq('mountFile — 묻는 길이 없으면 안 연다', await mounted2.open(), false);
  }

  // --- 저장 단추의 선언 -------------------------------------------------------------------------
  // 두 손이 같은 판을 연다 — 옛 판은 단추가 이름을 묻고 ⌘S 는 그대로 저장했는데, 형식이 여럿이 된 뒤로 "지금 그대로"가 무엇으로 저장할지를 안 말한다.
  // Both hands open the same dialog — the old design had the button ask for a name while Cmd+S just saved as-is, but with multiple formats "save as-is" no longer says which format.
  eq('save — 단추는 판을 연다 (호스트의 문)', saveFileWing.button?.action?.kind, 'host');
  ok('save — 가속키도 같은 판이다 (제 답을 안 든다)', saveFileWing.button?.accelerated === undefined);
  ok('save — 이름 칸의 선언은 wing 에 없다 (판이 든다)', !('fields' in (saveFileWing.button?.action ?? {})));
  ok('save — 키는 여전히 툴바가 삼킨다', saveFileWing.button?.accelerator === 'mod+s');

  // 판이 이름 칸을 열 때 쓰는 값 — 날짜 뒤 빈칸 하나(옛 wing 선언의 그 값 그대로).
  // The value the dialog opens the name field with — the date plus one trailing space (unchanged from the old wing declaration).
  ok('save — 이름 칸은 오늘 날짜만 들고 열린다', `${today()} `.startsWith(today()));
  mount.unmount();
}

// --- localHistory — 가짜 저장소 -----------------------------------------------------------------

function fakeStorage(): HistoryStorage & { readonly data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

eq('summarize — 글자만 훑어 요약한다', summarize([{ w: 'p', ch: ['안녕 ', { w: 'b', ch: ['세상'] }] }]), '안녕 세상');
eq('summarize — 길면 자른다', summarize([{ w: 'p', ch: ['가'.repeat(200)] }]).length, 81);

{
  const storage = fakeStorage();
  const n = make([p(['첫 글'])]);
  let clock = 1000;
  const history = mountLocalHistory({ nabi: n, storage, minIntervalMs: 0, now: () => (clock += 1) });
  ok('localHistory — 스냅샷이 적힌다', history.snapshot());
  eq('localHistory — 목록에 한 줄이 선다', history.list().length, 1);
  eq('localHistory — 요약이 실린다', history.list()[0]?.summary, '첫 글');
  n.applyCommand('insertText', { text: '더' });
  eq('localHistory — 문서가 바뀌면 저절로 적힌다(줄은 여전히 하나)', history.list().length, 1);
  ok('localHistory — 같은 세션은 제 줄을 고쳐 쓴다', (history.list()[0]?.summary ?? '').includes('더'));

  const record = history.list()[0];
  const other = make([p(['다른 편집기'])]);
  const restored = mountLocalHistory({ nabi: other, storage, minIntervalMs: 0, now: () => (clock += 1) });
  ok('localHistory — 다른 편집기가 그 줄을 되살린다', record !== undefined && restored.restore(record));
  eq('localHistory — 되살린 문서가 그 줄의 문서다', other.getJson(), n.getJson());
  ok('localHistory — 되살리기는 되돌릴 수 있다 (커맨드의 문을 지난다)', other.undo());
  eq('localHistory — 되돌리면 쓰던 글로 간다', other.getJson(), [{ w: 'p', ch: ['다른 편집기'] }]);
  ok('localHistory — 제 줄을 잊는다', restored.forget());
  history.unmount();
  restored.unmount();
}

{
  // 지우기는 되돌리기가 못 닿는다 — 그래서 기록 판이 먼저 묻는다. 그 물음은 인스턴스의 것을 지나야 한다.
  // Delete is beyond undo's reach — so the history dialog asks first. That prompt must go through the instance's own ask.
  const storage = fakeStorage();
  const asked: string[] = [];
  const ask = {
    message(text: string) {
      asked.push(text);
    },
    confirm(text: string) {
      asked.push(text);
      return true;
    },
  };
  const n = createNabiWith(allWings, { doc: [p(['글'])], ask }).nabi;
  const history = mountLocalHistory({ nabi: n, storage, minIntervalMs: 0 });
  eq('localHistory — 묻는 길이 인스턴스의 것 그대로다', history.ask, hostOf(n).ask);
  eq('localHistory — 물으면 그 상자가 답한다', history.ask.confirm('지울까요?'), true);
  eq('localHistory — 물음이 그 상자에 닿았다', asked, ['지울까요?']);
  history.unmount();

  // 안 주면 침묵이 답한다 — "아니오"다. 물을 사람이 없다고 지우면 안 된다.
  // No dialog means silence answers — "no". Having no one to ask must never mean deleting.
  const quiet = mountLocalHistory({ nabi: make([p(['글'])]), storage, minIntervalMs: 0 });
  eq('localHistory — 상자를 안 주면 답은 "아니오"', quiet.ask.confirm('지울까요?'), false);
  quiet.unmount();
}

// 두 물음이 열넷의 말을 다 든다 — 하나라도 빠지면 그 언어에서 영어가 뜬다.
// Both prompts carry all fourteen locales — missing even one shows English in that language.
for (const key of ['history.clearAsk', 'history.removeAsk']) {
  const bare = LOCALES.filter((code) => code !== 'en' && translate(key, code) === translate(key, 'en'));
  eq(`사전 — ${key} 가 열넷의 말을 다 든다`, bare, []);
}

{
  const broken: HistoryStorage = {
    getItem: () => {
      throw new Error('막힌 저장소');
    },
    setItem: () => {
      throw new Error('용량 초과');
    },
    removeItem: () => undefined,
  };
  const n = make([p(['글'])]);
  const history = mountLocalHistory({ nabi: n, storage: broken, minIntervalMs: 0 });
  eq('localHistory — 저장소가 거절해도 던지지 않는다', history.snapshot(), false);
  eq('localHistory — 막힌 저장소의 목록은 빈 목록이다', history.list().length, 0);

  // 막힌 자리(`file://`)를 어떻게 알아내는가 — 읽기 한 번이 그 잣대다. 이름이 있는 것과 손이 닿는 것은 다르다.
  // How to detect a blocked location (file://) — a single read attempt is the test. Having a name and being reachable are different things.
  eq('historyStorageAlive — 읽다가 던지는 저장소는 죽은 것이다', historyStorageAlive(broken), false);
  eq('historyStorageAlive — 저장소가 아예 없으면 죽은 것이다', historyStorageAlive(null), false);
  eq('historyStorageAlive — 읽히면 살아 있다', historyStorageAlive(fakeStorage()), true);
  eq('localHistory — 막힌 저장소는 부속도 죽었다고 답한다', history.alive(), false);
  eq('localHistory — 알리는 길도 인스턴스의 것 그대로다', history.toast, hostOf(n).toast);
  history.unmount();

  // 저장소가 아예 없는 자리에서도 부속은 선다 — 그래야 wing 단추가 판으로 이어지고, 판이 왜 안 열리는지 말한다.
  // The part still mounts even with no storage at all — so the wing's button still opens the dialog, which can explain why it won't work.
  const nowhere = mountLocalHistory({ nabi: make([p(['글'])]), storage: null, minIntervalMs: 0 });
  eq('localHistory — 저장소가 null 이어도 세워진다(죽었다고 답할 뿐)', nowhere.alive(), false);
  eq('localHistory — null 저장소의 스냅샷은 조용히 false 다', nowhere.snapshot(), false);
  eq('localHistory — null 저장소의 목록은 빈 목록이다', nowhere.list().length, 0);
  eq('localHistory — null 저장소는 지우기도 조용히 false 다', [nowhere.forget(), nowhere.clear()], [false, false]);
  nowhere.unmount();
}

// 판이 무엇을 보이는가 — 셋뿐이고 DOM 이 없다. "없음"과 "못 엶"은 다른 말이라 갈라 둔다.
// What the dialog shows — only three states, no DOM. "empty" and "blocked" are kept distinct.
eq('historyView — 저장소가 막혔으면 blocked (기록 없음이 아니다)', historyView(false, []), 'blocked');
eq('historyView — 살아 있는데 한 줄도 없으면 empty', historyView(true, []), 'empty');
eq(
  'historyView — 줄이 있으면 rows',
  historyView(true, [{ sessionId: 's', summary: '', body: '[]', savedAt: 1, createdAt: 1 }]),
  'rows',
);

// --- 자세한 시각 — 로케일이 자리 순서를 정한다 ---------------------------------------------------

{
  const born = new Date(2026, 7, 18, 15, 4, 5).getTime();
  ok('exactTime — 독일은 일.월.년 이고 24시간제다', exactTime(born, 'de').startsWith('18.08.2026'));
  ok('exactTime — 미국은 월/일/년 이다', exactTime(born, 'en-US').startsWith('08/18/2026'));
  ok('exactTime — 일본은 년/월/일 이다', exactTime(born, 'ja').startsWith('2026/08/18'));
  // 지역을 떼면 안 되는 까닭 — 같은 영어인데 8월 18일의 자리가 뒤바뀐다.
  // Why the region can't be dropped — the same English locale flips month/day order.
  ok('exactTime — 지역까지 봐야 한다 (en-GB ≠ en-US)', exactTime(born, 'en-GB') !== exactTime(born, 'en-US'));
  // 초까지 든다는 것을 숫자 모양으로 안 잰다 — 1초를 옮겼을 때 글자가 달라지는가로 잰다.
  // Whether seconds are included isn't checked by digit shape — it's tested by whether shifting one second changes the string.
  ok(
    'exactTime — 열넷 어디서도 초까지 든다',
    LOCALES.every((code) => exactTime(born, code) !== exactTime(born + 1000, code)),
  );
  ok('exactTime — 모양이 아닌 로케일도 시각을 잃지 않는다', exactTime(born, '!!').includes('2026'));
}

// 만든 때는 고친 때와 벌어졌을 때만 따로 말한다 — 갓 선 줄은 둘이 같은 순간이다.
// The created time is shown separately only once it diverges from the saved time — a fresh row has both at the same instant.
{
  const row = (createdAt: number, savedAt: number) => ({ sessionId: 's', summary: '', body: '[]', savedAt, createdAt });
  eq('showsCreated — 갓 선 줄은 만든 때를 따로 안 적는다', showsCreated(row(1000, 1000)), false);
  eq('showsCreated — 1분이 벌어지면 따로 적는다', showsCreated(row(1000, 1000 + 60_000)), true);
}

// 막힌 자리의 안내는 **무엇을 해야 하는지**까지 든 말이라 열넷을 다 채운다.
// The blocked-state message says what to do about it, so it too needs all fourteen locales filled in.
for (const key of ['history.blocked', 'upload.failed', 'upload.failed_many', 'upload.busy']) {
  const bare = LOCALES.filter((code) => code !== 'en' && translate(key, code) === translate(key, 'en'));
  eq(`사전 — ${key} 가 열넷의 말을 다 든다`, bare, []);
}

// --- 토크나이저 — 언어 스모크 + 이어 붙이기 불변식 -----------------------------------------------

const joined = (code: string, lang: string): string => tokenize(code, lang).reduce((sum, t) => sum + t.text, '');
const typesOf = (code: string, lang: string): string[] =>
  tokenize(code, lang)
    .filter((t) => t.type !== undefined)
    .map((t) => t.type as string);

for (const [lang, code] of [
  ['ts', 'const x: number = 1; // 주석\nfunction f() { return "글"; }'],
  ['json', '{ "name": "나비", "n": 12, "ok": true }'],
  ['css', '.a { color: #fff; /* 주석 */ }'],
  ['python', 'def f(x):\n    return x  # 주석'],
  ['html', '<a href="/x">글</a><!-- 주석 -->'],
  ['', 'plain text 12'],
] as const) {
  eq(`토크나이저 — 이어 붙이면 원본이다 (${lang || '무명'})`, joined(code, lang), code);
}
ok('토크나이저 — ts 는 키워드를 안다', typesOf('const x = 1', 'ts').includes('keyword'));
ok(
  '토크나이저 — ts 는 글자열과 주석을 가른다',
  ['string', 'comment'].every((t) => typesOf('// 주석\nconst s = "글"', 'ts').includes(t)),
);
ok(
  '토크나이저 — json 은 글자열과 수를 안다',
  ['string', 'number'].every((t) => typesOf('{"a": 1}', 'json').includes(t)),
);
ok('토크나이저 — css 는 주석을 안다', typesOf('.a { /* c */ }', 'css').includes('comment'));
ok(
  '토크나이저 — html 은 태그와 속성을 안다',
  ['tag', 'attribute'].every((t) => typesOf('<a href="/x">글</a>', 'html').includes(t)),
);
eq('토크나이저 — 닫히지 않은 글자열도 글자를 안 잃는다', joined('const s = "열린 채', 'ts'), 'const s = "열린 채');
eq('토크나이저 — 빈 글은 빈 목록이다', tokenize('', 'ts').length, 0);
eq('usableTokens — 원본과 다른 답은 평문 한 덩이가 된다', usableTokens([{ text: '다른 글' }], '원본'), [
  { text: '원본' },
]);
eq('usableTokens — 모르는 토큰 이름은 맨 글자로 떨어진다', usableTokens([{ text: 'x', type: '낯선' }], 'x'), [
  { text: 'x' },
]);

// `tokensFor` — 편집 화면과 보는 쪽이 함께 쓰는 한 줄이다. 둘이 각자 적으면 언젠가 갈려 미리보기와 편집기의 색이 어긋난다.
// tokensFor — the one line both the editor and the viewer share. If each wrote its own version, they'd eventually drift and disagree on color.
eq('tokensFor — 하이라이터가 없으면 내장 토크나이저가 답한다', tokensFor('const', 'ts'), tokenize('const', 'ts'));
eq(
  'tokensFor — 호스트의 답을 그대로 쓴다',
  tokensFor('ab', null, () => [{ text: 'ab', type: 'string' }]),
  [{ text: 'ab', type: 'string' }],
);
eq(
  'tokensFor — null 을 답하면 내장으로 떨어진다',
  tokensFor('const', 'ts', () => null),
  tokenize('const', 'ts'),
);
eq(
  'tokensFor — 던지는 하이라이터도 색칠만 포기한다',
  tokensFor('const', 'ts', () => {
    throw new Error('죽었다');
  }),
  tokenize('const', 'ts'),
);
eq(
  'tokensFor — 원본과 어긋난 답은 평문 한 덩이다',
  tokensFor('원본', null, () => [{ text: '다른 글' }]),
  [{ text: '원본' }],
);

// --- 체크 토글 ----------------------------------------------------------------------------------

{
  const n = make([el('tl', [el('tli', [p(['할 일'])])])]);
  ok('toggleCheck — 항목 속 문단에 캐럿이 선다', n.select(range(at([0, 0, 0, 0], 0), at([0, 0, 0, 0], 0))));
  ok('toggleCheck — 캐럿이 든 항목을 켠다', n.applyCommand('toggleCheck'));
  eq('toggleCheck — ck 가 1 로 선다', n.getJson(), [
    { w: 'p', ch: [{ w: 'tl', ch: [{ w: 'tli', a: { ck: 1 }, ch: [{ w: 'p', ch: ['할 일'] }] }] }] },
  ]);
  ok('toggleCheck — 다시 누르면 꺼진다', n.applyCommand('toggleCheck'));
  eq('toggleCheck — 끄면 attr 자체가 진다 (0 은 "없음")', n.getJson(), [
    { w: 'p', ch: [{ w: 'tl', ch: [{ w: 'tli', ch: [{ w: 'p', ch: ['할 일'] }] }] }] },
  ]);
  ok('toggleCheck — 값을 못 박아 부를 수도 있다', n.applyCommand('toggleCheck', { ck: 1 }));
  ok('toggleCheck — 이미 그 값이면 침묵한다 (무변화면 침묵)', !n.applyCommand('toggleCheck', { ck: 1 }));

  const id = ((hostOf(n).doc()[0]?.ch[0] as ElementNode).ch[0] as ElementNode)._id;
  ok('toggleCheck — 화면이 짚어 준 _id 로도 찾는다 (체크 띠 클릭의 길)', n.applyCommand('toggleCheck', { id, ck: 0 }));
  ok('toggleCheck — 모르는 id 는 안 돈다', !n.applyCommand('toggleCheck', { id: 'nope' }));
}

{
  // 옛 확실 버그 2 — `[x] ` 오토포맷의 체크 상태. 규격 자체는 wings1 이 재고 있어 여기서는 확인만이다.
  // Historical confirmed bug 2 — the checked state from the `[x] ` autoformat. The spec itself is covered by wings1; this is just a sanity check.
  const rule = registry.inputRules.find((r) => r.w === 'tl');
  const args = rule?.run(/^\[( |x|X)\]$/.exec('[x]') as RegExpMatchArray).args;
  eq('오토포맷 확인 — `[x]` 는 체크된 항목으로 선다 (옛 버그 2)', args, { ck: 1 });
}

// --- 물건 wing 이 정렬을 안 갖는다는 것의 반대편 — 래퍼문단이 든다 ------------------------------

{
  const n = make([p([el('img', [], { src: '/a.png' })])]);
  ok('정렬은 래퍼문단이 든다 — setAlign 이 래퍼에도 듣는다', n.applyCommand('setAlign', { value: 'c' }));
  eq('정렬 — 물건이 아니라 래퍼문단에 실린다', n.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/a.png' }, ch: [] }] },
  ]);
  ok('제목은 래퍼문단에 안 실린다', !n.applyCommand('setHeading', { value: 1 }));
}

// --- wing 고르기 빌더 — 다섯 가지 잘못이 전부, 고칠 방법과 함께 죽는가 --------------------------
// 죽되 말에 고칠 방법이 실렸는지까지 본다 — "잘못됐다" 만으로는 CDN 사용자를 못 지킨다.
// Checks not just that it throws, but that the message includes how to fix it — "it's wrong" alone doesn't help a CDN user.
function dies(name: string, fn: () => unknown, needles: readonly string[]): void {
  try {
    fn();
    ok(name, false, '안 죽었다');
  } catch (error) {
    const message = (error as Error).message;
    ok(
      name,
      needles.every((needle) => message.includes(needle)),
      [message, ...needles.filter((needle) => !message.includes(needle)).map((needle) => `빠진 말: ${needle}`)],
    );
  }
}

{
  // 차례 — .all() 은 defaultWings 와 같은 차례여야 한다 — 같은 인스턴스인 것까지 확인해 원본이 한 자리(CATALOG)라는 약속을 지킨다.
  // Order — .all() must match defaultWings' exact order. Checking they're the same instance, not just equal, guarantees a single source of truth (CATALOG).
  const all = wings().all().build();
  ok(
    '빌더 — .all() 은 defaultWings 와 같은 차례·같은 인스턴스다',
    all.length === defaultWings.length && all.every((wing, i) => wing === defaultWings[i]),
    all.map((wing) => wing.w).join('·'),
  );
  eq(
    '빌더 — wingNames() 가 defaultWings 의 w 차례 그대로다',
    wingNames(),
    defaultWings.map((wing) => wing.w),
  );
  eq('빌더 — .all() 없이는 빈 손이다', wings().build(), []);
}

{
  // .allBasic() — 배선 없이 도는 것만. 빠지는 넷(upload·save·open·diff)은 호스트가 제 것을 대야 사는 것들이다. 판정은 wing 의 basic 선언 하나다.
  // .allBasic() — only what runs with no wiring. The four left out (upload, save, open, diff) need the host to supply their own dependency. The test is a single flag: the wing's basic declaration.
  const WIRED = ['upload', 'save', 'open', 'diff'];
  const basic = wings().allBasic().build();
  const names = basic.map((wing) => wing.w);
  eq(
    '빌더 — .allBasic() 은 배선 필요한 넷만 뺀 나머지 전부다',
    names,
    defaultWings.map((wing) => wing.w).filter((w) => !WIRED.includes(w)),
  );
  eq('빌더 — .allBasic() 의 개수는 차례표에서 넷 준 것이다', basic.length, defaultWings.length - WIRED.length);
  ok(
    '빌더 — .allBasic() 이 든 것은 defaultWings 와 같은 인스턴스다',
    basic.every((wing) => wing === defaultWings.find((one) => one.w === wing.w)),
  );
  ok(
    '빌더 — 든 것은 전부 스스로 basic 이라 말한 것이다',
    basic.every((wing) => wing.basic === true),
  );
  ok(
    '빌더 — 뺀 넷은 basic 을 안 단다',
    WIRED.every((w) => defaultWings.find((wing) => wing.w === w)?.basic !== true),
  );

  // 빠진 것을 도로 넣는 길은 이미 있는 문 하나뿐이다 — .use().
  // The only way to add back what's missing is the door that already exists — .use().
  const withSave = wings().allBasic().use('save').use('open').build();
  eq(
    '빌더 — .allBasic().use(save·open) 은 차례표 차례 그대로 도로 든다',
    withSave.map((wing) => wing.w),
    defaultWings.map((wing) => wing.w).filter((w) => w !== 'upload' && w !== 'diff'),
  );

  // 잣대는 이름이 아니라 선언이다 — 커스텀도 같은 문을 쓴다.
  // The test is a declaration, not a name — a custom wing goes through the same gate.
  ok('빌더 — basic 을 안 단 커스텀은 안 든다', !$isBasic({ w: 'exNote', place: 'tool' }));
  ok('빌더 — basic: true 를 단 커스텀은 든다', $isBasic({ w: 'exNote', place: 'tool', basic: true }));
  // 차례표 밖이라 .allBasic() 이 커스텀을 찾아가지는 않는다 — 커스텀은 .use(객체) 로 온다.
  // It's outside the catalog, so .allBasic() never reaches a custom wing on its own — a custom wing only arrives via .use(object).
  ok(
    '빌더 — .allBasic() 은 커스텀을 스스로 끌어오지 않는다',
    !wings()
      .allBasic()
      .build()
      .some((wing) => wing.w.startsWith('ex')),
  );
}

{
  // .all() 은 한 글자도 안 바뀐다 — allBasic 이 늘어도 옛 문과 defaultWings 는 그대로다.
  // .all() doesn't change at all — even as allBasic grows, the old door and defaultWings stay the same.
  eq('빌더 — .all() 은 여전히 차례표 전부다', wings().all().build().length, defaultWings.length);
  const mixed = wings().allBasic().all().build();
  eq(
    '빌더 — .allBasic() 뒤의 .all() 이 빠진 셋을 도로 채운다',
    mixed.map((wing) => wing.w),
    defaultWings.map((wing) => wing.w),
  );
}

// ① 이름 오타 — 그 자리에서 죽고, "혹시 이것?" 과 전체 목록이 실린다.
// (1) A misspelled name — throws right there, with a "did you mean?" and the full list.
dies('빌더 ① — 이름 오타는 부른 그 줄에서 죽는다', () => wings().use('bod' as never), [
  "없는 wing: 'bod'",
  "혹시 'b'(굵게·Bold)?",
  '받는 이름: b·i·u·s·sup·sub·tf',
]);
dies('빌더 ① — 커스텀을 이름으로 부르면 객체의 길을 알려 준다', () => wings().use('exNote' as never), [
  '커스텀 wing 은 객체로 넣는다',
]);

// ② 옵션 키 오타 — 가장 조용히 새는 자리. 모르는 키는 죽고 받는 키가 실린다.
// (2) A misspelled option key — the quietest place for bugs to leak. An unknown key throws, listing the accepted keys.
dies('빌더 ② — 모르는 옵션 키는 죽는다', () => wings().use('tf', { value: ['sans'] } as never), [
  "'tf' 가 모르는 옵션: 'value'",
  "혹시 'values'?",
  '받는 것: values',
]);
dies('빌더 ② — 옵션 없는 wing 에 옵션을 주면 죽는다', () => wings().use('b', { values: [] } as never), [
  "'b' 는 받는 옵션이 없다",
]);
dies('빌더 ② — values 에 배열 아닌 것을 주면 죽는다', () => wings().use('tf', { values: 'sans' } as never), [
  "'tf' 의 values 는 배열이다",
]);
dies(
  '빌더 ② — allowLocalUrls 에 불리언 아닌 것을 주면 죽는다',
  () => wings().use('img', { allowLocalUrls: 'yes' } as never),
  ["'img' 의 allowLocalUrls 는 true/false 다"],
);

// ③ 목록 밖 값 — 팩토리(계약의 원본)가 던지고, 받는 목록이 실린다.
// (3) A value outside the allowed list — the factory (the source of the contract) throws, listing what's accepted.
dies('빌더 ③ — 목록 밖 값은 죽고 받는 목록이 실린다', () => wings().use('tf', { values: ['sans', 'georgia'] }), [
  "'tf' 가 모르는 값: 'georgia'",
  '받는 것: sans·serif·mono·cursive',
]);
dies('빌더 ③ — 빈 values 는 죽고 .drop 의 길을 알려 준다', () => wings().use('tf', { values: [] }), [".drop('tf')"]);
dies('팩토리 직접 호출도 같은 계약이다', () => makeTypefaceWing({ values: ['x'] }), ["'tf' 가 모르는 값: 'x'"]);

// ④ ex 아닌 커스텀 — 고친 이름을 그대로 보여 준다.
// (4) A custom wing not prefixed ex — shows the corrected name directly.
dies('빌더 ④ — ex 아닌 커스텀은 죽고 고친 이름을 보여 준다', () => wings().use({ w: 'note', place: 'tool' } as Wing), [
  "'note' → 'exNote'",
]);
dies(
  '빌더 ④ — 객체에 옵션을 얹으면 죽는다(조용히 버리지 않는다)',
  () => (wings() as { use(a: unknown, b: unknown): unknown }).use(uploadWing, { allowLocalUrls: true }),
  ['객체에는 옵션을 못 얹는다'],
);
dies('빌더 — 이름도 객체도 아닌 것은 죽는다', () => wings().use(42 as never), ['이름(글자열) 또는 wing 객체']);

// ⑤ 의존성 깨는 drop — 마지막 딛는 자리를 빼면 죽고, 함께 빼는 길이 실린다.
// (5) A drop that breaks a dependency — removing the last thing another wing stands on throws, showing how to drop both together.
dies('빌더 ⑤ — 마지막 딛는 wing 을 빼면 죽는다', () => wings().all().drop('img').drop('a'), [
  "'a' 를 빼면 'upload' 가 설 수 없다",
  'img·a 중 하나가 필요하다',
  ".drop('upload')",
]);
dies('빌더 ⑤ — 안 든 것을 빼면 죽는다(조용한 no-op 이 아니다)', () => wings().drop('upload'), ['지금 목록에 없다']);

{
  // 의존성 — 더할 때는 조용히 끌어오고(img 가 딸려 온다), 하나가 남아 있으면 빼도 산다.
  // Dependencies — adding pulls one in quietly (img comes along), and dropping is fine as long as one supporter remains.
  const up = wings().use('upload').build();
  eq(
    '빌더 — upload 을 부르면 딛는 img 가 조용히 딸려 온다',
    up.map((wing) => wing.w),
    ['img', 'upload'],
  );
  ok('빌더 — 딸려 온 목록이 등록(makeRegistry)을 그대로 지난다', makeRegistry(up).wings.length === 2);
  const noImg = wings().all().drop('img').build();
  ok(
    '빌더 — a 가 남아 있으면 img 를 빼도 upload 이 산다',
    !noImg.some((wing) => wing.w === 'img') && noImg.some((wing) => wing.w === 'upload'),
  );
}

{
  // 값 좁히기 — 상황 줄의 칸이 실제로 줄고, 좁힌 목록 밖 값은 커맨드도 안 돈다.
  // Narrowing values — the context bar's options actually shrink, and a value outside the narrowed list won't even run via command.
  // 빌더를 createNabiWith 에 그대로 넘긴다 — .build() 없이.
  // The builder is passed straight to createNabiWith — no .build().
  const picked = wings()
    .all()
    .drop('upload')
    .use('tf', { values: ['sans', 'serif'] });
  const tf = picked.build().find((wing) => wing.w === 'tf');
  const control = tf?.context?.controls[0] as { values: readonly { value: string }[] } | undefined;
  eq(
    '빌더 — 값 좁히기가 상황 줄의 칸을 실제로 줄인다',
    control?.values.map((choice) => choice.value),
    ['sans', 'serif'],
  );

  const { nabi } = createNabiWith(picked, { doc: [p(['글'])] });
  ok('빌더 — createNabiWith 가 빌더를 그대로 받는다', nabi.getHtml().includes('글'));
  ok('빌더 — 좁힌 목록 밖 값은 커맨드도 안 돈다', !nabi.applyCommand('setTypeface', { v: 'mono' }));
  ok('빌더 — 좁힌 목록 안 값은 돈다', nabi.applyCommand('setTypeface', { v: 'serif' }));
}

{
  // .all() 뒤의 .use(w, options) 는 옵션만 얹는다 — 자리도 개수도 그대로다.
  // A .use(w, options) after .all() only layers on options — position and count are unchanged.
  const swapped = wings()
    .all()
    .use('tf', { values: ['sans'] })
    .build();
  eq(
    '빌더 — .all() 뒤의 .use 는 옵션만 얹는다(자리·개수 그대로)',
    [swapped.length, swapped.findIndex((wing) => wing.w === 'tf')],
    [defaultWings.length, defaultWings.findIndex((wing) => wing.w === 'tf')],
  );
  // 반대 순서 — 좁혀 둔 것이 .all() 에 씻기면 안 된다.
  // Reverse order — a narrowing already applied must not get washed out by .all().
  const kept = wings()
    .use('tf', { values: ['sans'] })
    .all()
    .build();
  const keptControl = kept.find((wing) => wing.w === 'tf')?.context?.controls[0] as {
    values: readonly { value: string }[];
  };
  eq('빌더 — 먼저 좁힌 것이 .all() 에 씻기지 않는다', keptControl.values.length, 1);
}

{
  // 객체 길 — 팩토리로 미리 지은 인스턴스가 공식 자리(차례)에 앉는다. 데모가 이 길을 쓴다.
  // The object path — an instance pre-built by the factory takes its official slot in the order. The demo uses this path.
  const demo = wings()
    .all()
    .use(makeUploadWing({ allowLocalUrls: true }))
    .build();
  eq(
    '빌더 — 팩토리 인스턴스(객체)가 공식 자리에 앉는다',
    demo.map((wing) => wing.w),
    defaultWings.map((wing) => wing.w),
  );
  ok('빌더 — 앉은 것은 기본이 아니라 그 인스턴스다', demo.find((wing) => wing.w === 'upload') !== uploadWing);

  // 커스텀 — 공식 뒤에, 들어온 차례로 선다. 등록도 그대로 지난다.
  // Custom — takes its place after the official wings, in insertion order, and still passes registration.
  const exNote: Wing = { w: 'exNote', place: 'tool' };
  const withCustom = wings().use('b').use(exNote).build();
  eq(
    '빌더 — 커스텀은 공식 뒤에 선다',
    withCustom.map((wing) => wing.w),
    ['b', 'exNote'],
  );
  ok('빌더 — 커스텀을 문 목록이 등록을 지난다', makeRegistry(withCustom).wingOf('exNote') === exNote);
  eq(
    '빌더 — 커스텀도 .drop 으로 뺀다',
    wings()
      .use('b')
      .use(exNote)
      .drop('exNote')
      .build()
      .map((wing) => wing.w),
    ['b'],
  );
}

done('wings2');
