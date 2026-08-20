// 표 그물 — 064 의 표 버그 다섯(3·4·5·6·7)이 구조적으로 안 나는지 고정한다.
// grid 수학(배치·병합 상자·걸음 — old 그물의 번역)
// repair: 들쭉 행·span 초과·행 아닌 자식·칸 속 여러 블록 — setJson·setHtml 두 경로 다
// 병합 토글 하나(범위 병합 ↔ 해제) + 캐럿 실재성· 제목 행·열 토글 + currentValue
// onKey: tab 칸 이동(마지막 칸 = 행 추가)· shiftTab· 화살표/삭제는 pass(칸 경계 보호)
import { cocoon, isElement, type ElementNode, type NabiNode } from '../src/schema/index.js';
import { nodeAt, positionExists, type Position } from '../src/doc/index.js';
import { caretAt, type Selection } from '../src/caret/index.js';
import { createNabiWith, makeRegistry, routeKey } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import {
  boxBetween,
  cellCovering,
  cellGrid,
  cellsInBox,
  headerLineOf,
  repairCell,
  repairTable,
  selectionBox,
  spanOf,
  stepCell,
  tableWing,
  withSpans,
} from '../src/wings/table/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

// defaultWings 가 이제 표를 품는다(코디네이터 병합) — 중복 등록을 피한다.
const WINGS = defaultWings.some((w) => w.w === 'table') ? [...defaultWings] : [...defaultWings, tableWing];
const registry = makeRegistry(WINGS);
const env = registry.env;

