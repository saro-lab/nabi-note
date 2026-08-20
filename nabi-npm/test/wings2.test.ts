// wings 2차 그물 — 물건 계열(img·youtube)과 도구 계열(upload·file·localHistory
// clearFormat), 그리고 mount 부속의 순수부(토크나이저·체크 토글).
// img — 값 거절(못 믿을 주소·목록 밖 폭)이 **스냅이 아니다**(옛 확실 버그 4 회귀)· 왕복
// youtube — 영상 id 패턴· 주소에서 id 되읽기· 왕복
// clearFormat — 마크 열하나 표 + 문단 속성 셋, **정렬된 제목**(옛 확실 버그 3 회귀)
//     래퍼문단의 정렬은 남는다, 첨부 링크는 불가침
// upload — 잠금 중 커맨드 거절· 배치 = undo 한 점· 이미지/첨부 갈래
// file — getJson → 파일 글자 → setJson 왕복 (가짜 저장소)
// localHistory — 스냅샷·목록·복원 (가짜 저장소)
// 토크나이저 — 언어 셋 스모크 + "이어 붙이면 원본" 불변식
import type { ElementNode, NabiNode } from '../src/schema/index.js';
import { positionExists, type Position } from '../src/doc/index.js';
import type { Selection } from '../src/caret/index.js';
import { createNabiWith, makeRegistry, type Wing } from '../src/wing/index.js';
import { defaultWings, makeTypefaceWing, wingNames, wings } from '../src/wings/index.js';
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
  extraWings,
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
import { mountFile, mountLocalHistory, mountUpload } from '../src/surface/index.js';
import { LOCALES, translate } from '../src/locale/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

// defaultWings 가 이제 extraWings 를 품는다(코디네이터 병합) — 그대로 쓴다.
const allWings = [...defaultWings];
const registry = makeRegistry(allWings);
const env = registry.env;

const el = (w: string, ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode =>
  a ? { w, a, ch } : { w, ch };
const p = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode => el('p', ch, a);
const at = (path: readonly number[], offset: number): Position => ({ path, offset });
const range = (a: Position, b: Position): Selection => ({ anchor: a, focus: b });

const make = (doc: readonly unknown[]) => createNabiWith(allWings, { doc, parseHtml: tinyHtml }).nabi;

// --- registry — 2차 묶음이 계약을 지난다 --------------------------------------------------------

ok('defaultWings + extraWings 가 makeRegistry 를 지난다', registry.wings.length === allWings.length);
eq('물건 둘이 조립을 갖는다', ['img', 'youtube'].every((w) => registry.builders[w] !== undefined), true);
eq('도구 wing 은 노드를 안 세운다(조립 없음)', [uploadWing, clearFormatWing].every((w) => w.toHtml === undefined), true);
eq('lumps 에 img·youtube 가 들었다', ['img', 'youtube'].every((w) => env.lumps.has(w)), true);
eq('voids 에 img·youtube 가 들었다', ['img', 'youtube'].every((w) => env.voids.has(w)), true);
eq('가속키 — 저장은 mod+s, 열기는 mod+o', [registry.wingOf('save')?.button?.accelerator, registry.wingOf('open')?.button?.accelerator], ['mod+s', 'mod+o']);
eq('2차 커맨드가 전부 등록됐다', ['insertImage', 'setImageWidth', 'insertYoutube', 'commitUpload', 'saveFile', 'openFile', 'restoreHistory', 'clearFormat', 'toggleCheck'].every((name) => registry.commands[name] !== undefined), true);
// 표면 부속은 선언이다 — DOM 에 손을 대는 셋이 리스너를 직접 안 달고 mount 에 맡긴다.
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

eq('img — 목록 안의 폭은 그대로 산다', imgOf([p([el('img', [], { src: '/a.png', w: '40' })])]), { src: '/a.png', w: '40' });
eq('img — 목록 밖 폭(55)은 **거절**된다(가까운 단계로 스냅하지 않는다)', imgOf([p([el('img', [], { src: '/a.png', w: '55' })])]), { src: '/a.png' });
eq('img — 폭 999 도 100 으로 깎이지 않고 거절된다', imgOf([p([el('img', [], { src: '/a.png', w: '999' })])]), { src: '/a.png' });
eq('img — 숫자 40 은 문자열 표기로 맞춰진다(값은 같다)', imgOf([p([el('img', [], { src: '/a.png', w: 40 })])]), { src: '/a.png', w: '40' });
eq('img — 정렬 attr 은 계약 밖이라 떨어진다 (정렬은 래퍼문단의 것)', imgOf([p([el('img', [], { src: '/a.png', a: 'center' })])]), { src: '/a.png' });
// 주소를 잃은 그림은 **노드째 사라진다** — 빈 껍데기를 남기면 HTML 입구는 안 들이는 것을
// JSON 입구만 유령으로 남기게 된다 (의 경로 대칭· boxObject 의 `requires`).
ok('img — javascript: 주소를 문 그림은 안 선다', imgOf([p([el('img', [], { src: 'javascript:alert(1)' })])]) === undefined);
ok('img — data:text/html 을 문 그림은 안 선다', imgOf([p([el('img', [], { src: 'data:text/html,<b>x' })])]) === undefined);
ok('img — 기본 wing 은 blob: 을 안 받는다', imgOf([p([el('img', [], { src: 'blob:https://x/1' })])]) === undefined);
eq('img — 낯선 attr(srcset)은 떨어진다', imgOf([p([el('img', [], { src: '/a.png', srcset: '/a2.png' })])]), { src: '/a.png' });
// 대체 글은 갈래에서 걷혔다 — 들어와도 안 실린다(깨진 그림 자리에 우리 그림이 선다).
eq('img — 대체 글은 안 실린다', imgOf([p([el('img', [], { src: '/a.png', alt: '설명' })])]), { src: '/a.png' });
eq('img — 폭 단계 목록은 30~100', [IMAGE_WIDTHS[0], IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1], IMAGE_WIDTHS.length], ['30', '100', 8]);

