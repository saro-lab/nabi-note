export type Disposer = () => void;

const once = (dispose: Disposer): Disposer => {
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    dispose();
  };
};

export class DisposerStack {
  readonly #items: Disposer[] = [];
  #disposed = false;

  get disposed(): boolean {
    return this.#disposed;
  }

  add(dispose: Disposer): Disposer {
    const item = once(dispose);
    if (this.#disposed) item();
    else this.#items.push(item);
    return item;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    for (let at = this.#items.length - 1; at >= 0; at -= 1) {
      try {
        this.#items[at]?.();
      } catch {
        // One extension teardown must not strand the rest of the mount.
      }
    }
    this.#items.length = 0;
  }
}

export class AsyncMountScope {
  #generation = 0;
  #disposed = false;

  get disposed(): boolean {
    return this.#disposed;
  }

  next(): number {
    this.#generation += 1;
    return this.#generation;
  }

  active(generation: number): boolean {
    return !this.#disposed && generation === this.#generation;
  }

  invalidate(): void {
    this.#generation += 1;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#generation += 1;
  }
}

interface AttributeState {
  readonly present: boolean;
  readonly value: string;
}

interface StyleState {
  readonly value: string;
  readonly priority: string;
}

interface LeaseEntry<T> {
  value: T;
}

interface LeaseCell<T> {
  readonly baseline: T;
  readonly entries: LeaseEntry<T>[];
  readonly read: () => T;
  readonly write: (value: T) => void;
  readonly equal: (left: T, right: T) => boolean;
}

interface LeaseHandle<T> {
  value(value: T): void;
  dispose(): void;
}

const elementCells = new WeakMap<Element, Map<string, LeaseCell<unknown>>>();

function leaseValue<T>(
  element: Element,
  key: string,
  read: () => T,
  write: (value: T) => void,
  equal: (left: T, right: T) => boolean,
  initial: T,
): LeaseHandle<T> {
  let cells = elementCells.get(element);
  if (!cells) {
    cells = new Map();
    elementCells.set(element, cells);
  }

  let cell = cells.get(key) as LeaseCell<T> | undefined;
  if (!cell) {
    cell = { baseline: read(), entries: [], read, write, equal };
    cells.set(key, cell as LeaseCell<unknown>);
  }

  const entry: LeaseEntry<T> = { value: initial };
  cell.entries.push(entry);
  try {
    write(initial);
  } catch (error) {
    cell.entries.pop();
    if (cell.entries.length === 0) {
      cells.delete(key);
      if (cells.size === 0) elementCells.delete(element);
    }
    throw error;
  }
  let active = true;

  return {
    value(value) {
      if (!active) return;
      const previous = entry.value;
      entry.value = value;
      if (cell?.entries.at(-1) !== entry) return;
      try {
        cell.write(value);
      } catch (error) {
        entry.value = previous;
        throw error;
      }
    },
    dispose() {
      if (!active || !cell) return;
      active = false;
      const at = cell.entries.indexOf(entry);
      if (at === -1) return;
      const top = at === cell.entries.length - 1;
      cell.entries.splice(at, 1);
      try {
        if (top && cell.equal(cell.read(), entry.value)) {
          cell.write(cell.entries.at(-1)?.value ?? cell.baseline);
        }
      } finally {
        if (cell.entries.length === 0) {
          cells?.delete(key);
          if (cells?.size === 0) elementCells.delete(element);
        }
      }
    },
  };
}

const attributeState = (element: Element, name: string): AttributeState => ({
  present: element.hasAttribute(name),
  value: element.getAttribute(name) ?? '',
});

const sameAttribute = (left: AttributeState, right: AttributeState): boolean =>
  left.present === right.present && (!left.present || left.value === right.value);

export class HostElementLease {
  readonly #element: HTMLElement;
  readonly #handles = new Map<string, LeaseHandle<unknown>>();
  readonly #order: string[] = [];
  #disposed = false;

  constructor(element: HTMLElement) {
    this.#element = element;
  }

