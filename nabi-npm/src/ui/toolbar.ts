// 툴바 — 등록된 wing 의 `button` 선언을 읽어 버튼을 세우고, 캐럿이 움직일 때마다 눌림과 노출을
// 다시 칠한다. 그림 도구는 전부 `parts/` 의 한 벌짜리 부품이고, 판정은 전부 `press`·`visible` 의
// 순수 함수다 — 이 파일에는 배선만 있다.
//
// 버튼이 하는 일도 ui 가 짐작하지 않는다: wing 이 `button.action` 으로 말한 대로만 한다.
// 피커 셋(격자·물어보기·파일)도 그 선언에서 갈린다.
import { hostOf, type CommandHand, type Nabi } from '../editor/index.js';
import type { Registry, Wing, WingAction, WingButton } from '../wing/index.js';
import { localeDirection, makeTranslator, type Translator } from '../locale/index.js';
import { markNode, pressedOf, pressedValue, type PressEnv } from './press.js';
import { reachAt, visibleAt } from './visible.js';
import { focusQuiet, make } from './parts/dom.js';
import { watchNarrow } from './narrow.js';
import { iconButton, setPressed, suppressMousedownTap, wireIconButton } from './parts/button.js';
import { TOOLBAR_GROUPS as GROUP_ORDER, renderToolbarHtml, toolbarSlots } from '../wing/toolbar-html.js';
import { openPanel, type Panel } from './parts/panel.js';
import { openPrompt } from './parts/prompt.js';
import { watchSettle, type Settle } from './parts/settle.js';
import { mountToast, type ToastMount } from './toast.js';
import { openChoosePanel } from './choose.js';
import { openSavePanel } from './save.js';
import { saveFileWing } from '../wings/file/file.js';
import type { FileMount } from '../surface/index.js';
import {
  claimMountRoot,
  acquireGestureRoot,
  DisposerStack,
  HostElementBaseline,
  HostElementLease,
  openFilePicker,
  type Disposer,
  ownsGestureRoot,
} from '../lifecycle.js';

// 기본 그룹 순서와 마크업은 **`wing/toolbar-html.ts` 가 든다** — 서버도 같은 줄을 그려야 하고,
// ssr 엔트리는 ui 를 안 딛기 때문이다 (096). 여기서는 부르던 자리를 위해 다시 내보낸다.
export { TOOLBAR_GROUPS } from '../wing/toolbar-html.js';

export interface ToolbarOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  // 툴바가 들어설 그릇 — 호스트가 준다.
  readonly root: HTMLElement;
  // 편집 표면 — 누른 뒤 포커스가 돌아갈 자리. **가속키의 땅이기도 하다**: 이 자리(와 툴바 줄)
  // 안에서 난 키만 우리 것이다. 안 주면 그 땅을 그릴 수 없어 옛길(문서 전체)로 듣는다 —
  // 한 페이지에 편집기가 둘이면 반드시 준다 (260823_013).
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
  // 저장 판이 배선 없이 서는 문 — 끼우면 저장 단추와 ⌘S 가 판을 연다. **안 끼우면 옛길이다**:
  // `onHost('save')` 로 흘러 호스트가 제 손으로 받는다(로컬 기록과 같은 문). 둘 다 없으면 저장
  // 단추는 아무 데도 안 닿고, 그때 ⌘S 는 **키를 안 삼킨다**.
  readonly file?: FileMount;
  // 가속키(mod+s 류)를 여기서 듣는다. 끄고 싶으면 false.
  //
  // 듣는 것은 **등록된 wing 이 선언한 키뿐**이다 — 저장·열기 wing 을 안 든 편집기에는 ⌘S·⌘O 가
  // 없다(기능은 코어에 살아도 그렇다: 코어의 문은 `mountFile` 이 돌려주는 손잡이다).
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
  //
  // 답은 **닿았는가**다: 선언이 커맨드·판으로 가면 참이고, 호스트가 받기로 한 갈래(`host`)인데
  // 받을 손이 하나도 안 끼워졌으면 거짓이다. 가속키가 키를 삼킬지 말지를 이 답으로 가른다.
  press(): boolean;
  // 가속키가 부르는 문 — 선언이 따로 없으면 `press` 와 같다.
  accelerate(): boolean;
}

export interface Toolbar {
  readonly root: HTMLElement;
  // 공식 API — 힌트·시험은 DOM 을 뒤지지 않고 이 목록을 본다 (판정 19).
  readonly buttons: readonly ToolbarButton[];
  refresh(): void;
  unmount(): void;
}

