// doc 그물 — 입력 표(§2.4)·삭제 표(§2.5) 전 행 + 병합 속성 + 범위·물건(042) + 리스트 부품 +
// 마크 연산 + 공통 계약(반환 자리는 반환 문서에 실재한다 — 옛 mergeBox 버그의 교훈).
import { makeEnv, type ElementNode, type NabiDoc, type NabiNode } from '../src/schema/index.js';
import {
  comparePositions,
  deleteBackward,
  deleteForward,
  deleteRange,
  insertLine,
  insertText,
  positionExists,
  setMark,
  setParagraphAttr,
  splitParagraph,
  toggleMark,
  unwrapItem,
  type EditEnv,
  type EditResult,
  type Position,
} from '../src/doc/index.js';
import { done, eq, ok } from './net.js';

const ENV: EditEnv = {
...makeEnv({
    voids: ['hr', 'img', 'youtube'],
    lumps: ['hr', 'img', 'youtube', 'table', 'ul', 'ol', 'tl', 'quote', 'details', 'code'],
    blockHolders: ['table', 'tr', 'td', 'ul', 'li', 'ol', 'oli', 'tl', 'tli', 'quote', 'details'],
    inlineHolders: ['summary', 'code'],
    boolAttrs: ['dc', 'o', 'ck'],
  }),
  singleParagraph: new Set(['td']),
};

// --- 재료 ------------------------------------------------------------------------------------
const p = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode =>
  a ? { w: 'p', a, ch } : { w: 'p', ch };