  attribute(name: string, value: string | null): void {
    const key = `attribute:${name}`;
    const state: AttributeState = value === null ? { present: false, value: '' } : { present: true, value };
    const old = this.#handles.get(key) as LeaseHandle<AttributeState> | undefined;
    if (old) {
      old.value(state);
      return;
    }
    if (this.#disposed) return;
    const handle = leaseValue(
      this.#element,
      key,
      () => attributeState(this.#element, name),
      (next) => {
        if (next.present) this.#element.setAttribute(name, next.value);
        else this.#element.removeAttribute(name);
      },
      sameAttribute,
      state,
    );
    this.#handles.set(key, handle as LeaseHandle<unknown>);
    this.#order.push(key);
  }

  className(name: string, enabled: boolean): void {
    const key = `class:${name}`;
    const old = this.#handles.get(key) as LeaseHandle<boolean> | undefined;
    if (old) {
      old.value(enabled);
      return;
    }
    if (this.#disposed) return;
    const handle = leaseValue(
      this.#element,
      key,
      () => this.#element.classList.contains(name),
      (next) => this.#element.classList.toggle(name, next),
      (left, right) => left === right,
      enabled,
    );
    this.#handles.set(key, handle as LeaseHandle<unknown>);
    this.#order.push(key);
  }

  style(name: string, value: string | null, priority = ''): void {
    const key = `style:${name}`;
    const state: StyleState = { value: value ?? '', priority: value === null ? '' : priority };
    const old = this.#handles.get(key) as LeaseHandle<StyleState> | undefined;
    if (old) {
      old.value(state);
      return;
    }
    if (this.#disposed) return;
    const handle = leaseValue(
      this.#element,
      key,
      () => ({
        value:
          typeof this.#element.style.getPropertyValue === 'function' ? this.#element.style.getPropertyValue(name) : '',
        priority:
          typeof this.#element.style.getPropertyPriority === 'function'
            ? this.#element.style.getPropertyPriority(name)
            : '',
      }),
      (next) => {
        if (next.value === '') this.#element.style.removeProperty(name);
        else this.#element.style.setProperty(name, next.value, next.priority);
      },
      (left, right) => left.value === right.value && left.priority === right.priority,
      state,
    );
    this.#handles.set(key, handle as LeaseHandle<unknown>);
    this.#order.push(key);
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    for (let at = this.#order.length - 1; at >= 0; at -= 1) {
      try {
        this.#handles.get(this.#order[at] as string)?.dispose();
      } catch {
        // A host property failure must not strand the other leased properties.
      }
    }
    this.#handles.clear();
    this.#order.length = 0;
  }
}

interface DomNodeSnapshot {
  readonly node: Node;
  readonly data?: string;
  readonly attributes?: readonly (readonly [string, string])[];
  readonly children: readonly DomNodeSnapshot[];
}

const snapshotNode = (node: Node): DomNodeSnapshot => ({
  node,
  ...(node.nodeType === 1
    ? {
        attributes: Array.from((node as Element).attributes, (attribute) => [attribute.name, attribute.value] as const),
      }
    : {}),
  ...([3, 4, 7, 8].includes(node.nodeType) ? { data: (node as CharacterData).data } : {}),
  children: Array.from(node.childNodes, snapshotNode),
});

const restoreNode = (snapshot: DomNodeSnapshot): void => {
  const { node } = snapshot;
  if (snapshot.data !== undefined) (node as CharacterData).data = snapshot.data;
  if (snapshot.attributes) {
    const element = node as Element;
    for (const attribute of Array.from(element.attributes)) element.removeAttribute(attribute.name);
    for (const [name, value] of snapshot.attributes) element.setAttribute(name, value);
  }
  for (const child of snapshot.children) restoreNode(child);
  while (node.firstChild) node.removeChild(node.firstChild);
  for (const child of snapshot.children) node.appendChild(child.node);
};

export class HostElementBaseline {
  readonly #root: HTMLElement;
  readonly #attributes: readonly (readonly [string, string])[];
  readonly #children: readonly DomNodeSnapshot[];

  constructor(root: HTMLElement) {
    this.#root = root;
    this.#attributes = Array.from(root.attributes, (attribute) => [attribute.name, attribute.value] as const);
    this.#children = Array.from(root.childNodes, snapshotNode);
  }

  restore(): void {
    for (const child of this.#children) restoreNode(child);
    while (this.#root.firstChild) this.#root.removeChild(this.#root.firstChild);
    for (const child of this.#children) this.#root.appendChild(child.node);
    for (const attribute of Array.from(this.#root.attributes)) this.#root.removeAttribute(attribute.name);
    for (const [name, value] of this.#attributes) this.#root.setAttribute(name, value);
  }
}

export class OwnedNodes {
  readonly #nodes = new Set<Node>();

  add<T extends Node>(node: T): T {
    this.#nodes.add(node);
    return node;
  }

  dispose(): void {
    for (const node of this.#nodes) node.parentNode?.removeChild(node);
    this.#nodes.clear();
  }
}

export interface FilePickerOptions {
  readonly accept?: string;
  readonly multiple?: boolean;
  readonly signal?: AbortSignal;
  readonly onFiles: (files: readonly File[]) => void;
  readonly onCancel?: () => void;
  readonly onError?: (error: unknown) => void;
}

export function openFilePicker(owner: Document, options: FilePickerOptions): Disposer {
  const view = owner.defaultView;
  const input = owner.createElement('input');
  input.type = 'file';
  input.style.display = 'none';
  if (options.accept !== undefined) input.accept = options.accept;
  input.multiple = options.multiple === true;
  let timer: number | null = null;
  let settled = false;

  const cleanup = (): void => {
    if (timer !== null && view) view.clearTimeout(timer);
    timer = null;
    input.removeEventListener('change', onChange);
    input.removeEventListener('cancel', onCancel);
    view?.removeEventListener('focus', onFocus);
    options.signal?.removeEventListener('abort', onAbort);
    input.remove();
  };

  const finish = (files: readonly File[] | null, error?: unknown): void => {
    if (settled) return;
    settled = true;
    cleanup();
    try {
      if (error !== undefined) options.onError?.(error);
      else if (files && files.length > 0) options.onFiles(files);
      else options.onCancel?.();
    } catch (callbackError) {
      if (error === undefined) {
        try {
          options.onError?.(callbackError);
        } catch {
          // Cleanup has already completed; error reporting cannot reopen the picker.
        }
      }
    }
  };

  const chosen = (): readonly File[] => Array.from(input.files ?? []);
  function onChange(): void {
    const files = chosen();
    finish(files.length > 0 ? files : null);
  }
  function onCancel(): void {
    finish(null);
  }
  function onAbort(): void {
    finish(null);
  }
  function onFocus(): void {
    if (!view || settled) return;
    if (timer !== null) view.clearTimeout(timer);
    timer = view.setTimeout(() => {
      timer = null;
      const files = chosen();
      finish(files.length > 0 ? files : null);
    }, 0);
  }

  input.addEventListener('change', onChange);
  input.addEventListener('cancel', onCancel);
  view?.addEventListener('focus', onFocus);
  options.signal?.addEventListener('abort', onAbort, { once: true });
  try {
    owner.body.append(input);
    if (options.signal?.aborted) finish(null);
    else {
      input.click();
    }
  } catch (error) {
    finish(null, error);
  }

  return once(() => finish(null));
}

const mountedRoots = new WeakMap<Document, Map<HTMLElement, object>>();

// Document listeners belong to the innermost mounted editor.  Several UI pieces may
// register the same root, so this is a reference count rather than a second claim.
interface GestureEntry {
  refs: number;
  readonly lands: Map<HTMLElement, number>;
}

const gestureRoots = new WeakMap<Document, Map<HTMLElement, GestureEntry>>();
interface ActiveGesture {
  readonly identity: HTMLElement;
  readonly deactivate?: () => void;
}
const activeGestureRoots = new WeakMap<Document, ActiveGesture>();
const gestureOwners = new WeakMap<HTMLElement, HTMLElement>();

export function acquireGestureRoot(root: HTMLElement, lands: readonly HTMLElement[] = []): Disposer {
  const owner = root.ownerDocument;
  const identity = lands[0] ?? root;
  let entries = gestureRoots.get(owner);
  if (!entries) {
    entries = new Map();
    gestureRoots.set(owner, entries);
  }
  let entry = entries.get(identity);
  if (!entry) {
    entry = { refs: 0, lands: new Map() };
    entries.set(identity, entry);
  }
  entry.refs += 1;
  const acquired = [root, ...lands];
  for (const land of acquired) entry.lands.set(land, (entry.lands.get(land) ?? 0) + 1);
  gestureOwners.set(root, identity);
  return once(() => {
    const current = entries?.get(identity);
    if (current) {
      current.refs -= 1;
      for (const land of acquired) {
        const count = current.lands.get(land) ?? 0;
        if (count <= 1) current.lands.delete(land);
        else current.lands.set(land, count - 1);
      }
      if (current.refs <= 0) entries?.delete(identity);
    }
    if (entries?.size === 0) gestureRoots.delete(owner);
    if (!entries?.has(identity) && gestureOwners.get(root) === identity) gestureOwners.delete(root);
    if (activeGestureRoots.get(owner)?.identity === identity && !entries?.has(identity))
      activeGestureRoots.delete(owner);
  });
}

export function ownsGestureRoot(
  root: HTMLElement,
  target: EventTarget | null,
  identity: HTMLElement = gestureOwners.get(root) ?? root,
): boolean {
  if (target === null || typeof (target as Node).nodeType !== 'number') return true;
  const entries = gestureRoots.get(root.ownerDocument);
  if (!entries) return root.contains(target as Node);
  const candidates = [...entries.entries()]
    .map(([identity, entry]) => {
      const matches = [...entry.lands.keys()].filter((land) => land === target || land.contains(target as Node));
      const land =
        matches.find((candidate) => !matches.some((other) => other !== candidate && candidate.contains(other))) ?? null;
      return { identity, entry, land };
    })
    .filter(
      (candidate): candidate is { identity: HTMLElement; entry: GestureEntry; land: HTMLElement } =>
        candidate.land !== null,
    );
  if (candidates.length === 0) return false;
  const innermost = candidates.find(
    (candidate) => !candidates.some((other) => other !== candidate && candidate.land.contains(other.land)),
  );
  return innermost?.identity === identity;
}

export function activateGestureRoot(
  root: HTMLElement,
  identity: HTMLElement = gestureOwners.get(root) ?? root,
  deactivate?: () => void,
): Disposer {
  const owner = root.ownerDocument;
  const prior = activeGestureRoots.get(owner);
  if (prior?.identity !== identity) prior?.deactivate?.();
  activeGestureRoots.set(owner, { identity, deactivate });
  return once(() => {
    if (activeGestureRoots.get(owner)?.identity === identity) activeGestureRoots.delete(owner);
  });
}

export function ownsActiveGestureRoot(
  root: HTMLElement,
  identity: HTMLElement = gestureOwners.get(root) ?? root,
): boolean {
  return activeGestureRoots.get(root.ownerDocument)?.identity === identity;
}

export function claimMountRoot(root: HTMLElement): Disposer {
  const owner = root.ownerDocument;
  let roots = mountedRoots.get(owner);
  if (!roots) {
    roots = new Map();
    mountedRoots.set(owner, roots);
  }
  for (const active of roots.keys()) {
    if (active === root || active.contains(root) || root.contains(active)) {
      throw new Error('Nabi mount root overlaps an active mount root');
    }
  }
  const token = {};
  roots.set(root, token);
  return once(() => {
    if (roots?.get(root) !== token) return;
    roots.delete(root);
    if (roots.size === 0) mountedRoots.delete(owner);
  });
}

interface StyleEntry {
  readonly text: string;
  readonly style: HTMLStyleElement;
  readonly owned: boolean;
  refs: number;
}

const documentSheets = new WeakMap<Document, Map<string, StyleEntry>>();

export interface StyleMarker {
  readonly name: string;
  readonly value?: string;
}

export function acquireStyleSheet(owner: Document, text: string, marker?: StyleMarker): Disposer {
  let entries = documentSheets.get(owner);
  if (!entries) {
    entries = new Map();
    documentSheets.set(owner, entries);
  }

  let entry = entries.get(text);
  if (!entry || !entry.style.isConnected || entry.style.ownerDocument !== owner || entry.style.textContent !== text) {
    const standing = [...owner.head.querySelectorAll<HTMLStyleElement>('style')].find(
      (style) => style.textContent === text,
    );
    const style = standing ?? owner.createElement('style');
    const owned = standing === undefined;
    if (owned) {
      if (marker) style.setAttribute(marker.name, marker.value ?? '');
      style.textContent = text;
      owner.head.append(style);
    }
    entry = { text, style, owned, refs: 0 };
    entries.set(text, entry);
  }

  entry.refs += 1;
  const held = entry;
  return once(() => {
    held.refs -= 1;
    if (held.refs > 0) return;
    if (entries?.get(text) === held) entries.delete(text);
    if (held.owned && held.style.ownerDocument === owner && held.style.textContent === held.text) {
      held.style.remove();
    }
    if (entries?.size === 0) documentSheets.delete(owner);
  });
}
