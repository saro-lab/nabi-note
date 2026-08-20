// 색칠의 **DOM 절반** — 토막 목록을 코드 상자의 속으로 갈아 끼우고, 그 반대로 상자의 속을
// 원본 글자로 되돌린다. 짝이 되는 순수 절반이 이웃한 `tokens.ts` 다.
//
// 이 파일이 아는 DOM 은 **넘겨받은 요소 하나뿐**이다 — `document` 도 `window` 도 안 부른다
// (필요한 것은 전부 `el.ownerDocument` 에서 온다). 그래서 층 차례에서 맨 아래에 서고도
// 경계 그물의 "surface 아래 층에 DOM 어휘가 없다" 를 지킨다.
//
// 무는 이가 둘이다: 편집 화면의 `wings/code/paint.ts`(트리에서 글을 읽는다)와 보는 쪽의
// `viewer/code-paint.ts`(발행된 HTML 에서 글을 읽는다). 읽는 자리가 달라도 **얹는 손은 하나**다.
import { CODE_TOKEN_ATTR, type CodeToken } from './tokens.js';

// 화면 전용 받침(`data-nabi-filler`)의 표식 — 캐럿 사상이 이 br 을 셈에서 건너뛴다.
const FILLER_ATTR = 'data-nabi-filler';

// 상자의 **속 글** — 라인(`<br>`)은 개행이다. 편집기 DOM 이든 발행 HTML 이든 코드 상자의 속은
// 평문 + 라인뿐이라(코드 wing 의 repair 가 지킨다) 이 한 걸음으로 원본이 온전히 돌아온다.
//
// 되돌리기가 **패키지 안**에 있어야 하는 까닭: 토막을 이어 붙인 것이 원본과 한 글자라도 다르면
// 색칠이 통째로 평문으로 떨어진다(usableTokens). 그 원본을 호스트가 손으로 짓게 두면 `<br>`
// 하나 빠뜨린 순간 색이 사라지고, 왜 사라졌는지 아무 데도 안 적힌다.
export function codeSourceOf(el: Element): string {
  let out = '';
  for (const node of el.childNodes) {
    if (node.nodeName === 'BR') {
      // 받침은 화면의 것이지 글이 아니다 — 셈에 안 든다.
      if (!(node as Element).hasAttribute?.(FILLER_ATTR)) out += '\n';
      continue;
    }
    out += node.textContent ?? '';
  }
  return out;
}

export interface ApplyOptions {
  // 마지막 줄 뒤의 화면 전용 받침 — **캐럿이 있는 자리에서만** 참이다(기본).
  //
  // 편집 화면에서는 이것이 없으면 끝의 빈 줄에 캐럿이 못 선다. 보는 쪽에는 캐럿이 없으므로
  // 그 받침이 곧 **없던 빈 줄 하나**가 된다 — 미리보기가 발행된 쪽보다 한 줄 길어진다.
  readonly filler?: boolean;
}

// **칠하기는 속을 통째로 갈아 끼운다** — 그 안에 서 있던 캐럿은 함께 사라진다. 되돌리는 일은
// 부르는 쪽이 한다(편집 화면에서는 자리를 **트리에서** 읽는다 — wings/code/paint.ts 참고).
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
  // 표식이 달려 있어 사상의 셈에는 안 든다.
  if (options.filler !== false && (fragment.lastChild?.nodeName === 'BR' || tokens.at(-1)?.text.endsWith('\n'))) {
    const filler = owner.createElement('br');
    filler.setAttribute(FILLER_ATTR, '');
    fragment.append(filler);
  }
  el.replaceChildren(fragment);
}
