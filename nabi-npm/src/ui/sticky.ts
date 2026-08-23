// 스티키·모바일 — old 040 의 띠 규칙 번역이다. 산수는 `band.ts` 에 있고 여기는 **재는 일**만 한다.
// surface 가 아니라 ui 의 부속인 까닭: 띠의 위 변이 우리가 그린 크롬이고, 크롬은 ui 의 것이다.
//
// 하는 일 셋 (040 §3):
//   1. 두 변을 **매번 잰다** — 상황 줄은 떴다 사라지고 키보드도 그렇다. CSS 변수로 셈하지 않는다
//   2. **가라앉기를 기다린다** — 움직이는 중에 잰 값은 곧 틀릴 값이다 (settle 부품 한 벌)
//   3. iOS 는 **브라우저에게 돌려준다** — 아래 변을 얻을 수 없으므로 우리 셈을 아예 안 하고
//      선택을 뺐다 도로 넣어(`reAim`) WebKit 자신의 리빌을 부른다 (040 §3.2)
//
// 키보드 높이는 시트가 쓰라고 CSS 변수로도 내준다 — 붙는 크롬이 키보드에 밀린 만큼 되돌린다.
import type { Nabi } from '../editor/index.js';
import {
  KEYBOARD_STEPS,
  REVEAL_STEPS,
  bandFix,
  bandOf,
  isIos,
  placeWalk,
  revealFix,
  revealWalk,
  underWalk,
  type Band,
  type Rect,
} from './band.js';
import { watchSettle, type Settle } from './parts/settle.js';

export const KEYBOARD_TOP_VAR = '--nabi-keyboard-top';
export const KEYBOARD_BOTTOM_VAR = '--nabi-keyboard-bottom';
// 붙는 크롬의 **실측 높이**. 시트의 `scroll-margin-block-start` 가 쓰던 어림값(3.5rem = 한 줄)이
// 두 줄 + 상황 줄인 실기에서 크게 어긋났다 — 011 실측 2 에서 56px 어림에 실제 188px.
const BAR_HEIGHT_VAR = '--nabi-bar-height';

// --- 뷰포트 문의 문턱 (011 8차) ------------------------------------------------------------------
// **주소줄이 접혔다 펴지는 것은 키보드가 아니다.** 손으로 굴리면 그것이 수십 번 오가고, 그때마다
// `vv.height` 가 수십 px 씩 바뀐다. 문을 그 변화에 열어 두면 **사람이 굴리는 내내 우리가 화면을
// 민다** — 주인이 말한 "스크롤이 떨리는 느낌" 이 그것이다(캡처의 `styled=18 called=0/13`).
// 그래서 문은 **키보드 급의 변화**에만 연다. 주소줄은 수십 px, 키보드는 수백 px 다.
const KEYBOARD_JUMP = 120; // px — 이보다 작은 변화는 키보드가 아니다
const KEYBOARD_RATIO = 0.15; // 창 높이의 이만큼 — 작은 화면에서 120px 이 너무 클 때를 위해 함께 본다
// 손이 굴린 뒤 이만큼은 **아무것도 안 민다.** 움직이는 화면을 뺏는 것이 떨림의 본체다.
// 015 에서 뜻이 하나 늘었다: 이 창은 **미루는 창**이면서 동시에 사람 스크롤이 왔다는 표시고,
// 사람 스크롤은 그 자리에서 **겨눔 세션을 끝낸다**(아래 `armed`). 미룸은 창이 닫히면 풀리지만
// 세션은 새 사건(겨눔·키보드 급 변화)이 오기 전까지 다시 안 열린다.
const USER_QUIET = 250;

// --- 사람 스크롤의 정의 (015 3차) --------------------------------------------------------------
// **브라우저 자신도 페이지를 굴린다.** 011 의 아이폰 실측이 그 자리다 — 키보드가 서는 동안
// 사파리가 스스로 599px 을 굴렸고(`t=R+106 sy=2770 → 3369`), 그 뒤에도 한 번 더 옮겼다.
// `mine` 가림막은 **우리가 민 자리**만 걸러 내므로 그 599px 은 고스란히 "사람"으로 세어졌다.
// 015 가 "사람 스크롤이면 세션을 끝낸다" 로 바꾸자, 아이폰에서는 **키보드가 서는 그 순간
// 세션이 꺼져 우리가 한 번도 못 밀게 됐다** — 011 이 고쳐 놓은 가림이 그대로 되살아났다.
//
// 그래서 사람의 정의를 좁힌다: **뷰포트가 조용한데 온 스크롤만 사람의 것이다.** 시각 뷰포트가
// 방금 움직였다면 화면을 옮기고 있는 것은 브라우저이고, 그때가 바로 우리가 일해야 하는 순간이다.
// 창은 `settle` 이 "가라앉았다" 를 재는 자와 같다(300ms) — 키보드가 서는 내내 `vv:resize`·
// `vv:scroll` 이 이어져 이 창이 함께 밀리므로, 애니메이션 전체가 한 덩어리로 걸러진다.
// 015 규칙 1(**나가려고 굴리면 안 돌아온다**)은 그대로 산다: 그때는 키보드가 이미 서 있고
// 뷰포트가 조용하다.
const VIEW_QUIET = 300;

