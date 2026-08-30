// 저장 판 — 이름 한 칸과 형식 몇 칸. 저장 단추와 ⌘S 가 **같은 이 판**을 연다.
//
// 옛 판에서는 손이 둘이었다: 단추는 이름을 묻고 ⌘S 는 그대로 저장했다. 형식이 여럿이 된 뒤로
// 그 갈래가 뜻을 잃는다 — "지금 그대로" 라는 답이 무엇으로 저장할지를 안 말하기 때문이다.
// 그래서 문 하나로 모으되, **누르는 몸짓의 수는 안 늘렸다**: 형식 칸이 곧 저장이라 확인
// 단추가 없다.
//
// 모양은 **붙여넣기 판과 한 벌**이다(주인 지시 2026-08-23): 가운데 제목, 한 줄에 셋까지의 격자,
// 그림 위·이름 아래, 겨눔은 `--nabi-accent` 테두리 하나(안쪽 칠 없음), 걸음과 첫 겨눔도 같은
// 산수다. 그 격자를 짓는 손은 두 판이 나눠 쓰는 부품 하나다(`parts/grid.ts`).
//
// **조종 키만 갈린다** — 여기서 형식을 옮기는 것은 **Tab/Shift+Tab** 이고 방향키가 아니다
// (주인 지시 2026-08-23: "저장에서 방향키는 제거 … 진짜 파일 이름 고치려고 움직이는 키와
// 구분이 안 돼"). 이 판에는 이름 칸이 함께 서 있어 ←/→ 는 이미 캐럿의 키이고 ↑/↓ 도 글의
// 키다. 붙여넣기 판에는 글 칸이 없으니 거기 방향키는 그대로 정본이다. 같은 부품, 다른 키.
//
// **첫 겨눔이 바뀌었다** — 옛 판은 원본(`.nabi`)에 섰지만 이제 `initialChoice` 를 그대로 쓴다:
// 형식이 셋이면 첫 줄 가운데(HTML)다. 이름 칸 옆 확장자 표식도 그래서 `.html` 로 뜬다.
//
// 저장 판만의 것은 그대로다: 이름 칸과 그 옆 확장자 표식(겨눔을 따라 바뀐다), 그리고
// 되돌아오지 못하는 형식 아래 붙는 아주 작은 한 마디(`(손실저장)`).
//
// 그림도 **붙여넣기 판의 것 그대로**다 — 한 형식은 한 얼굴로 다닌다(`io/marks.ts` 의 `saveMark`).
//
// ui 가 surface 를 무는 자리다(기록 판의 선례) — 판이 쥐는 것은 `FileMount` 하나이고,
// 형식 목록도 저장하는 문도 전부 거기서 온다.
import { localeDirection, makeTranslator, type Translator } from '../locale/index.js';
import { saveMark, today, NABI_FILE_EXTENSION } from '../io/index.js';
import type { FileMount, SaveFormat } from '../surface/index.js';
import { make } from './parts/dom.js';
import { makeGrid } from './parts/grid.js';
import { openScrim, type Scrim } from './parts/scrim.js';
import type { Overlay } from './overlay.js';

export interface SavePanelOptions {
  readonly file: FileMount;
  // 겨눔이 돌아갈 자리 — 닫으면 여기로 포커스가 간다. 판이 사는 문서도 여기서 나온다.
  readonly surface: HTMLElement;
  readonly locale?: string;
  readonly translator?: Translator;
}

// 이름 칸 옆에 서는 확장자 표식 — **겨눈 칸의 것**이다. 자리를 벗어난 번호는 기본 형식으로
// 답한다(목록이 빈 자리). DOM 없는 판정이라 그물이 판을 안 띄우고 잡는다.
export function extensionFor(formats: readonly SaveFormat[], at: number): string {
  const aimed = formats[at];
  if (aimed) return aimed.extension;
  return (
    formats.find((format) => format.extension === NABI_FILE_EXTENSION)?.extension ??
    formats[0]?.extension ??
    NABI_FILE_EXTENSION
  );
}

// 표식이 잡아 두는 **자리의 너비** — 판에 뜬 확장자 중 가장 긴 것의 글자 수다(주인 지시
// 2026-08-23: "가장 넓은 거 기준으로 고정 … 입력 칸이 동적으로 변하는 게 보기 불편해").
// 표식이 겨눔을 따라 바뀌는데 폭까지 따라 바뀌면 이름 칸이 늘었다 줄었다 해서, 치던 글이
// 눈앞에서 흔들린다. 글자를 박아 두지 않는다 — 호스트가 `ioFilters` 로 끼운 형식도 이 셈에 든다.
// 형식이 하나도 없으면 표식이 답하는 기본값(`.nabi`)만큼이다.
export function extWidth(formats: readonly SaveFormat[]): number {
  const lengths = formats.map((format) => format.extension.length);
  return lengths.length === 0 ? NABI_FILE_EXTENSION.length : Math.max(...lengths);
}

