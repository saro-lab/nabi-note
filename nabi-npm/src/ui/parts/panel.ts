// 뜨는 판 열닫 — **하나**다. 격자·차림표·주소 상자가 전부 이 부품 위에 선다.
// 옛 판은 피커마다 자리 잡기와 바깥 클릭 처리를 따로 들었다.
//
// 자리 잡기는 CSS 흐름에 맡긴다 — 판은 누른 버튼의 **부모**(`position: relative` 인 그룹)에
// 들어가므로, 붙는 툴바가 움직여도 판이 저절로 따라간다. JS 로 따라다닐 것이 없다.
//
// 그 위에 두 가지가 얹힌다 (084 ②):
//   1. **네 변을 다 본다** — 가장자리 버튼에서 열면 판이 뷰포트를 넘어 잘렸다. 열 때 한 번 재서
//      좌·우·위·아래를 밀어 넣는다. 산수는 아래 순수부에 있고 DOM 이 없다.
//   2. **작은 화면은 가운데로** — 버튼에 붙는 자리를 버리고 화면 한가운데 90% 로 선다.
//      그 갈래는 **시트가 세운다**(`css.ts` 의 `@media (max-width: 40rem)`): CSS 로 가르면
//      창을 돌리거나 줄이는 것을 판이 열려 있는 동안에도 따라간다. 여기서는 "가운데가 어디인가"
//      한 값만 재서 넘긴다 — 그것만은 CSS 가 못 아는 것이라서다(아래 `follow`).
import { focusQuiet, make } from './dom.js';
import { closeOnOutside } from './outside.js';

// --- 순수 산수 — 뷰포트 안으로 밀어 넣기 (DOM 없이 그물에 잡힌다) ------------------------------

// 버튼과 판 사이의 틈.
export const PANEL_GAP = 6;
// 판과 뷰포트 사이에 남기는 여백 — **네 변 모두**. 0 이면 판이 화면 모서리에 딱 붙어, 잘린
// 것인지 거기서 끝난 것인지 눈이 못 가른다.
export const PANEL_EDGE = 8;

// 한 축의 보정 거리 — 가로·세로가 **같은 셈**이라 한 벌뿐이다. 양수면 뒤로(오른쪽·아래) 민다.
// 옛 셈은 뒤 변만 봤다: 오른쪽으로 넘칠 때만 왼쪽으로 밀고, 그 바람에 왼쪽으로 밀려난 판이
// 이번엔 왼쪽으로 넘쳤다(`Math.max(0, …)` 이 막던 것은 부모 안의 0 이지 화면의 왼쪽이 아니다).
export function edgeShift(start: number, size: number, room: number, edge: number = PANEL_EDGE): number {
  const first = edge;
  const last = room - edge - size;
  // 뷰포트보다 큰 판은 어느 쪽이든 잘린다 — 그러면 **앞을 맞춘다**: 격자의 첫 줄, 글의 첫
  // 글자가 잘리는 것이 뒤가 잘리는 것보다 나쁘다.
  if (last < first) return first - start;
  return Math.min(Math.max(start, first), last) - start;
}

// 잰 판 하나 — 전부 뷰포트 좌표다(`getBoundingClientRect` 가 주는 그 좌표계).
export interface PanelBox {
  // 버튼 아래에 붙여 놓고 한 번 잰 판.
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  // 버튼의 윗변 — 아래가 막혔을 때 **위로 뒤집는** 자리를 여기서 잰다.
  readonly anchorTop: number;
  // 가로로 갇히는 띠 — **편집기의 좌우**다(뷰포트가 아니다). 편집기가 화면보다 좁으면 판이
  // 화면 안이어도 편집기 밖으로 삐져나가고, 그러면 판이 어느 편집기의 것인지가 흐려진다.
  // 시작이 0 이면 옛 셈 그대로다(띠 = 뷰포트).
  readonly viewLeft?: number;
  readonly viewWidth: number;
  readonly viewHeight: number;
}

