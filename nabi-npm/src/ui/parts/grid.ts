// 나란히 선 칸 몇 — **판 둘이 나눠 쓰는 한 부품**이다. 붙여넣기(고르는 판)와 저장 판이
// 같은 격자를 쓴다(주인 지시 2026-08-23: "붙여넣기처럼 3개 보이게" · "마우스 오버 CSS 도
// 배경색 없고 테두리 파랑 … 방향키 제어랑 처음 뜨는 위치도").
//
// 갈라 두면 다음에 한쪽만 고쳐져 또 어긋난다 — 그래서 격자의 산수(`gridStep`·`initialChoice`)도
// DOM 을 짓는 손도 여기 하나뿐이고, 판마다 다른 것은 **클래스 앞머리와 칸의 내용**, 그리고
// **겨눔을 옮기는 키**(`aimBy`)뿐이다. 마지막 것이 갈리는 까닭은 판의 모양이 달라서다:
// 저장 판에는 이름 칸이 함께 서 있어 방향키가 이미 임자 있는 키라 Tab 으로 고르고, 붙여넣기
// 판에는 글 칸이 없어 방향키가 그대로 정본이다(주인 지시 2026-08-23, 문서 012).
//
// 겨눔은 **아리아 표식 하나**로만 말한다(`aria-selected`) — 진짜 포커스를 칸으로 옮기지 않는다:
// 저장 판에는 이름 칸이 함께 서 있어, 마우스가 스치기만 해도 포커스가 옮겨 가면 치던 글이
// 끊긴다. 그래서 칸은 `tabindex="-1"` 이고 키는 카드가 받아 여기로 건넨다.
import { MARK_STROKE } from '../../io/index.js';
import { iconSvg, make } from './dom.js';

// 한 줄에 셋까지, 넷째부터는 아랫줄. 시트의 열 수와 걸음의 열 수는 **같은 하나**여야 한다 —
// 갈리면 방향키가 눈에 보이는 격자와 다른 곳으로 간다. 그래서 여기 하나만 두고 시트에 건넨다.
export const GRID_COLS = 3;

// 열릴 때의 **첫 겨눔**. 셋 이상이면 첫 줄 **가운데**(자리 1)에서 시작한다 — 판이 열리자마자
// 눈이 가는 곳과 겨눔이 같고, 좌우 어느 쪽으로든 한 걸음이면 이웃에 닿는다. 셋보다 적으면
// 가운데가 없으니 맨 앞(0)이다.
// **이것은 판이 열릴 때의 겨눔뿐이다** — 화면 없는 환경의 답(`silentAsk.choose` = 0, 맨 위)은
// 이 산수와 무관하다: 거기서는 "가장 그럴듯한 해석"이 곧 답이다.
export function initialChoice(len: number): number {
  return len >= 3 ? 1 : 0;
}

// 격자 한 칸 걸음 — 좌우는 전체 순서를 순환하고(줄 끝에서 다음 줄 머리로 감긴다), 상하는 같은
// 열을 세로로 순환한다. 마지막 줄이 모자라 그 열이 비었으면 가장 가까운 칸(끝 칸)에 붙는다.
// 화살표가 아니거나 고를 것이 없으면 **-1**: "이 키는 우리 것이 아니다".
// rtl(ar·ur)에서는 좌우가 뒤집힌다 — 줄이 오른쪽에서 왼쪽으로 서니 오른쪽 화살표가 앞이다.
// DOM 이 없는 산수라 여기 순수 함수로 서 있고, 그물이 판을 안 띄우고도 이것을 잡는다.
export function gridStep(at: number, len: number, key: string, cols = GRID_COLS, rtl = false): number {
  if (len <= 0 || cols <= 0) return -1;
  const wrap = (to: number): number => ((to % len) + len) % len;
  const across = key === 'ArrowRight' ? (rtl ? -1 : 1) : key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
  if (across !== 0) return wrap(at + across);
  const down = key === 'ArrowDown' ? 1 : key === 'ArrowUp' ? -1 : 0;
  if (down === 0) return -1;
  // 줄이 하나뿐이면(후보 셋 이하) 위아래도 그 줄을 걷는다 — 안 움직이는 화살표보다 낫다.
  if (len <= cols) return wrap(at + down);
  const lines = Math.ceil(len / cols);
  const line = (((Math.floor(at / cols) + down) % lines) + lines) % lines;
  return Math.min(line * cols + (at % cols), len - 1);
}

// 칸 하나에 들어가는 것 — 그림(16×16 svg 의 속)·이름·이름 아래 아주 작은 한 마디.
export interface GridCell {
  readonly label: string;
  // 없어도 된다: 호스트 필터의 후보는 이름만으로 가운데 선다(빈 자리를 안 남긴다).
  readonly icon?: string;
  // 이름 아래 작은 글씨 — 저장 판의 `(손실저장)` 이 이 자리다. 없으면 줄이 안 선다.
  readonly note?: string;
  // 눈에 보이는 이름이 짧을 때 도우미가 읽을 긴 말(저장 판의 "MD 로 저장").
  readonly ariaLabel?: string;
}

