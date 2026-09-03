// surface 그물 — 정책 엔진(키 파이프라인·오토포맷·그릇 탈출·되맞추기 diff·재그리기 계획)을 DOM 없이 잡는다. 실제 DOM 상호작용은 실제로 띄워 보는 쪽의 몫이다.
// Surface test net for the policy engine (key pipeline, autoformat, container escape, reconcile diff, redraw planning) without a DOM — actual DOM interaction is left to real mounting.
import { createNabiWith, type Wing } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import {
  diffPlain,
  holderTextOf,
  insertFragmentOp,
  makeSurfaceActions,
  planRedraw,
  type SurfaceActions,
} from '../src/surface/index.js';
import { cssQuoted } from '../src/surface/mount.js';
import { caretAt, type Selection } from '../src/caret/index.js';
import { nodeAt, terminalOf } from '../src/doc/index.js';
import { isElement, type ElementNode } from '../src/schema/index.js';
import { hostOf, type Nabi, type NabiChange } from '../src/editor/index.js';
import { done, eq, ok } from './net.js';

// 조정 가능한 시계 — 이중 엔터의 "빠름"을 그물이 쥔다.
// A controllable clock — the test net owns what counts as "fast" for a double-Enter.
let clock = 10_000;
const tick = (ms: number): void => {
  clock += ms;
};

interface Rig {
  readonly nabi: Nabi;
  readonly actions: SurfaceActions;
}

const TEST_WINGS: readonly Wing[] = defaultWings;

function rig(doc?: unknown): Rig {
  const { nabi, registry } = createNabiWith(TEST_WINGS, doc === undefined ? {} : { doc });
  const actions = makeSurfaceActions({ nabi, registry, now: () => clock });
  return { nabi, actions };
}

const at = (path: readonly number[], offset: number): Selection => caretAt({ path, offset });

// ─── 엔터 ───────────────────────────────────────────────────────────────────────

{
  const { nabi, actions } = rig([{ w: 'p', ch: ['ab'] }]);
  nabi.select(at([0], 1));
  ok('엔터는 언제나 소비된다', actions.enter());
  eq('엔터 = 문단 분할', nabi.getJson(), [
    { w: 'p', ch: ['a'] },
    { w: 'p', ch: ['b'] },
  ]);
  eq('분할 뒤 캐럿은 새 문단 처음', nabi.getSelection().focus, { path: [1], offset: 0 });
}

{
  const { nabi, actions } = rig([{ w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['x'] }] }]);
  nabi.select(at([0, 0], 1));
  actions.enter();
  eq('코드 안 엔터 = 라인', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['x', { w: 'br', ch: [] }] }] },
  ]);
}

{
  const { nabi, actions } = rig([{ w: 'p', ch: [{ w: 'br', ch: [] }] }]);
  nabi.select(at([0], 1));
  ok('Shift+Enter 소비', actions.shiftEnter());
  eq('Shift+Enter = 라인 추가', nabi.getJson(), [
    {
      w: 'p',
      ch: [
        { w: 'br', ch: [] },
        { w: 'br', ch: [] },
      ],
    },
  ]);
}

{
  const canonical = [
    { w: 'p', ch: ['A', { w: 'br', ch: [] }, 'B', { w: 'br', ch: [] }, 'C', { w: 'br', ch: [] }, 'D'] },
  ];
  const loaded = rig([{ w: 'p', ch: ['A\r\nB\rC\nD'] }]);
  eq('저장 글의 CRLF·CR·LF는 br 한 칸으로 정규화된다', loaded.nabi.getJson(), canonical);

  const typed = rig();
  typed.nabi.applyCommand('insertText', { text: 'A\r\nB\rC\nD' });
  eq('insertText도 모든 줄바꿈을 br로 넣는다', typed.nabi.getJson(), canonical);
  eq('정규화된 줄바꿈은 각각 옵셋 한 칸이다', typed.nabi.getSelection().focus.offset, 7);
  typed.nabi.undo();
  eq('여러 줄 insertText는 undo 한 단위다', typed.nabi.getJson(), [{ w: 'p', ch: [] }]);
}

// ─── 그릇 탈출 — 빠른 이중 엔터 ────────────────────────────────────────

{
  const { nabi, actions } = rig([{ w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['x'] }] }] }]);
  nabi.select(at([0, 0, 0], 1));
  actions.enter(); // 인용 속에 빈 문단이 하나 선다
  eq('첫 엔터는 그릇 안 분할', nabi.getJson(), [
    {
      w: 'p',
      ch: [
        {
          w: 'quote',
          ch: [
            { w: 'p', ch: ['x'] },
            { w: 'p', ch: [] },
          ],
        },
      ],
    },
  ]);
  tick(100);
  actions.enter(); // 빠른 두 번째 — 흔적을 걷고 나간다
  eq('빠른 이중 엔터 = 인용 탈출', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['x'] }] }] },
    { w: 'p', ch: [] },
  ]);
  eq('탈출 캐럿은 그릇 뒤 새 문단', nabi.getSelection().focus, { path: [1], offset: 0 });
}

{
  const { nabi, actions } = rig([{ w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['x'] }] }] }]);
  nabi.select(at([0, 0, 0], 1));
  actions.enter();
  tick(2_000);
  actions.enter(); // 느린 두 번째 — 탈출이 아니라 그냥 분할이다
  eq('느린 두 번째 엔터는 안 나간다', nabi.getJson(), [
    {
      w: 'p',
      ch: [
        {
          w: 'quote',
          ch: [
            { w: 'p', ch: ['x'] },
            { w: 'p', ch: [] },
            { w: 'p', ch: [] },
          ],
        },
      ],
    },
  ]);
}

{
  const { nabi, actions } = rig([{ w: 'p', ch: [{ w: 'code', ch: ['x'] }] }]);
  nabi.select(at([0, 0], 1));
  actions.enter(); // 코드 끝에 라인이 선다
  tick(100);
  actions.enter(); // 빠른 두 번째 — 라인을 걷고 나간다
  eq('코드의 빠른 이중 엔터 탈출', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'code', ch: ['x'] }] },
    { w: 'p', ch: [] },
  ]);
}

