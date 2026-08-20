// wings 1차 그물 — 글 계열 기본 wing 전부.
// wing 마다 왕복(트리 → HTML → 트리) — 조립과 들여오기가 같은 값을 말하는가
// 리스트 표: backspace(첫·가운데·유일 항목, 3종 공통)· tab/shiftTab· 엔터(분할·탈출)
// 값 마크: 목록 밖 값 거절(커맨드·들여오기)· 같은 값 토글· 다른 값 교체
// 문단 속성: 제목 currentValue· 정렬은 래퍼문단에도· 드롭캡은 분할 때 첫 글자 쪽
// 오토포맷 규칙 매칭 표(패턴만 — 디스패처는 09)· registry fail-fast
import { cocoon, type ElementNode, type NabiDoc, type NabiNode } from '../src/schema/index.js';
import { positionExists, type Position } from '../src/doc/index.js';
import { caretAt, type Selection } from '../src/caret/index.js';
import { createNabiWith, makeRegistry, routeKey, simpleMark, type Wing } from '../src/wing/index.js';
import {
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
  TYPEFACES,
  alignWing,
  codeWing,
  defaultWings,
  detailsWing,
  headingWing,
  linkWing,
} from '../src/wings/index.js';
import { attachFileLink } from '../src/wings/link/attach.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

const registry = makeRegistry(defaultWings);
const env = registry.env;

