// 저장 단추와 ⌘S가 같은 이 판을 연다 — 형식 칸을 고르는 것 자체가 저장이라 확인 단추가 없다. 붙여넣기 판과 격자 부품을 나눠 쓰되(parts/grid.ts), 이름 칸이 함께 서 있어 방향키 대신 Tab/Shift+Tab으로 형식을 옮긴다.
// The save button and Cmd+S open this same panel — picking a format cell is itself the save, so there's no separate confirm button. It shares its grid with the paste-choice panel (parts/grid.ts), but since a name field lives here too, Tab/Shift+Tab moves the highlight instead of arrow keys.
import { localeDirection, makeTranslator, type Translator } from '../locale/index.js';
import { saveMark, today, NABI_FILE_EXTENSION } from '../io/index.js';
import type { FileMount, SaveFormat } from '../surface/index.js';
import { make } from './parts/dom.js';
import { makeGrid } from './parts/grid.js';
import { openScrim, type Scrim } from './parts/scrim.js';
import type { Overlay } from './overlay.js';

export interface SavePanelOptions {
  readonly file: FileMount;
  // 닫히면 포커스가 여기로 돌아가고, 판이 속할 문서도 여기서 얻는다.
  // Focus returns here on close, and this is also where the panel's owner document comes from.
  readonly surface: HTMLElement;
  readonly locale?: string;
  readonly translator?: Translator;
}

// 이름 칸 옆에 서는 확장자 표식 — 겨눈 칸의 것이다. 자리를 벗어난 번호는 기본 형식으로 답한다(목록이 빈 자리). DOM 없는 판정이라 그물이 판을 안 띄우고 잡는다.
// The extension badge next to the name field — whatever the highlighted cell says. An out-of-range index falls back to the default format (an empty list). DOM-free, so tests can check it without mounting the panel.
export function extensionFor(formats: readonly SaveFormat[], at: number): string {
  const aimed = formats[at];
  if (aimed) return aimed.extension;
  return (
    formats.find((format) => format.extension === NABI_FILE_EXTENSION)?.extension ??
    formats[0]?.extension ??
    NABI_FILE_EXTENSION
  );
}

// 표식이 잡아 두는 자리의 너비 — 판에 뜬 확장자 중 가장 긴 것의 글자 수다. 표식이 겨눔을 따라 바뀌는데 폭까지 바뀌면 이름 칸이 늘었다 줄었다 해서 치던 글이 흔들린다.
// The width the badge reserves — the character count of the longest extension shown. Since the badge text changes with the highlight, letting its width change too would make the name field jitter while typing.
export function extWidth(formats: readonly SaveFormat[]): number {
  const lengths = formats.map((format) => format.extension.length);
  return lengths.length === 0 ? NABI_FILE_EXTENSION.length : Math.max(...lengths);
}

// 칸에 서는 이름 — 점을 뺀 소문자 확장자다(nabi·nhtml·md). 파일 이름의 꼬리라 사전에 안 살고, 나란히 서서 눈으로 견주는 자리라 길이가 흔들리면 안 된다. 확장자가 없는 호스트 형식은 제 id로 답한다.
// The name shown in a cell — the lowercase extension without its dot (nabi, nhtml, md). It's a filename tail, not a translated word, so it isn't in the dictionary, and its length must stay stable since cells sit side by side for comparison. A host format without an extension falls back to its own id.
export function formatName(format: SaveFormat): string {
  const bare = format.extension.replace(/^\.+/, '');
  return (bare === '' ? format.id : bare).toLowerCase();
}