{
  const { nabi, actions } = rig([
    {
      w: 'p',
      ch: [{ w: 'quote', ch: [{ w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['x'] }] }] }] }],
    },
  ]);
  nabi.select(at([0, 0, 0, 0, 0], 1));
  actions.enter();
  tick(100);
  actions.enter();
  tick(100);
  actions.enter();
  const outer = (nabi.getJson()[0] as { ch: unknown[] }).ch[0] as { ch: unknown[] };
  ok(
    '성공한 이중 Enter는 상태를 끊어 셋째 Enter가 바깥 그릇까지 연쇄 탈출하지 않는다',
    nabi.getJson().length === 1 && outer.ch.length === 3,
    JSON.stringify(nabi.getJson()),
  );
}

// ─── 리스트 키 라우팅 (소유자 → 코어) ───────────────────────────────────────────

{
  const { nabi, actions } = rig([{ w: 'p', ch: [{ w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['ab'] }] }] }] }]);
  nabi.select(at([0, 0, 0, 0], 1));
  tick(2_000);
  actions.enter();
  eq('리스트 엔터 = 항목 분할 (wing 이 받았다)', nabi.getJson(), [
    {
      w: 'p',
      ch: [
        {
          w: 'ul',
          ch: [
            { w: 'li', ch: [{ w: 'p', ch: ['a'] }] },
            { w: 'li', ch: [{ w: 'p', ch: ['b'] }] },
          ],
        },
      ],
    },
  ]);
  nabi.select(at([0, 0, 1, 0], 0));
  actions.backspace();
  // 둘째 이후 항목의 첫머리는 앞 항목과 합친다 — 표식만 벗겨 문단으로 내보내면 목록이 쪼개져 되돌리기 말고는 붙일 길이 없다.
  // Backspace at a later item's start merges into the previous item — stripping just the marker would split the list with no way back but undo.
  eq('둘째 항목 첫머리 백스페이스 = 앞 항목과 합치기', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['ab'] }] }] }] },
  ]);
}

// ─── Tab ────────────────────────────────────────────────────────────────────────

{
  const { nabi, actions } = rig([{ w: 'p', ch: ['x'] }]);
  nabi.select(at([0], 1));
  ok('Tab 소비', actions.tab(false));
  eq('아무도 안 가져간 Tab = 스페이스 넷 (캐럿이 접혔을 때만)', nabi.getJson(), [{ w: 'p', ch: ['x    '] }]);
  ok('Shift+Tab 도 소비(포커스 탈출 방지)', actions.tab(true));
  eq('Shift+Tab 은 아무 일도 안 한다', nabi.getJson(), [{ w: 'p', ch: ['x    '] }]);
}

{
  // 범위 위에서는 아무 일도 안 한다 — 스페이스 넷은 잡아 둔 것을 지우고 그 자리에 넣는 일이라, 문단 여럿을 잡고 탭을 치면 통째로 사라졌다.
  // Tab over a selection does nothing — inserting four spaces means deleting the selection first, which used to wipe out multiple selected paragraphs.
  const three = (): unknown[] => [
    { w: 'p', ch: ['one'] },
    { w: 'p', ch: ['two'] },
    { w: 'p', ch: ['three'] },
  ];
  const { nabi, actions } = rig(three());
  nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [2], offset: 5 } });
  ok('범위 위의 Tab 도 소비는 한다 — 포커스가 편집기를 안 떠난다', actions.tab(false));
  eq('문단 여럿을 잡은 Tab 은 아무것도 안 바꾼다', nabi.getJson(), three());
  actions.tab(true);
  eq('그 자리의 Shift+Tab 도 마찬가지다', nabi.getJson(), three());

  const one = rig(three());
  one.nabi.select({ anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 3 } });
  one.actions.tab(false);
  eq('한 문단 안의 범위도 안 바꾼다 — 잡은 글을 스페이스로 갈지 않는다', one.nabi.getJson(), three());
}

{
  const { nabi, actions } = rig([
    {
      w: 'p',
      ch: [
        {
          w: 'ul',
          ch: [
            { w: 'li', ch: [{ w: 'p', ch: ['a'] }] },
            { w: 'li', ch: [{ w: 'p', ch: ['b'] }] },
          ],
        },
      ],
    },
  ]);
  nabi.select(at([0, 0, 1, 0], 0));
  actions.tab(false);
  eq('리스트 Tab = 들여쓰기 (wing 이 받았다)', nabi.getJson(), [
    {
      w: 'p',
      ch: [
        {
          w: 'ul',
          ch: [
            {
              w: 'li',
              ch: [
                { w: 'p', ch: ['a'] },
                { w: 'p', ch: [{ w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['b'] }] }] }] },
              ],
            },
          ],
        },
      ],
    },
  ]);
}

// ─── 삭제 — 래퍼문단 방향 규칙 ───────────────────────────────────────────────────

const IMG = { w: 'img', a: { src: 'https://x.com/a.png' }, ch: [] };

{
  const { nabi, actions } = rig([
    { w: 'p', ch: ['1234'] },
    { w: 'p', ch: [IMG] },
  ]);
  nabi.select(at([1], 0));
  actions.backspace();
  eq('래퍼 0 백스페이스 = 앞 문단 끝 글자', nabi.getJson(), [
    { w: 'p', ch: ['123'] },
    { w: 'p', ch: [IMG] },
  ]);
  eq('캐럿은 앞 문단으로', nabi.getSelection().focus, { path: [0], offset: 3 });
}

