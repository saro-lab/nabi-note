// 코드 색칠의 표면 부속(mount가 붙이고 뗀다) — 화면 span 속만 갈아 끼워서 트리·되돌리기 역사엔 안 남는다.
// The surface attach for code highlighting — only the on-screen spans change, so the tree and undo history stay untouched.
//
// 경합은 잠금이 아니라 순서로 막는다: 프레임당 한 번, 조합(IME) 중엔 안 돎, 서명이 같으면 DOM 안 건드림.
// Races are avoided by ordering, not locks: once per frame, never mid-IME-composition, and skipped when the signature is unchanged.
//
// 색칠의 지식은 `code/` 층에 산다(viewer도 같이 문다) — 여기 남은 건 편집 화면만의 사정뿐이다.
// The actual highlighting logic lives in `code/` (shared with the viewer) — this file only handles the editor-side scheduling.
import { attachCodeCopy } from '../../code/controls.js';
import { hostOf } from '../../editor/index.js';
import { isObjectSelection, sameSelection } from '../../caret/index.js';
import { nodeAt } from '../../doc/index.js';
import { isElement, type ElementNode, type NabiNode } from '../../schema/index.js';
import type { Attach } from '../../wing/index.js';
import { applyTokens, tokensFor, type CodeHighlighter } from '../../code/index.js';

const ZERO_WIDTH = '\u200b';

const samePath = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

// 문서 속 코드 상자 전부 — 상자 자신이 인라인 홀더라 data-key가 그 자리에 붙는다.
// Every code box in the document — the box itself is an inline holder, so `data-key` attaches right there.
function codeBoxes(nodes: readonly NabiNode[], out: ElementNode[] = []): ElementNode[] {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node.w === 'code') out.push(node);
    else codeBoxes(node.ch, out);
  }
  return out;
}

// 상자의 속 글 — 라인(br)은 개행이 된다. 마크는 없다(코드는 평문뿐이다).
// The box's raw text — a line break node becomes `\n`; there are no marks, since code is plain text only.
function sourceOf(box: ElementNode): string {
  let out = '';
  for (const child of box.ch) {
    if (typeof child === 'string') out += child;
    else if (child.w === 'br') out += '\n';
  }
  return out;
}

// 논리 오프셋(글자 수, `<br>`은 하나)을 화면의 점으로 — 칠하기가 속을 갈아 끼운 뒤 캐럿을 도로 세운다.
// Maps a logical offset (characters, `<br>` counts as one) to a screen point, to reseat the caret after repainting.
//
// 자리는 DOM이 아니라 트리에서 온다 — 갈아 끼우기 전 DOM 선택은 앞선 재그리기로 이미 죽어 있을 수 있다.
// The position comes from the tree, not the DOM — a pre-repaint DOM selection can already be stale from an earlier redraw.
function restoreCaretIn(el: Element, caret: { start: number; end: number }): void {
  const owner = el.ownerDocument;
  const selection = owner.getSelection?.() ?? owner.defaultView?.getSelection() ?? null;
  if (!selection) return;

  const positionAt = (target: number): { node: Node; offset: number } | null => {
    let acc = 0;
    let last: { node: Node; offset: number } | null = null;
    const walker = owner.createTreeWalker(el, 0x01 | 0x04);
    while (walker.nextNode()) {
      const cur = walker.currentNode;
      if (cur.nodeType === 3) {
        const length = (cur.textContent ?? '').length;
        if (target <= acc + length) return { node: cur, offset: target - acc };
        acc += length;
        last = { node: cur, offset: length };
        continue;
      }
      if ((cur as Element).tagName !== 'BR') continue;
      const parent = cur.parentNode;
      if (!parent) continue;
      const index = Array.prototype.indexOf.call(parent.childNodes, cur);
      if (target <= acc) return { node: parent, offset: index };
      acc += 1;
      last = { node: parent, offset: index + 1 };
    }
    return last ?? { node: el, offset: 0 };
  };

  const start = positionAt(caret.start);
  const end = caret.start === caret.end ? start : positionAt(caret.end);
  if (!start || !end) return;
  try {
    selection.setBaseAndExtent(start.node, start.offset, end.node, end.offset);
  } catch {
    // 자리가 어긋나면 캐럿만 포기한다 — 칠 자체는 이미 됐다.
    // A bad position just gives up on the caret — the paint itself already landed.
  }
}

export interface PaintOptions {
  // 호스트 하이라이터 — 답을 못 하면 우리 토크나이저가 대신 답한다.
  // A host-supplied highlighter; falls back to our own tokenizer when it can't answer.
  readonly highlight?: CodeHighlighter;
  // Shiki처럼 문법을 비동기로 늦게 받아 오는 하이라이터를 위한 값 — 서명에 넣어 그 도착을 진짜 재칠로 만든다.
  // Lets a late-loading highlighter (e.g. Shiki's async grammar) force a real repaint once it's ready, by changing the signature.
  readonly version?: () => string | number;
}

