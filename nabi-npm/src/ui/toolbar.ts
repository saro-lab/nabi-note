// 툴바 — 등록된 wing 의 `button` 선언을 읽어 버튼을 세우고, 캐럿이 움직일 때마다 눌림과 노출을
// 다시 칠한다. 그림 도구는 전부 `parts/` 의 한 벌짜리 부품이고, 판정은 전부 `press`·`visible` 의
// 순수 함수다 — 이 파일에는 배선만 있다.
//
// 버튼이 하는 일도 ui 가 짐작하지 않는다: wing 이 `button.action` 으로 말한 대로만 한다.
// 피커 셋(격자·물어보기·파일)도 그 선언에서 갈린다.
import type { CommandHand, Nabi } from '../editor/index.js';
import type { Registry, Wing, WingAction, WingButton } from '../wing/index.js';
import { localeDirection, makeTranslator, type Translator } from '../locale/index.js';
import { markNode, pressedOf, pressedValue, type PressEnv } from './press.js';
import { reachAt, visibleAt } from './visible.js';
import { focusQuiet, make } from './parts/dom.js';
import { iconButton, setPressed, wireIconButton } from './parts/button.js';
import { TOOLBAR_GROUPS as GROUP_ORDER, renderToolbarHtml, toolbarSlots } from '../wing/toolbar-html.js';
import { openPanel, type Panel } from './parts/panel.js';
import { openPrompt } from './parts/prompt.js';
import { watchSettle, type Settle } from './parts/settle.js';
import { mountToast, type ToastMount } from './toast.js';

// 기본 그룹 순서와 마크업은 **`wing/toolbar-html.ts` 가 든다** — 서버도 같은 줄을 그려야 하고,
// ssr 엔트리는 ui 를 안 딛기 때문이다 (096). 여기서는 부르던 자리를 위해 다시 내보낸다.
export { TOOLBAR_GROUPS } from '../wing/toolbar-html.js';

export interface ToolbarOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  // 툴바가 들어설 그릇 — 호스트가 준다.
  readonly root: HTMLElement;
  // 편집 표면 — 누른 뒤 포커스가 돌아갈 자리.
  readonly surface?: HTMLElement;
  readonly locale?: string;
  readonly translator?: Translator;
  // 그룹 순서 — 안 주면 `TOOLBAR_GROUPS` 를 따른다.
  readonly groups?: readonly string[];
  // 몸짓 가라앉기 — 상황 줄과 나눠 쓰라고 밖에서 넣을 수 있다.
  readonly settle?: Settle;
  // 파일 피커가 고른 파일이 흘러가는 곳 (mountUpload 의 take 가 그 자리다).
  readonly onFiles?: (files: readonly File[]) => void;
  // 패널이 필요한 도구(로컬 히스토리)를 호스트가 받는다.
  readonly onHost?: (w: string, anchor: HTMLElement) => void;
  // 가속키(mod+s 류)를 여기서 듣는다. 끄고 싶으면 false.
  readonly accelerators?: boolean;
}

export interface ToolbarButton {
  readonly w: string;
  readonly group: string;
  // 값 단추면 그 값 — 눌림을 이 값으로 가린다(정렬 셋).
  readonly value?: string | number;
  readonly el: HTMLButtonElement;
  readonly shortcut?: string;
  readonly accelerator?: string;
  // 눌러 본다 — 힌트(Shift 연타)가 부르는 공식 문이다. **키보드 손이다** — 포인터 손은 이 문이
  // 아니라 DOM 클릭으로 온다(iconButton 이 `detail` 로 가른다).
  press(): void;
  // 가속키가 부르는 문 — 선언이 따로 없으면 `press` 와 같다.
  accelerate(): void;
}

export interface Toolbar {
  readonly root: HTMLElement;
  // 공식 API — 힌트·시험은 DOM 을 뒤지지 않고 이 목록을 본다 (판정 19).
  readonly buttons: readonly ToolbarButton[];
  refresh(): void;
  unmount(): void;
}