const el = (w: string, ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode =>
  a ? { w, a, ch } : { w, ch };
const p = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode => el('p', ch, a);
const at = (path: readonly number[], offset: number): Position => ({ path, offset });
const range = (a: Position, b: Position): Selection => ({ anchor: a, focus: b });

const make = (doc: readonly unknown[]) => createNabiWith(defaultWings, { doc, parseHtml: tinyHtml }).nabi;

function throws(name: string, fn: () => void, wants?: string): void {
  try {
    fn();
    ok(name, false, '던지지 않았다');
  } catch (error) {
    const message = (error as Error).message;
    ok(name, wants === undefined || message.includes(wants), `받은 메시지: ${message}`);
  }
}

// --- registry — 기본 묶음 전체가 계약을 지난다 -------------------------------------------------

ok('defaultWings 가 makeRegistry 를 지난다', registry.wings.length === defaultWings.length);
eq('마크·값 마크·링크가 조립을 갖는다', ['b', 'i', 'u', 's', 'sub', 'sup', 'hl', 'tc', 'fs', 'tf', 'a'].every((w) => registry.builders[w] !== undefined), true);
eq('컨테이너와 부품이 조립을 갖는다', ['ul', 'li', 'ol', 'oli', 'tl', 'tli', 'quote', 'details', 'summary', 'code', 'hr'].every((w) => registry.builders[w] !== undefined), true);
eq('문단 속성 wing 은 노드를 안 세운다(조립 없음)', [headingWing, alignWing].every((w) => w.toHtml === undefined), true);
eq('lumps 접힘 — 물건 전부 (병합 묶음: 표·이미지·유튜브 포함)', [...env.lumps].sort(), ['code', 'details', 'hr', 'img', 'ol', 'quote', 'table', 'tl', 'ul', 'youtube']);
eq('voids 접힘 — 블록 단말 셋', [...env.voids].sort(), ['hr', 'img', 'youtube']);
eq('inlineHolders 접힘 — 접기 제목과 코드', [...env.inlineHolders].sort(), ['code', 'summary']);
eq('boolAttrs 접힘 — 체크·펼침·표 제목', [...env.boolAttrs].sort(), ['ck', 'o', 'th']);
eq('escapes 접힘 — 링크도 Escape 를 선언한다', registry.escapes.get('Escape')?.includes('a'), true);
ok('ownerOf — 항목은 제 리스트 wing 의 것', registry.ownerOf('tli')?.w === 'tl' && registry.ownerOf('oli')?.w === 'ol');
ok('ownerOf — 접기 제목은 접기 wing 의 것', registry.ownerOf('summary') === detailsWing);
eq('정렬 wing 의 이름은 align, 키는 a (링크 wing 이 이름 a 를 쓴다)', [alignWing.w, alignWing.attrKey], ['align', 'a']);
throws('예약어를 얹으면 묶음째 죽는다', () => makeRegistry([...defaultWings, simpleMark({ w: 'p' })]), '예약어');
throws('같은 이름을 두 번 얹으면 죽는다', () => makeRegistry([...defaultWings, simpleMark({ w: 'b' })]), '두 번');
throws('이름 규칙 어긴 커맨드는 죽는다', () =>
  makeRegistry([...defaultWings, {...simpleMark({ w: 'z' }), commands: { paint: () => null } } as Wing]), '이름 규칙');

// --- 왕복 — wing 마다 트리 → HTML → 트리 -------------------------------------------------------

function roundTrip(name: string, doc: readonly unknown[]): void {
  const source = make(doc);
  const html = source.getHtml();
  const back = make([]);
  back.setHtml(html);
  eq(`왕복 — ${name}`, back.getJson(), source.getJson());
}

roundTrip('마크 여섯', [
  p(['맨글 ', el('b', ['굵게']), el('i', ['기울임']), el('u', ['밑줄']), el('s', ['취소선']), el('sub', ['아래']), el('sup', ['위'])]),
]);
roundTrip('형광펜·글자색', [p([el('hl', ['형광'], { c: 'yellow' }), el('tc', ['글자색'], { c: 'coral' })])]);
roundTrip('크기·서체', [p([el('fs', ['크게'], { v: 'lg' }), el('tf', ['세리프'], { v: 'serif' })])]);
roundTrip('링크와 첨부', [
  p([el('a', ['링크'], { href: 'https://example.com/' }), el('a', ['첨부'], { href: '/f/x.png', file: '첨부.png' })]),
]);
roundTrip('제목·정렬·드롭캡', [p(['제목글'], { h: 2, a: 'c' }), p(['드롭캡'], { dc: 1 })]);
roundTrip('라인', [p(['첫 줄', el('br'), '둘째 줄'])]);
roundTrip('글머리 목록', [el('ul', [el('li', [p(['하나'])]), el('li', [p(['둘'])])])]);
roundTrip('번호 목록', [el('ol', [el('oli', [p(['하나'])])])]);
roundTrip('체크 목록', [
  el('tl', [el('tli', [p(['한 일'])], { ck: 1 }), el('tli', [p(['안 한 일'])])]),
]);
roundTrip('중첩 목록', [
  el('ul', [el('li', [p(['위']), p([el('ul', [el('li', [p(['속'])])])])])]),
]);
roundTrip('인용', [el('quote', [p(['인용 글']), p(['둘째 줄'])])]);
roundTrip('접기(펼침)', [el('details', [el('summary', ['제목']), p(['속 글'])], { o: 1 })]);
roundTrip('접기(접힘)', [el('details', [el('summary', ['제목']), p(['속 글'])])]);
roundTrip('코드', [el('code', ['const x = 1', el('br'), 'const y = 2'], { lang: 'ts' })]);
roundTrip('구분선', [el('hr')]);

// --- 리스트 — 키 표 (3종 공통) -----------------------------------------------------------------

interface Family {
  readonly list: string;
  readonly item: string;
}
const FAMILIES: readonly Family[] = [
  { list: 'ul', item: 'li' },
  { list: 'ol', item: 'oli' },
  { list: 'tl', item: 'tli' },
];

// [0]=앞 문단, [1]=래퍼문단(리스트) — 항목 i 의 문단은 [1,0,i,0] 이다.
const listDoc = (fam: Family, count: number): NabiDoc =>
  cocoon(
    [p(['앞']), el(fam.list, Array.from({ length: count }, (_, i) => el(fam.item, [p([`항목${i + 1}`])])))],
    env,
);

const press = (name: 'backspace' | 'delete' | 'tab' | 'shiftTab' | 'enter', doc: NabiDoc, sel: Selection) =>
  routeKey({ key: name }, doc, sel, env, registry);

for (const fam of FAMILIES) {
  {
    const r = press('backspace', listDoc(fam, 3), caretAt(at([1, 0, 0, 0], 0)));
    ok(`${fam.list} — 첫 항목 첫머리의 백스페이스는 리스트 wing 이 받는다`, r !== null);
    eq(`${fam.list} — 첫 항목이 문단으로 풀려 나온다`, r ? (r.doc[1] as ElementNode).ch[0] : null, '항목1');
    eq(
      `${fam.list} — 나머지 둘은 리스트로 남는다`,
      r ? ((r.doc[2] as ElementNode).ch[0] as ElementNode).ch.length : 0,
      2,
);
    ok(`${fam.list} — 반환 자리가 반환 문서에 실재한다`, r !== null && positionExists(cocoon(r.doc, env), r.selection.focus, env));
  }
  {
    // §2 (B) — 가운데 항목은 **앞 항목과 합쳐진다**. 목록은 쪼개지지 않는다.
    const r = press('backspace', listDoc(fam, 3), caretAt(at([1, 0, 1, 0], 0)));
    eq(`${fam.list} — 가운데 항목은 앞 항목과 합쳐진다 (목록이 안 쪼개진다)`, r ? r.doc.length : 0, 2);
    const list = r ? ((r.doc[1] as ElementNode).ch[0] as ElementNode) : null;
    eq(`${fam.list} — 항목이 셋에서 둘로 준다`, list ? list.ch.length : 0, 2);
    eq(
      `${fam.list} — 앞 항목의 글 끝에 이어 붙는다`,
      list ? ((list.ch[0] as ElementNode).ch[0] as ElementNode).ch : null,
      ['항목1항목2'],
);
    eq(`${fam.list} — 캐럿은 이어 붙은 자리다`, r ? r.selection.focus.offset : -1, 3);
    ok(`${fam.list} — 합친 자리가 반환 문서에 실재한다`, r !== null && positionExists(cocoon(r.doc, env), r.selection.focus, env));
  }
  {
    // §6 (B) — Delete 는 그 거울이다: 항목 끝에서 **뒤 항목을 끌어올린다**.
    const doc = listDoc(fam, 3);
    const r = press('delete', doc, caretAt(at([1, 0, 0, 0], 3)));
    ok(`${fam.list} — 항목 끝의 Delete 를 리스트 wing 이 받는다`, r !== null);
    const list = r ? ((r.doc[1] as ElementNode).ch[0] as ElementNode) : null;
    eq(`${fam.list} — Delete 도 항목을 둘로 줄인다`, list ? list.ch.length : 0, 2);
    eq(
      `${fam.list} — 뒤 항목의 글이 끌려 올라온다`,
      list ? ((list.ch[0] as ElementNode).ch[0] as ElementNode).ch : null,
      ['항목1항목2'],
);
  }
  {
    // §4 (B) — 첫 항목의 탭은 **아무 일도 안 하되 삼킨다**(코어의 스페이스 넷 금지).
    const r = press('tab', listDoc(fam, 2), caretAt(at([1, 0, 0, 0], 1)));
    ok(`${fam.list} — 첫 항목의 탭도 리스트가 삼킨다 (pass 가 아니다)`, r !== null);
    eq(`${fam.list} — 첫 항목의 탭은 문서를 안 바꾼다`, r ? r.doc : null, listDoc(fam, 2));
  }
  {
    const r = press('backspace', listDoc(fam, 1), caretAt(at([1, 0, 0, 0], 0)));
    eq(`${fam.list} — 유일 항목이 풀리면 리스트도 사라진다`, r ? r.doc.length : 0, 2);
    ok(`${fam.list} — 리스트 노드가 남지 않는다`, r !== null && !JSON.stringify(r.doc).includes(`"${fam.list}"`));
  }
  {
    const r = press('backspace', listDoc(fam, 2), caretAt(at([1, 0, 0, 0], 1)));
    ok(`${fam.list} — 항목 첫머리가 아니면 코어 몫이다(pass)`, r === null);
  }
}

{
  // tab — 앞 항목 속으로 들어간다 (중첩).
  const doc = listDoc(FAMILIES[0] as Family, 2);
  const r = press('tab', doc, caretAt(at([1, 0, 1, 0], 0)));
  ok('tab — 리스트 wing 이 받는다', r !== null);
  const list = r ? ((r.doc[1] as ElementNode).ch[0] as ElementNode) : null;
  eq('tab — 바깥 리스트의 항목이 하나로 준다', list ? list.ch.length : 0, 1);
  const nested = list ? ((list.ch[0] as ElementNode).ch[1] as ElementNode) : null;
  eq('tab — 앞 항목 속에 같은 가족의 리스트가 선다', nested ? (nested.ch[0] as ElementNode).w : null, 'ul');
  eq('tab — 캐럿은 옮겨간 항목 안', r ? r.selection.focus.path : null, [1, 0, 0, 1, 0, 0, 0]);
  ok('tab — 반환 자리 실재', r !== null && positionExists(cocoon(r.doc, env), r.selection.focus, env));

  // §4 — 첫 항목의 탭은 pass 가 아니다. 리스트가 삼키되 아무 일도 안 한다(코어의 스페이스 넷 금지).
  const first = press('tab', doc, caretAt(at([1, 0, 0, 0], 0)));
  ok('tab — 첫 항목의 탭도 리스트가 삼킨다', first !== null);
  eq('tab — 첫 항목의 탭은 문서를 안 바꾼다', first ? first.doc : null, doc);

  // shiftTab — 다시 한 겹 나온다 (들여쓰기의 역).
  const back = r ? press('shiftTab', cocoon(r.doc, env), caretAt(at([1, 0, 0, 1, 0, 0, 0], 0))) : null;
  const outer = back ? ((back.doc[1] as ElementNode).ch[0] as ElementNode) : null;
  eq('shiftTab — 항목이 바깥 리스트로 돌아온다', outer ? outer.ch.length : 0, 2);
  eq('shiftTab — 되돌아온 자리가 원래 자리다', back ? back.selection.focus.path : null, [1, 0, 1, 0]);
  ok('shiftTab — 반환 자리 실재', back !== null && positionExists(cocoon(back.doc, env), back.selection.focus, env));
}

{
  // **여러 항목을 한 번에** — 목록에서 가장 흔한 몸짓이다. 예전에는 범위 탭이 리스트를 그냥
  // 지나쳐 코어의 "아무도 안 가져간 탭 = 스페이스 넷" 으로 떨어졌고, 그것이 잡은 글을 스페이스로
  // 갈아 버렸다. 갈래 셋이 같은 손을 쓴다.
  const depthOf = (doc: NabiDoc, list: string): number => {
    let deep = 0;
    const walk = (node: NabiNode, at: number): void => {
      if (typeof node === 'string') return;
      const next = node.w === list ? at + 1 : at;
      deep = Math.max(deep, next);
      for (const child of node.ch) walk(child, next);
    };
    for (const block of doc) walk(block, 0);
    return deep;
  };

  for (const family of FAMILIES as readonly Family[]) {
    const doc = listDoc(family, 3);
    const span: Selection = { anchor: at([1, 0, 1, 0], 0), focus: at([1, 0, 2, 0], 1) };

    const inned = press('tab', doc, span);
    ok(`${family.list} — 범위 탭을 리스트가 받는다`, inned !== null);
    eq(`${family.list} — 잡은 둘이 함께 한 겹 들어간다`, inned ? depthOf(inned.doc, family.list) : 0, 2);
    const outer = inned ? ((inned.doc[1] as ElementNode).ch[0] as ElementNode) : null;
    eq(`${family.list} — 바깥에는 첫 항목만 남는다`, outer ? outer.ch.length : 0, 1);
    ok(
      `${family.list} — 범위 탭의 반환 자리 실재`,
      inned !== null &&
        positionExists(cocoon(inned.doc, env), inned.selection.anchor, env) &&
        positionExists(cocoon(inned.doc, env), inned.selection.focus, env),
);

    // 도로 내어쓰면 처음 트리다 — 들여쓰기와 내어쓰기가 서로의 역이라는 것이 이 한 줄이다.
    const back = inned ? press('shiftTab', cocoon(inned.doc, env), inned.selection) : null;
    eq(`${family.list} — 도로 내어쓰면 처음과 같다`, back ? back.doc : null, doc);
  }
}

{
  // shiftTab 맨 층 — 나갈 겹이 없으면 리스트 밖 문단이다(백스페이스와 같은 문).
  const r = press('shiftTab', listDoc(FAMILIES[1] as Family, 2), caretAt(at([1, 0, 0, 0], 0)));
  eq('shiftTab — 맨 층에서는 항목이 문단으로 나온다', r ? (r.doc[1] as ElementNode).ch[0] : null, '항목1');
}

{
  // 엔터 — 항목 분할.
  const r = press('enter', listDoc(FAMILIES[0] as Family, 1), caretAt(at([1, 0, 0, 0], 2)));
  const list = r ? ((r.doc[1] as ElementNode).ch[0] as ElementNode) : null;
  eq('엔터 — 항목이 둘로 갈라진다', list ? list.ch.length : 0, 2);
  eq('엔터 — 앞 항목은 캐럿 앞 글자', list ? ((list.ch[0] as ElementNode).ch[0] as ElementNode).ch[0] : null, '항목');
  eq('엔터 — 새 항목은 캐럿 뒤 글자', list ? ((list.ch[1] as ElementNode).ch[0] as ElementNode).ch[0] : null, '1');
  eq('엔터 — 캐럿은 새 항목의 처음', r ? r.selection.focus : null, at([1, 0, 1, 0], 0));
  ok('엔터 — 반환 자리 실재', r !== null && positionExists(cocoon(r.doc, env), r.selection.focus, env));
}

{
  // 엔터 — 빈 마지막 항목이면 리스트 밖으로 나간다(탈출).
  const doc = cocoon([p(['앞']), el('ul', [el('li', [p(['항목1'])]), el('li', [p([])])])], env);
  const r = press('enter', doc, caretAt(at([1, 0, 1, 0], 0)));
  eq('엔터 — 빈 항목은 리스트 밖 문단이 된다', r ? r.doc.length : 0, 3);
  eq('엔터 — 남은 리스트는 항목 하나', r ? ((r.doc[1] as ElementNode).ch[0] as ElementNode).ch.length : 0, 1);
  eq('엔터 — 탈출한 문단이 비어 있다', r ? (r.doc[2] as ElementNode).ch.length : -1, 0);
  ok('엔터 — 반환 자리 실재', r !== null && positionExists(cocoon(r.doc, env), r.selection.focus, env));
}

{
  // 체크 항목의 ck 는 항목 선언의 불리언이다 — 분할된 새 항목은 물려받지 않는다.
  const doc = cocoon([el('tl', [el('tli', [p(['한 일'])], { ck: 1 })])], env);
  const r = press('enter', doc, caretAt(at([0, 0, 0, 0], 2)));
  const list = r ? ((r.doc[0] as ElementNode).ch[0] as ElementNode) : null;
  eq('엔터 — 앞 항목의 체크는 남는다', list ? (list.ch[0] as ElementNode).a?.['ck'] : null, 1);
  eq('엔터 — 새 항목은 안 한 일이다', list ? (list.ch[1] as ElementNode).a : 'x', undefined);
}

// --- 리스트 토글 커맨드 -------------------------------------------------------------------------

{
  const n = make([p(['하나']), p(['둘'])]);
  n.select(range(at([0], 0), at([1], 1)));
  ok('toggleBulletList 가 돈다', n.applyCommand('toggleBulletList'));
  eq('문단 둘이 항목 둘이 된다', n.getJson(), [
    { w: 'p', ch: [{ w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['하나'] }] }, { w: 'li', ch: [{ w: 'p', ch: ['둘'] }] }] }] },
  ]);
  ok('선택이 범위로 살아남는다', n.getSelection().anchor.path.join('.') !== n.getSelection().focus.path.join('.'));
  ok('다시 누르면 리스트가 풀린다', n.applyCommand('toggleBulletList'));
  eq('풀린 문단이 제자리', n.getJson(), [{ w: 'p', ch: ['하나'] }, { w: 'p', ch: ['둘'] }]);
}
{
  // 가족 갈아입기 — 항목째로 갈린다(항목 속이 한 겹 더 들어가지 않는다).
  const n = make([el('ul', [el('li', [p(['하나'])])])]);
  n.select(caretAt(at([0, 0, 0, 0], 0)));
  ok('toggleOrderedList 가 돈다', n.applyCommand('toggleOrderedList'));
  eq('글머리가 번호로 갈아입는다', n.getJson(), [
    { w: 'p', ch: [{ w: 'ol', ch: [{ w: 'oli', ch: [{ w: 'p', ch: ['하나'] }] }] }] },
  ]);
}
{
  const n = make([p(['할 일'])]);
  n.select(caretAt(at([0], 0)));
  ok('toggleTaskList 가 체크 인자를 받는다', n.applyCommand('toggleTaskList', { ck: 1 }));
  eq('체크된 항목으로 선다', n.getJson(), [
    { w: 'p', ch: [{ w: 'tl', ch: [{ w: 'tli', a: { ck: 1 }, ch: [{ w: 'p', ch: ['할 일'] }] }] }] },
  ]);
}

