// 캐럿을 편집 가능 띠 안에 붙드는 스크롤 보정 — 계산은 band.ts, iOS는 브라우저 자체 리빌에 맡긴다(040)
// Keeps the caret inside the visible edit band by scrolling; math lives in band.ts, iOS defers to the browser's own reveal (040)
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
import { HostElementLease } from '../lifecycle.js';

export const KEYBOARD_TOP_VAR = '--nabi-keyboard-top';
export const KEYBOARD_BOTTOM_VAR = '--nabi-keyboard-bottom';
// 시트의 scroll-margin 어림값이 실기와 크게 어긋나(011) 실측 높이를 따로 낸다
// The sheet's scroll-margin guess diverges from real devices (011), so we expose the measured height instead
const BAR_HEIGHT_VAR = '--nabi-bar-height';

// 주소줄 접힘(수십 px)과 키보드(수백 px)를 가르는 문턱 — 작은 변화까지 밀면 화면이 떨린다
// Threshold separating address-bar collapse (tens of px) from the keyboard (hundreds); reacting to small changes causes jitter
const KEYBOARD_JUMP = 120;
const KEYBOARD_RATIO = 0.15;
// 사람이 굴린 뒤 이만큼은 화면을 밀지 않는다 — 그동안은 겨눔 세션도 끝나 있다(아래 armed)
// After a user scroll we hold off pushing the screen for this long; the aim session (`armed` below) stays ended meanwhile
const USER_QUIET = 250;

// 뷰포트가 방금 움직였으면 브라우저가 미는 중으로 본다 — 사람 스크롤과 헷갈리면 무한 루프가 난다(015/020)
// A viewport change just now counts as the browser's own scroll; confusing it with a user scroll causes an infinite loop (015/020)
const VIEW_QUIET = 300;

// getBoundingClientRect는 소수를 낸다 — 이 문턱 아래 차이는 흔들림이지 진짜 어긋남이 아니다
// getBoundingClientRect returns fractional pixels; a gap under this threshold is jitter, not a real one
const TINY_FIX = 1.5;
const same = (a: number, b: number): boolean => Math.abs(a - b) < 1;

export interface StickyOptions {
  readonly root: HTMLElement;
  readonly surface: HTMLElement;
  // 띠의 위 변을 이루는 붙는 크롬 — 없으면 창의 위가 위 변이다
  // The sticky chrome forming the band's top edge; without it the window top is the edge
  readonly chrome?: HTMLElement;
  readonly settle?: Settle;
  // 주면 편집 뒤에 스스로 한 번 겨눈다 — 안 주면 호스트가 aim()을 부를 때만 돈다
  // If given, aims itself once after an edit; otherwise only `aim()` from the host does
  readonly nabi?: Nabi;
  // iOS 분기를 끄고 모든 플랫폼이 같은 띠 규칙만 쓰게 한다(040)
  // Disables the iOS branch so every platform runs the same band rule (040)
  readonly iosBranch?: boolean;
}

export interface Sticky {
  aim(): void;
  unmount(): void;
}