export function makeCodeAttach(options: PaintOptions = {}): Attach {
  return ({ root, nabi, doc, env, pathOfKey, onDispose }) => {
    const view = root.ownerDocument.defaultView;
    let frame = 0;
    let composing = false;
    let painted = new WeakMap<Element, string>();
    const controls = new Map<Element, ReturnType<typeof attachCodeCopy>>();
    const clearControls = (): void => {
      for (const control of controls.values()) control.dispose();
      controls.clear();
    };
    onDispose(clearControls);

    const sweep = (): void => {
      frame = 0;
      if (composing) return;
      const selection = nabi.getSelection();
      const selectedHolder = isObjectSelection(doc(), selection, env) ? nodeAt(doc(), selection.anchor.path) : null;
      const selectedWrapper = selectedHolder?._id
        ? root.querySelector(`[data-key="${selectedHolder._id.replace(/["\\]/g, '\\$&')}"]`)
        : null;
      const domSelection = root.ownerDocument.getSelection();
      const active = root.ownerDocument.activeElement;
      const ownsSelection =
        (active === root || root.contains(active)) &&
        domSelection !== null &&
        selectedWrapper?.contains(domSelection.anchorNode) &&
        selectedWrapper.contains(domSelection.focusNode);
      let repainted = false;
      for (const [el, control] of controls) {
        if (!root.contains(el) || !el.querySelector(':scope > .nabi-code-copy')) {
          control.dispose();
          controls.delete(el);
        }
      }
      for (const box of codeBoxes(doc())) {
        if (typeof box._id !== 'string') continue;
        const el = root.querySelector(`[data-key="${box._id.replace(/["\\]/g, '\\$&')}"]`);
        if (!el) continue;
        const source = sourceOf(box);
        // 빈 홀더의 IME 자리는 옮기지 않는다. 옮기면 캐럿이 표식 앞으로 밀린다.
        // Do not move an empty holder's IME slot; reparenting shifts the caret before its marker.
        if (source === '' && (el.textContent ?? '').includes(ZERO_WIDTH)) continue;
        let code = el.querySelector(':scope > code');
        if (!code) {
          code = root.ownerDocument.createElement('code');
          while (el.firstChild) code.append(el.firstChild);
          el.append(code);
        }
        if (!controls.has(el)) {
          const key = box._id;
          controls.set(
            el,
            attachCodeCopy(
              el,
              () => {
                const current = codeBoxes(doc()).find((node) => node._id === key);
                return current ? sourceOf(current) : '';
              },
              () => hostOf(nabi).locale(),
            ),
          );
        }
        controls.get(el)?.refresh();
        const lang = typeof box.a?.['lang'] === 'string' ? (box.a['lang'] as string) : null;
        const signature = `${options.version?.() ?? ''}\u0000${lang ?? ''}\u0000${source}`;
        if (painted.get(el) === signature) continue;

        // 호스트 하이라이터 → 못 답하면 내장 토크나이저. 보는 쪽(viewer)도 같은 문을 쓴다.
        // Host highlighter first, falling back to the built-in tokenizer — the viewer takes the same door.
        const tokens = tokensFor(source, lang, options.highlight);
        // 상자 안에 캐럿이 있으면 칠한 뒤 트리에서 읽은 그 자리로 도로 세운다.
        // If the caret sits in this box, reseat it afterward at the position read from the tree.
        const sel = nabi.getSelection();
        const path = pathOfKey(box._id);
        const inBox = path !== null && samePath(sel.focus.path, path) && samePath(sel.anchor.path, path);
        applyTokens(code, tokens);
        repainted = true;
        if (inBox) restoreCaretIn(code, { start: sel.anchor.offset, end: sel.focus.offset });
        painted.set(el, signature);
      }
      // WebKit은 색칠 DOM이 바뀌면 바깥 물체 선택도 안쪽 캐럿으로 접을 수 있다.
      // WebKit can collapse an enclosing object selection into the code when highlighting changes its DOM.
      if (repainted && ownsSelection && selectedWrapper?.isConnected && sameSelection(selection, nabi.getSelection())) {
        try {
          domSelection.setBaseAndExtent(
            selectedWrapper,
            selection.anchor.offset === 0 ? 0 : selectedWrapper.childNodes.length,
            selectedWrapper,
            selection.focus.offset === 0 ? 0 : selectedWrapper.childNodes.length,
          );
        } catch {
          // 칠하는 동안 선택 대상이 바뀌면 복원을 생략한다.
          // Skip restoration if the selection target changed during painting.
        }
      }
    };

    // 한 프레임에 한 번 — 연타로 칠하지 않는다. rAF가 없는 자리(시험·서버)면 즉시 돈다.
    // Coalesces to once per frame; runs synchronously when there's no rAF (tests, server).
    const schedule = (): void => {
      if (composing || frame !== 0) return;
      frame = view?.requestAnimationFrame ? view.requestAnimationFrame(sweep) : 0;
      if (frame === 0) sweep();
    };

    const onCompositionStart = (): void => {
      composing = true;
    };
    const onCompositionEnd = (): void => {
      composing = false;
      schedule();
    };
    const onBlur = (): void => {
      if (!composing) return;
      composing = false;
      schedule();
    };

    root.addEventListener('compositionstart', onCompositionStart);
    root.addEventListener('compositionend', onCompositionEnd);
    root.addEventListener('blur', onBlur);
    const stop = nabi.onChange((change) => {
      // 문단이 다시 그려지면 그 속 칠도 함께 지워진다 — 기억을 걷고 다시 칠한다.
      // A paragraph redraw wipes its paint along with it — clear the memo and repaint.
      if (change.doc) painted = new WeakMap<Element, string>();
      schedule();
    });
    sweep();

    return () => {
      stop();
      clearControls();
      root.removeEventListener('compositionstart', onCompositionStart);
      root.removeEventListener('compositionend', onCompositionEnd);
      root.removeEventListener('blur', onBlur);
      if (frame !== 0) view?.cancelAnimationFrame?.(frame);
    };
  };
}

export const codeAttach: Attach = makeCodeAttach();
