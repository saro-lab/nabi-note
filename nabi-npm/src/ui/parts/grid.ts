// 붙여넣기 판과 저장 판이 나눠 쓰는 격자다 — 갈리는 것은 클래스 앞머리·칸 내용·겨눔 키(aimBy)뿐, 산수와 DOM은 하나뿐이다. 겨눔은 aria-selected만으로 말한다(진짜 포커스를 옮기면 저장 판의 이름 입력이 끊긴다).
// Shared by the paste-choice panel and the save panel — only the class prefix, cell content, and aim key (aimBy) differ; the math and DOM-building are one function. The highlighted cell is marked via aria-selected only, since moving real focus there would interrupt typing in the save panel's name field.
import { MARK_STROKE } from '../../io/index.js';
import { iconSvg, make } from './dom.js';

// 한 줄에 셋까지, 넷째부터는 아랫줄. 시트의 열 수와 걸음의 열 수는 같은 하나여야 한다 — 갈리면 방향키가 눈에 보이는 격자와 다른 곳으로 간다.
// Up to three per row, wrapping after that. The stylesheet's column count and the step math's must be the same one value, or arrow keys would move somewhere other than what's visible.
export const GRID_COLS = 3;

// 열릴 때 첫 겨눔은 셋 이상이면 첫 줄 가운데(1)에서 시작하고, 셋보다 적으면 맨 앞(0)이다 — 화면 없는 환경의 답(silentAsk.choose=0)과는 무관한 별개의 산수다.
// The initial highlight starts at the middle of the first row (index 1) when there are 3+ options, else index 0 — unrelated to the headless-environment answer (silentAsk.choose = 0), which is a separate concern.
export function initialChoice(len: number): number {
  return len >= 3 ? 1 : 0;
}

// 좌우는 전체 순서를 순환하고, 상하는 같은 열을 세로로 순환한다(마지막 줄이 모자라면 가장 가까운 칸에 붙는다). 화살표가 아니거나 고를 것이 없으면 -1. rtl(ar·ur)에서는 좌우가 뒤집힌다.
// Left/right wraps through the full sequence; up/down cycles the same column (a short last row snaps to its nearest cell). Returns -1 for a non-arrow key or nothing to pick. In rtl (ar, ur), left and right swap.
export function gridStep(at: number, len: number, key: string, cols = GRID_COLS, rtl = false): number {
  if (len <= 0 || cols <= 0) return -1;
  const wrap = (to: number): number => ((to % len) + len) % len;
  const across = key === 'ArrowRight' ? (rtl ? -1 : 1) : key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
  if (across !== 0) return wrap(at + across);
  const down = key === 'ArrowDown' ? 1 : key === 'ArrowUp' ? -1 : 0;
  if (down === 0) return -1;
  // 줄이 하나뿐이면(후보 셋 이하) 위아래도 그 줄을 걷는다 — 안 움직이는 화살표보다 낫다.
  // With only one row (3 or fewer candidates), up/down also walks that row — better than an arrow that does nothing.
  if (len <= cols) return wrap(at + down);
  const lines = Math.ceil(len / cols);
  const line = (((Math.floor(at / cols) + down) % lines) + lines) % lines;
  return Math.min(line * cols + (at % cols), len - 1);
}

export interface GridCell {
  readonly label: string;
  // 없어도 된다: 호스트 필터의 후보는 이름만으로 가운데 선다(빈 자리를 안 남긴다).
  // Optional — a host filter's candidates center on the name alone, without leaving a blank gap.
  readonly icon?: string;
  // 이름 아래 작은 글씨 — 저장 판의 `(손실저장)` 이 이 자리다. 없으면 줄이 안 선다.
  // Small text under the name — the save panel's `(lossy)` note lives here; absent, the row doesn't appear.
  readonly note?: string;
  // 눈에 보이는 이름이 짧을 때 도우미가 읽을 긴 말(저장 판의 "MD 로 저장").
  // The longer phrase a screen reader uses when the visible name is short (the save panel's "Save as MD").
  readonly ariaLabel?: string;
}