// --- 눈에 안 보이는 보정은 보정이 아니다 (015 2차) ----------------------------------------------
// 캐럿·툴바의 `getBoundingClientRect()` 는 **소수**다(실측: 571.9375 · 559.9375). 그래서 띠 안에
// 거의 다 든 자리에서도 한두 픽셀짜리 값이 늘 나온다. 그 값을 밀면 고쳐지는 것은 없고 화면만
// 떨린다. **띠 안이면 0 이다**(`band.ts` 의 규칙 절반)를 소수 세계로 옮긴 문턱이 이것이다.
const TINY_FIX = 1.5;
// 두 자리가 "같은 자리"인가 — 소수 흔들림(0.5px)은 같은 것으로 본다.
const same = (a: number, b: number): boolean => Math.abs(a - b) < 1;

export interface StickyOptions {
  // `.nabi` 뿌리 — CSS 변수가 여기 적힌다.
  readonly root: HTMLElement;
  // 편집 표면 — 캐럿 사각형을 여기서 잰다.
  readonly surface: HTMLElement;
  // 띠의 위 변을 이루는 붙는 크롬. 없으면 창의 위가 위 변이다.
  readonly chrome?: HTMLElement;
  readonly settle?: Settle;
  // 편집기 — 주면 **편집 뒤에 스스로 한 번 겨눈다**(아래 "편집 뒤 한 걸음"). 안 주면 예전
  // 그대로다: 겨눔은 호스트가 `aim()` 을 부를 때만 돈다.
  readonly nabi?: Nabi;
  // iOS 갈래를 끈다 — 모든 플랫폼이 §1 의 띠 규칙 하나로 돈다 (040 의 "되돌리고 싶으면").
  readonly iosBranch?: boolean;
}

export interface Sticky {
  // 지금 캐럿을 띠 안으로 — 툴바 동작 뒤에 부르는 그 문 하나.
  aim(): void;
  unmount(): void;
}

