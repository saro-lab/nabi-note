// wing 그물 — registry fail-fast 전 케이스· 환경/조립/repair/claim 접힘· onKey pass 의미
// 키 소유 판정· 팩토리 산출물· 공용 부품. 계약은 기계가 지킨다는 것을 여기서 증명한다.
import { cocoon, isElement, type ElementNode, type NabiDoc, type NabiNode } from '../src/schema/index.js';
import { positionExists, type Position } from '../src/doc/index.js';
import { caretAt, ordered } from '../src/caret/index.js';
import { DEFAULT_BUILDERS, renderHtml } from '../src/html/index.js';
import {
  boxObject,
  createNabiWith,
  insertLump,
  keyOwnerAt,
  listFamily,
  makeRegistry,
  removeLump,
  routeKey,
  simpleMark,
  toggleWrap,
  valueMark,
  type Wing,
} from '../src/wing/index.js';
import { done, eq, ok } from './net.js';

const p = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode =>
  a ? { w: 'p', a, ch } : { w: 'p', ch };
const el = (w: string, ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode =>
  a ? { w, a, ch } : { w, ch };
const at = (path: readonly number[], offset: number): Position => ({ path, offset });

function throws(name: string, fn: () => void, wants?: string): void {
  try {
    fn();
    ok(name, false, '던지지 않았다');
  } catch (error) {
    const message = (error as Error).message;
    ok(name, wants === undefined || message.includes(wants), `받은 메시지: ${message}`);
  }
}

// --- 본보기 wing 들 --------------------------------------------------------------------------

const bold = simpleMark({ w: 'b' });
const italic = simpleMark({ w: 'i' });
const highlight = valueMark({ w: 'hl', key: 'c', values: ['yellow', 'green'] });

const img = boxObject({
  w: 'img',
  attrs: {
    src: (value) => (typeof value === 'string' && value.startsWith('/') ? value : null),
    alt: (value) => (typeof value === 'string' ? value : null),
    w: (value) => {
      const n = Number(value);
      return Number.isInteger(n) && n >= 1 && n <= 100 ? String(n) : null;
    },
  },
});

const bullet = listFamily({ w: 'ul', item: 'li' });
const task = listFamily({
  w: 'tl',
  item: 'tli',
  itemDecl: { boolAttrs: ['ck'] },
  itemHtml: DEFAULT_BUILDERS['tli'],
});

const quote: Wing = {
  w: 'quote',
  place: 'container',
  holds: 'blocks',
  allows: ['p'],
  toHtml: DEFAULT_BUILDERS['quote'] as NonNullable<Wing['toHtml']>,
};

// 표 — onKey 로 tab 만 받는다(그 밖은 null = pass). 09 파이프라인의 계약을 그대로 시험한다.
const table: Wing = {
  w: 'table',
  place: 'container',
  holds: 'blocks',
  allows: ['tr'],
  parts: {
    tr: { holds: 'blocks' },
    td: { holds: 'blocks', singleParagraph: true },
  },
  toHtml: DEFAULT_BUILDERS['table'] as NonNullable<Wing['toHtml']>,
  partHtml: {
    tr: DEFAULT_BUILDERS['tr'] as NonNullable<Wing['toHtml']>,
    td: DEFAULT_BUILDERS['td'] as NonNullable<Wing['toHtml']>,
  },
  onKey: (intent, doc, sel) => {
    if (intent.key !== 'tab') return null;
    return { doc, selection: sel };
  },
};

const WINGS: readonly Wing[] = [bold, italic, highlight, img, bullet, task, quote, table];

// --- registry fail-fast ----------------------------------------------------------------------

throws('예약어 p 는 wing 이 못 쓴다', () => makeRegistry([simpleMark({ w: 'p' })]), '예약어');
throws('예약어 br 도 못 쓴다', () => makeRegistry([simpleMark({ w: 'br' })]), '예약어');
throws('부품 이름도 예약어를 못 쓴다', () =>
  makeRegistry([{...bullet, parts: { p: { holds: 'blocks' } }, partHtml: { p: DEFAULT_BUILDERS['li'] as NonNullable<Wing['toHtml']> } } as Wing]), '예약어');
throws('중복 w 는 죽는다', () => makeRegistry([bold, simpleMark({ w: 'b' })]), '두 번');
throws('부품이 다른 wing 의 w 와 부딪히면 죽는다', () =>
  makeRegistry([bold, {...table, parts: {...table.parts, b: { holds: 'blocks' } }, partHtml: {...table.partHtml, b: DEFAULT_BUILDERS['td'] as NonNullable<Wing['toHtml']> } } as Wing]), '부딪');
throws('노드 세우는 wing 에 toHtml 이 없으면 죽는다', () =>
  makeRegistry([{ w: 'x', place: 'mark' } as Wing]), 'toHtml');
throws('컨테이너에 holds 가 없으면 죽는다', () =>
  makeRegistry([{ w: 'x', place: 'container', toHtml: DEFAULT_BUILDERS['quote'] } as Wing]), 'holds');
throws('부품에 partHtml 이 없으면 죽는다', () =>
  makeRegistry([{...bullet, partHtml: {} } as Wing]), 'partHtml');
throws('컨테이너 아닌 wing 의 parts 는 죽는다', () =>
  makeRegistry([{...bold, parts: { x: { holds: 'blocks' } } } as Wing]), '컨테이너만');
throws('attr wing 에 attrKey 가 없으면 죽는다', () =>
  makeRegistry([{ w: 'align', place: 'attr' } as Wing]), 'attrKey');
throws('attrKey 가 화이트리스트(h·a·dc) 밖이면 죽는다', () =>
  makeRegistry([{ w: 'x', place: 'attr', attrKey: 'z' } as Wing]), '화이트리스트');
throws('커맨드 이름이 낱말 하나면 죽는다', () =>
  makeRegistry([{...bold, commands: { merge: () => null } } as Wing]), '이름 규칙');
throws('커맨드 이름이 대문자로 시작해도 죽는다', () =>
  makeRegistry([{...bold, commands: { MergeCells: () => null } } as Wing]), '이름 규칙');
throws('단축키 모양이 틀리면 죽는다', () =>
  makeRegistry([{...bold, button: { group: 'g', shortcut: 'ab' } } as Wing]), '한 글자');
throws('단축키가 겹치면 죽는다', () =>
  makeRegistry([
    {...bold, button: { group: 'g', shortcut: 'T' } } as Wing,
    {...italic, button: { group: 'g', shortcut: 'T' } } as Wing,
  ]), '단축키');
throws('가속키 모양이 틀리면 죽는다', () =>
  makeRegistry([{...bold, button: { group: 'g', accelerator: 'ctrl+s' } } as Wing]), 'mod+');
throws('가속키가 겹치면 죽는다', () =>
  makeRegistry([
    {...bold, button: { group: 'g', accelerator: 'mod+s' } } as Wing,
    {...italic, button: { group: 'g', accelerator: 'mod+s' } } as Wing,
  ]), '가속키');
throws('requiresAnyOf 가 안 채워지면 죽는다', () =>
  makeRegistry([{...bold, requiresAnyOf: ['upload'] } as Wing]), '함께 등록');
throws('allows 에 모르는 타입이 있으면 죽는다', () =>
  makeRegistry([{...quote, allows: ['ghost'] } as Wing]), '모르는 타입');
throws('커맨드 이름이 wing 둘에서 겹치면 죽는다', () =>
  makeRegistry([
    {...bold, commands: { insertStamp: () => null } } as Wing,
    {...italic, commands: { insertStamp: () => null } } as Wing,
  ]), '커맨드');

// --- 접힘 — env·builders·escapes ------------------------------------------------------------

const registry = makeRegistry(WINGS);

ok('lumps 접힘 — 물건 전부', ['img', 'ul', 'tl', 'quote', 'table'].every((w) => registry.env.lumps.has(w)));
ok('voids 접힘 — 블록 단말만', registry.env.voids.has('img') && !registry.env.voids.has('table'));
ok('blockHolders 접힘 — 컨테이너와 부품', ['table', 'tr', 'td', 'ul', 'li', 'tl', 'tli', 'quote'].every((w) => registry.env.blockHolders.has(w)));
ok('singleParagraph 접힘 — td', registry.env.singleParagraph?.has('td') === true);
ok('boolAttrs 접힘 — 항목 선언의 ck', registry.env.boolAttrs.has('ck'));
ok('마크는 갈래 집합에 안 들어간다', !registry.env.lumps.has('b') && !registry.env.blockHolders.has('b'));
ok('builders 접힘 — wing 과 부품 전부', ['b', 'hl', 'img', 'ul', 'li', 'table', 'tr', 'td', 'quote'].every((w) => registry.builders[w] !== undefined));
eq('escapes 접힘 — Escape 를 마크들이 선언', registry.escapes.get('Escape')?.includes('b'), true);
ok('ownerOf — 부품도 소유 wing 을 찾는다', registry.ownerOf('td') === table && registry.ownerOf('li') === bullet);
ok('ownerOf — 모르는 타입은 null', registry.ownerOf('ghost') === null);

// --- repair 접힘 — cocoon 을 지나며 wing 의 복구가 실제로 돈다 -------------------------------

{
  // boxObject: 목록 밖 값은 거절(스냅 금지), 모르는 attr(정렬 a — 폐지됨)는 떨어진다.
  const doc = cocoon([el('img', [], { src: '/x.png', w: '40', a: 'c' })], registry.env);
  const lump = (doc[0] as ElementNode).ch[0] as ElementNode;
  eq('img repair — 아는 값은 남는다', lump.a?.['src'], '/x.png');
  eq('img repair — 계약 밖 attr(정렬)는 떨어진다', lump.a?.['a'], undefined);

  const bad = cocoon([el('img', [], { src: 'javascript:x', w: '999' })], registry.env);
  const badLump = (bad[0] as ElementNode).ch[0] as ElementNode;
  eq('img repair — 목록 밖 src 는 거절', badLump.a?.['src'], undefined);
  eq('img repair — 폭 999 는 거절이지 스냅이 아니다', badLump.a?.['w'], undefined);
}

{
  // listFamily: 항목 아닌 블록은 항목으로 감싸진다.
  const doc = cocoon([el('ul', [p(['떠돌이'])])], registry.env);
  const list = (doc[0] as ElementNode).ch[0] as ElementNode;
  const item = list.ch[0] as ElementNode;
  eq('list repair — 떠도는 문단이 항목이 된다', item.w, 'li');
  eq('list repair — 글은 남는다', (item.ch[0] as ElementNode).ch[0], '떠돌이');
}

{
  // allows: quote 는 p 만 — 속의 표는 껍데기를 벗고 글이 살아남는다.
  const doc = cocoon(
    [el('quote', [el('table', [el('tr', [el('td', [p(['칸 글'])])])])])],
    registry.env,
);
  const lump = (doc[0] as ElementNode).ch[0] as ElementNode;
  eq('allows — quote 속 표는 벗겨진다', lump.ch.every((n) => isElement(n) && n.w === 'p'), true);
  ok('allows — 글은 남는다', JSON.stringify(lump.ch).includes('칸 글'));
}

// --- 조립 접힘 — registry.builders 로 그린 HTML ---------------------------------------------

{
  const stamp: Wing = {
...bold,
    toHtml: (_node, children, ctx) => ctx.element('strong', children(), { 'data-stamp': '1' }),
  };
  const reg = makeRegistry([stamp]);
  const doc = cocoon([p([el('b', ['굵게'])])], reg.env);
  const html = renderHtml(doc, { env: reg.env, builders: reg.builders });
  ok('wing 의 toHtml 이 기본 조립을 이긴다', html.includes('<strong data-stamp="1">굵게</strong>'), html);
}

// --- claim 접힘 — 첫 답이 이기고, 아무도 안 잡으면 null -------------------------------------

{
  const silent: Wing = {...bold, claim: () => null };
  const grabby: Wing = {...italic, claim: (elx) => (elx.tag === 'em' ? [el('i', ['잡음'])] : null) };
  const reg = makeRegistry([silent, grabby]);
  const grabbed = reg.claim?.(
    { kind: 'element', tag: 'em', attrs: {}, children: [] },
    () => [],
);
  eq('claim — 주장한 wing 의 답이 이긴다', grabbed, [el('i', ['잡음'])]);
  const passed = reg.claim?.(
    { kind: 'element', tag: 'kbd', attrs: {}, children: [] },
    () => [],
);
  eq('claim — 아무도 안 잡으면 null(기본 대응 몫)', passed, null);
}

// --- 키 소유 판정과 라우팅 -------------------------------------------------------------------

{
  const doc = cocoon(
    [p(['맨글']), el('table', [el('tr', [el('td', [p(['칸 글'])])])]), el('ul', [el('li', [p(['항목'])])])],
    registry.env,
);
  // doc: [0]=글 문단, [1]=래퍼(표), [2]=래퍼(리스트)
  const inCell = caretAt(at([1, 0, 0, 0, 0], 1));
  const owner = keyOwnerAt(doc, inCell, registry);
  ok('칸 속 캐럿의 소유자는 표 wing', owner?.wing === table);
  eq('소유 노드는 가장 안쪽 소유 타입(td)', owner?.owner.node.w, 'td');

  const inTop = caretAt(at([0], 1));
  ok('맨 문단의 캐럿은 코어(null)', keyOwnerAt(doc, inTop, registry) === null);

  const inItem = caretAt(at([2, 0, 0, 0], 2));
  ok('리스트 항목 속 소유자는 리스트 wing', keyOwnerAt(doc, inItem, registry)?.wing === bullet);

  const routed = routeKey({ key: 'tab' }, doc, inCell, registry.env, registry);
  ok('routeKey — 소유자가 받은 키는 결과가 온다', routed !== null);
  const passed = routeKey({ key: 'backspace' }, doc, inCell, registry.env, registry);
  ok('routeKey — null 은 pass(코어 차례)다', passed === null);
  const core = routeKey({ key: 'tab' }, doc, inTop, registry.env, registry);
  ok('routeKey — 소유자 없으면 곧장 pass', core === null);
}

// --- 팩토리 산출물 ---------------------------------------------------------------------------

eq('simpleMark — 갈래는 mark', bold.place, 'mark');
eq('simpleMark — escapeKeys 기본은 Escape', bold.escapeKeys, ['Escape']);
{
  const doc = cocoon([p([el('b', ['굵게'])])], registry.env);
  const html = renderHtml(doc, { env: registry.env, builders: registry.builders });
  ok('simpleMark — 기본 조립을 잇는다', html.includes('<b>굵게</b>'), html);
}
eq('valueMark — 목록 안 값은 currentValue 로 답한다', highlight.currentValue?.(el('hl', [], { c: 'yellow' })), 'yellow');
eq('valueMark — 목록 밖 값은 undefined', highlight.currentValue?.(el('hl', [], { c: 'pink' })), undefined);
eq('listFamily — 부품 선언(항목 = 문단 배열 컨테이너)', task.parts?.['tli']?.holds, 'blocks');
eq('listFamily — 체크는 override 훅(boolAttrs)', task.parts?.['tli']?.boolAttrs, ['ck']);

// --- 공용 부품 -------------------------------------------------------------------------------

{
  // 빈 문단 + 단일 물건 = 교체 — 정렬이 산다.
  const doc = cocoon([p([], { a: 'c' })], registry.env);
  const r = insertLump(doc, at([0], 0), el('img', [], { src: '/x.png' }), registry.env);
  const wrapper = r.doc[0] as ElementNode;
  eq('insertLump — 빈 문단은 교체된다', r.doc.length, 1);
  eq('insertLump — 정렬(a)이 산다', wrapper.a?.['a'], 'c');
  eq('insertLump — 캐럿은 물건 뒤(1)', r.caret, { path: [0], offset: 1 });
  ok('insertLump — 반환 자리 실재', positionExists(cocoon(r.doc, registry.env), r.caret, registry.env));
}
{
  // 글 있는 문단이면 그다음에 선다.
  const doc = cocoon([p(['글']), p(['뒤'])], registry.env);
  const r = insertLump(doc, at([0], 1), el('hr'), {...registry.env, lumps: new Set([...registry.env.lumps, 'hr']), voids: new Set([...registry.env.voids, 'hr']) });
  eq('insertLump — 글 문단 다음에 래퍼가 선다', (r.doc[1] as ElementNode).ch.length, 1);
  eq('insertLump — 캐럿은 새 래퍼의 1', r.caret, { path: [1], offset: 1 });
}
{
  const doc = cocoon([p(['앞']), el('img', [], { src: '/x.png' }), p(['뒤'])], registry.env);
  const r = removeLump(doc, 1, registry.env);
  eq('removeLump — 래퍼가 사라진다', r.doc.length, 2);
  eq('removeLump — 캐럿은 앞 문단의 끝', r.caret, { path: [0], offset: 1 });
  ok('removeLump — 반환 자리 실재', positionExists(r.doc, r.caret, registry.env));

  const only = cocoon([el('img', [], { src: '/x.png' })], registry.env);
  const gone = removeLump(only, 0, registry.env);
  eq('removeLump — 문서가 비면 빈 문단 하나', (gone.doc[0] as ElementNode).ch.length, 0);
  eq('removeLump — 캐럿은 그 빈 문단', gone.caret, { path: [0], offset: 0 });
}
{
  const doc = cocoon([p(['하나']), p(['둘'])], registry.env);
  const sel = { anchor: at([0], 0), focus: at([1], 1) };
  const wrappedR = toggleWrap(doc, sel, 'quote', registry.env);
  const wrapper = wrappedR.doc[0] as ElementNode;
  eq('toggleWrap — 감싸면 래퍼문단 하나가 된다', wrappedR.doc.length, 1);
  eq('toggleWrap — 속은 quote', (wrapper.ch[0] as ElementNode).w, 'quote');
  ok('toggleWrap — 캐럿 실재', positionExists(cocoon(wrappedR.doc, registry.env), wrappedR.caret, registry.env));

  const settled = cocoon(wrappedR.doc, registry.env);
  const [s] = ordered({ anchor: wrappedR.caret, focus: wrappedR.caret });
  const back = toggleWrap(settled, { anchor: s, focus: s }, 'quote', registry.env);
  eq('toggleWrap — 다시 누르면 풀린다', back.doc.length, 2);
  eq('toggleWrap — 푼 문단이 제자리', (back.doc[0] as ElementNode).ch[0], '하나');
  ok('toggleWrap — 푼 뒤 캐럿 실재', positionExists(cocoon(back.doc, registry.env), back.caret, registry.env));
}

// --- createNabiWith — registry 산출물이 editor 에 그대로 꽂힌다 ------------------------------

{
  const stamp: Wing = {
...bold,
    commands: {
      insertStamp: (doc, sel, _args, env) => {
        void env;
        const [start] = ordered(sel);
        return { doc, selection: caretAt(start) };
      },
    },
  };
  const { nabi } = createNabiWith([stamp, img, table, quote, bullet, task, highlight, italic], {
    doc: [{ w: 'p', ch: ['시작 '] }],
  });
  ok('createNabiWith — 에디터가 선다', nabi.getJson().length === 1);
  ok('insertText 가 돈다', nabi.applyCommand('insertText', { text: '글' }));
  ok('wing 커맨드가 같은 문으로 돈다 (무변화 침묵 — 무변화는 false)', nabi.applyCommand('insertStamp') === false);
  const html = nabi.getHtml();
  ok('getHtml 이 registry 조립으로 나온다', html.includes('<p>'), html);
}

done('wing');