const el = (w: string, ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode =>
  a ? { w, a, ch } : { w, ch };
const b = (ch: readonly NabiNode[]): ElementNode => el('b', ch);
const br = (): ElementNode => el('br');
const img = (): ElementNode => el('img', [], { src: '/x.png' });
const wrap = (lump: ElementNode, a?: Record<string, string | number>): ElementNode =>
  a ? { w: 'p', a, ch: [lump] } : { w: 'p', ch: [lump] };
const at = (path: readonly number[], offset: number): Position => ({ path, offset });

// 공통 계약 — 모든 연산의 반환 자리는 반환 문서에 실재한다.
function checked(name: string, result: EditResult): EditResult {
  ok(`${name} — 캐럿 실재`, positionExists(result.doc, result.caret, ENV), JSON.stringify(result.caret));
  if (result.anchor) {
    ok(`${name} — 앵커 실재`, positionExists(result.doc, result.anchor, ENV), JSON.stringify(result.anchor));
  }
  return result;
}

// --- 입력 표 (§2.4) --------------------------------------------------------------------------
{
  // 삽입 — 마크는 앞 글자를 따른다 (경계 정규화).
  const doc: NabiDoc = [p(['ab', b(['cd']), 'ef'])];
  const r1 = checked('삽입: 마크 끝 경계(안)', insertText(doc, at([0], 4), 'X', ENV));
  eq('삽입: 마크 끝 경계는 마크 안', r1.doc, [p(['ab', b(['cdX']), 'ef'])]);
  eq('삽입: 캐럿 전진', r1.caret, at([0], 5));

  const r2 = checked('삽입: 마크 앞 경계(밖)', insertText(doc, at([0], 2), 'X', ENV));
  eq('삽입: 마크 앞 경계는 마크 밖', r2.doc, [p(['abX', b(['cd']), 'ef'])]);

  const r3 = checked('삽입: 문단 처음 무마크', insertText([p([b(['cd'])])], at([0], 0), 'X', ENV));
  eq('삽입: 문단 처음은 무마크', r3.doc, [p(['X', b(['cd'])])]);

  const r4 = checked('삽입: 명시 마크(예약)', insertText(doc, at([0], 0), 'X', ENV, [b([])]));
  eq('삽입: 예약 마크가 기본을 이긴다', r4.doc, [p([b(['X']), 'ab', b(['cd']), 'ef'])]);
}
{
  // 래퍼문단 0/1 — 위/아래에 새 문단이 생기며 글자가 들어간다.
  const doc: NabiDoc = [wrap(img())];
  const up = checked('삽입: 래퍼 0 → 위', insertText(doc, at([0], 0), 'X', ENV));
  eq('삽입: 래퍼 위 새 문단', up.doc, [p(['X']), wrap(img())]);
  eq('삽입: 래퍼 위 캐럿', up.caret, at([0], 1));
  const down = checked('삽입: 래퍼 1 → 아래', insertText(doc, at([0], 1), 'X', ENV));
  eq('삽입: 래퍼 아래 새 문단', down.doc, [wrap(img()), p(['X'])]);
  eq('삽입: 래퍼 아래 캐럿', down.caret, at([1], 1));
}
{
  // 라인 — 마크 안에서 마크를 잇는다 (예: <b>45<br/>6</b>).
  const doc: NabiDoc = [p(['123', b(['456']), '789'])];
  const r = checked('라인: 마크 안', insertLine(doc, at([0], 5), ENV));
  eq('라인: 마크 안에 선다', r.doc, [p(['123', b(['45', br(), '6']), '789'])]);
  eq('라인: 캐럿 한 칸 전진', r.caret, at([0], 6));

  const r2 = checked('라인: 맨글', insertLine([p(['ab'])], at([0], 1), ENV));
  eq('라인: 맨글 사이', r2.doc, [p(['a', br(), 'b'])]);

  const r3 = checked('라인: 래퍼(유도)', insertLine([wrap(img())], at([0], 1), ENV));
  eq('라인: 래퍼에서는 빈 문단(엔터와 같은 길)', r3.doc, [wrap(img()), p([])]);
}
{
  // 분할 — 마크는 끊기고(캐럿이 마크 밖) 뒤쪽 절반의 마크는 산다.
  const doc: NabiDoc = [p(['123', b(['456']), '789'])];
  const r = checked('분할: 마크 경계', splitParagraph(doc, at([0], 5), ENV));
  eq('분할: 두 문단', r.doc, [p(['123', b(['45'])]), p([b(['6']), '789'])]);
  eq('분할: 캐럿 새 문단 처음', r.caret, at([1], 0));
}
{
  // 분할 속성 — 셋이 서로 다른 규칙을 쓴다:
  //   a  양쪽 다 (자리잡기라 이어진다)
  //   dc 첫 글자를 가진 쪽만 (첫 글자에 걸리는 것이라 글을 따라간다)
  //   h  **글이 있는 쪽만** — 빈 문단은 제목이 아니다
  const doc: NabiDoc = [p(['Xy'], { h: 2, a: 'c', dc: 1 })];
  const mid = checked('분할: 속성(중간)', splitParagraph(doc, at([0], 1), ENV));
  eq('분할: 가운데를 가르면 양쪽 다 제목이다', mid.doc, [p(['X'], { h: 2, a: 'c', dc: 1 }), p(['y'], { h: 2, a: 'c' })]);

  const front = checked('분할: 속성(맨 앞)', splitParagraph(doc, at([0], 0), ENV));
  eq('분할: 빈 머리는 제목을 안 받고, 꼬리가 드롭캡을 갖는다', front.doc, [p([], { a: 'c' }), p(['Xy'], { h: 2, a: 'c', dc: 1 })]);

  // 제목 끝에서 엔터 — **다음 줄은 본문을 쓰려는 자리다.** 빈 문단이 제목을 물려받으면
  // 글자를 치는 순간 제목 둘이 되어, 사람이 매번 제목을 풀어야 했다.
  const tailDoc: NabiDoc = [p(['제목글'], { h: 1 })];
  const end = checked('분할: 제목 끝', splitParagraph(tailDoc, at([0], 3), ENV));
  eq('분할: 제목 끝의 엔터는 평범한 문단을 연다', end.doc, [p(['제목글'], { h: 1 }), p([])]);

  // 정렬은 이어진다 — 제목만 안 따라간다.
  const centred: NabiDoc = [p(['가나'], { h: 2, a: 'c' })];
  const after = checked('분할: 정렬 든 제목 끝', splitParagraph(centred, at([0], 2), ENV));
  eq('분할: 정렬은 이어지고 제목만 떨어진다', after.doc, [p(['가나'], { h: 2, a: 'c' }), p([], { a: 'c' })]);
}
{
  // 분할 — 래퍼 0=위·1=아래 빈 문단 (옛 060 이 규칙이 된 자리).
  const doc: NabiDoc = [wrap(img())];
  const up = checked('분할: 래퍼 0', splitParagraph(doc, at([0], 0), ENV));
  eq('분할: 위에 빈 문단', up.doc, [p([]), wrap(img())]);
  eq('분할: 캐럿 위 빈 문단', up.caret, at([0], 0));
  const down = checked('분할: 래퍼 1', splitParagraph(doc, at([0], 1), ENV));
  eq('분할: 아래에 빈 문단', down.doc, [wrap(img()), p([])]);
  eq('분할: 캐럿 아래 빈 문단', down.caret, at([1], 0));
}
{
  // 분할 — 인라인 홀더(code)와 문단 하나 고정(td) 속의 엔터는 라인이다.
  const codeDoc: NabiDoc = [wrap(el('code', ['xy'], { lang: 'ts' }))];
  const r = checked('분할: code 속 = 라인', splitParagraph(codeDoc, at([0, 0], 1), ENV));
  eq('분할: code 에 라인', r.doc, [wrap(el('code', ['x', br(), 'y'], { lang: 'ts' }))]);

  const tdDoc: NabiDoc = [wrap(el('table', [el('tr', [el('td', [p(['ab'])])])]))];
  const r2 = checked('분할: 칸 속 = 라인', splitParagraph(tdDoc, at([0, 0, 0, 0, 0], 1), ENV));
  eq('분할: 칸의 문단에 라인', r2.doc, [wrap(el('table', [el('tr', [el('td', [p(['a', br(), 'b'])])])]))]);
}

// --- 삭제 표 (§2.5) --------------------------------------------------------------------------
{
  // 홀더 안 한 칸.
  const r = checked('BS: 글자 한 칸', deleteBackward([p(['ab'])], at([0], 2), ENV));
  eq('BS: 글자', r.doc, [p(['a'])]);
  eq('BS: 캐럿', r.caret, at([0], 1));

  const r2 = checked('BS: 라인 한 칸', deleteBackward([p(['a', br(), 'b'])], at([0], 2), ENV));
  eq('BS: 라인이 사라진다', r2.doc, [p(['ab'])]);

  const r3 = checked('BS: 서로게이트 쌍', deleteBackward([p(['a\u{1F600}b'])], at([0], 3), ENV));
  eq('BS: 이모지 통째', r3.doc, [p(['ab'])]);
  eq('BS: 이모지 뒤 캐럿', r3.caret, at([0], 1));

  const r4 = checked('Del: 글자 한 칸', deleteForward([p(['ab'])], at([0], 0), ENV));
  eq('Del: 글자', r4.doc, [p(['b'])]);
  eq('Del: 캐럿 제자리', r4.caret, at([0], 0));
}
{
  // 문단 첫머리 — 앞이 문단이면 병합 (속성은 윗 속성, 빈 문단도 같은 규칙).
  const r = checked(
    'BS: 병합',
    deleteBackward([p(['ab'], { h: 1 }), p(['cd'], { a: 'c' })], at([1], 0), ENV),
);
  eq('BS: 병합 — 윗 속성', r.doc, [p(['abcd'], { h: 1 })]);
  eq('BS: 병합 — 이음매 캐럿', r.caret, at([0], 2));

  const r2 = checked('BS: 빈 문단', deleteBackward([p(['ab']), p([])], at([1], 0), ENV));
  eq('BS: 빈 문단은 병합으로 사라진다', r2.doc, [p(['ab'])]);
  eq('BS: 빈 문단 캐럿', r2.caret, at([0], 2));

  const r3 = checked('BS: 첫 문단 첫머리', deleteBackward([p(['ab'])], at([0], 0), ENV));
  eq('BS: 아무 일 없음', r3.doc, [p(['ab'])]);
}
{
  // 문단 첫머리 — 앞이 **속 없는 물건**이면 통째 삭제 (예).
  const r = checked('BS: 앞 래퍼 통삭제', deleteBackward([wrap(img()), p(['ab'])], at([1], 0), ENV));
  eq('BS: 래퍼가 사라진다', r.doc, [p(['ab'])]);
  eq('BS: 캐럿 유지', r.caret, at([0], 0));
}
{
  // 앞이 **글을 품은 그릇**이면 통째 삭제가 아니라 **그 속 마지막 글자리에 이어 붙는다.**
  // 목록 뒤에서 백스페이스 한 번에 목록 전체가 사라지던 자리다.
  const quote = el('quote', [p(['quoted'])]);
  const r = checked('BS: 앞 그릇에 이어 붙는다', deleteBackward([wrap(quote), p(['tail'])], at([1], 0), ENV));
  eq('BS: 그릇 속 마지막 글자리에 붙었다', r.doc, [wrap(el('quote', [p(['quotedtail'])]))]);
  eq('BS: 캐럿은 이어 붙은 자리', r.caret, at([0, 0, 0], 6));

  // 목록 사이에 끼어 있던 문단이 사라지면 **위아래 목록은 원래 하나였다** — 둘로 남기면
  // 번호가 1 부터 다시 시작한다.
  const listOf = (...texts: string[]) => el('ul', texts.map((t) => el('li', [p([t])])));
  const between = checked(
    'BS: 목록 사이의 문단',
    deleteBackward([wrap(listOf('aaa')), p(['mid']), wrap(listOf('bbb'))], at([1], 0), ENV),
);
  eq('BS: 문단이 앞 목록 끝에 붙고 뒤 목록도 합쳐진다', between.doc, [wrap(listOf('aaamid', 'bbb'))]);
  eq('BS: 캐럿은 붙은 자리', between.caret, at([0, 0, 0, 0], 3));

  // 갈래가 다르면 안 합친다 — 글머리와 번호는 서로 다른 목록이다.
  const mixed = checked(
    'BS: 갈래가 다른 목록',
    deleteBackward(
      [wrap(listOf('aaa')), p(['mid']), wrap(el('ol', [el('oli', [p(['bbb'])])]))],
      at([1], 0),
      ENV,
),
);
  eq('BS: 뒤 목록은 그대로 남는다', mixed.doc.length, 2);
}
{
  // 래퍼 안 — 1(물건 뒤) 백스페이스 = 물건 통째.
  const r = checked('BS: 래퍼 1', deleteBackward([p(['ab']), wrap(img())], at([1], 1), ENV));
  eq('BS: 래퍼 1 — 물건 삭제', r.doc, [p(['ab'])]);
  eq('BS: 래퍼 1 — 앞 문단 끝', r.caret, at([0], 2));

  const solo = checked('BS: 마지막 물건', deleteBackward([wrap(img())], at([0], 1), ENV));
  eq('BS: 문서가 비면 빈 문단', solo.doc, [p([])]);
  eq('BS: 빈 문단 캐럿', solo.caret, at([0], 0));

  const nextOnly = checked('BS: 래퍼 1, 뒤만 있음', deleteBackward([wrap(img()), p(['x'])], at([0], 1), ENV));
  eq('BS: 다음 처음으로', nextOnly.caret, at([0], 0));
  eq('BS: 다음만 남는다', nextOnly.doc, [p(['x'])]);
}
{
  // 래퍼 안 — 0(물건 앞) 백스페이스 = 앞 이웃에 작용.
  const r = checked('BS: 래퍼 0 경계', deleteBackward([p(['1234']), wrap(el('table'))], at([1], 0), ENV));
  eq('BS: 앞 문단 끝 글자 삭제', r.doc, [p(['123']), wrap(el('table'))]);
  eq('BS: 캐럿이 앞 문단으로', r.caret, at([0], 3));

  const empty = checked('BS: 래퍼 0 빈 이웃', deleteBackward([p([]), wrap(img())], at([1], 0), ENV));
  eq('BS: 빈 이웃이 사라진다', empty.doc, [wrap(img())]);
  eq('BS: 캐럿 래퍼 0 유지', empty.caret, at([0], 0));

  const lump = checked('BS: 래퍼 0 앞이 래퍼', deleteBackward([wrap(img()), wrap(el('table'))], at([1], 0), ENV));
  eq('BS: 앞 래퍼 통삭제', lump.doc, [wrap(el('table'))]);
  eq('BS: 캐럿 유지(당겨진 인덱스)', lump.caret, at([0], 0));

  const none = checked('BS: 래퍼 0 앞 없음', deleteBackward([wrap(img())], at([0], 0), ENV));
  eq('BS: 아무 일 없음', none.doc, [wrap(img())]);
}
{
  // Delete 대칭.
  const merge = checked(
    'Del: 병합',
    deleteForward([p(['ab'], { h: 1 }), p(['cd'], { a: 'c' })], at([0], 2), ENV),
);
  eq('Del: 병합 — 지금(윗) 속성', merge.doc, [p(['abcd'], { h: 1 })]);
  eq('Del: 캐럿 제자리', merge.caret, at([0], 2));

  const lump = checked('Del: 뒤 래퍼 통삭제', deleteForward([p(['ab']), wrap(img())], at([0], 2), ENV));
  eq('Del: 래퍼가 사라진다', lump.doc, [p(['ab'])]);

  const w0 = checked('Del: 래퍼 0 = 물건', deleteForward([p(['ab']), wrap(img()), p(['cd'])], at([1], 0), ENV));
  eq('Del: 물건 통째', w0.doc, [p(['ab']), p(['cd'])]);
  eq('Del: 앞 문단 끝으로', w0.caret, at([0], 2));

  const w1 = checked('Del: 래퍼 1 → 뒤 이웃', deleteForward([wrap(img()), p(['xy'])], at([0], 1), ENV));
  eq('Del: 뒤 문단 첫 글자 삭제', w1.doc, [wrap(img()), p(['y'])]);
  eq('Del: 캐럿이 뒤 문단 처음', w1.caret, at([1], 0));

  const w1e = checked('Del: 래퍼 1 → 빈 이웃', deleteForward([wrap(img()), p([])], at([0], 1), ENV));
  eq('Del: 빈 이웃 삭제', w1e.doc, [wrap(img())]);
  eq('Del: 캐럿 래퍼 1 유지', w1e.caret, at([0], 1));

  const end = checked('Del: 마지막 문단 끝', deleteForward([p(['ab'])], at([0], 2), ENV));
  eq('Del: 아무 일 없음', end.doc, [p(['ab'])]);
}

// --- 범위 삭제 -------------------------------------------------------------------------------
{
  const same = checked('범위: 한 홀더 안', deleteRange([p(['abcdef'])], { anchor: at([0], 1), focus: at([0], 4) }, ENV));
  eq('범위: 가운데가 사라진다', same.doc, [p(['aef'])]);
  eq('범위: 캐럿 시작', same.caret, at([0], 1));

  const rev = checked('범위: 역방향 정규화', deleteRange([p(['abcdef'])], { anchor: at([0], 4), focus: at([0], 1) }, ENV));
  eq('범위: 역방향도 같다', rev.doc, [p(['aef'])]);

  const cross = checked(
    '범위: 문단 둘 병합',
    deleteRange([p(['abc'], { h: 1 }), p(['def'], { a: 'c' })], { anchor: at([0], 2), focus: at([1], 1) }, ENV),
);
  eq('범위: 잘리고 병합(윗 속성)', cross.doc, [p(['abef'], { h: 1 })]);
  eq('범위: 캐럿 시작', cross.caret, at([0], 2));

  // 빈 문서의 모양은 하나다 — 어느 길로 비웠든 맨몸 문단이다 (주인 신고 2026-08-20).
  // 전체선택 삭제는 시작 문단의 껍데기를 남기는데, 거기 붙어 있던 정렬·제목이 빈 줄에 살아
  // 남으면 다 지운 자리가 여전히 가운데 정렬이고 다시 쓰는 글도 그 서식으로 써진다.
  const wipeAlign = checked(
    '범위: 통째로 지우면 정렬이 안 남는다',
    deleteRange([p(['abc'], { a: 'c' })], { anchor: at([0], 0), focus: at([0], 3) }, ENV),
  );
  eq('범위: 빈 문서는 맨몸 문단 하나', wipeAlign.doc, [p([])]);
  eq('범위: 캐럿은 그 첫머리', wipeAlign.caret, at([0], 0));

  const wipeAll = checked(
    '범위: 전체선택 삭제(제목 + 여러 문단)',
    deleteRange([p(['abc'], { h: 1 }), p(['def'], { a: 'c' })], { anchor: at([0], 0), focus: at([1], 3) }, ENV),
  );
  eq('범위: 제목도 안 남는다', wipeAll.doc, [p([])]);

  // 문단 **하나만** 비운 것은 안 건드린다 — 그 줄을 다시 쓰려는 것이라 서식이 남는 것이 맞다.
  const oneLine = checked(
    '범위: 여러 줄 중 한 줄만 비우기',
    deleteRange([p(['abc'], { a: 'c' }), p(['def'])], { anchor: at([0], 0), focus: at([0], 3) }, ENV),
  );
  eq('범위: 그 줄의 정렬은 그대로다', oneLine.doc, [p([], { a: 'c' }), p(['def'])]);

  const lump = checked(
    '범위: 사이 물건 통삭제(042)',
    deleteRange([p(['abc']), wrap(img()), p(['def'])], { anchor: at([0], 1), focus: at([2], 2) }, ENV),
);
  eq('범위: 물건이 함께 사라진다', lump.doc, [p(['af'])]);

  const startLump = checked(
    '범위: 시작이 래퍼 0',
    deleteRange([wrap(img()), p(['ab'])], { anchor: at([0], 0), focus: at([1], 1) }, ENV),
);
  eq('범위: 래퍼 통삭제 + 끝 문단 잘림', startLump.doc, [p(['b'])]);
  eq('범위: 캐럿 그 자리 처음', startLump.caret, at([0], 0));

  const whole = checked(
    '범위: 전체 선택',
    deleteRange([p(['ab']), wrap(img())], { anchor: at([0], 0), focus: at([1], 1) }, ENV),
);
  eq('범위: 경계 문단은 남는다(빈 문단)', whole.doc, [p([])]);
  eq('범위: 캐럿', whole.caret, at([0], 0));
}
{
  // 부분 걸린 컨테이너 — 속만 비운다 (구조는 지킨다).
  const table = wrap(el('table', [el('tr', [el('td', [p(['cd'])]), el('td', [p(['ef'])])])]));
  const r = checked(
    '범위: 표 부분 — 속만',
    deleteRange([p(['ab']), table], { anchor: at([0], 1), focus: at([1, 0, 0, 1, 0], 1) }, ENV),
);
  eq('범위: 칸 구조 유지·속만 비움', r.doc, [
    p(['a']),
    wrap(el('table', [el('tr', [el('td', [p([])]), el('td', [p(['f'])])])])),
  ]);
  eq('범위: 캐럿 시작', r.caret, at([0], 1));
}
// --- 목록 앞 문단 끝 + Delete (§9 B) -------------------------------------------------
//
// §7(목록 뒤 문단 첫머리 + 백스페이스)의 **거울**이다. 전에는 뒤 그릇을 통째로 지웠다 — 그
// 가지는 속이 없는 물건(그림·구분선)의 답인데 그릇에도 그대로 맞아서, 문단 끝에서 Delete 한 번에
// 목록이 항목 둘을 든 채 사라졌다.
{
  const item = (text: string) => ({ w: 'li', ch: [p([text])] });
  const ul = (...texts: string[]) => p([{ w: 'ul', ch: texts.map(item) }]);

  const pulled = deleteForward([p(['head']), ul('aaa', 'bbb')], at([0], 4), ENV);
  eq('Delete: 목록 앞 문단 끝 — 첫 항목의 글이 끌려 올라온다', pulled.doc, [p(['headaaa']), ul('bbb')]);
  eq('Delete: 캐럿은 이어 붙은 자리', pulled.caret, at([0], 4));

  const lone = deleteForward([p(['head']), ul('aaa')], at([0], 4), ENV);
  eq('Delete: 항목이 하나뿐이면 목록째 사라진다', lone.doc, [p(['headaaa'])]);

  const quote = p([{ w: 'quote', ch: [p(['q1']), p(['q2'])] }]);
  const q = deleteForward([p(['head']), quote], at([0], 4), ENV);
  eq('Delete: 인용도 같은 길 — 첫 문단만 올라온다', q.doc, [p(['headq1']), p([{ w: 'quote', ch: [p(['q2'])] }])]);

  // 속이 없는 물건은 예전대로 통째 삭제다 — 끌어올릴 글이 없다.
  const rule = deleteForward([p(['head']), p([{ w: 'hr', ch: [] }])], at([0], 4), ENV);
  eq('Delete: 구분선은 통째로 걷힌다', rule.doc, [p(['head'])]);
}

// --- 범위 삭제 — 지운 뒤 두 끝이 만난다 (§11 B) ------------------------------------
//
// 글 문단끼리는 원래 그랬다. 목록이 걸치면 반쪽들이 따로 남던 것을 같은 규칙으로 맞췄다.
{
  const item = (text: string) => ({ w: 'li', ch: [p([text])] });
  const ul = (...texts: string[]) => p([{ w: 'ul', ch: texts.map(item) }]);

  const across = deleteRange([p(['head']), ul('aaa', 'bbb')], { anchor: at([0], 2), focus: at([1, 0, 0, 0], 2) }, ENV);
  eq('범위: 문단+항목이 걸치면 두 끝이 만난다', across.doc, [p(['hea']), ul('bbb')]);

  const items = deleteRange([ul('aaa', 'bbb')], { anchor: at([0, 0, 0, 0], 1), focus: at([0, 0, 1, 0], 1) }, ENV);
  eq('범위: 항목끼리 걸치면 한 항목이 된다', items.doc, [ul('abb')]);

  const tail = deleteRange([ul('aaa'), p(['tail'])], { anchor: at([0, 0, 0, 0], 1), focus: at([1], 2) }, ENV);
  eq('범위: 항목+뒤 문단도 만난다', tail.doc, [ul('ail')]);

  // 전부 잡았으면 목록이 걷힌다 — 빈 항목 껍데기를 남기지 않는다.
  const whole = deleteRange([ul('aaa', 'bbb')], { anchor: at([0, 0, 0, 0], 0), focus: at([0, 0, 1, 0], 3) }, ENV);
  eq('범위: 목록 글을 전부 잡으면 목록이 걷힌다', whole.doc, [p([])]);

  // 접기 제목은 문단이 아니다 — 그 경계는 병합의 자리가 아니다.
  const box = p([{ w: 'details', ch: [{ w: 'summary', ch: ['제목'] }, p(['속'])] }]);
  const kept = deleteRange([p(['ab']), box], { anchor: at([0], 1), focus: at([1, 0, 0], 1) }, ENV);
  ok('범위: 접기 제목과는 안 합친다', JSON.stringify(kept.doc).includes('summary'));
}

{
  // 같은 컨테이너(자유 스코프) 안 — 통삭제와 병합이 산다.
  const doc: NabiDoc = [wrap(el('quote', [p(['ab']), p(['cd']), p(['ef'])]))];
  const r = checked(
    '범위: 인용 속 문단들',
    deleteRange(doc, { anchor: at([0, 0, 0], 1), focus: at([0, 0, 2], 1) }, ENV),
);
  eq('범위: 인용 속 병합', r.doc, [wrap(el('quote', [p(['af'])]))]);
}

// --- 리스트 부품 -----------------------------------------------------------------------------
{
  const li = (text: string): ElementNode => el('li', [p([text])]);
  const list = (items: readonly ElementNode[]): ElementNode => wrap(el('ul', items));

  const mid = checked('리스트: 가운데 풀기', unwrapItem([list([li('1'), li('2'), li('3')])], [0, 0, 1], ENV));
  eq('리스트: 앞뒤로 갈라진다', mid.doc, [
    wrap(el('ul', [li('1')])),
    p(['2']),
    { w: 'p', ch: [{ w: 'ul', ch: [li('3')] }] },
  ]);
  eq('리스트: 캐럿 풀린 문단', mid.caret, at([1], 0));

  const first = checked('리스트: 첫 항목 풀기', unwrapItem([list([li('1'), li('2')])], [0, 0, 0], ENV));
  eq('리스트: 문단이 위로', first.doc, [p(['1']), wrap(el('ul', [li('2')]))]);
  eq('리스트: 캐럿', first.caret, at([0], 0));

  const only = checked('리스트: 유일 항목', unwrapItem([list([li('x')])], [0, 0, 0], ENV));
  eq('리스트: 리스트가 사라진다', only.doc, [p(['x'])]);
}

// --- 마크 연산 -------------------------------------------------------------------------------
{
  const range = { anchor: at([0], 1), focus: at([0], 3) };
  const add = checked('마크: 토글 입힘', toggleMark([p(['abcd'])], range, b([]), ENV));
  eq('마크: 가운데만 굵게', add.doc, [p(['a', b(['bc']), 'd'])]);

  const off = checked('마크: 토글 벗김', toggleMark([p([b(['abcd'])])], range, b([]), ENV));
  eq('마크: 가운데만 벗겨진다', off.doc, [p([b(['a']), 'bc', b(['d'])])]);

  const cross = checked(
    '마크: 홀더 둘',
    toggleMark([p(['ab']), p(['cd'])], { anchor: at([0], 1), focus: at([1], 1) }, b([]), ENV),
);
  eq('마크: 두 문단에 걸친다', cross.doc, [p(['a', b(['b'])]), p([b(['c']), 'd'])]);

  const line = checked('마크: 라인 포함', toggleMark([p(['a', br(), 'b'])], { anchor: at([0], 0), focus: at([0], 3) }, b([]), ENV));
  eq('마크: 라인도 마크 안', line.doc, [p([b(['a', br(), 'b'])])]);

  const hl = checked('마크: 값 마크 set', setMark([p(['abcd'])], range, 'hl', { c: 'yellow' }, ENV));
  eq('마크: 형광펜', hl.doc, [p(['a', el('hl', ['bc'], { c: 'yellow' }), 'd'])]);

  const swap = checked('마크: 값 교체', setMark([p([el('hl', ['ab'], { c: 'yellow' })])], { anchor: at([0], 0), focus: at([0], 2) }, 'hl', { c: 'green' }, ENV));
  eq('마크: 색이 갈린다', swap.doc, [p([el('hl', ['ab'], { c: 'green' })])]);

  const clear = checked('마크: 값 벗김', setMark([p([el('hl', ['ab'], { c: 'yellow' })])], { anchor: at([0], 0), focus: at([0], 2) }, 'hl', null, ENV));
  eq('마크: 맨글로', clear.doc, [p(['ab'])]);
}
{
  // 문단 속성 — 접힌 캐럿은 자기 문단, 래퍼는 정렬만, 값 검증은 cocoon 과 같은 규칙.
  const one = checked('속성: 제목', setParagraphAttr([p(['ab'])], { anchor: at([0], 1), focus: at([0], 1) }, 'h', 2, ENV));
  eq('속성: h 얹힘', one.doc, [p(['ab'], { h: 2 })]);

  const bad = checked('속성: 값 거절', setParagraphAttr([p(['ab'])], { anchor: at([0], 1), focus: at([0], 1) }, 'h', 9, ENV));
  eq('속성: h 9 는 거절', bad.doc, [p(['ab'])]);

  const wrapA = checked('속성: 래퍼 정렬', setParagraphAttr([wrap(img())], { anchor: at([0], 0), focus: at([0], 0) }, 'a', 'c', ENV));
  eq('속성: 래퍼에 정렬', wrapA.doc, [wrap(img(), { a: 'c' })]);

  const wrapH = checked('속성: 래퍼 제목 거절', setParagraphAttr([wrap(img())], { anchor: at([0], 0), focus: at([0], 0) }, 'h', 2, ENV));
  eq('속성: 래퍼에 h 는 안 얹힌다', wrapH.doc, [wrap(img())]);

  const drop = checked('속성: 벗김', setParagraphAttr([p(['ab'], { h: 2, a: 'c' })], { anchor: at([0], 0), focus: at([0], 0) }, 'h', null, ENV));
  eq('속성: h 만 벗겨진다', drop.doc, [p(['ab'], { a: 'c' })]);

  const many = checked('속성: 범위', setParagraphAttr([p(['ab']), p(['cd'])], { anchor: at([0], 1), focus: at([1], 1) }, 'a', 'r', ENV));
  eq('속성: 두 문단 정렬', many.doc, [p(['ab'], { a: 'r' }), p(['cd'], { a: 'r' })]);
}

// --- 좌표 질서 -------------------------------------------------------------------------------
{
  ok('순서: 래퍼 0 은 속보다 앞', comparePositions(at([1], 0), at([1, 0, 0, 0, 0], 0)) < 0);
  ok('순서: 래퍼 1 은 속보다 뒤', comparePositions(at([1], 1), at([1, 0, 0, 0, 0], 3)) > 0);
  ok('순서: 같은 홀더는 오프셋', comparePositions(at([0], 1), at([0], 2)) < 0);
  ok('순서: 형제', comparePositions(at([0], 5), at([1], 0)) < 0);
}

done('doc');
