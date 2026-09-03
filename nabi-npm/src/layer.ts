interface LayerEntry {
  readonly token: object;
  readonly focus: HTMLElement | null;
}

const stacks = new WeakMap<Document, LayerEntry[]>();

export interface DocumentLayer {
  isTop(): boolean;
  release(): void;
}

export function topLayerFocus(owner: Document): HTMLElement | null {
  const focus = stacks.get(owner)?.at(-1)?.focus ?? null;
  return focus?.isConnected ? focus : null;
}

interface InertCell {
  readonly baseline: boolean;
  readonly entries: object[];
}

const inertCells = new WeakMap<HTMLElement, InertCell>();
const modalRoots = new WeakMap<Document, Set<HTMLElement>>();

// 레이어가 떠 있는 동안 형제는 inert가 된다 — 항목은 중첩 레이어끼리 쌓이고, 이 레이어가 소유한 값을 아직 든 속성만 되돌린다.
// Modal siblings go inert while a layer is up; entries stack for nested layers, and release restores an attribute only if it still holds the value this layer set.
export function inertDocumentBackground(owner: Document, layerRoot: HTMLElement): () => void {
  const token = {};
  const touched: HTMLElement[] = [];
  let roots = modalRoots.get(owner);
  if (!roots) {
    roots = new Set();
    modalRoots.set(owner, roots);
  }
  roots.add(layerRoot);
  let active = true;
  const touch = (child: HTMLElement): void => {
    if (child === layerRoot || roots?.has(child) || touched.includes(child)) return;
    let cell = inertCells.get(child);
    if (!cell) {
      cell = {
        baseline:
          typeof child.hasAttribute === 'function' ? child.hasAttribute('inert') : child.getAttribute('inert') !== null,
        entries: [],
      };
      inertCells.set(child, cell);
    }
    cell.entries.push(token);
    touched.push(child);
    child.setAttribute('inert', '');
  };
  const view = owner.defaultView;
  const Observer = view?.MutationObserver;
  const observer = Observer
    ? new Observer((records) => {
        for (const record of records)
          for (const node of record.addedNodes) {
            if (node.nodeType === 1) touch(node as HTMLElement);
          }
      })
    : null;
  const release = (): void => {
    if (!active) return;
    active = false;
    observer?.disconnect();
    let failure: unknown = null;
    for (const child of touched) {
      const cell = inertCells.get(child);
      if (!cell) continue;
      const at = cell.entries.indexOf(token);
      if (at === -1) continue;
      const top = at === cell.entries.length - 1;
      cell.entries.splice(at, 1);
      const inert =
        typeof child.hasAttribute === 'function' ? child.hasAttribute('inert') : child.getAttribute('inert') !== null;
      if (top && inert) {
        try {
          if (cell.entries.length > 0 || cell.baseline) child.setAttribute('inert', '');
          else child.removeAttribute('inert');
        } catch (error) {
          failure ??= error;
        }
      }
      if (cell.entries.length === 0) inertCells.delete(child);
    }
    roots?.delete(layerRoot);
    if (roots?.size === 0) modalRoots.delete(owner);
    if (failure) throw failure;
  };
  const body = owner.body as HTMLElement & { kids?: HTMLElement[] };
  const children = body.children ? ([...body.children] as HTMLElement[]) : (body.kids ?? []);
  try {
    for (const child of children) touch(child);
    observer?.observe(body, { childList: true });
  } catch (error) {
    try {
      release();
    } catch {}
    throw error;
  }
  return release;
}

// 모달 표면은 서로 다른 편집기 마운트에서 와도 문서 스택 하나를 같이 쓴다.
// Modal surfaces share one document stack even across separate editor mounts.
export function pushDocumentLayer(owner: Document, focus: HTMLElement | null = null): DocumentLayer {
  const token = {};
  let stack = stacks.get(owner);
  if (!stack) {
    stack = [];
    stacks.set(owner, stack);
  }
  stack.push({ token, focus });
  let active = true;
  return {
    isTop: () => active && stack?.at(-1)?.token === token,
    release: () => {
      if (!active) return;
      active = false;
      const at = stack?.findIndex((entry) => entry.token === token) ?? -1;
      if (at !== -1) stack?.splice(at, 1);
      if (stack?.length === 0) stacks.delete(owner);
    },
  };
}
