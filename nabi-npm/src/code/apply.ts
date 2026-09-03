// 색칠의 DOM 절반 — 짝이 되는 순수 절반은 tokens.ts. 넘겨받은 요소만 쓰고 document·window는 안 부른다(층 경계).
// The DOM half of highlighting (pure half: tokens.ts); only touches the passed element, never document/window (layer boundary).
import { CODE_TOKEN_ATTR, type CodeToken } from './tokens.js';

// 화면 전용 받침의 표식 — 캐럿 사상이 이 br 을 셈에서 건너뛴다.
// Marks a screen-only filler; caret mapping skips this br when counting.
const FILLER_ATTR = 'data-nabi-filler';

export function codeSourceOf(el: Element): string {
  let out = '';
  for (const node of el.childNodes) {
    if (node.nodeName === 'BR') {
      if (!(node as Element).hasAttribute?.(FILLER_ATTR)) out += '\n';
      continue;
    }
    out += node.textContent ?? '';
  }
  return out;
}

export interface ApplyOptions {
  // 마지막 줄 뒤 화면 전용 받침 — 캐럿이 있는 편집 화면에서만 켠다(기본값). 보는 쪽엔 캐럿이 없어 받침이 있으면 빈 줄 하나가 늘어난다.
  // A screen-only filler after the last line, on by default only where there's a caret (the editor) — the viewer has none, so a filler there would add a phantom empty line.
  readonly filler?: boolean;
}

// 칠하기는 속을 통째로 갈아 끼운다 — 그 안에 서 있던 캐럿은 함께 사라지므로, 되돌리는 일은 부르는 쪽이 한다.
// Repainting replaces all children, so any caret standing inside is lost; the caller is responsible for restoring it.
export function applyTokens(el: Element, tokens: readonly CodeToken[], options: ApplyOptions = {}): void {
  const owner = el.ownerDocument;
  const fragment = owner.createDocumentFragment();
  for (const token of tokens) {
    if (token.text === '') continue;
    const lines = token.text.split('\n');
    lines.forEach((line, i) => {
      if (i > 0) fragment.append(owner.createElement('br'));
      if (line === '') return;
      if (token.type === undefined) {
        fragment.append(owner.createTextNode(line));
        return;
      }
      const span = owner.createElement('span');
      span.setAttribute(CODE_TOKEN_ATTR, token.type);
      span.textContent = line;
      fragment.append(span);
    });
  }
  // 끝이 라인이면 화면 전용 받침을 하나 더 — 안 그러면 그 마지막 줄에 캐럿이 못 선다.
  // If it ends on a line, add one more screen-only filler, or the caret can't land on that last line.
  if (
    options.filler !== false &&
    (fragment.childNodes.length === 0 || fragment.lastChild?.nodeName === 'BR' || tokens.at(-1)?.text.endsWith('\n'))
  ) {
    const filler = owner.createElement('br');
    filler.setAttribute(FILLER_ATTR, '');
    fragment.append(filler);
  }
  el.replaceChildren(fragment);
}
