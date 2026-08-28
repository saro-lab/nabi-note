// ui 그물 — **DOM 없는 순수부만** 잡는다. 화면 상호작용은 실제로 띄워 보는 쪽의 몫이다.
// 눌림 판정 표 — 마크·값 마크·문단 속성·컨테이너·표의 상태 토큰 (한 벌뿐인 그 문 하나)
// 노출 규칙 — 코드 상자 속·표 속·래퍼문단에서 무엇이 보이고 무엇이 숨는가
// 상황 줄 그룹 — 캐럿 경로에서 나오는 그룹과 그 순서
// locale — 폴백 규칙(요청 → en → 키) + 등록 wing 전부가 이름을 든다(사전 키 커버)
// CSS — 시트 접기가 **글 단위**다(가족 수만큼 중복 재발 금지) + 손가락 표적·편집 화면의 정렬 표식
// 띠 — 040 §1 규칙의 사각형 산수
// 뜨는 판 — 네 변 넘침 보정과 위로 뒤집기 (084 ②)
// 첨부 물건 — 클릭 고르기·통째 넓히기·물건 표식(data-nabi-picked)·저장값 왕복
import { $fromJson, type ElementNode } from '../src/schema/index.js';
import { caretAt, makeArmed, type Selection } from '../src/caret/index.js';
import { attachFileLink } from '../src/wings/link/attach.js';
import { tinyHtml } from './tiny-html.js';
import { mountSticky } from '../src/ui/sticky.js';
import { createNabiWith, makeRegistry, type Registry, type WingField } from '../src/wing/index.js';
import { defaultWings, wings } from '../src/wings/index.js';
import { toolbarSlots } from '../src/wing/toolbar-html.js';
import { makeImageWing } from '../src/wings/img/img.js';
import { safeUrl } from '../src/html/index.js';
import { videoId, youtubeId } from '../src/html/url.js';
import { DICTIONARY, LOCALES, localeOf, makeTranslator, translate } from '../src/locale/index.js';
import { HTML_LABEL, MARKDOWN_LABEL, NABI_LABEL, TEXT_LABEL } from '../src/io/index.js';
import {
  BAND_MARGIN,
  CORE_CSS,
  PANEL_EDGE,
  PANEL_GAP,
  KEYBOARD_STEPS,
  REVEAL_STEPS,
  actionReaches,
  admits,
  bandFix,
  bandOf,
  collectSheets,
  contextGroupsAt,
  edgeShift,
  hasToken,
  isIos,
  ownedAncestor,
  panelShift,
  ownedAncestors,
  ownsKey,
  pressedOf,
  pressedValue,
  promptValid,
  reachAt,
  revealFix,
  revealWalk,
  sheetKey,
  stackValue,
  placeWalk,
  toastOrder,
  toastOverflow,
  underWalk,
  visibleAt,
  type PanelBox,
  type PressEnv,
  type PromptField,
  type Settle,
} from '../src/ui/index.js';
import { silentAsk, type Nabi } from '../src/editor/index.js';
import { done, eq, ok } from './net.js';
import { createTicker } from '../src/ui/index.js';

const registry: Registry = makeRegistry(defaultWings);
const env = registry.env;

const docOf = (json: unknown[]): ReturnType<typeof $fromJson> => $fromJson(json, env);
const at = (path: readonly number[], offset: number): Selection => ({
  anchor: { path, offset },
  focus: { path, offset },
});

// 눌림 판정 하나를 세우는 자리 — 예약 상태는 필요할 때만 넣는다.
function press(json: unknown[], sel: Selection, armed?: PressEnv['armed']): PressEnv {
  const doc = docOf(json);
  if (!doc) throw new Error('그물 문서가 안 선다');
  return { doc, sel, env, registry, ...(armed ? { armed } : {}) };
}

// --- 1. 눌림 판정 표 ---------------------------------------------------------------------------

{
  // 단순 마크 — 캐럿은 앞 글자의 마크를 따른다(경계 정규화의 답을 그대로 쓴다).
  const bold = press([{ w: 'p', ch: [{ w: 'b', ch: ['가나'] }, '다'] }], at([0], 2));
  ok('마크: 굵은 글자 뒤 캐럿은 b 가 눌린다', pressedOf(bold, 'b').on);
  ok('마크: 굵은 글자 뒤 캐럿에 i 는 안 눌린다', !pressedOf(bold, 'i').on);

  const after = press([{ w: 'p', ch: [{ w: 'b', ch: ['가나'] }, '다'] }], at([0], 3));
  ok('마크: 마크 밖 글자 뒤에서는 안 눌린다', !pressedOf(after, 'b').on);

  const head = press([{ w: 'p', ch: [{ w: 'b', ch: ['가나'] }] }], at([0], 0));
  ok('마크: 문단 처음은 무마크다', !pressedOf(head, 'b').on);
}

{
  // 값 마크 — 눌림에 **값**이 실린다. 목록 밖 값은 없는 값이라 값이 안 실린다.
  const yellow = press([{ w: 'p', ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['글'] }] }], at([0], 1));
  eq('값 마크: 형광펜 값이 눌림에 실린다', pressedOf(yellow, 'hl'), { on: true, value: 'yellow' });
  ok('값 마크: 그 값 칸이 눌린다', pressedValue(yellow, 'hl', 'yellow'));
  ok('값 마크: 다른 값 칸은 안 눌린다', !pressedValue(yellow, 'hl', 'pink'));

  // 목록 밖 값은 **입구에서 껍데기가 벗겨진다** — 값이 곧 뜻인 마크라 값을 잃으면 마크가 아니다
  // (schema/cocoon 이 wing 의 repair 에 물어본다). 그래서 눌림 자체가 없다.
  const junk = press([{ w: 'p', ch: [{ w: 'hl', a: { c: 'chartreuse' }, ch: ['글'] }] }], at([0], 1));
  ok('값 마크: 목록 밖 값은 마크가 아니다 — 눌림이 없다', !pressedOf(junk, 'hl').on);
}

{
  // 예약 — 문서에는 아직 없지만 다음 글자가 입을 것이라 눌린 것으로 보여야 한다 (①).
  const armed = makeArmed();
  armed.arm({ w: 'b', ch: [] });
  const state = press([{ w: 'p', ch: ['글'] }], at([0], 1), armed);
  ok('예약: 버튼만 누른 직후 b 가 눌려 보인다', pressedOf(state, 'b').on);

  const off = makeArmed();
  off.escape('b');
  const escaped = press([{ w: 'p', ch: [{ w: 'b', ch: ['글'] }] }], at([0], 1), off);
  ok('예약: 음수 예약이면 걸린 마크라도 안 눌린 것으로 보인다', !pressedOf(escaped, 'b').on);

  const valued = makeArmed();
  valued.arm({ w: 'hl', a: { c: 'pink' }, ch: [] });
  const armedValue = press([{ w: 'p', ch: ['글'] }], at([0], 1), valued);
  eq('예약: 값 마크 예약도 값을 답한다', pressedOf(armedValue, 'hl'), { on: true, value: 'pink' });
}

{
  // 문단 속성 — 겨눔은 선택 시작 문단이다.
  const h2 = press([{ w: 'p', a: { h: 2 }, ch: ['제목'] }], at([0], 1));
  eq('문단 속성: 제목 레벨이 값으로 나온다', pressedOf(h2, 'h'), { on: true, value: '2' });
  ok('문단 속성: 그 레벨 칸이 눌린다', pressedValue(h2, 'h', 2));
  ok('문단 속성: 다른 레벨 칸은 안 눌린다', !pressedValue(h2, 'h', 3));
  ok('문단 속성: 제목 아닌 문단은 안 눌린다', !pressedOf(press([{ w: 'p', ch: ['글'] }], at([0], 1)), 'h').on);

  const center = press([{ w: 'p', a: { a: 'c' }, ch: ['글'] }], at([0], 1));
  eq('문단 속성: 정렬 값이 나온다', pressedOf(center, 'align'), { on: true, value: 'c' });
  const cap = press([{ w: 'p', a: { dc: 1 }, ch: ['글'] }], at([0], 1));
  eq('문단 속성: 드롭캡은 불리언 하나다', pressedOf(cap, 'dc'), { on: true, value: '1' });
}

{
  // 컨테이너·단말 — 캐럿을 품는 조상이 곧 눌림이다.
  const quote = press([{ w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['글'] }] }] }], at([0, 0, 0], 1));
  ok('컨테이너: 인용 속 캐럿은 quote 가 눌린다', pressedOf(quote, 'quote').on);
  ok('컨테이너: 인용 밖에서는 안 눌린다', !pressedOf(press([{ w: 'p', ch: ['글'] }], at([0], 1)), 'quote').on);

  const code = press([{ w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['x'] }] }], at([0, 0], 1));
  eq('컨테이너: 코드의 눌림 값은 언어다', pressedOf(code, 'code'), { on: true, value: 'ts' });

  const open = press(
    [{ w: 'p', ch: [{ w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: ['제목'] }, { w: 'p', ch: [] }] }] }],
    at([0, 0, 0], 1),
  );
  eq('컨테이너: 접기의 눌림 값은 상태 토큰이다', pressedOf(open, 'details'), { on: true, value: 'open' });

  // 도구 wing 은 문서에 흔적이 없으므로 절대 안 눌린다.
  ok('도구: clearFormat 은 눌리지 않는다', !pressedOf(press([{ w: 'p', ch: ['글'] }], at([0], 1)), 'clearFormat').on);
}

{
  // 표 — currentValue 가 **상태 토큰 더미**를 답한다 (10 판단). 눌림은 "품는가"로 읽는다.
  const cell = (a?: Record<string, unknown>): unknown => ({ w: 'td', ...(a ? { a } : {}), ch: [{ w: 'p', ch: ['x'] }] });
  const table = (cells: unknown[]): unknown[] => [{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: cells }] }] }];

  const plain = press(table([cell(), cell()]), at([0, 0, 0, 0, 0], 1));
  eq('표: 맨 칸은 토큰이 없다', pressedOf(plain, 'table'), { on: true });

  const header = press(table([cell({ th: 1 }), cell()]), at([0, 0, 0, 0, 0], 1));
  eq('표: 제목 칸은 th 토큰', pressedOf(header, 'table'), { on: true, value: 'th' });

  const both = press(table([cell({ th: 1, colspan: '2' })]), at([0, 0, 0, 0, 0], 1));
  const state = pressedOf(both, 'table');
  eq('표: 병합된 제목 칸은 토큰 둘을 공백으로 잇는다', state.value, 'merged th');
  ok('표: 병합 토글은 merged 토큰으로 눌린다', hasToken(state.value, 'merged'));
  ok('표: 제목 토글은 th 토큰으로 눌린다', hasToken(state.value, 'th'));
  ok('표: 없는 토큰은 안 눌린다', !hasToken(state.value, 'sorted'));
  // "같다" 로 읽으면 여기서 틀린다 — 토큰 둘인 값은 어느 한 낱말과도 같지 않다.
  ok('표: 토큰 더미는 문자열 비교로 읽으면 안 된다', state.value !== 'th' && hasToken(state.value, 'th'));

  // 급이 다른 두 노드의 토큰이 **함께** 실린다 — 정렬 표식은 표에 살고 병합·제목은 칸에 산다.
  // 겨눔 하나만 읽던 시절 정렬 단추는 켜 놓아도 영영 안 눌려 보였다(주인 신고).
  const sorted = (cells: unknown[]): unknown[] => [
    { w: 'p', ch: [{ w: 'table', a: { sort: 1 }, ch: [{ w: 'tr', ch: cells }] }] },
  ];
  const onPlain = pressedOf(press(sorted([cell(), cell()]), at([0, 0, 0, 0, 0], 1)), 'table');
  ok('표: 정렬 표식은 표에 사는데 칸 속 캐럿에서 읽힌다', hasToken(onPlain.value, 'sort'));
  const onHeader = pressedOf(press(sorted([cell({ th: 1 }), cell()]), at([0, 0, 0, 0, 0], 1)), 'table');
  ok('표: 칸의 토큰과 표의 토큰이 한 값에 함께 실린다', hasToken(onHeader.value, 'th') && hasToken(onHeader.value, 'sort'));
  ok('표: 정렬을 안 켠 표는 그 토큰이 없다', !hasToken(pressedOf(header, 'table').value, 'sort'));

  // 정렬 단추는 **토글**이다 — 표에 상태가 둘뿐이라 켜 놓은 것이 화면에 보여야 한다.
  const sortControl = registry.wingOf('table')?.context?.controls.find((control) => control.name === 'sortable');
  ok('표: 정렬 컨트롤이 토글이다', sortControl?.kind === 'toggle');
  eq('표: 그 토글이 읽는 토큰은 표의 것이다', sortControl?.kind === 'toggle' ? sortControl.token : '', 'sort');
}

{
  // 줄기 합치기의 경계 — 같은 급이 겹치면 **안쪽 하나만** 말한다. 접기 속 접기에서 바깥의
  // 'open' 과 안쪽의 'shut' 이 함께 실리면 토글 하나가 켜진 동시에 꺼진 것으로 보인다.
  const nested = docOf([
    {
      w: 'p',
      ch: [
        {
          w: 'details',
          a: { o: 1 },
          ch: [
            { w: 'summary', ch: ['밖'] },
            { w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['안'] }, { w: 'p', ch: ['글'] }] }] },
          ],
        },
      ],
    },
  ]);
  const detailsWing = registry.wingOf('details');
  const stack = stackValue(ownedAncestors(nested!, [0, 0, 1, 0, 0, 1, 0], detailsWing!, registry), detailsWing!);
  eq('줄기: 같은 급이 겹치면 안쪽 하나만 답한다', stack, 'shut');

  // 급이 다르면 함께 실린다 — 표(sort)와 칸(th)은 서로 다른 것을 말한다.
  const table = docOf([
    {
      w: 'p',
      ch: [{ w: 'table', a: { sort: 1 }, ch: [{ w: 'tr', ch: [{ w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['x'] }] }] }] }],
    },
  ]);
  const tableWing = registry.wingOf('table');
  eq(
    '줄기: 급이 다르면 토큰이 함께 실린다',
    stackValue(ownedAncestors(table!, [0, 0, 0, 0, 0], tableWing!, registry), tableWing!),
    'th sort',
  );
  eq('줄기: 아무도 안 답하면 값이 없다', stackValue([], tableWing!), undefined);
}

{
  // 토큰 읽기 자체의 표.
  ok('토큰: 빈 값은 아무것도 안 품는다', !hasToken(undefined, 'th'));
  ok('토큰: 빈 토큰은 절대 안 맞는다', !hasToken('th', ''));
  ok('토큰: 부분 낱말은 안 맞는다', !hasToken('merged', 'merge'));
  ok('토큰: 여러 칸 사이도 낱말 단위다', hasToken('a  b   c', 'b'));
}

{
  // 소유 조상 찾기 — 눌림 판정이 딛고 선 걸음.
  const doc = docOf([{ w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['글'] }] }] }]);
  const quoteWing = registry.wingOf('quote');
  ok('조상: 인용 노드를 찾는다', ownedAncestor(doc!, [0, 0, 0], quoteWing!, registry)?.w === 'quote');
  ok('조상: 없으면 null', ownedAncestor(docOf([{ w: 'p', ch: ['글'] }])!, [0], quoteWing!, registry) === null);
}

// --- 2. 노출 규칙 -------------------------------------------------------------------------------

{
  const wingOf = (w: string) => registry.wingOf(w)!;
  const reachOf = (json: unknown[], path: readonly number[], offset = 0) =>
    reachAt(docOf(json)!, { path, offset }, registry, env);

  const plain = reachOf([{ w: 'p', ch: ['글'] }], [0]);
  ok('노출: 맨 문단에서는 마크가 보인다', visibleAt(plain, wingOf('b')));
  ok('노출: 맨 문단에서는 표가 보인다', visibleAt(plain, wingOf('table')));
  ok('노출: 맨 문단에서는 제목이 보인다', visibleAt(plain, wingOf('h')));
  ok('노출: 도구는 어디서나 보인다', visibleAt(plain, wingOf('clearFormat')));

  // 코드 상자 — 속이 평문이라 마크도 블록도 못 산다.
  const code = reachOf([{ w: 'p', ch: [{ w: 'code', ch: ['x'] }] }], [0, 0], 1);
  ok('노출: 코드 상자 속에서는 마크가 숨는다', !visibleAt(code, wingOf('b')));
  ok('노출: 코드 상자 속에서는 표가 숨는다', !visibleAt(code, wingOf('table')));
  ok('노출: 코드 상자 속에서도 도구는 보인다', visibleAt(code, wingOf('clearFormat')));

  // 접기의 제목 — 인라인 홀더지만 wing 자신의 노드가 아니라 부품이다. 마크는 산다.
  const summary = reachOf(
    [{ w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['제목'] }, { w: 'p', ch: [] }] }] }],
    [0, 0, 0],
    1,
  );
  ok('노출: 접기 제목에서는 마크가 보인다', visibleAt(summary, wingOf('b')));
  ok('노출: 접기 제목에는 블록이 못 선다', !visibleAt(summary, wingOf('hr')));

  // 래퍼문단 — 문단 속성은 정렬 하나만 얹힌다.
  const wrapper = reachOf([{ w: 'p', ch: [{ w: 'hr', ch: [] }] }], [0], 1);
  ok('노출: 래퍼문단에는 정렬이 보인다', visibleAt(wrapper, wingOf('align')));
  ok('노출: 래퍼문단에는 제목이 숨는다', !visibleAt(wrapper, wingOf('h')));
  ok('노출: 래퍼문단에는 드롭캡이 숨는다', !visibleAt(wrapper, wingOf('dc')));

  // allows — **wing 자신의 노드**에만 걸린다(부품에는 안 걸린다).
  const inRow = reachOf(
    [{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [{ w: 'p', ch: ['x'] }] }] }] }] }],
    [0, 0, 0, 0, 0],
    1,
  );
  ok('노출: 표의 칸 속에서는 블록이 보인다(칸에는 제한 선언이 없다)', visibleAt(inRow, wingOf('hr')));
  ok('노출: 표의 칸 속에서도 마크는 보인다', visibleAt(inRow, wingOf('b')));

  // 표 자신의 속(행 자리)은 `allows: ['tr']` 이라 다른 블록을 안 받는다.
  const tableReach = reachOf(
    [{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [{ w: 'p', ch: ['x'] }] }] }] }] }],
    [0, 0, 0, 0, 0],
    1,
  );
  ok('노출: allows 는 tr 만 받는다', !admits({ ...tableReach, blockParent: docOf([{ w: 'p', ch: [{ w: 'table', ch: [] }] }])!.at(0)!.ch[0] as ElementNode, blockParentWing: wingOf('table') }, 'hr'));
  ok('노출: allows 가 tr 은 받는다', admits({ ...tableReach, blockParent: docOf([{ w: 'p', ch: [{ w: 'table', ch: [] }] }])!.at(0)!.ch[0] as ElementNode, blockParentWing: wingOf('table') }, 'tr'));
  ok('노출: 뿌리는 무엇이든 받는다', admits({ ...plain }, 'table'));
}

// --- 3. 상황 줄 그룹 -----------------------------------------------------------------------------

