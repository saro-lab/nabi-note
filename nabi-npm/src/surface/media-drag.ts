import { selectObject } from '../caret/index.js';
import { nodeAt, type Position } from '../doc/index.js';
import { hostOf, type Nabi } from '../editor/index.js';
import { renderHtml, type HtmlOptions } from '../html/index.js';
import { $toJson, isElement, isWrapper, type NabiDoc } from '../schema/index.js';
import { loadClipboard } from './clipboard.js';
import { moveMediaOp } from './media-move.js';
import { fromDomPoint, holderElOf, pathOfId } from './map.js';

const MEDIA_MOVE_MIME = 'application/x-nabi-media-move';

export function makeMediaDrag(options: {
  nabi: Nabi;
  root: HTMLElement;
  htmlOptions: HtmlOptions;
  canEdit(): boolean;
  onEnd(): void;
}) {
  const { nabi, root, htmlOptions, canEdit } = options;
  const host = hostOf(nabi);
  const { env } = host;
  const owner = root.ownerDocument;
  let serial = 0;
  let drag: { path: readonly number[]; doc: NabiDoc; token: string; invalid: boolean } | null = null;
  let marker: HTMLElement | null = null;
  let sourceElement: Element | null = null;

  const hide = (): void => {
    marker?.remove();
    marker = null;
  };
  const end = (): void => {
    const wasDragging = drag !== null;
    sourceElement?.removeEventListener('dragend', end);
    sourceElement = null;
    drag = null;
    hide();
    if (wasDragging) options.onEnd();
  };
  const offChange = nabi.onChange((change) => {
    if (!drag || !change.doc) return;
    drag.invalid = true;
    hide();
  });

  const source = (target: EventTarget | null): readonly number[] | null => {
    const element = (target as Element | null)?.closest?.('img[data-key], [data-nabi-p][draggable="true"]');
    if (!element || !root.contains(element)) return null;
    const elementPath = pathOfId(host.doc(), env, element.getAttribute('data-key') ?? '');
    if (!elementPath) return null;
    const path = element.tagName === 'IMG' ? elementPath.slice(0, -1) : elementPath;
    const wrapper = nodeAt(host.doc(), path);
    const child = wrapper?.ch[0];
    return wrapper && isWrapper(wrapper, env) && isElement(child) && (child.w === 'img' || child.w === 'youtube')
      ? path
      : null;
  };

  const targetAt = (event: DragEvent): { position: Position; rect: DOMRect; after: boolean } | null => {
    let element = (event.target as Element | null)?.closest?.('[data-key]') ?? null;
    let path: readonly number[] | null = null;
    while (element && root.contains(element)) {
      const candidate = pathOfId(host.doc(), env, element.getAttribute('data-key') ?? '');
      const node = candidate ? nodeAt(host.doc(), candidate) : null;
      if (node?.w === 'p') {
        path = candidate;
        break;
      }
      if (node && env.inlineHolders.has(node.w)) return null;
      if (node && env.blockHolders.has(node.w)) {
        const mapped = fromDomPoint(root, host.doc(), env, element, 0);
        if (mapped) path = mapped.pos.path;
        break;
      }
      element = element.parentElement?.closest('[data-key]') ?? null;
    }
    if (!path) {
      const pointOwner = owner as Document & {
        caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
      };
      const point = pointOwner.caretPositionFromPoint?.(event.clientX, event.clientY);
      const range = point ? null : pointOwner.caretRangeFromPoint?.(event.clientX, event.clientY);
      const node = point?.offsetNode ?? range?.startContainer;
      if (!node || !root.contains(node)) return null;
      const mapped = fromDomPoint(root, host.doc(), env, node, point?.offset ?? range?.startOffset ?? 0);
      path = mapped?.pos.path ?? null;
    }
    const node = path ? nodeAt(host.doc(), path) : null;
    if (!path || node?.w !== 'p' || !node._id) return null;
    const block = holderElOf(root, node._id);
    if (!block) return null;
    const rect = block.getBoundingClientRect();
    const after = event.clientY >= rect.top + rect.height / 2;
    return { position: { path, offset: after ? 1 : 0 }, rect, after };
  };

  const validTarget = (event: DragEvent): ReturnType<typeof targetAt> => {
    if (!drag || drag.invalid || !canEdit() || host.doc() !== drag.doc) return null;
    const target = targetAt(event);
    if (!target || !moveMediaOp(drag.path, target.position)(host.doc(), nabi.getSelection(), {}, env)) return null;
    return target;
  };

  const start = (event: DragEvent): void => {
    end();
    const path = source(event.target);
    if (!path) return;
    const transfer = event.dataTransfer;
    const wrapper = nodeAt(host.doc(), path);
    if (!transfer || !wrapper || !canEdit()) {
      event.preventDefault();
      return;
    }
    const token = `${nabi.sessionId}:${++serial}`;
    try {
      transfer.clearData();
      const child = wrapper.ch[0];
      const src = isElement(child)
        ? child.w === 'youtube'
          ? `https://www.youtube.com/watch?v=${String(child.a?.['v'] ?? '')}`
          : String(child.a?.['src'] ?? '')
        : '';
      loadClipboard(transfer, $toJson([wrapper]), renderHtml([wrapper], htmlOptions), src);
      transfer.setData(MEDIA_MOVE_MIME, token);
      transfer.effectAllowed = 'copyMove';
    } catch {
      event.preventDefault();
      return;
    }
    drag = { path, doc: host.doc(), token, invalid: false };
    sourceElement = event.target as Element;
    sourceElement.addEventListener('dragend', end);
    nabi.select(selectObject(path));
  };

  const over = (event: DragEvent): boolean => {
    if (!drag) return false;
    event.preventDefault();
    const target = validTarget(event);
    if (event.dataTransfer) event.dataTransfer.dropEffect = target ? 'move' : 'none';
    if (!target) {
      hide();
      return true;
    }
    if (!marker) {
      marker = owner.createElement('div');
      marker.className = 'nabi-media-drop';
      marker.setAttribute('aria-hidden', 'true');
      marker.style.cssText = 'position:fixed;pointer-events:none;height:2px;z-index:1200;';
      marker.style.background =
        owner.defaultView?.getComputedStyle(root).getPropertyValue('--nabi-accent') || '#3b6fe0';
      owner.body.append(marker);
    }
    marker.style.left = `${target.rect.left}px`;
    marker.style.top = `${(target.after ? target.rect.bottom : target.rect.top) - 1}px`;
    marker.style.width = `${target.rect.width}px`;
    return true;
  };

  const drop = (event: DragEvent): boolean => {
    if (!drag) return false;
    const current = drag;
    let matches = false;
    try {
      matches = event.dataTransfer?.getData(MEDIA_MOVE_MIME) === current.token;
    } catch {
      matches = false;
    }
    if (!matches) {
      end();
      return false;
    }
    event.preventDefault();
    const target = validTarget(event);
    end();
    if (target) {
      root.focus({ preventScroll: true });
      host.applyRaw(moveMediaOp(current.path, target.position), 'moveMedia');
    }
    return true;
  };

  const leave = (event: DragEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (!next || !root.contains(next)) hide();
  };
  root.addEventListener('dragleave', leave);
  owner.addEventListener('scroll', hide, true);

  return {
    source,
    start,
    over,
    drop,
    end,
    active: () => drag !== null && !drag.invalid,
    pending: () => drag !== null,
    unmount() {
      end();
      offChange();
      root.removeEventListener('dragleave', leave);
      owner.removeEventListener('scroll', hide, true);
    },
  };
}