{
  const { nabi, actions } = rig([
    { w: 'p', ch: ['ab'] },
    { w: 'p', ch: [IMG] },
  ]);
  nabi.select(at([1], 1));
  actions.backspace();
  eq('래퍼 1 백스페이스 = 물건 통째 삭제', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
}

// ─── 목록 첫 항목의 백스페이스 — 겨누기가 아니라 목록의 제 규칙 ────────────────
// wing 이 겨누기보다 앞선다 — 목록 첫 항목 첫머리의 백스페이스는 목록 전체를 고르지 않고 그 항목의 표식만 벗긴다.
// The wing takes priority over selecting — backspace at a list's first item strips just that item's marker instead of selecting the whole list.
{
  const ITEM: Readonly<Record<string, string>> = { ul: 'li', ol: 'oli', tl: 'tli' };
  for (const list of ['ul', 'ol', 'tl']) {
    const item = ITEM[list] as string;
    const of = (t: string): unknown => ({ w: item, ch: [{ w: 'p', ch: [t] }] });
    const { nabi, actions } = rig([{ w: 'p', ch: [{ w: list, ch: [of('abcd'), of('bbb')] }] }]);
    nabi.select(at([0, 0, 0, 0], 0));
    actions.backspace();
    eq(`${list} — 첫 항목이 문단으로 풀리고 나머지는 목록에 남는다`, nabi.getJson(), [
      { w: 'p', ch: ['abcd'] },
      { w: 'p', ch: [{ w: list, ch: [of('bbb')] }] },
    ]);
    const sel = nabi.getSelection();
    ok(`${list} — 통째로 골라지지 않는다(캐럿은 접힌 채)`, sel.anchor.offset === sel.focus.offset);
  }
}

// ─── 그릇 첫머리의 백스페이스 — 지우기 전에 겨눈다 ─────────────────────────────

{
  // 표·인용·접기·코드 넷 다 같은 규칙이다 — 첫 자리 백스페이스는 그릇 통째를 고르고, 다음 백스페이스가 지운다.
  // Table, quote, details, and code share one rule — backspace at the start selects the whole vessel, the next one deletes it.
  const VESSELS: readonly (readonly [string, unknown, readonly number[]])[] = [
    ['인용', { w: 'quote', ch: [{ w: 'p', ch: ['글'] }] }, [1, 0, 0]],
    [
      '접기',
      {
        w: 'details',
        ch: [
          { w: 'summary', ch: ['요약'] },
          { w: 'p', ch: ['속'] },
        ],
      },
      [1, 0, 0],
    ],
    ['코드', { w: 'code', ch: ['x'] }, [1, 0]],
    ['표', { w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [{ w: 'p', ch: ['a'] }] }] }] }, [1, 0, 0, 0, 0]],
  ];
  for (const [name, vessel, first] of VESSELS) {
    const { nabi, actions } = rig([{ w: 'p', ch: ['앞'] }, vessel]);
    nabi.select(at(first, 0));
    actions.backspace();
    eq(`${name} 첫머리의 백스페이스 = 그릇 통째 겨눔`, nabi.getSelection(), {
      anchor: { path: [1], offset: 0 },
      focus: { path: [1], offset: 1 },
    });
    actions.backspace();
    eq(`${name} — 두 번째 백스페이스가 지운다`, nabi.getJson(), [{ w: 'p', ch: ['앞'] }]);
  }
}

{
  // 겨누면 안 되는 자리 셋 — 그릇 안이라도 첫 자리가 아니거나, 아예 그릇 밖일 때.
  // Three positions that must not select the vessel — inside it but not at the start, or outside it entirely.
  const TABLE = {
    w: 'table',
    ch: [
      {
        w: 'tr',
        ch: [
          { w: 'td', ch: [{ w: 'p', ch: ['a'] }] },
          { w: 'td', ch: [{ w: 'p', ch: ['b'] }] },
        ],
      },
    ],
  };
  const aimed = (doc: unknown, sel: Selection): boolean => {
    const { nabi, actions } = rig(doc as never);
    nabi.select(sel);
    actions.backspace();
    const now = nabi.getSelection();
    return now.anchor.offset === 0 && now.focus.offset === 1 && now.anchor.path.length === 1;
  };
  ok(
    '그릇 안이라도 첫 자리가 아니면 안 겨눈다',
    !aimed(
      [
        { w: 'p', ch: ['앞'] },
        { w: 'quote', ch: [{ w: 'p', ch: ['글'] }] },
      ],
      at([1, 0, 0], 1),
    ),
  );
  ok('둘째 칸의 첫머리는 안 겨눈다 (앞 칸이 있다)', !aimed([{ w: 'p', ch: ['앞'] }, TABLE], at([1, 0, 0, 1, 0], 0)));
  ok(
    '그릇 밖 문단의 첫머리는 안 겨눈다',
    !aimed(
      [
        { w: 'p', ch: ['앞'] },
        { w: 'p', ch: ['뒤'] },
      ],
      at([1], 0),
    ),
  );
}

// ─── 화살표 — 경계는 트리, 문단 안은 브라우저 ──────────────────────────────────

{
  const { nabi, actions } = rig([
    { w: 'p', ch: ['ab'] },
    { w: 'p', ch: [IMG] },
    { w: 'p', ch: ['cd'] },
  ]);
  nabi.select(at([0], 1));
  ok('문단 안 좌우는 브라우저의 것', !actions.arrow('right'));
  nabi.select(at([0], 2));
  ok('문단 끝 → 은 우리가 걷는다', actions.arrow('right'));
  eq('걸음: 문단 끝 → 래퍼.0', nabi.getSelection().focus, { path: [1], offset: 0 });
  ok('래퍼.0 → 래퍼.1', actions.arrow('right'));
  eq('걸음: 래퍼 안 한 칸', nabi.getSelection().focus, { path: [1], offset: 1 });
  ok('래퍼.1 → 다음 문단 처음', actions.arrow('right'));
  eq('걸음: 래퍼 밖으로', nabi.getSelection().focus, { path: [2], offset: 0 });
  ok('되돌아 걷기도 우리 것', actions.arrow('left'));
  eq('걸음: 역방향', nabi.getSelection().focus, { path: [1], offset: 1 });
  nabi.select(at([1], 1));
  ok('래퍼에서 상하도 우리 것', actions.arrow('down'));
  eq('래퍼.1 아래 = 다음 문단', nabi.getSelection().focus, { path: [2], offset: 0 });
  nabi.select(at([1], 0));
  actions.arrow('up');
  eq('래퍼.0 위 = 앞 문단 끝', nabi.getSelection().focus, { path: [0], offset: 2 });
  nabi.select(at([0], 0));
  ok('문서 처음의 ← 는 제자리 소비', actions.arrow('left'));
  eq('문서 처음 캐럿 유지', nabi.getSelection().focus, { path: [0], offset: 0 });
}

// ─── 전체 선택 ──────────────────────────────────────────────────────────────────

{
  const { nabi, actions } = rig([
    { w: 'p', ch: ['ab'] },
    { w: 'p', ch: [IMG] },
  ]);
  ok('전체 선택', actions.selectAll());
  eq('시작은 문서 처음', nabi.getSelection().anchor, { path: [0], offset: 0 });
  eq('끝은 마지막 정거장(래퍼.1)', nabi.getSelection().focus, { path: [1], offset: 1 });
  nabi.applyCommand('deleteRange');
  eq('전체 선택 삭제에 물건도 죽는다 (042 종결)', nabi.getJson(), [{ w: 'p', ch: [] }]);
}

// ─── 예약 — escapeKeys 음수 방향과 arm 배선 ─────────────────────────────────────

