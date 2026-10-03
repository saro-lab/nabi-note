export interface ToolboxBridge {
  open(): void;
  close(restore?: boolean): void;
  active(): boolean;
}

const toolboxes = new WeakMap<HTMLElement, ToolboxBridge[]>();

export function registerToolbox(root: HTMLElement, toolbox: ToolboxBridge): () => void {
  const entries = toolboxes.get(root) ?? [];
  entries.push(toolbox);
  toolboxes.set(root, entries);
  return () => {
    const at = entries.indexOf(toolbox);
    if (at < 0) return;
    entries.splice(at, 1);
    if (entries.length === 0) toolboxes.delete(root);
  };
}

export function toolboxFor(root: HTMLElement): ToolboxBridge | undefined {
  return toolboxes.get(root)?.at(-1);
}

export interface ToolboxKeyboard {
  focusFirst(): boolean;
  unmount(): void;
}

const controls = 'button, a[href], [role="button"]';
const groups = '.nabi-toolbox-group, .nabi-ctx-group, .nabi-group';
const inputs = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

export function mountToolboxKeyboard(root: HTMLElement): ToolboxKeyboard {
  const owner = root.ownerDocument;
  let disposed = false;
  const buttons = (): HTMLElement[] => {
    const visible = new Map<HTMLElement, boolean>();
    const shown = (el: HTMLElement): boolean => {
      const cached = visible.get(el);
      if (cached !== undefined) return cached;
      const style = owner.defaultView?.getComputedStyle(el);
      const result =
        !el.hidden &&
        !el.hasAttribute('inert') &&
        el.getAttribute('aria-hidden') !== 'true' &&
        !el.classList.contains('nabi-compact-source') &&
        style?.display !== 'none' &&
        style?.visibility !== 'hidden' &&
        style?.visibility !== 'collapse' &&
        (!el.parentElement || shown(el.parentElement));
      visible.set(el, result);
      return result;
    };
    return [...root.querySelectorAll<HTMLElement>(controls)].filter(
      (el) => !el.matches(':disabled, [aria-disabled="true"]') && shown(el),
    );
  };
  const focus = (button: HTMLElement | undefined): boolean => {
    if (disposed || !button) return false;
    button.focus({ preventScroll: true });
    button.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    return owner.activeElement === button;
  };
  const groupOf = (button: HTMLElement): HTMLElement => {
    const group = button.closest<HTMLElement>(groups) ?? button.closest<HTMLElement>('.nabi-panel');
    return group && root.contains(group) ? group : root;
  };
  const onKey = (event: KeyboardEvent): void => {
    if (
      disposed ||
      event.defaultPrevented ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    const target = event.target as Element | null;
    if (!target || target.nodeType !== 1 || target.closest(inputs)) return;
    const current = target.closest<HTMLElement>(controls);
    if (
      current &&
      root.contains(current) &&
      ((event.key.length === 1 && event.key !== ' ') || event.key === 'Backspace' || event.key === 'Delete')
    ) {
      // WebKit은 버튼에 포커스가 있어도 보존된 편집 선택에 입력할 수 있다.
      // WebKit can edit the preserved surface selection while a toolbar button has focus.
      event.preventDefault();
      return;
    }
    if (event.shiftKey && event.key !== 'Tab') return;
    if (!['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    const list = buttons();
    if (!list.length) return;
    const at = current ? list.indexOf(current) : -1;
    let next: HTMLElement | undefined;
    if (event.key === 'Tab') {
      const entries = new Map<HTMLElement, HTMLElement>();
      for (const button of list) {
        const group = groupOf(button);
        if (!entries.has(group)) entries.set(group, button);
      }
      const keys = [...entries.keys()];
      const groupAt = at < 0 ? -1 : keys.indexOf(groupOf(list[at]!));
      const step = event.shiftKey ? -1 : 1;
      const start = groupAt < 0 ? (step < 0 ? 0 : -1) : groupAt;
      next = entries.get(keys[(start + step + keys.length) % keys.length]!);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const direction = owner.defaultView?.getComputedStyle(root).direction === 'rtl' ? -1 : 1;
      const step = (event.key === 'ArrowLeft' ? -1 : 1) * direction;
      const start = at < 0 ? (step < 0 ? 0 : -1) : at;
      next = list[(start + step + list.length) % list.length];
    } else if (at < 0) next = list[0];
    else {
      const boxes = list.map((button) => ({ button, box: button.getBoundingClientRect() }));
      const ordered = [...boxes].sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left);
      const rows: (typeof boxes)[] = [];
      for (const item of ordered) {
        const row = rows.find((candidate) => Math.abs(candidate[0]!.box.top - item.box.top) <= 2);
        if (row) row.push(item);
        else rows.push([item]);
      }
      const rowAt = rows.findIndex((row) => row.some((item) => item.button === current));
      const step = event.key === 'ArrowUp' ? -1 : 1;
      const row = rows[(rowAt + step + rows.length) % rows.length]!;
      const box = boxes[at]!.box;
      const center = box.left + box.width / 2;
      next = row.reduce((closest, item) =>
        Math.abs(item.box.left + item.box.width / 2 - center) <
        Math.abs(closest.box.left + closest.box.width / 2 - center)
          ? item
          : closest,
      ).button;
    }
    if (focus(next)) event.preventDefault();
  };
  root.addEventListener('keydown', onKey);
  return {
    focusFirst: () => !disposed && focus(buttons()[0]),
    unmount() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener('keydown', onKey);
    },
  };
}