export function mountSticky(options: StickyOptions): Sticky {
  const owner = options.root.ownerDocument;
  const view = owner.defaultView;
  const settle = options.settle ?? watchSettle(owner, { surface: options.surface });
  const ownSettle = options.settle === undefined;
  const ios =
    options.iosBranch !== false &&
    view !== null &&
    isIos(view.navigator.userAgent, view.navigator.platform ?? '', view.navigator.maxTouchPoints ?? 0);

  // --- 키보드 자리 → CSS 변수 -----------------------------------------------------------------
  // 0 이면 변수를 **지운다** — "키보드 없음"과 "높이 0 인 키보드"가 같은 상태여야 시트의 기본이 산다.
  const writeVar = (name: string, px: number): void => {
    const value = Math.round(px);
    if (value <= 0) options.root.style.removeProperty(name);
    else options.root.style.setProperty(name, `${value}px`);
  };

  // --- 좌표계를 재는 자 (011 4차) ----------------------------------------------------------------
  //
  // **`getBoundingClientRect()` 의 0 이 어디인지가 플랫폼마다 다르다.** 실측이 그것을 못 박았다:
  // `position:fixed; top:0` 인 표식의 client top 이 **iOS 는 −337**(rect 가 **보이는 창** 기준),
  // **안드로이드는 0**(rect 가 **레이아웃 창** 기준)이다. 000 6차가 "안드로이드는 우연히 맞고
  // iOS 가 어긋난다" 고 적은 것은 **정반대**였다.
  //
  // 그래서 보이는 창을 rect 와 같은 좌표계로 옮기는 식이 이것이다:
  //
  //     띠의 위   = 표식의 client top + visualViewport.offsetTop
  //     띠의 아래 = 그 위 + visualViewport.height
  //
  //   iOS  : −337 + 337 = 0   → 0..377    (지금 값과 **똑같다** — 아이폰은 안 건드린다)
  //   안드 :    0 + 322 = 322 → 322..784  (지금은 0..462 로 봐서 띠가 `510..462` 로 뒤집혔다)
  //   데스크: 0 +   0 = 0     → 0..창높이 (한 값도 안 달라진다)
  //
  // 띠가 뒤집히면 `bandFix` 는 첫 줄(`height <= 0`)에서 0 을 답한다 — **눈이 먼다.** 안드로이드에서
  // 문이 열렸는데도 `rev=0` 이던 까닭이 이것이다.
  // **표식은 페이지에 상주시키지 않는다** (011 5차). iOS 는 고정 요소가 있는 페이지를 다르게
  // 다루는 것으로 알려져 있고, 실제로 표식을 넣은 라운드에서 사파리가 `offsetTop` 을 337 → 0 으로
  // 바꿔 굴었다 — **재는 물건이 재는 것을 바꾼** 셈이다(이 문서에서 두 번째다).
  // 그래서 `offsetTop > 0` 일 때만 — **두 좌표계가 갈리는 그때만** — 한 프레임 안에서 만들었다
  // 곧바로 걷는다. `offsetTop === 0` 이면 두 좌표계가 어차피 같아 잴 것이 없다(0 을 답한다).
  const probeTop = (offsetTop: number): number => {
    if (!view || offsetTop <= 0) return 0;
    const probe = owner.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:1px;block-size:1px;' +
      'opacity:0;pointer-events:none';
    owner.body.append(probe);
    const top = probe.getBoundingClientRect().top;
    probe.remove();
    return top;
  };

  // 방금 내준 값들의 거울 — **바뀐 때만** 일하려고 둔다. 굴릴 때마다 도는 일이 없어야 한다.
  let barHeight = 0;
  let seenTop = 0;
  let seenHeight = 0;
  let sighted = false; // 이 겨눔에서 뷰포트를 한 번이라도 봤나
  let ruler = 0; // 좌표계의 0 — 키보드 자리가 바뀔 때만 다시 잰다(스크롤마다 재지 않는다)

  // --- 손이 굴리는 중인가 (011 8차) -------------------------------------------------------------
  // **우리가 민 것과 사람이 민 것을 갈라야 한다.** 우리가 민 뒤의 `scrollY` 를 적어 두고, 그것과
  // 다른 자리에서 온 스크롤만 사람의 것으로 센다. 애매하면 **사람 쪽으로 친다** — 안 미는 쪽이
  // 언제나 안전하다.
  let userAt = 0;
  let mine = -1;
  let viewAt = 0; // 시각 뷰포트가 마지막으로 움직인 때 — `follow()` 가 찍는다
  // 브라우저가 화면을 옮기는 중인가 (015 3차). 참이면 지금 온 스크롤은 사람 것이 아니다.
  const viewMoving = (): boolean => Date.now() - viewAt < VIEW_QUIET;
  const onScroll = (): void => {
    if (view && mine >= 0 && Math.abs(view.scrollY - mine) <= 1) return; // 방금 우리가 민 그 자리
    // **뷰포트가 움직이는 중이면 브라우저가 민 것이다** (015 3차, 위 `VIEW_QUIET`). 아이폰에서
    // 키보드가 서며 사파리가 스스로 굴리는 수백 px 이 여기서 걸러진다 — 그것을 사람으로 세면
    // 정작 우리가 맞춰야 할 그 순간에 세션이 꺼진다.
    if (viewMoving()) return;
    userAt = Date.now();
    // **사람이 굴리면 푼다** (015 규칙 1). 이 겨눔 세션의 아래 변·제자리 보정은 여기서 끝나고,
    // 기다리던 가라앉음 걸음도 이 표식 하나로 함께 취소된다(`afterQuiet` 이 이것을 본다).
    //
    // **예외를 두지 않는다.** "캐럿이 툴바에 가려져 있으면 그때만은 위 변 보정을 계속 돌리자"
    // 는 생각을 주인이 바로잡았다 — *"두 번째 칸에서 글을 쓰다 그만 쓰고 나가려고 스크롤을
    // 올렸는데 갑자기 글쓰기 창으로 돌아오면 그게 버그지."* 사람이 굴려 떠난 뒤에는 캐럿이
    // 보이든 말든 우리 일이 아니다. 캐럿을 다시 봐야 하는 순간은 **사람이 돌아올 때**이고,
    // 돌아오는 길은 탭(새 겨눔)이거나 타이핑(편집)이라 둘 다 아래 `armed` 를 다시 세운다.
    armed = false;
  };
  const scrolling = (): boolean => Date.now() - userAt < USER_QUIET;

  // --- 겨눔 세션의 표식 (015) --------------------------------------------------------------------
  // **사람이 굴려 떠나지 않았다 = 우리가 화면을 밀어도 된다.**
  //
  //   선다   ① 겨눔이 새로 들어올 때(`start`) ② 문서가 바뀔 때(편집 문 — 사람이 돌아왔다)
  //          ③ 키보드 급 큰 변화가 올 때(`follow` 의 8차 문턱을 넘은 자리 — 주소줄이 접혔다
  //             펴지는 정도로는 안 선다)
  //   내려간다 ① **뷰포트가 조용한데** 사람이 굴린 그 순간(`onScroll`) ② `stop()`
  //
  // 3차에서 "세션당 한 번"의 뜻을 고쳤다. 예전에는 가라앉음 걸음 하나로 표식을 내렸는데,
  // 아이폰에서는 창이 **여러 번** 움직인다(011 실측: `377/377 → 377/142 → 377/31`) — 한 번으로는
  // 모자라 캐럿이 키보드 뒤에 잠긴 채 남았다. 이제 "한 번"은 **사람이 굴리기 전까지**다.
  // 타이핑이 야금야금 미는 것과는 다른 문이다 — 그것은 편집 문이고 규칙 2 가 이미 막았다.
  let armed = false;

  // --- 야금야금 빗장 — "나아지지 않으면 멎는다"를 **세션이 기억한다** (015 2차) -----------------
  //
  // `revealWalk` 의 그 빗장(`Math.abs(delta) >= last`)은 **한 걸음 안에서만** 돈다 — `last` 가
  // 걸음마다 `Infinity` 로 새로 열린다. 그래서 **타건마다 새 걸음이 열려 첫 밀기 한 번은 늘
  // 빠져나간다.** 실측이 그 자리다(데모 둘째 편집기, 빈 문단 하나, 툴바가 안 붙은 자리):
  //
  //   타건마다  fix −3 · 청한 값 −3 · 실제 −3   scrollY 2535 → 2532 → 2529 → 2526 → …
  //   그런데   caret.top − band.top 은 **내내 16 그대로**
  //
  // 툴바가 스티키를 벗어나 **글과 함께 굴러가는** 자리라 캐럿과 툴바가 나란히 움직인다 — 우리는
  // 화면만 옮기고 관계는 하나도 안 고쳤다. `band.ts:89` 가 적어 둔 그 자리가 그대로 실현됐다.
  //
  // 그래서 **민 뒤에 사이가 그대로면 그 사이를 적어 둔다.** 다음 편집에서 같은 사이가 또 나오면
  // 안 민다. 새 겨눔·키보드 급 변화가 이 기억을 지운다 — 그때는 자리가 정말 달라진 것이다.
  let stuck = Number.NaN;

  const follow = (): void => {
    if (!view) return;
    // **뷰포트가 방금 움직였다** — 이 자국이 사람 스크롤과 브라우저 스크롤을 가른다 (015 3차).
    // 문턱(`big`)을 넘든 안 넘든 찍는다: 주소줄이 접히는 정도의 작은 움직임에도 브라우저는
    // 페이지를 함께 굴리고, 그것도 사람이 민 것은 아니다.
    viewAt = Date.now();
    const visual = view.visualViewport;
    const top = visual ? visual.offsetTop : 0;
    const bottom = visual ? Math.max(0, view.innerHeight - (visual.offsetTop + visual.height)) : 0;

    // CSS 변수는 **늘** 따라간다 — 시트가 툴바를 그 값으로 앉히므로 한 프레임도 늦으면 안 된다.
    writeVar(KEYBOARD_TOP_VAR, top);
    writeVar(KEYBOARD_BOTTOM_VAR, bottom);

    // 크롬의 실측 높이도 함께 내준다 — 브라우저 **자신의** 리빌이 보는 여백이 어림값이 아니게 된다.
    const height = options.chrome ? Math.round(options.chrome.getBoundingClientRect().height) : 0;
    if (height !== barHeight) {
      barHeight = height;
      writeVar(BAR_HEIGHT_VAR, height);
    }

    // --- 문 -------------------------------------------------------------------------------------
    // **툴바가 옮겨 앉은 것도 캐럿을 가릴 수 있는 사건이다** (011 실측 2, iOS 18). 사파리가 캐럿을
    // 좋은 자리에 굴려 놓은 **뒤에** 이 함수가 툴바를 창 맨 위로 옮기면 그 툴바가 캐럿을 덮는다 —
    // 우리가 만든 가림이라 브라우저는 고칠 생각이 없다. 그래서 자리를 옮긴 바로 뒤에 걸음을 건다.
    //
    // 다만 **문턱이 있다**(8차). 주소줄이 접혔다 펴지는 것은 키보드가 아니다 — 손으로 굴리는
    // 내내 수십 px 씩 오간다. 그 변화에 문을 열어 두면 사람이 굴리는 동안 우리가 화면을 밀어
    // **떨린다.** 키보드는 수백 px 다. 그 둘을 키로 가른다.
    const seeing = Math.round(visual ? visual.height : view.innerHeight);
    const jump = Math.max(KEYBOARD_JUMP, owner.documentElement.clientHeight * KEYBOARD_RATIO);
    const big = sighted
      ? Math.abs(Math.round(top) - seenTop) >= jump || Math.abs(seeing - seenHeight) >= jump
      : seeing < owner.documentElement.clientHeight - 1; // 겨눔 첫 순간에 키보드가 이미 서 있으면 연다
    sighted = true;
    if (!big) return;

    seenTop = Math.round(top);
    seenHeight = seeing;
    // **키보드 급 변화는 새 사건이다** — 사람이 굴려 끝냈던 세션도 여기서 다시 선다 (015 규칙 1).
    armed = true;
    stuck = Number.NaN; // 자리가 정말 달라졌다 — 못 고치던 사이의 기억도 지운다
    ruler = probeTop(top); // 자를 다시 세운다 (offsetTop 이 0 이면 잴 것도 없다)

    // **손이 굴리는 중이면 지금은 한 픽셀도 안 민다.** 움직이는 화면을 뺏는 것이 떨림의 본체다.
    if (!scrolling()) afterEdit('view'); // 다음 프레임에 한 걸음
    // 어느 쪽이든 **가라앉은 뒤에 한 번 더** 맞춘다 — 크롬은 우리가 민 뒤에도 더 판다. 그 걸음이
    // 이 세션의 마지막이다. 그 사이에 사람이 굴리면 그 걸음은 걷지 않고 취소된다 (015 규칙 1).
    afterQuiet();
  };

  // --- 캐럿 사각형 ------------------------------------------------------------------------------
  const caretRect = (): Rect | null => {
    const selection = owner.getSelection?.();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const box = range.getBoundingClientRect();
    // 접힌 캐럿이 0×0 을 답하는 자리가 있다 — 그때는 든 요소의 사각형으로 갈음한다.
    if (box.height > 0) return { top: box.top, bottom: box.bottom };
    const node = range.startContainer;
    const el = node.nodeType === 1 ? (node as Element) : node.parentElement;
    if (!el) return null;
    const fallback = el.getBoundingClientRect();
    return { top: fallback.top, bottom: fallback.bottom };
  };

  // 선택을 뺐다 도로 넣는다 — 진짜 선택 변경이고, 진짜 선택 변경이야말로 WebKit 이 자기 방식으로
  // 캐럿을 보여 주게 만든다 (040 §3.2). 우리는 자리를 하나도 안 정한다.
  const reAim = (): void => {
    const selection = owner.getSelection?.();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0).cloneRange();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // 지금의 띠 한 장 — 두 변을 **그때그때 잰다**(§3 의 1). `limit` 은 한 번의 보정 상한이다.
  const bandNow = (): { readonly band: Band; readonly aim: Band; readonly limit: number } | null => {
    if (!view) return null;
    const visual = view.visualViewport;
    // 보이는 창을 **캐럿·크롬의 rect 와 같은 좌표계로** 옮긴다 (011 4차, 위 "좌표계를 재는 자").
    // 예전에는 `{0, visual.height}` 였다 — 그 식은 iOS 에서만 우연히 맞았고 안드로이드에서는
    // 띠를 뒤집어 눈을 멀게 했다. 데스크톱·iOS 에서는 이 식이 **같은 값**을 낸다.
    const top = visual ? ruler + visual.offsetTop : 0;
    const height = visual ? visual.height : view.innerHeight;
    const viewport: Rect = { top, bottom: top + height };
    const chromeBox = options.chrome ? options.chrome.getBoundingClientRect() : null;
    const chromeBottom = chromeBox ? chromeBox.bottom : null;
    // **띠 = 창 ∩ (툴바 아래). 그것이 비면 툴바를 무시하고 창만 본다** (011 5차).
    // 툴바 아랫변이 창 아래로 통째로 나가면(그릇이 덜 올라와 툴바가 그릇 머리에 붙어 있을 때)
    // 띠가 뒤집히고, 뒤집힌 띠를 넘기면 `bandFix` 가 첫 줄(`height <= 0`)에서 0 을 답해 **눈이
    // 먼다.** 실측이 그 자리다 — 아이폰 사파리 `bar=289..477` · `창=0..377` · 캐럿은 창 아래
    // 131px 인데 아무 일도 안 났다. **보이기라도 하는 것이 안 보이는 것보다 낫다.**
    const usable = chromeBottom !== null && chromeBottom < viewport.bottom ? chromeBottom : null;
    // **과녁 띠** — 툴바가 **창 맨 위에 붙었을 때**의 띠다. 지금 툴바가 어디 있든 그 **키**만
    // 쓴다: 그릇이 덜 올라와 툴바가 그릇 머리에 붙어 있어도 과녁이 따라 흔들리지 않는다.
    // `placeWalk` 가 이것을 겨눠야 툴바 위에 남은 빈자리가 사라진다 (011 6차).
    const aimTop = viewport.top + (chromeBox ? chromeBox.height : 0);
    return {
      band: bandOf(usable, viewport),
      aim: { top: aimTop, bottom: viewport.bottom },
      limit: viewport.bottom - viewport.top,
    };
  };

  const measure = (): void => {
    if (!view) return;
    if (ios) {
      reAim();
      return;
    }
    const caret = caretRect();
    const now = bandNow();
    if (!caret || !now) return;
    const delta = bandFix(caret, now.band, now.limit);
    if (delta === 0) return; // 띠 안 — 화면은 가만있는다 (규칙의 절반이 이것이다)
    view.scrollBy({ top: delta, behavior: 'auto' });
  };

  const aim = (): void => {
    follow();
    settle.afterViewport(() => {
      follow();
      measure();
    });
  };

  // --- 편집 뒤 한 걸음 ---------------------------------------------------------------------------
  // 편집은 캐럿을 옮기고 문서의 키를 바꾸는데 **아무도 화면을 안 굴린다.** 갈래가 둘이고 둘 다
  // 실측으로 확인했다 (260823_000 5차, 데스크톱 크롬):
  //
  //   ⓐ 우리가 가로챈 편집(백스페이스·엔터·구조 입력)은 `preventDefault` 라 브라우저의 리빌이
  //      아예 안 돈다. 선택을 코드로 쓰는 것도 브라우저를 안 굴린다. 전체선택+백스페이스처럼
  //      문서가 확 줄면 스크롤이 잘려 캐럿이 **화면 위로 통째로 밀려난다**(실측 −98px).
  //   ⓑ 브라우저가 제 손으로 넣는 글자(문단 안 타이핑)는 리빌을 돌리지만, 그것이 보는 여백은
  //      시트의 어림값(`.nabi-content > *` 의 `scroll-margin`, 3.5rem)뿐이라 크롬이 그보다
  //      높으면 그 차이만큼 캐럿이 툴바 **밑에 잠긴다**(실측 80px 크롬에 24px 잠김).
  //      브라우저에게 툴바는 그저 덮어 그린 층이라 "보인다"고 여긴다 — 040 §2 가 말한 그것이다.
  //
  // 재는 시점은 **편집 다음 프레임**이다. 실측에서 브라우저의 리빌은 `onChange` 보다 뒤,
  // 다음 rAF 보다 앞에 끝난다 — 그래서 우리가 미는 것은 언제나 **남은 만큼**이고 둘이 안 싸운다
  // (3차의 시간차가 무너진 자리가 바로 "리빌 도중에 쟀다" 였다).
  //
  // 미는 방향은 **아래뿐**이다(`revealFix`). 아래 변은 `aim()` 의 몫이고, 편집마다 그쪽까지
  // 보면 사람이 굴려 둔 화면을 글자 하나마다 뺏는다.
  //
  // 걸음은 **한 번이 아니라 몇 번까지**다(`revealWalk`). 스티키 끝자락에서 시작하면 우리가 잰
  // 크롬은 이미 화면 밖의 값이라, 그 값으로 밀면 크롬이 도로 서면서 캐럿을 다시 덮는다
  // (6차 실측: 요청 −325 · 실제 −324 · 그러고도 53px 잠김). 민 뒤에 다시 재는 것이 답이다.
  //
  // 편집기가 겨눔을 쥔 동안만 본다 — 안 쥔 편집기의 막대를 밀면 안 되고, 둘이면 서로 싸운다.
  let watching = false;
  let frame = 0;
  // 이 걸음을 연 문 — `edit`(문서가 바뀜) 인가 `view`(키보드·뷰포트가 바뀜) 인가.
  // 겨눔이 다르다(아래 `reveal`). 뷰포트 문이 이긴다: 창이 움직인 판에서는 자리부터 잡아야 한다.
  let aimBy: 'edit' | 'view' = 'edit';
  const reveal = (): void => {
    frame = 0;
    // 어느 문으로 열렸나 — 읽고 곧바로 되돌린다(다음 걸음은 다시 편집이 기본이다).
    const by = aimBy;
    aimBy = 'edit';
    if (!view || !watching) return;
    const window_ = view;
    const look = (): { readonly caret: Rect; readonly band: Band; readonly limit: number } | null => {
      const caret = caretRect();
      const now = bandNow();
      if (!caret || !now) return null;
      return { caret, band: now.band, limit: now.limit };
    };
    // 같은 재기인데 **과녁 띠**를 준다 — 툴바가 창 맨 위에 붙었을 때의 띠다.
    const lookAim = (): { readonly caret: Rect; readonly band: Band; readonly limit: number } | null => {
      const caret = caretRect();
      const now = bandNow();
      if (!caret || !now) return null;
      return { caret, band: now.aim, limit: now.limit };
    };
    const push = (delta: number): number => {
      const before = window_.scrollY;
      window_.scrollBy({ top: delta, behavior: 'auto' });
      mine = window_.scrollY; // 이 자리에서 온 스크롤은 **우리 것**이다 (8차)
      // 굴린 만큼을 **되잰다** — 요청과 실제가 다른 자리가 있다(문서가 줄어 더 굴릴 데가 없을 때).
      return window_.scrollY - before;
    };
    // --- 아래 변은 **뷰포트 문의 것이고, 세션당 한 번이다** (015 규칙 2) ------------------------
    //
    // 예전에는 편집 문도 키보드가 서 있으면 `underWalk` 를 돌렸다. 그것이 야금야금 내려가는
    // 버그의 몸이었다: `underFix` 는 띠가 좁으면 **가리기 전까지만**(`min(over, room)`) 밀어
    // `over` 를 다 못 푼다 → 다음 글자에서 또 `room` 만큼 민다 → 글자마다 조금씩, 끝없이.
    // `band.ts` 가 처음부터 적어 둔 경고("편집마다 아래 변까지 보면 사람이 굴려 내려 보던 자리를
    // 글자 하나 칠 때마다 도로 끌어올린다")가 그대로 실현된 자리다.
    //
    // 그래서 **편집 문은 키보드 유무와 무관하게 위 변만** 본다 — 그 문은 사람이 돌아온 자리라
    // 늘 열려 있어도 된다. 캐럿이 안 가려져 있으면 `revealWalk` 는 0 을 답하므로 타이핑 중에는
    // 화면이 한 픽셀도 안 움직이고, 사람이 굴려 떠난 뒤 다시 타이핑하면 캐럿으로 돌아온다 —
    // 어느 편집기에서나 기대하는 그 동작이다.
    if (by !== 'view') {
      const seen = look();
      if (!seen) return;
      // 캐럿 윗변과 띠 위 변 사이 — **이 사이가 곧 관계다.** 밀어서 이것이 안 변하면 헛걸음이다.
      const gap = seen.caret.top - seen.band.top;
      const delta = revealFix(seen.caret, seen.band, seen.limit);
      if (delta === 0) return;
      if (Math.abs(delta) < TINY_FIX) return; // 눈에 안 보이는 보정은 떨림이다
      if (same(gap, stuck)) return; // 이 사이는 밀어도 안 고쳐진다 — 세션이 기억한 그 자리다
      revealWalk(REVEAL_STEPS, look, push);
      const after = look();
      // 밀었는데 사이가 그대로면 **못 고치는 사이다.** 적어 두고 이 세션에서는 다시 안 민다.
      stuck = after && same(after.caret.top - after.band.top, gap) ? gap : Number.NaN;
      return;
    }
    // 뷰포트 문은 세션 표식이 선 동안만이다 — 사람이 굴려 끝낸 세션에서는 **아무것도 안 민다.**
    if (!armed) return;
    // **키보드가 서 있을 때만** 아래 변까지 본다 (011 3차). 시각 뷰포트가 레이아웃 뷰포트보다
    // 낮으면 그 차가 곧 키보드다 — 안드로이드(아래를 깎는다)도 iOS(창을 아래로 민다)도 참이 된다.
    // 키보드가 아직 안 섰으면 **세션은 그대로 둔다** — 쓸 자리가 아직 안 온 것뿐이다.
    const visual = view.visualViewport;
    const standing = visual !== null && visual.height < owner.documentElement.clientHeight - 1;
    if (!standing) {
      revealWalk(REVEAL_STEPS, look, push);
      return;
    }
    // 먼저 최소 넛지로 **가림·창 밖**을 고치고(그것이 옳고 그름이다), 그다음 **빈자리를
    // 걷어낸다**(툴바를 창 맨 위에 붙인다 — 그것이 편안함이다, 011 6·7차).
    // 둘 다 재고 → 밀고 → **다시 재는** 걸음이라 앞 걸음이 민 뒤의 자리를 뒤 걸음이 다시 본다.
    underWalk(KEYBOARD_STEPS, look, push);
    placeWalk(KEYBOARD_STEPS, lookAim, push);
  };
  const afterEdit = (by: 'edit' | 'view' = 'edit'): void => {
    // 겨눔이 편집기에 없으면 안 민다 — 호스트가 `setHtml()` 로 값을 밀어 넣는 동안 페이지가
    // 튀면 안 된다. `watching` 이 곧 그 깃발이다(포커스 동안만 선다).
    if (!view || !watching) return;
    if (by === 'view') aimBy = 'view'; // 뷰포트 문이 이긴다 — 예약된 걸음의 겨눔도 갈아탄다
    if (frame !== 0) return;
    frame = view.requestAnimationFrame(reveal);
  };

  // --- 가라앉은 뒤 한 번 더 (011 6차) -----------------------------------------------------------
  // **크롬은 우리가 민 뒤에도 계속 판다.** 안드로이드 실측: 우리가 −115 밀어 맞춘 바로 뒤에
  // 크롬이 창을 201 → 322 로 더 밀어 다시 19px 어긋났고, 그 뒤로는 **새 사건이 없어 영영 그대로**
  // 였다. 그래서 뷰포트 사건이 **멎고 나서** 마지막으로 한 번 더 재고 맞춘다.
  //
  // **딱 한 번이다.** "우리가 밀면 크롬이 되민다" 가 참이면 무한히 싸울 수 있다 — 걸음 자체는
  // `walkWith` 의 "나아지지 않으면 멎는다" 를 타고, 이 마지막 걸음은 `settling` 깃발로 못 박는다.
  // 기다림은 이미 있는 `settle.afterViewport`(조용해진 뒤, 최대 네 번 다시 봄)에 맡긴다 —
  // **새 타이머를 안 만든다.**
  let settling = false;
  const afterQuiet = (): void => {
    if (settling) return;
    settling = true;
    settle.afterViewport(() => {
      settling = false;
      // **사람이 굴렸으면 이 걸음은 취소된다** (015 규칙 1). 8차는 여기서 손이 멎기를 세 번까지
      // 더 기다렸다 **결국 밀었다** — `USER_QUIET` 을 "미루는 창"으로만 봤기 때문이다. 그래서
      // 손을 떼는 순간 `placeWalk` 가 캐럿을 과녁으로 도로 끌어왔다(주인: "계속 화면이 돌아와").
      // 이제 사람 스크롤은 세션을 **끝내는** 신호라, 기다림 셈도 함께 걷어냈다.
      if (!armed) return;
      // 크롬은 우리가 민 뒤에도 더 판다(011 6차의 안드로이드: −115 뒤에 창이 201 → 322 로 더
      // 밀려 19px 어긋났다). 그래서 **즉시 걸음 + 이 마지막 걸음**이 한 벌이다.
      afterEdit('view');
    });
  };

  // 문서가 **정말 바뀐 때만**이다 — 선택만 옮긴 신호(`doc: false`)에는 안 선다. 전체선택처럼
  // 선택이 문서만큼 커진 순간에 겨누면 화면이 글 첫머리로 튄다.
  const stopChange = options.nabi?.onChange((change) => {
    if (!change.doc) return;
    // **사람이 돌아왔다** — 굴려 떠나며 끝낸 세션을 편집이 다시 연다 (015 규칙 1의 ②).
    armed = true;
    afterEdit('edit');
  });

  // --- 늦게 바뀌는 툴바 기하 (015 3차) -----------------------------------------------------------
  // **우리가 잰 뒤에 툴바가 자란다.** 000 이 "남은 흠" 으로 적어 둔 그 자리다 — 우리가 잴 때
  // 크롬은 80px(툴바 줄만)이었고, 그 뒤 상황 줄이 서면서 95px 로 자랐다. 자란 만큼 캐럿이 도로
  // 잠긴다. 주인이 본 **"툴바 가려지는 거 다시"** 가 이것이다. 상황 줄만이 아니다: 화면이 좁아
  // 단추 줄이 두 줄로 접히거나, 웹폰트가 늦게 와 줄 높이가 달라져도 같은 일이 난다.
  //
  // **시간이 아니라 사건으로 듣는다.** "0.1초 뒤에 한 번 더" 는 그 무언가가 0.1초 안에 끝난다는
  // 데 거는 도박이고, 느린 기기·늦은 폰트에서 또 어긋난다(000 이 `settle.onSettle` 에 걸음을 더
  // 얹기를 미룬 까닭도 "몇 번 걸까" 의 짐작이 싫어서였다). 우리가 기다리는 것은 **시각**이 아니라
  // **툴바의 키가 달라지는 그 순간**이므로 `ResizeObserver` 로 그것을 직접 듣는다.
  //
  // **키(height)만 본다 — 아랫변이 아니다.** 붙는 크롬의 client 아랫변은 우리가 굴릴 때마다
  // 달라진다. 그것을 문으로 삼으면 *우리가 밀고 → 관찰자가 깨고 → 다시 미는* **고리**가 된다.
  // 키는 스크롤로 안 변하므로 고리가 원천에서 막힌다(`mine` 가림막을 여기까지 늘릴 필요가 없다).
  let watcher: { observe(el: Element): void; disconnect(): void } | null = null;
  let seenBar = -1; // 관찰자가 마지막으로 본 크롬의 키
  const onChromeSize = (): void => {
    const bar = options.chrome;
    if (!bar || !view) return;
    const height = Math.round(bar.getBoundingClientRect().height);
    // 자를 `start()` 가 이미 세워 뒀다(`seenBar`). 그래서 관찰자가 걸리자마자 부르는 첫 콜백은
    // 대개 여기서 조용히 돌아간다 — "첫 한 번은 세지 않는다" 는 깃발을 따로 안 든다. 그 사이에
    // 키가 정말 달라졌다면 그것은 **놓치면 안 되는 진짜 사건**이라 그대로 걸음이 된다.
    if (height === seenBar) return; // 키가 그대로다 — 자리만 달라진 것이니 우리 일이 아니다
    seenBar = height;
    // 시트에도 곧바로 알린다 — `follow()` 는 뷰포트 사건에만 도는데 데스크톱에는 그 사건이 없다.
    if (height !== barHeight) {
      barHeight = height;
      writeVar(BAR_HEIGHT_VAR, height);
    }
    // **사람이 굴려 떠났으면 안 켠다** (015 규칙 1이 제일 위다).
    if (!watching || !armed) return;
    // 기하가 정말 달라졌다 — "밀어도 안 고쳐지던 사이"의 기억은 여기서 지운다. 새 기하에서도
    // 안 고쳐지면 그 걸음이 다시 배운다(`reveal` 의 되재기).
    stuck = Number.NaN;
    // **한 걸음, 위 변만.** 툴바가 자라 생긴 사고는 가림이고 그것은 편집 문의 몫이다 —
    // 아래 변·제자리는 뷰포트 문(키보드가 서는 그 걸음)에 그대로 남긴다 (015 규칙 2).
    afterEdit('edit');
  };

  const start = (): void => {
    if (watching) return;
    watching = true;
    armed = true; // 새 겨눔 — 세션이 여기서 시작한다
    stuck = Number.NaN;
    follow();
    view?.visualViewport?.addEventListener('resize', follow);
    view?.visualViewport?.addEventListener('scroll', follow);
    // 손이 굴리는 것을 듣는다 — 겨눔을 쥔 동안만 걸고 뗄 때 함께 뗀다(전역에 안 남긴다).
    view?.addEventListener('scroll', onScroll, { passive: true });
    // 툴바가 자라는 것도 듣는다. 없는 브라우저면 그냥 안 듣는다 — 나머지는 그대로 돈다.
    const Observer = (view as unknown as { ResizeObserver?: new (fn: () => void) => { observe(el: Element): void; disconnect(): void } })
      ?.ResizeObserver;
    if (Observer && options.chrome) {
      // 지금 키를 자로 세워 둔다 — `follow()` 가 방금 잰 그 값이다.
      seenBar = Math.round(options.chrome.getBoundingClientRect().height);
      watcher = new Observer(onChromeSize);
      watcher.observe(options.chrome);
    }
  };
  const stop = (): void => {
    if (!watching) return;
    watching = false;
    // 예약해 둔 걸음도 함께 걷는다 — 겨눔이 빠진 뒤에 굴리면 남의 화면을 밀게 된다.
    if (frame !== 0) view?.cancelAnimationFrame(frame);
    frame = 0;
    view?.visualViewport?.removeEventListener('resize', follow);
    view?.visualViewport?.removeEventListener('scroll', follow);
    view?.removeEventListener('scroll', onScroll);
    // 관찰자는 반드시 걷는다 — 겨눔이 빠진 뒤에도 살아 있으면 남의 화면을 밀게 된다.
    watcher?.disconnect();
    watcher = null;
    seenBar = -1;
    writeVar(KEYBOARD_TOP_VAR, 0);
    writeVar(KEYBOARD_BOTTOM_VAR, 0);
    writeVar(BAR_HEIGHT_VAR, 0);
    // 거울도 함께 지운다 — 다음 겨눔이 "0 에서 다시 섰다"를 제대로 알아채야 한다(둘째 탭).
    // `sighted` 를 내려 두면 다음 `follow()` 가 그 자리에서 키보드가 서 있는지 다시 본다.
    barHeight = 0;
    seenTop = 0;
    seenHeight = 0;
    sighted = false;
    mine = -1;
    // 세션 표식도 함께 내린다 — 겨눔이 빠진 뒤에 남은 걸음이 남의 화면을 밀면 안 된다 (015).
    armed = false;
    stuck = Number.NaN;
  };

  options.surface.addEventListener('focus', start);
  options.surface.addEventListener('blur', stop);
  if (owner.activeElement === options.surface) start();

  return {
    aim,
    unmount() {
      stop();
      stopChange?.();
      options.surface.removeEventListener('focus', start);
      options.surface.removeEventListener('blur', stop);
      // 자는 걷을 것이 없다 — 잴 때 만들었다 그 자리에서 곧바로 지운다(위 `probeTop`).
      if (ownSettle) settle.unmount();
    },
  };
}