{
  const { nabi, actions } = rig([{ w: 'p', ch: [{ w: 'a', a: { href: 'https://x.com/' }, ch: ['ab'] }] }]);
  nabi.select(at([0], 2)); // 링크 끝 — 앞 글자가 링크 안이다
  ok('링크 끝의 Escape = 음수 예약', actions.escapeKey('Escape'));
  ok('음수 예약이 섰다', hostOf(nabi).armed.peek().minus.includes('a'));
  nabi.applyCommand('insertText', { text: 'z' });
  const p = nabi.getJson()[0] as { ch: unknown[] };
  eq('다음 글자는 링크 밖', p.ch[p.ch.length - 1], 'z');
}

{
  const { nabi, actions } = rig([{ w: 'p', ch: ['x'] }]);
  nabi.select(at([0], 1));
  ok('접힌 캐럿의 값 마크 = 예약 (arm 배선)', nabi.applyCommand('setHighlight', { c: 'yellow' }));
  ok('예약이 섰다', hostOf(nabi).armed.isArmed('hl'));
  nabi.applyCommand('insertText', { text: 'y' });
  eq('친 글자가 형광펜을 입는다', nabi.getJson(), [{ w: 'p', ch: ['x', { w: 'hl', a: { c: 'yellow' }, ch: ['y'] }] }]);
  // 캐럿은 이제 그 형광펜 안이다 — 색을 바꾸는 것은 예약이 아니라 마크 전체를 바꾸는 일이다(접힌 캐럿은 상황 줄이 보여주는 범위 전체를 고른 것으로 본다, 링크와 같은 규칙).
  // The caret now sits inside that highlight — changing color here isn't arming, it changes the whole mark (a collapsed caret is treated as selecting the range the context bar shows, same rule as links).
  nabi.applyCommand('setHighlight', { c: 'green' });
  eq('마크 안의 접힌 캐럿 = 그 마크 전체가 바뀐다', nabi.getJson(), [
    { w: 'p', ch: ['x', { w: 'hl', a: { c: 'green' }, ch: ['y'] }] },
  ]);
  ok('그때는 예약이 안 선다', !hostOf(nabi).armed.isArmed('hl'));
  ok('마크 안이라 Escape 는 음수 예약으로 나간다', actions.escapeKey('Escape'));

  nabi.select(at([0], 1)); // 마크 밖(맨 글자 뒤) — 걷을 것도 탈출할 마크도 없다
  ok('걷을 것이 없으면 Escape 는 안 소비한다', !actions.escapeKey('Escape'));
  ok('목록 밖 값은 예약도 거절', !nabi.applyCommand('setHighlight', { c: 'teal' }));
}

// 같은 규칙의 나머지 반쪽 — 긁어서 고른 것은 그 범위만 대상이다.
// The other half of the same rule — a dragged selection affects only that range.
{
  const { nabi } = rig([{ w: 'p', ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['형광펜'] }] }]);
  nabi.select({ anchor: at([0], 0).anchor, focus: at([0], 1).focus });
  nabi.applyCommand('setHighlight', { c: 'green' });
  eq('범위 선택은 그 일부만 바뀐다', nabi.getJson(), [
    {
      w: 'p',
      ch: [
        { w: 'hl', a: { c: 'green' }, ch: ['형'] },
        { w: 'hl', a: { c: 'yellow' }, ch: ['광펜'] },
      ],
    },
  ]);
}

// 접힌 캐럿이 마크 한가운데면 낱말 전체가 바뀌고, 캐럿은 있던 자리에 그대로 남는다.
// A collapsed caret in the middle of a mark changes the whole mark, and the caret stays right where it was.
{
  const { nabi } = rig([{ w: 'p', ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['형광펜'] }] }]);
  nabi.select(at([0], 2)); // '형광' 뒤 — 마크 한가운데
  nabi.applyCommand('setHighlight', { c: 'green' });
  eq('낱말 전체가 바뀐다', nabi.getJson(), [{ w: 'p', ch: [{ w: 'hl', a: { c: 'green' }, ch: ['형광펜'] }] }]);
  const sel = nabi.getSelection();
  ok('캐럿은 있던 자리에 남는다', sel.focus.offset === 2 && sel.anchor.offset === 2);
}

// ─── Esc 두 번 = 서식 지우기 ─────────────────────────────────────────────────────
// 연타는 Wing.doubleKeys 선언 → registry 표 → escapeKey 순으로 흐른다 — 표면은 wing 이름을 모르고, 시계가 주입이라 진짜 시간을 안 기다린다.
// A double-tap flows: Wing.doubleKeys declaration -> registry table -> escapeKey — surface never knows wing names, and the injected clock means it never waits on real time.

// 게이트를 그물이 쥔다 — mount 가 DOM 에서 답하는 그 자리다.
// The test net owns the gate — the spot mount would normally answer from the DOM.
function escRig(doc: unknown, plain?: () => boolean, wings: readonly Wing[] = TEST_WINGS): Rig {
  const { nabi, registry } = createNabiWith(wings, { doc });
  const actions = makeSurfaceActions({
    nabi,
    registry,
    now: () => clock,
    ...(plain ? { plain } : {}),
  });
  return { nabi, actions };
}

const BOLD_DOC = [{ w: 'p', a: { h: 2 }, ch: [{ w: 'b', ch: ['굵게'] }] }];
const range = (path: readonly number[], from: number, to: number): Selection => ({
  anchor: { path, offset: from },
  focus: { path, offset: to },
});
const plainDoc = [{ w: 'p', ch: ['굵게'] }];

{
  const { nabi, actions } = escRig(BOLD_DOC);
  nabi.select(range([0], 0, 2));
  ok('첫 Esc 는 아직 아무것도 안 한다', !actions.escapeKey('Escape'));
  tick(350);
  ok('창 안의 둘째 Esc 가 소비된다', actions.escapeKey('Escape'));
  eq('마크도 문단 속성도 한 번에 걷힌다', nabi.getJson(), plainDoc);
}

{
  const { nabi, actions } = escRig(BOLD_DOC);
  nabi.select(range([0], 0, 2));
  actions.escapeKey('Escape');
  tick(351);
  ok('창 밖(351ms)의 둘째 Esc 는 안 소비된다', !actions.escapeKey('Escape'));
  eq('트리가 그대로다', nabi.getJson(), BOLD_DOC);
}