{
  const groupsOf = (json: unknown[], sel: Selection): readonly string[] =>
    contextGroupsAt(docOf(json)!, sel, registry, env).map((group) => group.wing.w);

  eq('상황 줄: 맨 문단에는 그룹이 없다', groupsOf([{ w: 'p', ch: ['글'] }], at([0], 1)), []);

  eq(
    '상황 줄: 표 속 캐럿은 표 그룹 하나',
    groupsOf(
      [{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [{ w: 'p', ch: ['x'] }] }] }] }] }],
      at([0, 0, 0, 0, 0], 1),
    ),
    ['table'],
  );

  eq(
    '상황 줄: 링크는 조상이 아니라 캐럿의 마크에서 온다',
    groupsOf([{ w: 'p', ch: [{ w: 'a', a: { href: 'https://a.b' }, ch: ['글'] }] }], at([0], 1)),
    ['a'],
  );

  eq(
    '상황 줄: 래퍼문단의 물건도 그룹이 된다',
    groupsOf([{ w: 'p', ch: [{ w: 'img', a: { src: 'https://a.b/c.png' }, ch: [] }] }], at([0], 1)),
    ['img'],
  );

  // 바깥에서 안으로 — 표 칸 속 코드면 표가 먼저, 코드가 뒤다.
  eq(
    '상황 줄: 조상은 바깥에서 안으로 선다',
    groupsOf(
      [
        {
          w: 'p',
          ch: [
            {
              w: 'table',
              ch: [{ w: 'tr', ch: [{ w: 'td', ch: [{ w: 'p', ch: [{ w: 'code', ch: ['x'] }] }] }] }],
            },
          ],
        },
      ],
      at([0, 0, 0, 0, 0, 0], 1),
    ),
    ['table', 'code'],
  );

  // 그룹은 겨눔 하나가 아니라 **소유 조상 전부**를 들고 온다 — 표의 단추 열 개가 한 줄에 서는데
  // 상태는 칸(병합·제목)과 표(정렬)로 나뉘어 살기 때문이다. 여기가 비면 정렬 토글이 다시 죽는다.
  {
    const doc = docOf([
      {
        w: 'p',
        ch: [{ w: 'table', a: { sort: 1 }, ch: [{ w: 'tr', ch: [{ w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['x'] }] }] }] }],
      },
    ]);
    const group = contextGroupsAt(doc!, at([0, 0, 0, 0, 0], 1), registry, env)[0];
    eq('상황 줄: 표 그룹은 칸·행·표를 안에서 밖으로 든다', group?.nodes.map((node) => node.w), ['td', 'tr', 'table']);
    eq('상황 줄: 그 줄기가 답하는 값에 표의 토큰이 있다', stackValue(group?.nodes ?? [], group!.wing), 'th sort');
  }

  // 접기는 상황 줄을 안 든다 — 저장될 모습은 삼각형을 눌러 정한다(화면이 곧 저장값이다).
  eq(
    '상황 줄: 접기는 제 줄이 없다 (조상이어도 자리를 안 차지한다)',
    groupsOf(
      [
        {
          w: 'p',
          ch: [
            {
              w: 'details',
              ch: [{ w: 'summary', ch: [] }, { w: 'p', ch: [{ w: 'code', ch: ['x'] }] }],
            },
          ],
        },
      ],
      at([0, 0, 1, 0], 1),
    ),
    ['code'],
  );
}

// --- 4. locale — 폴백 규칙 하나 -----------------------------------------------------------------

{
  eq('locale: 요청한 말이 있으면 그것', translate('close', 'ko'), '닫기');
  eq('locale: 없으면 en', translate('cancel', 'ru'), 'Cancel');
  eq('locale: en 에도 없으면 키 그 자체', translate('nope.no.such', 'ko'), 'nope.no.such');
  eq('locale: 나라 꼬리는 떼고 본다', translate('close', 'ko-KR'), '닫기');
  eq('locale: 대소문자·밑줄도 같은 말이다', translate('close', 'KO_kr'), '닫기');
  eq('locale: 모양이 아니면 en 으로', localeOf('!!'), 'en');
  eq('locale: 빈 값도 en 으로', localeOf(undefined), 'en');
  eq('locale: 자리표를 채운다', translate('gridSize', 'en', DICTIONARY, { rows: 3, cols: 4 }), '3 × 4');
  eq('locale: 못 채운 자리는 그대로 둔다', translate('gridSize', 'en', DICTIONARY, { rows: 3 }), '3 × {cols}');

  const t = makeTranslator('ja');
  eq('locale: 번역기도 같은 규칙', t.t('close'), '閉じる');
  eq('locale: 레코드가 있으면 레코드가 이긴다', t.pick({ ja: '내 말', en: 'mine' }, 'close'), '내 말');
  eq('locale: 레코드에 그 말이 없으면 en', t.pick({ en: 'mine' }, 'close'), 'mine');
  eq('locale: 레코드 자체가 없으면 사전으로', t.pick(undefined, 'close'), '閉じる');

  eq('locale: 11 이 남긴 한국어 하드코딩이 사전으로 왔다', translate('openWhileChanged', 'ko').startsWith('작성 중인'), true);
}

{
  // 사전 키 커버 — **등록된 wing 은 전부 이름을 든다.** 이름 없는 버튼은 아이콘만 남아 낭독이 안 된다.
  const missing = registry.wings
    .filter((wing) => wing.button)
    .filter((wing) => {
      const label = wing.button?.label;
      return !label || typeof label['ko'] !== 'string' || typeof label['en'] !== 'string';
    })
    .map((wing) => wing.w);
  ok('사전: 버튼 있는 wing 은 전부 ko·en 이름을 든다', missing.length === 0, missing);

  const noIcon = registry.wings.filter((wing) => wing.button && !wing.button.svg).map((wing) => wing.w);
  ok('사전: 버튼 있는 wing 은 전부 아이콘을 든다', noIcon.length === 0, noIcon);

  const noAction = registry.wings.filter((wing) => wing.button && !wing.button.action).map((wing) => wing.w);
  ok('선언: 버튼 있는 wing 은 전부 하는 일을 말한다', noAction.length === 0, noAction);

  // 버튼이 부르는 커맨드는 실재해야 한다 — 죽은 이름을 그리지 않는다.
  const { nabi } = createNabiWith(defaultWings);
  const dead: string[] = [];
  for (const wing of registry.wings) {
    const action = wing.button?.action;
    if (!action || action.kind === 'mark' || action.kind === 'file' || action.kind === 'host') continue;
    if (!nabi.applyCommand(action.command, {}) && !registry.commands[action.command]) dead.push(`${wing.w} → ${action.command}`);
  }
  ok('선언: 버튼이 부르는 커맨드가 전부 실재한다', dead.length === 0, dead);

  // 상황 줄 컨트롤이 부르는 커맨드도 같다.
  const deadContext: string[] = [];
  for (const wing of registry.wings) {
    for (const control of wing.context?.controls ?? []) {
      // 크게 보기는 커맨드를 안 돌린다 — 본다고 문서가 바뀌지 않는다.
      if (control.kind === 'lightbox') continue;
      if (!registry.commands[control.command]) deadContext.push(`${wing.w}.${control.name} → ${control.command}`);
    }
  }
  ok('선언: 상황 줄 컨트롤의 커맨드가 전부 실재한다', deadContext.length === 0, deadContext);

  const namelessControl: string[] = [];
  for (const wing of registry.wings) {
    for (const control of wing.context?.controls ?? []) {
      if (!control.label || typeof control.label['en'] !== 'string') namelessControl.push(`${wing.w}.${control.name}`);
    }
  }
  ok('사전: 상황 줄 컨트롤도 전부 이름을 든다', namelessControl.length === 0, namelessControl);

  // 빈 편집기의 안내글은 **열넷을 다 든다** — 문서를 열면 제일 먼저 눈에 드는 한 마디라,
  // 폴백으로 영어가 뜨면 그 화면만 낯설어진다 (사전의 그 갈래와 같은 판단).
  const noPlaceholder = LOCALES.filter((code) => typeof (DICTIONARY['placeholder'] ?? {})[code] !== 'string');
  ok('사전: 빈 편집기의 안내글은 열네 말을 다 든다', noPlaceholder.length === 0, noPlaceholder);

  // IO 두 판(붙여넣기 후보·저장)의 말은 **열넷을 다 든다** — 사람이 읽고 누르는 자리라
  // 폴백으로 영어가 뜨면 그 판만 남의 화면이 된다.
  //
  // 키를 손으로 적지 않고 **접두사로 훑는다** — 나중에 `io.*`·`save.*` 가 하나 늘 때
  // 그물을 함께 고치는 것을 잊어도 새 키가 그냥 걸린다(R5 의 "조용히 새는 구멍"을 막는 자리).
  const IO_PREFIXES = ['io.', 'save.'];
  const ioKeys = Object.keys(DICTIONARY).filter((key) => IO_PREFIXES.some((p) => key.startsWith(p)));
  ok('사전: io·save 키가 실재한다', ioKeys.length >= 5, String(ioKeys.length));
  const holes: string[] = [];
  for (const key of ioKeys) {
    const entry = DICTIONARY[key] ?? {};
    for (const code of LOCALES) {
      if (typeof entry[code] !== 'string' || entry[code] === '') holes.push(`${key}:${code}`);
    }
  }
  ok('사전: 붙여넣기·저장 판의 말이 열네 말을 다 든다', holes.length === 0, holes);

  // 내장 형식 넷의 이름은 **사전에 안 산다** — 영어 고정 대문자로 `io/marks.ts` 에 선다
  // (번역하는 낱말이 아니라 확장자에 가깝고, 판에서 나란히 견주는 자리라 길이가 흔들리면 안 된다).
  // 옛 `io.text`·`io.html` 류 키가 되살아나면 두 자리가 갈려 판만 다른 말을 하게 된다.
  const GONE_KEYS = ['io.text', 'io.html', 'io.markdown', 'io.nabi'];
  const revived = GONE_KEYS.filter((key) => key in DICTIONARY);
  ok('사전: 형식 이름 키는 사전에 없다 (marks.ts 가 든다)', revived.length === 0, revived);
  eq('내장 형식 넷은 영어 고정 대문자다', [HTML_LABEL, MARKDOWN_LABEL, TEXT_LABEL, NABI_LABEL], ['HTML', 'MARKDOWN', 'TEXT', 'NABI']);
  // 판의 제목은 열넷을 다 들되 **키가 그대로 새면 안 된다** — 위의 구멍 그물과 짝이다.
  const rawKey = LOCALES.filter((code) => translate('io.title', code) === 'io.title');
  ok('사전: 판 제목이 키 그대로 새는 로케일이 없다', rawKey.length === 0, rawKey);
  eq('사전: 판 제목은 "붙여넣기" 다', translate('io.title', 'ko'), '붙여넣기');
  // 자리표는 열넷에 다 살아 있어야 한다 — 하나라도 빠지면 그 말에서 확장자가 사라진다.
  const noExt = LOCALES.filter((code) => !translate('save.as', code).includes('{ext}'));
  ok('사전: "{ext} 로 저장" 의 자리표가 열넷에 다 있다', noExt.length === 0, noExt);
  eq('사전: 자리표는 확장자로 채워진다', translate('save.as', 'ko', DICTIONARY, { ext: '.md' }), '.md 로 저장');
}

// --- 5. CSS — 접기가 글 단위다 -------------------------------------------------------------------