// --- 값 마크 — 목록 밖 값 거절· 같은 값 토글· 다른 값 교체 -----------------------------------

{
  const n = make([p(['가나다'])]);
  const all = (): boolean => n.select(range(at([0], 0), at([0], 3)));
  all();
  ok('목록 밖 색은 커맨드가 거절한다', n.applyCommand('setHighlight', { c: 'teal' }) === false);
  eq('거절은 문서를 안 건드린다', n.getJson(), [{ w: 'p', ch: ['가나다'] }]);
  ok('목록 안 색은 걸린다', n.applyCommand('setHighlight', { c: 'yellow' }));
  eq('형광펜이 걸렸다', n.getJson(), [{ w: 'p', ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['가나다'] }] }]);
  ok('다른 값은 교체다', n.applyCommand('setHighlight', { c: 'cyan' }));
  eq('색이 갈렸다', n.getJson(), [{ w: 'p', ch: [{ w: 'hl', a: { c: 'cyan' }, ch: ['가나다'] }] }]);
  ok('같은 값 다시는 토글(벗기)이다', n.applyCommand('setHighlight', { c: 'cyan' }));
  eq('형광펜이 벗겨졌다', n.getJson(), [{ w: 'p', ch: ['가나다'] }]);

  ok('글자색도 자기 목록만 받는다', n.applyCommand('setTextColor', { c: 'yellow' }) === false);
  ok('글자색 목록 안 값은 걸린다', n.applyCommand('setTextColor', { c: 'coral' }));
  ok('크기는 xs·sm·lg·xl 뿐이다', n.applyCommand('setFontSize', { v: 'md' }) === false);
  ok('크기 lg 는 걸린다', n.applyCommand('setFontSize', { v: 'lg' }));
  ok('서체 목록 밖은 거절', n.applyCommand('setTypeface', { v: 'comic' }) === false);
  ok('서체 serif 는 걸린다', n.applyCommand('setTypeface', { v: 'serif' }));
  eq('값 목록은 old 에서 번역해 온 그대로다', [HIGHLIGHT_COLORS.length, TEXT_COLORS.length, FONT_SIZES, TYPEFACES], [6, 5, ['xs', 'sm', 'lg', 'xl'], ['sans', 'serif', 'mono', 'cursive']]);
}
{
  // 값 마크의 부른 손 (084 ⑨) — `result.arm` 을 답하는 커맨드도 문 앞에서 같은 규칙을 받는다.
  const said: string[] = [];
  const n = createNabiWith(defaultWings, {
    doc: [p(['가나']), p([])],
    toast: (level, message) => said.push(level),
  }).nabi;

  // 포인터 · 접힘 · 마크 밖 = 예약이 설 자리 — 거절 + toast.
  n.select(caretAt(at([0], 2)));
  ok('포인터 접힘 값 마크 — 거절', n.applyCommand('setHighlight', { c: 'yellow' }, 'pointer') === false);
  ok('포인터 접힘 값 마크 — 예약 없음', n.$armed.isEmpty());
  eq('포인터 접힘 값 마크 — toast(info)', said, ['info']);
  n.applyCommand('insertText', { text: 'X' });
  eq('이어 친 글자는 맨몸이다', n.getJson()[0], { w: 'p', ch: ['가나X'] });
  n.undo();

  // 포인터라도 **대상이 있으면** 돈다 — 접힌 캐럿의 문단 겨눔(fs)은 예약이 아니라 적용이다.
  n.select(caretAt(at([0], 1)));
  ok('포인터 접힘 크기 — 문단이 대상이라 돈다', n.applyCommand('setFontSize', { v: 'lg' }, 'pointer'));
  eq('문단 전체가 커졌다', n.getJson()[0], { w: 'p', ch: [{ w: 'fs', a: { v: 'lg' }, ch: ['가나'] }] });
  n.undo();

  // 빈 문단의 크기는 걸 글자가 없다 — 키보드는 예약, 포인터는 거절.
  n.select(caretAt(at([1], 0)));
  ok('키보드 빈 문단 크기 — 예약', n.applyCommand('setFontSize', { v: 'lg' }, 'keyboard'));
  ok('예약이 섰다', n.$armed.isArmed('fs'));
  n.select(caretAt(at([1], 0))); // 몸짓으로 예약을 걷는다... 같은 자리라 안 걷힌다 — 직접 걷는다
  n.$armed.clear();
  ok('포인터 빈 문단 크기 — 거절', n.applyCommand('setFontSize', { v: 'lg' }, 'pointer') === false);
  ok('포인터 빈 문단 크기 — 예약 없음', n.$armed.isEmpty());
  eq('toast 는 두 번 — 포인터 거절만 말한다', said, ['info', 'info']);

  // 포인터 · 범위 = 키보드 범위와 동일 동작.
  n.select(range(at([0], 0), at([0], 2)));
  ok('포인터 범위 형광펜 — 돈다', n.applyCommand('setHighlight', { c: 'yellow' }, 'pointer'));
  eq('범위가 칠해졌다', n.getJson()[0], { w: 'p', ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['가나'] }] });
  eq('범위 몸짓 — toast 없음', said.length, 2);
}