{
  // 로컬 주소는 옵션으로만 열린다 — 업로드 미리보기의 길이다.
  const local = createNabiWith([...defaultWings.filter((w) => w.w !== 'img'), makeImageWing({ allowLocalUrls: true })], {
    doc: [p([el('img', [], { src: 'blob:https://x/1' })])],
  }).nabi;
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
  ok('insertImage — 반환 자리는 반환 트리에 실재한다', positionExists(n.$doc(), n.getSelection().focus, env));
  ok('setImageWidth — 목록 밖 값은 안 돈다', !n.applyCommand('setImageWidth', { w: '55' }));
  ok('setImageWidth — 목록 안 값은 돈다', n.applyCommand('setImageWidth', { w: '70' }));
  eq('setImageWidth — 폭만 갈린다', (n.getJson() as { ch?: { a?: Record<string, unknown> }[] }[])[1]?.ch?.[0]?.a, { src: '/a.png', w: '70' });
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
ok('youtube — 짧은 id 를 문 영상은 안 선다', youtubeOf([p([el('youtube', [], { v: 'abc' })])]) === undefined);
ok('youtube — 주소를 그대로 담은 v 는 거절된다(값은 id 다)', youtubeOf([p([el('youtube', [], { v: 'https://youtu.be/6j-gQmaZ9Zk' })])]) === undefined);
eq('youtube — 목록 밖 폭(30)은 거절된다', youtubeOf([p([el('youtube', [], { v: '6j-gQmaZ9Zk', w: '30' })])]), { v: '6j-gQmaZ9Zk' });
eq('youtube — 폭 50 은 산다', youtubeOf([p([el('youtube', [], { v: '6j-gQmaZ9Zk', w: '50' })])]), { v: '6j-gQmaZ9Zk', w: '50' });
eq('youtube — 폭 단계는 50 부터다', [YOUTUBE_WIDTHS[0], YOUTUBE_WIDTHS.length], ['50', 6]);

// 상황 줄에 주소 고치기가 **없다** (주인 지시 2026-08-18). 그림이 이미 그렇게 서 있었고 영상만
// 혼자 갖고 있었다 — 물건의 주소는 고치는 것이 아니라 지우고 다시 놓는 것이다. 그림과 나란히
// 재서 "둘이 같은 규칙"임을 못박는다.
eq(
  '유튜브·그림 상황 줄 — 주소를 고치는 칸이 없다',
  [youtubeWing, imageWing].map((wing) => (wing.context?.controls ?? []).some((c) => c.kind === 'prompt')),
  [false, false],
);

{
  const n = make([p([])]);
  ok('insertYoutube — 아무 글자나 안 받는다', !n.applyCommand('insertYoutube', { v: '영상이아님' }));
  ok('insertYoutube — watch 주소에서 id 를 되읽는다', n.applyCommand('insertYoutube', { v: 'https://www.youtube.com/watch?v=6j-gQmaZ9Zk' }));
  // 넣는 순간 기본값이 트리에 적힌다 — 폭 70(그림보다 넓다: 영상은 제 크롬으로 한 겹 더
  // 줄어든다)에 래퍼문단은 가운데. 트리를 비워 두면 화면은 100% 로 서고 상황 줄의 눈금은
  // "값 없음" 자리에 앉아 서로 다른 %를 말한다.
  eq('insertYoutube — 빈 문단 자리를 쓴다(빈 줄이 안 남는다)', n.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'youtube', a: { v: '6j-gQmaZ9Zk', w: '70' }, ch: [] }] },
  ]);
  const n2 = make([p([])]);
  ok('insertYoutube — youtu.be 짧은 주소도 읽는다', n2.applyCommand('insertYoutube', { v: 'https://youtu.be/6j-gQmaZ9Zk' }));
  ok('insertYoutube — id 를 그대로 줘도 받는다', make([p([])]).applyCommand('insertYoutube', { v: '6j-gQmaZ9Zk' }));
}

// --- 왕복 — 트리 → HTML → 트리 -----------------------------------------------------------------

function roundTrip(name: string, doc: readonly unknown[]): void {
  const source = make(doc);
  const back = make([]);
  back.setHtml(source.getHtml());
  eq(`왕복 — ${name}`, back.getJson(), source.getJson());
}

roundTrip('이미지', [p([el('img', [], { src: '/logo/x.svg', alt: '설명', w: '40' })], { a: 'c' })]);
roundTrip('유튜브', [p([el('youtube', [], { v: '6j-gQmaZ9Zk', w: '60' })])]);
roundTrip('첨부 링크', [p([el('a', ['첨부.png'], { href: '/f/x.png', file: 'png' })])]);
roundTrip('정렬된 제목', [p(['제목'], { h: 2, a: 'c' })]);

// --- clearFormat — 마크 표 + 문단 속성 ----------------------------------------------------------

// 마크 하나만 걸린 문단을 짓고, 범위 전체에 서식 지우기를 돌린다.
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
  // 첨부 링크는 불가침이다 — 껍데기를 벗기면 되살릴 수 없는 죽은 평문이 된다 (old 규칙).
  const n = make([p([el('a', ['첨부.png'], { href: '/f/x.png', file: 'png' })])]);
  n.select(range(at([0], 0), at([0], 5)));
  n.applyCommand('clearFormat');
  eq('clearFormat — 첨부 링크(file)는 안 벗긴다', n.getJson(), [
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/x.png', file: 'png' }, ch: ['첨부.png'] }] },
  ]);
}