export function openSavePanel(options: SavePanelOptions): Overlay {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  const formats = options.file.formats();
  const direction = localeDirection(t.locale);

  const card = make(owner, 'div', 'nabi-card nabi-save', {
    tabindex: '-1',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': t.t('save.title'),
    dir: direction,
  });
  const title = make(owner, 'div', 'nabi-save-title');
  title.textContent = t.t('save.title');

  // 이름 줄 — 칸은 날짜만 들고 열린다. 이름까지 지어 주면 사람이 그것을 먼저 지우고 써야 한다: 날짜 뒤에 빈칸 하나만 두면 열리자마자 이어서 치면 된다.
  // The name field opens with just the date — supplying a whole name would force the user to delete it first; a trailing space after the date lets them type right away instead.
  const row = make(owner, 'div', 'nabi-save-name');
  const input = make(owner, 'input', 'nabi-input', {
    type: 'text',
    'aria-label': t.t('save.name'),
    placeholder: t.t('save.name'),
  }) as HTMLInputElement;
  input.value = `${today()} `;
  const ext = make(owner, 'span', 'nabi-save-ext');
  // 표식의 자리는 가장 긴 확장자에 맞춰 미리 잡는다 — 겨눔이 옮겨 가도 이름 칸이 안 흔들린다.
  // The badge's width is reserved for the longest extension up front, so the name field doesn't shift as the highlight moves.
  ext.style.setProperty('--nabi-save-ext-len', String(extWidth(formats)));
  row.append(input, ext);

  let active = true;
  let scrim: Scrim | null = null;

  // 저장은 한 번뿐이다 — 칸을 두 번 누르거나 엔터가 겹쳐 와도 판이 이미 닫혀 있다.
  // Only saves once — a double click or an overlapping Enter finds the panel already closed.
  let done = false;
  const put = (at: number): void => {
    const format = formats[at];
    if (!active || done || !format) return;
    done = true;
    options.file.saveAs(format.id, input.value);
    scrim?.close();
  };

  const paintExt = (at: number): void => {
    ext.textContent = extensionFor(formats, at);
  };

  try {
    const grid = makeGrid(owner, {
      prefix: 'nabi-save',
      rtl: direction === 'rtl',
      aimBy: 'tab',
      cells: formats.map((format) => ({
        label: formatName(format),
        // 그림은 붙여넣기 판의 것을 그대로 쓴다 — html은 </>, md는 MD 두 글자, nabi는 OG의 나비 마크. 없는 형식(호스트의 것)은 그림 자리를 안 만든다.
        // Icons are reused from the paste-choice panel — `</>` for html, "MD" for md, the OG butterfly mark for nabi. A host format without one gets no icon slot.
        ...(saveMark(format.extension) !== '' ? { icon: saveMark(format.extension) } : {}),
        // 되돌아오지 못하는 형식에만 한 마디가 붙는다 — 누르는 것을 막지는 않는다.
        // Only lossy formats get this note — it doesn't stop the press.
        ...(format.lossy ? { note: t.t('save.lossy') } : {}),
        ariaLabel: t.t('save.as', { ext: formatName(format) }),
      })),
      onAim: paintExt,
      onPick: put,
    });
    card.append(title, row, grid.list);

    // 이름 칸의 엔터는 지금 겨눈 형식으로 저장한다. Tab/Shift+Tab만 예외로 형식을 훑되 포커스는 이름 칸에 그대로 둔다(preventDefault로 브라우저의 겨눔 이동을 막는다) — 형식 단추는 진짜 탭 순서에 안 서므로(겨눔이 아리아 표식뿐) 이 길이 키보드만으로 형식에 닿는 유일한 길이다.
    // Enter in the name field saves with whatever format is currently highlighted. Only Tab/Shift+Tab cycles the format while focus stays in the field (preventDefault blocks the browser's own focus move) — since format buttons aren't real Tab stops (the highlight is only an ARIA marker), this is the only keyboard path to them.
    input.addEventListener('keydown', (event) => {
      if (!active) return;
      event.stopPropagation();
      if (event.key === 'Tab') {
        grid.key(event);
        return;
      }
      if (event.key !== 'Enter') return;
      event.preventDefault();
      put(grid.aimed());
    });

    // 키는 카드가 받아 격자에 건넨다 — 붙여넣기 판과 같은 길이되, 이 판이 듣는 겨눔 키는 Tab뿐이다(aimBy: 'tab'). 방향키는 여기서도 격자가 안 집는다 — 이름 칸의 키다.
    // Keys are caught by the card and forwarded to the grid, same as the paste-choice panel, but this panel's aim key is only Tab (aimBy: 'tab'). Arrow keys still aren't taken by the grid here either — they belong to the name field.
    card.addEventListener('keydown', (event) => {
      grid.key(event);
    });

    paintExt(grid.aimed());
    scrim = openScrim(owner, {
      card,
      restore: options.surface,
      onClose: () => {
        active = false;
      },
    });
    card.focus({ preventScroll: true });
    return { card, close: () => scrim?.close() };
  } catch (error) {
    active = false;
    if (scrim) {
      try {
        scrim.close();
      } catch {}
    }
    throw error;
  }
}