// 예약이 서 있어도 셈은 돈다 — 첫 Esc 가 예약을 걷고, 둘째가 서식을 지운다.
// Counting continues even with an active arm — the first Esc disarms, the second strips formatting.
{
  const { nabi, actions } = escRig([{ w: 'p', a: { h: 2 }, ch: ['가나'] }]);
  nabi.select(range([0], 0, 2));
  hostOf(nabi).armed.arm({ w: 'b', ch: [] }); // 겨눔이 선 뒤에 예약이 선다 — 자리를 옮기면 예약이 걷힌다
  ok('첫 Esc 는 예약을 걷는다', actions.escapeKey('Escape'));
  ok('예약이 걷혔다', hostOf(nabi).armed.isEmpty());
  tick(10);
  ok('그 다음 Esc 가 연타의 둘째다', actions.escapeKey('Escape'));
  eq('예약을 걷은 뒤에도 둘째에 발동한다', nabi.getJson(), [{ w: 'p', ch: ['가나'] }]);
}

// 접힌 캐럿에서도 발동한다 — 단추를 그 자리에서 누른 것과 같다. 벗길 마크가 없으면 문단 속성을 한 켜씩 걷는다(clearAtCaret).
// Fires even on a collapsed caret — same as pressing the button right there. With no mark to strip, it peels one layer of paragraph attrs instead (clearAtCaret).
{
  const CARET_DOC = [{ w: 'p', a: { h: 2 }, ch: ['굵게'] }];
  const { nabi, actions } = escRig(CARET_DOC);
  nabi.select(at([0], 1));
  actions.escapeKey('Escape');
  tick(10);
  ok('접힌 캐럿의 둘째 Esc 가 소비된다', actions.escapeKey('Escape'));
  eq('벗길 마크가 없으면 문단 속성이 걷힌다', nabi.getJson(), plainDoc);
}

// 형광펜 위의 캐럿 — 마크 안이라 Esc 마다 선언된 마크 탈출(escapeKeys)이 먼저 키를 가져가지만, 셈은 계속 돌아 둘째에 형광펜이 벗겨진다.
// A caret inside a highlight — being inside a mark means declared escapeKeys grab each Esc first, but the count still advances and the second Esc strips it.
{
  const { nabi, actions } = escRig([{ w: 'p', ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['형광펜'] }] }]);
  nabi.select(at([0], 2)); // 마크 한가운데
  ok('첫 Esc 는 탈출 예약으로 소비된다', actions.escapeKey('Escape'));
  ok('음수 예약이 섰다', hostOf(nabi).armed.peek().minus.includes('hl'));
  tick(10);
  ok('둘째 Esc 가 서식 지우기로 간다', actions.escapeKey('Escape'));
  eq('형광펜이 통째로 벗겨진다', nabi.getJson(), [{ w: 'p', ch: ['형광펜'] }]);
}

// 누르고 있는 것은 연타가 아니다 — 반복 이벤트는 세지 않을 뿐 아니라 셈 자체를 끊는다.
// A held key isn't a double-tap — a repeat event isn't counted, and it breaks the streak too.
{
  const { nabi, actions } = escRig(BOLD_DOC);
  nabi.select(range([0], 0, 2));
  actions.escapeKey('Escape');
  tick(10);
  ok('repeat 인 Esc 는 발동 안 한다', !actions.escapeKey('Escape', true));
  tick(10);
  ok('repeat 가 셈을 끊었다', !actions.escapeKey('Escape'));
  eq('눌러 둔 Esc 로는 안 지워진다', nabi.getJson(), BOLD_DOC);
}

// IME — 조합이 지나면 셈이 끊긴다(mount 가 조합 중마다 부르는 그 문).
// IME — once a composition passes through, the streak breaks (the same call mount makes on every keystroke during composition).
{
  const { nabi, actions } = escRig(BOLD_DOC);
  nabi.select(range([0], 0, 2));
  actions.escapeKey('Escape');
  actions.breakDouble();
  tick(10);
  ok('조합 직후의 Esc 는 앞의 것과 안 이어진다', !actions.escapeKey('Escape'));
  eq('조합 뒤에도 트리가 그대로다', nabi.getJson(), BOLD_DOC);
}

// 사이에 다른 키가 오면 끊긴다 — 글자를 치는 손은 연타가 아니다.
// A different key in between breaks it — a hand that's typing isn't double-tapping.
{
  const { nabi, actions } = escRig(BOLD_DOC);
  nabi.select(range([0], 0, 2));
  actions.escapeKey('Escape');
  actions.escapeKey('a');
  tick(10);
  ok('사이에 글자가 끼면 안 발동한다', !actions.escapeKey('Escape'));
  eq('그때도 트리가 그대로다', nabi.getJson(), BOLD_DOC);
}

// Esc 네 번은 두 번이 아니라 한 번이다 — 발동은 딱 둘째 두드림이고 셋째부터는 흘러간다.
// Four Escs aren't two double-taps — only the second tap fires, everything from the third on just passes through.
{
  const { nabi, actions } = escRig(BOLD_DOC);
  nabi.select(range([0], 0, 2));
  actions.escapeKey('Escape');
  tick(10);
  ok('둘째에 발동', actions.escapeKey('Escape'));
  eq('한 번 걷혔다', nabi.getJson(), plainDoc);
  // 지울 것을 다시 만든다 — 두 번째 발동이 있었다면 이것이 걷혔을 것이다.
  // Re-create something to strip — if a second trigger fired, this would be the thing removed.
  ok('다시 굵게', nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } }));
  tick(10);
  ok('셋째는 아무 일 없다', !actions.escapeKey('Escape'));
  tick(10);
  ok('넷째도 아무 일 없다 (네 번 = 한 번)', !actions.escapeKey('Escape'));
  eq('두 번째 발동은 없다', nabi.getJson(), [{ w: 'p', ch: [{ w: 'b', ch: ['굵게'] }] }]);
}

// 게이트 — 위에 뭔가 떠 있으면 세지도 발동하지도 않는다. 전체화면의 첫 Esc 가 화면을 나가고 둘째가 서식을 지우는 길을 막는 게 요점이다.
// A gate — while something covers the surface, Esc neither counts nor fires. The point is blocking the path where a fullscreen's first Esc exits and a second strips formatting.
{
  let up = true;
  const { nabi, actions } = escRig(BOLD_DOC, () => !up);
  nabi.select(range([0], 0, 2));
  ok('덮인 동안의 첫 Esc 는 안 소비된다', !actions.escapeKey('Escape'));
  tick(10);
  up = false; // 첫 Esc 가 전체화면을 나갔다 — 이제 일반 편집 상태다
  ok('걷힌 직후의 Esc 는 연타의 둘째가 아니다', !actions.escapeKey('Escape'));
  eq('한 몸짓에 두 일이 안 난다', nabi.getJson(), BOLD_DOC);
  tick(10);
  ok('새로 두 번 치면 그때는 발동한다', actions.escapeKey('Escape'));
  eq('게이트가 열린 뒤에는 걷힌다', nabi.getJson(), plainDoc);
}