{
  // 들여오기도 같은 목록을 지킨다 — 목록 밖 값을 단 태그는 껍데기를 벗는다.
  const n = make([]);
  n.setHtml('<p><mark data-color="teal">글</mark></p>');
  eq('목록 밖 형광펜은 들여올 때 벗겨진다', n.getJson(), [{ w: 'p', ch: ['글'] }]);
  n.setHtml('<p><mark data-color="pink">글</mark></p>');
  eq('목록 안 형광펜은 들어온다', n.getJson(), [{ w: 'p', ch: [{ w: 'hl', a: { c: 'pink' }, ch: ['글'] }] }]);
  n.setHtml('<p><span data-nabi-size="md">글</span></p>');
  eq('목록 밖 크기도 벗겨진다', n.getJson(), [{ w: 'p', ch: ['글'] }]);
}

// --- 값 마크 — 경계에서의 몸짓 (색 전이 금지) ---------------------------------------------------
// 두 색이 이어 붙은 자리에 캐럿을 접고 색을 바꾸는 몸짓. 캐럿은 앞 조각의 것으로 읽히므로(경계
// 정규화) 바뀌는 것은 앞 조각이고, 새 색이 뒤 조각과 같아지면 저장값에서는 하나로 붙는 것이
// 옳다 — 다만 그 다음 몸짓이 붙은 덩어리 전체를 겨누면 사람이 바꾼 적 없는 이웃이 물든다.

