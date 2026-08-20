// 코드 색칠의 표면 부속 — 선언형이다: mount 가 붙이고 뗀다.
//
// **토큰은 화면에만 산다.** 코드 상자의 `data-key` span 은 그대로 두고 그 **속만** 토큰 span
// 으로 갈아 끼운다 — 트리는 한 글자도 안 변하므로 다시 칠해도 `onChange` 가 안 울리고
// 되돌리기 역사에도 안 남는다.
//
// 처리 중 경합을 막는 길은 잠금이 아니라 **순서**다 (같은 요건의 다른 답):
// 칠하기는 한 프레임에 한 번만 돈다(연타로 칠하지 않는다)
// 조합(IME) 중에는 아예 안 돈다 — 조합 자리는 DOM 에만 살아서 지금 칠하면 조합이 끊긴다
// 같은 글·같은 언어면 DOM 을 안 건드린다(서명 비교)
// 순수 토큰화(tokenize)와 적용(applyTokens)이 갈려 있어, 무거운 절반은 언제든 옮길 수 있다
// 그래서 "칠하는 동안 편집 금지" 가 필요 없다 — 칠하기가 편집과 겹치는 순간이 없다.
//
// **색칠의 지식은 여기 안 산다** — `code/` 층에 있다(088). 그 층을 보는 쪽(`viewer`)도 함께
// 물기 때문이다. 이 파일에 남은 것은 **편집 화면만의 사정**뿐이다: 프레임 고르기·조합 피하기·
// 서명 비교·캐럿 되세우기.
import { isElement, type ElementNode, type NabiNode } from '../../schema/index.js';
import type { Attach } from '../../wing/index.js';
import { applyTokens, tokensFor, type CodeHighlighter } from '../../code/index.js';

const ZERO_WIDTH = '\u200b';

const samePath = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

// 문서 속 코드 상자 전부 — 상자 자신이 인라인 홀더(캐럿의 집)라 키가 그 자리에 붙는다.
function codeBoxes(nodes: readonly NabiNode[], out: ElementNode[] = []): ElementNode[] {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (node.w === 'code') out.push(node);
    else codeBoxes(node.ch, out);
  }
  return out;
}

// 상자의 속 글 — 라인(br)은 개행이다. 마크는 없다(코드는 평문 문단 하나다).
function sourceOf(box: ElementNode): string {
  let out = '';
  for (const child of box.ch) {
    if (typeof child === 'string') out += child;
    else if (child.w === 'br') out += '\n';
  }
  return out;
}

// 토막 목록을 span 속으로 — 개행은 `<br>` 로 되돌린다(들어온 모양 그대로 나가야 한다).
// 논리 오프셋(글자 수, `<br>` 은 하나)을 화면의 점으로 — 칠하기가 속을 갈아 끼운 뒤 캐럿을
// 그 자리에 도로 세운다.
//
// **자리는 DOM 이 아니라 트리에서 온다.** 갈아 끼우기 전에 DOM 선택을 읽어 두는 길도 있지만
// 그때 이미 그 선택은 앞선 재그리기로 죽어 있을 수 있다 — 죽은 자리를 읽어 되돌리면 캐럿이
// 문서 첫머리로 튄 채로 굳는다(겪은 자리: "커서가 위로 올라가면서 오작동"). 트리는 정본이라
// 그런 일이 없다.
function restoreCaretIn(el: Element, caret: { start: number; end: number }): void {
  const owner = el.ownerDocument;
  const selection = owner.getSelection?.();
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
  }
}

export interface PaintOptions {
  // 호스트 하이라이터 — 답을 못 하면 우리 토크나이저가 대신 답한다.
  readonly highlight?: CodeHighlighter;
  // **칠하는 쪽이 달라졌다**를 말하는 값 — 서명에 함께 든다.
  //
  // 왜 필요한가: 문법을 늦게 받아 오는 하이라이터가 있다(Shiki 는 언어를 처음 만나면 비동기로
  // 불러오고, 그 사이의 답은 색 없는 한 덩이다). 문서는 안 바뀌었으니 글·언어로 만든 서명이
  // 그대로고, 그러면 다시 칠할 까닭이 없다고 판단해 건너뛴다 — 예전에는 아무 글자나 하나 더 쳐야
  // 색이 들어왔다. 호스트가 이 값을 바꾸면 서명이 달라져 그 한 번이 진짜 다시 칠하기가 된다.
  readonly version?: () => string | number;
}

export function makeCodeAttach(options: PaintOptions = {}): Attach {
  return ({ root, nabi, pathOfKey }) => {
    const view = root.ownerDocument.defaultView;
    let frame = 0;
    let composing = false;
    let painted = new WeakMap<Element, string>();

    const sweep = (): void => {
      frame = 0;
      if (composing) return;
      for (const box of codeBoxes(nabi.$doc())) {
        if (typeof box._id !== 'string') continue;
        const el = root.querySelector(`[data-key="${box._id.replace(/["\\]/g, '\\$&')}"]`);
        if (!el) continue;
        // IME 의 자리는 DOM 에만 산다 — 지금 칠하면 조합이 끊긴다.
        if ((el.textContent ?? '').includes(ZERO_WIDTH)) continue;

        const source = sourceOf(box);
        const lang = typeof box.a?.['lang'] === 'string' ? (box.a['lang'] as string) : null;
        const signature = `${options.version?.() ?? ''}\u0000${lang ?? ''}\u0000${source}`;
        if (painted.get(el) === signature) continue;

        // 호스트 하이라이터 → 못 답하면 내장 토크나이저. 보는 쪽도 **같은 문**을 쓴다.
        const tokens = tokensFor(source, lang, options.highlight);
        // 이 상자 안에 캐럿이 있으면 칠한 뒤 그 자리에 도로 세운다 — 자리는 트리에서 읽는다.
        const sel = nabi.getSelection();
        const path = pathOfKey(box._id);
        const inBox =
          path !== null &&
          samePath(sel.focus.path, path) &&
          samePath(sel.anchor.path, path);
        applyTokens(el, tokens);
        if (inBox) restoreCaretIn(el, { start: sel.anchor.offset, end: sel.focus.offset });
        painted.set(el, signature);
      }
    };

    // 한 프레임에 한 번 — 연타로 칠하지 않는다. rAF 가 없는 자리(시험·서버)면 즉시 돈다.
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

    root.addEventListener('compositionstart', onCompositionStart);
    root.addEventListener('compositionend', onCompositionEnd);
    const stop = nabi.onChange((change) => {
      // 문단이 다시 그려졌으면 그 속의 칠도 함께 지워졌다 — 기억을 걷고 다시 칠한다.
      if (change.doc) painted = new WeakMap<Element, string>();
      schedule();
    });
    sweep();

    return () => {
      stop();
      root.removeEventListener('compositionstart', onCompositionStart);
      root.removeEventListener('compositionend', onCompositionEnd);
      if (frame !== 0) view?.cancelAnimationFrame?.(frame);
    };
  };
}

export const codeAttach: Attach = makeCodeAttach();