// --- 가속키의 두 문턱 — 순수부 (260823_013) ---------------------------------------------------
//
// 셋째 문턱은 코드가 아니라 **모양**이다: 가속키는 `buttons` 목록에서만 나오고 그 목록은 등록된
// wing 의 선언에서 나온다. 그래서 **wing 을 안 든 편집기에는 그 키가 아예 없다** — 저장·열기가
// 코어(mountFile)에 살아도 마찬가지다. 코어의 문은 호스트가 손으로 부르는 것이지 키가 아니다.

// 우리 땅에서 온 키인가.
//
// 귀는 **문서**에 달려 있다(툴바 단추에 겨눔이 가 있어도 들어야 하니까). 그래서 한 페이지에
// 편집기가 둘이면 서로의 키를 먹었다 — 실측: 데모의 아래 편집기(저장 배선이 없는 쪽)에서 ⌘S 를
// 치면 **위 편집기의** 저장 판이 떴고, 호스트의 평범한 textarea 에서 쳐도 떴다. 우리 땅은 편집
// 표면과 툴바 줄 둘이다.
//
// 표면을 안 준 호스트에게는 옛길이 답이다 — 그 호스트는 제 편집 자리를 우리에게 말한 적이 없어서
// 땅을 그릴 수가 없다.
export interface KeyBox {
  contains(node: unknown): boolean;
}

export interface KeyScope {
  readonly surface?: KeyBox | null;
  readonly root?: KeyBox | null;
}

export function ownsKey(scope: KeyScope, target: unknown): boolean {
  const { surface, root } = scope;
  if (!surface) return true;
  if (target === null || target === undefined) return false;
  return surface.contains(target) || root?.contains(target) === true;
}

// 이 몸짓이 닿을 데가 있는가 — **`host` 갈래만 배선을 문다.**
//
// 닿을 데가 없으면 키를 안 삼킨다: 우리가 안 하는 일의 단축키를 브라우저에게서 뺏을 까닭이 없다
// (주인 판단, 260823_013). 나머지 갈래는 언제나 닿는다 — 커맨드는 registry 가 이름을 들고 있고
// 판은 우리가 직접 연다.
export function actionReaches(
  action: WingAction | undefined,
  wired: { readonly savePanel: boolean; readonly onHost: boolean },
): boolean {
  if (!action) return false;
  if (action.kind !== 'host') return true;
  return wired.savePanel || wired.onHost;
}