{
  // 옛 확실 버그 3 — 정렬된 제목을 못 지웠다. 제목이 문단 속성이 된 새 판에서는 한 켜로 진다.
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
  eq('clearFormat — 걸친 문단 전부가 대상이다', n.getJson(), [{ w: 'p', ch: ['앞'] }, { w: 'p', ch: ['뒤'] }]);
}

{
  // 래퍼문단의 정렬은 그 물건이 어디 서 있는가다 — 글 서식을 지웠다고 그림이 옮겨 다니면 안 된다.
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
  const release = n.$lock('upload');
  eq('잠금 — 누가 잠갔는지 이름으로 답한다', n.$lockedBy(), 'upload');
  ok('잠금 중 — 커맨드가 안 돈다', !n.applyCommand('insertText', { text: 'x' }));
  ok('잠금 중 — 되돌리기도 안 돈다', !n.undo());
  ok('잠금 중 — 문서 교체도 안 된다', !n.setJson([{ w: 'p', ch: ['다른 글'] }]));
  eq('잠금 중 — 문서는 한 글자도 안 변했다', n.getJson(), [{ w: 'p', ch: ['글'] }]);
  release();
  eq('잠금 풀림 — 이름이 사라진다', n.$lockedBy(), null);
  ok('잠금 풀림 — 커맨드가 다시 돈다', n.applyCommand('insertText', { text: 'x' }));
  release();
  eq('잠금 — 두 번 풀어도 탈이 없다', n.$lockedBy(), null);
}

{
  const n = make([p([])]);
  ok('commitUpload — 항목이 없으면 안 돈다', !n.applyCommand('commitUpload', { items: [] }));
  ok('commitUpload — 배치 하나가 커맨드 한 번이다', n.applyCommand('commitUpload', {
    items: [
      { kind: 'image', uri: '/f/a.png', name: 'a.png' },
      { kind: 'file', uri: '/f/b.pdf', name: 'b.pdf' },
    ],
  }));
  // 첨부의 글자는 **파일 이름이 아니다** — 부르는 쪽이 준 말이고, 안 주면 주소가 글자다
  // (커맨드는 말을 모른다). 자리표시자와 끝난 뒤의 링크가 같은 글자를 들어야 줄이 안 바뀐다.
  eq('commitUpload — 이미지는 img(폭 60·가운데), 그 밖은 첨부 링크가 된다', n.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/f/a.png', w: '60' }, ch: [] }] },
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/b.pdf', file: 'pdf' }, ch: ['/f/b.pdf'] }] },
  ]);
  {
    const named = make([{ w: 'p', ch: [] }]);
    named.applyCommand('commitUpload', { items: [{ kind: 'file', uri: '/f/b.pdf', name: 'b.pdf' }], label: '첨부파일' });
    eq('commitUpload — 넘겨받은 글자가 첨부의 글자다', named.getJson(), [
      { w: 'p', ch: [{ w: 'a', a: { href: '/f/b.pdf', file: 'pdf' }, ch: ['첨부파일'] }] },
    ]);
  }
  ok('commitUpload — 반환 자리는 반환 트리에 실재한다', positionExists(n.$doc(), n.getSelection().focus, env));
  ok('commitUpload — 되돌리기 한 번에 배치가 통째로 걷힌다', n.undo());
  eq('commitUpload — 배치 = undo 한 점', n.getJson(), [{ w: 'p', ch: [] }]);
}

{
  const n = make([p([])]);
  n.applyCommand('commitUpload', { items: [{ kind: 'file', uri: 'javascript:alert(1)', name: '나쁜.pdf' }] });
  eq('commitUpload — 못 믿을 주소는 이름만 남는 평문이 된다', n.getJson(), [{ w: 'p', ch: ['나쁜.pdf'] }]);
}

eq('acceptFiles — 큰 파일은 그 파일만 빠진다', acceptFiles(
  [{ name: 'a.png', size: 10, type: 'image/png' }, { name: 'b.png', size: 999, type: 'image/png' }],
  { maxFileSize: 100, maxTotalSize: 0 },
).map((f) => f.name), ['a.png']);
eq('acceptFiles — 총합 초과는 묶음 전체를 거절한다', acceptFiles(
  [{ name: 'a.png', size: 80, type: 'image/png' }, { name: 'b.png', size: 80, type: 'image/png' }],
  { maxFileSize: 0, maxTotalSize: 100 },
).length, 0);
eq('acceptFiles — 확장자 목록 밖은 빠진다', acceptFiles(
  [{ name: 'a.exe', size: 1, type: '' }, { name: 'b.png', size: 1, type: '' }],
  { extensions: ['png'] },
).map((f) => f.name), ['b.png']);
eq('acceptFiles — 빈 파일은 빠진다', acceptFiles([{ name: 'a.png', size: 0, type: '' }], {}).length, 0);
eq('extensionOf — 맨 앞의 점은 확장자가 아니다', [extensionOf('a.PNG'), extensionOf('.gitignore'), extensionOf('a')], ['png', '', '']);
eq('isImageFile — mime 이 없으면 확장자로 본다', [isImageFile({ name: 'a.png', size: 1, type: '' }), isImageFile({ name: 'a.pdf', size: 1, type: '' })], [true, false]);