// 업로드 잠금 — 게이트를 안 줘도 인스턴스의 `$lock` 이 문을 닫는다.
// Upload lock — even without a gate, the instance's $lock closes the door.
{
  const { nabi, actions } = escRig(BOLD_DOC);
  const unlock = hostOf(nabi).lock('upload');
  nabi.select(range([0], 0, 2));
  actions.escapeKey('Escape');
  tick(10);
  ok('잠긴 동안은 연타가 안 선다', !actions.escapeKey('Escape'));
  unlock();
  tick(10);
  ok('풀린 직후의 Esc 도 둘째가 아니다', !actions.escapeKey('Escape'));
  eq('잠금 중에는 트리가 그대로다', nabi.getJson(), BOLD_DOC);
}

// 서식 지우기 wing 을 안 끼운 편집기 — 표가 비어 있어 연타가 아무 일도 안 한다.
// An editor without the clear-format wing — the table is empty, so a double-tap does nothing.
{
  const bare = TEST_WINGS.filter((wing) => wing.w !== 'clearFormat');
  const { nabi, actions } = escRig(BOLD_DOC, undefined, bare);
  nabi.select(range([0], 0, 2));
  actions.escapeKey('Escape');
  tick(10);
  ok('연타를 선언한 wing 이 없으면 무동작', !actions.escapeKey('Escape'));
  eq('안 끼운 편집기의 트리는 그대로다', nabi.getJson(), BOLD_DOC);
}

// ─── 오토포맷 ─────────────────────────────────────────────────────────────────

function typed(actions: SurfaceActions, nabi: Nabi, text: string): boolean {
  for (const ch of text) nabi.applyCommand('insertText', { text: ch });
  return actions.afterSpace();
}

{
  const { nabi, actions } = rig();
  ok('# 스페이스가 변환된다', typed(actions, nabi, '# '));
  eq('제목 1 이 선다 (규격 글자 없이)', nabi.getJson(), [{ w: 'p', a: { h: 1 }, ch: [] }]);
  nabi.undo();
  eq('undo 한 걸음에 친 그대로 돌아온다', nabi.getJson(), [{ w: 'p', ch: ['# '] }]);
}

{
  const { nabi, actions } = rig();
  ok('### 는 제목 3', typed(actions, nabi, '### '));
  eq('제목 3', nabi.getJson(), [{ w: 'p', a: { h: 3 }, ch: [] }]);
}

{
  const { nabi, actions } = rig();
  ok('####### 는 안 잡힌다', !typed(actions, nabi, '####### '));
}

{
  const { nabi, actions } = rig();
  ok('- 는 글머리 목록', typed(actions, nabi, '- '));
  eq('글머리', nabi.getJson(), [{ w: 'p', ch: [{ w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: [] }] }] }] }]);
}

{
  const { nabi, actions } = rig();
  ok('7. 도 번호 목록의 시작', typed(actions, nabi, '7. '));
  eq('번호', nabi.getJson(), [{ w: 'p', ch: [{ w: 'ol', ch: [{ w: 'oli', ch: [{ w: 'p', ch: [] }] }] }] }]);
}

{
  const { nabi, actions } = rig();
  ok('1.2 는 안 잡힌다', !typed(actions, nabi, '1.2 '));
}

{
  const { nabi, actions } = rig();
  ok('[x] 는 체크된 항목', typed(actions, nabi, '[x] '));
  eq('체크', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'tl', ch: [{ w: 'tli', a: { ck: 1 }, ch: [{ w: 'p', ch: [] }] }] }] },
  ]);
}

{
  const { nabi, actions } = rig();
  ok('> 는 인용', typed(actions, nabi, '> '));
  eq('인용', nabi.getJson(), [{ w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: [] }] }] }]);
}

{
  const { nabi, actions } = rig();
  for (const ch of '---') nabi.applyCommand('insertText', { text: ch });
  tick(2_000);
  ok('--- 엔터는 구분선 (엔터 트리거)', actions.enter());
  eq('구분선', nabi.getJson(), [{ w: 'p', ch: [{ w: 'hr', ch: [] }] }]);
}

{
  const { nabi, actions } = rig();
  for (const ch of '```ts') nabi.applyCommand('insertText', { text: ch });
  tick(2_000);
  actions.enter();
  eq('코드 펜스 + 언어', nabi.getJson(), [{ w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: [] }] }]);
}

{
  const { nabi, actions } = rig([{ w: 'p', ch: [{ w: 'code', ch: ['x'] }] }]);
  nabi.select(at([0, 0], 1));
  ok('코드 안에서는 규칙이 안 뜬다', !typed(actions, nabi, '# '));
}

{
  const { nabi, actions } = rig();
  ok('맨 URL 스페이스 = 링크', typed(actions, nabi, 'see https://x.com '));
  eq('토큰만 링크가 된다', nabi.getJson(), [
    { w: 'p', ch: ['see ', { w: 'a', a: { href: 'https://x.com/' }, ch: ['https://x.com'] }, ' '] },
  ]);
  eq('캐럿은 제자리(스페이스 뒤)', nabi.getSelection().focus, { path: [0], offset: 18 });
  // 이미 링크가 된 글자 위의 엔터 — 규칙이 다시 안 뜨고 분할로 떨어진다.
  // Enter on text that's already a link — the rule doesn't refire, it just falls through to a split.
  nabi.select(at([0], 17));
  tick(2_000);
  actions.enter();
  ok('결과가 서 있으면 재발화하지 않는다', nabi.getJson().length === 2);
}

// ─── 되맞추기 자(diff)와 평문 뷰 ────────────────────────────────────────────────

{
  eq('diff: 삽입', diffPlain('ab', 'axb'), { start: 1, removedEnd: 1, inserted: 'x' });
  eq('diff: 삭제', diffPlain('axb', 'ab'), { start: 1, removedEnd: 2, inserted: '' });
  eq('diff: 교체', diffPlain('abc', 'aXc'), { start: 1, removedEnd: 2, inserted: 'X' });
  eq('diff: 같음', diffPlain('ab', 'ab'), null);
  eq('diff: 덧붙임', diffPlain('', '가'), { start: 0, removedEnd: 0, inserted: '가' });
}

