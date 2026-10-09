import type { LocaleInput } from '../locale/index.js';
import { Translations } from './parts/translation.js';
// 등록된 wing의 button 선언을 읽어 버튼을 세우고, 캐럿이 움직일 때마다 눌림·노출을 다시 칠한다 — 판정은 press·visible의 순수 함수이고 이 파일엔 배선만 있다. 버튼이 하는 일도 짐작하지 않는다: wing이 button.action으로 말한 대로만 한다.
// Reads registered wings' `button` declarations to build buttons and repaints pressed/visible state on every caret move — the actual logic lives in press's and visible's pure functions; this file is wiring only. It never guesses what a button does either, only what the wing's `button.action` declares.
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
import { openToolbarPanel, type ToolbarPanelOptions, type ToolbarPanelRenderer } from './parts/toolbar-panel.js';
import { openToolbarPanelFrame } from './parts/toolbar-panel-frame.js';
import { watchSettle, type Settle } from './parts/settle.js';
import { mountToast, type ToastMount } from './toast.js';
import { openChoosePanel } from './choose.js';
import { mountCompactToolbar, compactKeepsFocus, type CompactToolbar } from './compact.js';
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

// 기본 그룹 순서와 마크업은 wing/toolbar-html.ts가 든다 — 서버도 같은 줄을 그려야 하고, ssr 엔트리는 ui를 안 딛기 때문이다. 여기서는 부르던 자리를 위해 다시 내보낸다.
// The default group order and markup live in wing/toolbar-html.ts — the server must render the same row, and the ssr entry never imports ui. Re-exported here for existing callers.
export { TOOLBAR_GROUPS } from '../wing/toolbar-html.js';

export interface ToolbarOptions {
  readonly layout?: 'compact' | 'wrap';
  readonly quick?: readonly string[];
  readonly panels?: Readonly<Record<string, ToolbarPanelRenderer | ToolbarPanelOptions>>;
  readonly nabi: Nabi;
  readonly registry: Registry;
  readonly root: HTMLElement;
  // 편집 표면 — 누른 뒤 포커스가 돌아갈 자리이자 가속키의 땅이다(이 자리와 툴바 줄 안에서 난 키만 우리 것이다). 안 주면 옛길(문서 전체)로 듣는다 — 편집기가 둘이면 반드시 줘야 한다.
  // The edit surface — where focus returns after a press, and also the territory accelerator keys respect (only keys originating inside this or the toolbar row are ours). Without it, keys are heard the old way (the whole document) — required whenever two editors share a page.
  readonly surface?: HTMLElement;
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
  // 그룹 순서 — 안 주면 `TOOLBAR_GROUPS` 를 따른다.
  // Group order — falls back to `TOOLBAR_GROUPS` when omitted.
  readonly groups?: readonly string[];
  // 몸짓 가라앉기 — 상황 줄과 나눠 쓰라고 밖에서 넣을 수 있다.
  // Gesture settling — can be supplied externally to share with the context toolbar.
  readonly settle?: Settle;
  // 파일 피커가 고른 파일이 흘러가는 곳 (mountUpload 의 take 가 그 자리다).
  // Where files picked by the file picker flow to (the same slot mountUpload's `take` fills).
  readonly onFiles?: (files: readonly File[]) => void;
  // 패널이 필요한 도구(로컬 히스토리)를 호스트가 받는다.
  // Tools that need a panel (local history) are handed to the host here.
  readonly onHost?: (w: string, anchor: HTMLElement) => void;
  // 저장 판이 배선 없이 서는 문 — 끼우면 저장 단추와 ⌘S가 판을 연다. 안 끼우면 onHost('save')로 흘러 호스트가 직접 받는다(로컬 기록과 같은 문). 둘 다 없으면 저장 단추는 안 닿고 ⌘S는 키를 안 삼킨다.
  // The door the save panel stands behind with no extra wiring — supply it and the save button/Cmd+S open the panel directly. Without it, saving falls through to onHost('save') for the host to handle (same pattern as local history). With neither, the save button reaches nothing and Cmd+S never swallows the key.
  readonly file?: FileMount;
  // 가속키(mod+s류)를 여기서 듣는다. 끄고 싶으면 false. 듣는 것은 등록된 wing이 선언한 키뿐이다 — 저장·열기 wing을 안 든 편집기에는 ⌘S·⌘O가 없다.
  // Listens for accelerators (mod+s and the like) here; pass false to disable. Only keys a registered wing declares are heard — an editor without the save/open wing has no Cmd+S/Cmd+O, even though the feature lives in the core.
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
  // 힌트는 기본 keyboard로, 메뉴 사본은 실제 누른 손을 넘겨 같은 명령을 실행한다. 받을 곳 없는 host 동작은 false다.
  // Hints default to keyboard; menu copies pass the actual input hand. Unwired host actions return false.
  press(by?: CommandHand): boolean;
  // 가속키가 부르는 문 — 선언이 따로 없으면 `press` 와 같다.
  // The door an accelerator calls — identical to `press` unless a declaration overrides it.
  accelerate(): boolean;
}