{
  // mountUpload — 잠금이 걸린 채 도는지, 끝나고 한 번에 커밋되는지.
  const n = make([p([])]);
  const files: UploadFile[] = [
    { name: 'a.png', size: 10, type: 'image/png' },
    { name: 'b.pdf', size: 10, type: 'application/pdf' },
  ];
  let lockedDuringUpload: string | null = 'not-run';
  const mount = mountUpload({
    nabi: n,
    uploader: (task) => {
      lockedDuringUpload = n.$lockedBy();
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
  eq('mountUpload — 끝나면 잠금이 풀린다', n.$lockedBy(), null);
  // mountUpload 는 로케일을 아는 자리라 첨부의 말을 골라 커맨드에 넘긴다 (기본 en).
  eq('mountUpload — 배치가 한 번에 커밋됐다', n.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/f/a.png', w: '60' }, ch: [] }] },
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/b.pdf', file: 'pdf' }, ch: ['Attachment'] }] },
  ]);
  ok('mountUpload — 되돌리기 한 번이면 배치 전이다', n.undo());
  eq('mountUpload — undo 한 점', n.getJson(), [{ w: 'p', ch: [] }]);
  mount.unmount();
}

// --- upload — 오류는 전부 toast 로 (084 ⑦) ------------------------------------------------------

// 예전에 오류가 나가던 세 길(인라인 쪽지·`catch {}` 의 침묵·`return` 하나의 침묵)이 전부 이
// 한 문으로 모였는지 잰다. 화면은 안 세운다 — toast 는 인스턴스의 문이라 DOM 없이도 잡힌다.
function toasting(doc: readonly unknown[]): { nabi: ReturnType<typeof make>; said: string[] } {
  const said: string[] = [];
  const nabi = createNabiWith(allWings, {
    doc,
    parseHtml: tinyHtml,
    toast: (level, message) => said.push(`${level}:${message}`),
  }).nabi;
  return { nabi, said };
}

const png: UploadFile = { name: 'a.png', size: 10, type: 'image/png' };
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

{
  // ① 거절 — 호스트가 안 받으면 우리가 말한다. 급은 warn(다른 파일을 고르면 되는 일이다).
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
  const { nabi, said } = toasting([p([])]);
  const mount = mountUpload({ nabi, uploader: () => new Promise(() => undefined) });
  mount.take([png]);
  mount.take([{ name: 'b.png', size: 10, type: 'image/png' }]);
  eq('업로드 — 도는 중에 온 파일은 말과 함께 무시된다', said, [`warn:${translate('upload.busy', 'en')}`]);
  mount.unmount();
}

{
  // ④ 전송이 터진 파일 — 예전에는 `catch {}` 가 삼켜 아무 데도 안 남았다. 급은 error.
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
  const { nabi, said } = toasting([p([])]);
  const mount = mountUpload({ nabi, uploader: () => Promise.resolve(null) });
  mount.take([png]);
  mount.cancel();
  await tick();
  eq('업로드 — 취소된 배치는 오류로 말하지 않는다', said, []);
  mount.unmount();
}

// --- file — `.nabi` 왕복 --------------------------------------------------------------------

// 판 이름은 **나비 자신의 판**이고 앞의 둘만 쓴다 (`1.2.3` → `1.2`) — 셋째 자리는 고친 것을
// 세는 자리라 파일 모양과 상관이 없다.
eq('writeNabiFile — 판 이름과 몸이 함께 나간다', JSON.parse(writeNabiFile([1])), { version: NABI_FILE_VERSION, body: [1] });
eq('판 이름은 나비 판의 앞 둘이다', NABI_FILE_VERSION, NABI_VERSION.split('.').slice(0, 2).join('.'));

// **읽을 때는 판을 안 본다** (2026-08-17) — 거를 판이 아직 하나도 없다. 문을 세우면
// 읽을 수 있는 파일을 우리가 막는다. 여기서 그 문이 몰래 생기는 것을 잡는다.
eq('읽기: 앞선 판도 그대로 읽는다', readNabiFile(JSON.stringify({ version: '99.9', body: [1] })), [1]);
eq('읽기: 옛 판도 그대로 읽는다', readNabiFile(JSON.stringify({ version: '0.0', body: [1] })), [1]);
eq('읽기: 판이 아예 없어도 읽는다', readNabiFile(JSON.stringify({ body: [1] })), [1]);
eq('읽기: 판이 글자가 아니어도 몸만 본다', readNabiFile(JSON.stringify({ version: 7, body: [1] })), [1]);
eq('읽기: 나비트리를 통째로 담은 파일(손으로 만든 것)도 읽는다', readNabiFile(JSON.stringify([1])), [1]);
eq('읽기: 모양이 아니면 null — 거기서만 거절한다', readNabiFile('{'), null);
eq('readNabiFile — 몸만 되읽는다', readNabiFile(writeNabiFile([{ w: 'p', ch: ['글'] }])), [{ w: 'p', ch: ['글'] }]);
eq('readNabiFile — 나비트리를 통째로 담은 옛 파일도 읽는다', readNabiFile('[{"w":"p","ch":["글"]}]'), [{ w: 'p', ch: ['글'] }]);
eq('readNabiFile — 형식이 아니면 null 이다(던지지 않는다)', readNabiFile('not json'), null);

{
  const source = make([p(['저장할 글'], { h: 2 }), p([el('img', [], { src: '/a.png', w: '40' })])]);
  let saved = '';
  let savedName = '';
  const store = {
    save({ name, text }: { name: string; text: string }): void {
      savedName = name;
      saved = text;
    },
    open: (): Promise<string | null> => Promise.resolve(saved),
  };
  const mount = mountFile({ nabi: source, store, name: () => '메모' });
  ok('mountFile — saveFile 커맨드가 저장소로 이어진다', source.applyCommand('saveFile') === false); // 문서를 안 바꾸므로 문은 false 다
  ok('mountFile — 파일 이름은 날짜 + 이름 + 확장자다', /^\d{4}-\d{2}-\d{2} 메모\.nabi$/.test(savedName));
  ok('mountFile — 저장한 글자가 `.nabi` 모양이다', readNabiFile(saved) !== null);

  // **저장하면 그 문서가 기준선이 된다** — 저장 직후에는 안 바뀐 문서이고, 그 뒤에 친 글자부터
  // 다시 바뀐 것이다. 이것이 없으면 열 때마다 "안 저장한 글이 있다" 를 늘 묻는다.
  ok('mountFile — 저장 직후에는 안 바뀐 문서다', !source.isChanged());
  source.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  source.applyCommand('insertText', { text: 'x' });
  ok('mountFile — 저장 뒤에 친 글자는 다시 바뀐 것이다', source.isChanged());

  // 이름을 주면 그것으로 — 판(prompt)이 준 이름이 이 길로 온다.
  source.applyCommand('saveFile', { name: '2026-08-17 내 글' });
  eq('mountFile — 준 이름에 확장자만 붙는다', savedName, '2026-08-17 내 글.nabi');

  // 저장 단추와 ⌘S 는 **다른 답**을 든다 — 단추는 이름을 묻고, 가속키는 그대로 저장한다.
  eq('save — 단추는 이름을 묻는다', saveFileWing.button?.action?.kind, 'prompt');
  eq('save — 가속키는 안 묻는다', saveFileWing.button?.accelerated?.kind, 'command');
  const field = (saveFileWing.button?.action as { fields: readonly { initial?: () => string }[] }).fields[0];
  ok('save — 칸은 오늘 날짜만 들고 열린다', field?.initial?.() === `${today()} `);

  const target = make([]);
  const opened = mountFile({ nabi: target, store });
  eq('mountFile — 연 문서가 저장한 문서와 같다 (getJson → setJson 왕복)', await opened.open(), true);
  eq('mountFile — 왕복한 값이 그대로다', target.getJson(), source.getJson());
  ok('mountFile — 취소(null)는 오류가 아니다', (await mountFile({ nabi: target, store: { save: () => {}, open: () => Promise.resolve(null) } }).open()) === false);

  // **쓰던 글이 있으면 먼저 묻는다.** 묻는 길은 인스턴스의 것이라 호스트가 제 상자를 끼운다.
  {
    const asked: string[] = [];
    const dirty = createNabiWith(allWings, {
      doc: [{ w: 'p', ch: ['쓰던 글'] }],
      ask: { message: () => {}, confirm: (text) => { asked.push(text); return false; } },
    }).nabi;
    const mounted = mountFile({ nabi: dirty, store });
    dirty.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
    dirty.applyCommand('insertText', { text: 'x' });
    const kept = dirty.getJson();
    eq('mountFile — 안 저장한 글이 있으면 열기가 묻는다', await mounted.open(), false);
    eq('mountFile — 물은 것은 한 번', asked.length, 1);
    eq('mountFile — 아니오면 쓰던 글이 그대로다', dirty.getJson(), kept);
  }
  // 아무것도 안 끼운 인스턴스는 **아무도 예라고 안 했다** 로 답한다 — 물을 사람이 없다고
  // 쓰던 글을 버리지 않는다.
  {
    const silent = make([{ w: 'p', ch: ['글'] }]);
    const mounted = mountFile({ nabi: silent, store });
    silent.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
    silent.applyCommand('insertText', { text: 'x' });
    eq('mountFile — 묻는 길이 없으면 안 연다', await mounted.open(), false);
  }

  // 드롭·붙여넣기로 온 파일 — `.nabi` 면 열고, 아니면 false 로 답해 업로드로 흘려보낸다.
  const dropped = make([]);
  const drop = mountFile({ nabi: dropped, store });
  eq('mountFile — 우리 파일이 아니면 안 연다 (업로드의 몫이다)', await drop.takeFiles([
    { name: 'a.png', text: () => Promise.resolve('') },
  ]), false);
  eq('mountFile — 떨어뜨린 `.nabi` 는 열린다', await drop.takeFiles([
    { name: '메모.nabi', text: () => Promise.resolve(saved) },
  ]), true);
  eq('mountFile — 드롭으로 연 문서가 저장한 문서와 같다', dropped.getJson(), source.getJson());
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
  // 지우기는 되돌리기가 못 닿는다 — 그래서 기록 판이 먼저 묻는다. 그 물음이 **인스턴스의 것**을
  // 지나야 한다: 부속이 `nabi.$ask` 를 그대로 물려주지 않으면 판이 브라우저 상자로 새거나
  // 아무것도 안 물어 보고 지운다. 여기서 그 줄이 끊기지 않았는지만 잡는다.
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
  const n = createNabiWith(allWings, { doc: [p(['글'])], parseHtml: tinyHtml, ask }).nabi;
  const history = mountLocalHistory({ nabi: n, storage, minIntervalMs: 0 });
  eq('localHistory — 묻는 길이 인스턴스의 것 그대로다', history.ask, n.$ask);
  eq('localHistory — 물으면 그 상자가 답한다', history.ask.confirm('지울까요?'), true);
  eq('localHistory — 물음이 그 상자에 닿았다', asked, ['지울까요?']);
  history.unmount();

  // 안 주면 침묵이 답한다 — **"아니오"** 다. 물을 사람이 없다고 지우면 안 된다.
  const quiet = mountLocalHistory({ nabi: make([p(['글'])]), storage, minIntervalMs: 0 });
  eq('localHistory — 상자를 안 주면 답은 "아니오"', quiet.ask.confirm('지울까요?'), false);
  quiet.unmount();
}

// 두 물음이 열넷의 말을 다 든다 — 하나라도 빠지면 그 언어에서 영어가 뜬다.
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

  // 084 ⑤ — 막힌 자리(`file://`)를 **어떻게 알아내는가**. 읽기 한 번이 그 잣대다: 이름이 있는
  // 것과 손이 닿는 것이 다르고, 안 닿는 자리에서는 판을 여는 대신 한 마디를 해야 한다.
  eq('historyStorageAlive — 읽다가 던지는 저장소는 죽은 것이다', historyStorageAlive(broken), false);
  eq('historyStorageAlive — 저장소가 아예 없으면 죽은 것이다', historyStorageAlive(null), false);
  eq('historyStorageAlive — 읽히면 살아 있다', historyStorageAlive(fakeStorage()), true);
  eq('localHistory — 막힌 저장소는 부속도 죽었다고 답한다', history.alive(), false);
  eq('localHistory — 알리는 길도 인스턴스의 것 그대로다', history.toast, n.$toast);
  history.unmount();

  // 저장소가 아예 없는 자리에서도 **부속은 선다** — 그래야 wing 단추가 판으로 이어지고, 판이
  // 왜 안 열리는지 말한다. 백단(자동 스냅샷)은 그동안 조용하다.
  const nowhere = mountLocalHistory({ nabi: make([p(['글'])]), storage: null, minIntervalMs: 0 });
  eq('localHistory — 저장소가 null 이어도 세워진다(죽었다고 답할 뿐)', nowhere.alive(), false);
  eq('localHistory — null 저장소의 스냅샷은 조용히 false 다', nowhere.snapshot(), false);
  eq('localHistory — null 저장소의 목록은 빈 목록이다', nowhere.list().length, 0);
  eq('localHistory — null 저장소는 지우기도 조용히 false 다', [nowhere.forget(), nowhere.clear()], [false, false]);
  nowhere.unmount();
}

// 판이 무엇을 보이는가 — 셋뿐이고 DOM 이 없다. "없음"과 "못 엶"은 다른 말이라 갈라 둔다.
eq('historyView — 저장소가 막혔으면 blocked (기록 없음이 아니다)', historyView(false, []), 'blocked');
eq('historyView — 살아 있는데 한 줄도 없으면 empty', historyView(true, []), 'empty');
eq('historyView — 줄이 있으면 rows', historyView(true, [{ sessionId: 's', summary: '', body: '[]', savedAt: 1, createdAt: 1 }]), 'rows');

// --- 자세한 시각 — 로케일이 자리 순서를 정한다 (084 ⑤) ------------------------------------------

{
  const born = new Date(2026, 7, 18, 15, 4, 5).getTime();
  ok('exactTime — 독일은 일.월.년 이고 24시간제다', exactTime(born, 'de').startsWith('18.08.2026'));
  ok('exactTime — 미국은 월/일/년 이다', exactTime(born, 'en-US').startsWith('08/18/2026'));
  ok('exactTime — 일본은 년/월/일 이다', exactTime(born, 'ja').startsWith('2026/08/18'));
  // 지역을 떼면 안 되는 까닭 — 같은 영어인데 8월 18일의 자리가 뒤바뀐다.
  ok('exactTime — 지역까지 봐야 한다 (en-GB ≠ en-US)', exactTime(born, 'en-GB') !== exactTime(born, 'en-US'));
  // 초까지 든다는 것을 숫자 모양으로 안 잰다 — 벵골어는 제 숫자를 쓰고 인도네시아어는 시각을
  // 점으로 나눈다. 1초를 옮겼을 때 글자가 달라지는가로 잰다.
  ok('exactTime — 열넷 어디서도 초까지 든다', LOCALES.every((code) => exactTime(born, code) !== exactTime(born + 1000, code)));
  ok('exactTime — 모양이 아닌 로케일도 시각을 잃지 않는다', exactTime(born, '!!').includes('2026'));
}

// 만든 때는 고친 때와 벌어졌을 때만 따로 말한다 — 갓 선 줄은 둘이 같은 순간이다.
{
  const row = (createdAt: number, savedAt: number) => ({ sessionId: 's', summary: '', body: '[]', savedAt, createdAt });
  eq('showsCreated — 갓 선 줄은 만든 때를 따로 안 적는다', showsCreated(row(1000, 1000)), false);
  eq('showsCreated — 1분이 벌어지면 따로 적는다', showsCreated(row(1000, 1000 + 60_000)), true);
}

// 막힌 자리의 안내는 **무엇을 해야 하는지**까지 든 말이라 열넷을 다 채운다.
for (const key of ['history.blocked', 'upload.failed', 'upload.failed_many', 'upload.busy']) {
  const bare = LOCALES.filter((code) => code !== 'en' && translate(key, code) === translate(key, 'en'));
  eq(`사전 — ${key} 가 열넷의 말을 다 든다`, bare, []);
}

// --- 토크나이저 — 언어 스모크 + 이어 붙이기 불변식 -----------------------------------------------

const joined = (code: string, lang: string): string => tokenize(code, lang).reduce((sum, t) => sum + t.text, '');
const typesOf = (code: string, lang: string): string[] =>
  tokenize(code, lang).filter((t) => t.type !== undefined).map((t) => t.type as string);

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
ok('토크나이저 — ts 는 글자열과 주석을 가른다', ['string', 'comment'].every((t) => typesOf('// 주석\nconst s = "글"', 'ts').includes(t)));
ok('토크나이저 — json 은 글자열과 수를 안다', ['string', 'number'].every((t) => typesOf('{"a": 1}', 'json').includes(t)));
ok('토크나이저 — css 는 주석을 안다', typesOf('.a { /* c */ }', 'css').includes('comment'));
ok('토크나이저 — html 은 태그와 속성을 안다', ['tag', 'attribute'].every((t) => typesOf('<a href="/x">글</a>', 'html').includes(t)));
eq('토크나이저 — 닫히지 않은 글자열도 글자를 안 잃는다', joined('const s = "열린 채', 'ts'), 'const s = "열린 채');
eq('토크나이저 — 빈 글은 빈 목록이다', tokenize('', 'ts').length, 0);
eq('usableTokens — 원본과 다른 답은 평문 한 덩이가 된다', usableTokens([{ text: '다른 글' }], '원본'), [{ text: '원본' }]);
eq('usableTokens — 모르는 토큰 이름은 맨 글자로 떨어진다', usableTokens([{ text: 'x', type: '낯선' }], 'x'), [{ text: 'x' }]);

// `tokensFor` — 편집 화면과 보는 쪽이 **함께 쓰는 한 줄**이다 (088). 둘이 각자 이 줄을 적으면
// 언젠가 갈리고, 그러면 미리보기의 색과 편집기의 색이 다른 답을 낸다.
eq('tokensFor — 하이라이터가 없으면 내장 토크나이저가 답한다', tokensFor('const', 'ts'), tokenize('const', 'ts'));
eq('tokensFor — 호스트의 답을 그대로 쓴다', tokensFor('ab', null, () => [{ text: 'ab', type: 'string' }]), [{ text: 'ab', type: 'string' }]);
eq('tokensFor — null 을 답하면 내장으로 떨어진다', tokensFor('const', 'ts', () => null), tokenize('const', 'ts'));
eq('tokensFor — 던지는 하이라이터도 색칠만 포기한다', tokensFor('const', 'ts', () => { throw new Error('죽었다'); }), tokenize('const', 'ts'));
eq('tokensFor — 원본과 어긋난 답은 평문 한 덩이다', tokensFor('원본', null, () => [{ text: '다른 글' }]), [{ text: '원본' }]);

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

  const id = ((n.$doc()[0]?.ch[0] as ElementNode).ch[0] as ElementNode)._id;
  ok('toggleCheck — 화면이 짚어 준 _id 로도 찾는다 (체크 띠 클릭의 길)', n.applyCommand('toggleCheck', { id, ck: 0 }));
  ok('toggleCheck — 모르는 id 는 안 돈다', !n.applyCommand('toggleCheck', { id: 'nope' }));
}