const el = (w: string, ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode =>
  a ? { w, a, ch } : { w, ch };
const p = (ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode => el('p', ch, a);
const td = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode =>
  el('td', [p(ch)], a);
const tr = (...cells: ElementNode[]): ElementNode => el('tr', cells);
const at = (path: readonly number[], offset: number): Position => ({ path, offset });
const range = (a: Position, b: Position): Selection => ({ anchor: a, focus: b });

const make = (doc: readonly unknown[]) => createNabiWith(WINGS, { doc, parseHtml: tinyHtml }).nabi;

// 2×2 표(a·b / c·d)를 래퍼문단에 세운 문서.
const grid22 = (): ElementNode =>
  p([el('table', [tr(td(['a']), td(['b'])), tr(td(['c']), td(['d']))])]);

// --- registry — 표가 계약을 지난다 -------------------------------------------------------------

ok('표 wing 이 defaultWings 와 함께 등록된다', registry.wings.length === WINGS.length);
ok('tr·td 는 표의 부품이다', registry.ownerOf('tr') === tableWing && registry.ownerOf('td') === tableWing);
eq('td 는 문단 하나 고정이다', env.singleParagraph?.has('td'), true);
eq('제목 표식 th 는 불리언 attr 로 접힌다', env.boolAttrs.has('th'), true);
eq('표는 물건(lump)이다', env.lumps.has('table'), true);
ok('칸 드래그 부속이 선언형으로 실린다', tableWing.attach !== undefined && registry.attaches.includes(tableWing.attach));

// --- grid 수학 ---------------------------------------------------------------------------------

{
  const t = el('table', [tr(td(['a']), td(['b'])), tr(td(['c']), td(['d']))]);
  const g = cellGrid(t);
  eq('2×2 배치 — 행·열', [g.rows, g.columns], [2, 2]);
  eq('2×2 배치 — 문서 순서', g.cells.map((c) => [c.row, c.column]), [[0, 0], [0, 1], [1, 0], [1, 1]]);
}
{
  const t = el('table', [tr(td(['a'], { colspan: '2' })), tr(td(['b']), td(['c']))]);
  const g = cellGrid(t);
  eq('colspan 배치', g.cells.map((c) => [c.row, c.column, c.colSpan]), [[0, 0, 2], [1, 0, 1], [1, 1, 1]]);
}
{
  const t = el('table', [tr(td(['a'], { rowspan: '2' }), td(['b'])), tr(td(['c']))]);
  const g = cellGrid(t);
  eq('rowspan 이 아랫줄 자리를 먹는다 — c 는 (1,1)', g.cells.map((c) => [c.row, c.column]), [[0, 0], [0, 1], [1, 1]]);
  ok('먹힌 자리도 주인을 답한다', cellCovering(g, 1, 0)?.cell === t.ch[0] && isElement(t.ch[0]) ? true : cellCovering(g, 1, 0) !== null);
  const a = g.cells[0] as NonNullable<(typeof g.cells)[0]>;
  const c = g.cells[2] as NonNullable<(typeof g.cells)[2]>;
  const box = boxBetween(g, a, c);
  eq('병합 칸이 걸치면 상자가 넓어진다 — ㄱ자 없음', box, { top: 0, left: 0, bottom: 1, right: 1 });
  eq('상자 안 칸 셋 전부', cellsInBox(g, box).length, 3);
}
{
  const t = el('table', [tr(td(['a']), td(['b'])), tr(td(['c']), td(['d']))]);
  const g = cellGrid(t);
  const first = g.cells[0] as NonNullable<(typeof g.cells)[0]>;
  const last = g.cells[3] as NonNullable<(typeof g.cells)[3]>;
  ok('stepCell 앞으로 — 문서 순서', stepCell(g, first, 1) === g.cells[1]);
  ok('stepCell 끝을 넘으면 null', stepCell(g, last, 1) === null && stepCell(g, first, -1) === null);
}
eq('spanOf — 못 믿을 값은 1', [spanOf('0'), spanOf('abc'), spanOf(undefined), spanOf('-3')], [1, 1, 1, 1]);
eq('spanOf — 폭주는 1000 으로', spanOf('5000'), 1000);
eq('spanOf — 숫자도 받는다', spanOf(3), 3);
{
  const cell = td(['x'], { colspan: '3', rowspan: '2' });
  const reset = withSpans(cell, 1, 1);
  eq('withSpans — 기본값 1 은 안 적는다', reset.a, undefined);
  const grown = withSpans(cell, 2, 1);
  eq('withSpans — 값은 문자열', grown.a?.['colspan'], '2');
}

// --- repair — 모든 입력 경로가 한 규칙 --------------------------------------------------

{
  const ragged = el('table', [tr(td(['a']), td(['b'])), tr(td(['c']))]);
  const fixed = repairTable(ragged);
  const g = cellGrid(fixed);
  eq('들쭉 행 — 빈 칸을 채워 직사각형', [g.rows, g.columns, g.cells.length], [2, 2, 4]);
  ok('repair 는 멱등이다(참조 유지)', repairTable(fixed) === fixed);
}
{
  const overflow = el('table', [tr(td(['a'], { rowspan: '5' }), td(['b']))]);
  const fixed = repairTable(overflow);
  const first = cellGrid(fixed).cells[0];
  eq('행 수를 넘는 rowspan 은 조여진다', first?.rowSpan, 1);
  eq('조여진 기본값 1 은 attr 에서 떨어진다', first?.cell.a?.['rowspan'], undefined);
}
{
  const stray = el('table', [p(['떠돌이']), tr(td(['a']))]);
  const fixed = repairTable(stray);
  const g = cellGrid(fixed);
  eq('행 아닌 자식은 행 하나로 감싸진다', g.rows, 2);
}
{
  const messy = el('td', [p(['하나']), p(['둘'])]);
  const fixed = repairCell(messy);
  eq('칸 속 문단 둘 — 라인으로 눌린 문단 하나', fixed.ch.length, 1);
  const inner = fixed.ch[0];
  ok('칸 문단에 라인이 섰다', isElement(inner) && inner.ch.some((n) => isElement(n) && n.w === 'br'));
  ok('칸 repair 도 멱등이다(참조 유지)', repairCell(fixed) === fixed);
}
{
  // cocoon 경로 — setJson 급 입력: 맨몸 표·들쭉 행·칸 속 중첩 표가 전부 한 규칙을 탄다.
  const nested = el('td', [el('table', [tr(td(['깊은']))])]);
  const doc = cocoon([el('table', [tr(nested, td(['b'])), tr(td(['c']))])], env);
  const table = (doc[0] as ElementNode).ch[0] as ElementNode;
  eq('맨몸 표가 래퍼문단을 입는다', (doc[0] as ElementNode).w, 'p');
  const g = cellGrid(table);
  eq('cocoon 경유 — 직사각형', [g.rows, g.columns], [2, 2]);
  const first = g.cells[0]?.cell.ch[0];
  ok('칸 속 중첩 표는 글줄로 눌린다', isElement(first) && first.w === 'p' && first.ch.includes('깊은'));
}
{
  // 빈 칸 (ailog 102) — 바깥 HTML 의 <td></td>. isElement 가 undefined 를 안 걸러 repairCell 이
  // 터졌었다. 남의 에디터가 쓴 글·DB 의 옛 글이 반드시 밟는 길이라 세 입구를 전부 세운다.
  const emptyCellShape = { w: 'td', ch: [{ w: 'p', ch: [] }] };
  const nabi = make([]);
  ok('빈 칸 HTML — setHtml 이 참', nabi.setHtml('<table><tr><td>a</td><td></td></tr></table>'));
  eq('빈 칸이 emptyCell 과 한 모양으로 복구된다', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [{ w: 'p', ch: ['a'] }] }, emptyCellShape] }] }] },
  ]);
  ok('공백뿐인 칸도 같다', nabi.setHtml('<table><tr><td>   </td></tr></table>'));
  ok('빈 인라인뿐인 칸도 같다', nabi.setHtml('<table><tr><td><span></span></td></tr></table>'));
  ok(
    'JSON 입구도 같은 자리 — td ch:[]',
    nabi.setJson([{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [] }] }] }] }]),
  );
  eq('setJson 경유 — 같은 복구', nabi.getJson(), [{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [emptyCellShape] }] }] }]);
  const seeded = make([{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [] }] }] }] }]);
  eq('doc 옵션 입구도 같은 자리', seeded.getJson(), [{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [emptyCellShape] }] }] }]);
  eq('repairCell 직접 — 빈 칸은 문단 하나', repairCell(el('td', [])).ch, [{ w: 'p', ch: [] }]);
}
{
  // 실전 원문 (ailog 106 — 애니시아 편성표): 제목행(thead/th) + 링크 칸 + **링크를 안 적은 빈
  // 칸**. 터지지 않는 것으로 끝이 아니다 — 내용이 무시되거나 사라지면 안 되고, 빈 칸은 교정돼
  // 제자리에 남아야 한다(3열 유지).
  const nabi = make([]);
  ok(
    '실전 원문 — setHtml 이 참',
    nabi.setHtml(
      '<h3>퍼펙트 어딕션</h3><table><thead><tr><th>시간/날짜</th><th>방송국</th><th>링크</th></tr></thead>' +
        '<tbody><tr><td>22:00 (7월 8일)</td><td><a href="https://animationid.com/x">링크</a></td><td></td></tr></tbody>' +
        '</table><p><br></p>',
    ),
  );
  const out = nabi.getHtml();
  ok('제목이 남는다', out.includes('퍼펙트 어딕션'));
  ok('제목행이 남는다', out.includes('시간/날짜') && out.includes('<th>'));
  ok('링크가 남는다', out.includes('href="https://animationid.com/x"'));
  eq('본문 행의 칸 수 — 빈 칸 포함 셋', (out.match(/<td[ >]/g) ?? []).length, 3);
  const json = JSON.stringify(nabi.getJson());
  nabi.setJson(nabi.getJson());
  ok('왕복이 안정하다', json === JSON.stringify(nabi.getJson()) && out === nabi.getHtml());
}
{
  const withImg = cocoon([el('table', [tr(el('td', [p([el('img', [], { src: 'https://x/a.png' })])]))])], env);
  const table = (withImg[0] as ElementNode).ch[0] as ElementNode;
  const cell = cellGrid(table).cells[0]?.cell;
  const para = cell?.ch[0];
  ok('칸 속 그림은 걷힌다(칸은 글줄)', isElement(para) && para.ch.every((n) => typeof n === 'string' || (isElement(n) && n.w === 'br')));
}

