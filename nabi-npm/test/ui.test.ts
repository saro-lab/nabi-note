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
import { createNabiWith, makeRegistry, type Registry, type WingField } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { makeImageWing } from '../src/wings/img/img.js';
import { safeUrl } from '../src/html/index.js';
import { videoId, youtubeId } from '../src/html/url.js';
import { DICTIONARY, LOCALES, localeOf, makeTranslator, translate } from '../src/locale/index.js';
import {
  BAND_MARGIN,
  CORE_CSS,
  PANEL_EDGE,
  PANEL_GAP,
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
  pressedOf,
  pressedValue,
  promptValid,
  reachAt,
  sheetKey,
  stackValue,
  toastOrder,
  toastOverflow,
  visibleAt,
  type PanelBox,
  type PressEnv,
  type PromptField,
} from '../src/ui/index.js';
import { silentAsk } from '../src/editor/index.js';
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
}

// --- 5. CSS — 접기가 글 단위다 -------------------------------------------------------------------

{
  const sheets = collectSheets(registry);
  ok('CSS: 코어 시트가 맨 앞이다', sheets[0] === CORE_CSS.trim());
  ok('CSS: 같은 글은 한 번만 실린다', new Set(sheets).size === sheets.length);

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

  // 빈 편집기의 안내글 — **모양은 시트가, 말은 변수가.** 겨눔이 "받침 br 하나만 든 글 문단
  // 하나"라야 글자가 한 자 들어오는 순간 저절로 사라진다(셈도 상태도 없다는 그 규칙).
  {
    const mark = '.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before';
    const rule = CORE_CSS.slice(CORE_CSS.indexOf(mark));
    const body = rule.slice(0, rule.indexOf('}'));
    ok('CSS: 안내글은 빈 블록 하나만 겨눈다', CORE_CSS.includes(mark));
    // 전체선택 삭제가 남기는 빈 제목 줄도 "아무것도 안 쓴" 자리다 — 제목은 문단의 속성이다.
    ok('CSS: 빈 제목 줄에도 안내글이 선다', /:is\(p, h1, h2, h3, h4, h5, h6\)/.test(mark));
    ok('CSS: 안내글의 말은 변수로 온다 — 없으면 안 뜬다', /content:\s*var\(--nabi-placeholder,\s*""\)/.test(body));
    ok('CSS: 안내글은 흐름 밖에 선다 — 캐럿이 안 밀린다', /position:\s*absolute/.test(body));
    ok('CSS: 안내글은 손을 안 받는다', /pointer-events:\s*none/.test(body));
    // 논리 좌표여야 RTL(아랍어·우르두)에서 오른쪽에서 시작한다 (098·099 의 그 규칙).
    ok('CSS: 안내글의 자리는 논리 좌표다', /inset-inline:/.test(body) && !/\bleft:/.test(body));
    // 자리를 정하는 것은 **글의 방향**이지 그 줄의 정렬이 아니다 — 가운데 정렬한 빈 줄에서
    // 안내글까지 가운데로 가면 쓴 글처럼 보인다 (주인 신고 2026-08-20).
    ok('CSS: 안내글은 줄의 정렬을 안 따라간다', /text-align:\s*start/.test(body));
    // 여러 줄짜리 안내글 — surface 가 줄바꿈을 CSS 의 \A 로 적어 보내므로 시트가 받아야 선다.
    ok('CSS: 안내글의 줄바꿈이 살아 있다', /white-space:\s*pre-line/.test(body));
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

  // 다섯 판이 **한 문**을 지난다 — 링크·표·이미지·유튜브·파일저장. 판을 여는 선언은 `prompt`
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
  eq('판: 파일저장은 이름 상자로 연다', doorOf('save'), 'prompt');
  eq('판: 표는 격자로 연다', doorOf('table'), 'grid');

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

  // --- 저장 — 형식 검사가 **없는** 것이 답이다 ---------------------------------------------------
  // `mountFile` 의 save 는 비지 않은 글자면 무엇이든 받아 확장자만 붙인다. 그러니 "빈 것만
  // 막는다" 가 커맨드와 같은 답이고, 그 일은 필수 칸이 이미 한다.
  ok('잠금: 저장 이름 칸에는 형식 검사가 없다', askFields('save').every((field) => field.validate === undefined));
  ok('잠금: 저장은 이름이 있으면 열린다', opens('save', { name: '2026-08-18 메모' }));
  ok('잠금: 저장은 빈칸뿐이면 잠긴다', !opens('save', { name: '   ' }));

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

done('ui');