{
  // 옛 확실 버그 2 — `[x] ` 오토포맷의 체크 상태. 규격 자체는 wings1 이 재고 있어 여기서는 확인만이다.
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

// --- wing 고르기 빌더 (087) — 다섯 가지 잘못이 전부, 고칠 방법과 함께 죽는가 --------------------

// 죽되 **말에 고칠 방법이 실렸는지**까지 본다 — "잘못됐다" 만으로는 CDN 사용자를 못 지킨다.
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
  // 차례 — .all() 은 defaultWings 와 같은 차례여야 한다. 같은 인스턴스인 것까지 본다:
  // 목록의 원본이 한 자리(CATALOG)라는 약속이 이 동일성으로 지켜진다.
  const all = wings().all().build();
  ok(
    '빌더 — .all() 은 defaultWings 와 같은 차례·같은 인스턴스다',
    all.length === defaultWings.length && all.every((wing, i) => wing === defaultWings[i]),
    all.map((wing) => wing.w).join('·'),
  );
  eq('빌더 — wingNames() 가 defaultWings 의 w 차례 그대로다', wingNames(), defaultWings.map((wing) => wing.w));
  eq('빌더 — .all() 없이는 빈 손이다', wings().build(), []);
}

// ① 이름 오타 — 그 자리에서 죽고, "혹시 이것?" 과 전체 목록이 실린다.
dies('빌더 ① — 이름 오타는 부른 그 줄에서 죽는다', () => wings().use('bod' as never), [
  "없는 wing: 'bod'",
  "혹시 'b'(굵게·Bold)?",
  '받는 이름: b·i·u·s·sup·sub·tf',
]);
dies('빌더 ① — 커스텀을 이름으로 부르면 객체의 길을 알려 준다', () => wings().use('exNote' as never), [
  '커스텀 wing 은 객체로 넣는다',
]);

