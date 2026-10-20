import { attachHeadingNumbers } from '../style/headings.js';
import { hostOf } from '../editor/host.js';
import { acquireStyleSheet, claimMountRoot, DisposerStack, HostElementLease } from '../lifecycle.js';
import { localeDirection, makeTranslator } from '../locale/index.js';
import { mountSurface, type Surface, type SurfaceOptions } from '../surface/mount.js';
import { mountToolbar, type Toolbar, type ToolbarOptions } from '../ui/toolbar.js';
import { mountContextToolbar } from '../ui/context.js';
import { mountPickedMark } from '../ui/picked.js';
import { mountHints } from '../ui/hints.js';
import { mountViewTools } from '../ui/overlay.js';
import { mountToast } from '../ui/toast.js';
import { CORE_CSS, collectSheets, injectSheets } from '../ui/css.js';
import { createMergeSession, type MergeSession, type MergeSessionOptions, type MergeConflictState } from './session.js';
import { mountMergeChanges } from './changes-view.js';
import { MERGE_CSS } from './styles.js';

export interface MergeResult {
  readonly json: unknown[];
  readonly html: string;
  readonly revision: number;
  readonly incomingVersion?: string | number;
  readonly signal: AbortSignal;
}

export interface MergeMountOptions extends MergeSessionOptions {
  readonly root: HTMLElement;
  readonly incomingVersion?: string | number;
  readonly onConfirm?: (result: MergeResult) => void | boolean | Promise<void | boolean>;
  readonly onError?: (error: unknown) => void;
  readonly toolbarOptions?: Omit<ToolbarOptions, 'root' | 'nabi' | 'registry' | 'surface' | 'locale' | 'translator'>;
  readonly surfaceOptions?: Omit<SurfaceOptions, 'root' | 'nabi' | 'registry' | 'locale' | 'allowLocalUrls'>;
}

export interface MergeMount {
  readonly nabi: MergeSession['nabi'];
  readonly registry: MergeSession['registry'];
  readonly session: MergeSession;
  readonly surface: Surface;
  readonly content: HTMLElement;
  readonly toolbar: Toolbar;
  confirm(): Promise<boolean>;
  unmount(): void;
}

