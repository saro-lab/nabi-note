// caret 그물 — 경계 정규화(경계 예시 4벌)·걸음 나열(래퍼 0/1 출입·라인·칸)·물건 범위(042)
// 예약 상태 전이 표. 좌표는 (문단, 오프셋) 하나라는 것이 이 층의 전부다.
import { makeEnv, type ElementNode, type NabiDoc, type NabiNode } from '../src/schema/index.js';
import { deleteRange, positionExists, type EditEnv, type Position } from '../src/doc/index.js';
import {
  caretAt,
  docEnd,
  docStart,
  isCollapsed,
  isObjectSelection,
  makeArmed,
  marksAt,
  ordered,
  samePosition,
  sameSelection,
  selectObject,
  selectionExists,
  stepBackward,
  stepForward,
} from '../src/caret/index.js';
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

const p = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode =>
  a ? { w: 'p', a, ch } : { w: 'p', ch };
const el = (w: string, ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode =>
  a ? { w, a, ch } : { w, ch };
const b = (ch: readonly NabiNode[]): ElementNode => el('b', ch);
const br = (): ElementNode => el('br');
const img = (): ElementNode => el('img', [], { src: '/x.png' });
const wrap = (lump: ElementNode): ElementNode => ({ w: 'p', ch: [lump] });
const at = (path: readonly number[], offset: number): Position => ({ path, offset });
const markNames = (marks: readonly ElementNode[]): string[] => marks.map((m) => m.w);

// --- 경계 정규화 — "캐럿은 바로 앞 글자의 마크를 따른다. 문단 처음이면 무마크다." ---------
{
  // 예 ①: <p>(커서)<b>aaa</b></p> — 타이핑 = 무마크 (시작점 외부).
  const d1: NabiDoc = [p([b(['aaa'])])];
  eq('정규화: 마크 앞 문단 처음 = 무마크', markNames(marksAt(d1, at([0], 0), ENV)), []);

  // 예 ②: <p><b>aaa(커서)</b></p> — 타이핑 = b (끝점 내부).
  eq('정규화: 마크 끝 = 마크 안', markNames(marksAt(d1, at([0], 3), ENV)), ['b']);

  // 예 ③: <p>123<b>45<br/>(커서)6</b>789</p> — 라인 뒤 = 라인 앞 글자의 마크(b).
  const d2: NabiDoc = [p(['123', b(['45', br(), '6']), '789'])];
  eq('정규화: 라인 뒤 = 앞 글자의 마크', markNames(marksAt(d2, at([0], 6), ENV)), ['b']);

  // 예 ④: 맨 문단 처음 = 무마크.
  const d3: NabiDoc = [p(['abc'])];
  eq('정규화: 문단 처음 = 무마크', markNames(marksAt(d3, at([0], 0), ENV)), []);

  // 마크 시작 경계 = 바깥(앞 글자가 맨글자).
  const d4: NabiDoc = [p(['ab', b(['cd'])])];
  eq('정규화: 마크 시작 경계 = 바깥', markNames(marksAt(d4, at([0], 2), ENV)), []);

  // 마크 사이 경계 = 앞 마크.
  const d5: NabiDoc = [p([b(['a']), el('i', ['z'])])];
  eq('정규화: 마크 사이 = 앞 마크', markNames(marksAt(d5, at([0], 1), ENV)), ['b']);

  // 중첩 마크 안 = 더미 전부(바깥→안).
  const d6: NabiDoc = [p([b([el('i', ['x'])])])];
  eq('정규화: 중첩 마크 더미', markNames(marksAt(d6, at([0], 1), ENV)), ['b', 'i']);

  // 래퍼문단 안(0/1) = 무마크 — 타이핑은 새 글 문단으로 나간다.
  const d7: NabiDoc = [wrap(img())];
  eq('정규화: 래퍼 0 = 무마크', markNames(marksAt(d7, at([0], 0), ENV)), []);
  eq('정규화: 래퍼 1 = 무마크', markNames(marksAt(d7, at([0], 1), ENV)), []);
}

// --- 걸음 나열 -------------------------------------------------------------------------------
// 앞으로 끝까지 걸으며 자리를 모은다 — 나열 자체가 캐럿 자리의 전수다.
function walkAll(doc: NabiDoc): Position[] {
  const seen: Position[] = [];
  let pos = docStart(doc, ENV);
  ok('걸음: 시작 자리 있음', pos !== null);
  if (!pos) return seen;
  seen.push(pos);
  for (let i = 0; i < 200; i += 1) {
    const next = stepForward(doc, pos as Position, ENV);
    if (samePosition(next, pos as Position)) break;
    seen.push(next);
    pos = next;
  }
  return seen;
}

{
  // 나열: img1.0 → img1.1 → img2.0 → img2.1 → table.0 → (칸) → table.1.
  const cell = el('td', [p(['ab'])]);
  const table = el('table', [el('tr', [cell])]);
  const doc: NabiDoc = [wrap(img()), wrap(img()), wrap(table)];
  const path = walkAll(doc);
  eq(
    '걸음: 물건·표 나열',
    path,
    [
      at([0], 0), at([0], 1),           // img1 앞·뒤
      at([1], 0), at([1], 1),           // img2 앞·뒤
      at([2], 0),                        // table 앞
      at([2, 0, 0, 0, 0], 0), at([2, 0, 0, 0, 0], 1), at([2, 0, 0, 0, 0], 2), // 칸 속 문단
      at([2], 1),                        // table 뒤
    ],
);
  // 뒤로 걸으면 정확히 역순이다.
  const backs: Position[] = [];
  let pos = docEnd(doc, ENV) as Position;
  backs.push(pos);
  for (let i = 0; i < 200; i += 1) {
    const prev = stepBackward(doc, pos, ENV);
    if (samePosition(prev, pos)) break;
    backs.push(prev);
    pos = prev;
  }
  eq('걸음: 뒤로 = 앞으로의 역순', backs, [...path].reverse());
}

{
  // 문단 경계 — 앞 문단 끝과 다음 문단 처음은 서로 다른 자리다(사이 자리는 없다).
  const doc: NabiDoc = [p(['ab']), p(['cd'])];
  eq('걸음: 문단 끝 → 다음 문단 처음', stepForward(doc, at([0], 2), ENV), at([1], 0));
  eq('걸음: 문단 처음 → 앞 문단 끝', stepBackward(doc, at([1], 0), ENV), at([0], 2));
  eq('걸음: 문서 처음은 제자리', stepBackward(doc, at([0], 0), ENV), at([0], 0));
  eq('걸음: 문서 끝은 제자리', stepForward(doc, at([1], 2), ENV), at([1], 2));
}

{
  // 라인은 한 칸 — 건너뛰지도 둘로 세지도 않는다.
  const doc: NabiDoc = [p(['a', br(), 'b'])];
  eq('걸음: 라인 나열', walkAll(doc), [at([0], 0), at([0], 1), at([0], 2), at([0], 3)]);
}

{
  // 서로게이트 쌍은 한 걸음에 두 칸 — 쪼개 딛지 않는다.
  const doc: NabiDoc = [p(['a😀b'])];
  eq('걸음: 서로게이트 앞으로', stepForward(doc, at([0], 1), ENV), at([0], 3));
  eq('걸음: 서로게이트 뒤로', stepBackward(doc, at([0], 3), ENV), at([0], 1));
}

{
  // 접기 — 래퍼.0 → 제목 → 속 문단 → 래퍼.1.
  const details = el('details', [el('summary', ['ab']), p(['c'])], { o: 1 });
  const doc: NabiDoc = [wrap(details)];
  eq(
    '걸음: 접기 출입',
    walkAll(doc),
    [
      at([0], 0),
      at([0, 0, 0], 0), at([0, 0, 0], 1), at([0, 0, 0], 2), // summary "ab"
      at([0, 0, 1], 0), at([0, 0, 1], 1),                    // p "c"
      at([0], 1),
    ],
);
}

{
  // 빈 문단도 자리다 — 엔터 연타 공백의 걸음.
  const doc: NabiDoc = [p([]), p([]), p(['a'])];
  eq('걸음: 빈 문단 나열', walkAll(doc), [at([0], 0), at([1], 0), at([2], 0), at([2], 1)]);
}

// --- 선택·물건 범위 (042 종결) ---------------------------------------------------------------
{
  const doc: NabiDoc = [p(['ab']), wrap(img()), p(['cd'])];

  const objSel = selectObject([1]);
  ok('선택: 물건 골라짐 판별', isObjectSelection(doc, objSel, ENV));
  ok('선택: 물건 선택도 실재', selectionExists(doc, objSel, ENV));
  ok('선택: 접힌 래퍼 0 은 물건 골라짐 아님', !isObjectSelection(doc, caretAt(at([1], 0)), ENV));
  ok('선택: 글 문단 0~1 은 물건 골라짐 아님', !isObjectSelection(doc, { anchor: at([0], 0), focus: at([0], 1) }, ENV));
  ok(
    '선택: 거꾸로 잡아도(1→0) 물건 골라짐',
    isObjectSelection(doc, { anchor: at([1], 1), focus: at([1], 0) }, ENV),
);

  // 정렬 — anchor 가 뒤에 서도 문서 순서로 편다.
  const [start, end] = ordered({ anchor: at([2], 1), focus: at([0], 1) });
  eq('선택: ordered 시작', start, at([0], 1));
  eq('선택: ordered 끝', end, at([2], 1));

  // 042 통합 — 범위가 래퍼문단을 덮으면 물건도 함께 지워진다 (doc 의 deleteRange 재사용).
  const cut = deleteRange(doc, { anchor: at([0], 1), focus: at([2], 1) }, ENV);
  eq('042: 물건 덮은 범위 삭제에 물건도 사라짐', cut.doc, [p(['ad'])]);
  ok('042: 삭제 뒤 캐럿 실재', positionExists(cut.doc, cut.caret, ENV));

  // 접힘·동일성 도우미.
  ok('선택: 접힘 판별', isCollapsed(caretAt(at([0], 0))));
  ok('선택: sameSelection', sameSelection(objSel, selectObject([1])));
  ok('선택: sameSelection 다름', !sameSelection(objSel, caretAt(at([1], 0))));
}

// --- 예약 상태 전이 표 -----------------------------------------------------------
{
  let signals = 0;
  const armed = makeArmed(() => {
    signals += 1;
  });
  const bold: ElementNode = { w: 'b', ch: [] };
  const hlY: ElementNode = { w: 'hl', a: { c: 'yellow' }, ch: [] };
  const hlG: ElementNode = { w: 'hl', a: { c: 'green' }, ch: [] };

  ok('예약: 처음은 비어 있다', armed.isEmpty());

  // ① 생성 — 버튼이 예약을 만든다.
  armed.arm(bold);
  ok('예약: b 예약됨', armed.isArmed('b'));
  eq('예약: 신호 1회', signals, 1);

  // 같은 값 재예약 = 해제(토글).
  armed.arm(bold);
  ok('예약: 같은 값 재예약 = 해제', armed.isEmpty());

  // 같은 이름 다른 값 = 교체.
  armed.arm(hlY);
  armed.arm(hlG);
  eq('예약: 값 교체', armed.peek().plus, [hlG]);

  // ② 이동·삭제류 = 해제.
  armed.clear();
  ok('예약: 이동으로 해제', armed.isEmpty());

  // ③ 입력 = 적용 후 해제.
  armed.arm(bold);
  const applied = armed.takeForInsert([]);
  eq('예약: 입력에 적용', markNames(applied), ['b']);
  ok('예약: 입력 뒤 해제', armed.isEmpty());

  // 값 마크는 기본 더미의 같은 이름을 이긴다.
  armed.arm(hlG);
  eq('예약: 같은 이름 교체 적용', armed.takeForInsert([hlY, bold]).map((m) => JSON.stringify(m.a ?? {})), [
    '{}',
    JSON.stringify({ c: 'green' }),
  ]);

  // ④ 음수 방향 — escape 는 마크를 벗고 쓴다.
  armed.escape('a');
  const escaped = armed.takeForInsert([{ w: 'a', a: { href: 'https://x' }, ch: [] }, bold]);
  eq('예약: escape 로 마크 벗김', markNames(escaped), ['b']);
  ok('예약: escape 소비 뒤 해제', armed.isEmpty());

  // 양수·음수는 같은 이름에서 서로를 지운다.
  armed.escape('b');
  armed.arm(bold);
  eq('예약: 양수가 음수를 지움', armed.peek().minus, []);
  ok('예약: 양수는 남음', armed.isArmed('b'));
  armed.escape('b');
  ok('예약: 음수가 양수를 지움', !armed.isArmed('b'));
  eq('예약: 음수 남음', armed.peek().minus, ['b']);

  // 비어 있을 때 clear 는 신호를 안 낸다.
  armed.clear();
  const after = signals;
  armed.clear();
  eq('예약: 빈 clear 무신호', signals, after);

  // takeForInsert 는 예약이 없으면 기본 더미 그대로다.
  eq('예약: 빈 상태 입력 = 기본 그대로', markNames(armed.takeForInsert([bold])), ['b']);
}

done('caret');