// 밀어 넣을 거리 둘. 가로는 곧장 밀고, 세로는 **뒤집기를 먼저 본다**.
export function panelShift(box: PanelBox): { readonly dx: number; readonly dy: number } {
  const left = box.viewLeft ?? 0;
  const dx = edgeShift(box.left - left, box.width, box.viewWidth);

  // 아래가 넘치는데 위에 자리가 있으면 버튼 위로 뒤집는다 — 그냥 위로 밀면 판이 누른 버튼을
  // 덮어, 무엇을 눌러 연 판인지가 화면에서 사라진다.
  const flipped = box.anchorTop - PANEL_GAP - box.height;
  const spills = box.top + box.height > box.viewHeight - PANEL_EDGE;
  const top = spills && flipped >= PANEL_EDGE ? flipped : box.top;
  const dy = top + edgeShift(top, box.height, box.viewHeight) - box.top;
  return { dx, dy };
}

// --- 판 ----------------------------------------------------------------------------------------

// 작은 화면 갈래가 쓰는 두 값 — 시트가 기본값(`50%` · `90dvh`)을 들고 있어서 이 변수가 비어도
// 판은 선다. 채우는 자리는 아래 `follow` 하나뿐이다.
const MID_VAR = '--nabi-panel-mid';
const ROOM_VAR = '--nabi-panel-room';

export interface Panel {
  readonly root: HTMLElement;
  close(): void;
}

export interface PanelOptions {
  readonly anchor: HTMLElement;
  readonly className?: string;
  // 닫힌 뒤 포커스가 갈 자리 (편집 표면).
  readonly restore?: HTMLElement | null;
  readonly onClose?: () => void;
}

export function openPanel(owner: Document, options: PanelOptions): Panel {
  const { anchor } = options;
  const root = make(owner, 'div', options.className ? `nabi-panel ${options.className}` : 'nabi-panel', {
    tabindex: '-1',
  });

  // 보이는 뷰포트 — 키보드가 올라오면 짧아지고 위로 밀리는 그 사각형이다. 없는 브라우저에서는
  // 시트의 기본값(창 한가운데)이 그대로 산다.
  const visual = owner.defaultView?.visualViewport ?? null;

  let closed = false;
  const close = (): void => {
    if (closed) return;
    closed = true;
    stopOutside();
    owner.removeEventListener('keydown', onKey, true);
    visual?.removeEventListener('resize', follow);
    visual?.removeEventListener('scroll', follow);
    root.remove();
    anchor.removeAttribute('aria-expanded');
    focusQuiet(options.restore ?? null);
    options.onClose?.();
  };

  const onKey = (event: Event): void => {
    const key = (event as KeyboardEvent).key;
    if (key !== 'Escape' && key !== 'Tab') return;
    event.preventDefault();
    close();
  };

  // 가운데는 **보이는 뷰포트의 가운데**다. 고정 배치의 좌표계는 레이아웃 뷰포트라, iOS 에서
  // 키보드가 올라오면 `50%` 는 이미 키보드 뒤다 — 주소를 받는 판(prompt)이 바로 그 판이고,
  // 그 판이 입력 칸을 `preventScroll` 없이 겨누는 까닭도 "칸이 키보드에 안 가리게" 였다.
  // 고정 배치는 굴려서 피할 수 없으니(굴려도 안 움직인다) 여기서 자리를 옮겨 그 뜻을 지킨다.
  // 키가 남은 만큼도 함께 적는다 — 키보드가 먹고 남은 자리보다 판이 크면 판 안에서 구른다.
  const follow = (): void => {
    if (!visual) return;
    root.style.setProperty(MID_VAR, `${Math.round(visual.offsetTop + visual.height / 2)}px`);
    root.style.setProperty(ROOM_VAR, `${Math.round(visual.height * 0.9)}px`);
  };

  (anchor.parentElement ?? owner.body).append(root);
  anchor.setAttribute('aria-expanded', 'true');
  follow();
  place(owner, root, anchor);
  // **채워진 뒤에 한 번 더 잰다.** 부르는 쪽은 판을 받아 간 다음에 속을 채운다
  // (`panel.root.append(grid, readout)`) — 그래서 위의 한 번은 늘 **빈 상자**를 잰다.
  // 그 크기로 민 값은 언제나 0 이었고, 네 변 보기가 사실상 안 돌았다 (실측: 잰 폭 14px,
  // 실제 179px — 격자 판이 편집기를 뚫고 나가던 것이 이것이다).
  // 마이크로태스크는 부르는 쪽의 동기 append **다음**이면서 **그림보다는 앞**이라, 판이 옮겨
  // 가는 것이 눈에 안 보인다. `place` 는 제자리에서 다시 재고 다시 적으므로 두 번 불러도 같다.
  queueMicrotask(() => {
    if (!closed) place(owner, root, anchor);
  });

  owner.addEventListener('keydown', onKey, true);
  // 창을 돌리거나 키보드가 오르내리면 가운데도 옮겨 간다 — 큰 화면에서는 이 변수를 아무도
  // 안 읽으므로 값만 갱신되고 화면은 가만있는다.
  visual?.addEventListener('resize', follow);
  visual?.addEventListener('scroll', follow);
  const stopOutside = closeOnOutside(owner, () => [root, anchor], close);
  return { root, close };
}

