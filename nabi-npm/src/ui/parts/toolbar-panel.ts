import { hostOf, type CommandArgs, type CommandHand, type Nabi } from '../../editor/index.js';
import { sameSelection } from '../../caret/index.js';
import { DisposerStack, type Disposer } from '../../lifecycle.js';
import { localeDirection, type Translator } from '../../locale/index.js';
import { focusQuiet, make } from './dom.js';
import { openPanel, type Panel } from './panel.js';
import { mountToolboxKeyboard } from './toolbox-keyboard.js';
import { Translations } from './translation.js';

export interface ToolbarPanelContext {
  readonly root: HTMLElement;
  readonly anchor: HTMLElement;
  readonly nabi: Nabi;
  readonly translator: Translator;
  readonly signal: AbortSignal;
  close(): void;
  reposition(): void;
  run(command: string, args?: CommandArgs, by?: CommandHand): boolean;
  onDispose(dispose: Disposer): void;
}

export type ToolbarPanelRenderer = (context: ToolbarPanelContext) => void | Disposer;

interface ToolbarPanelOptions {
  readonly nabi: Nabi;
  readonly anchor: HTMLElement;
  readonly surface?: HTMLElement;
  readonly translator: Translator;
  readonly render: ToolbarPanelRenderer;
  readonly active: () => boolean;
  readonly closeForRun: (panel: Panel) => void;
  readonly onOpen: (panel: Panel) => void;
  readonly onClose: (panel: Panel) => void;
}

export function openToolbarPanel(options: ToolbarPanelOptions): void {
  const { nabi, anchor, translator } = options;
  const owner = anchor.ownerDocument;
  const life = new DisposerStack();
  const registered = new WeakSet<Disposer>();
  const controller = new (owner.defaultView?.AbortController ?? AbortController)();
  let closed = false;
  let closing = false;
  let panel: Panel;
  const finish = (): void => {
    if (closed) return;
    closed = true;
    controller.abort();
    life.dispose();
    options.onClose(instance);
  };
  const instance: Panel = {
    get root() {
      return panel.root;
    },
    close() {
      if (closed || closing) return;
      closing = true;
      try {
        panel.close();
      } finally {
        finish();
      }
    },
    reposition() {
      if (!closed) panel.reposition();
    },
  };
  try {
    panel = openPanel(owner, {
      anchor,
      className: 'nabi-custom-panel',
      restore: options.surface ?? null,
      onClose: finish,
    });
    if (closed) return;
    // 포커스가 떠날 때 IME 조합이 확정되므로 그 뒤의 문서와 선택을 보관한다.
    // Leaving the surface commits IME composition, so capture the document and selection afterward.
    focusQuiet(panel.root);
    if (closed || !options.active()) {
      instance.close();
      return;
    }
    const selection = nabi.getSelection();
    const doc = hostOf(nabi).doc();
    const root = make(owner, 'div', 'nabi-custom-panel-content');
    panel.root.append(root);
    const copy = new Translations(translator);
    life.add(() => copy.dispose());
    copy.attribute(panel.root, 'dir', () => localeDirection(translator.locale));
    copy.attribute(panel.root, 'aria-label', () => anchor.getAttribute('aria-label') ?? '');
    const keyboard = mountToolboxKeyboard(panel.root);
    life.add(() => keyboard.unmount());
    const Observer = owner.defaultView?.ResizeObserver;
    if (Observer) {
      const observer = new Observer(() => instance.reposition());
      life.add(() => observer.disconnect());
      observer.observe(root);
    }
    options.onOpen(instance);
    const onDispose = (dispose: Disposer): void => {
      if (registered.has(dispose)) return;
      registered.add(dispose);
      if (life.disposed) {
        try {
          dispose();
        } catch {}
      } else life.add(dispose);
    };
    const dispose = options.render({
      root,
      anchor,
      nabi,
      translator,
      signal: controller.signal,
      close: () => instance.close(),
      reposition: () => instance.reposition(),
      run(command, args, by) {
        if (closed || closing || !options.active()) return false;
        options.closeForRun(instance);
        // 문서가 바뀌면 같은 경로도 다른 글을 가리킬 수 있어 예전 선택을 되살리지 않는다.
        // After an edit, the same path can target different text, so an old selection must not be restored.
        if (!options.active() || hostOf(nabi).doc() !== doc) return false;
        focusQuiet(options.surface);
        if (hostOf(nabi).doc() !== doc) return false;
        nabi.select(selection);
        if (!options.active() || hostOf(nabi).doc() !== doc) return false;
        if (!sameSelection(nabi.getSelection(), selection)) return false;
        return nabi.applyCommand(command, args, by);
      },
      onDispose,
    });
    if (dispose !== undefined) {
      if (typeof dispose !== 'function')
        throw new TypeError('Toolbar panel renderers must return a cleanup function or undefined');
      onDispose(dispose);
    }
    if (!closed) {
      panel.reposition();
      if (!panel.root.contains(owner.activeElement) || owner.activeElement === panel.root) {
        if (!keyboard.focusFirst()) focusQuiet(panel.root);
      }
    }
  } catch (error) {
    if (panel!) instance.close();
    else finish();
    throw error;
  }
}