export interface GridOptions {
  readonly cells: readonly GridCell[];
  // 클래스 앞머리 — `nabi-choose` · `nabi-save`. 시트가 둘을 한 규칙으로 묶어 든다.
  // Class prefix — `nabi-choose` or `nabi-save`; one stylesheet rule covers both.
  readonly prefix: string;
  readonly rtl?: boolean;
  // 겨눔을 옮기는 키 — 판마다 다른 값이다: arrows(기본, 붙여넣기 판)는 방향키, tab(저장 판)은 이름 칸의 캐럿 이동과 안 겹치게 Tab/Shift+Tab을 쓴다. 걸음 산수는 어느 쪽이나 gridStep 하나다.
  // Which key moves the highlight — differs per panel: arrows (default, paste-choice) uses the arrow keys; tab (save panel) uses Tab/Shift+Tab so it doesn't collide with the arrow keys editing the name field. Either way, the step math is the same gridStep.
  readonly aimBy?: 'arrows' | 'tab';
  // 겨눔이 옮겨 갈 때마다 — 저장 판이 이름 칸 옆 확장자 표식을 여기서 고쳐 쓴다.
  // Fires on every highlight move — the save panel updates its extension badge next to the name field here.
  readonly onAim?: (at: number) => void;
  readonly onPick: (at: number) => void;
}

export interface Grid {
  readonly list: HTMLElement;
  readonly aimed: () => number;
  readonly aim: (at: number) => void;
  // 카드가 받은 키 하나를 건넨다 — 여기서 처리했으면 `true`(그 키는 판 밖으로 안 샌다).
  // Forwards one key the card received; `true` means it was handled here and won't leak past the panel.
  readonly key: (event: KeyboardEvent) => boolean;
}

export function makeGrid(owner: Document, options: GridOptions): Grid {
  const { cells, prefix } = options;
  const list = make(owner, 'div', `${prefix}-list`, { role: 'listbox' });
  // 열 수를 시트에 건넨다 — 판의 폭이 칸 수를 따라간다(셋이 상한). 둘이면 둘만큼만 넓다.
  // Column count passed to the stylesheet — the panel's width follows the cell count (capped at three); two cells means only two wide.
  const cols = Math.min(Math.max(cells.length, 1), GRID_COLS);
  list.style.setProperty('--nabi-grid-cols', String(cols));

  let aimed = initialChoice(cells.length);

  const rows: HTMLElement[] = cells.map((cell, at) => {
    const row = make(owner, 'button', `${prefix}-row`, {
      type: 'button',
      role: 'option',
      // 겨눔이 아리아 표식 하나뿐이라, 탭으로 여기 설 자리를 안 만든다.
      // The highlight is only an ARIA marker, so this isn't a Tab stop.
      tabindex: '-1',
      ...(cell.ariaLabel !== undefined ? { 'aria-label': cell.ariaLabel } : {}),
    });
    // 그림이 없으면 자리도 안 만든다 — 빈 칸 하나가 남으면 그 줄만 아래로 처져 보인다.
    // No icon means no slot for one — a leftover blank spot would sag that row out of line with the rest.
    if (cell.icon !== undefined && cell.icon !== '') {
      const mark = make(owner, 'span', `${prefix}-icon`);
      // 굵기는 한 값(MARK_STROKE)뿐이다 — 나란히 선 그림들의 선이 갈리면 하나만 흐려 보인다.
      // A single stroke width (MARK_STROKE) — mismatched line weights among neighboring icons would make one look faint.
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
    // Sight and pointer must agree — whatever cell the mouse rests on is the highlighted one.
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

  // 카드가 받은 키 하나 — 이 판의 겨눔 키만 우리 것이다. 걸음은 새로 안 센다: Tab/Shift+Tab을 화살표 이름으로 바꿔 기존 gridStep에 그대로 건넨다(rtl 순환도 거기 것 그대로다).
  // One key forwarded from the card — only this panel's aim key belongs to us. Tab/Shift+Tab is simply relabeled to an arrow name and handed to the same gridStep (rtl wrapping comes along for free).
  const key = (event: KeyboardEvent): boolean => {
    const rtl = options.rtl === true;
    const byTab = options.aimBy === 'tab';
    // 우리 것이 아닌 키는 손도 안 댄다 — 탭 판의 방향키는 이름 칸의 캐럿을 옮기는 키이고, 방향키 판의 Tab은 브라우저의 것이다.
    // Keys that aren't ours are left alone — in the tab panel, arrow keys move the caret in the name field; in the arrows panel, Tab is the browser's.
    const aimKey =
      event.key === 'Tab'
        ? byTab
          ? event.shiftKey !== rtl
            ? 'ArrowLeft'
            : 'ArrowRight'
          : ''
        : byTab
          ? ''
          : event.key;
    const next = aimKey === '' ? -1 : gridStep(aimed, rows.length, aimKey, GRID_COLS, rtl);
    if (next >= 0) {
      event.preventDefault();
      aim(next);
      return true;
    }
    // 탭 판에서는 고를 칸이 하나도 없어도 Tab이 판 밖으로 안 샌다 — 겨눔이 덮개 뒤로 넘어가면 돌아올 길이 없다(모달의 관례).
    // In the tab panel, Tab never escapes the panel even with nothing to select — losing focus behind the scrim would leave no way back (standard modal behavior).
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