export function mountSticky(options: StickyOptions): Sticky {
  const root = options.root;
  const surface = options.surface;
  const chrome = options.chrome;
  const nabi = options.nabi;
  const iosBranch = options.iosBranch;
  const suppliedSettle = options.settle;
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  const settle = suppliedSettle ?? watchSettle(owner, { surface });
  const ownSettle = suppliedSettle === undefined;
  let unmounted = false;
  const styles = new HostElementLease(root);
  let ios: boolean;
  try {
    ios =
      iosBranch !== false &&
      view !== null &&
      isIos(view.navigator.userAgent, view.navigator.platform ?? '', view.navigator.maxTouchPoints ?? 0);
  } catch (error) {
    try {
      styles.dispose();
    } catch {}
    if (ownSettle) {
      try {
        settle.unmount();
      } catch {}
    }
    throw error;
  }

  // --- 키보드 자리 → CSS 변수 -----------------------------------------------------------------
  // 0 이면 변수를 **지운다** — "키보드 없음"과 "높이 0 인 키보드"가 같은 상태여야 시트의 기본이 산다.
  const writeVar = (name: string, px: number): void => {
    const value = Math.round(px);
    styles.style(name, value <= 0 ? null : `${value}px`);
  };

  // fixed 표식의 client top 기준이 iOS(보이는 창)와 안드로이드(레이아웃 창)에서 갈려, offsetTop을 더해 좌표계를 맞춘다(011)
  // A `position:fixed` probe's client top is measured from different origins on iOS vs Android; adding offsetTop aligns both (011)
  const probeTop = (offsetTop: number): number => {
    if (!view || offsetTop <= 0) return 0;
    const probe = owner.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:1px;block-size:1px;' +
      'opacity:0;pointer-events:none';
    owner.body.append(probe);
    // 표식을 상주시키면 사파리가 그 자체로 좌표계를 바꿔 굴었다 — 잴 때만 만들고 곧장 지운다(011)
    // Keeping the probe resident made Safari itself shift its coordinate origin; create it only to measure, then remove it (011)
    const top = probe.getBoundingClientRect().top;
    probe.remove();
    return top;
  };

  let barHeight = 0;
  let seenTop = 0;
  let seenHeight = 0;
  let sighted = false;
  let ruler = 0;

  // 우리가 민 뒤의 scrollY를 적어 두고 그와 다른 자리에서 온 스크롤만 사람 것으로 센다 — 애매하면 사람 쪽으로 친다
  // We record scrollY after our own pushes; a scroll from elsewhere counts as the user's — ambiguous cases favor the user
  let userAt = 0;
  let mine = -1;
  let viewAt = 0;
  let viewHeight = -1;
  const viewMoving = (): boolean => Date.now() - viewAt < VIEW_QUIET;
  const takeOver = (): void => {
    userAt = Date.now();
    armed = false;
  };
  const onScroll = (): void => {
    if (view && mine >= 0 && Math.abs(view.scrollY - mine) <= 1) return;
    if (viewMoving()) return;
    // 사람이 떠나려고 굴리면 예외 없이 보정을 끈다 — 캐럿이 안 보인다고 화면을 도로 끌어오지 않는다
    // A user scrolling away always ends the correction; we never pull the screen back just because the caret went offscreen
    takeOver();
  };
  const scrolling = (): boolean => Date.now() - userAt < USER_QUIET;

  // 세션은 겨눔·문서 변경·키보드 급변에 서고, 자리잡기가 끝나거나 사람이 굴리면 내려간다 — 사람 스크롤로 끝나면 재개는 사람 몫이다(015/020)
  // The session arms on aim/doc-change/keyboard jumps and disarms once settled or the user scrolls; after a user scroll only the user resumes it (015/020)
  let armed = false;
  let closing = false;

  // 밀어도 caret-band 간격이 그대로면(툴바가 캐럿과 함께 구르는 자리) 그 간격을 적어 두고 다음 편집에서는 안 민다 — 세션당 한 번 배운다(015)
  // If a push leaves the caret-band gap unchanged (toolbar scrolling alongside the caret), remember that gap and stop pushing for it — learned once per session (015)
  let stuck = Number.NaN;

  const follow = (): void => {
    if (!view) return;
    const visual = view.visualViewport;
    // 자국은 뷰포트의 키(height)가 실제로 달라진 때만 찍는다 — 매 호출마다 찍으면 손가락 스크롤도 영영 사람 것으로 안 세어져 무한 루프가 난다(020)
    // We mark this only when the viewport's height actually changes; marking on every call meant a finger-scroll never counted as the user's, causing an infinite loop (020)
    const seeing = Math.round(visual ? visual.height : view.innerHeight);
    if (seeing !== viewHeight) {
      viewHeight = seeing;
      viewAt = Date.now();
    }
    const top = visual ? visual.offsetTop : 0;
    const bottom = visual ? Math.max(0, view.innerHeight - (visual.offsetTop + visual.height)) : 0;

    writeVar(KEYBOARD_TOP_VAR, top);
    writeVar(KEYBOARD_BOTTOM_VAR, bottom);

    const height = chrome ? Math.round(chrome.getBoundingClientRect().height) : 0;
    if (height !== barHeight) {
      barHeight = height;
      writeVar(BAR_HEIGHT_VAR, height);
    }

    // 툴바가 창 맨 위로 옮겨 앉는 것도 캐럿을 가릴 수 있어 걸음을 걸지만, 문턱 이하(주소줄 접힘)에는 안 연다(011)
    // The toolbar relocating to the window top can cover the caret too, so we step here, but not below the threshold (address-bar collapse) (011)
    const jump = Math.max(KEYBOARD_JUMP, owner.documentElement.clientHeight * KEYBOARD_RATIO);
    const big = sighted
      ? Math.abs(Math.round(top) - seenTop) >= jump || Math.abs(seeing - seenHeight) >= jump
      : seeing < owner.documentElement.clientHeight - 1;
    sighted = true;
    if (!big) return;

    seenTop = Math.round(top);
    seenHeight = seeing;
    armed = true;
    stuck = Number.NaN;
    ruler = probeTop(top);

    if (!scrolling()) afterEdit('view');
    afterQuiet();
  };

  const caretRect = (): Rect | null => {
    const selection = owner.getSelection?.() ?? view?.getSelection() ?? null;
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const box = range.getBoundingClientRect();
    // 접힌 캐럿이 0×0을 답할 때는 담은 요소의 사각형으로 갈음한다
    // A collapsed caret can report 0x0; fall back to the containing element's rect
    if (box.height > 0) return { top: box.top, bottom: box.bottom };
    const node = range.startContainer;
    const el = node.nodeType === 1 ? (node as Element) : node.parentElement;
    if (!el) return null;
    const fallback = el.getBoundingClientRect();
    return { top: fallback.top, bottom: fallback.bottom };
  };

  // 선택을 뺐다 도로 넣으면 WebKit이 자기 방식으로 캐럿을 보여준다 — 자리는 우리가 안 정한다(040)
  // Removing and re-adding the selection makes WebKit reveal the caret itself; we never set a position (040)
  const reAim = (): void => {
    const selection = owner.getSelection?.() ?? view?.getSelection() ?? null;
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0).cloneRange();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const bandNow = (): { readonly band: Band; readonly aim: Band; readonly limit: number } | null => {
    if (!view) return null;
    const visual = view.visualViewport;
    // ruler + offsetTop으로 보이는 창을 캐럿·크롬의 rect와 같은 좌표계로 옮긴다 — {0, height}만 쓰면 안드로이드에서 띠가 뒤집힌다(011)
    // Adding `ruler` aligns the visual viewport to the caret/chrome rect's coordinate system; using {0, height} alone flips the band on Android (011)
    const top = visual ? ruler + visual.offsetTop : 0;
    const height = visual ? visual.height : view.innerHeight;
    const viewport: Rect = { top, bottom: top + height };
    const chromeBox = chrome ? chrome.getBoundingClientRect() : null;
    const chromeBottom = chromeBox ? chromeBox.bottom : null;
    // 띠 = 창 ∩ 툴바 아래 — 그 교집합이 비어 뒤집히면 눈이 머니 그때는 툴바를 무시하고 창만 본다(011)
    // Band = window intersect below-toolbar; when that flips empty we'd go blind, so we fall back to just the window (011)
    const usable = chromeBottom !== null && chromeBottom < viewport.bottom ? chromeBottom : null;
    // 과녁 띠는 툴바가 창 맨 위에 붙었을 때의 키만 쓴다 — 지금 툴바 위치가 흔들려도 과녁은 안 흔들린다(011)
    // The aim band uses only the height as if the toolbar were pinned to the top, so it doesn't wobble with the toolbar's current position (011)
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
    if (delta === 0) return;
    view.scrollBy({ top: delta, behavior: 'auto' });
  };

  const aim = (): void => {
    if (unmounted) return;
    follow();
    settle.afterViewport(() => {
      if (unmounted) return;
      follow();
      measure();
    });
  };

  // 편집(백스페이스·엔터 등 가로챈 입력)은 preventDefault라 브라우저 리빌이 안 돌고, 브라우저가 넣는 글자는 시트의 어림 여백만 본다 — 둘 다 캐럿이 가려질 수 있어 우리가 다음 프레임에 민다(260823_000)
  // Intercepted edits skip the browser's reveal (preventDefault), and browser-typed input only respects the sheet's guessed margin — both can hide the caret, so we nudge it next frame (260823_000)
  let watching = false;
  let frame = 0;
  // 이 걸음을 연 문 — edit(문서 변경) 또는 view(키보드·뷰포트 변경). 뷰포트 문이 우선한다.
  // Which door opened this step — 'edit' (doc changed) or 'view' (keyboard/viewport changed); the view door wins
  let aimBy: 'edit' | 'view' = 'edit';
  const reveal = (): void => {
    frame = 0;
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
    const lookAim = (): { readonly caret: Rect; readonly band: Band; readonly limit: number } | null => {
      const caret = caretRect();
      const now = bandNow();
      if (!caret || !now) return null;
      return { caret, band: now.aim, limit: now.limit };
    };
    const push = (delta: number): number => {
      const before = window_.scrollY;
      window_.scrollBy({ top: delta, behavior: 'auto' });
      mine = window_.scrollY;
      return window_.scrollY - before;
    };
    // 편집 문은 키보드 유무와 무관하게 위 변만 본다 — 아래 변까지 보면 편집마다 사람이 굴려 내린 화면을 도로 끌어올린다(015)
    // The edit door only checks the top edge regardless of the keyboard; also checking the bottom would pull back a scroll the user made on every keystroke (015)
    if (by !== 'view') {
      const seen = look();
      if (!seen) return;
      const gap = seen.caret.top - seen.band.top;
      const delta = revealFix(seen.caret, seen.band, seen.limit);
      if (delta === 0) return;
      if (Math.abs(delta) < TINY_FIX) return;
      if (same(gap, stuck)) return;
      revealWalk(REVEAL_STEPS, look, push);
      const after = look();
      stuck = after && same(after.caret.top - after.band.top, gap) ? gap : Number.NaN;
      return;
    }
    const last = closing;
    closing = false;
    if (!armed) return;
    const visual = view.visualViewport;
    const standing = visual !== null && visual.height < owner.documentElement.clientHeight - 1;
    if (!standing) {
      revealWalk(REVEAL_STEPS, look, push);
      if (last) armed = false;
      return;
    }
    // 먼저 가림·창 밖을 최소로 고치고, 그다음 툴바를 창 맨 위로 붙여 빈자리를 걷어낸다 — 밀고 다시 재는 두 걸음이다(011)
    // First fix any covering/off-screen minimally, then pin the toolbar to the window top to remove empty space — two measure-push-remeasure steps (011)
    underWalk(KEYBOARD_STEPS, look, push);
    placeWalk(KEYBOARD_STEPS, lookAim, push);
    if (last) armed = false;
  };
  const afterEdit = (by: 'edit' | 'view' = 'edit'): void => {
    // watching은 포커스 동안만 서므로, 호스트가 setHtml()로 값을 밀어 넣는 동안은 화면이 안 튄다
    // `watching` is only true while focused, so the page doesn't jump while a host pushes a value via setHtml()
    if (!view || !watching) return;
    if (by === 'view') aimBy = 'view';
    if (frame !== 0) return;
    frame = view.requestAnimationFrame(reveal);
  };

  // 크롬은 우리가 민 뒤에도 계속 자라 다시 어긋나므로, 뷰포트 사건이 멎은 뒤 딱 한 번 더 재고 맞춘다(011)
  // The chrome keeps growing after our own push and drifts again, so once things settle we measure and correct exactly one more time (011)
  let settling = false;
  const afterQuiet = (): void => {
    if (settling) return;
    settling = true;
    settle.afterViewport(() => {
      if (unmounted) return;
      settling = false;
      // 사람이 그사이 굴렸으면 이 마지막 걸음은 취소된다 — 손을 뗀 순간 캐럿을 도로 끌어오면 안 된다(015)
      // If the user scrolled meanwhile, this final step is canceled — we must not pull the caret back the moment they let go (015)
      if (!armed) return;
      closing = true;
      afterEdit('view');
    });
  };

  let stopChange: (() => void) | undefined;
  try {
    stopChange = nabi?.onChange((change) => {
      // 선택만 옮긴 신호는 무시한다 — 전체선택처럼 선택이 문서만큼 커진 순간에 겨누면 화면이 첫머리로 튄다
      // A selection-only signal is ignored; aiming right when a select-all grows the selection to doc size jumps the view to the top
      if (!change.doc) return;
      armed = true;
      afterEdit('edit');
    });
  } catch (error) {
    styles.dispose();
    if (ownSettle) settle.unmount();
    throw error;
  }

  // 잰 뒤에 툴바가 더 자라 캐럿을 도로 덮을 수 있어(상황 줄·줄바꿈·늦은 폰트), 타이머 대신 ResizeObserver로 그 키 변화만 직접 듣는다(015)
  // The toolbar can keep growing after we measure and re-cover the caret (context row, wrapped buttons, late fonts); we listen for that height change directly via ResizeObserver instead of a timer (015)
  let watcher: { observe(el: Element): void; disconnect(): void } | null = null;
  let seenBar = -1;
  const onChromeSize = (): void => {
    const bar = chrome;
    if (!bar || !view) return;
    const height = Math.round(bar.getBoundingClientRect().height);
    if (height === seenBar) return;
    seenBar = height;
    if (height !== barHeight) {
      barHeight = height;
      writeVar(BAR_HEIGHT_VAR, height);
    }
    if (!watching || !armed) return;
    stuck = Number.NaN;
    afterEdit('edit');
  };

  const start = (): void => {
    if (unmounted) return;
    if (watching) return;
    watching = true;
    armed = true;
    stuck = Number.NaN;
    follow();
    view?.visualViewport?.addEventListener('resize', follow);
    view?.visualViewport?.addEventListener('scroll', follow);
    view?.addEventListener('pointerdown', takeOver, { passive: true });
    view?.addEventListener('scroll', onScroll, { passive: true });
    const Observer = (
      view as unknown as { ResizeObserver?: new (fn: () => void) => { observe(el: Element): void; disconnect(): void } }
    )?.ResizeObserver;
    if (Observer && chrome) {
      seenBar = Math.round(chrome.getBoundingClientRect().height);
      watcher = new Observer(onChromeSize);
      watcher.observe(chrome);
    }
  };
  const stop = (): void => {
    if (!watching) return;
    watching = false;
    if (frame !== 0) view?.cancelAnimationFrame(frame);
    frame = 0;
    view?.visualViewport?.removeEventListener('resize', follow);
    view?.visualViewport?.removeEventListener('scroll', follow);
    view?.removeEventListener('pointerdown', takeOver);
    view?.removeEventListener('scroll', onScroll);
    watcher?.disconnect();
    watcher = null;
    seenBar = -1;
    writeVar(KEYBOARD_TOP_VAR, 0);
    writeVar(KEYBOARD_BOTTOM_VAR, 0);
    writeVar(BAR_HEIGHT_VAR, 0);
    barHeight = 0;
    seenTop = 0;
    seenHeight = 0;
    sighted = false;
    mine = -1;
    viewHeight = -1;
    armed = false;
    closing = false;
    stuck = Number.NaN;
  };

  try {
    surface.addEventListener('focus', start);
    surface.addEventListener('blur', stop);
    if (owner.activeElement === surface) start();
  } catch (error) {
    unmounted = true;
    try {
      stop();
    } catch {}
    try {
      stopChange?.();
    } catch {}
    try {
      surface.removeEventListener('focus', start);
    } catch {}
    try {
      surface.removeEventListener('blur', stop);
    } catch {}
    try {
      styles.dispose();
    } catch {}
    if (ownSettle) {
      try {
        settle.unmount();
      } catch {}
    }
    throw error;
  }

  return {
    aim,
    unmount() {
      if (unmounted) return;
      unmounted = true;
      stop();
      stopChange?.();
      surface.removeEventListener('focus', start);
      surface.removeEventListener('blur', stop);
      styles.dispose();
      if (ownSettle) settle.unmount();
    },
  };
}