export function mountMerge(options: MergeMountOptions): MergeMount {
  const { root } = options;
  const releaseCheck = claimMountRoot(root);
  releaseCheck();
  const lifecycle = new DisposerStack();
  const owner = root.ownerDocument;
  const session = createMergeSession({
    ...options,
    editorOptions: { ...options.editorOptions, onError: options.editorOptions?.onError ?? options.onError },
  });
  lifecycle.add(() => session.dispose());
  const { nabi, registry, model } = session;
  const host = hostOf(nabi);
  const locale = options.locale ?? options.editorOptions?.locale;
  const translator = makeTranslator(locale);
  const t = (key: string): string => translator.t(`merge.${key}`);
  const lease = new HostElementLease(root);
  lifecycle.add(() => lease.dispose());
  lease.className('nabi-merge', true);
  let dead = false;
  let pending = false;
  let composing = false;
  let releaseComposition: (() => void) | null = null;
  let selected = model.conflicts[0]?.id ?? '';
  let confirmedRevision = -1;
  let confirmation: AbortController | null = null;
  let releaseConfirmation: (() => void) | null = null;
  const el = (name: string, parent?: HTMLElement, tag = 'div'): HTMLElement => {
    const node = owner.createElement(tag);
    node.className = `nabi-merge-${name}`;
    parent?.append(node);
    return node;
  };
  const shell = el('shell');
  shell.classList.add('nabi', 'nabi-merge');
  lifecycle.add(() => shell.remove());
  try {
    lifecycle.add(injectSheets(owner, collectSheets(registry, CORE_CSS)));
    lifecycle.add(acquireStyleSheet(owner, MERGE_CSS, { name: 'data-nabi-merge' }));
    const bar = el('bar', shell);
    const status = el('status', bar);
    status.setAttribute('role', 'status');
    const button = (parent: HTMLElement, key: string, click: () => void): HTMLButtonElement => {
      const result = el('button', parent, 'button') as HTMLButtonElement;
      result.type = 'button';
      result.dataset.mergeAction = key;
      result.addEventListener('click', click);
      return result;
    };
    const navigate = (direction: number): void => {
      const remaining = session.getState().conflicts.filter((conflict) => conflict.status === 'unresolved');
      if (remaining.length === 0) return;
      const at = remaining.findIndex((conflict) => conflict.id === selected);
      selected = remaining[(at + direction + remaining.length) % remaining.length]!.id;
      update();
      reveal();
    };
    const prev = button(bar, 'prev', () => navigate(-1));
    const next = button(bar, 'next', () => navigate(1));
    const submit = button(bar, 'confirm', () => {
      void confirm();
    });
    const grid = el('grid', shell);
    const pane = (name: string): { pane: HTMLElement; title: HTMLElement } => {
      const panel = el(`pane nabi-merge-${name}`, grid);
      panel.setAttribute('role', 'region');
      const title = el('title', panel, 'h3');
      return { pane: panel, title };
    };
    const left = pane('base');
    const base = el('source nabi-content', left.pane);
    const baseGutter = el('gutter nabi-merge-base-gutter', grid);
    const middle = pane('result');
    const actions = el('actions', middle.pane);
    const choose = (choice: 'base' | 'incoming' | 'current'): void => {
      if (pending || composing) return;
      if (session.resolve(selected, choice)) reveal();
    };
    const keep = button(actions, 'current', () => choose('current'));
    const detail = el('detail', actions, 'p');
    const editor = owner.createElement('div');
    editor.className = 'nabi nabi-merge-editor';
    middle.pane.append(editor);
    const toolbarBox = owner.createElement('div');
    toolbarBox.className = 'nabi-toolbar';
    const toolbarRoot = owner.createElement('div');
    const contextRoot = owner.createElement('div');
    toolbarBox.append(toolbarRoot, contextRoot);
    shell.insertBefore(toolbarBox, grid);
    shell.insertBefore(actions, grid);
    const scroll = el('scroll', editor);
    const paper = el('paper', scroll);
    const content = el('content nabi-content', paper);
    const overlay = el('overlay', paper);
    overlay.setAttribute('aria-hidden', 'true');
    const incomingGutter = el('gutter nabi-merge-incoming-gutter', grid);
    const right = pane('incoming');
    const incoming = el('source nabi-content', right.pane);
    const headingNumbers = [base, content, incoming].map(attachHeadingNumbers);
    for (const numbers of headingNumbers) lifecycle.add(() => numbers.unmount());
    const errorNode = el('error', shell);
    errorNode.setAttribute('role', 'alert');
    errorNode.hidden = true;
    lifecycle.add(claimMountRoot(base));
    lifecycle.add(claimMountRoot(incoming));
    root.replaceChildren(shell);
    const surface = mountSurface({
      ...options.surfaceOptions,
      root: content,
      nabi,
      registry,
      locale,
      allowLocalUrls: options.allowLocalUrls ?? options.editorOptions?.allowLocalUrls,
    });
    lifecycle.add(() => surface.unmount());
    const picked = mountPickedMark({ nabi, surface: content });
    lifecycle.add(() => picked.unmount());
    const toolbar = mountToolbar({
      ...options.toolbarOptions,
      root: toolbarRoot,
      nabi,
      registry,
      surface: content,
      locale,
    });
    lifecycle.add(() => toolbar.unmount());
    const viewTools = mountViewTools({ nabi, root: shell, container: toolbarRoot, surface: content, locale });
    lifecycle.add(() => viewTools.unmount());
    const context = mountContextToolbar({ root: contextRoot, nabi, registry, surface: content, locale });
    lifecycle.add(() => context.unmount());
    const hints = mountHints({ root: toolbarBox, surface: content, toolbar, context });
    lifecycle.add(() => hints.unmount());
    const toast = mountToast({ nabi, root: toolbarRoot });
    lifecycle.add(() => toast.unmount());
    const activeConflict = (): MergeConflictState | undefined =>
      session.getState().conflicts.find((conflict) => conflict.id === selected && conflict.status === 'unresolved');
    const changes = mountMergeChanges({
      session,
      content,
      scroll,
      paper,
      overlay,
      panes: [
        { source: 'base', root: base, gutter: baseGutter },
        { source: 'incoming', root: incoming, gutter: incomingGutter },
      ],
      label: (source) => t(source === 'base' ? 'restoreBase' : 'useIncoming'),
      select(id) {
        selected = id;
        update();
      },
      allowLocalUrls: options.allowLocalUrls ?? options.editorOptions?.allowLocalUrls,
    });
    lifecycle.add(() => changes.dispose());
    function update(): void {
      if (dead) return;
      const state = session.getState();
      const remaining = state.conflicts.filter((conflict) => conflict.status === 'unresolved');
      if (!remaining.some((conflict) => conflict.id === selected)) selected = remaining[0]?.id ?? '';
      lease.attribute('dir', localeDirection(translator.locale));
      left.title.textContent = t('base');
      middle.title.textContent = t('result');
      right.title.textContent = t('incoming');
      left.pane.setAttribute('aria-label', t('base'));
      middle.pane.setAttribute('aria-label', t('result'));
      right.pane.setAttribute('aria-label', t('incoming'));
      content.setAttribute('aria-label', t('result'));
      status.textContent = remaining.length ? translator.t('merge.remaining', { count: remaining.length }) : t('ready');
      prev.textContent = t('prev');
      next.textContent = t('next');
      submit.textContent = pending ? t('saving') : confirmedRevision === state.revision ? t('confirmed') : t('confirm');
      submit.disabled = pending || !state.canConfirm || confirmedRevision === state.revision;
      prev.hidden = next.hidden = actions.hidden = remaining.length === 0;
      prev.disabled = next.disabled = composing || pending;
      const conflict = activeConflict();
      keep.textContent = t('useCurrent');
      keep.disabled = pending || composing || !state.canApply || !conflict;
      detail.textContent = conflict?.ambiguous
        ? t('manual')
        : translator.t('merge.active', {
            index:
              Math.max(
                0,
                remaining.findIndex((item) => item.id === selected),
              ) + 1,
            count: remaining.length,
          });
      changes.update(selected, pending || composing || !state.canApply, composing);
      for (const numbers of headingNumbers) numbers.update();
    }
    function reveal(): void {
      changes.reveal(selected);
    }
    const startComposition = (): void => {
      composing = true;
      releaseComposition ??= session.hold();
      update();
    };
    const endComposition = (): void => {
      if (!composing && !releaseComposition) return;
      composing = false;
      releaseComposition?.();
      releaseComposition = null;
      update();
    };
    content.addEventListener('compositionstart', startComposition);
    content.addEventListener('compositionend', endComposition);
    content.addEventListener('blur', endComposition);
    lifecycle.add(() => {
      content.removeEventListener('compositionstart', startComposition);
      content.removeEventListener('compositionend', endComposition);
      content.removeEventListener('blur', endComposition);
      releaseComposition?.();
    });
    lifecycle.add(session.onChange(update));
    if (translator.onChange) lifecycle.add(translator.onChange(update));
    async function confirm(): Promise<boolean> {
      const state = session.getState();
      if (dead || pending || composing || !state.canConfirm || confirmedRevision === state.revision) return false;
      pending = true;
      errorNode.hidden = true;
      const controller = new AbortController();
      confirmation = controller;
      const editingLease = new HostElementLease(content);
      editingLease.attribute('contenteditable', 'false');
      const releaseLock = host.lock('merge-confirm');
      const releaseHold = session.hold();
      releaseConfirmation = () => {
        releaseLock();
        editingLease.dispose();
        releaseHold();
      };
      update();
      try {
        if (dead || controller.signal.aborted) return false;
        const accepted = await options.onConfirm?.({
          json: nabi.getJson(),
          html: nabi.getHtml(),
          revision: state.revision,
          incomingVersion: options.incomingVersion,
          signal: controller.signal,
        });
        if (dead || controller.signal.aborted || state.revision !== session.getState().revision) return false;
        if (accepted === false) {
          errorNode.textContent = t('failed');
          errorNode.hidden = false;
          return false;
        }
        confirmedRevision = state.revision;
        return true;
      } catch (error) {
        if (!dead) {
          errorNode.textContent = t('failed');
          errorNode.hidden = false;
          try {
            options.onError?.(error);
          } catch {}
        }
        return false;
      } finally {
        pending = false;
        releaseConfirmation?.();
        releaseConfirmation = null;
        confirmation = null;
        update();
      }
    }
    update();
    return {
      nabi,
      registry,
      session,
      surface,
      content,
      toolbar,
      confirm,
      unmount() {
        if (dead) return;
        dead = true;
        confirmation?.abort();
        releaseConfirmation?.();
        releaseConfirmation = null;
        lifecycle.dispose();
      },
    };
  } catch (error) {
    dead = true;
    lifecycle.dispose();
    throw error;
  }
}