// --- HTML — th 왕복·횡스크롤 겉옷 --------------------------------------------------------------

{
  const nabi = make([grid22()]);
  const html = nabi.getHtml();
  ok('표는 횡스크롤 겉옷을 입는다', html.includes('<div class="nabi-scroll"><table>'));
  ok('폭·정렬 attr 는 표에 없다', !html.includes('data-nabi-width'));
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0)));
  nabi.applyCommand('toggleHeaderRow');
  const withTh = nabi.getHtml();
  ok('제목 칸은 th 로 나간다', withTh.includes('<th>') && withTh.includes('<td>'));

  const again = make([]);
  again.setHtml(withTh);
  const table = (again.$doc()[0] as ElementNode).ch[0] as ElementNode;
  const g = cellGrid(table);
  eq('th 가 제목 표식으로 되돌아온다', g.cells.filter((c) => c.cell.a?.['th'] === 1).length, 2);
  eq('되돌아온 표도 2×2 다', [g.rows, g.columns], [2, 2]);
}
{
  const nabi = make([]);
  nabi.setHtml('<table><tr><td>a</td><td>b</td></tr><tr><td>c</td></tr></table>');
  const table = (nabi.$doc()[0] as ElementNode).ch[0] as ElementNode;
  eq('setHtml 경로도 격자 복구를 탄다', cellGrid(table).cells.length, 4);
}