{
  const two = (): unknown[] => [p([el('tc', ['초록초록'], { c: 'green' }), el('tc', ['코랄코랄'], { c: 'coral' })])];
  const n = make(two());
  n.select(caretAt(at([0], 4)));
  ok('경계 몸짓 — 앞 조각을 뒤 조각의 색으로', n.applyCommand('setTextColor', { c: 'coral' }, 'pointer'));
  eq('같은 색은 저장값에서 하나로 붙는다', n.getJson(), [
    { w: 'p', ch: [{ w: 'tc', a: { c: 'coral' }, ch: ['초록초록코랄코랄'] }] },
  ]);
  // 붙는 순간 문서에서 옛 경계가 사라지므로, 겨눴던 조각이 범위로 남는다 — 다음 몸짓의 겨눔이
  // 덩어리 전체로 넓어지지 않는 유일한 기억이다.
  eq('붙은 뒤에는 바꾼 조각이 범위로 남는다', [n.getSelection().anchor.offset, n.getSelection().focus.offset], [0, 4]);
  ok('이어서 다른 색을 고른다', n.applyCommand('setTextColor', { c: 'blue' }, 'pointer'));
  eq('이웃은 안 물든다 — 바꾼 그 조각만 갈아입는다', n.getJson(), [
    { w: 'p', ch: [{ w: 'tc', a: { c: 'blue' }, ch: ['초록초록'] }, { w: 'tc', a: { c: 'coral' }, ch: ['코랄코랄'] }] },
  ]);
  // 되돌리기 — 한 번 누른 것이 한 번에 돌아온다.
  ok('되돌리기 한 걸음 ①', n.undo());
  eq('첫 걸음 — 붙었던 코랄로', n.getJson(), [{ w: 'p', ch: [{ w: 'tc', a: { c: 'coral' }, ch: ['초록초록코랄코랄'] }] }]);
  ok('되돌리기 한 걸음 ②', n.undo());
  eq('둘째 걸음 — 처음 그대로', n.getJson(), two());
}
{
  // 형광펜도 같은 규칙이다 — 조각 가운데 캐럿이어도 붙으면 조각의 기억이 남는다.
  const n = make([p([el('hl', ['노랑노랑'], { c: 'yellow' }), el('hl', ['분홍분홍'], { c: 'pink' })])]);
  n.select(caretAt(at([0], 2)));
  ok('형광펜 — 앞 조각을 뒤 조각의 색으로', n.applyCommand('setHighlight', { c: 'pink' }, 'pointer'));
  ok('형광펜 — 이어서 다른 색', n.applyCommand('setHighlight', { c: 'cyan' }, 'pointer'));
  eq('형광펜 — 이웃은 안 물든다', n.getJson(), [
    { w: 'p', ch: [{ w: 'hl', a: { c: 'cyan' }, ch: ['노랑노랑'] }, { w: 'hl', a: { c: 'pink' }, ch: ['분홍분홍'] }] },
  ]);
}
{
  // 안 붙는 보통 몸짓은 캐럿 그대로다 — 한 번 바꿨다고 조각이 통째로 긁힌 것처럼 보이면 안 된다.
  const n = make([p([el('tc', ['초록초록'], { c: 'green' }), el('tc', ['코랄코랄'], { c: 'coral' })])]);
  n.select(caretAt(at([0], 2)));
  ok('가운데 캐럿 — 이웃과 다른 색으로', n.applyCommand('setTextColor', { c: 'blue' }, 'pointer'));
  eq('그 조각만 갈아입는다', n.getJson(), [
    { w: 'p', ch: [{ w: 'tc', a: { c: 'blue' }, ch: ['초록초록'] }, { w: 'tc', a: { c: 'coral' }, ch: ['코랄코랄'] }] },
  ]);
  eq('안 붙었으니 캐럿은 있던 자리 그대로다', [n.getSelection().anchor, n.getSelection().focus], [at([0], 2), at([0], 2)]);
}
{
  // 겨눔은 이어진 런까지다 — 같은 색이 끊겨 서 있으면 사이에 낀 남의 글은 겨눔에 안 든다.
  const n = make([p([el('tc', ['초록'], { c: 'green' }), el('tc', ['코랄'], { c: 'coral' }), el('tc', ['초록'], { c: 'green' })])]);
  n.select(caretAt(at([0], 1)));
  ok('끊긴 같은 색 — 첫 조각 안에서 색을 바꾼다', n.applyCommand('setTextColor', { c: 'blue' }, 'pointer'));
  eq('건너편 같은 색도, 사이의 코랄도 그대로다', n.getJson(), [
    { w: 'p', ch: [{ w: 'tc', a: { c: 'blue' }, ch: ['초록'] }, { w: 'tc', a: { c: 'coral' }, ch: ['코랄'] }, { w: 'tc', a: { c: 'green' }, ch: ['초록'] }] },
  ]);
}
{
  // 넓히기의 본뜻은 산다 — 굵게가 중간에 낀 형광펜은 런이 셋이어도 한 몸으로 바뀐다.
  const n = make([p([el('hl', ['형', el('b', ['광']), '펜'], { c: 'yellow' })])]);
  n.select(caretAt(at([0], 2)));
  ok('굵게 낀 형광펜 — 가운데 캐럿에서 색을 바꾼다', n.applyCommand('setHighlight', { c: 'pink' }, 'pointer'));
  // 중첩 모양은 setMark 의 마크 차례 규칙(갈아입는 마크가 뒤로 선다)의 것이다 — 여기서 못박는
  // 것은 겨눔이다: 세 런 전부가 분홍을 입고, 마크 밖으로는 아무것도 안 샌다.
  eq('마크가 덮은 글 전체가 갈아입는다', n.getJson(), [
    { w: 'p', ch: [
      { w: 'hl', a: { c: 'pink' }, ch: ['형'] },
      { w: 'b', ch: [{ w: 'hl', a: { c: 'pink' }, ch: ['광'] }] },
      { w: 'hl', a: { c: 'pink' }, ch: ['펜'] },
    ] },
  ]);
}

// --- 링크 --------------------------------------------------------------------------------------