export interface GridOptions {
  readonly cells: readonly GridCell[];
  // 클래스 앞머리 — `nabi-choose` · `nabi-save`. 시트가 둘을 한 규칙으로 묶어 든다.
  readonly prefix: string;
  readonly rtl?: boolean;
  // **겨눔을 옮기는 키** — 판마다 다른 둘째 것이다(첫째는 클래스 앞머리와 칸의 내용).
  //   `arrows`(기본, 붙여넣기 판) — 방향키. 그 판에는 글 칸이 없어 겹칠 것이 없다.
  //   `tab`(저장 판) — Tab/Shift+Tab. 이름 칸이 함께 서 있어 ←/→ 는 캐럿을 옮기는 키이고
  //   ↑/↓ 도 글 다루는 키다: 그것으로 형식을 옮기면 사람이 이름을 고칠 길이 사라진다
  //   (주인 지시 2026-08-23: "진짜 파일 이름 고치려고 움직이는 키와 구분이 안 돼").
  // 걸음의 산수는 어느 쪽이나 `gridStep` 하나다 — 갈리는 것은 **어느 키를 듣느냐**뿐이다.
  readonly aimBy?: 'arrows' | 'tab';
  // 겨눔이 옮겨 갈 때마다 — 저장 판이 이름 칸 옆 확장자 표식을 여기서 고쳐 쓴다.
  readonly onAim?: (at: number) => void;
  readonly onPick: (at: number) => void;
}

export interface Grid {
  readonly list: HTMLElement;
  readonly aimed: () => number;
  readonly aim: (at: number) => void;
  // 카드가 받은 키 하나를 건넨다 — 여기서 처리했으면 `true`(그 키는 판 밖으로 안 샌다).
  readonly key: (event: KeyboardEvent) => boolean;
}

export function makeGrid(owner: Document, options: GridOptions): Grid {
  const { cells, prefix } = options;
  const list = make(owner, 'div', `${prefix}-list`, { role: 'listbox' });
  // 열 수를 시트에 건넨다 — 판의 폭이 **칸 수**를 따라간다(셋이 상한). 둘이면 둘만큼만 넓다.
  const cols = Math.min(Math.max(cells.length, 1), GRID_COLS);
  list.style.setProperty('--nabi-grid-cols', String(cols));

  let aimed = initialChoice(cells.length);

  const rows: HTMLElement[] = cells.map((cell, at) => {
    const row = make(owner, 'button', `${prefix}-row`, {
      type: 'button',
      role: 'option',
      // 겨눔이 아리아 표식 하나뿐이라, 탭으로 여기 설 자리를 안 만든다(위 머리글).
      tabindex: '-1',
      ...(cell.ariaLabel !== undefined ? { 'aria-label': cell.ariaLabel } : {}),
    });
    // 그림이 없으면 자리도 안 만든다 — 빈 칸 하나가 남으면 그 줄만 아래로 처져 보인다.
    if (cell.icon !== undefined && cell.icon !== '') {
      const mark = make(owner, 'span', `${prefix}-icon`);
      // 굵기는 한 값(MARK_STROKE)뿐이다 — 나란히 선 그림들의 선이 갈리면 하나만 흐려 보인다.
      mark.innerHTML = iconSvg(cell.icon, MARK_STROKE);
      row.append(mark);
    }
    const label = make(owner, 'span', `${prefix}-label`);
    label.textContent = cell.label;
    row.append(label);
    if (cell.note !== undefined && cell.note !== '') {
      const note = make(owner, 'small', `${prefix}-note`);
      note.textContent = cell.note;
      row.append(note);
    }
    row.addEventListener('click', () => options.onPick(at));
    // 눈과 손이 갈리면 안 된다 — 마우스가 얹힌 칸이 곧 겨눈 칸이다.
    row.addEventListener('mousemove', () => aim(at));
    list.append(row);
    return row;
  });

  const paint = (): void => {
    rows.forEach((row, at) => {
      row.setAttribute('aria-selected', at === aimed ? 'true' : 'false');
    });
  };

  function aim(at: number): void {
    if (at === aimed || at < 0 || at >= rows.length) return;
    aimed = at;
    paint();
    options.onAim?.(at);
  }

  // 카드가 받은 키 하나 — **이 판의 겨눔 키만** 우리 것이다(위 `aimBy`).
  //
  // 걸음은 **새로 안 센다**: Tab = 가로 다음, Shift+Tab = 가로 이전이라, 방향키가 걷던 그
  // `gridStep` 에 화살표 이름으로 건넨다(끝에서 감기는 순환도 거기 것 그대로다).
  // rtl 에서는 줄이 오른쪽에서 왼쪽으로 서니 "다음"이 왼쪽 화살표다 — 둘이 겹치면 다시 뒤집힌다.
  const key = (event: KeyboardEvent): boolean => {
    const rtl = options.rtl === true;
    const byTab = options.aimBy === 'tab';
    // 우리 것이 아닌 키는 손도 안 댄다 — 탭 판의 방향키는 이름 칸의 캐럿을 옮기는 키이고,
    // 방향키 판의 Tab 은 브라우저의 것이다(붙여넣기 판은 옛 길 그대로 둔다).
    const aimKey = event.key === 'Tab'
      ? (byTab ? (event.shiftKey !== rtl ? 'ArrowLeft' : 'ArrowRight') : '')
      : (byTab ? '' : event.key);
    const next = aimKey === '' ? -1 : gridStep(aimed, rows.length, aimKey, GRID_COLS, rtl);
    if (next >= 0) {
      event.preventDefault();
      aim(next);
      return true;
    }
    // 탭 판에서는 고를 칸이 하나도 없어도 Tab 이 판 밖으로 안 샌다 — 겨눔이 덮개 뒤로
    // 넘어가면 돌아올 길이 없다(모달의 관례).
    if (byTab && event.key === 'Tab') {
      event.preventDefault();
      return true;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      options.onPick(aimed);
      return true;
    }
    return false;
  };

  paint();
  return { list, aimed: () => aimed, aim, key };
}