// 칸에 서는 이름 — **점을 뺀 소문자 확장자**다(주인 지시 2026-08-23: "아래 확장자는 다 소문자").
// `nabi` · `nhtml` · `md`. 사전에 안 산다: 번역하는 낱말이 아니라 파일 이름의 꼬리이고, 셋이
// 나란히 서서 눈으로 견주는 자리라 길이가 흔들리면 안 된다(붙여넣기 판의 형식 이름과 같은
// 판단이되 거기는 대문자다 — 거기 이름은 형식의 이름이고 여기 이름은 **확장자**다).
// 확장자가 없는 호스트 형식은 제 `id` 로 답한다.
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

  // 이름 줄 — 칸은 **날짜만** 들고 열린다. 이름까지 지어 주면 사람이 그것을 먼저 지우고 써야
  // 한다: 날짜 뒤에 빈칸 하나만 두면 열리자마자 이어서 치면 된다 (옛 판의 그 값 그대로).
  const row = make(owner, 'div', 'nabi-save-name');
  const input = make(owner, 'input', 'nabi-input', {
    type: 'text',
    'aria-label': t.t('save.name'),
    placeholder: t.t('save.name'),
  }) as HTMLInputElement;
  input.value = `${today()} `;
  const ext = make(owner, 'span', 'nabi-save-ext');
  // 표식의 자리는 **가장 긴 확장자**에 맞춰 미리 잡는다 — 겨눔이 옮겨 가도 이름 칸이 안 흔들린다.
  ext.style.setProperty('--nabi-save-ext-len', String(extWidth(formats)));
  row.append(input, ext);

  let active = true;
  let scrim: Scrim | null = null;

  // 저장은 한 번뿐이다 — 칸을 두 번 누르거나 엔터가 겹쳐 와도 판이 이미 닫혀 있다.
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
      // 여기서 형식을 옮기는 키는 **Tab/Shift+Tab** 이다(방향키가 아니다 — 위 머리글).
      aimBy: 'tab',
      cells: formats.map((format) => ({
        label: formatName(format),
        // 그림은 **붙여넣기 판의 것을 그대로 쓴다**(주인 지시 2026-08-23) — html 은 `</>`, md 는
        // `MD` 두 글자, nabi 는 OG 의 나비 마크. 없는 형식(호스트의 것)은 그림 자리를 안 만든다.
        ...(saveMark(format.extension) !== '' ? { icon: saveMark(format.extension) } : {}),
        // 되돌아오지 못하는 형식에만 한 마디가 붙는다 — 누르는 것을 막지는 않는다.
        ...(format.lossy ? { note: t.t('save.lossy') } : {}),
        ariaLabel: t.t('save.as', { ext: formatName(format) }),
      })),
      onAim: paintExt,
      onPick: put,
    });
    card.append(title, row, grid.list);

    // 이름 칸의 엔터는 **지금 겨눈 형식**으로 저장한다 — 칸에서 손을 떼지 않고 끝낼 수 있다.
    // 그 밖의 키는 편집기로도 격자로도 새면 안 된다(글을 치는 동안 방향키는 글자 사이를 걷는다).
    //
    // 딱 하나 예외가 **Tab/Shift+Tab** 이다(주인 지시 2026-08-23: "제목 입력 중에도 탭·시프트탭
    // 누르면 그거 씹히고 그 아래 저장 아이콘 이동"). 이름을 치던 손 그대로 형식을 훑는 길이다:
    //   · 겨눔은 **이름 칸에 그대로** 있다 — `preventDefault` 가 브라우저의 겨눔 이동을 막으니
    //     캐럿도 고른 글자도 안 흔들리고, 누른 뒤 바로 이어 칠 수 있다. (칸은 `tabindex="-1"`
    //     이라 애초에 겨눔이 설 자리가 아니다 — 겨눔은 판이 열려 있는 동안 이름 칸 하나뿐이다.)
    //   · 탭 문자도 안 들어간다 — 기본 동작을 통째로 막았다.
    //   · 눈에 보이는 변화는 **선택 표시와 그에 딸린 확장자 표식** 하나뿐이다.
    // 접근성: 모달이 Tab 을 가두는 것은 흔한 관례지만 여기서는 **가둬서 못 가게 하는 것이 아니라
    // 가둬서 판 안에서 고르게 한다** — 형식 단추는 브라우저의 탭 순서에 안 서므로(겨눔이 아리아
    // 표식 하나다), 이 길이 곧 키보드만으로 형식에 닿는 길이다.
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

    // 키는 카드가 받아 격자에 건넨다 — 붙여넣기 판과 같은 길이되, 이 판이 듣는 겨눔 키는
    // Tab 뿐이다(`aimBy: 'tab'`). 방향키는 여기서도 격자가 안 집는다 — 이름 칸의 키다.
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