{
  const n = make([p(['가나다'])]);
  n.select(range(at([0], 0), at([0], 3)));
  ok('스킴 화이트리스트 밖 주소는 거절', n.applyCommand('setLink', { href: 'javascript:alert(1)' }) === false);
  ok('상대 경로는 받는다', n.applyCommand('setLink', { href: '/f/x.png', file: 'x.png' }));
  eq('첨부 이름이 함께 실린다', n.getJson(), [
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/x.png', file: 'x.png' }, ch: ['가나다'] }] },
  ]);
  ok('주소 null 은 링크를 벗긴다', n.applyCommand('setLink', { href: null }));
  eq('링크가 벗겨졌다', n.getJson(), [{ w: 'p', ch: ['가나다'] }]);
  eq('링크는 Escape 로 예약의 음수 방향을 연다', linkWing.escapeKeys, ['Escape']);
}

// 표시 이름 고치기 — 상황 줄의 이름 칸이 부르는 명령. 캐럿이 안에 있을 때도, 마크 전체를 꼭
// 맞게 덮은 범위(첨부를 클릭해 통째로 고른 겨눔이 그 모양이다)로도 이름을 바꿀 수 있어야 한다.
{
  const n = make([p([el('a', ['가나다'], { href: '/f/x.png', file: 'x.png' })])]);
  n.select(caretAt(at([0], 1)));
  ok('캐럿이 링크 안이면 표시 이름을 바꾼다', n.applyCommand('renameLink', { text: '라마바' }));
  eq('글자가 갈렸다', n.getJson(), [
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/x.png', file: 'x.png' }, ch: ['라마바'] }] },
  ]);

  // 마크를 꼭 맞게 덮은 범위 — attachFileLink 가 첨부를 클릭했을 때 만드는 그 겨눔([from, to)).
  n.select(range(at([0], 0), at([0], 3)));
  ok('범위가 마크를 꼭 맞게 덮어도(첨부를 통째로 고른 모양) 표시 이름을 바꾼다', n.applyCommand('renameLink', { text: '사아자' }));
  eq('통째로 고른 채로도 이름이 갈린다', n.getJson(), [
    { w: 'p', ch: [{ w: 'a', a: { href: '/f/x.png', file: 'x.png' }, ch: ['사아자'] }] },
  ]);
}

// 첨부는 한 덩어리다 — 닿으면 통째로 골라지고, 붙어 있는 지우기는 먼저 겨눈다.
// attach 는 DOM 을 받지만 하는 일은 트리뿐이라, 리스너만 받아 주는 껍데기 하나로 그물에 잡힌다.
{
  // 앞(1) + 첨부 "첨부파일"(4) + 뒤(1) — 첨부가 덮은 자리는 [1, 5) 다.
  const n = make([{ w: 'p', ch: ['앞', { w: 'a', a: { href: '/f/x.txt', file: 'txt' }, ch: ['첨부파일'] }, '뒤'] }]);
  let onKey: ((event: KeyboardEvent) => void) | null = null;
  const root = {
    addEventListener: (_type: string, handler: unknown) => {
      onKey = handler as (event: KeyboardEvent) => void;
    },
    removeEventListener: () => undefined,
  } as unknown as HTMLElement;
  const stop = attachFileLink({ root, nabi: n, pathOfKey: () => null });

  const caret = (offset: number): void => void n.select(caretAt(at([0], offset)));
  const span = (): [number, number] => [n.getSelection().anchor.offset, n.getSelection().focus.offset];

  caret(1);
  eq('첨부 앞 경계에는 캐럿이 선다 (이어서 쓸 수 있어야 한다)', span(), [1, 1]);
  caret(5);
  eq('첨부 뒤 경계에도 캐럿이 선다', span(), [5, 5]);
  for (const inside of [2, 3, 4]) {
    caret(inside);
    eq(`첨부 속(${inside})은 통째로 골라진다`, span(), [1, 5]);
  }
  n.select(range(at([0], 0), at([0], 2)));
  eq('스치기만 한 범위도 첨부 끝까지 넓어진다', span(), [0, 5]);

  // 붙어 있는 지우기 — 첫 번은 겨눈다(코어가 한 글자를 갉지 못하게 preventDefault 한다).
  let stopped = 0;
  const press = (key: string): void =>
    onKey?.({ key, preventDefault: () => (stopped += 1) } as unknown as KeyboardEvent);

  caret(5);
  press('Backspace');
  eq('첨부 뒤 백스페이스는 먼저 통째로 겨눈다', span(), [1, 5]);
  caret(1);
  press('Delete');
  eq('첨부 앞 Delete 도 먼저 통째로 겨눈다', span(), [1, 5]);
  eq('두 번 다 코어의 한 글자 지우기를 막았다', stopped, 2);

  // 겨눠진 채로 지우면 코어의 범위 삭제가 통째로 걷는다 — 반쪽 링크가 안 남는다.
  press('Backspace');
  eq('이미 골라져 있으면 그 키는 코어의 것이다 (막지 않는다)', stopped, 2);
  n.applyCommand('deleteBackward');
  eq('겨눈 뒤 한 번 더 누르면 첨부가 통째로 사라진다', n.getJson(), [{ w: 'p', ch: ['앞뒤'] }]);
  stop();
}

// --- 문단 속성 ---------------------------------------------------------------------------------