// --- 커맨드 — 행·열·병합·제목 ------------------------------------------------------------------

const caretExists = (name: string, nabi: ReturnType<typeof make>): void => {
  const sel = nabi.getSelection();
  ok(name, positionExists(nabi.$doc(), sel.focus, env) && positionExists(nabi.$doc(), sel.anchor, env));
};

{
  const nabi = make([p([])]);
  nabi.applyCommand('insertTable', { rows: 2, cols: 2 });
  const top = nabi.$doc()[0] as ElementNode;
  eq('insertTable — 빈 문단이 래퍼문단으로 교체된다', nabi.$doc().length, 1);
  eq('insertTable — 2×2', cellGrid(top.ch[0] as ElementNode).cells.length, 4);
  caretExists('insertTable — 캐럿 실재', nabi);
  eq('insertTable — 캐럿은 첫 칸', nabi.getSelection().focus.path, [0, 0, 0, 0, 0]);
}

// --- 새 표의 첫 행은 예외 없이 제목 행 (084 ③) ------------------------------------------------

{
  const nabi = make([p([])]);
  nabi.applyCommand('insertTable', { rows: 3, cols: 2 });
  const g = cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq(
    '새 표 — 첫 행 전부가 제목 칸',
    g.cells.filter((c) => c.cell.a?.['th'] === 1).map((c) => [c.row, c.column]),
    [[0, 0], [0, 1]],
  );
  eq('새 표 — 아랫줄은 제목이 아니다', g.cells.filter((c) => c.row > 0).every((c) => c.cell.a?.['th'] === undefined), true);
  const html = nabi.getHtml();
  eq('새 표 — 발행 HTML 의 제목 칸은 th 둘', (html.match(/<th[ >]/g) ?? []).length, 2);
  ok('새 표 — 나머지는 td 그대로', html.includes('<td>'));
}
{
  // 제목 줄에 구멍이 안 뚫린다 — 열을 더해도 제목 행은 제목 행이다.
  const nabi = make([p([])]);
  nabi.applyCommand('insertTable', { rows: 2, cols: 2 });
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0)));
  nabi.applyCommand('addColumnRight');
  const g = cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq('열을 더해도 제목 행은 통째로 제목이다', g.cells.filter((c) => c.row === 0).every((c) => c.cell.a?.['th'] === 1), true);
  eq('아랫줄에는 제목이 안 번진다', g.cells.filter((c) => c.row === 1).every((c) => c.cell.a?.['th'] === undefined), true);

  // 행 추가는 따라가지 않는다 — 제목 행 하나뿐인 표에서 아래 새 행까지 제목이 되면 안 된다.
  nabi.applyCommand('addRowBelow');
  const g2 = cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq('새 행은 제목이 아니다', g2.cells.filter((c) => c.row > 0).every((c) => c.cell.a?.['th'] === undefined), true);
}
{
  // 행 수를 안 본다 — 한 행짜리 표도 그 한 행이 제목이다(주인 답: 예외 없이).
  const nabi = make([p([])]);
  nabi.applyCommand('insertTable', { rows: 1, cols: 3 });
  const g = cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq('한 행짜리 표도 그 한 행이 제목이다', g.cells.every((c) => c.cell.a?.['th'] === 1), true);
}
{
  // **생성 길에만 선다** — 들여온 문서·이미 있는 문서는 그대로다.
  const imported = make([]);
  imported.setHtml('<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>');
  const g = cellGrid((imported.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq('들여온 표에는 제목 행이 안 생긴다', g.cells.filter((c) => c.cell.a?.['th'] === 1).length, 0);

  const loaded = make([grid22()]);
  const g2 = cellGrid((loaded.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq('setJson(cocoon) 로 들어온 표도 그대로다', g2.cells.filter((c) => c.cell.a?.['th'] === 1).length, 0);
}

// --- 상황 줄에서 표삭제 단추를 걷었다 (084 ④) — 지우는 길은 남는다 ----------------------------

{
  const names = (tableWing.context?.controls ?? []).map((control) => control.name);
  ok('상황 줄에 표삭제 단추가 없다', !names.includes('tableDelete'));
  ok('행·열 손잡이는 그대로다', names.includes('rowDelete') && names.includes('colDelete'));
  ok('지우는 커맨드는 남아 있다', typeof tableWing.commands?.['deleteTable'] === 'function');

  const nabi = make([grid22()]);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0)));
  eq('deleteTable 커맨드는 여전히 표를 걷는다', nabi.applyCommand('deleteTable'), true);
  eq('표가 걷힌 자리엔 빈 문단이 선다', nabi.$doc().every((n) => n.ch.every((c) => !isElement(c) || c.w !== 'table')), true);
}

// --- 표 만들기 격자 — 작은 화면에서는 5×5 (084 ②) ---------------------------------------------

{
  // 폭 판정은 CSS 가 한다(리사이즈를 따라간다) — 그물이 볼 수 있는 것은 wing 이 실어 나르는 시트다.
  const css = tableWing.styles ?? '';
  ok('작은 화면 분기가 표 시트에 있다', css.includes('@media (max-width: 40rem)'));
  ok('작은 화면 격자는 5열이다', css.includes('grid-template-columns: repeat(5, var(--nabi-grid-cell)) !important'));
  ok('작은 화면 칸은 커진다', css.includes('--nabi-grid-cell: 2.75rem'));
  ok('여섯째 열·여섯째 줄부터는 걷힌다', css.includes('nth-child(8n + 6)') && css.includes('nth-child(n + 41)'));
}
{
  const nabi = make([grid22()]);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0))); // a 칸
  nabi.applyCommand('addRowBelow');
  eq('addRowBelow — 행 셋', cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode).rows, 3);
  caretExists('addRowBelow — 캐럿 실재(새 행)', nabi);
  nabi.applyCommand('addRowAbove');
  eq('addRowAbove — 행 넷', cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode).rows, 4);
  nabi.applyCommand('addColumnRight');
  eq('addColumnRight — 열 셋', cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode).columns, 3);
  nabi.applyCommand('addColumnLeft');
  eq('addColumnLeft — 열 넷', cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode).columns, 4);
  caretExists('행·열 추가 뒤 캐럿 실재', nabi);
}
{
  const nabi = make([grid22()]);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0)));
  nabi.applyCommand('deleteRow');
  const table = (nabi.$doc()[0] as ElementNode).ch[0] as ElementNode;
  eq('deleteRow — 행 하나 남음', cellGrid(table).rows, 1);
  eq('deleteRow — 남은 행은 c·d', cellGrid(table).cells.map((c) => (c.cell.ch[0] as ElementNode).ch[0]), ['c', 'd']);
  caretExists('deleteRow — 캐럿 실재', nabi);
  nabi.applyCommand('deleteRow');
  eq('마지막 행 삭제 — 표(래퍼째)가 사라진다', nabi.$doc().every((n) => n.ch.every((c) => !isElement(c) || c.w !== 'table')), true);
  caretExists('표 전체 삭제 뒤 캐럿 실재', nabi);
}
{
  const nabi = make([grid22()]);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0)));
  nabi.applyCommand('deleteColumn');
  eq('deleteColumn — 열 하나 남음', cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode).columns, 1);
  nabi.applyCommand('deleteColumn');
  eq('마지막 열 삭제 — 표가 사라진다', nabi.$doc().every((n) => n.ch.every((c) => !isElement(c) || c.w !== 'table')), true);
}
{
  // 위에서 내려온 rowspan 을 가진 행 삭제 — 병합 칸이 아랫줄로 옮겨 한 칸 준다.
  const t = el('table', [tr(td(['a'], { rowspan: '2' }), td(['b'])), tr(td(['c'])), tr(td(['d']), td(['e']))]);
  const nabi = make([p([t])]);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0))); // a(병합 시작 줄)
  nabi.applyCommand('deleteRow');
  const g = cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq('병합 시작 줄 삭제 — 남은 격자도 직사각형', [g.rows, g.columns], [2, 2]);
  ok('옮겨 앉은 a 가 살아 있다', g.cells.some((c) => (c.cell.ch[0] as ElementNode).ch[0] === 'a'));
  caretExists('병합 행 삭제 뒤 캐럿 실재', nabi);
}