// 버튼 바로 아래 — 그러고 나서 네 변을 다 보고 뷰포트 안으로 밀어 넣는다.
//
// 자리 값은 **버튼의 부모 좌표**로 적고(그래야 툴바가 움직여도 따라간다), 넘침은 **뷰포트
// 좌표**로 잰다. 둘을 잇는 것이 "잰 자리에서 얼마나 밀까" 라는 거리 하나다 — 자리를 뷰포트
// 좌표로 다시 적으면 부모를 따라다니는 성질이 그 자리에서 죽는다.
//
// 작은 화면에서는 시트가 이 인라인 값을 `!important` 로 이겨 판이 가운데 선다 — 여기서 잰
// 사각형이 이미 그 가운데 사각형이라 보정은 0 으로 떨어지고, 적어 둔 값은 조용히 안 쓰인다.
function place(owner: Document, panel: HTMLElement, anchor: HTMLElement): void {
  const start = anchor.offsetLeft;
  const head = anchor.offsetTop + anchor.offsetHeight + PANEL_GAP;
  // **물리 속성으로 적는다** (`left`·`top`, 논리 속성이 아니다). 재는 것이 전부 물리 좌표이기
  // 때문이다 — `offsetLeft` 도 `getBoundingClientRect().left` 도 글의 방향과 상관없이 화면의
  // 왼쪽에서 잰다. 그 값을 `inset-inline-start` 에 적으면 RTL 에서 그것이 **오른쪽에서 잰 거리**로
  // 읽혀 판이 반대편에 서고, 아래의 밀어 넣기(dx)마저 부호가 뒤집혀 잘리는 쪽으로 더 민다.
  // 좁은 화면 갈래는 그대로 산다 — 시트의 `inset-inline: 5vw !important` 가 left·right 를 함께
  // 덮으므로 여기 적은 값을 이긴다.
  panel.style.left = `${start}px`;
  panel.style.top = `${head}px`;

  const box = panel.getBoundingClientRect();
  const seat = anchor.getBoundingClientRect();
  const view = owner.documentElement;

  // 가로로 갇히는 자리는 **편집기의 좌우**다 — 화면이 아니다. 편집기가 화면보다 좁으면(문서
  // 사이트의 데모, 두 단 편집기, 좁은 사이드바) 화면만 보고 민 판이 편집기 밖으로 삐져나간다.
  // 화면과의 교집합을 쓰는 까닭: 편집기가 화면 밖으로 걸쳐 있어도 판은 보이는 데 서야 한다.
  // 툴바가 편집기 밖에 선 호스트도 있으므로, 못 찾으면 옛 셈(화면 전체) 그대로 간다.
  const frame = anchor.closest('.nabi')?.getBoundingClientRect() ?? null;
  const bandStart = frame ? Math.max(frame.left, 0) : 0;
  const bandEnd = frame ? Math.min(frame.right, view.clientWidth) : view.clientWidth;

  const { dx, dy } = panelShift({
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    anchorTop: seat.top,
    viewLeft: bandStart,
    viewWidth: Math.max(0, bandEnd - bandStart),
    viewHeight: view.clientHeight,
  });
  if (dx !== 0) panel.style.left = `${start + dx}px`;
  if (dy !== 0) panel.style.top = `${head + dy}px`;
}