{
  const n = make([p(['제목글'])]);
  n.select(caretAt(at([0], 0)));
  ok('목록 밖 단계는 거절(1~6)', n.applyCommand('setHeading', { value: 9 }) === false);
  ok('제목 3 이 얹힌다', n.applyCommand('setHeading', { value: 3 }));
  eq('문단 속성으로 실린다', n.getJson(), [{ w: 'p', a: { h: 3 }, ch: ['제목글'] }]);
  eq('currentValue 가 지금 단계를 답한다', headingWing.currentValue?.({ w: 'p', a: { h: 3 }, ch: [] }), '3');
  eq('currentValue — 목록 밖 값은 없는 값', headingWing.currentValue?.({ w: 'p', a: { h: 9 }, ch: [] }), undefined);
  ok('같은 단계 다시는 해제다', n.applyCommand('setHeading', { value: 3 }));
  eq('제목이 걷혔다', n.getJson(), [{ w: 'p', ch: ['제목글'] }]);
  ok('제목 출력은 태그가 된다', (() => {
    n.applyCommand('setHeading', { value: 1 });
    return n.getHtml().startsWith('<h1>');
  })());
}
{
  const n = make([p(['글']), el('hr')]);
  n.select(caretAt(at([1], 0)));
  ok('정렬은 래퍼문단에도 얹힌다', n.applyCommand('setAlign', { value: 'c' }));
  eq('래퍼문단이 정렬을 든다', n.getJson(), [{ w: 'p', ch: ['글'] }, { w: 'p', a: { a: 'c' }, ch: [{ w: 'hr', ch: [] }] }]);
  ok('제목은 래퍼문단에 안 얹힌다(무변화 침묵)', n.applyCommand('setHeading', { value: 2 }) === false);
  ok('드롭캡도 래퍼문단에 안 얹힌다', n.applyCommand('toggleDropCap') === false);
  ok('같은 정렬 다시는 해제', n.applyCommand('setAlign', { value: 'c' }));
  eq('정렬이 걷혔다', n.getJson(), [{ w: 'p', ch: ['글'] }, { w: 'p', ch: [{ w: 'hr', ch: [] }] }]);
}
// 여러 문단을 잡고 누르면 **그 전부**가 겨눔이다 — 문단 규칙 셋이 다 같은 규율을 쓴다.
{
  const three = (): unknown[] => [p(['첫째']), p(['둘째']), p(['셋째'])];
  const span = { anchor: { path: [0], offset: 0 }, focus: { path: [2], offset: 2 } };

  for (const [name, cmd, args, key, value] of [
    ['정렬', 'setAlign', { value: 'c' }, 'a', 'c'],
    ['제목', 'setHeading', { value: 2 }, 'h', 2],
    ['드롭캡', 'toggleDropCap', {}, 'dc', 1],
  ] as const) {
    const n = make(three());
    n.select(span);
    ok(`${name} — 여러 문단에 한 번에 걸린다 (실행)`, n.applyCommand(cmd, args));
    eq(`${name} — 잡은 문단 전부가 든다`, n.getJson(), [
      { w: 'p', a: { [key]: value }, ch: ['첫째'] },
      { w: 'p', a: { [key]: value }, ch: ['둘째'] },
      { w: 'p', a: { [key]: value }, ch: ['셋째'] },
    ]);
    // 전부 그 값이면 그때 해제다 — 한 번 더 누르면 셋이 함께 풀린다.
    n.select(span);
    ok(`${name} — 전부 같은 값이면 다시 눌러 해제`, n.applyCommand(cmd, args));
    eq(`${name} — 셋이 함께 걷힌다`, n.getJson(), three());
  }

  // **섞인 선택은 거는 쪽이다** — 시작 문단 하나만 보면 여기서 답이 뒤집힌다(첫 줄이 이미
  // 그 값이라고 셋 다 풀어 버린다). 사람이 바란 것은 셋 다 걸리는 것이다.
  const mixed = make([{ w: 'p', a: { a: 'c' }, ch: ['이미'] }, p(['맨글']), p(['맨글'])]);
  mixed.select(span);
  ok('섞인 선택 — 거는 쪽으로 답한다 (실행)', mixed.applyCommand('setAlign', { value: 'c' }));
  eq('섞인 선택 — 전부 그 값이 된다', mixed.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: ['이미'] },
    { w: 'p', a: { a: 'c' }, ch: ['맨글'] },
    { w: 'p', a: { a: 'c' }, ch: ['맨글'] },
  ]);

  // 물건이 섞인 선택 — 정렬은 래퍼문단에도 걸리고, 제목·드롭캡은 그 자리만 건너뛴다.
  const withObject = (): unknown[] => [p(['글']), p([el('hr')]), p(['뒤'])];
  const overObject = { anchor: { path: [0], offset: 0 }, focus: { path: [2], offset: 1 } };

  const aligned = make(withObject());
  aligned.select(overObject);
  aligned.applyCommand('setAlign', { value: 'c' });
  eq('물건이 섞여도 정렬은 셋 다 든다', aligned.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: ['글'] },
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'hr', ch: [] }] },
    { w: 'p', a: { a: 'c' }, ch: ['뒤'] },
  ]);

  const headed = make(withObject());
  headed.select(overObject);
  headed.applyCommand('setHeading', { value: 1 });
  eq('제목은 래퍼문단만 건너뛴다', headed.getJson(), [
    { w: 'p', a: { h: 1 }, ch: ['글'] },
    { w: 'p', ch: [{ w: 'hr', ch: [] }] },
    { w: 'p', a: { h: 1 }, ch: ['뒤'] },
  ]);
}
{
  const n = make([p(['드롭캡 글'])]);
  n.select(caretAt(at([0], 2)));
  ok('드롭캡이 걸린다', n.applyCommand('toggleDropCap'));
  eq('불리언 1 로 실린다', n.getJson(), [{ w: 'p', a: { dc: 1 }, ch: ['드롭캡 글'] }]);
  ok('분할이 돈다', n.applyCommand('splitParagraph'));
  eq('드롭캡은 첫 글자 쪽만 갖는다', n.getJson(), [
    { w: 'p', a: { dc: 1 }, ch: ['드롭'] },
    { w: 'p', ch: ['캡 글'] },
  ]);
}

// --- 그릇 (인용·접기·코드·구분선) --------------------------------------------------------------

{
  const n = make([p(['하나']), p(['둘'])]);
  n.select(range(at([0], 0), at([1], 1)));
  ok('toggleQuote 가 돈다', n.applyCommand('toggleQuote'));
  eq('인용이 래퍼문단을 입고 선다', n.getJson(), [
    { w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['하나'] }, { w: 'p', ch: ['둘'] }] }] },
  ]);
  ok('다시 누르면 풀린다', n.applyCommand('toggleQuote'));
  eq('푼 문단이 제자리', n.getJson(), [{ w: 'p', ch: ['하나'] }, { w: 'p', ch: ['둘'] }]);
}
{
  const n = make([p(['속 글'])]);
  n.select(caretAt(at([0], 0)));
  ok('toggleDetails 가 돈다', n.applyCommand('toggleDetails'));
  eq('접기는 제목 하나 + 문단 배열이다', n.getJson(), [
    { w: 'p', ch: [{ w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: [] }, { w: 'p', ch: ['속 글'] }] }] },
  ]);
  eq('캐럿은 제목에 선다', n.getSelection().focus, at([0, 0, 0], 0));
  ok('다시 누르면 풀리고 제목은 문단이 된다', n.applyCommand('toggleDetails'));
  eq('제목 글도 안 사라진다', n.getJson(), [{ w: 'p', ch: [] }, { w: 'p', ch: ['속 글'] }]);
}
{
  // repair — 제목이 없으면 세우고, 둘이면 뒤엣것은 문단으로 내려온다.
  const n = make([el('details', [p(['속 글'])])]);
  eq('접기 repair — 제목이 없으면 빈 제목이 선다', n.getJson(), [
    { w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: [] }, { w: 'p', ch: ['속 글'] }] }] },
  ]);
  const two = make([el('details', [el('summary', ['첫 제목']), el('summary', ['둘째 제목'])])]);
  eq('접기 repair — 제목이 둘이면 뒤엣것은 문단이다', two.getJson(), [
    { w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['첫 제목'] }, { w: 'p', ch: ['둘째 제목'] }] }] },
  ]);
}
{
  const n = make([p(['const x = 1']), p(['const y = 2'])]);
  n.select(range(at([0], 0), at([1], 11)));
  ok('toggleCode 가 돈다', n.applyCommand('toggleCode', { lang: 'ts' }));
  eq('블록 하나가 줄 하나가 된다', n.getJson(), [
    { w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['const x = 1', { w: 'br', ch: [] }, 'const y = 2'] }] },
  ]);
  eq('캐럿은 코드 상자 안', n.getSelection().focus.path, [0, 0]);
  ok('다시 누르면 줄마다 문단이 된다', n.applyCommand('toggleCode'));
  eq('두 줄이 두 문단으로', n.getJson(), [{ w: 'p', ch: ['const x = 1'] }, { w: 'p', ch: ['const y = 2'] }]);
}
{
  // repair — 코드 속에는 마크가 못 산다. 언어는 모양이 아니면 안 실린다.
  const n = make([el('code', [el('b', ['굵은 코드']), '와 평문'], { lang: '깨진 값' })]);
  eq('코드 repair — 마크는 벗겨지고 글자만 남는다', n.getJson(), [
    { w: 'p', ch: [{ w: 'code', ch: ['굵은 코드와 평문'] }] },
  ]);
  eq('코드 wing 의 currentValue — 언어', codeWing.currentValue?.({ w: 'code', a: { lang: 'ts' }, ch: [] }), 'ts');
}
{
  const n = make([p([])]);
  n.select(caretAt(at([0], 0)));
  ok('insertDivider 가 돈다', n.applyCommand('insertDivider'));
  eq('빈 문단이 래퍼문단으로 교체된다', n.getJson(), [{ w: 'p', ch: [{ w: 'hr', ch: [] }] }]);
  eq('구분선 출력', n.getHtml(), '<div data-nabi-p><hr/></div>');
  const dirty = make([el('hr', [], { a: 'c', src: 'x' })]);
  eq('hr repair — 어떤 속성도 안 붙는다', dirty.getJson(), [{ w: 'p', ch: [{ w: 'hr', ch: [] }] }]);
}