export function mountToolbar(options: ToolbarOptions): Toolbar {
  const { nabi, registry, root } = options;
  const baseline = new HostElementBaseline(root);
  const lifecycle = new DisposerStack();
  lifecycle.add(claimMountRoot(root));
  let unmounting = false;
  try {
    const owner = root.ownerDocument;
    if (options.surface) lifecycle.add(acquireGestureRoot(root, [options.surface]));
    const t = options.translator ?? makeTranslator(options.locale);
    const suppliedSettle = options.settle;
    const settle = suppliedSettle ?? watchSettle(owner, options.surface ? { surface: options.surface } : {});
    const ownSettle = suppliedSettle === undefined;
    if (ownSettle) lifecycle.add(() => settle.unmount());

    const buttons: ToolbarButton[] = [];
    const groups = new Map<string, HTMLElement>();
    let picker: Panel | null = null;
    let filePicker: Disposer | null = null;
    let pendingVisibility = false;
    let unmounted = false;
    const attributes = new HostElementLease(root);
    lifecycle.add(() => attributes.dispose());

    // 호스트가 이미 달아 뒀으면 **우리 것이 아니다** — 미리 그린 줄을 내보내는 호스트는 첫 그림부터
    // 이 클래스가 있어야 한다(안 그러면 mount 때 좌우 여백 .375rem 이 붙으며 줄이 옆으로 밀린다).
    // 남의 것을 떼면 안 되므로 **우리가 단 것만** 뗀다 (아래 unmount).
    attributes.className('nabi-toolbar-row', true);

    const closePicker = (): void => {
      picker?.close();
      picker = null;
      filePicker?.();
      filePicker = null;
    };
    lifecycle.add(closePicker);

    // 커맨드 한 번 — 판을 닫고, 겨눔을 편집기로 돌려주고, 문 하나로 보낸다.
    // 부른 손(`by`)도 같이 실어 보낸다 (084 ⑨) — 접힌 캐럿의 마크 몸짓을 문이 이것으로 가른다.
    const run = (command: string, args?: Readonly<Record<string, unknown>>, by?: CommandHand): void => {
      if (unmounted || unmounting) return;
      closePicker();
      focusQuiet(options.surface);
      nabi.applyCommand(command, args ?? {}, by);
    };

    const pressEnv = (): PressEnv => ({
      doc: hostOf(nabi).doc(),
      sel: nabi.getSelection(),
      env: hostOf(nabi).env,
      registry,
      armed: hostOf(nabi).armed,
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
        suppressMousedownTap(cell);
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
        else if (key === 'Enter' || key === ' ')
          run(action.command, { [action.rowsKey]: rows, [action.colsKey]: cols });
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
      let finished = false;
      const dispose = openFilePicker(owner, {
        ...(action.accept !== undefined ? { accept: action.accept } : {}),
        multiple: action.multiple !== false,
        onFiles: (files) => {
          finished = true;
          filePicker = null;
          focusQuiet(options.surface);
          if (files.length > 0) options.onFiles?.(files);
        },
        onCancel: () => {
          finished = true;
          filePicker = null;
          if (!unmounting) focusQuiet(options.surface);
        },
        onError: () => {
          finished = true;
          filePicker = null;
        },
      });
      if (finished) dispose();
      else filePicker = dispose;
    };

    const fire = (wing: Wing, button: HTMLButtonElement, decl?: WingButton, by?: CommandHand): boolean => {
      if (unmounted || unmounting) return false;
      const action = (decl ?? wing.button)?.action;
      return action ? act(wing, button, action, by) : false;
    };

    // 선언 하나를 실제로 돌린다 — 누름과 가속키가 같은 문을 지난다(답만 다를 수 있다).
    // `by` 는 부른 손이다 — 커맨드로 바로 가는 갈래(mark·command)만 문에 실어 보낸다.
    // 판을 여는 갈래는 안 싣는다: 판 안에서 고르는 그 몸짓이 제 손을 새로 밝힌다.
    //
    // **답은 닿았는가**다 — 가속키가 키를 삼킬지 말지를 이것으로 가른다 (`actionReaches`).
    const act = (wing: Wing, button: HTMLButtonElement, action: WingAction, by?: CommandHand): boolean => {
      if (unmounted || unmounting) return false;
      // 같은 버튼을 다시 누르면 열린 판이 닫힌다.
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      closePicker();
      if (wasOpen) return true;
      switch (action.kind) {
        case 'mark':
          run('toggleMark', { mark: markNode(wing.w) }, by);
          return true;
        case 'command':
          run(action.command, action.args, by);
          return true;
        case 'menu':
          openMenu(wing, button, action);
          return true;
        case 'grid':
          openGrid(button, action);
          return true;
        case 'prompt':
          openAsk(wing, button, action);
          return true;
        case 'file':
          openFiles(action);
          return true;
        default: {
          // 저장은 부속을 끼운 편집기에서 **판이 받는다** — 데모도 남의 페이지도 저장 판을 베껴
          // 짓지 않는다(기록 판을 부품 하나로 내놓은 것과 같은 판단). 안 끼웠으면 아래 옛길이다.
          const savePanel = options.file !== undefined && wing.w === saveFileWing.w;
          // 저장 판도 호스트의 손도 없다 — 이 단추는 아무 데도 안 닿는다.
          if (!actionReaches(action, { savePanel, onHost: options.onHost !== undefined })) return false;
          if (savePanel && options.file) {
            openSavePanel({
              file: options.file,
              surface: options.surface ?? root,
              ...(options.locale !== undefined ? { locale: options.locale } : {}),
              ...(options.translator ? { translator: options.translator } : {}),
            });
            return true;
          }
          options.onHost?.(wing.w, button);
          return true;
        }
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
    if (options.locale !== undefined || options.translator !== undefined)
      attributes.attribute('dir', localeDirection(t.locale));

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
        return el?.getAttribute('data-name') === slot.name && el.getAttribute('aria-label') === slot.label;
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

    // 그룹만 한 겹 감싼다 — 한 줄 모드(260824_000)의 스크롤 그릇이다. 넓은 폭에서는
    // display: contents 라 없는 셈이고(float 도구·줄바꿈이 지금 그대로), 좁은 폭에서만 flex 로
    // 서서 가로로 구른다. 도구(.nabi-tools)와 toast 선반은 밖에 남는다 — 도구는 늘 보이고,
    // 선반은 스크롤에 안 잘린다. unmount 는 replaceChildren 이 함께 걷는다.
    const strip = make(owner, 'div', 'nabi-strip');
    strip.append(...Array.from(root.querySelectorAll<HTMLElement>(':scope > .nabi-group')));
    root.append(strip);
    lifecycle.add(() => strip.remove());
    const stopNarrow = watchNarrow(root);
    lifecycle.add(stopNarrow);

    slots.forEach((slot, at) => {
      const el = standingButtons[at];
      if (!el) return;
      const { wing, decl } = slot;
      // 누른 손(by)도 그대로 잇는다 (084 ⑨) — 어느 단추를 눌렀는지 함께 보낸다.
      lifecycle.add(wireIconButton(el, (by) => fire(wing, el, decl, by)));
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
      const reach = reachAt(hostOf(nabi).doc(), nabi.getSelection().focus, registry, hostOf(nabi).env);
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
      if (unmounted || unmounting) return;
      paintPressed();
      if (settle.busy()) {
        pendingVisibility = true;
        return;
      }
      pendingVisibility = false;
      paintVisibility();
    };

    const stopChange = nabi.onChange(refresh);
    lifecycle.add(stopChange);
    const stopSettle = settle.onSettle(() => {
      if (unmounted || unmounting) return;
      if (!pendingVisibility) return;
      pendingVisibility = false;
      paintVisibility();
    });
    lifecycle.add(stopSettle);

    // 가속키 — 선언한 버튼을 누른다(커맨드를 직접 부르지 않는다: 피커가 걸린 것도 있다).
    //
    // **삼키는 것은 실제로 무언가를 한 뒤뿐이다.** 문턱 셋을 차례로 넘는다 (260823_013):
    // 우리 땅에서 온 키인가 → 그 이름의 단추가 서 있는가(= wing 이 등록됐고 지금 보이는가) →
    // 그 몸짓이 닿을 데가 있는가. 하나라도 아니면 키는 브라우저의 것으로 그냥 흘러간다.
    const onKey = (event: Event): void => {
      const key = event as KeyboardEvent;
      if (!(key.metaKey || key.ctrlKey) || key.altKey) return;
      if (!ownsKey({ surface: options.surface ?? null, root }, key.target)) return;
      if (options.surface && !ownsGestureRoot(root, key.target, options.surface)) return;
      const want = `mod+${key.key.toLowerCase()}`;
      const found = buttons.find((button) => button.accelerator === want);
      if (!found || found.el.hidden) return;
      // 가속키가 제 답을 따로 들면 그것을 쓴다 — 누르는 손과 뜻이 다른 자리다(저장의 ⌘S).
      if (!found.accelerate()) return;
      event.preventDefault();
    };
    if (options.accelerators !== false) {
      owner.addEventListener('keydown', onKey, true);
      lifecycle.add(() => owner.removeEventListener('keydown', onKey, true));
    }

    // 기본 toast 그릇 — 툴바가 서면 그 아래 알림 자리도 함께 선다 (084 ①). 별도 mount 를
    // 호스트에게 시키지 않는 까닭: "콜백을 안 주면 core 기본이 뜬다" 가 계약이라, 배선 없이도
    // 서 있어야 한다. 콜백을 끼운 인스턴스에서는 이 그릇이 안 불려 DOM 이 아예 안 생긴다.
    const toast: ToastMount = mountToast({ nabi, root });
    lifecycle.add(() => toast.unmount());

    // 고르는 판도 같은 자리에서 선다 — 툴바를 세운 편집기는 붙여넣기 판을 갖는다(호스트 배선이
    // 하나도 안 는다). surface 는 ui 아래층이라 판을 직접 못 띄우고, 이 한 줄이 그 문을 잇는다.
    const unbindChoose = hostOf(nabi).bindChoose((question, choices) =>
      openChoosePanel({
        question,
        options: choices,
        surface: options.surface ?? root,
        ...(options.locale !== undefined ? { locale: options.locale } : {}),
        ...(options.translator ? { translator: options.translator } : {}),
      }),
    );
    lifecycle.add(unbindChoose);

    // 화면의 말을 코어에 걸어 준다 — 코어의 문도 제 이름으로 말할 때가 있고(포인터 손의 "선택된
    // 글자가 없습니다"), 그 말이 툴바와 다른 언어면 안 된다. **호스트는 로케일을 한 번만 선언한다**:
    // 여기 준 그 값이 코어까지 간다. 언어를 바꾸는 호스트는 어차피 화면을 다시 세우므로 새 값이
    // 그때 다시 걸린다.
    const unbindLocale = options.locale === undefined ? null : hostOf(nabi).bindLocale(options.locale);
    if (unbindLocale) lifecycle.add(unbindLocale);

    refresh();

    return {
      root,
      buttons,
      refresh,
      unmount() {
        if (unmounted) return;
        unmounted = true;
        unmounting = true;
        lifecycle.dispose();
      },
    };
  } catch (error) {
    unmounting = true;
    lifecycle.dispose();
    baseline.restore();
    throw error;
  }
}