export interface Toolbar {
  readonly root: HTMLElement;
  // 공식 API — 힌트·시험은 DOM을 뒤지지 않고 이 목록을 본다.
  // Public API — hints and tests read this list instead of digging through the DOM.
  readonly buttons: readonly ToolbarButton[];
  refresh(): void;
  unmount(): void;
}

// --- 가속키의 두 문턱 — 순수부 ---------------------------------------------------------------
//
// 셋째 문턱은 코드가 아니라 모양이다: 가속키는 buttons 목록에서만 나오고 그 목록은 등록된 wing의 선언에서 나온다. wing을 안 든 편집기에는 그 키가 아예 없다 — 저장·열기가 코어(mountFile)에 살아도 마찬가지다.
// The third threshold isn't code but shape: accelerators only come from the `buttons` list, and that list comes from registered wings' declarations. An editor without the wing simply has no such key — true even for save/open, which live in the core (mountFile).

// 우리 땅에서 온 키인가 — 귀는 문서에 달려 있어(툴바 단추에 겨눔이 가 있어도 들어야 하니까), 한 페이지에 편집기가 둘이면 서로의 키를 먹었다(실측: 배선 없는 아래 편집기에서 ⌘S를 쳐도 위 편집기의 저장 판이 떴다). 표면을 안 준 호스트에게는 옛길이 답이다 — 제 편집 자리를 말한 적이 없어 땅을 그릴 수 없다.
// Whether a key came from our territory — the listener is on the document (it must hear keys even while a toolbar button has focus), so with two editors on one page they'd otherwise steal each other's keys (observed: pressing Cmd+S in an unwired editor still opened the other editor's save panel). A host that never supplied a surface falls back to the old behavior, since it never told us where its editing territory is.
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