// ② 옵션 키 오타 — 가장 조용히 새는 자리. 모르는 키는 죽고 받는 키가 실린다.
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
dies('빌더 ② — allowLocalUrls 에 불리언 아닌 것을 주면 죽는다', () => wings().use('img', { allowLocalUrls: 'yes' } as never), [
  "'img' 의 allowLocalUrls 는 true/false 다",
]);

// ③ 목록 밖 값 — 팩토리(계약의 원본)가 던지고, 받는 목록이 실린다.
dies('빌더 ③ — 목록 밖 값은 죽고 받는 목록이 실린다', () => wings().use('tf', { values: ['sans', 'georgia'] }), [
  "'tf' 가 모르는 값: 'georgia'",
  '받는 것: sans·serif·mono·cursive',
]);
dies('빌더 ③ — 빈 values 는 죽고 .drop 의 길을 알려 준다', () => wings().use('tf', { values: [] }), [".drop('tf')"]);
dies('팩토리 직접 호출도 같은 계약이다', () => makeTypefaceWing({ values: ['x'] }), ["'tf' 가 모르는 값: 'x'"]);

// ④ ex 아닌 커스텀 — 고친 이름을 그대로 보여 준다.
dies('빌더 ④ — ex 아닌 커스텀은 죽고 고친 이름을 보여 준다', () => wings().use({ w: 'note', place: 'tool' } as Wing), [
  "'note' → 'exNote'",
]);
dies('빌더 ④ — 객체에 옵션을 얹으면 죽는다(조용히 버리지 않는다)', () => (wings() as { use(a: unknown, b: unknown): unknown }).use(uploadWing, { allowLocalUrls: true }), [
  '객체에는 옵션을 못 얹는다',
]);
dies('빌더 — 이름도 객체도 아닌 것은 죽는다', () => wings().use(42 as never), ['이름(글자열) 또는 wing 객체']);