export function mountToolbar(options: ToolbarOptions): Toolbar {
  const { nabi, registry, root } = options;
  const owner = root.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  const settle = options.settle ?? watchSettle(owner, options.surface ? { surface: options.surface } : {});
  const ownSettle = options.settle === undefined;

  const buttons: ToolbarButton[] = [];
  const groups = new Map<string, HTMLElement>();
  let picker: Panel | null = null;
  let pendingVisibility = false;

  // 호스트가 이미 달아 뒀으면 **우리 것이 아니다** — 미리 그린 줄을 내보내는 호스트는 첫 그림부터
  // 이 클래스가 있어야 한다(안 그러면 mount 때 좌우 여백 .375rem 이 붙으며 줄이 옆으로 밀린다).
  // 남의 것을 떼면 안 되므로 **우리가 단 것만** 뗀다 (아래 unmount).
  const ownRow = !root.classList.contains('nabi-toolbar-row');
  if (ownRow) root.classList.add('nabi-toolbar-row');

  const closePicker = (): void => {
    picker?.close();
    picker = null;
  };

  // 커맨드 한 번 — 판을 닫고, 겨눔을 편집기로 돌려주고, 문 하나로 보낸다.
  // 부른 손(`by`)도 같이 실어 보낸다 (084 ⑨) — 접힌 캐럿의 마크 몸짓을 문이 이것으로 가른다.
  const run = (command: string, args?: Readonly<Record<string, unknown>>, by?: CommandHand): void => {
    closePicker();
    focusQuiet(options.surface);
    nabi.applyCommand(command, args ?? {}, by);
  };

  const pressEnv = (): PressEnv => ({
    doc: nabi.$doc(),
    sel: nabi.getSelection(),
    env: nabi.$env,
    registry,
    armed: nabi.$armed,
  });

  // --- 피커 셋 --------------------------------------------------------------------------------

  // 차림표 — 값 하나를 고른다 (색·크기·제목 레벨).
  const openMenu = (wing: Wing, anchor: HTMLButtonElement, action: Extract<WingAction, { kind: 'menu' }>): void => {
    const panel = openPanel(owner, { anchor, className: 'nabi-menu', restore: options.surface ?? null });
    picker = panel;
    for (const choice of action.values) {
      const label = t.pick(choice.label, `value.${wing.w}.${choice.value}`);
      panel.root.append(
        iconButton(owner, {
          name: String(choice.value),
          label,
          ...(choice.swatch ? { swatch: choice.swatch } : choice.svg ? { svg: choice.svg } : { text: label }),
          ...(pressedValue(pressEnv(), wing.w, choice.value) ? { className: 'on' } : {}),
          // 칸을 누른 손이 곧 커맨드의 손이다 — 판을 연 손이 아니다(연 것과 고른 것은 다른 몸짓).
          press: (by) => run(action.command, { [action.argKey]: choice.value }, by),
        }),
      );
    }
  };

  // 격자 — 행·열 두 수를 한 몸짓으로 (표 삽입).
  const openGrid = (anchor: HTMLButtonElement, action: Extract<WingAction, { kind: 'grid' }>): void => {
    const max = action.max ?? 8;
    const panel = openPanel(owner, { anchor, restore: options.surface ?? null });
    picker = panel;
    const grid = make(owner, 'div', 'nabi-grid');
    grid.style.gridTemplateColumns = `repeat(${max}, auto)`;
    const readout = make(owner, 'div', 'nabi-readout');
    const cells: HTMLButtonElement[] = [];
    let rows = 1;
    let cols = 1;

    const paint = (): void => {
      cells.forEach((cell, i) => {
        const r = Math.floor(i / max) + 1;
        const c = (i % max) + 1;
        cell.classList.toggle('on', r <= rows && c <= cols);
      });
      readout.textContent = t.t('gridSize', { rows, cols });
    };

    for (let i = 0; i < max * max; i += 1) {
      const r = Math.floor(i / max) + 1;
      const c = (i % max) + 1;
      const cell = make(owner, 'button', 'nabi-cell', { type: 'button', tabindex: '-1' }) as HTMLButtonElement;
      cell.addEventListener('mousedown', (event) => event.preventDefault());
      cell.addEventListener('mouseenter', () => {
        rows = r;
        cols = c;
        paint();
      });
      cell.addEventListener('click', () => run(action.command, { [action.rowsKey]: r, [action.colsKey]: c }));
      cells.push(cell);
      grid.append(cell);
    }
    panel.root.append(grid, readout);

    panel.root.addEventListener('keydown', (event) => {
      const key = (event as KeyboardEvent).key;
      const step = (dr: number, dc: number): void => {
        rows = Math.min(max, Math.max(1, rows + dr));
        cols = Math.min(max, Math.max(1, cols + dc));
        paint();
      };
      if (key === 'ArrowDown') step(1, 0);
      else if (key === 'ArrowUp') step(-1, 0);
      else if (key === 'ArrowRight') step(0, 1);
      else if (key === 'ArrowLeft') step(0, -1);
      else if (key === 'Enter' || key === ' ') run(action.command, { [action.rowsKey]: rows, [action.colsKey]: cols });
      else return;
      event.preventDefault();
    });

    paint();
    panel.root.focus();
  };

  // 물어보기 — 주소·이름을 받아 커맨드 하나.
  const openAsk = (wing: Wing, anchor: HTMLButtonElement, action: Extract<WingAction, { kind: 'prompt' }>): void => {
    picker = openPrompt(owner, {
      anchor,
      restore: options.surface ?? null,
      okLabel: t.t('ok'),
      fields: action.fields.map((field) => {
        // 미리 채울 값 — 노드에서 읽는 것이 먼저고(고치는 자리), 없으면 선언의 `initial`.
        const filled = field.initial?.();
        return {
          name: field.name,
          label: t.pick(field.label, `field.${wing.w}.${field.name}`),
          ...(filled !== undefined && filled !== '' ? { value: filled } : {}),
          ...(field.optional ? { optional: true } : {}),
          // 형식 검사는 wing 의 것이다 — ui 는 나르기만 한다. 없으면 "빈 것만 막는다" 가 답이다.
          ...(field.validate ? { validate: field.validate } : {}),
        };
      }),
      onSubmit: (values) => run(action.command, values),
    });
  };

  // 파일 — 고른 파일은 호스트의 배선으로 흘러간다. 버튼은 포커스를 안 뺏었으므로 캐럿이 산다.
  const openFiles = (action: Extract<WingAction, { kind: 'file' }>): void => {
    closePicker();
    const input = make(owner, 'input', undefined, {
      type: 'file',
      accept: action.accept,
      style: 'display:none',
    }) as HTMLInputElement;
    if (action.multiple !== false) input.multiple = true;
    input.addEventListener(
      'change',
      () => {
        const files = Array.from(input.files ?? []);
        input.remove();
        focusQuiet(options.surface);
        if (files.length > 0) options.onFiles?.(files);
      },
      { once: true },
    );
    owner.body.append(input);
    input.click();
  };

  const fire = (wing: Wing, button: HTMLButtonElement, decl?: WingButton, by?: CommandHand): void => {
    const action = (decl ?? wing.button)?.action;
    if (action) act(wing, button, action, by);
  };

  // 선언 하나를 실제로 돌린다 — 누름과 가속키가 같은 문을 지난다(답만 다를 수 있다).
  // `by` 는 부른 손이다 — 커맨드로 바로 가는 갈래(mark·command)만 문에 실어 보낸다.
  // 판을 여는 갈래는 안 싣는다: 판 안에서 고르는 그 몸짓이 제 손을 새로 밝힌다.
  const act = (wing: Wing, button: HTMLButtonElement, action: WingAction, by?: CommandHand): void => {
    // 같은 버튼을 다시 누르면 열린 판이 닫힌다.
    const wasOpen = button.getAttribute('aria-expanded') === 'true';
    closePicker();
    if (wasOpen) return;
    switch (action.kind) {
      case 'mark':
        run('toggleMark', { mark: markNode(wing.w) }, by);
        return;
      case 'command':
        run(action.command, action.args, by);
        return;
      case 'menu':
        openMenu(wing, button, action);
        return;
      case 'grid':
        openGrid(button, action);
        return;
      case 'prompt':
        openAsk(wing, button, action);
        return;
      case 'file':
        openFiles(action);
        return;
      default:
        options.onHost?.(wing.w, button);
    }
  };

  // --- 단추 세우기 — **글자 한 벌에서** (096) -------------------------------------------------
  //
  // 세우는 손과 서버의 손이 **같은 함수**를 쓴다. 옛 판은 여기서 DOM 을 직접 지었고, 그러면
  // 서버가 그린 줄과 브라우저가 그릴 줄이 언젠가 갈린다 — 095 의 본문이 `renderEditorHtml`
  // 하나로 양쪽을 낸 것과 같은 규칙이다.
  // 말이 곧 방향이다 (098) — 아랍어·우르두를 고르면 줄이 오른쪽에서 왼쪽으로 선다. 페이지가
  // `<html dir>` 로 아무 말도 안 해도 그렇다. **로케일을 준 자리에만** 적는다: 안 주는 호스트는
  // 방향을 제 손으로 쥐고 있다는 뜻이라 우리가 덮으면 안 된다.
  if (options.locale !== undefined) root.setAttribute('dir', localeDirection(options.locale));

  const order = options.groups ?? GROUP_ORDER;
  const slots = toolbarSlots(registry, t, order);

  // 서 있는 것이 우리가 그릴 것과 같은가 — 견주는 것은 **글자가 아니라 구조**다. 브라우저가
  // 돌려주는 innerHTML 은 따옴표·속성 차례가 우리 글자와 달라서, 글자로 견주면 늘 어긋난다.
  // `.nabi-group` 안만 센다 — 같은 그릇에 `mountViewTools` 의 단추가 함께 설 수 있다.
  const standing = (): HTMLButtonElement[] =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('.nabi-group > button[data-name]'));
  const fits = (list: readonly HTMLButtonElement[]): boolean =>
    list.length === slots.length &&
    slots.every((slot, i) => {
      const el = list[i];
      return (
        el?.getAttribute('data-name') === slot.name && el.getAttribute('aria-label') === slot.label
      );
    });

  let standingButtons = standing();
  if (!fits(standingButtons)) {
    // 미리 그린 것이 없거나 어긋난다 — 그 자리에서 새로 그린다. **조용히 안 깨진다**:
    // 잃는 것은 미리 그린 값(깜박임이 돌아온다)뿐이고 화면은 언제나 옳다.
    for (const el of Array.from(root.querySelectorAll(':scope > .nabi-group'))) el.remove();
    root.insertAdjacentHTML('beforeend', renderToolbarHtml({ registry, translator: t, groups: order }));
    standingButtons = standing();
  }
  for (const el of Array.from(root.querySelectorAll<HTMLElement>(':scope > .nabi-group'))) {
    const name = el.getAttribute('data-group');
    if (name !== null) groups.set(name, el);
  }

  slots.forEach((slot, at) => {
    const el = standingButtons[at];
    if (!el) return;
    const { wing, decl } = slot;
    // 누른 손(by)도 그대로 잇는다 (084 ⑨) — 어느 단추를 눌렀는지 함께 보낸다.
    wireIconButton(el, (by) => fire(wing, el, decl, by));
    buttons.push({
      w: wing.w,
      group: slot.group,
      el,
      ...(decl.value !== undefined ? { value: decl.value } : {}),
      ...(decl.shortcut ? { shortcut: decl.shortcut } : {}),
      ...(decl.accelerator ? { accelerator: decl.accelerator } : {}),
      press: () => fire(wing, el, decl),
      accelerate: () => (decl.accelerated ? act(wing, el, decl.accelerated) : fire(wing, el, decl)),
    });
  });

  // --- 다시 칠하기 ----------------------------------------------------------------------------

  // 눌림은 늘 칠한다 — 레이아웃을 안 밀므로 몸짓 중에도 따라간다.
  const paintPressed = (): void => {
    const env = pressEnv();
    for (const button of buttons) {
      setPressed(
        button.el,
        button.value === undefined ? pressedOf(env, button.w).on : pressedValue(env, button.w, button.value),
      );
    }
  };

  // 노출은 밀린다 — 숨고 뜨는 것이 줄을 다시 접어 글을 밀기 때문이다.
  const paintVisibility = (): void => {
    const reach = reachAt(nabi.$doc(), nabi.getSelection().focus, registry, nabi.$env);
    for (const button of buttons) {
      const wing = registry.wingOf(button.w);
      button.el.hidden = wing ? !visibleAt(reach, wing) : true;
    }
    for (const [, group] of groups) {
      const alive = Array.from(group.children).some((child) => !(child as HTMLElement).hidden);
      group.hidden = !alive;
    }
  };

  const refresh = (): void => {
    paintPressed();
    if (settle.busy()) {
      pendingVisibility = true;
      return;
    }
    pendingVisibility = false;
    paintVisibility();
  };

  const stopChange = nabi.onChange(refresh);
  const stopSettle = settle.onSettle(() => {
    if (!pendingVisibility) return;
    pendingVisibility = false;
    paintVisibility();
  });

  // 가속키 — 선언한 버튼을 누른다(커맨드를 직접 부르지 않는다: 피커가 걸린 것도 있다).
  const onKey = (event: Event): void => {
    const key = event as KeyboardEvent;
    if (!(key.metaKey || key.ctrlKey) || key.altKey) return;
    const want = `mod+${key.key.toLowerCase()}`;
    const found = buttons.find((button) => button.accelerator === want);
    if (!found || found.el.hidden) return;
    event.preventDefault();
    // 가속키가 제 답을 따로 들면 그것을 쓴다 — 누르는 손과 뜻이 다른 자리다(저장의 ⌘S).
    found.accelerate();
  };
  if (options.accelerators !== false) owner.addEventListener('keydown', onKey, true);

  // 기본 toast 그릇 — 툴바가 서면 그 아래 알림 자리도 함께 선다 (084 ①). 별도 mount 를
  // 호스트에게 시키지 않는 까닭: "콜백을 안 주면 core 기본이 뜬다" 가 계약이라, 배선 없이도
  // 서 있어야 한다. 콜백을 끼운 인스턴스에서는 이 그릇이 안 불려 DOM 이 아예 안 생긴다.
  const toast: ToastMount = mountToast({ nabi, root });

  // 화면의 말을 코어에 걸어 준다 — 코어의 문도 제 이름으로 말할 때가 있고(포인터 손의 "선택된
  // 글자가 없습니다"), 그 말이 툴바와 다른 언어면 안 된다. **호스트는 로케일을 한 번만 선언한다**:
  // 여기 준 그 값이 코어까지 간다. 언어를 바꾸는 호스트는 어차피 화면을 다시 세우므로 새 값이
  // 그때 다시 걸린다.
  const unbindLocale = options.locale === undefined ? null : nabi.$bindLocale(options.locale);

  refresh();

  return {
    root,
    buttons,
    refresh,
    unmount() {
      closePicker();
      unbindLocale?.();
      toast.unmount();
      stopChange();
      stopSettle();
      if (options.accelerators !== false) owner.removeEventListener('keydown', onKey, true);
      if (ownSettle) settle.unmount();
      if (ownRow) root.classList.remove('nabi-toolbar-row');
      root.replaceChildren();
    },
  };
}