// --- 병합 토글 하나 --------------------------------------------------------------------

{
  const nabi = make([grid22()]);
  const sel = range(at([0, 0, 0, 0, 0], 0), at([0, 0, 1, 1, 0], 1)); // a 처음 ~ d 끝
  const boxed = selectionBox(nabi.$doc(), sel);
  eq('selectionBox — 2×2 네 칸', boxed?.cells.length, 4);
  eq('selectionBox — 접힌 캐럿은 null', selectionBox(nabi.$doc(), caretAt(at([0, 0, 0, 0, 0], 0))), null);

  nabi.select(sel);
  nabi.applyCommand('mergeCells');
  const table = (nabi.$doc()[0] as ElementNode).ch[0] as ElementNode;
  const g = cellGrid(table);
  eq('병합 — 칸 하나', g.cells.length, 1);
  eq('병합 — 2×2 를 덮는다', [g.cells[0]?.colSpan, g.cells[0]?.rowSpan], [2, 2]);
  const merged = g.cells[0]?.cell.ch[0] as ElementNode;
  eq('병합 — 글이 라인으로 이어진다', merged.ch.filter((n) => typeof n === 'string'), ['a', 'b', 'c', 'd']);
  eq('병합 — 경계마다 라인 하나', merged.ch.filter((n) => isElement(n) && n.w === 'br').length, 3);
  caretExists('병합 뒤 캐럿 실재 (옛 mergeBox 버그)', nabi);
  eq('병합 칸의 눌림 표시', tableWing.currentValue?.(g.cells[0]?.cell as ElementNode), 'merged');

  // 같은 자리를 한 번 더 — 눌린 토글을 다시 누르면 풀린다.
  nabi.applyCommand('mergeCells');
  const g2 = cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq('해제 — 다시 2×2 네 칸', g2.cells.length, 4);
  eq('해제 — span 이 걷혔다', g2.cells.every((c) => c.colSpan === 1 && c.rowSpan === 1), true);
  caretExists('해제 뒤 캐럿 실재', nabi);
  ok('해제 — 병합 칸이 글을 지킨다', ((g2.cells[0]?.cell.ch[0] as ElementNode).ch.filter((n) => typeof n === 'string')).length > 0);
}
{
  // 표 둘에 걸친 선택 — 병합은 pass.
  const nabi = make([grid22(), grid22()]);
  nabi.select(range(at([0, 0, 0, 0, 0], 0), at([1, 0, 0, 0, 0], 1)));
  eq('다른 표에 걸친 병합은 pass', nabi.applyCommand('mergeCells'), false);
}