// ⑤ 의존성 깨는 drop — 마지막 딛는 자리를 빼면 죽고, 함께 빼는 길이 실린다.
dies('빌더 ⑤ — 마지막 딛는 wing 을 빼면 죽는다', () => wings().all().drop('img').drop('a'), [
  "'a' 를 빼면 'upload' 가 설 수 없다",
  'img·a 중 하나가 필요하다',
  ".drop('upload')",
]);
dies('빌더 ⑤ — 안 든 것을 빼면 죽는다(조용한 no-op 이 아니다)', () => wings().drop('upload'), [
  '지금 목록에 없다',
]);

{
  // 의존성 — 더할 때는 조용히 끌어오고(img 가 딸려 온다), 하나가 남아 있으면 빼도 산다.
  const up = wings().use('upload').build();
  eq('빌더 — upload 을 부르면 딛는 img 가 조용히 딸려 온다', up.map((wing) => wing.w), ['img', 'upload']);
  ok('빌더 — 딸려 온 목록이 등록(makeRegistry)을 그대로 지난다', makeRegistry(up).wings.length === 2);
  const noImg = wings().all().drop('img').build();
  ok(
    '빌더 — a 가 남아 있으면 img 를 빼도 upload 이 산다',
    !noImg.some((wing) => wing.w === 'img') && noImg.some((wing) => wing.w === 'upload'),
  );
}