{
  // 인라인 홀더 선언(holds: 'inline')의 결과 — 코드와 접기 제목 속의 엔터는 분할이 아니라 라인이다.
  const n = make([el('code', ['ab'], { lang: 'ts' })]);
  n.select(caretAt(at([0, 0], 1)));
  ok('코드 속 엔터가 돈다', n.applyCommand('splitParagraph'));
  eq('코드 속 엔터는 라인이다 (문단이 안 갈린다)', n.getJson(), [
    { w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['a', { w: 'br', ch: [] }, 'b'] }] },
  ]);

  const d = make([el('details', [el('summary', ['제목']), p(['속'])])]);
  d.select(caretAt(at([0, 0, 0], 1)));
  ok('접기 제목 속 엔터가 돈다', d.applyCommand('splitParagraph'));
  eq('접기 제목 속 엔터도 라인이다', d.getJson(), [
    { w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['제', { w: 'br', ch: [] }, '목'] }, { w: 'p', ch: ['속'] }] }] },
  ]);
}

{
  // repair 는 고칠 것이 없으면 원래 참조를 돌려줘야 한다 — 아니면 매 커맨드가 "바뀌었다"고 말한다.
  const settled = cocoon(
    [
      el('details', [el('summary', ['제목']), p(['속 글'])], { o: 1 }),
      el('code', ['const x = 1'], { lang: 'ts' }),
      el('ul', [el('li', [p(['하나'])])]),
      el('hr'),
    ],
    env,
);
  ok('repair — 안 바뀐 문서는 새로 안 짓는다 (구조 공유)', cocoon(settled, env) === settled);
  const n = make(settled);
  n.select(caretAt(at([0, 0, 0], 0)));
  ok('무변화 커맨드는 침묵한다 (무변화면 침묵)', n.applyCommand('setHeading', { value: 2 }) === false);
}

// --- 오토포맷 규칙 매칭 표 (패턴만 — 디스패처는 09) --------------------------------------------

function hits(text: string, trigger: 'space' | 'enter'): string[] {
  return registry.inputRules
.filter((rule) => rule.trigger === trigger && rule.pattern.test(text))
.map((rule) => {
      const call = rule.run(rule.pattern.exec(text) as RegExpMatchArray);
      return call.args === undefined ? `${rule.w}:${call.name}` : `${rule.w}:${call.name}:${JSON.stringify(call.args)}`;
    });
}

eq('오토포맷 — # 하나는 제목 1', hits('#', 'space'), ['h:setHeading:{"value":1}']);
eq('오토포맷 — ### 은 제목 3', hits('###', 'space'), ['h:setHeading:{"value":3}']);
eq('오토포맷 — ###### 은 제목 6', hits('######', 'space'), ['h:setHeading:{"value":6}']);
eq('오토포맷 — ####### 7개는 안 잡힌다', hits('#######', 'space'), []);
eq('오토포맷 — # 은 엔터로는 안 뜬다', hits('#', 'enter'), []);
eq('오토포맷 — > 는 인용', hits('>', 'space'), ['quote:toggleQuote']);
eq('오토포맷 — - 는 글머리', hits('-', 'space'), ['ul:toggleBulletList']);
eq('오토포맷 — -abc 는 안 잡힌다', hits('-abc', 'space'), []);
eq('오토포맷 — 1. 은 번호', hits('1.', 'space'), ['ol:toggleOrderedList']);
eq('오토포맷 — 42. 도 번호(시작 번호는 안 본다)', hits('42.', 'space'), ['ol:toggleOrderedList']);
eq('오토포맷 — 1.2 는 안 잡힌다', hits('1.2', 'space'), []);
eq('오토포맷 — [x] 는 체크된 항목', hits('[x]', 'space'), ['tl:toggleTaskList:{"ck":1}']);
eq('오토포맷 — [X] 도 체크', hits('[X]', 'space'), ['tl:toggleTaskList:{"ck":1}']);
eq('오토포맷 — [ ] 는 안 한 항목', hits('[ ]', 'space'), ['tl:toggleTaskList:{}']);
eq('오토포맷 — [y] 는 안 잡힌다', hits('[y]', 'space'), []);
eq('오토포맷 — ``` 는 코드(언어 없음)', hits('```', 'space'), ['code:toggleCode']);
eq('오토포맷 — ```ts 는 엔터로도 뜬다', hits('```ts', 'enter'), ['code:toggleCode:{"lang":"ts"}']);
eq('오토포맷 — --- 엔터는 구분선', hits('---', 'enter'), ['hr:insertDivider']);
eq('오토포맷 — ---- 도 구분선', hits('----', 'enter'), ['hr:insertDivider']);
eq('오토포맷 — -- 는 안 잡힌다', hits('--', 'enter'), []);
eq('오토포맷 — --- 는 스페이스로는 안 뜬다', hits('---', 'space'), []);
eq('오토포맷 — 맨 URL 은 링크', hits('https://a.com/x?y=1&z#f', 'space'), [
  'a:setLink:{"href":"https://a.com/x?y=1&z#f"}',
]);
eq('오토포맷 — ftp 는 안 잡힌다', hits('ftp://x', 'space'), []);
eq('오토포맷 — 링크 규칙만 낱말 단위(scope word)다', registry.inputRules.filter((r) => r.scope === 'word').map((r) => r.w), ['a', 'a']);

done('wings1');