// --- 제목 행·열 토글 -------------------------------------------------------------------

{
  const nabi = make([grid22()]);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0)));
  nabi.applyCommand('toggleHeaderRow');
  let table = (nabi.$doc()[0] as ElementNode).ch[0] as ElementNode;
  let g = cellGrid(table);
  eq('제목 행 — 첫 행 두 칸이 th', g.cells.filter((c) => c.cell.a?.['th'] === 1).map((c) => [c.row, c.column]), [[0, 0], [0, 1]]);
  ok('headerLineOf — 눌림 판정 참', headerLineOf({ grid: g, cell: g.cells[0] as NonNullable<(typeof g.cells)[0]> }, 'row'));
  eq('제목 칸의 눌림 토큰', tableWing.currentValue?.(g.cells[0]?.cell as ElementNode), 'th');

  nabi.applyCommand('toggleHeaderRow');
  table = (nabi.$doc()[0] as ElementNode).ch[0] as ElementNode;
  g = cellGrid(table);
  eq('토글 — 다시 누르면 벗는다', g.cells.filter((c) => c.cell.a?.['th'] === 1).length, 0);

  nabi.applyCommand('toggleHeaderColumn');
  g = cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode);
  eq('제목 열 — 첫 열 두 칸이 th', g.cells.filter((c) => c.cell.a?.['th'] === 1).map((c) => [c.row, c.column]), [[0, 0], [1, 0]]);
}
{
  // 불리언 규칙 — th 는 1 만 남는다 (cocoon).
  const doc = cocoon([p([el('table', [tr(td(['a'], { th: 2 }), td(['b'], { th: 1 }))])])], env);
  const g = cellGrid((doc[0] as ElementNode).ch[0] as ElementNode);
  eq('th=2 는 걷히고 th=1 만 남는다', g.cells.map((c) => c.cell.a?.['th'] ?? null), [null, 1]);
}