{
  // 값 좁히기 — 상황 줄의 칸이 실제로 줄고, 좁힌 목록 밖 값은 커맨드도 안 돈다.
  // 빌더를 createNabiWith 에 **그대로** 넘긴다 — .build() 없이.
  const picked = wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] });
  const tf = picked.build().find((wing) => wing.w === 'tf');
  const control = tf?.context?.controls[0] as { values: readonly { value: string }[] } | undefined;
  eq('빌더 — 값 좁히기가 상황 줄의 칸을 실제로 줄인다', control?.values.map((choice) => choice.value), ['sans', 'serif']);

  const { nabi } = createNabiWith(picked, { doc: [p(['글'])] });
  ok('빌더 — createNabiWith 가 빌더를 그대로 받는다', nabi.getHtml().includes('글'));
  ok('빌더 — 좁힌 목록 밖 값은 커맨드도 안 돈다', !nabi.applyCommand('setTypeface', { v: 'mono' }));
  ok('빌더 — 좁힌 목록 안 값은 돈다', nabi.applyCommand('setTypeface', { v: 'serif' }));
}

{
  // .all() 뒤의 .use(w, options) 는 옵션만 얹는다 — 자리도 개수도 그대로다(주인의 확정 3).
  const swapped = wings().all().use('tf', { values: ['sans'] }).build();
  eq(
    '빌더 — .all() 뒤의 .use 는 옵션만 얹는다(자리·개수 그대로)',
    [swapped.length, swapped.findIndex((wing) => wing.w === 'tf')],
    [defaultWings.length, defaultWings.findIndex((wing) => wing.w === 'tf')],
  );
  // 반대 순서 — 좁혀 둔 것이 .all() 에 씻기면 안 된다.
  const kept = wings().use('tf', { values: ['sans'] }).all().build();
  const keptControl = kept.find((wing) => wing.w === 'tf')?.context?.controls[0] as { values: readonly { value: string }[] };
  eq('빌더 — 먼저 좁힌 것이 .all() 에 씻기지 않는다', keptControl.values.length, 1);
}

{
  // 객체 길 — 팩토리로 미리 지은 인스턴스가 공식 자리(차례)에 앉는다. 데모가 이 길을 쓴다.
  const demo = wings().all().use(makeUploadWing({ allowLocalUrls: true })).build();
  eq('빌더 — 팩토리 인스턴스(객체)가 공식 자리에 앉는다', demo.map((wing) => wing.w), defaultWings.map((wing) => wing.w));
  ok('빌더 — 앉은 것은 기본이 아니라 그 인스턴스다', demo.find((wing) => wing.w === 'upload') !== uploadWing);

  // 커스텀 — 공식 뒤에, 들어온 차례로 선다. 등록도 그대로 지난다.
  const exNote: Wing = { w: 'exNote', place: 'tool' };
  const withCustom = wings().use('b').use(exNote).build();
  eq('빌더 — 커스텀은 공식 뒤에 선다', withCustom.map((wing) => wing.w), ['b', 'exNote']);
  ok('빌더 — 커스텀을 문 목록이 등록을 지난다', makeRegistry(withCustom).wingOf('exNote') === exNote);
  eq('빌더 — 커스텀도 .drop 으로 뺀다', wings().use('b').use(exNote).drop('exNote').build().map((wing) => wing.w), ['b']);
}

done('wings2');