{
  const { nabi } = rig([{ w: 'p', ch: ['a', { w: 'br', ch: [] }, 'b'] }]);
  const holder = nodeAt(hostOf(nabi).doc(), [0]);
  ok('평문 뷰: 라인은 \\n 한 칸', holder !== null && holderTextOf(holder, terminalOf(hostOf(nabi).env)) === 'a\nb');
}

// ─── 부분 재그리기 계획 ─────────────────────────────────────────────────────────

{
  const { nabi } = rig([
    { w: 'p', ch: ['a'] },
    { w: 'p', ch: ['b'] },
  ]);
  let last: NabiChange | null = null;
  nabi.onChange((change) => {
    last = change;
  });
  nabi.select(at([1], 0));
  nabi.applyCommand('insertText', { text: 'x' });
  const change = last as NabiChange | null;
  ok('신호는 바뀐 문단 하나만 싣는다', change !== null && change.paragraphs.length === 1);
  const ops = change ? planRedraw(hostOf(nabi).doc(), change) : [];
  ok('계획: put 하나', ops.length === 1 && ops[0]?.kind === 'put');
  ok('계획: 그 문단의 자리(1)', ops[0]?.kind === 'put' && ops[0].index === 1);

  nabi.select(at([1], 0));
  nabi.applyCommand('deleteBackward'); // 병합 — 두 번째 문단이 사라진다
  const merged = last as NabiChange | null;
  const ops2 = merged ? planRedraw(hostOf(nabi).doc(), merged) : [];
  ok('병합 계획: remove 가 먼저 온다', ops2.length >= 2 && ops2[0]?.kind === 'remove');
  ok(
    '병합 계획: 남은 문단 put',
    ops2.some((op) => op.kind === 'put' && op.index === 0),
  );
}

// ─── 붙여넣기 조각 끼우기 ───────────────────────────────────────────────────────

{
  const { nabi } = rig([{ w: 'p', ch: ['abcd'] }]);
  nabi.select(at([0], 2));
  const frag: ElementNode[] = [
    { w: 'p', ch: ['X'] },
    { w: 'p', ch: ['Y'] },
  ];
  ok('조각 끼우기', hostOf(nabi).applyRaw(insertFragmentOp(frag), 'insertFragment'));
  eq('가운데를 가르고 선다', nabi.getJson(), [
    { w: 'p', ch: ['ab'] },
    { w: 'p', ch: ['X'] },
    { w: 'p', ch: ['Y'] },
    { w: 'p', ch: ['cd'] },
  ]);
  eq('캐럿은 조각 뒤 문단 처음', nabi.getSelection().focus, { path: [3], offset: 0 });
}

{
  const { nabi } = rig();
  nabi.select(at([0], 0));
  ok(
    '빈 문단 + 여러 문단 조각 = 교체',
    hostOf(nabi).applyRaw(insertFragmentOp([{ w: 'p', ch: ['X'] }]), 'insertFragment'),
  );
  eq('빈 문단이 사라진다', nabi.getJson(), [{ w: 'p', ch: ['X'] }]);
}

// 문단 하나짜리 인라인 조각은 안 가른다 — 문단 중간에 붙이면 문단 하나가 셋이 되던 버그였다(문단만 글자로 풀어 잇는 옛 규칙).
// A single-paragraph inline fragment doesn't split — pasting into the middle of a paragraph used to turn one paragraph into three (splice in as plain text when it's just one paragraph).

{
  const { nabi } = rig([{ w: 'p', ch: ['abcd'] }]);
  nabi.select(at([0], 2));
  ok('인라인 조각 끼우기', hostOf(nabi).applyRaw(insertFragmentOp([{ w: 'p', ch: ['XY'] }]), 'insertFragment'));
  eq('문단 하나 조각은 문단을 안 가른다', nabi.getJson(), [{ w: 'p', ch: ['abXYcd'] }]);
  eq('캐럿은 이어 쓴 글자 뒤', nabi.getSelection().focus, { path: [0], offset: 4 });
}

{
  const { nabi } = rig([{ w: 'p', ch: ['abcd'] }]);
  nabi.select(at([0], 2));
  const frag: ElementNode[] = [{ w: 'p', ch: [{ w: 'b', ch: ['XY'] }] }];
  ok('마크 든 인라인 조각', hostOf(nabi).applyRaw(insertFragmentOp(frag), 'insertFragment'));
  eq('마크가 그대로 산다', nabi.getJson(), [{ w: 'p', ch: ['ab', { w: 'b', ch: ['XY'] }, 'cd'] }]);
}

{
  const { nabi } = rig([{ w: 'p', ch: ['abcd'] }]);
  nabi.select(at([0], 2));
  const frag: ElementNode[] = [{ w: 'p', ch: ['X', { w: 'br', ch: [] }, 'Y'] }];
  ok('라인 든 인라인 조각', hostOf(nabi).applyRaw(insertFragmentOp(frag), 'insertFragment'));
  eq('라인이 한 문단 안에 산다', nabi.getJson(), [{ w: 'p', ch: ['abX', { w: 'br', ch: [] }, 'Ycd'] }]);
}

{
  // 블록의 뜻을 든 문단(제목·정렬·드롭캡)은 글줄로 누르면 그 뜻이 사라져 가르기로 간다.
  // A paragraph carrying block meaning (heading, alignment, dropcap) would lose it if flattened into a line, so it splits instead.
  const { nabi } = rig([{ w: 'p', ch: ['abcd'] }]);
  nabi.select(at([0], 2));
  const frag: ElementNode[] = [{ w: 'p', a: { h: 1 }, ch: ['XY'] }];
  ok('제목 조각 끼우기', hostOf(nabi).applyRaw(insertFragmentOp(frag), 'insertFragment'));
  eq('제목 조각은 여전히 가른다', nabi.getJson(), [
    { w: 'p', ch: ['ab'] },
    { w: 'p', a: { h: 1 }, ch: ['XY'] },
    { w: 'p', ch: ['cd'] },
  ]);
}

{
  const { nabi } = rig();
  nabi.select(at([0], 0));
  const wrapper: ElementNode = { w: 'p', ch: [{ w: 'img', a: { src: 'https://x.com/a.png' }, ch: [] }] };
  ok('빈 문단 + 단일 물건 = 교체', hostOf(nabi).applyRaw(insertFragmentOp([wrapper]), 'insertFragment'));
  const top = hostOf(nabi).doc()[0];
  ok('그 자리가 래퍼문단이 된다', top !== undefined && top.ch.length === 1 && isElement(top.ch[0] ?? ''));
  eq('캐럿은 물건 뒤(래퍼.1)', nabi.getSelection().focus, { path: [0], offset: 1 });
}