// 이 몸짓이 닿을 데가 있는가 — host 갈래만 배선을 문다. 닿을 데가 없으면 키를 안 삼킨다: 우리가 안 하는 일의 단축키를 브라우저에게서 뺏을 까닭이 없다. 나머지 갈래는 언제나 닿는다.
// Whether this gesture reaches anything — only the `host` kind depends on wiring. With nothing to reach, the key isn't swallowed, since there's no reason to steal a shortcut for something we don't do. Every other kind always reaches.
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
    const copy = new Translations(t);
    lifecycle.add(() => copy.dispose());
    const suppliedSettle = options.settle;
    const settle = suppliedSettle ?? watchSettle(owner, options.surface ? { surface: options.surface } : {});
    const ownSettle = suppliedSettle === undefined;
    if (ownSettle) lifecycle.add(() => settle.unmount());

    const buttons: ToolbarButton[] = [];
    const groups = new Map<string, HTMLElement>();
    let picker: Panel | null = null;
    let closingPicker = false;
    let filePicker: Disposer | null = null;
    let pendingVisibility = false;
    let unmounted = false;
    let compact: CompactToolbar | null = null;
    const attributes = new HostElementLease(root);
    lifecycle.add(() => attributes.dispose());

    // 호스트가 이미 달아 뒀으면 우리 것이 아니다 — 미리 그린 줄은 첫 그림부터 이 클래스가 있어야 한다(안 그러면 mount 때 좌우 여백이 붙으며 줄이 밀린다). 남의 것을 떼면 안 되므로 우리가 단 것만 뗀다.
    // If the host already set this, it isn't ours — a pre-rendered row must already carry this class from first paint (otherwise mounting adds side margins and the row shifts). Since we must not remove someone else's marker, only what we set here gets removed on unmount.
    attributes.className('nabi-toolbar-row', true);

    const closePicker = (): void => {
      if (closingPicker) return;
      const current = picker;
      picker = null;
      const currentFile = filePicker;
      filePicker = null;
      closingPicker = true;
      try {
        current?.close();
        currentFile?.();
      } finally {
        closingPicker = false;
      }
    };
    lifecycle.add(closePicker);

    // 커맨드 한 번 — 판을 닫고, 겨눔을 편집기로 돌려주고, 문 하나로 보낸다. 부른 손(by)도 같이 실어 보낸다 — 접힌 캐럿의 마크 몸짓을 문이 이것으로 가른다.
    // One command — closes any panel, returns focus to the editor, and sends it through one door. The triggering hand (`by`) travels with it, since a mark gesture on a collapsed caret is distinguished by this.
    const run = (command: string, args?: Readonly<Record<string, unknown>>, by?: CommandHand): void => {
      if (unmounted || unmounting) return;
      const keepFocus = compactKeepsFocus(nabi);
      if (!keepFocus) closePicker();
      if (!keepFocus) focusQuiet(options.surface);
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
      const labels = new Translations(t);
      const panel = openPanel(owner, {
        anchor,
        className: 'nabi-menu',
        restore: options.surface ?? null,
        onClose: () => labels.dispose(),
      });
      picker = panel;
      labels.attribute(panel.root, 'dir', () => localeDirection(t.locale));
      for (const choice of action.values) {
        const label = (): string => t.pick(choice.label, `value.${wing.w}.${choice.value}`);
        const button = iconButton(owner, {
          name: String(choice.value),
          label: label(),
          iconKey: `menu-${anchor.getAttribute('data-name') ?? wing.w}-${choice.value}`,
          ...(choice.swatch
            ? { swatch: choice.swatch }
            : choice.icon
              ? { icon: choice.icon }
              : choice.svg
                ? { svg: choice.svg }
                : { text: label() }),
          ...(pressedValue(pressEnv(), wing.w, choice.value) ? { className: 'on' } : {}),
          // 칸을 누른 손이 곧 커맨드의 손이다 — 판을 연 손이 아니다(연 것과 고른 것은 다른 몸짓).
          // The hand that presses the cell is the command's hand, not the hand that opened the panel — opening and picking are different gestures.
          press: (by) => run(action.command, { [action.argKey]: choice.value }, by),
        });
        labels.button(button, label, choice.swatch || choice.icon || choice.svg ? undefined : label);
        panel.root.append(button);
      }
      if (root.closest('.nabi-expanded')) focusQuiet(panel.root.querySelector('button') ?? panel.root);
    };

    // 격자 — 행·열 두 수를 한 몸짓으로 (표 삽입).
    const openGrid = (anchor: HTMLButtonElement, action: Extract<WingAction, { kind: 'grid' }>): void => {
      compact?.close(false);
      const max = action.max ?? 8;
      const labels = new Translations(t);
      const panel = openToolbarPanelFrame(
        owner,
        { anchor, className: 'nabi-grid-panel', restore: options.surface ?? null, onClose: () => labels.dispose() },
        'mobile-modal',
      );
      picker = panel;
      labels.attribute(panel.root, 'dir', () => localeDirection(t.locale));
      labels.attribute(panel.root, 'aria-label', () => anchor.getAttribute('aria-label') ?? '');
      const limit = panel.root.classList.contains('nabi-narrow') ? Math.min(max, 5) : max;
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
        labels.attribute(cell, 'aria-label', () => t.t('gridSize', { rows: r, cols: c }));
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
          rows = Math.min(limit, Math.max(1, rows + dr));
          cols = Math.min(limit, Math.max(1, cols + dc));
          paint();
        };
        if (key === 'ArrowDown') step(1, 0);
        else if (key === 'ArrowUp') step(-1, 0);
        else if (key === 'ArrowRight') step(0, localeDirection(t.locale) === 'rtl' ? -1 : 1);
        else if (key === 'ArrowLeft') step(0, localeDirection(t.locale) === 'rtl' ? 1 : -1);
        else if (key === 'Enter' || key === ' ')
          run(action.command, { [action.rowsKey]: rows, [action.colsKey]: cols });
        else return;
        event.preventDefault();
      });

      labels.add(paint);
      focusQuiet(panel.root);
    };

    // 물어보기 — 주소·이름을 받아 커맨드 하나.
    const openAsk = (wing: Wing, anchor: HTMLButtonElement, action: Extract<WingAction, { kind: 'prompt' }>): void => {
      picker = openPrompt(owner, {
        anchor,
        restore: options.surface ?? null,
        translator: t,
        get okLabel() {
          return t.t('ok');
        },
        fields: action.fields.map((field) => {
          // 미리 채울 값 — 노드에서 읽는 것이 먼저고(고치는 자리), 없으면 선언의 initial.
          // The value to prefill — read from the node first (an edit site), else the declared `initial`.
          const filled = field.initial?.();
          return {
            name: field.name,
            get label() {
              return t.pick(field.label, `field.${wing.w}.${field.name}`);
            },
            ...(filled !== undefined && filled !== '' ? { value: filled } : {}),
            ...(field.optional ? { optional: true } : {}),
            // 형식 검사는 wing의 것이다 — ui는 나르기만 한다. 없으면 "빈 것만 막는다"가 답이다.
            // Validation belongs to the wing — ui just carries it through; without one, "only block blank" is the rule.
            ...(field.validate ? { validate: field.validate } : {}),
          };
        }),
        onSubmit: (values) => run(action.command, values),
      });
    };

    // 파일 — 고른 파일은 호스트의 배선으로 흘러간다. 버튼은 포커스를 안 뺏었으므로 캐럿이 산다.
    // File picking — chosen files flow to the host's own wiring. The button never stole focus, so the caret survives.
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
      if (unmounted || unmounting || closingPicker) return false;
      const action = (decl ?? wing.button)?.action;
      return action ? act(wing, button, action, by, true) : false;
    };

    // 선언 하나를 실제로 돌린다 — 누름과 가속키가 같은 문을 지난다(답만 다를 수 있다). by는 부른 손이다 — 커맨드로 바로 가는 갈래(mark·command)만 문에 실어 보낸다. 판을 여는 갈래는 안 싣는다: 그 안에서 고르는 몸짓이 제 손을 새로 밝힌다. 답은 닿았는가다 — 가속키가 키를 삼킬지를 이것으로 가른다.
    // Actually runs a declaration — a press and an accelerator pass through the same door (only their return value can differ). `by` is the triggering hand, carried only for kinds that go straight to a command (mark, command); kinds that open a panel don't carry it, since the gesture inside the panel reveals its own hand. The return value means "did this reach anything" (`actionReaches`), which decides whether an accelerator swallows the key.
    const act = (
      wing: Wing,
      button: HTMLButtonElement,
      action: WingAction,
      by?: CommandHand,
      custom = false,
    ): boolean => {
      if (unmounted || unmounting || closingPicker) return false;
      // 같은 버튼을 다시 누르면 열린 판이 닫힌다.
      // Pressing the same button again closes whatever panel is open.
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      closePicker();
      if (unmounted || unmounting) return false;
      if (wasOpen) return true;
      const name = button.getAttribute('data-name') ?? wing.w;
      const customPanel = custom && Object.hasOwn(options.panels ?? {}, name) ? options.panels?.[name] : undefined;
      if (customPanel) {
        if (typeof customPanel !== 'function') compact?.close(false);
        openToolbarPanel({
          nabi,
          anchor: button,
          translator: t,
          ...(typeof customPanel === 'function' ? { render: customPanel } : customPanel),
          active: () => !unmounted && !unmounting,
          closeForRun: (panel) => {
            if (picker === panel) closePicker();
            else panel.close();
          },
          ...(options.surface ? { surface: options.surface } : {}),
          onOpen: (panel) => {
            picker = panel;
          },
          onClose: (panel) => {
            if (picker === panel) picker = null;
          },
        });
        return true;
      }
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
          compact?.close();
          openFiles(action);
          return true;
        default: {
          // 저장은 부속을 끼운 편집기에서 판이 받는다 — 데모도 남의 페이지도 저장 판을 베껴 짓지 않는다. 안 끼웠으면 아래 옛길이다.
          // Save is caught by the panel on an editor with the option wired — no demo or host page needs to reimplement the save panel. Without it, this falls through to the path below.
          const savePanel = options.file !== undefined && wing.w === saveFileWing.w;
          // 저장 판도 호스트의 손도 없다 — 이 단추는 아무 데도 안 닿는다.
          // Neither the save panel nor a host handler exists — this button reaches nothing.
          if (!actionReaches(action, { savePanel, onHost: options.onHost !== undefined })) return false;
          compact?.close();
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

    // --- 단추 세우기 — 글자 한 벌에서 --------------------------------------------------------
    //
    // 세우는 손과 서버의 손이 같은 함수를 쓴다 — 옛 판은 여기서 DOM을 직접 지었고, 그러면 서버가 그린 줄과 브라우저가 그릴 줄이 언젠가 갈린다. 말이 곧 방향이다: 로케일을 준 자리에만 dir을 적는다 — 안 주는 호스트는 방향을 제 손으로 쥐고 있다는 뜻이라 우리가 덮으면 안 된다.
    // Building here uses the same function the server uses — direct DOM construction would eventually let the server-rendered row and the browser-built one drift apart. The language dictates direction too: `dir` is only set when a locale was supplied — a host that didn't give one is holding direction itself, and we must not override that.
    if (options.locale !== undefined || options.translator !== undefined)
      copy.add(() => attributes.attribute('dir', localeDirection(t.locale)));

    const order = options.groups ?? GROUP_ORDER;
    const slots = toolbarSlots(registry, t, order);

    // 서 있는 것이 우리가 그릴 것과 같은가 — 견주는 것은 글자가 아니라 구조다(브라우저가 돌려주는 innerHTML은 속성 차례가 달라 글자로 견주면 늘 어긋난다). .nabi-group 안만 센다 — 같은 그릇에 mountViewTools의 단추가 함께 설 수 있다.
    // Whether what's standing matches what we'd draw — compared by structure, not text (a browser's returned innerHTML reorders attributes, so a text comparison would always mismatch). Only counts inside `.nabi-group`, since mountViewTools' buttons can share the same container.
    const standing = (): HTMLButtonElement[] =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('.nabi-group > button[data-name]'));
    const fits = (list: readonly HTMLButtonElement[]): boolean =>
      list.length === slots.length &&
      slots.every((slot, i) => {
        const el = list[i];
        return (
          el?.getAttribute('data-name') === slot.name &&
          el.getAttribute('aria-label') === slot.label &&
          (!(slot.decl.icon || slot.decl.svg) ||
            el.querySelector('[data-nabi-icon]')?.getAttribute('data-nabi-icon') === `toolbar-${slot.name}`)
        );
      });

    let standingButtons = standing();
    if (!fits(standingButtons)) {
      // 미리 그린 것이 없거나 어긋난다 — 그 자리에서 새로 그린다. 조용히 안 깨진다: 잃는 것은 미리 그린 값(깜박임이 돌아온다)뿐이고 화면은 언제나 옳다.
      // No pre-rendered row, or it doesn't match — redrawn on the spot. This never fails silently: the only cost is losing the pre-render (a flash returns), while the screen is always correct.
      for (const el of Array.from(root.querySelectorAll(':scope > .nabi-group'))) el.remove();
      root.insertAdjacentHTML(
        'beforeend',
        renderToolbarHtml({
          registry,
          translator: t,
          groups: order,
          ...(options.layout ? { layout: options.layout } : {}),
          ...(options.quick ? { quick: options.quick } : {}),
        }),
      );
      standingButtons = standing();
    }
    for (const el of Array.from(root.querySelectorAll<HTMLElement>(':scope > .nabi-group'))) {
      const name = el.getAttribute('data-group');
      if (name !== null) groups.set(name, el);
    }

    // 그룹만 한 겹 감싼다 — 한 줄 모드의 스크롤 그릇이다. 넓은 폭에서는 display:contents라 없는 셈이고, 좁은 폭에서만 flex로 서서 가로로 구른다. 도구(.nabi-tools)와 toast 선반은 밖에 남는다 — 도구는 늘 보이고, 선반은 스크롤에 안 잘린다.
    // Only the groups get wrapped — this is the scroll container for narrow mode. At wide widths it's `display: contents` and effectively absent; only at narrow widths does it become a flex row that scrolls horizontally. Tools (.nabi-tools) and the toast shelf stay outside it — tools must always be visible, and the shelf must never be clipped by the scroll.
    const strip = make(owner, 'div', 'nabi-strip');
    strip.append(...Array.from(root.querySelectorAll<HTMLElement>(':scope > .nabi-group')));
    root.append(strip);
    lifecycle.add(() => strip.remove());
    const stopNarrow = watchNarrow(root);
    lifecycle.add(stopNarrow);

    slots.forEach((slot, at) => {
      const el = standingButtons[at];
      if (!el) return;
      el.removeAttribute('data-hint');
      const { wing, decl } = slot;
      // 누른 손(by)도 그대로 잇는다 — 어느 단추를 눌렀는지 함께 보낸다.
      // The triggering hand (by) is passed straight through too.
      lifecycle.add(wireIconButton(el, (by) => fire(wing, el, decl, by)));
      buttons.push({
        w: wing.w,
        group: slot.group,
        el,
        ...(decl.value !== undefined ? { value: decl.value } : {}),
        ...(decl.shortcut ? { shortcut: decl.shortcut } : {}),
        ...(decl.accelerator ? { accelerator: decl.accelerator } : {}),
        press: (by = 'keyboard') => fire(wing, el, decl, by),
        accelerate: () => (decl.accelerated ? act(wing, el, decl.accelerated) : fire(wing, el, decl)),
      });
    });

    // --- 다시 칠하기 ----------------------------------------------------------------------------

    // 눌림은 늘 칠한다 — 레이아웃을 안 밀므로 몸짓 중에도 따라간다.
    // Pressed state is always repainted — it doesn't push layout, so it can update mid-gesture.
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
    // Visibility repaints are deferred — hiding/showing reflows the row and pushes text around.
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
      compact?.refresh();
    };

    const stopChange = nabi.onChange(refresh);
    copy.add(() => {
      toolbarSlots(registry, t, order).forEach((slot, at) => {
        const button = buttons[at]?.el;
        if (!button) return;
        button.setAttribute('aria-label', slot.label);
        button.setAttribute('data-nabi-tip', slot.tip);
        if (!slot.decl.icon && !slot.decl.svg) button.textContent = slot.label;
      });
    });
    lifecycle.add(stopChange);
    const stopSettle = settle.onSettle(() => {
      if (unmounted || unmounting) return;
      if (!pendingVisibility) return;
      pendingVisibility = false;
      paintVisibility();
      compact?.refresh();
    });
    lifecycle.add(stopSettle);

    // 가속키 — 선언한 버튼을 누른다(커맨드를 직접 부르지 않는다: 피커가 걸린 것도 있다). 삼키는 것은 실제로 무언가를 한 뒤뿐이다. 문턱 셋을 차례로 넘는다: 우리 땅에서 온 키인가 → 그 이름의 단추가 서 있는가(등록됐고 보이는가) → 그 몸짓이 닿을 데가 있는가. 하나라도 아니면 키는 브라우저의 것으로 흘러간다.
    // Accelerators press the declared button (never call the command directly — some open a picker instead). The key is only swallowed after something actually happens, past three thresholds in order: did it come from our territory, does a button of that name exist (registered and visible), and does its gesture reach anything. Failing any one lets the key flow through to the browser.
    const onKey = (event: Event): void => {
      const key = event as KeyboardEvent;
      if (!(key.metaKey || key.ctrlKey) || key.altKey) return;
      const target = key.target as Element | null;
      if (
        target?.nodeType === 1 &&
        target.closest('.nabi-custom-panel-content') &&
        target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')
      )
        return;
      if (!ownsKey({ surface: options.surface ?? null, root }, key.target)) return;
      if (options.surface && !ownsGestureRoot(root, key.target, options.surface)) return;
      const want = `mod+${key.key.toLowerCase()}`;
      const found = buttons.find((button) => button.accelerator === want);
      if (!found || found.el.hidden) return;
      // 가속키가 제 답을 따로 들면 그것을 쓴다 — 누르는 손과 뜻이 다른 자리다(저장의 ⌘S).
      // Uses the accelerator's own answer when it has one — where its meaning differs from a plain press (Cmd+S for save).
      if (!found.accelerate()) return;
      event.preventDefault();
    };
    if (options.accelerators !== false) {
      owner.addEventListener('keydown', onKey, true);
      lifecycle.add(() => owner.removeEventListener('keydown', onKey, true));
    }

    // 기본 toast 그릇 — 툴바가 서면 그 아래 알림 자리도 함께 선다. 별도 mount를 호스트에게 시키지 않는 까닭: "콜백을 안 주면 core 기본이 뜬다"가 계약이라 배선 없이도 서 있어야 한다. 콜백을 끼운 인스턴스에서는 이 그릇이 안 불려 DOM이 아예 안 생긴다.
    // The default toast mount — standing up the toolbar also stands up its notification slot below. The host never has to mount this separately: the contract is "the core default appears when no callback is given," so it must exist even with zero wiring. On an instance where the host supplied its own toast callback, this mount is never invoked and creates no DOM.
    const toast: ToastMount = mountToast({ nabi, root });
    lifecycle.add(() => toast.unmount());

    // 고르는 판도 같은 자리에서 선다 — 툴바를 세운 편집기는 붙여넣기 판을 갖는다(호스트 배선이 하나도 안 든다). surface는 ui 아래층이라 판을 직접 못 띄우고, 이 한 줄이 그 문을 잇는다.
    // The paste-choice panel is wired here too — any editor with a toolbar gets it, with zero host wiring required. surface sits below ui and can't open a panel itself, so this one line bridges that door.
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

    const unbindLocale = options.locale === undefined ? null : hostOf(nabi).bindLocale(options.locale);
    if (unbindLocale) lifecycle.add(unbindLocale);

    if (options.layout !== 'wrap') {
      compact = mountCompactToolbar({
        nabi,
        root,
        strip,
        buttons,
        translator: t,
        quick: options.quick ?? ['b', 'i', 'tc', 'fs'],
        onLayoutChange: closePicker,
        ...(options.surface ? { surface: options.surface } : {}),
      });
      lifecycle.add(() => compact?.unmount());
    } else root.querySelector(':scope > [data-nabi-compact]')?.remove();
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