{
  const sheets = collectSheets(registry);
  ok('CSS: 코어 시트가 맨 앞이다', sheets[0] === CORE_CSS.trim());
  ok('CSS: 같은 글은 한 번만 실린다', new Set(sheets).size === sheets.length);

  {
    const hover = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-btn:hover, .nabi-btn.nabi-kbd {'));
    const hoverBody = hover.slice(0, hover.indexOf('}'));
    ok('CSS: 툴바 hover는 바탕을 칠하지 않고 색만 바꾼다',
      /color:\s*var\(--nabi-accent\)/.test(hoverBody) && !/background:/.test(hoverBody));
    const on = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-btn.on, .nabi-btn.on:hover {'));
    const onBody = on.slice(0, on.indexOf('}'));
    ok('CSS: 툴바 on도 바탕을 칠하지 않고 색만 바꾼다',
      /color:\s*var\(--nabi-accent\)/.test(onBody) && !/background:/.test(onBody));
    const tap = CORE_CSS.slice(CORE_CSS.indexOf('@keyframes nabi-tap'));
    ok('CSS: 누름 반응은 아래로 내려갔다 돌아온다', /translateY\(2px\)/.test(tap.slice(0, tap.indexOf('\n}'))));
    ok('CSS: 버튼 아닌 요소도 같은 tap 클래스를 쓴다', CORE_CSS.includes('.nabi-tap { animation: nabi-tap'));
    ok('CSS: 네이티브 active도 아래로 눌린다',
      /\.nabi-btn:active:not\(:disabled\)[\s\S]*?translateY\(2px\)/.test(CORE_CSS));
  }

  // 도구 둘(미리보기·전체화면)이 위치 잡힌 층에 **함께** 서야 한다 — 안 서면 손이 안 닿는다.
  // 실제로 그렇게 됐던 자리다: toast 닻으로 `.nabi-toolbar-row` 에 relative 를 주자 같은 클래스를
  // 단 툴바 뿌리가 위치 잡힌 요소가 되면서, 뜬(float) 도구 위를 덮어 진짜 클릭을 가로챘다.
  // 눈으로는 멀쩡하고 `el.click()` 도 통해서(자리를 안 잰다) 그물이 없으면 다시 들어온다.
  {
    const rule = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-tools {'));
    const body = rule.slice(0, rule.indexOf('}'));
    ok('CSS: 도구 상자가 위치 잡힌 층에 선다', /position:\s*relative/.test(body));
    // z-index 까지 있어야 한다 — 둘 다 위치만 잡히면 문서 순서가 이기는데 도구가 **앞**이라 진다.
    ok('CSS: 도구 상자가 단추 줄보다 위다', /z-index:\s*[1-9]/.test(body));

    // 도구는 그룹 **밖**이라 그룹이 두르는 세로 패딩을 제가 둘러야 단추 줄과 같은 높이에 선다.
    // 두 값이 갈리면 오른쪽 끝 둘만 위아래로 엇갈린다 — 눈으로만 보이고 그물에는 안 잡히던 자리다.
    //
    // **그리고 툴바 줄에는 세로 여백이 없어야 한다.** 도구가 그 줄 **안**에 사는 호스트도 있고
    // **밖**(크롬의 자식)에 두는 호스트도 있어서, 줄에 세로 여백이 붙으면 밖에 둔 도구만 그만큼
    // 위로 떠 엇갈린다. 두 호스트에서 실제로 그렇게 갈렸다(패키지 데모는 맞고 nabi-web 은 4px
    // 어긋났다). 세로 숨은 한 겹 위(`.nabi-toolbar`)가 한 번만 준다.
    const groupRule = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-group {'));
    const groupPad = /padding:\s*([^;]+);/.exec(groupRule.slice(0, groupRule.indexOf('}')))?.[1]?.trim();
    const toolsPad = /padding-block:\s*([^;]+);/.exec(body)?.[1]?.trim();
    eq('CSS: 도구와 그룹이 같은 세로 패딩을 두른다', toolsPad, groupPad);

    const rowRule = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-toolbar-row {'));
    const rowBody = rowRule.slice(0, rowRule.indexOf('}'));
    ok('CSS: 툴바 줄은 세로 여백을 안 든다 (도구가 어디에 살든 같은 바닥)', !/padding:\s*[^;]*rem\s+[^;]*;/.test(rowBody));
    const chromeRule = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-toolbar {'));
    ok('CSS: 세로 여백은 크롬이 한 번만 준다', /padding-block:\s*[^;]+;/.test(chromeRule.slice(0, chromeRule.indexOf('}'))));
  }

  // 편집 표면의 최소 높이 — 전체선택 삭제로 비어도 한 줄로 주저앉지 않는다. 접히면 그 아래
  // 페이지가 통째로 위로 딸려 올라온다(주인 신고 2026-08-23). 호스트 셋이 각자 베껴 쓰던 값을
  // 코어로 올린 자리라, **베낀 사본 없이도** 서는지가 이 판의 요점이다.
  {
    const mark = '.nabi-content.nabi-editing { min-block-size:';
    ok('CSS: 편집 표면에 최소 높이가 선다', CORE_CSS.includes(mark));
    const rule = CORE_CSS.slice(CORE_CSS.indexOf(mark));
    const body = rule.slice(0, rule.indexOf('}'));
    // 값을 박아 두면 호스트가 :root 에 적은 값이 진다 — 코어는 토큰을 **정의하지 않고**
    // 대체값으로만 부른다(글꼴 토큰과 같은 무늬).
    ok('CSS: 최소 높이는 호스트가 이길 수 있는 대체값이다',
      /min-block-size:\s*var\(--nabi-content-min-height,\s*12\.5rem\)/.test(body));
    ok('CSS: 코어는 그 토큰을 정의하지 않는다', !/--nabi-content-min-height:\s/.test(CORE_CSS));
    // 발행·미리보기의 `.nabi-content` 는 글 길이가 높이여야 한다 — 짧은 글에 빈 200px 을 안 단다.
    ok('CSS: 최소 높이는 편집 표면에만 걸린다', !/(^|\n)\.nabi-content \{[^}]*min-block-size/.test(CORE_CSS));
  }

  // 빈 편집기의 안내글 — **모양은 시트가, 말은 변수가.** 겨눔이 "받침 br 하나만 든 글 문단
  // 하나"라야 글자가 한 자 들어오는 순간 저절로 사라진다(셈도 상태도 없다는 그 규칙).
  // 그리는 자리는 **편집 뿌리의 층**이다 — 빈 블록 자신의 ::before 였을 때는 그 블록이 입은 옷
  // (제목·정렬·드롭캡)을 통째로 상속해 안내글이 제목 얼굴로 떴다(주인 신고 2026-08-23).
  {
    const mark = '.nabi-content.nabi-editing:has(> :is(p, h1, h2, h3, h4, h5, h6):only-child > br:only-child)::before';
    const rule = CORE_CSS.slice(CORE_CSS.indexOf(mark));
    const body = rule.slice(0, rule.indexOf('}'));
    ok('CSS: 안내글은 편집 뿌리의 층이다', CORE_CSS.includes(mark));
    // 블록 자신에 붙던 옛 겨눔이 남아 있으면 제목·드롭캡이 도로 샌다.
    ok('CSS: 안내글이 문서 블록의 몸에 안 붙는다',
      !CORE_CSS.includes(':only-child:has(> br:only-child)::before'));
    // 뿌리가 절대 위치의 기준이라야 층이 글자 자리에 선다.
    ok('CSS: 편집 뿌리가 위치 잡힌 층이다', /\.nabi-content\.nabi-editing \{[^}]*position:\s*relative/.test(CORE_CSS));
    // 빈 판정은 그대로 받침 br 하나를 본다 — 트리를 세지 않으므로 IME 조합 중에도 안 어긋난다.
    ok('CSS: 빈 판정은 받침 br 하나를 본다', /> br:only-child/.test(mark));
    // 빈 문서에서 제목 단추부터 누르는 걸음이 있다 — 그 자리도 "아무것도 안 쓴" 자리다 (104).
    ok('CSS: 빈 제목 줄에도 안내글이 선다', /:is\(p, h1, h2, h3, h4, h5, h6\)/.test(mark));
    ok('CSS: 안내글의 말은 변수로 온다 — 없으면 안 뜬다', /content:\s*var\(--nabi-placeholder,\s*""\)/.test(body));
    ok('CSS: 안내글은 흐름 밖에 선다 — 캐럿이 안 밀린다', /position:\s*absolute/.test(body));
    // 절대 위치의 기준은 뿌리의 **패딩 상자**다 — 같은 안쪽 여백을 써야 첫 글자와 자리가 맞는다.
    // 값을 베끼지 않고 상속받으므로 호스트가 padding 을 바꿔도 따라간다.
    ok('CSS: 안내글이 글자와 같은 안쪽 여백에 선다', /padding:\s*inherit/.test(body));
    ok('CSS: 안내글은 손을 안 받는다', /pointer-events:\s*none/.test(body));
    // 층이 된 김에 — 전체선택이 이 글자를 훑는 일이 없게.
    ok('CSS: 안내글은 골라지지 않는다', /user-select:\s*none/.test(body));
    // 논리 좌표여야 RTL(아랍어·우르두)에서 오른쪽에서 시작한다 (098·099 의 그 규칙).
    ok('CSS: 안내글의 자리는 논리 좌표다', /inset-inline:/.test(body) && !/\bleft:/.test(body));
    // 자리를 정하는 것은 **글의 방향**이지 그 줄의 정렬이 아니다 — 가운데 정렬한 빈 줄에서
    // 안내글까지 가운데로 가면 쓴 글처럼 보인다 (주인 신고 2026-08-20).
    ok('CSS: 안내글은 줄의 정렬을 안 따라간다', /text-align:\s*start/.test(body));
    // 여러 줄짜리 안내글 — surface 가 줄바꿈을 CSS 의 \A 로 적어 보내므로 시트가 받아야 선다.
    ok('CSS: 안내글의 줄바꿈이 살아 있다', /white-space:\s*pre-line/.test(body));
    // 색은 muted 그대로가 아니라 알파를 섞은 값이고, 갈아 끼우는 이름이 하나 있다 (주인 2026-08-23).
    ok('CSS: 안내글 색은 토큰으로 갈아 끼운다',
      /color:\s*var\(--nabi-placeholder-color,\s*var\(--nabi-placeholder-color-fallback,\s*#[0-9a-f]{8}\)\)/.test(body));
    // 코어가 호스트의 이름을 정의해 버리면 :root 에 적은 값이 늘 진다 — 글꼴·최소 높이와 같은 규칙.
    ok('CSS: 코어는 --nabi-placeholder-color 를 정의하지 않는다',
      !/--nabi-placeholder-color:/.test(CORE_CSS));
    // 대체값은 테마를 탄다 — 라이트·다크가 갈리는 토큰은 다크 블록이 **다시 줘야** 한다.
    {
      const dark = CORE_CSS.slice(CORE_CSS.indexOf(':is(.nabi, .nabi-scrim)[data-nabi-theme="dark"]'));
      const block = dark.slice(0, dark.indexOf('\n}'));
      ok('CSS: 안내글 색의 대체값이 다크에서 다시 선다',
        /--nabi-placeholder-color-fallback:\s*#[0-9a-f]{8};/.test(block));
    }
  }

  // 상황 줄이 손가락에 닿는다 (084 ⑥) — 접혀 쌓인 두 줄이 한 표적이 되면 안 된다. 판정은 폭이
  // 아니라 겨눔의 굵기(pointer: coarse)가 먼저고, 표적 높이는 관례(44px = 2.75rem)를 지킨다.
  {
    const touch = CORE_CSS.slice(CORE_CSS.indexOf('@media (pointer: coarse)'));
    ok('CSS: 상황 줄에 손가락 분기가 있다', touch.startsWith('@media (pointer: coarse)'));
    const branch = touch.slice(0, touch.indexOf('\n}'));
    ok('CSS: 그 분기가 접힌 줄에 세로 틈을 준다', /\.nabi-context\s*\{[^}]*gap:\s*\.25rem/.test(branch));
    ok('CSS: 그 분기의 줄 높이가 손가락 표적이다', /\.nabi-ctx-group\s*\{[^}]*min-block-size:\s*2\.75rem/.test(branch));
    // 줄바꿈은 그룹 **안**에서도 일어난다(표는 단추가 열 개다) — 그 줄 사이는 그룹의 세로 gap 이
    // 잡는다. 이것이 빠지면 접힌 두 줄이 3px 틈으로 붙어, 고친 것이 바깥 그룹 사이에만 남는다.
    ok('CSS: 그룹 안에서 접힌 줄도 벌어진다', /\.nabi-ctx-group\s*\{[^}]*gap:\s*\.25rem\s+\.1875rem/.test(branch));
    ok('CSS: 그 분기에서 단추가 커진다', /\.nabi-context \.nabi-btn\s*\{[^}]*block-size:\s*2\.5rem/.test(branch));
    // 눈금(글자 크기)이 주인이 짚은 그 자리다 — 손잡이가 작아 상자째 세워야 닿는다.
    // 손가락 기기에서 사람이 적는 칸의 글자는 16px 아래로 안 내린다 — iOS 의 자동 확대 방아쇠다
    // (011 8차). 막는 길(user-scalable=no)은 안 쓴다.
    ok('CSS: 그 분기에서 적는 칸이 16px 아래로 안 내려간다',
      /\.nabi-input\s*\{[^}]*font-size:\s*var\(--nabi-touch-font-size,\s*16px\)/.test(branch));
    ok('CSS: 코어는 --nabi-touch-font-size 를 정의하지 않는다', !/--nabi-touch-font-size:/.test(CORE_CSS));
    ok('CSS: 확대를 막는 길은 안 쓴다', !/user-scalable\s*[:=]|maximum-scale\s*[:=]/.test(CORE_CSS.replace(/\/\*[\s\S]*?\*\//g, '')));
    ok('CSS: 그 분기에서 눈금도 커진다', /\.nabi-context \.nabi-range\s*\{[^}]*block-size:\s*2\.5rem/.test(branch));
  }

  // 편집 화면의 정렬 표식 — 정렬 동작은 편집기에 안 붙으므로(글이 움직이면 안 된다) 그림 하나가
  // "이 표는 발행되면 정렬된다"를 말한다. 표식이 사라지면 글쓴이는 화면에서 그것을 알 길이 없다.
  {
    const sheet = registry.wingOf('table')?.styles ?? '';
    const mark = sheet.slice(sheet.indexOf('.nabi-content.nabi-editing table[data-nabi-sortable]'));
    ok('CSS: 정렬 표식은 편집 화면에만 선다', mark.startsWith('.nabi-content.nabi-editing table[data-nabi-sortable]'));
    ok('CSS: 표식은 첫 행의 칸에 선다 — 붙는 쪽이 단추를 다는 그 자리다', /tr:first-child > :is\(th, td\)/.test(mark));
    ok('CSS: 병합이 보이면 표식도 안 선다 (붙는 쪽이 거절하는 표다)', /:not\(:has\(\[colspan\], \[rowspan\]\)\)/.test(mark));
    // 보는 쪽의 '원본' 아이콘과 같은 삼각형 둘이어야 한다 — 같은 뜻이니 같은 그림이다.
    ok('CSS: 표식의 그림이 viewer 의 원본 아이콘과 같다', mark.includes('M8 2.9 12 7.4H4Z') && mark.includes('M8 13.1 4 8.6h8Z'));
  }

  // 격자 판 둘 — 붙여넣기와 **저장 판**이 한 규칙을 나눠 쓴다(주인 지시 2026-08-23).
  // 규칙을 둘로 가르면 다음 라운드에 한쪽만 고쳐져 두 판의 모양이 갈린다 — 그래서 이 그물은
  // **선택자에 두 이름이 함께 있는지**부터 잡는다. 세로 목록으로 돌아가면 한 낱말짜리 이름 셋이
  // 왼쪽에 붙고 판 오른쪽이 통째로 빈다(제목을 가운데로 옮긴 뜻도 함께 죽는다).
  {
    const list = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-choose-list, .nabi-save-list {'));
    const listBody = list.slice(0, list.indexOf('}'));
    ok('CSS: 두 판의 격자가 한 규칙이다', listBody.length > 0);
    ok('CSS: 고르는 판의 자리는 격자로 선다', /display:\s*grid/.test(listBody));
    // 열 수는 판을 세우는 손이 넣는다 — 기본값 셋이 방향키의 걸음(CHOOSE_COLS)과 같은 수다.
    ok('CSS: 열은 셋까지고 그 수를 밖에서 받는다', /repeat\(var\(--nabi-grid-cols,\s*3\)/.test(listBody));
    ok('CSS: 격자는 가운데로 모인다', /justify-content:\s*center/.test(listBody));

    // 판의 폭은 **상한만** 있다 — 카드의 고정 폭을 풀어야 후보 둘짜리 판이 둘만큼만 넓다.
    const card = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-choose, .nabi-save {'));
    const cardBody = card.slice(0, card.indexOf('}'));
    ok('CSS: 판은 내용에 맞춰 줄어든다', /inline-size:\s*fit-content/.test(cardBody));
    ok('CSS: 판의 폭은 상한으로만 묶인다', /max-inline-size:\s*min\(24rem,\s*100%\)/.test(cardBody));

    const title = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-choose-title, .nabi-save-title {'));
    ok('CSS: 판 제목은 가운데다', /text-align:\s*center/.test(title.slice(0, title.indexOf('}'))));

    const row = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-choose-row, .nabi-save-row {'));
    const rowBody = row.slice(0, row.indexOf('}'));
    // 한 자리는 세로 스택이다 — 그림이 위, 이름이 아래, 둘 다 가운데.
    ok('CSS: 한 자리는 그림 위 이름 아래로 쌓인다', /flex-direction:\s*column/.test(rowBody));
    ok('CSS: 그 스택은 가로로도 가운데다', /align-items:\s*center/.test(rowBody));
    ok('CSS: 이름도 가운데 정렬이다', /text-align:\s*center/.test(rowBody));
    // 이름은 그림을 거들 뿐이다 — 굵게도 크게도 안 쓴다.
    ok('CSS: 이름은 굵지 않다', /font-weight:\s*400/.test(rowBody));
    ok('CSS: 이름은 작다', /font-size:\s*\.6\d*rem/.test(rowBody));

    // 판 안쪽에는 아무 칠도 없다 (주인 지시 2026-08-23) — 옵션 칸은 늘 맨바탕이고, 겨눔도
    // 테두리 하나로만 말한다. 카드(.nabi-card)의 바탕은 판이 서는 데 필요하니 여기 셈에 없다.
    ok('CSS: 옵션 칸은 맨바탕이다', /background:\s*none/.test(rowBody));

    // 겨눈 자리의 테두리는 **표 칸을 고를 때와 같은 토큰**이다 — "골랐다" 는 말을 한 색으로 한다.
    const aimed = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-choose-row[aria-selected="true"], .nabi-save-row[aria-selected="true"] {'));
    const aimedBody = aimed.slice(0, aimed.indexOf('}'));
    ok('CSS: 겨눔 표식도 두 판이 한 규칙이다', aimedBody.length > 0);
    ok('CSS: 겨눈 자리는 표 선택과 같은 색을 두른다', /border-color:\s*var\(--nabi-accent\)/.test(aimedBody));
    // 두르기만 한다 — 겨눴다고 칸을 칠하지 않는다.
    ok('CSS: 겨눈 자리에도 채움색이 없다', !/background/.test(aimedBody));
    // 호버로 칠하는 길도 없다 — 겨눔은 aria-selected 하나뿐이다(저장 판도 같다: 옛
    // `.nabi-save-format:hover` 의 --nabi-soft 칠이 이 라운드에 걷혔다 — 주인 지시 2026-08-23).
    ok('CSS: 옵션 칸에 호버 칠이 없다', !CORE_CSS.includes('.nabi-choose-row:hover'));
    ok('CSS: 저장 판 칸에도 호버 칠이 없다', !CORE_CSS.includes('.nabi-save-row:hover') && !CORE_CSS.includes('.nabi-save-format'));
    // 아이콘 색도 겨눔을 따라 바뀌지 않는다 — 덧칠 하나가 더 있으면 표식이 둘이 된다.
    ok('CSS: 겨눔이 아이콘 색을 안 바꾼다', !CORE_CSS.includes('.nabi-choose-row[aria-selected="true"] .nabi-choose-icon'));

    // 저장 판만의 것 — 이름 줄과 **이름 아래 아주 작은 한 마디**(md 한 칸에만 선다).
    const name = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-save-name {'));
    ok('CSS: 이름 줄은 칸과 표식을 한 줄에 세운다', /display:\s*flex/.test(name.slice(0, name.indexOf('}'))));
    const note = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-save-note {'));
    const noteBody = note.slice(0, note.indexOf('}'));
    // 이름(.64rem)보다 **더 작아야** 한다 — 거드는 말이지 읽히려고 서는 줄이 아니다.
    const noteSize = Number(/font-size:\s*\.(\d+)rem/.exec(noteBody)?.[1] ?? '99');
    ok('CSS: 손실 한 마디는 이름보다 작다', noteSize < 64, String(noteSize));
    ok('CSS: 손실 한 마디에 경고색이 없다', /color:\s*var\(--nabi-muted\)/.test(noteBody));
    // 그림 셋은 한 크기다 — 넉 자를 읽히려고 조금 키웠고, 그 값은 셋에 한 번만 적힌다.
    const mark = CORE_CSS.slice(CORE_CSS.indexOf('.nabi-save-icon svg {'));
    const markBody = mark.slice(0, mark.indexOf('}'));
    ok('CSS: 저장 판 그림은 한 크기다', /inline-size:\s*(\d+)px/.test(markBody) && /block-size:\s*(\d+)px/.test(markBody));
  }

  // 가족 시트 — 문단 속성 셋(제목·정렬·드롭캡)이 시트 하나를 나눠 쓴다. 옛 판은 여기서
  // "가족 수만큼" 실렸다. wing 은 셋인데 시트는 하나여야 한다.
  const family = ['h', 'align', 'dc'].map((w) => registry.wingOf(w)?.styles);
  ok('CSS: 문단 속성 셋이 같은 시트를 든다', new Set(family).size === 1 && family[0] !== undefined);
  ok('CSS: 그 시트는 목록에 한 번만 있다', sheets.filter((sheet) => sheet === family[0]?.trim()).length === 1);

  const lists = ['ul', 'ol', 'tl'].map((w) => registry.wingOf(w)?.styles);
  ok('CSS: 리스트 셋도 같은 시트를 든다', new Set(lists).size === 1 && lists[0] !== undefined);
  ok('CSS: 그 시트도 한 번만 있다', sheets.filter((sheet) => sheet === lists[0]?.trim()).length === 1);

  // 지문 — 같은 글은 같은 이름, 다른 글은 다른 이름.
  eq('CSS: 같은 글은 같은 지문', sheetKey('a{b:c}'), sheetKey('a{b:c}'));
  ok('CSS: 다른 글은 다른 지문', sheetKey('a{b:c}') !== sheetKey('a{b:d}'));

  // 빈 시트는 안 실린다 — `<style>` 이 이유 없이 하나 더 서지 않는다.
  const bare = collectSheets(makeRegistry([]), '');
  eq('CSS: 빈 코어 시트는 안 실린다', bare.length, 0);
}

// --- 6. 띠 — 040 §1 의 사각형 산수 ---------------------------------------------------------------

{
  const view = { top: 0, bottom: 800 };
  const band = bandOf(120, view);
  eq('띠: 위 변은 크롬의 아랫변', band.top, 120);
  eq('띠: 아래 변은 시각 뷰포트의 아래', band.bottom, 800);
  eq('띠: 크롬이 없으면 창의 위가 위 변', bandOf(null, view).top, 0);
  // "스티키인가"는 안 묻는다 — 흘러가 위로 올라간 막대는 max 에서 진다.
  eq('띠: 흘러간 막대는 창의 위에게 진다', bandOf(-50, view).top, 0);

  const inside = { top: 400, bottom: 420 };
  eq('띠: 안에 있으면 0 — 화면은 가만있는다', bandFix(inside, band, 800), 0);

  const above = { top: 100, bottom: 120 };
  eq('띠: 위로 벗어나면 음수(위로 구른다)', bandFix(above, band, 800), 100 - (120 + 20));
  const below = { top: 790, bottom: 810 };
  eq('띠: 아래로 벗어나면 양수(아래로 구른다)', bandFix(below, band, 800), 810 - (800 - 20));

  // 여유는 한 줄만큼이고 28px 를 안 넘는다.
  const tall = { top: 60, bottom: 120 };
  eq('띠: 여유는 최대 28px', bandFix(tall, band, 800), 60 - (120 + BAND_MARGIN));

  // 한 번의 보정은 창 하나를 넘지 않는다.
  eq('띠: 보정은 창 하나로 잘린다', bandFix({ top: -5000, bottom: -4980 }, band, 800), -800);
  // 띠보다 키가 큰 캐럿은 위쪽을 보여 준다.
  eq('띠: 띠보다 큰 캐럿은 위를 맞춘다', bandFix({ top: 60, bottom: 1400 }, band, 800), 60 - 120);
  // 띠가 없으면(높이 0) 아무것도 안 한다 — 없는 자를 들고 재지 않는다.
  eq('띠: 높이 0 인 띠에서는 안 움직인다', bandFix(inside, { top: 300, bottom: 300 }, 800), 0);

  // 편집 뒤의 한 걸음 — 위 변만 본다 (5차, 260823_000).
  eq('띠: 편집 뒤 — 툴바에 잠기면 잠긴 만큼 내린다', revealFix(above, band, 800), 100 - (120 + 20));
  eq('띠: 편집 뒤 — 문서가 줄어 화면 위로 밀려난 캐럿도 같은 갈래', revealFix({ top: -98, bottom: -71 }, band, 800), -98 - (120 + 27));
  eq('띠: 편집 뒤 — 띠 안이면 0', revealFix(inside, band, 800), 0);
  // 아래 변은 안 본다 — 사람이 굴려 내려 둔 화면을 글자마다 뺏지 않는다.
  eq('띠: 편집 뒤 — 아래로 벗어난 캐럿은 안 건드린다', revealFix(below, band, 800), 0);
  eq('띠: 편집 뒤 — 보정은 창 하나로 잘린다', revealFix({ top: -5000, bottom: -4980 }, band, 800), -800);

  // 걸음걸이 — 스티키 끝자락의 실측을 그대로 걷는다 (6차, 260823_000).
  //
  // 화면(848) 하나에 붙는 크롬이 80px. 시작할 때 크롬은 **화면 밖**(아랫변 −85)이라 띠의 위 변이
  // 0 으로 잡히고, 캐럿은 −297 에 있다. 첫 걸음이 −325 를 밀면 크롬이 도로 화면에 서서(아랫변 80)
  // 캐럿(27)을 다시 덮는다 — 그 자리에서 멎으면 53px 잠긴 채 끝난다. 그래서 한 번 더 잰다.
  {
    // 실측에서 온 숫자 셋: 문서에 박힌 크롬의 아랫변 878, 캐럿의 위 666, 스티키가 서는 자리 80.
    const walked: number[] = [];
    let scroll = 963; // ⌘A+Backspace 로 문서가 줄어 잘린 자리(= 그때의 최대 스크롤)
    const chromeBottom = (): number => Math.min(80, 878 - scroll);
    const caretTop = (): number => 666 - scroll;
    const total = revealWalk(
      REVEAL_STEPS,
      () => ({
        caret: { top: caretTop(), bottom: caretTop() + 27 },
        band: bandOf(chromeBottom(), { top: 0, bottom: 848 }),
        limit: 848,
      }),
      (delta) => {
        walked.push(delta);
        scroll += delta;
        return delta;
      },
    );
    eq('띠: 걸음걸이 — 첫 걸음은 화면 밖 크롬으로 셈한다(그래서 모자라다)', walked[0], -324);
    eq('띠: 걸음걸이 — 크롬이 도로 서면 남은 만큼을 마저 민다', walked[1], -80);
    eq('띠: 걸음걸이 — 두 걸음이면 멎는다', walked.length, 2);
    eq('띠: 걸음걸이 — 민 만큼의 합', total, -404);
    ok('띠: 걸음걸이 — 끝나면 캐럿이 크롬 아래다', caretTop() >= chromeBottom());
  }
  // 굴릴 자리가 없으면 그 자리에서 그만둔다 — 같은 값을 두 번 밀지 않는다.
  {
    let tries = 0;
    const total = revealWalk(
      REVEAL_STEPS,
      () => {
        tries += 1;
        return { caret: { top: -300, bottom: -273 }, band: { top: 0, bottom: 848 }, limit: 848 };
      },
      () => 0,
    );
    eq('띠: 걸음걸이 — 안 움직이면 한 번으로 그만둔다', tries, 1);
    eq('띠: 걸음걸이 — 못 움직였으면 합도 0', total, 0);
  }
  // 크롬이 스티키를 벗어나 글과 함께 굴러가면 아무리 밀어도 사이가 그대로다 — 한 걸음에 멎는다.
  {
    let pushed = 0;
    let scroll = 400;
    revealWalk(
      REVEAL_STEPS,
      () => ({ caret: { top: 122 - (scroll - 400), bottom: 149 - (scroll - 400) }, band: bandOf(110 - (scroll - 400), { top: 0, bottom: 848 }), limit: 848 }),
      (delta) => {
        pushed += 1;
        scroll += delta;
        return delta;
      },
    );
    eq('띠: 걸음걸이 — 나아지지 않으면 화면을 끝없이 안 끌어올린다', pushed, 1);
  }
  // 잴 것이 없으면(캐럿이 없으면) 아무 걸음도 안 걷는다.
  {
    let pushed = 0;
    revealWalk(REVEAL_STEPS, () => null, () => (pushed += 1));
    eq('띠: 걸음걸이 — 잴 것이 없으면 안 민다', pushed, 0);
  }
  // 이미 띠 안이면 첫 걸음부터 0 — 잘 보이는 자리에서 치는 글자가 화면을 안 튀게 하는 규칙.
  {
    let pushed = 0;
    revealWalk(REVEAL_STEPS, () => ({ caret: inside, band, limit: 800 }), () => (pushed += 1));
    eq('띠: 걸음걸이 — 띠 안이면 한 걸음도 안 민다', pushed, 0);
  }

  // 키보드가 선 걸음 — 아래 변까지 본다 (011 3차). 한 걸음의 답만 보려고 걸음 수를 1 로 준다.
  const once = (
    caret: { top: number; bottom: number },
    use: { top: number; bottom: number },
    limit: number,
  ): number => {
    let asked = 0;
    underWalk(1, () => ({ caret, band: use, limit }), (delta) => {
      asked = delta;
      return delta;
    });
    return asked;
  };
  {
    // 011 의 아이폰 실측 그대로: 캐럿은 툴바에 안 가렸는데(여유 15) 창 아래로 7px 나갔다.
    // 위 변만 보는 눈은 −1 을 답했고(그래서 아무 일도 안 났다) 아래 변까지 보면 +15 를 민다.
    const tight = { top: 353, bottom: 377 };
    const out = { top: 368, bottom: 384 };
    eq('띠: 키보드 걸음 — 위 변만 보는 눈은 못 본다', revealFix(out, tight, 377), -1);
    eq('띠: 키보드 걸음 — 아래로 벗어난 만큼 민다(크롬에 가리기 전까지)', once(out, tight, 377), 15);

    // 가림이 먼저다 — 위아래가 함께 어긋나면 위 변이 이긴다.
    const covered = { top: 100, bottom: 120 };
    eq('띠: 키보드 걸음 — 가렸으면 위 변이 이긴다', once(covered, band, 800), revealFix(covered, band, 800));

    // 아래로 밀면 크롬에 가리는 자리 — 둘 다 못 맞추면 **위 변 우선**이라 아무것도 안 한다.
    eq('띠: 키보드 걸음 — 둘 다 못 맞추면 안 민다(위 변 우선)', once({ top: 300, bottom: 340 }, { top: 300, bottom: 330 }, 800), 0);

    // 아래 변이 성하면 5차의 눈 그대로다.
    eq('띠: 키보드 걸음 — 아래가 성하면 위 변의 여유만 본다', once(inside, band, 800), 0);
    eq('띠: 키보드 걸음 — 높이 0 인 띠에서는 안 움직인다', once(inside, { top: 300, bottom: 300 }, 800), 0);
  }
  {
    // 걸음걸이는 `revealWalk` 와 같다 — 못 움직이면 멎는다.
    let tries = 0;
    const total = underWalk(
      REVEAL_STEPS,
      () => {
        tries += 1;
        return { caret: { top: 368, bottom: 384 }, band: { top: 353, bottom: 377 }, limit: 377 };
      },
      () => 0,
    );
    eq('띠: 키보드 걸음 — 안 움직이면 한 번으로 그만둔다', tries, 1);
    eq('띠: 키보드 걸음 — 못 움직였으면 합도 0', total, 0);
  }
  {
    // 실기의 수렴 — 밀면 캐럿과 툴바가 함께 올라가고, 몇 걸음이면 창 안에 든다.
    let scroll = 0;
    const walked: number[] = [];
    underWalk(
      REVEAL_STEPS,
      () => ({
        caret: { top: 368 - scroll, bottom: 384 - scroll },
        band: bandOf(353 - scroll, { top: 0, bottom: 377 }),
        limit: 377,
      }),
      (delta) => {
        walked.push(delta);
        scroll += delta;
        return delta;
      },
    );
    ok('띠: 키보드 걸음 — 걸음마다 작아진다', walked.every((d, i) => i === 0 || Math.abs(d) < Math.abs(walked[i - 1] as number)));
    ok('띠: 키보드 걸음 — 끝나면 캐럿이 창 안이다', 384 - scroll <= 377);
  }
  {
    // 잴 것이 없으면 아무 걸음도 안 걷는다.
    let pushed = 0;
    underWalk(REVEAL_STEPS, () => null, () => (pushed += 1));
    eq('띠: 키보드 걸음 — 잴 것이 없으면 안 민다', pushed, 0);
  }

  // 좌표계 — `getBoundingClientRect()` 의 0 이 **플랫폼마다 다르다** (011 4차 실측).
  // 띠의 위 = 표식(`position:fixed; top:0`)의 client top + `vv.offsetTop`, 아래 = 그 위 + `vv.height`.
  // 실측으로 못 박은 표식 값: iOS −337(rect 가 보이는 창 기준) · 안드로이드 0(레이아웃 창 기준).
  {
    const seen = (ruler: number, offsetTop: number, height: number): { top: number; bottom: number } => {
      const top = ruler + offsetTop;
      return { top, bottom: top + height };
    };
    const caret = { top: 455, bottom: 471 };

    // 아이폰은 지금 OK 다 — **깨뜨리지 않는 것이 제1 조건**이라 예전 식과 같은 값임을 박아 둔다.
    const ios = seen(-337, 337, 377);
    eq('좌표계: iOS 는 예전 식과 같다 — 위', ios.top, 0);
    eq('좌표계: iOS 는 예전 식과 같다 — 아래', ios.bottom, 377);

    // 안드로이드에서 예전 식(`{0, height}`)은 **띠를 뒤집었다**. 뒤집힌 띠에서는 눈이 먼다.
    const blind = bandOf(510, { top: 0, bottom: 462 });
    eq('좌표계: 예전 식은 안드로이드에서 띠를 뒤집었다', blind.bottom - blind.top, -48);
    eq('좌표계: 뒤집힌 띠에서는 아무것도 안 한다(눈이 멀었다)', bandFix(caret, blind, 462), 0);

    // 바로 세운 띠에서는 캐럿이 툴바에 깔린 것이 보이고, 그만큼 위로 민다.
    const android = seen(0, 322, 462);
    eq('좌표계: 안드로이드의 띠는 offsetTop 에서 시작한다', android.top, 322);
    eq('좌표계: 안드로이드의 띠 아래', android.bottom, 784);
    const upright = bandOf(510, android);
    ok('좌표계: 바로 세운 띠는 안 뒤집힌다', upright.bottom > upright.top);
    eq('좌표계: 바로 세우면 잠긴 것이 보인다', revealFix(caret, upright, 462), 455 - (510 + 16));

    // 데스크톱 — 표식도 offsetTop 도 0 이라 한 값도 안 달라진다.
    const desk = seen(0, 0, 800);
    eq('좌표계: 데스크톱은 한 값도 안 달라진다 — 위', desk.top, 0);
    eq('좌표계: 데스크톱은 한 값도 안 달라진다 — 아래', desk.bottom, 800);

    // **사파리는 두 방식을 오간다** (011 5차). 한쪽만 맞추면 또 흔들리므로 둘 다 박는다.
    //   ⓐ 밀어내는 형 — `offsetTop=337`. 표식이 −337 이라 자를 세워야 창이 제자리에 온다.
    //   ⓑ 아래에서 깎는 형 — `offsetTop=0`. 두 좌표계가 같으니 **표식을 아예 안 잰다**(0).
    eq('좌표계: 사파리 ⓐ 밀어내는 형 — 창의 위', seen(-337, 337, 377).top, 0);
    eq('좌표계: 사파리 ⓑ 깎는 형 — 표식을 안 재도 창이 맞다', seen(0, 0, 377).top, 0);
    eq('좌표계: 사파리 ⓑ 깎는 형 — 창의 아래', seen(0, 0, 377).bottom, 377);
  }

  // 띠 = 창 ∩ (툴바 아래). **그것이 비면 툴바를 무시하고 창만 본다** (011 5차).
  // 실측(아이폰 사파리 ⓑ): 창 `0..377` 인데 툴바가 `289..477` 로 창 아래까지 내려가 있고
  // 캐럿(`492..508`)은 창 밖 131px. 예전에는 띠가 `477..377` 로 뒤집혀 아무 일도 안 났다.
  {
    const window377 = { top: 0, bottom: 377 };
    const caret = { top: 492, bottom: 508 };

    const flipped = bandOf(477, window377);
    ok('띠: 툴바가 창 아래로 나가면 띠가 뒤집힌다', flipped.bottom - flipped.top < 0);
    eq('띠: 뒤집힌 띠는 눈이 먼다 — 아무것도 안 한다', bandFix(caret, flipped, 377), 0);

    // 툴바를 무시하고 창만 기준으로 삼으면 캐럿을 창 안으로 끌어올릴 값이 나온다.
    const only = bandOf(null, window377);
    eq('띠: 창만 기준이면 띠가 창 그대로다', only.top, 0);
    let asked = 0;
    underWalk(1, () => ({ caret, band: only, limit: 377 }), (delta) => {
      asked = delta;
      return delta;
    });
    eq('띠: 창만 기준이면 캐럿을 창 안으로 끌어올린다', asked, 508 - (377 - 16));

    // 툴바가 창 안에 있으면 예전 그대로 툴바가 띠의 위 변이다 — 갈래가 함부로 안 열린다.
    eq('띠: 툴바가 창 안이면 그대로 위 변이다', bandOf(120, window377).top, 120);
  }

  // 문이 둘이고 **겨눔이 다르다** (011 6차).
  //   편집(타이핑) → 최소 넛지 (`underWalk`). 글자마다 화면이 크게 뛰면 못 쓴다.
  //   키보드·뷰포트 → **제자리 맞추기** (`placeWalk`). 과녁은 **툴바가 창 맨 위에 붙었을 때**의 띠다.
  {
    const place = (
      caret: { top: number; bottom: number },
      use: { top: number; bottom: number },
      limit: number,
    ): number => {
      let asked = 0;
      placeWalk(1, () => ({ caret, band: use, limit }), (delta) => {
        asked = delta;
        return delta;
      });
      return asked;
    };
    // 과녁 띠 — 지금 툴바가 어디 있든 **키**만 쓴다.
    const aimOf = (windowTop: number, windowBottom: number, barHeight: number) => ({
      top: windowTop + barHeight,
      bottom: windowBottom,
    });

    // ⓐ 아이폰 실측 — 창 0..377 · 툴바 152..340(키 188) · 캐럿 355..371.
    // 최소 넛지는 "아래벗어남 −6" 이라 **만족하고 멈춘다** → 툴바 위에 152px 이 빈 채로 굳는다.
    const iosWindow = { top: 0, bottom: 377 };
    const iosCaret = { top: 355, bottom: 371 };
    {
      // 편집 문은 **딱 모자란 만큼**만 민다 — 아랫변이 한 줄 여유를 못 채운 10px 뿐이다.
      let asked = 0;
      underWalk(1, () => ({ caret: iosCaret, band: bandOf(340, iosWindow), limit: 377 }), (d) => {
        asked = d;
        return d;
      });
      eq('겨눔: 편집 문 — 모자란 만큼만 민다(최소 넛지)', asked, 371 - (377 - 16));
      ok('겨눔: 편집 문의 걸음은 뷰포트 문보다 훨씬 작다', Math.abs(asked) < 20);
      // 캐럿이 띠 한가운데면 편집 문은 **한 픽셀도 안 민다** — 글자마다 화면이 뛰면 못 쓴다.
      let idle = 0;
      underWalk(1, () => ({ caret: { top: 250, bottom: 266 }, band: bandOf(200, iosWindow), limit: 377 }), (d) => {
        idle = d;
        return d;
      });
      eq('겨눔: 편집 문 — 띠 한가운데면 안 민다', idle, 0);
    }
    eq(
      '겨눔: 뷰포트 문 — 툴바를 창 맨 위로 끌어올린다',
      place(iosCaret, aimOf(0, 377, 188), 377),
      355 - (188 + 16),
    );

    // ⓑ 안드로이드 실측(`+400`) — 창 322..854 · 툴바 322..510(키 188) · 캐럿 491..507.
    // 진단이 `fixUp=-35` 라 적었던 그 값이 그대로 나와야 한다.
    // 가림은 `place` 가 아니라 **최소 넛지**가 잡는다 — `place` 는 위로 안 밀기 때문이다.
    eq('겨눔: 뷰포트 문 — 가림은 place 가 아니라 넛지의 몫', place({ top: 491, bottom: 507 }, aimOf(322, 854, 188), 532), 0);
    eq(
      '겨눔: 안드로이드의 19px 잠김을 넛지가 −35 로 잡는다',
      revealFix({ top: 491, bottom: 507 }, bandOf(510, { top: 322, bottom: 854 }), 532),
      491 - (510 + 16),
    );

    // **위로는 안 민다** (011 7차) — 캐럿이 이미 과녁보다 위면 아래로 끌어내리지 않는다.
    // "가려졌거나 창 밖일 때만 움직인다" 는 원칙이고, 그쪽은 `underWalk` 의 몫이다.
    eq('겨눔: 뷰포트 문 — 캐럿이 과녁보다 위면 **안 민다**', place({ top: 100, bottom: 116 }, aimOf(0, 377, 188), 377), 0);
    ok('겨눔: 뷰포트 문 — 캐럿이 과녁보다 아래면 위로 민다', place({ top: 300, bottom: 316 }, aimOf(0, 377, 188), 377) > 0);
    eq('겨눔: 뷰포트 문 — 제자리면 0', place({ top: 204, bottom: 220 }, aimOf(0, 377, 188), 377), 0);
    // 툴바가 창보다 크면 과녁 띠가 비어 아무것도 안 한다 — 없는 자를 들고 재지 않는다.
    eq('겨눔: 뷰포트 문 — 툴바가 창보다 크면 안 민다', place(iosCaret, aimOf(0, 377, 400), 377), 0);

    // **툴바가 창 맨 위에 붙는다** — 세 기기 실측 자리를 그대로 건다 (011 7차).
    // 민 뒤의 툴바 자리를 셈으로 따라가 본다: 굴린 만큼 툴바도 따라 올라가되 창 맨 위에서 멎는다.
    const seat = (windowTop: number, windowBottom: number, barTop: number, barH: number, caretTop: number) => {
      let scroll = 0;
      placeWalk(
        KEYBOARD_STEPS,
        () => ({
          caret: { top: caretTop - scroll, bottom: caretTop - scroll + 16 },
          band: aimOf(windowTop, windowBottom, barH),
          limit: windowBottom - windowTop,
        }),
        (delta) => {
          // 툴바는 창 맨 위(windowTop)까지만 올라간다 — 그 뒤로는 캐럿만 움직인다.
          scroll += delta;
          return delta;
        },
      );
      return { 툴바위: Math.max(windowTop, barTop - scroll), 캐럿위: caretTop - scroll };
    };
    {
      // 아이폰 사파리 ⓑ (offsetTop=0): 창 0..377 · 툴바 123..311 · 캐럿 326 → 툴바가 0 에 붙어야 한다
      const r = seat(0, 377, 123, 188, 326);
      ok('겨눔: 아이폰 사파리 — 툴바가 창 맨 위에 붙는다', r.툴바위 - 0 <= 2);
      ok('겨눔: 아이폰 사파리 — 빈자리가 사라진다', r.툴바위 - 0 < 3);
      ok('겨눔: 아이폰 사파리 — 캐럿은 툴바 밑 한 줄 자리', Math.abs(r.캐럿위 - (188 + 16)) <= 2);
    }
    {
      // 아이폰 크롬: 창 0..359 · 툴바 105..293 · 캐럿 308
      const r = seat(0, 359, 105, 188, 308);
      ok('겨눔: 아이폰 크롬 — 툴바가 창 맨 위에 붙는다', r.툴바위 - 0 <= 2);
      ok('겨눔: 아이폰 크롬 — 빈자리가 사라진다', r.툴바위 - 0 < 3);
    }
    {
      // 아이폰 ⓐ (offsetTop=377 형): 창이 337..714 로 내려앉은 경우도 같은 식이어야 한다
      const r = seat(337, 714, 460, 188, 663);
      ok('겨눔: 아이폰 ⓐ — 툴바가 창 맨 위에 붙는다', r.툴바위 - 337 <= 2);
      ok('겨눔: 아이폰 ⓐ — 빈자리가 사라진다', r.툴바위 - 337 < 3);
    }
    {
      // 안드로이드: 창 322..854 · 툴바 337..525 · 캐럿 539 — 이미 거의 붙어 15px 만 움직인다
      const r = seat(322, 854, 337, 188, 539);
      ok('겨눔: 안드로이드 — 툴바가 창 맨 위에 붙는다', r.툴바위 - 322 <= 2);
      ok('겨눔: 안드로이드 — 빈자리가 사라진다', r.툴바위 - 322 < 3);
      ok('겨눔: 안드로이드 — 이미 거의 붙어 있어 조금만 움직인다', Math.abs(539 - r.캐럿위) <= 20);
    }
    {
      // **못 붙으면 갈 수 있는 데까지** — 굴릴 자리가 없으면 그 자리에서 그만둔다.
      let pushed = 0;
      placeWalk(
        KEYBOARD_STEPS,
        () => ({ caret: { top: 326, bottom: 342 }, band: aimOf(0, 377, 188), limit: 377 }),
        () => {
          pushed += 1;
          return 0; // 캐럿 위 내용이 짧아 한 픽셀도 못 굴린다
        },
      );
      eq('겨눔: 못 붙으면 한 번으로 그만둔다', pushed, 1);
    }

    // **우리가 밀면 크롬이 되미는** 자리 — 나아지지 않으면 멎는다(무한히 안 싸운다).
    {
      let pushed = 0;
      placeWalk(
        KEYBOARD_STEPS,
        () => ({ caret: { top: 700, bottom: 716 }, band: aimOf(322, 854, 188), limit: 532 }),
        () => {
          pushed += 1;
          return 0; // 크롬이 도로 밀어 한 픽셀도 안 움직인 셈
        },
      );
      eq('겨눔: 뷰포트 문 — 못 움직이면 한 번으로 그만둔다', pushed, 1);
    }
    eq('겨눔: 키보드가 선 걸음은 다섯까지다', KEYBOARD_STEPS, 5);
    ok('겨눔: 데스크톱은 셋 그대로다', REVEAL_STEPS === 3 && KEYBOARD_STEPS > REVEAL_STEPS);
  }

  ok('띠: 아이폰은 iOS 다', isIos('… iPhone OS 17 …', 'iPhone', 5));
  ok('띠: 손가락 닿는 맥은 아이패드다', isIos('… Macintosh …', 'MacIntel', 5));
  ok('띠: 보통 맥은 iOS 가 아니다', !isIos('… Macintosh …', 'MacIntel', 0));
  ok('띠: 안드로이드는 iOS 가 아니다', !isIos('… Android 14 …', 'Linux armv8l', 5));
}

// --- 7. 뜨는 판의 자리 — 네 변 보정과 위로 뒤집기 (084 ②) --------------------------------------
//
// 산수만 잡는다: 판은 버튼 아래에 붙여 놓고 **한 번 잰 뒤** 여기 답만큼 민다.

{
  // 한 축 — 안에 있으면 0 이다. 규칙의 절반이 이 0 이라 띠 산수와 결이 같다.
  eq('판: 뷰포트 안이면 안 민다', edgeShift(100, 200, 1000), 0);
  // 뒤가 넘치면 그만큼 앞으로 — 뒤 변이 정확히 여백 자리에 선다.
  eq('판: 뒤로 넘치면 그만큼 당긴다', edgeShift(900, 200, 1000), 1000 - PANEL_EDGE - 200 - 900);
  // 앞이 넘치면 여백 자리로 — 옛 셈이 못 보던 변이다.
  eq('판: 앞으로 넘치면 여백까지 민다', edgeShift(-30, 200, 1000), PANEL_EDGE + 30);
  // 두 변에 딱 붙는 판은 안 움직인다 — 여백까지가 "안"이다.
  eq('판: 여백에 딱 선 판은 그대로', edgeShift(PANEL_EDGE, 1000 - 2 * PANEL_EDGE, 1000), 0);
  // 뷰포트보다 큰 판은 **앞을 맞춘다** — 앞이 잘리는 것이 뒤가 잘리는 것보다 나쁘다.
  eq('판: 화면보다 큰 판은 앞을 맞춘다', edgeShift(40, 2000, 1000), PANEL_EDGE - 40);

  const box = (patch: Partial<PanelBox>): PanelBox => ({
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    anchorTop: 60,
    viewWidth: 1000,
    viewHeight: 800,
    ...patch,
  });

  eq('판: 화면 안이면 두 축 모두 0', panelShift(box({})), { dx: 0, dy: 0 });

  // 오른쪽 가장자리 버튼 — 예전에도 잡히던 유일한 변이다.
  eq('판: 오른쪽 넘침은 왼쪽으로', panelShift(box({ left: 900 })).dx, 1000 - PANEL_EDGE - 200 - 900);
  // 왼쪽 가장자리 — 툴바가 화면 왼쪽에 바짝 붙은 좁은 창에서 난다.
  eq('판: 왼쪽 넘침은 오른쪽으로', panelShift(box({ left: -20 })).dx, PANEL_EDGE + 20);

  // 가로 띠는 **편집기의 좌우**다 — 화면 안이어도 편집기 밖이면 민다. 편집기가 [300, 700] 인
  // 자리(문서 사이트의 데모처럼 화면보다 좁은 편집기)에서 잰다.
  const band = { viewLeft: 300, viewWidth: 400 };
  eq('판: 편집기 안이면 안 민다', panelShift(box({ left: 350, ...band })).dx, 0);
  eq(
    '판: 화면 안이어도 편집기 오른쪽을 넘으면 당긴다',
    panelShift(box({ left: 600, ...band })).dx,
    700 - PANEL_EDGE - 200 - 600,
  );
  eq('판: 편집기 왼쪽을 넘으면 민다', panelShift(box({ left: 280, ...band })).dx, 300 + PANEL_EDGE - 280);
  eq('판: 띠를 안 주면 옛 셈 그대로', panelShift(box({ left: 900 })).dx, panelShift(box({ left: 900, viewLeft: 0 })).dx);

  // 아래가 막히고 위가 넉넉하면 버튼 **위로 뒤집는다** — 그냥 위로 밀면 판이 자기를 연 버튼을
  // 덮는다. 뒤집힌 판의 아랫변이 버튼 윗변에서 틈만큼 위다.
  const flip = panelShift(box({ top: 700, anchorTop: 660 }));
  eq('판: 아래가 막히면 버튼 위로 뒤집는다', flip.dy, 660 - PANEL_GAP - 150 - 700);

  // 위에도 자리가 없으면 뒤집지 않고 화면 안으로만 민다 — 툴바가 화면 맨 위에 붙은 흔한 꼴이다.
  const squeeze = panelShift(box({ top: 700, anchorTop: 20, viewHeight: 800 }));
  eq('판: 위도 좁으면 뒤집지 않고 올려붙인다', squeeze.dy, 800 - PANEL_EDGE - 150 - 700);

  // 화면보다 키가 큰 판은 위를 맞춘다 — 격자의 첫 줄이 잘리면 안 된다(안에서 구르면 된다).
  eq('판: 화면보다 큰 판은 위를 맞춘다', panelShift(box({ top: 100, height: 900 })).dy, PANEL_EDGE - 100);

  // 네 판이 **한 문**을 지난다 — 링크·표·이미지·유튜브. 판을 여는 선언은 `prompt`
  // 와 `grid` 둘뿐이고 툴바의 `act` 가 그 둘을 `openPanel` 하나로 보내므로(차림표도 같은 판이다),
  // 다섯이 그 선언을 들고 있음을 여기서 확인하면 위의 자리 잡기 고침이 다섯에 다 닿는다.
  const doorOf = (name: string): string | undefined => {
    const wing = registry.wingOf(name);
    const decls = wing?.buttons ?? (wing?.button ? [wing.button] : []);
    return decls.map((decl) => decl.action?.kind).find((kind) => kind === 'prompt' || kind === 'grid');
  };
  eq('판: 링크는 주소 상자로 연다', doorOf('a'), 'prompt');
  eq('판: 이미지는 주소 상자로 연다', doorOf('img'), 'prompt');
  eq('판: 유튜브는 주소 상자로 연다', doorOf('youtube'), 'prompt');
  eq('판: 표는 격자로 연다', doorOf('table'), 'grid');
  // 저장은 이 문에 안 온다 — 덮개 위의 제 판(`openSavePanel`)이라 버튼에 붙는 자리 잡기가 없다.
  eq('판: 저장은 버튼에 붙는 판이 아니다', doorOf('save'), undefined);

  // 두 축은 서로를 안 본다 — 한 몸짓에 좌우와 위아래가 함께 보정된다.
  const both = panelShift(box({ left: 950, top: 780, anchorTop: 20 }));
  eq(
    '판: 좌우와 위아래가 한 번에 잡힌다',
    both,
    { dx: 1000 - PANEL_EDGE - 200 - 950, dy: 800 - PANEL_EDGE - 150 - 780 },
  );
}

// ─── 확인 잠금 — 형식이 안 맞으면 확인이 안 눌린다 (084 ⑧) ──────────────────────────
//
// 판정이 순수부(`promptValid`)라 판을 안 띄우고 잡는다. 여기서 보는 것은 두 가지다:
//   1. wing 넷의 칸이 **커맨드와 같은 답**을 내는가 — 갈리면 눌리는 확인이 아무 일도 안 한다
//   2. 잠금 규칙 자체 — 필수 칸이 비면 잠기고, 빈 선택 칸에는 형식을 안 묻는다
{
  const askFields = (name: string): readonly WingField[] => {
    const action = registry.wingOf(name)?.button?.action;
    return action && action.kind === 'prompt' ? action.fields : [];
  };

  // ui 의 두 문(`toolbar.openAsk`·`context.ask`)이 wing 의 칸을 판의 칸으로 옮기는 그 모양 그대로.
  const asPrompt = (fields: readonly WingField[]): PromptField[] =>
    fields.map((field) => ({
      name: field.name,
      label: field.name,
      ...(field.optional ? { optional: true } : {}),
      ...(field.validate ? { validate: field.validate } : {}),
    }));

  // 그 wing 의 판에서 확인이 눌리는가.
  const opens = (name: string, values: Readonly<Record<string, string>>): boolean =>
    promptValid(asPrompt(askFields(name)), values);

  // --- 링크 — `setLink` 의 `safeUrl` 그대로 -----------------------------------------------------
  ok('잠금: 링크는 http 주소면 열린다', opens('a', { href: 'https://example.com/x' }));
  ok('잠금: 링크는 같은 사이트 상대 경로도 열린다', opens('a', { href: '/docs/x' }));
  ok('잠금: 링크는 빈 주소면 잠긴다', !opens('a', { href: '' }));
  ok('잠금: 링크는 아무 글자나 넣으면 잠긴다', !opens('a', { href: '그냥 글자' }));
  ok('잠금: 링크는 javascript: 면 잠긴다', !opens('a', { href: 'javascript:alert(1)' }));
  // 첨부 이름은 선택 칸이라 비어도 열리고, 채워도 형식을 안 묻는다(형식이 없는 이름표다).
  ok('잠금: 링크의 첨부 칸은 비어도 열린다', opens('a', { href: 'https://example.com/x', file: '' }));
  ok('잠금: 링크의 첨부 칸은 아무 글자나 받는다', opens('a', { href: 'https://example.com/x', file: 'PDF' }));

  // --- 그림 — `insertImage` 의 `safeUrl(값, allowLocal)` 그대로 ---------------------------------
  // 값 하나하나가 커맨드의 답과 같은지 맞대 본다 — "두 곳의 답이 갈리면 안 된다" 가 이 줄이다.
  const urls = ['https://a.example/x.png', '/img/x.png', '//evil.example/x.png', 'javascript:alert(1)', 'x'];
  const imgSplit = urls.filter((url) => opens('img', { src: url }) !== (safeUrl(url) !== null));
  ok('잠금: 그림의 확인이 커맨드와 같은 답을 낸다', imgSplit.length === 0, imgSplit);
  // 로컬 주소는 **인스턴스마다 답이 다르다** — 기본은 닫혀 있고, 미리보기를 여는 wing 만 열린다.
  ok('잠금: 기본 그림 wing 은 blob: 을 잠근다', !opens('img', { src: 'blob:https://a.example/1' }));
  const localImage = makeImageWing({ allowLocalUrls: true }).button?.action;
  const localFields = localImage && localImage.kind === 'prompt' ? localImage.fields : [];
  ok(
    '잠금: 로컬을 여는 그림 wing 은 blob: 이 열린다',
    promptValid(asPrompt(localFields), { src: 'blob:https://a.example/1' }),
  );

  // --- 유튜브 — `insertYoutube` 의 `youtubeId(값) ?? videoId(값)` 그대로 -------------------------
  const videos = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
    'https://vimeo.com/12345',
    'https://www.youtube.com/watch?v=short',
    '유튜브',
  ];
  const tubeSplit = videos.filter(
    (raw) => opens('youtube', { v: raw }) !== ((youtubeId(raw) ?? videoId(raw)) !== null),
  );
  ok('잠금: 유튜브의 확인이 커맨드와 같은 답을 낸다', tubeSplit.length === 0, tubeSplit);
  ok('잠금: 유튜브는 남의 영상 주소면 잠긴다', !opens('youtube', { v: 'https://vimeo.com/12345' }));
  ok('잠금: 유튜브는 영상 id 한 개로도 열린다', opens('youtube', { v: 'dQw4w9WgXcQ' }));

  // --- 저장 — 이제 이 문에 안 온다 ---------------------------------------------------------------
  // 이름 칸은 wing 의 선언이 아니라 저장 판의 것이 되었다(형식을 고르는 자리와 한 판이라서다).
  // 빈 이름은 판이 막지 않는다 — `mountFile` 이 비면 날짜 + 호스트의 제목으로 지어 준다.
  eq('잠금: 저장은 물어보는 판을 안 든다', askFields('save').length, 0);

  // 넷 다 확인을 잠글 문을 지난다 — 저장만 "빈 것"이고 나머지 셋은 형식까지 본다.
  const noGuard = ['a', 'img', 'youtube'].filter((w) =>
    askFields(w).every((field) => field.optional || field.validate === undefined),
  );
  ok('잠금: 주소를 받는 wing 셋은 전부 형식 검사를 든다', noGuard.length === 0, noGuard);

  // 확인 단추의 글자 — svg 를 걷은 자리라 **말이 되었다**. 사람이 읽고 누르는 자리라 14 로케일.
  const okLabel = DICTIONARY['ok'] ?? {};
  const holes = LOCALES.filter((locale) => typeof okLabel[locale] !== 'string' || okLabel[locale] === '');
  ok('사전: 확인 단추 글자가 14 로케일을 다 든다', holes.length === 0, holes);
  eq('사전: 확인 단추는 한국어로 "확인"', translate('ok', 'ko'), '확인');
}


// ─── 진행률 티커 — 시계 둘 (12) ───────────────────────────────────────────────────
//
// **가짜 시계로 돌린다.** 티커가 DOM 을 모르고 `now`·`schedule` 을 인자로 받는 것이 이걸 위해서다.
{
  // 손으로 미는 시계 하나 — 예약된 일을 시각 순서로 꺼내 돌린다.
  const clock = (): {
    now(): number;
    schedule(fn: () => void, ms: number): () => void;
    run(ms: number): void;
  } => {
    let at = 0;
    let seq = 0;
    const jobs = new Map<number, { at: number; fn: () => void }>();
    return {
      now: () => at,
      schedule(fn, ms) {
        seq += 1;
        const id = seq;
        jobs.set(id, { at: at + ms, fn });
        return () => jobs.delete(id);
      },
      run(ms) {
        const until = at + ms;
        for (;;) {
          let next: [number, { at: number; fn: () => void }] | null = null;
          for (const entry of jobs) if (!next || entry[1].at < next[1].at) next = entry;
          if (!next || next[1].at > until) break;
          jobs.delete(next[0]);
          at = next[1].at;
          next[1].fn();
        }
        at = until;
      },
    };
  };

  {
    const c = clock();
    const seen: number[] = [];
    const t = createTicker({ size: 1_000_000, bandwidth: 12_500_000, onChange: (v) => seen.push(v), now: c.now, schedule: c.schedule });
    c.run(5000);
    ok('티커: 콜백이 하나도 안 와도 숫자가 걷는다', seen.length > 0);
    eq('티커: 완료 전에는 99 를 안 넘는다', Math.max(...seen) <= 99, true);
    let rising = true;
    for (let i = 1; i < seen.length; i += 1) if ((seen[i] as number) < (seen[i - 1] as number)) rising = false;
    ok('티커: 숫자는 뒤로 안 간다', rising);
    t.stop();
  }

  {
    const c = clock();
    const seen: number[] = [];
    const t = createTicker({ size: 1_000_000, bandwidth: 12_500_000, onChange: (v) => seen.push(v), now: c.now, schedule: c.schedule });
    c.run(300);
    const before = seen[seen.length - 1] ?? 0;
    // 진짜 콜백이 앞서 있다 — 따라잡는다.
    t.report(60);
    eq('티커: 앞선 진짜 콜백은 따라잡는다', seen[seen.length - 1], 60);
    ok('티커: 그전까지는 짐작이 몰고 있었다', before < 60);
    // 진짜 콜백이 뒤처져 있다 — **끌어내리지 않는다**.
    t.report(10);
    eq('티커: 뒤처진 콜백에 숫자가 안 내려간다', seen[seen.length - 1], 60);
    t.report(100);
    eq('티커: 100 이 와도 완료 전에는 99 다', seen[seen.length - 1], 99);
    t.stop();
  }

  {
    const c = clock();
    let last = -1;
    const t = createTicker({ size: 500, bandwidth: 12_500_000, onChange: (v) => { last = v; }, now: c.now, schedule: c.schedule });
    let settled = false;
    void t.finish().then(() => { settled = true; });
    c.run(400);
    await Promise.resolve();
    await Promise.resolve();
    eq('티커: 완료 꼬리가 100 까지 간다', last, 100);
    ok('티커: 꼬리가 끝나면 약속이 풀린다', settled);
  }

  {
    const c = clock();
    const seen: number[] = [];
    // 대역폭 0 = 티커를 끈다 — 진짜 콜백만 지나간다.
    const t = createTicker({ size: 1_000_000, bandwidth: 0, onChange: (v) => seen.push(v), now: c.now, schedule: c.schedule });
    c.run(5000);
    eq('티커: 꺼 두면 혼자 안 걷는다', seen.length, 0);
    t.report(42);
    eq('티커: 꺼 두면 진짜 콜백이 그대로 보인다', seen, [42]);
    t.stop();
  }
}

// --- toast — 차례·넘침의 순수 판정과 editor 배선 (084 ①) --------------------------------------
// 그릇의 DOM 은 여기서 안 잡는다(이 그물은 DOM 이 없다) — 화면은 데모에서 본다.

{
  const slot = (seq: number, ends: number): { seq: number; ends: number } => ({ seq, ends });

  // 차례 — 남은 시간이 많은 것이 위. 넣은 차례와 무관하다.
  eq(
    'toast 차례: 남은 시간이 많은 것이 위다',
    toastOrder([slot(0, 5000), slot(1, 1000), slot(2, 3000)]).map((s) => s.seq),
    [0, 2, 1],
  );
  // 같은 시간으로 A→B→C — 새것이 위라 위에서부터 C/B/A.
  eq(
    'toast 차례: 시간이 같으면 새것이 위다 (C/B/A)',
    toastOrder([slot(0, 1000), slot(1, 1000), slot(2, 1000)]).map((s) => s.seq),
    [2, 1, 0],
  );

  // 넘침 — 남은 시간이 가장 적은 것부터 걷는다.
  eq(
    'toast 넘침: 남은 시간이 가장 적은 것부터 걷는다',
    toastOverflow([slot(0, 5000), slot(1, 1000), slot(2, 3000), slot(3, 4000)], 3).map((s) => s.seq),
    [1],
  );
  eq(
    'toast 넘침: 시간이 같으면 먼저 온 것부터 걷는다',
    toastOverflow([slot(0, 1000), slot(1, 1000), slot(2, 1000), slot(3, 1000)], 2).map((s) => s.seq),
    [0, 1],
  );
  eq('toast 넘침: 상한 안이면 아무것도 안 걷는다', toastOverflow([slot(0, 1000)], 3), []);
  // 방금 넣은 것이 가장 짧으면 그것이 걷힌다 — 새것 우대가 아니라 남은 시간이 기준이다.
  eq(
    'toast 넘침: 새것도 남은 시간이 가장 적으면 걷힌다',
    toastOverflow([slot(0, 5000), slot(1, 4000), slot(2, 3000), slot(3, 500)], 3).map((s) => s.seq),
    [3],
  );
}

{
  // editor 배선 — 호스트 콜백이 이기고, 없으면 그릇($bindToast), 그것도 없으면 침묵.
  const heard: string[] = [];
  const { nabi: hosted } = createNabiWith(defaultWings, {
    toast: (level, message, ms) => heard.push(`${level}:${message}:${ms ?? '-'}`),
  });
  hosted.$toast('warn', '말', 700);
  eq('toast 배선: 호스트 콜백이 그대로 받는다 (ms 포함)', heard, ['warn:말:700']);

  const sunk: string[] = [];
  hosted.$bindToast((level, message) => sunk.push(`${level}:${message}`));
  hosted.$toast('info', '또');
  eq('toast 배선: 콜백이 있으면 그릇은 안 불린다', sunk, []);

  const { nabi: bare } = createNabiWith(defaultWings, {});
  bare.$toast('info', '허공'); // 그릇도 콜백도 없다 — 침묵이고, 던지지 않는 것이 답이다
  const unbind = bare.$bindToast((level, message) => sunk.push(`${level}:${message}`));
  bare.$toast('error', '이제');
  eq('toast 배선: 콜백이 없으면 그릇이 받는다', sunk, ['error:이제']);
  unbind();
  bare.$toast('info', '뗀 뒤');
  eq('toast 배선: 그릇을 떼면 다시 침묵이다', sunk, ['error:이제']);

  // 결 둘 — 기본값과 옵션.
  eq('toast 결: 기본 시간은 1초다', bare.$toastMs, 1000);
  eq('toast 결: 기본 상한은 3이다', bare.$toastMax, 3);
  const { nabi: tuned } = createNabiWith(defaultWings, { toastMs: 4000, toastMax: 5 });
  eq('toast 결: 옵션이 기본 그릇의 결을 바꾼다', [tuned.$toastMs, tuned.$toastMax], [4000, 5]);
}

{
  // Ask.message 통합 (084 ask ③) — 기본 message 는 toast(info) 로 흐르고, 끼운 칸만 이긴다.
  const said: string[] = [];
  const { nabi } = createNabiWith(defaultWings, {});
  nabi.$bindToast((level, message, ms) => said.push(`${level}:${message}:${ms ?? '-'}`));
  nabi.$ask.message('알림 하나');
  eq('ask 통합: 기본 message 는 toast(info) 다', said, ['info:알림 하나:-']);
  eq('ask 통합: 기본 confirm 은 여전히 아니오다', nabi.$ask.confirm('버릴까?'), false);

  // confirm 만 끼우면 message 는 그대로 toast 로 흐른다 — 데모가 딱 이 모양이다.
  const { nabi: half } = createNabiWith(defaultWings, { ask: { confirm: () => true } });
  const halfSaid: string[] = [];
  half.$bindToast((level, message) => halfSaid.push(`${level}:${message}`));
  half.$ask.message('반만');
  eq('ask 통합: confirm 만 끼워도 message 는 toast 다', halfSaid, ['info:반만']);
  eq('ask 통합: 끼운 confirm 이 이긴다', half.$ask.confirm('열까?'), true);

  // message 를 끼우면 그쪽이 이긴다 — toast 그릇은 안 불린다.
  const mine: string[] = [];
  const { nabi: asked } = createNabiWith(defaultWings, { ask: { message: (text) => mine.push(text) } });
  const stray: string[] = [];
  asked.$bindToast((level, message) => stray.push(`${level}:${message}`));
  asked.$ask.message('내 상자로');
  eq('ask 통합: 끼운 message 가 이긴다', mine, ['내 상자로']);
  eq('ask 통합: 그때 toast 그릇은 조용하다', stray, []);

  // 머리 없는 환경의 뜻은 그대로다 — silentAsk 는 여전히 침묵이고 아니오다.
  silentAsk.message('허공에');
  eq('ask 통합: silentAsk 는 여전히 아니오다', silentAsk.confirm('예?'), false);
}

// --- 첨부 링크 = 줄 안에 서는 물건 -------------------------------------------------------------
// 누름(mousedown)이 통째로 고르고 물건 표식(data-nabi-picked)을 얹는지, 캐럿이 속에 못 서는지,
// 지우기·되돌리기가 한 글자처럼 도는지, 그 어느 것도 저장값을 안 바꾸는지를 못박는다.
// attach 는 DOM 을 받지만 만지는 어휘가 좁아서(closest·querySelectorAll·속성), 그 어휘만 든
// 껍데기로 그물에 잡힌다 — 진짜 화면의 몸짓 순서(세 걸음 삼키기)는 브라우저 확인의 몫이다.
{
  const original = [
    { w: 'p', ch: ['앞', { w: 'a', a: { href: '/f/x.txt', file: 'txt' }, ch: ['첨부파일'] }, '뒤'] },
  ];
  const { nabi } = createNabiWith(defaultWings, { doc: original, parseHtml: tinyHtml });
  const holderId = (nabi.$doc()[0] as ElementNode)._id as string;

  // 화면의 최소 껍데기 — 첨부 a 하나가 문단 홀더 안에 선 모양.
  const pickedNames = new Set<string>();
  const anchorEl: {
    previousSibling: null;
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
    closest(q: string): unknown;
  } = {
    previousSibling: null,
    getAttribute: (name) => (name === 'href' ? '/f/x.txt' : name === 'data-nabi-file' ? 'txt' : null),
    setAttribute: (name) => void pickedNames.add(name),
    removeAttribute: (name) => void pickedNames.delete(name),
    closest: (q) => (q === 'a[data-nabi-file]' ? anchorEl : holderEl),
  };
  const holderEl = {
    getAttribute: (name: string) => (name === 'data-key' ? holderId : null),
    querySelectorAll: () => [anchorEl],
    closest: () => null,
  };
  const listeners = new Map<string, (ev: unknown) => void>();
  const root = {
    addEventListener: (type: string, handler: unknown) => void listeners.set(type, handler as (ev: unknown) => void),
    removeEventListener: () => undefined,
    contains: () => true,
    focus: () => undefined,
    querySelector: (q: string) => (q.includes(holderId) ? holderEl : null),
  } as unknown as HTMLElement;

  const stop = attachFileLink({ root, nabi, pathOfKey: (id) => (id === holderId ? [0] : null) });
  const span = (): [number, number] => {
    const s = nabi.getSelection();
    return [s.anchor.offset, s.focus.offset];
  };
  const savedHtml = nabi.getHtml();
  eq('첨부의 저장값 — 링크 마크 그대로다(다른 껍데기가 안 생긴다)', savedHtml,
    '<p>앞<a href="/f/x.txt" data-nabi-file="txt" download>첨부파일</a>뒤</p>');

  // 누름 = 통째 고르기 — 몸짓의 세 걸음(mousedown·mouseup·click)을 다 삼킨다 (081 §3 의 규칙).
  let prevented = 0;
  const gesture = { button: 0, shiftKey: false, target: anchorEl, preventDefault: () => void (prevented += 1) };
  listeners.get('mousedown')?.(gesture);
  eq('누름이 첨부를 통째로 고른다 — [1, 5)', span(), [1, 5]);
  ok('물건 표식(data-nabi-picked)이 그 a 에 얹힌다', pickedNames.has('data-nabi-picked'));
  eq('mousedown 을 삼켰다', prevented, 1);
  listeners.get('mouseup')?.(gesture);
  listeners.get('click')?.(gesture);
  eq('mouseup·click 까지 세 걸음을 다 삼켰다', prevented, 3);
  eq('고르기는 저장값을 안 바꾼다', nabi.getHtml(), savedHtml);

  // 캐럿이 속에 못 선다 — 속의 한 자리를 짚는 순간 통째로 골라진다 (방향키로 들어와도 같은 길이다).
  nabi.select(caretAt({ path: [0], offset: 1 }));
  eq('경계에는 캐럿이 선다 — 표식은 걷힌다', [span(), pickedNames.size], [[1, 1], 0]);
  nabi.select(caretAt({ path: [0], offset: 3 }));
  eq('속의 캐럿은 통째 고르기가 된다', span(), [1, 5]);
  ok('그때도 물건 표식이 선다', pickedNames.has('data-nabi-picked'));

  // 첨부보다 넓은 범위는 물건 하나를 고른 것이 아니다 — 표식 없이 보통 선택으로 남는다.
  nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 3 } });
  eq('스친 범위는 첨부 끝까지 넓어진다', span(), [0, 5]);
  eq('꼭 맞게 덮은 것이 아니면 표식이 없다', pickedNames.size, 0);

  // 지우기·되돌리기가 한 글자처럼 돈다 — 고른 뒤 한 번에 걷히고, 한 걸음에 돌아온다.
  nabi.select(caretAt({ path: [0], offset: 3 }));
  nabi.applyCommand('deleteBackward');
  eq('골라진 첨부는 한 번에 통째로 걷힌다', nabi.getJson(), [{ w: 'p', ch: ['앞뒤'] }]);
  eq('걷힌 뒤 표식도 걷힌다', pickedNames.size, 0);
  nabi.undo();
  eq('되돌리기 한 걸음에 통째로 돌아온다', nabi.getJson(), original);
  stop();
}

// 저장값 왕복 — 첨부가 든 문서를 내보내고 도로 들여도 같은 글자열이다(값이 흔들리면 이미
// 저장된 글이 흔들린다).
{
  const { nabi } = createNabiWith(defaultWings, { parseHtml: tinyHtml });
  const saved = '<p>앞<a href="/f/x.txt" data-nabi-file="txt" download>첨부파일</a>뒤</p>';
  ok('첨부 HTML 이 들어온다', nabi.setHtml(saved));
  eq('첨부의 저장값 왕복 — 글자 하나 안 바뀐다', nabi.getHtml(), saved);
}

// --- 가속키의 두 문턱 (260823_013) -------------------------------------------------------------
//
// 버그: 툴바가 문서에 귀를 달아서, **우리 편집기 밖에서 난 ⌘S 도** 저장 판을 열었다. 한 페이지에
// 편집기가 둘이면 아래 편집기의 ⌘S 가 위 편집기의 글을 저장했고, 호스트의 평범한 textarea 에서
// 쳐도 판이 떴다(둘 다 실제로 재현했다). 셋째 문턱 — "wing 을 안 들면 그 키가 아예 없다" — 는
// 코드가 아니라 모양이 지킨다: 가속키는 등록된 wing 이 낸 단추 목록에서만 나온다.
{
  const box = (...inside: string[]) => ({ contains: (node: unknown) => inside.includes(String(node)) });
  const surface = box('글', '글속');
  const row = box('단추');

  ok('표면 안에서 난 키는 우리 것', ownsKey({ surface, root: row }, '글속'));
  ok('툴바 줄에서 난 키도 우리 것', ownsKey({ surface, root: row }, '단추'));
  ok('남의 편집기·호스트 칸에서 난 키는 우리 것이 아니다', !ownsKey({ surface, root: row }, '옆편집기'));
  ok('겨눔 없는 키(target 이 없다)도 우리 것이 아니다', !ownsKey({ surface, root: row }, null));
  // 표면을 안 준 호스트 — 제 편집 자리를 말한 적이 없어 땅을 그릴 수 없다. 옛길이 답이다.
  ok('표면을 안 주면 옛길(문서 전체)이다', ownsKey({ root: row }, '아무데나'));

  // 닿을 데 — `host` 갈래만 배선을 문다.
  const wired = (savePanel: boolean, onHost: boolean) => ({ savePanel, onHost });
  ok('커맨드 갈래는 언제나 닿는다', actionReaches({ kind: 'command', command: 'openFile' }, wired(false, false)));
  ok('마크 갈래도 언제나 닿는다', actionReaches({ kind: 'mark' }, wired(false, false)));
  ok('저장 판을 끼웠으면 host 갈래가 닿는다', actionReaches({ kind: 'host' }, wired(true, false)));
  ok('호스트가 받기로 했으면 닿는다', actionReaches({ kind: 'host' }, wired(false, true)));
  ok('둘 다 없으면 안 닿는다 — 키를 안 삼킨다', !actionReaches({ kind: 'host' }, wired(false, false)));
  ok('선언이 없는 단추는 안 닿는다', !actionReaches(undefined, wired(true, true)));
}

// 저장·열기 wing 이 낸 가속키는 **등록한 편집기에만** 있다 — 툴바는 단추 목록에서만 키를 찾고,
// 그 목록은 registry 가 낸다. `allBasic()` 은 셋(upload·save·open)을 안 들므로 ⌘S·⌘O 가 없다.
{
  const basic = makeRegistry(wings().allBasic().build());
  const keysOf = (reg: Registry): string[] =>
    toolbarSlots(reg, makeTranslator('ko'))
      .map((slot) => slot.decl.accelerator)
      .filter((key): key is string => key !== undefined);
  ok('allBasic 편집기에는 mod+s 가 없다', !keysOf(basic).includes('mod+s'));
  ok('allBasic 편집기에는 mod+o 가 없다', !keysOf(basic).includes('mod+o'));
  const withFile = makeRegistry(wings().allBasic().use('save').use('open').build());
  ok('wing 을 들면 mod+s 가 산다', keysOf(withFile).includes('mod+s'));
  ok('wing 을 들면 mod+o 가 산다', keysOf(withFile).includes('mod+o'));
}


// --- 스티키의 겨눔 세션 — 260823_015 의 두 규칙 ------------------------------------------------
// 여기만 창을 흉내 낸다. `sticky.ts` 가 답하는 것은 산수가 아니라 **언제 미는가**(문 여닫이)라
// 순수부만 잡는 이 그물의 다른 자리처럼 함수 하나를 부를 수가 없다. 흉내는 최소다 — 캐럿 사각형
// 하나, 붙는 크롬 하나, 시각 뷰포트 하나, rAF 하나, settle 하나. 그 위에서 **진짜 `mountSticky`**
// 가 돈다.
{
  interface WorldOptions {
    readonly innerHeight?: number;
    readonly bar?: number; // 붙는 크롬의 높이
    readonly chromeDocTop?: number; // 크롬이 붙기 시작하는 문서 자리 (스티키)
    // 크롬이 창 위에 **붙나**. false 면 스티키를 벗어나 **글과 함께 굴러간다** — 캐럿과 나란히
    // 움직여 아무리 밀어도 사이가 안 변하는 그 자리다 (015 2차의 실측).
    readonly sticky?: boolean;
    // 붙는 크롬이 **어느 client y 에 붙나.** 데스크톱·아이폰은 0, 안드로이드는 `visual.offsetTop`
    // 만큼 아래다(rect 가 레이아웃 창 기준이라 보이는 창의 위가 0 이 아니다 — 011 4차).
    readonly stickTop?: number;
    // 시각 뷰포트의 `offsetTop`. 아이폰의 "미는" 사파리는 337 같은 값, 나머지는 0.
    readonly vvOffsetTop?: number;
    // `position:fixed; top:0` 인 표식의 client top — `probeTop` 이 재는 그 값이다.
    // 아이폰(미는 방식)은 −337, 안드로이드·데스크톱은 0 (011 4차의 실측).
    readonly fixedTop?: number;
    readonly caretDoc?: number; // 캐럿 윗변의 문서 자리
    readonly caretHeight?: number;
    readonly scrollY?: number;
    readonly maxScroll?: number;
  }

  function makeWorld(options: WorldOptions = {}) {
    const innerHeight = options.innerHeight ?? 812;
    let bar = options.bar ?? 188;
    let chromeDocTop = options.chromeDocTop ?? 0;
    let caretDoc = options.caretDoc ?? 0;
    let caretHeight = options.caretHeight ?? 19;
    let scrollY = options.scrollY ?? 0;
    const maxScroll = options.maxScroll ?? 100000;
    let keyboard = 0;
    let moved = 0; // 우리가 민 총량 — 그물이 보는 그 값이다

    const frames = new Map<number, () => void>();
    let frameId = 0;
    const quiets: Array<() => void> = [];
    const winListeners = new Map<string, Set<() => void>>();
    const vvListeners = new Map<string, Set<() => void>>();
    const surfaceListeners = new Map<string, Set<() => void>>();
    let queuedScrolls = 0; // 우리가 민 뒤에 브라우저가 뒤늦게 내는 스크롤 사건

    const on = (map: Map<string, Set<() => void>>, type: string, fn: () => void): void => {
      const set = map.get(type) ?? new Set<() => void>();
      set.add(fn);
      map.set(type, set);
    };
    const off = (map: Map<string, Set<() => void>>, type: string, fn: () => void): void => {
      map.get(type)?.delete(fn);
    };
    const fire = (map: Map<string, Set<() => void>>, type: string): void => {
      for (const fn of [...(map.get(type) ?? [])]) fn();
    };

    const glued = options.sticky !== false;
    const stickTop = options.stickTop ?? 0;
    const chromeRect = () => {
      const raw = chromeDocTop - scrollY;
      const top = glued ? Math.max(stickTop, raw) : raw;
      return { top, bottom: top + bar, height: bar };
    };
    const caretRect = () => {
      const top = caretDoc - scrollY;
      return { top, bottom: top + caretHeight, height: caretHeight };
    };

    const visual = {
      get offsetTop() {
        return keyboard > 0 ? (options.vvOffsetTop ?? 0) : 0;
      },
      get height() {
        return innerHeight - keyboard;
      },
      addEventListener: (type: string, fn: () => void) => on(vvListeners, type, fn),
      removeEventListener: (type: string, fn: () => void) => off(vvListeners, type, fn),
    };

    const view = {
      visualViewport: visual,
      get innerHeight() {
        return innerHeight;
      },
      get scrollY() {
        return scrollY;
      },
      navigator: { userAgent: 'net', platform: 'Net', maxTouchPoints: 0 },
      scrollBy: (opts: { top: number }) => {
        const before = scrollY;
        scrollY = Math.min(maxScroll, Math.max(0, scrollY + opts.top));
        moved += scrollY - before;
        if (scrollY !== before) queuedScrolls += 1;
      },
      requestAnimationFrame: (fn: () => void) => {
        frameId += 1;
        frames.set(frameId, fn);
        return frameId;
      },
      cancelAnimationFrame: (id: number) => void frames.delete(id),
      addEventListener: (type: string, fn: () => void) => on(winListeners, type, fn),
      removeEventListener: (type: string, fn: () => void) => off(winListeners, type, fn),
      // 크기 관찰자 하나 — 진짜와 같은 자리에 산다(`view.ResizeObserver`). 그물이 손으로 깨운다.
      ResizeObserver: class {
        readonly fn: () => void;
        constructor(fn: () => void) {
          this.fn = fn;
          sizeWatchers.add(this);
        }
        observe(): void {
          this.fn(); // 진짜도 걸자마자 한 번 부른다
        }
        disconnect(): void {
          sizeWatchers.delete(this);
        }
      },
    };
    const sizeWatchers = new Set<{ fn: () => void }>();

    const selection = {
      rangeCount: 1,
      getRangeAt: () => ({ getBoundingClientRect: caretRect, startContainer: null }),
    };

    const owner = {
      defaultView: view,
      documentElement: {
        get clientHeight() {
          return innerHeight;
        },
      },
      body: { append: () => undefined },
      createElement: () => ({
        setAttribute: () => undefined,
        style: { cssText: '' },
        getBoundingClientRect: () => ({ top: options.fixedTop ?? 0 }),
        remove: () => undefined,
      }),
      getSelection: () => selection,
      activeElement: null,
    };

    const vars = new Map<string, string>();
    const root = {
      ownerDocument: owner,
      style: {
        setProperty: (name: string, value: string) => void vars.set(name, value),
        removeProperty: (name: string) => void vars.delete(name),
      },
    };
    const surface = {
      addEventListener: (type: string, fn: () => void) => on(surfaceListeners, type, fn),
      removeEventListener: (type: string, fn: () => void) => off(surfaceListeners, type, fn),
    };
    const chrome = { getBoundingClientRect: chromeRect };

    const settle: Settle = {
      busy: () => false,
      onSettle: () => () => undefined,
      afterViewport: (fn) => void quiets.push(fn),
      unmount: () => undefined,
    };

    let onChange: ((change: { doc: boolean }) => void) | null = null;
    const nabi = {
      onChange: (fn: (change: { doc: boolean }) => void) => {
        onChange = fn;
        return () => void (onChange = null);
      },
    } as unknown as Nabi;

    const sticky = mountSticky({
      root: root as unknown as HTMLElement,
      surface: surface as unknown as HTMLElement,
      chrome: chrome as unknown as HTMLElement,
      settle,
      nabi,
      iosBranch: false,
    });

    // 우리가 민 뒤의 스크롤 사건은 **한 박자 늦게** 온다 — 그 늦음이 곧 `mine` 가림막의 자리다.
    const flushScroll = (): void => {
      const n = queuedScrolls;
      queuedScrolls = 0;
      for (let i = 0; i < n; i += 1) fire(winListeners, 'scroll');
    };

    return {
      sticky,
      get scrollY() {
        return scrollY;
      },
      get moved() {
        return moved;
      },
      resetMoved: () => void (moved = 0),
      caret: caretRect,
      chrome: chromeRect,
      // `bandNow()` 와 **같은 식**으로 잰다 (011 4차의 좌표계 자를 포함해서).
      band: () => {
        const off = keyboard > 0 ? (options.vvOffsetTop ?? 0) : 0;
        const ruler = off > 0 ? (options.fixedTop ?? 0) : 0;
        const top = ruler + off;
        const bottom = top + (innerHeight - keyboard);
        const cb = chromeRect().bottom;
        return { top: cb < bottom ? Math.max(top, cb) : top, bottom };
      },
      focus: () => fire(surfaceListeners, 'focus'),
      blur: () => fire(surfaceListeners, 'blur'),
      // **사람이** 굴린다 — 우리가 안 민 자리에서, **뷰포트가 조용해진 뒤에** 온 스크롤이다.
      // 조용해지기를 실제로 기다린다(`VIEW_QUIET`): 015 3차부터 그것이 "사람"의 정의라,
      // 기다리지 않고 굴리면 그것은 사람이 아니라 **브라우저**를 흉내 낸 것이 된다.
      scroll: (to: number) => {
        pause(350);
        flushScroll();
        scrollY = Math.min(maxScroll, Math.max(0, to));
        fire(winListeners, 'scroll');
      },
      // **브라우저가** 굴린다 — 키보드가 서며 사파리가 스스로 옮기는 그 스크롤이다.
      // 뷰포트가 움직이는 그 순간에 온다(기다리지 않는다).
      browserScroll: (to: number) => {
        flushScroll();
        scrollY = Math.min(maxScroll, Math.max(0, to));
        fire(winListeners, 'scroll');
      },
      // 키보드가 서거나 눕는다.
      keyboard: (px: number) => {
        keyboard = px;
        fire(vvListeners, 'resize');
      },
      // 툴바의 키를 조용히 갈아 끼운다 — 관찰자는 안 깨운다(옛 판이 쓰던 그 문).
      bar: (px: number) => void (bar = px),
      // **툴바가 늦게 자란다** — 상황 줄이 서고, 단추 줄이 두 줄로 접히고, 폰트가 늦게 온다.
      // 키를 바꾸고 크기 관찰자를 깨운다 (015 3차의 새 문).
      growBar: (px: number) => {
        bar = px;
        for (const w of [...sizeWatchers]) w.fn();
      },
      // 관찰자를 키 변화 없이 깨운다 — 우리가 굴려 **자리만** 달라진 그 자리를 흉내 낸다.
      pokeBar: () => {
        for (const w of [...sizeWatchers]) w.fn();
      },
      watchers: () => sizeWatchers.size,
      // 문서가 바뀐다 — `grow` 만큼 캐럿이 아래로 흘러내린다(글줄이 접히며 늘어나는 그 몫).
      edit: (grow = 0) => {
        caretDoc += grow;
        onChange?.({ doc: true });
      },
      // rAF 한 판 — 앞 판이 민 뒤의 스크롤 사건을 먼저 흘리고 예약된 걸음을 걷는다.
      frame: () => {
        flushScroll();
        const run = [...frames.values()];
        frames.clear();
        for (const fn of run) fn();
      },
      // 가라앉음 — `settle.afterViewport` 에 걸린 걸음을 흘린다.
      quiet: () => {
        const run = quiets.splice(0, quiets.length);
        for (const fn of run) fn();
      },
      pending: () => frames.size,
    };
  }

  const round = (n: number): number => Math.round(n * 100) / 100;

  // 손이 멎고 `USER_QUIET`(250ms) 이 지나기를 기다린다 — **8차의 미룸 창이 닫히는 그 자리다.**
  // 옛 코드는 여기서 기다리다 결국 밀었고(주인: "계속 화면이 돌아와"), 지금은 세션이 이미 끝나
  // 아무것도 안 민다. 이 판만 시계를 본다.
  const pause = (ms: number): void => {
    const until = Date.now() + ms;
    while (Date.now() < until);
  };

  // --- 규칙 2. 편집은 위 변만 본다 — 키보드가 선 채 타이핑해도 우리가 민 총량이 0 -------------
  {
    // 011 이 실측한 그 자리: 창 812, 키보드 435 → 보이는 창 377, 툴바 188 → 띠 188..377.
    // 캐럿은 키보드 뒤(문서 500)에 있어 **아래 변이 보면 161 이 나온다.** 그런데 위 변만 보면 0 이다.
    const w = makeWorld({ innerHeight: 812, bar: 188, caretDoc: 500, caretHeight: 19, scrollY: 0 });
    w.focus();
    w.keyboard(435); // 키보드가 선다 — 뷰포트 문이 열린다
    w.frame();
    w.quiet();
    w.frame();
    ok('키보드가 서면 뷰포트 문이 한 번 잡는다', w.moved !== 0, `moved=${w.moved}`);
    w.resetMoved();
    // 이제 타이핑 — 글줄이 접히며 캐럿이 한 줄씩 흘러내린다(주인의 `sadflasdkjf…` 가 그것이다).
    for (let i = 0; i < 8; i += 1) {
      w.edit(19);
      w.frame();
    }
    eq('키보드가 선 채 타이핑을 여러 번 — 우리가 민 총량 0 (야금야금이 멎었다)', w.moved, 0);
  }

  // --- 규칙 1. 사람이 굴리면 푼다 — 예외 없다 ----------------------------------------------------
  {
    const w = makeWorld({ innerHeight: 812, bar: 188, caretDoc: 500, caretHeight: 19, scrollY: 0 });
    w.focus();
    w.keyboard(435); // 키보드가 선다 — 즉시 걸음 하나와 **가라앉은 뒤의 걸음 하나**가 걸린다
    w.frame();
    ok('키보드가 서면 즉시 걸음이 한 번 잡는다', w.moved !== 0, `moved=${w.moved}`);
    w.resetMoved();
    // 가라앉음 걸음이 **아직 기다리는 중**에, 뷰포트가 조용해진 뒤 사람이 굴려 캐럿이 툴바에
    // 완전히 가리는 자리로 떠난다.
    w.scroll(w.scrollY + 400);
    const hidden = w.caret().top < w.band().top;
    ok('사람이 굴린 뒤 캐럿은 툴바에 가려 있다 (일부러 만든 자리다)', hidden, `caret=${round(w.caret().top)} band=${w.band().top}`);
    w.quiet(); // 기다리던 가라앉음 걸음
    w.frame();
    w.frame();
    eq('사람이 굴린 그 순간 가라앉음 걸음이 취소된다', w.moved, 0);
    pause(300); // 손이 멎고 미룸 창이 닫힌다 — 옛 코드가 **여기서** 밀었다
    w.quiet();
    w.frame();
    w.frame();
    eq('사람 스크롤 뒤에는 우리가 민 총량이 0 — 캐럿이 툴바에 가려져 있어도', w.moved, 0);
    // 그런데 **사람이 돌아오면** 다시 켜진다 — 타이핑이 그 길이다.
    w.edit();
    w.frame();
    ok('사람 스크롤 뒤에 타이핑하면 캐럿으로 돌아온다', w.moved < 0, `moved=${w.moved}`);
    ok('돌아온 캐럿은 툴바 아래에 선다', w.caret().top >= w.band().top, `caret=${round(w.caret().top)} band=${w.band().top}`);
  }

  // --- 세션이 다시 켜지는 문 셋 -----------------------------------------------------------------
  {
    const w = makeWorld({ innerHeight: 812, bar: 188, caretDoc: 500, caretHeight: 19, scrollY: 0 });
    w.focus();
    w.keyboard(435);
    w.frame();
    w.quiet();
    w.frame();
    w.scroll(w.scrollY + 400); // 사람이 굴려 세션을 끝낸다
    w.resetMoved();
    w.quiet();
    w.frame();
    eq('끝난 세션에서는 가라앉음 걸음도 취소된다', w.moved, 0);

    // ① 새 겨눔
    w.blur();
    w.focus(); // 키보드가 이미 서 있으니 `follow` 의 첫 순간 판정이 문을 연다
    w.quiet(); // (손이 방금 멎은 참이라 즉시 걸음은 8차의 미룸에 걸린다 — 가라앉은 뒤 걷는다)
    w.frame();
    ok('새 겨눔이 세션을 다시 켠다', w.moved !== 0, `moved=${w.moved}`);

    // ③ 키보드 급 큰 변화
    const w2 = makeWorld({ innerHeight: 812, bar: 188, caretDoc: 500, caretHeight: 19, scrollY: 0 });
    w2.focus();
    w2.keyboard(435);
    w2.frame();
    w2.quiet();
    w2.frame();
    w2.scroll(w2.scrollY + 400);
    w2.resetMoved();
    w2.keyboard(0); // 키보드가 눕는다 — 435px 은 8차의 문턱을 넘는다
    w2.keyboard(435); // 다시 선다
    w2.quiet();
    w2.frame();
    ok('키보드 급 큰 변화가 세션을 다시 켠다', w2.moved !== 0, `moved=${w2.moved}`);
  }

  // --- 011 7차 — 키보드가 서는 첫 걸음에서 툴바가 창 맨 위에 붙는다 ------------------------------
  {
    // 그릇이 덜 올라와 툴바가 창 한가운데 앉아 있다: 크롬 60..248, 띠 248..377, 과녁 띠 188..377.
    const w = makeWorld({ innerHeight: 812, bar: 188, chromeDocTop: 100, caretDoc: 320, caretHeight: 19, scrollY: 40 });
    w.focus();
    w.keyboard(435);
    w.frame();
    eq('툴바가 창 맨 위에 붙는다', w.chrome().top, 0);
    eq('캐럿이 그 아래 한 줄 자리에 선다', round(w.caret().top), 188 + 19);
  }

  // --- 000 의 재현 둘이 그대로 고쳐진다 (데스크톱 — 키보드가 없다) -------------------------------
  {
    // ① 툴바에 20px 잠긴 캐럿 위에 글자 하나 → 캐럿 60 → 99, 크롬 80, **19px 여유**.
    const w = makeWorld({ innerHeight: 904, bar: 80, caretDoc: 560, caretHeight: 19, scrollY: 500 });
    w.focus();
    w.resetMoved();
    w.edit();
    w.frame();
    eq('000 재현 ① — 우리가 민 값 −39', w.moved, -39);
    eq('000 재현 ① — 캐럿이 툴바 아래 19px 여유에 선다', [round(w.caret().top), round(w.caret().top - w.chrome().bottom)], [99, 19]);
  }
  {
    // ② 스티키 끝자락 + 전체선택 백스페이스 → 178px 잠긴 캐럿이 107 로, 크롬이 상황 줄로 95 로
    //    자라면 **12px 여유**(000 5차의 그 값이다 — 우리가 잴 때 크롬은 80 이었다).
    const w = makeWorld({ innerHeight: 904, bar: 80, caretDoc: 402, caretHeight: 27, scrollY: 500 });
    w.focus();
    w.resetMoved();
    eq('000 재현 ② — 처음에는 178px 잠겨 있다', round(w.chrome().bottom - w.caret().top), 178);
    w.edit();
    w.frame();
    eq('000 재현 ② — 우리가 민 값 −205', w.moved, -205);
    eq('000 재현 ② — 캐럿 top 107', round(w.caret().top), 107);
    w.bar(95); // 상황 줄이 뒤늦게 선다 (000 의 "남은 흠")
    eq('000 재현 ② — 12px 여유', round(w.caret().top - w.chrome().bottom), 12);
  }

  // --- 겨눔이 빠지면 표식도 내려간다 -------------------------------------------------------------
  {
    const w = makeWorld({ innerHeight: 812, bar: 188, caretDoc: 500, caretHeight: 19, scrollY: 0 });
    w.focus();
    w.keyboard(435);
    w.blur(); // 겨눔이 빠진다 — 예약된 걸음도 함께 걷힌다
    w.resetMoved();
    w.frame();
    w.quiet();
    w.frame();
    eq('겨눔이 빠진 뒤에는 아무것도 안 민다', w.moved, 0);
    w.sticky.unmount();
  }

  // --- 야금야금 ② — 툴바가 글과 함께 굴러가는 자리 (015 2차의 실측 그대로) -----------------------
  //
  // 데모 둘째 편집기, **빈 문단 하나**, 페이지 맨 아래라 툴바가 스티키를 벗어나 글과 함께 굴러간다.
  // 실측: `창=848 · 툴바 아랫변 559.9375 · 캐럿 571.9375..590.9375` → `caret.top − band.top = 16`,
  // 여유(margin)는 캐럿 높이 19 라 `fix = 16 − 19 = −3`. 밀면 툴바도 캐럿도 나란히 3 내려와
  // **사이는 여전히 16** — 고쳐진 것이 하나도 없다. 옛 코드는 이것을 타건마다 되풀이했다
  // (`scrollY 2550 → 2547 → 2544 → …`, 스무 타건에 −60).
  {
    const w = makeWorld({
      innerHeight: 848,
      bar: 80,
      chromeDocTop: 3110,
      sticky: false, // 붙지 않는다 — 글과 함께 굴러간다
      caretDoc: 3206, // 툴바 아랫변보다 16px 아래
      caretHeight: 19,
      scrollY: 2550,
      maxScroll: 2550,
    });
    w.focus();
    w.resetMoved();
    eq('실측 그대로 — 캐럿과 띠 위 변 사이가 16', round(w.caret().top - w.band().top), 16);
    w.edit();
    w.frame();
    eq('첫 타건은 한 번 −3 을 시도한다', w.moved, -3);
    eq('그런데 사이는 그대로 16 — 밀어도 안 고쳐지는 자리다', round(w.caret().top - w.band().top), 16);
    const settled = w.scrollY;
    for (let i = 0; i < 19; i += 1) {
      w.edit();
      w.frame();
    }
    eq('그 뒤 열아홉 타건 — 스크롤이 한 픽셀도 안 움직인다', w.scrollY, settled);
    eq('스무 타건을 통틀어 우리가 민 총량은 −3 하나뿐이다', w.moved, -3);
    // 새 겨눔이 들어오면 기억을 지운다 — 자리가 정말 달라졌을 수 있다.
    w.blur();
    w.focus();
    w.resetMoved();
    w.edit();
    w.frame();
    eq('새 겨눔은 "못 고치는 사이"의 기억을 지운다', w.moved, -3);
  }

  // --- 눈에 안 보이는 보정은 안 한다 (소수 떨림) -------------------------------------------------
  // rect 는 소수다. 띠 안에 거의 다 든 자리에서 1px 짜리 값이 나오는데, 그것을 밀면 고쳐지는 것은
  // 없고 화면만 떨린다. 캐럿 높이 19 · 여유 19 · 사이 18 → `fix = −1` → **안 민다.**
  {
    const w = makeWorld({ innerHeight: 904, bar: 80, caretDoc: 598, caretHeight: 19, scrollY: 500 });
    w.focus();
    w.resetMoved();
    eq('사이가 18 — 여유 19 에 1px 모자란다', round(w.caret().top - w.band().top), 18);
    w.edit();
    w.frame();
    eq('1px 짜리 보정은 안 민다', w.moved, 0);
  }

  // --- 아이폰 되돌아감 — **사파리 자신의 스크롤**을 사람으로 세면 안 된다 (015 3차) -------------
  //
  // 011 의 아이폰 실측: 키보드가 서며 사파리가 **스스로** 599px 을 굴렸다(`sy 2770 → 3369`).
  // `mine` 가림막은 우리가 민 자리만 걸러 내므로 그 599 는 "사람"으로 세어졌고, 015 가
  // "사람이 굴리면 세션을 끝낸다" 로 바꾸자 **키보드가 서는 그 순간 세션이 꺼져 한 번도 못 밀게**
  // 됐다 — 011 이 고쳐 놓은 가림이 그대로 되살아났다. 이제 사람은 **뷰포트가 조용할 때만**이다.
  //
  // 셋을 다 흉내 낸다 (011 4차의 좌표계 실측 그대로):
  //   아이폰 "미는" 사파리  offsetTop=337 · fixed top=−337 → 띠 0..377
  //   아이폰 "깎는" 사파리  offsetTop=0   · fixed top=0    → 띠 0..377
  //   안드로이드            offsetTop=322 · fixed top=0    → 띠 322..784
  {
    const cases = [
      // 캐럿은 셋 다 **키보드 뒤**(보이는 창 아래)에 둔다 — 011 3차가 고친 바로 그 자리다.
      { name: '아이폰 — 창을 아래로 미는 사파리', innerHeight: 714, keyboard: 337, vvOffsetTop: 337, fixedTop: -337, stickTop: 0, chromeDocTop: 0, caretDoc: 1050 },
      { name: '아이폰 — 아래를 깎는 사파리', innerHeight: 714, keyboard: 337, vvOffsetTop: 0, fixedTop: 0, stickTop: 0, chromeDocTop: 0, caretDoc: 1050 },
      { name: '안드로이드', innerHeight: 784, keyboard: 322, vvOffsetTop: 322, fixedTop: 0, stickTop: 322, chromeDocTop: 322, caretDoc: 1450 },
    ];
    for (const c of cases) {
      const w = makeWorld({
        innerHeight: c.innerHeight,
        bar: 188,
        stickTop: c.stickTop,
        vvOffsetTop: c.vvOffsetTop,
        fixedTop: c.fixedTop,
        chromeDocTop: c.chromeDocTop,
        caretDoc: c.caretDoc,
        caretHeight: 19,
        scrollY: 600,
      });
      w.focus();
      w.resetMoved();
      // 키보드가 선다 — 그리고 **그 와중에 브라우저가 스스로 페이지를 굴린다**(사파리의 599px).
      w.keyboard(c.keyboard);
      w.browserScroll(w.scrollY + 599);
      w.frame();
      w.quiet();
      w.frame();
      ok(`${c.name} — 키보드가 서면 우리가 실제로 민다 (rev≠0)`, w.moved !== 0, `moved=${w.moved}`);
      const caret = w.caret();
      const band = w.band();
      ok(
        `${c.name} — 캐럿이 띠 안에 선다`,
        caret.top >= band.top - 1 && caret.bottom <= band.bottom + 1,
        `caret=${round(caret.top)}..${round(caret.bottom)} band=${band.top}..${band.bottom}`,
      );
    }
  }

  // 그래도 **나가려고 굴리면 안 돌아온다** — 뷰포트가 조용해진 뒤의 스크롤은 여전히 사람의 것이다.
  {
    const w = makeWorld({ innerHeight: 714, bar: 188, vvOffsetTop: 337, fixedTop: -337, caretDoc: 520, caretHeight: 19, scrollY: 600 });
    w.focus();
    w.keyboard(337);
    w.frame();
    w.quiet();
    w.frame();
    w.resetMoved();
    w.scroll(w.scrollY + 400); // 뷰포트가 조용해지기를 기다렸다 굴린다 = 사람이다
    w.quiet();
    w.frame();
    w.frame();
    eq('아이폰에서도 — 나가려고 굴리면 한 픽셀도 안 돌아온다', w.moved, 0);
  }

  // --- 늦게 바뀌는 툴바 기하 — 시간이 아니라 사건으로 듣는다 (015 3차) ---------------------------
  //
  // 000 의 "남은 흠" 이 이것이다: 우리가 잴 때 크롬은 80px 이었고, 그 뒤 상황 줄이 서면서 95px
  // 로 자라 캐럿이 도로 잠긴다. `ResizeObserver` 가 **툴바의 키가 달라지는 그 순간**을 문으로 삼는다.
  {
    const w = makeWorld({ innerHeight: 904, bar: 80, caretDoc: 660, caretHeight: 19, scrollY: 500 });
    w.focus();
    ok('겨눔을 쥐면 관찰자가 하나 선다', w.watchers() === 1, `watchers=${w.watchers()}`);
    w.resetMoved();
    eq('처음에는 툴바 아래 80px 여유에 여유롭게 서 있다', round(w.caret().top - w.band().top), 80);
    // 상황 줄이 **뒤늦게** 선다 — 툴바가 80 → 188 로 자라 캐럿이 108px 잠긴다.
    w.growBar(188);
    eq('툴바가 자란 그 순간 캐럿이 잠긴다', round(w.caret().top - w.band().top), -28);
    w.frame();
    ok('관찰자가 한 걸음을 걷는다', w.moved < 0, `moved=${w.moved}`);
    ok('가림이 풀린다 — 캐럿이 툴바 아래로 나온다', w.caret().top >= w.band().top, `gap=${round(w.caret().top - w.band().top)}`);

    // **자리만 달라진 것은 사건이 아니다** — 우리가 굴리면 붙는 크롬의 아랫변이 늘 달라지므로,
    // 그것까지 문으로 삼으면 밀고-깨고-미는 고리가 된다. 키가 그대로면 안 걷는다.
    w.resetMoved();
    w.pokeBar();
    w.frame();
    eq('키가 그대로면 관찰자는 아무것도 안 한다 (떨림 고리 없음)', w.moved, 0);

    // **사람이 굴려 떠난 뒤면 안 켠다** — 015 규칙 1 이 제일 위다.
    w.scroll(w.scrollY + 400);
    w.resetMoved();
    w.growBar(260);
    w.frame();
    eq('사람이 굴려 떠난 뒤에는 툴바가 자라도 안 민다', w.moved, 0);

    // 겨눔이 빠지면 관찰자도 걷는다.
    w.blur();
    eq('겨눔이 빠지면 관찰자가 걷힌다', w.watchers(), 0);
    w.resetMoved();
    w.sticky.unmount();
  }

  // --- 260823_020 — 자리잡은 뒤의 스크롤은 사람의 것이다 ------------------------------------------
  //
  // 주인의 보고: *"조금 긴 글을 쓴 다음에 아래쪽에 스크롤 내려서 선택하려고 스크롤 내리는데
  // **계속 자동으로 교정되면서 무한 루프** 도는데 이건 버그야."* — *"내가 글 다 쓰고 내 글을
  // 검수하기 위해 스크롤 위아래로 이동하는데, 넌 '커서가 거기에 있잖아!!' 하면서 자꾸 스크롤을
  // 되돌려 놓으면 … **손이 느린 사람이면 작성 완료 버튼을 못 누를 거 같은데?**"*
  //
  // 뿌리가 둘이었다. ⓐ `follow()` 가 `vv:resize` 와 `vv:scroll` **둘 다**에 걸려 있는데, 아이폰은
  // **사람이 손가락으로 굴리는 것만으로 `vv:scroll` 을 낸다** — 그래서 015 3차의 "뷰포트가
  // 움직이는 중이면 브라우저다" 판정이 사람이 굴리는 내내 참이 되어, 그 스크롤이 영영 사람의
  // 것으로 안 세어졌다. ⓑ 세션이 "사람이 굴릴 때까지" 켜져 있었으니 ⓐ 아래에서는 **영영** 켜져
  // 있었다. 020 이 둘을 함께 고친다: 자국은 뷰포트의 **키**가 달라진 때만 찍고(규칙 B), 세션은
  // 자리잡기가 끝나면 **스스로 꺼진다**(규칙 A).
  {
    const w = makeWorld({ innerHeight: 812, bar: 188, caretDoc: 500, caretHeight: 19, scrollY: 0 });
    w.focus();
    w.keyboard(435); // 키보드가 선다 — 즉시 걸음 하나와 가라앉은 뒤의 걸음 하나가 걸린다
    w.frame();
    ok('020 — 키보드가 서면 자리는 한 번 잡는다', w.moved !== 0, `moved=${w.moved}`);
    w.resetMoved();
    // 글을 다 쓰고 손이 멎었다 — 키보드가 선 지 한참이다(`VIEW_QUIET` 이 닫힌다).
    // **가라앉음 걸음은 아직 안 걸렸다**: 진짜 `settle` 은 뷰포트 사건이 올 때마다 기다림을
    // 미루는데, 아이폰에서는 **사람이 굴리는 그 손가락이 뷰포트 사건을 낸다**. 그래서 그 걸음은
    // 사람이 굴리는 한복판에 떨어진다 — 무한 루프가 시작되는 자리가 바로 거기다.
    pause(350);
    // 사람이 글을 검수하려고 위아래로 굴린다. 키보드는 **선 그대로**라 뷰포트의 키는 안 변하고,
    // 아이폰은 그 스크롤마다 뷰포트 사건을 낸다 — 여기서는 키 변화 없는 `vv` 사건으로 흉내 낸다.
    // 옛 코드는 이 사건에 자국을 찍어 곧 이어 온 window 스크롤을 **브라우저의 것**으로 셌다.
    for (let i = 0; i < 12; i += 1) {
      w.keyboard(435); // 높이 변화 없는 뷰포트 사건 (아이폰의 `vv:scroll`)
      w.browserScroll(w.scrollY + 60); // 그 사건과 같은 박자에 온 **사람의** 손
    }
    const parked = w.scrollY;
    w.quiet(); // 기다리던 가라앉음 걸음 — 옛 코드는 **여기서** 화면을 되끌어왔다
    w.frame();
    w.frame();
    eq('020 재현 — 사람이 굴리는 내내 우리가 민 총량 0', w.moved, 0);
    eq('020 재현 — 화면은 사람이 둔 그 자리에 그대로 있다', w.scrollY, parked);
    // 그 뒤로도 몇 번을 더 굴리든 마찬가지다 — 세션이 죽었으니 싸울 상대가 없다.
    for (let i = 0; i < 12; i += 1) {
      w.keyboard(435);
      w.browserScroll(w.scrollY + 60);
      w.frame();
      w.quiet();
      w.frame();
    }
    eq('020 재현 — 계속 굴려도 여전히 0 (무한 루프가 없다)', w.moved, 0);
  }

  // --- 자리잡기가 끝나면 보정은 스스로 꺼진다 (규칙 A) --------------------------------------------
  //
  // 015 까지는 세션이 "사람이 굴릴 때까지" 켜져 있었다. 이제는 **가라앉은 뒤의 마지막 걸음**이
  // 세션의 끝이다 — 그 뒤에 툴바가 자라도 우리 일이 아니다. 옛 코드는 여기서 화면을 밀었다.
  {
    const w = makeWorld({ innerHeight: 812, bar: 188, caretDoc: 500, caretHeight: 19, scrollY: 0 });
    w.focus();
    w.keyboard(435);
    w.frame();
    w.quiet();
    w.frame(); // 가라앉은 뒤의 마지막 걸음 — 자리잡기가 여기서 끝난다
    ok('자리잡기가 끝났다 — 캐럿이 띠 안에 선다', w.caret().top >= w.band().top - 1, `gap=${round(w.caret().top - w.band().top)}`);
    w.resetMoved();
    w.growBar(260); // 상황 줄이 뒤늦게 선다 — 툴바가 188 → 260 으로 자란다
    w.frame();
    eq('자리잡기가 끝난 뒤에는 툴바가 자라도 안 민다', w.moved, 0);

    // **그런데 사람이 돌아오면 다시 켜진다** — 타이핑이 그 길이고, 위쪽 가림만 고친다 (015 규칙 2).
    ok('툴바가 자라 캐럿이 잠겨 있다', w.caret().top < w.band().top, `gap=${round(w.caret().top - w.band().top)}`);
    w.edit();
    w.frame();
    ok('편집이 들어오면 세션이 다시 켜진다', w.moved < 0, `moved=${w.moved}`);
    ok('위쪽 가림이 풀린다 — 캐럿이 툴바 아래로 나온다', w.caret().top >= w.band().top, `gap=${round(w.caret().top - w.band().top)}`);
    w.sticky.unmount();
  }
}

// --- 저장 판의 조종 — 탭으로 형식 옮기기 (260823_012) -------------------------------------------
//
// 이 묶음만 **DOM 을 흉내 낸다**. 잡으려는 것이 "키를 누른 뒤 겨눔이 어디 있고 칸의 글자가
// 무엇인가" 라서 순수 함수로는 못 잡는다 — 답이 `activeElement` 와 `input.value` 에 있다.
// 위의 띠 묶음이 창을 흉내 내는 것과 같은 손이다: 판이 실제로 부르는 문만큼만 짓는다.
import { extWidth, openSavePanel } from '../src/ui/save.js';
import { openChoosePanel } from '../src/ui/choose.js';
import type { FileMount, SaveFormat } from '../src/surface/index.js';

{
  type FakeListener = (event: FakeKey) => void;

  interface FakeEl {
    readonly tag: string;
    className: string;
    value: string;
    innerHTML: string;
    textContent: string;
    tabIndex: number;
    parent: FakeEl | null;
    readonly kids: FakeEl[];
    readonly vars: Map<string, string>;
    readonly ownerDocument: FakeDoc;
    readonly style: { setProperty(name: string, value: string): void };
    setAttribute(name: string, value: string): void;
    getAttribute(name: string): string | null;
    append(...kids: FakeEl[]): void;
    addEventListener(type: string, fn: FakeListener): void;
    removeEventListener(type: string, fn: FakeListener): void;
    remove(): void;
    contains(other: FakeEl): boolean;
    focus(): void;
  }

  interface FakeDoc {
    activeElement: FakeEl | null;
    body: FakeEl;
    readonly caps: Map<string, FakeListener[]>;
    createElement(tag: string): FakeEl;
    addEventListener(type: string, fn: FakeListener): void;
    removeEventListener(type: string, fn: FakeListener): void;
  }

  // 키 하나 — 우리가 보려는 것은 **막혔는가**(preventDefault)와 어디까지 갔는가뿐이다.
  interface FakeKey {
    readonly key: string;
    readonly shiftKey: boolean;
    prevented: boolean;
    stopped: boolean;
    preventDefault(): void;
    stopPropagation(): void;
  }

  const push = (map: Map<string, FakeListener[]>, type: string, fn: FakeListener): void => {
    map.set(type, [...(map.get(type) ?? []), fn]);
  };

  const makeEl = (tag: string, doc: FakeDoc): FakeEl => {
    const attrs = new Map<string, string>();
    const vars = new Map<string, string>();
    const listeners = new Map<string, FakeListener[]>();
    const kids: FakeEl[] = [];
    const el: FakeEl = {
      tag,
      className: '',
      value: '',
      innerHTML: '',
      textContent: '',
      tabIndex: 0,
      parent: null,
      kids,
      vars,
      ownerDocument: doc,
      style: { setProperty: (name, value) => void vars.set(name, value) },
      setAttribute: (name, value) => void attrs.set(name, value),
      getAttribute: (name) => attrs.get(name) ?? null,
      append: (...more) => {
        for (const kid of more) {
          kid.parent = el;
          kids.push(kid);
        }
      },
      addEventListener: (type, fn) => push(listeners, type, fn),
      removeEventListener: (type, fn) => {
        listeners.set(type, (listeners.get(type) ?? []).filter((one) => one !== fn));
      },
      remove: () => {
        const from = el.parent;
        if (!from) return;
        const at = from.kids.indexOf(el);
        if (at >= 0) from.kids.splice(at, 1);
        el.parent = null;
      },
      contains: (other) => {
        for (let node: FakeEl | null = other; node; node = node.parent) if (node === el) return true;
        return false;
      },
      focus: () => void (doc.activeElement = el),
      listenersOf: (type: string) => listeners.get(type) ?? [],
    } as FakeEl & { listenersOf(type: string): FakeListener[] };
    return el;
  };

  const listenersOf = (el: FakeEl, type: string): FakeListener[] =>
    (el as FakeEl & { listenersOf(t: string): FakeListener[] }).listenersOf(type);

  const makeDoc = (): FakeDoc => {
    const caps = new Map<string, FakeListener[]>();
    const doc = {
      activeElement: null as FakeEl | null,
      caps,
      createElement: (tag: string) => makeEl(tag, doc),
      addEventListener: (type: string, fn: FakeListener) => push(caps, type, fn),
      removeEventListener: (type: string, fn: FakeListener) => {
        caps.set(type, (caps.get(type) ?? []).filter((one) => one !== fn));
      },
    } as FakeDoc;
    doc.body = makeEl('body', doc);
    return doc;
  };

  // 키 하나를 겨눈 자리에 떨어뜨린다 — 문서의 캡처(덮개의 Escape)가 먼저, 그다음 거품이다.
  const press = (doc: FakeDoc, target: FakeEl, key: string, shiftKey = false): FakeKey => {
    const event: FakeKey = {
      key,
      shiftKey,
      prevented: false,
      stopped: false,
      preventDefault() {
        this.prevented = true;
      },
      stopPropagation() {
        this.stopped = true;
      },
    };
    for (const fn of doc.caps.get('keydown') ?? []) fn(event);
    for (let node: FakeEl | null = target; node && !event.stopped; node = node.parent) {
      for (const fn of listenersOf(node, 'keydown')) fn(event);
    }
    return event;
  };

  const find = (root: FakeEl, cls: string): FakeEl[] => {
    const out: FakeEl[] = [];
    const walk = (el: FakeEl): void => {
      if (el.className.split(' ').includes(cls)) out.push(el);
      for (const kid of el.kids) walk(kid);
    };
    walk(root);
    return out;
  };

  const three: readonly SaveFormat[] = [
    { id: 'nabi', label: 'Nabi', extension: '.nabi', lossy: false },
    { id: 'html', label: 'HTML', extension: '.nhtml', lossy: false },
    { id: 'markdown', label: 'Markdown', extension: '.md', lossy: true },
  ];

  const openSave = (formats: readonly SaveFormat[] = three) => {
    const doc = makeDoc();
    const surface = makeEl('div', doc);
    const saved: { id: string; name: string }[] = [];
    const file = {
      save: () => undefined,
      saveAs: (id: string, name?: string) => void saved.push({ id, name: name ?? '' }),
      formats: () => formats,
      open: () => Promise.resolve(false),
      unmount: () => undefined,
    };
    const panel = openSavePanel({
      file: file as unknown as FileMount,
      surface: surface as unknown as HTMLElement,
      locale: 'ko',
    });
    const card = panel.card as unknown as FakeEl;
    const rows = find(card, 'nabi-save-row');
    return {
      doc,
      card,
      input: find(card, 'nabi-input')[0],
      ext: find(card, 'nabi-save-ext')[0],
      rows,
      saved,
      aimed: (): number => rows.findIndex((row) => row.getAttribute('aria-selected') === 'true'),
    };
  };

  // --- 이름을 치던 손 그대로 형식을 훑는다 -------------------------------------------------------
  // 주인 지시 2026-08-23: "파일 이름 쓰는 중에 탭키/시프트탭키 누르면 그 키가 씹히고 (아무 일도
  // 안 일어나고) 저장 확장자 선택 아이콘만 변해야 해."
  {
    const w = openSave();
    eq('저장 판: 열릴 때 겨눔은 첫 줄 가운데다', w.aimed(), 1);
    eq('저장 판: 그 겨눔의 표식이 이름 칸 옆에 선다', w.ext.textContent, '.nhtml');

    w.input.focus();
    w.input.value = '2026-08-23 메모';
    const typed = w.input.value;

    const tab = press(w.doc, w.input, 'Tab');
    ok('탭 ①: 기본 동작이 막힌다 — 겨눔이 판 밖으로 안 샌다', tab.prevented);
    ok('탭 ②: 겨눔은 이름 칸에서 한 발도 안 움직인다', w.doc.activeElement === w.input);
    eq('탭 ③: 칸의 글자가 그대로다 — 탭 문자도 안 들어간다', w.input.value, typed);
    eq('탭 ④: 눈에 보이는 변화는 선택 표시 하나다', w.aimed(), 2);
    eq('탭 ④: 확장자 표식이 그 겨눔을 따라간다', w.ext.textContent, '.md');

    press(w.doc, w.input, 'Tab');
    eq('탭은 끝에서 감긴다 — 셋째 다음은 첫째다', w.aimed(), 0);
    eq('감긴 자리의 표식도 따라간다', w.ext.textContent, '.nabi');

    const back = press(w.doc, w.input, 'Tab', true);
    ok('시프트탭도 막힌다', back.prevented);
    eq('시프트탭은 거꾸로 감긴다 — 첫째 앞은 셋째다', w.aimed(), 2);
    eq('시프트탭의 표식도 따라간다', w.ext.textContent, '.md');
    eq('탭을 네 번 누르는 동안 칸의 글자는 한 글자도 안 바뀌었다', w.input.value, typed);
    ok('겨눔도 내내 이름 칸이다', w.doc.activeElement === w.input);
  }

  // --- 저장 판에서 방향키는 우리 것이 아니다 -----------------------------------------------------
  // 주인 지시 2026-08-23: "저장에서 방향키는 제거해 줘 … 진짜 파일 이름 고치려고 움직이는 키와
  // 구분이 안 돼." 이름 칸에서 ←/→ 는 캐럿의 키다 — 가로채면 이름을 고칠 길이 사라진다.
  {
    const w = openSave();
    w.input.focus();
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']) {
      const event = press(w.doc, w.input, key);
      ok(`저장 판: 이름 칸의 ${key} 는 안 막힌다 (글 편집 키로 흘러간다)`, !event.prevented);
    }
    eq('저장 판: 방향키를 넷 다 눌러도 겨눈 형식이 그대로다', w.aimed(), 1);
    eq('저장 판: 표식도 안 흔들린다', w.ext.textContent, '.nhtml');

    // 카드에 겨눔이 있어도 마찬가지다 — 이 판은 방향키를 아예 안 듣는다.
    const onCard = press(w.doc, w.card, 'ArrowRight');
    ok('저장 판: 카드에서 눌러도 방향키는 안 막힌다', !onCard.prevented);
    eq('저장 판: 카드의 방향키도 형식을 안 옮긴다', w.aimed(), 1);
  }

  // --- 나머지 길은 그대로다 ----------------------------------------------------------------------
  {
    const w = openSave();
    w.input.focus();
    w.input.value = '보고서';
    press(w.doc, w.input, 'Tab');
    const enter = press(w.doc, w.input, 'Enter');
    ok('엔터는 막힌다 (줄바꿈이 안 들어간다)', enter.prevented);
    eq('엔터는 지금 겨눈 형식으로, 칸의 이름으로 저장한다', w.saved, [{ id: 'markdown', name: '보고서' }]);

    const again = openSave();
    press(again.doc, again.card, 'Escape');
    eq('Escape 는 판을 걷어낸다', again.doc.body.kids.length, 0);
    eq('그때는 아무것도 안 저장한다', again.saved, []);
  }

  // --- 카드에 겨눔이 있어도 탭은 같게 걷는다 -----------------------------------------------------
  // 칸은 `tabindex="-1"` 이라 브라우저의 탭 순서에 안 선다 — 겨눔이 형식 단추로 옮겨 가는 일
  // 자체가 없다. 그래서 "형식 단추에서 눌렀을 때" 라는 자리는 이 판에 없고, 겨눔이 설 수 있는
  // 자리는 이름 칸과 카드 둘뿐이라 둘 다 같은 손으로 걷는지만 본다.
  {
    const w = openSave();
    eq('판이 열리면 격자 칸은 탭 순서에 안 선다', w.rows.map((row) => row.getAttribute('tabindex')), ['-1', '-1', '-1']);
    press(w.doc, w.card, 'Tab');
    eq('카드에서 누른 탭도 형식을 옮긴다', w.aimed(), 2);
    press(w.doc, w.card, 'Tab', true);
    eq('카드에서 누른 시프트탭도 거꾸로 옮긴다', w.aimed(), 1);
  }

  // --- 확장자 표식의 폭은 안 변한다 --------------------------------------------------------------
  // 주인 지시 2026-08-23: "파일 이름 적는 거 옆에 .확장자 그거 크기 좀 가장 넓은 거 기준으로
  // 고정해 줘. 입력 칸이 동적으로 변하는 게 보기 불편해."
  {
    eq('폭은 가장 긴 확장자의 글자 수다 (.nhtml = 6)', extWidth(three), 6);
    eq('호스트가 끼운 긴 형식도 그 셈에 든다', extWidth([...three, { id: 'docx', label: 'Word', extension: '.docx', lossy: true }]), 6);
    eq('더 긴 것이 들어오면 자리도 그만큼 넓어진다', extWidth([...three, { id: 'x', label: 'X', extension: '.longer', lossy: false }]), 7);
    eq('형식이 하나도 없으면 기본값(.nabi)만큼이다', extWidth([]), 5);

    const w = openSave();
    eq('판은 그 글자 수를 시트에 건넨다', w.ext.vars.get('--nabi-save-ext-len'), '6');
    const before = w.ext.vars.get('--nabi-save-ext-len');
    press(w.doc, w.input, 'Tab');
    press(w.doc, w.input, 'Tab');
    eq('겨눔이 옮겨 다녀도 그 값은 안 변한다 — 이름 칸이 안 흔들린다', w.ext.vars.get('--nabi-save-ext-len'), before);
    eq('바뀌는 것은 글자뿐이다 (.nhtml → .md → .nabi)', w.ext.textContent, '.nabi');
  }

  // --- 붙여넣기 판은 옛 길 그대로다 --------------------------------------------------------------
  // 같은 부품(`parts/grid.ts`)을 쓰되 **조종 키는 판마다 다르다**: 저장 판은 글 칸이 있어 Tab,
  // 붙여넣기 판은 글 칸이 없어 방향키가 정본이다. 여기 Tab 은 브라우저의 것 그대로 둔다 —
  // 이 판에서 Tab 이 할 일을 새로 만들면, 그것이 곧 방향키와 겹치는 둘째 길이 된다.
  {
    const doc = makeDoc();
    const surface = makeEl('div', doc);
    void openChoosePanel({
      question: '무엇으로 붙일까',
      options: [{ label: 'HTML' }, { label: 'MD' }, { label: '글' }],
      surface: surface as unknown as HTMLElement,
      locale: 'ko',
    });
    const card = find(doc.body, 'nabi-choose')[0];
    const rows = find(card, 'nabi-choose-row');
    const aimed = (): number => rows.findIndex((row) => row.getAttribute('aria-selected') === 'true');
    eq('붙여넣기 판: 첫 겨눔은 그대로 첫 줄 가운데다', aimed(), 1);
    const right = press(doc, card, 'ArrowRight');
    ok('붙여넣기 판: 방향키는 여전히 우리 것이다', right.prevented);
    eq('붙여넣기 판: 방향키가 겨눔을 옮긴다', aimed(), 2);
    press(doc, card, 'ArrowRight');
    eq('붙여넣기 판: 감기는 것도 그대로다', aimed(), 0);
    const tab = press(doc, card, 'Tab');
    ok('붙여넣기 판: 탭은 브라우저의 것이다 — 우리가 안 막는다', !tab.prevented);
    eq('붙여넣기 판: 탭은 겨눔을 안 건드린다', aimed(), 0);
  }
}

done('ui');