// 래퍼문단의 속성이 물건과 함께 붙는다 — 가운데 세운 그림만 복사해 붙이면 왼쪽으로 돌아오던 버그였다(정렬 정보가 조각엔 도착했지만 새 껍데기를 입히며 버려졌다).
// A wrapper paragraph's attrs travel with the object — copy-pasting just a centered image used to snap it back to the left (the alignment data arrived in the fragment but was discarded when re-wrapped).

{
  const { nabi } = rig();
  nabi.select(at([0], 0));
  const wrapper: ElementNode = {
    w: 'p',
    a: { a: 'c' },
    ch: [{ w: 'img', a: { src: 'https://x.com/a.png', w: '50' }, ch: [] }],
  };
  ok('빈 문단 + 정렬 실린 래퍼 조각', hostOf(nabi).applyRaw(insertFragmentOp([wrapper]), 'insertFragment'));
  eq('빈 자리에서도 실려 온 정렬이 이긴다', nabi.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: 'https://x.com/a.png', w: '50' }, ch: [] }] },
  ]);
}

{
  const { nabi } = rig([{ w: 'p', ch: ['abcd'] }]);
  nabi.select(at([0], 4));
  const wrapper: ElementNode = {
    w: 'p',
    a: { a: 'r' },
    ch: [{ w: 'img', a: { src: 'https://x.com/a.png' }, ch: [] }],
  };
  ok('글 문단 뒤 + 래퍼 조각', hostOf(nabi).applyRaw(insertFragmentOp([wrapper]), 'insertFragment'));
  eq('빈 자리가 아니어도 정렬이 함께 선다', nabi.getJson(), [
    { w: 'p', ch: ['abcd'] },
    { w: 'p', a: { a: 'r' }, ch: [{ w: 'img', a: { src: 'https://x.com/a.png' }, ch: [] }] },
  ]);
}

{
  // 속성 없는 래퍼는 지금까지와 똑같다 — 빈 문단이 든 속성을 빼앗지 않는다.
  // A wrapper with no attrs behaves as before — it doesn't strip the attrs the empty paragraph already had.
  const { nabi } = rig([{ w: 'p', a: { a: 'c' }, ch: [] }]);
  nabi.select(at([0], 0));
  const wrapper: ElementNode = { w: 'p', ch: [{ w: 'img', a: { src: 'https://x.com/a.png' }, ch: [] }] };
  ok('맨 래퍼 조각', hostOf(nabi).applyRaw(insertFragmentOp([wrapper]), 'insertFragment'));
  eq('빈 문단이 들고 있던 정렬이 산다', nabi.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: 'https://x.com/a.png' }, ch: [] }] },
  ]);
}

{
  // 첨부 조각(문단+빈 문단)은 문단 둘이라 글줄로 안 눌린다 — 제 줄에 서고 빈 줄이 뒤따른다.
  // An attachment fragment (paragraph + empty paragraph) has two paragraphs, so it doesn't flatten into a line — it stands on its own line with a blank line after.
  const { nabi } = rig([{ w: 'p', ch: ['앞', { w: 'a', a: { href: 'https://x/f.txt', file: 'txt' }, ch: ['첨부'] }] }]);
  nabi.select(at([0], 3));
  const frag: ElementNode[] = [
    { w: 'p', ch: [{ w: 'a', a: { href: 'https://x/g.txt', file: 'txt' }, ch: ['둘째'] }] },
    { w: 'p', ch: [] },
  ];
  ok('첨부 조각 끼우기', hostOf(nabi).applyRaw(insertFragmentOp(frag), 'insertFragment'));
  eq('첨부는 제 줄에 서고 빈 줄이 뒤에 남는다', nabi.getJson(), [
    { w: 'p', ch: ['앞', { w: 'a', a: { href: 'https://x/f.txt', file: 'txt' }, ch: ['첨부'] }] },
    { w: 'p', ch: [{ w: 'a', a: { href: 'https://x/g.txt', file: 'txt' }, ch: ['둘째'] }] },
    { w: 'p', ch: [] },
    { w: 'p', ch: [] },
  ]);
}

// ─── 드롭캡 걸음 재료 ───────────────────────────────────────────────

{
  const { nabi, actions } = rig([
    { w: 'p', ch: ['a'] },
    { w: 'p', a: { dc: 1 }, ch: ['b'] },
  ]);
  nabi.select(at([0], 1));
  eq('다음 문단이 드롭캡이면 그 첫 자리', actions.dropcapBelow(), { path: [1], offset: 0 });
  const plain = rig([
    { w: 'p', ch: ['a'] },
    { w: 'p', ch: ['b'] },
  ]);
  plain.nabi.select(at([0], 1));
  ok('드롭캡이 아니면 개입하지 않는다', plain.actions.dropcapBelow() === null);
}

// ─── 안내글의 말이 시트로 건너가는 길 ────────────────────────────────────────────

{
  // 줄바꿈은 CSS 의 16진 escape 다 — JS 의 '\n' 을 그대로 흘리면 CSS 는 그냥 글자 "n"으로 읽는다.
  // A line break becomes a CSS hex escape — letting JS's '\n' through as-is would make CSS read it as the literal letter 'n'.
  eq('안내글: 줄바꿈은 \\A 로 건너간다', cssQuoted('첫 줄\n둘째 줄'), '"첫 줄\\A 둘째 줄"');
  eq('안내글: 윈도우 줄바꿈도 한 줄로 센다', cssQuoted('a\r\nb'), '"a\\A b"');
  eq('안내글: 줄바꿈 다음의 공백은 살아남는다', cssQuoted('a\n b'), '"a\\A  b"');
  // 따옴표·역슬래시가 새면 그 자리에서 규칙 하나가 통째로 깨진다 — 선언이 조기 종료된다.
  // A leaked quote or backslash breaks the whole declaration right there — it terminates early.
  eq('안내글: 따옴표와 역슬래시는 막는다', cssQuoted('a"b\\c'), '"a\\"b\\\\c"');
  eq('안내글: 여느 말은 그대로 따옴표만 두른다', cssQuoted('여기에 글을 쓰세요'), '"여기에 글을 쓰세요"');
}

done('surface');