// --- onKey — tab 칸 이동· Shift+방향키/삭제는 pass (·7) ----------------------------------

{
  const nabi = make([grid22()]);
  const doc = nabi.$doc();
  const a1 = caretAt(at([0, 0, 0, 0, 0], 0));

  const tabbed = routeKey({ key: 'tab' }, doc, a1, env, registry);
  eq('tab — 다음 칸으로', tabbed?.selection.focus.path, [0, 0, 0, 1, 0]);

  const back = routeKey({ key: 'shiftTab' }, doc, caretAt(at([0, 0, 0, 1, 0], 0)), env, registry);
  eq('shiftTab — 앞 칸으로', back?.selection.focus.path, [0, 0, 0, 0, 0]);
  eq('첫 칸의 shiftTab 은 pass', routeKey({ key: 'shiftTab' }, doc, a1, env, registry), null);

  const last = caretAt(at([0, 0, 1, 1, 0], 1));
  const grown = routeKey({ key: 'tab' }, doc, last, env, registry);
  ok('마지막 칸의 tab — 새 행이 선다', grown !== null && cellGrid((grown.doc[0] as ElementNode).ch[0] as ElementNode).rows === 3);
  eq('마지막 칸의 tab — 캐럿은 새 행 첫 칸', grown?.selection.focus.path, [0, 0, 2, 0, 0]);

  // 화살표는 **격자를 따라** 걷는다 — 화면 좌표를 따르는 브라우저 걸음은 칸 폭이 다르면 옆
  // 열로 샌다. 칸 안에 갈 자리가 남았거나 격자 밖으로 나가는 걸음만 pass 다.
  // (Shift+방향키는 mount 가 아예 안 보낸다 — 범위 걸음은 브라우저의 것이다.)
  const arrow = (dir: 'left' | 'right' | 'up' | 'down', sel: Selection) =>
    routeKey({ key: 'arrow', dir }, doc, sel, env, registry);

  eq('a1 처음에서 ← 는 pass — 표 밖으로 나가는 걸음은 코어의 것', arrow('left', a1), null);
  eq('a1 처음에서 ↑ 도 pass — 표 위로 나간다', arrow('up', a1), null);
  eq('a1 끝에서 → 는 옆 칸의 처음', arrow('right', caretAt(at([0, 0, 0, 0, 0], 1)))?.selection.focus, {
    path: [0, 0, 0, 1, 0],
    offset: 0,
  });
  eq('b1 처음에서 ← 는 앞 칸의 **끝**', arrow('left', caretAt(at([0, 0, 0, 1, 0], 0)))?.selection.focus, {
    path: [0, 0, 0, 0, 0],
    offset: 1,
  });
  eq('a1 에서 ↓ 는 같은 열의 아래 칸', arrow('down', a1)?.selection.focus, { path: [0, 0, 1, 0, 0], offset: 0 });
  eq('c(아래 줄) 에서 ↑ 는 같은 열의 위 칸', arrow('up', caretAt(at([0, 0, 1, 0, 0], 0)))?.selection.focus, {
    path: [0, 0, 0, 0, 0],
    offset: 0,
  });
  eq('마지막 줄에서 ↓ 는 pass — 표 아래로 나간다', arrow('down', caretAt(at([0, 0, 1, 1, 0], 0))), null);
  eq('칸 안에 갈 자리가 남았으면 pass — 글자 걸음이다', arrow('right', caretAt(at([0, 0, 0, 0, 0], 0))), null);
  eq('backspace·delete·enter pass', [
    routeKey({ key: 'backspace' }, doc, a1, env, registry),
    routeKey({ key: 'delete' }, doc, a1, env, registry),
    routeKey({ key: 'enter' }, doc, a1, env, registry),
  ], [null, null, null]);
}
{
  // 칸 경계 보호 — 칸 첫머리의 백스페이스는 코어 삭제 표에서도 아무 일 없다(형제가 없는 문단).
  const nabi = make([grid22()]);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 0)));
  const before = nabi.$doc();
  eq('칸 첫머리 백스페이스 — 무변화', nabi.applyCommand('deleteBackward'), false);
  ok('문서 참조 그대로', nabi.$doc() === before);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 1)));
  eq('칸 끝 Delete — 무변화', nabi.applyCommand('deleteForward'), false);
}
{
  // 칸 안의 엔터 = 라인 (td 는 singleParagraph).
  const nabi = make([grid22()]);
  nabi.select(caretAt(at([0, 0, 0, 0, 0], 1)));
  nabi.applyCommand('splitParagraph');
  const cell = cellGrid((nabi.$doc()[0] as ElementNode).ch[0] as ElementNode).cells[0]?.cell;
  const para = cell?.ch[0] as ElementNode;
  ok('칸의 엔터는 분할이 아니라 라인이다', para.ch.some((n) => isElement(n) && n.w === 'br'));
  eq('칸은 여전히 문단 하나다', cell?.ch.length, 1);
}

done('table');
