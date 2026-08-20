// 코드 색칠 — 보는 쪽에서만 도는 로직이다. 편집기는 이 파일을 부르지 않는다(그쪽은
// `wings/code/paint.ts` 가 트리를 보고 칠한다).
//
// 여기가 칠하는 것은 **발행된 그 HTML** 이다: `<pre data-nabi-lang="ts"><code>…<br>…</code></pre>`.
// 저장값에는 토큰이 한 글자도 안 들어간다 — 색은 언제나 보는 쪽의 순간 상태다. 그래서
// 하이라이터를 갈아 끼우면 **옛 글도 새 색**으로 뜨고, 저장값이 색칠만큼 부풀지 않는다.
//
// 두 걸음뿐이고 둘 다 `code/` 층의 문이다: 원본 되돌리기(`codeSourceOf` — `<br>` 이 개행이다)와
// span 얹기(`applyTokens`). **호스트가 그 둘을 손으로 하면 안 된다** — 이어 붙인 글이 원본과
// 한 글자라도 어긋나면 색칠이 통째로 평문으로 떨어지고(usableTokens), 왜 떨어졌는지 아무 데도
// 안 적힌다.
import { applyTokens, codeSourceOf, tokensFor, type CodeHighlighter } from '../code/index.js';

// 언어가 적히는 자리 — 우리 조립기가 내는 표식이 먼저이고, 없으면 바깥 관례(`language-*`)다.
// 남이 만든 페이지의 코드 상자에도 그대로 붙는다는 뜻이다.
export const CODE_LANG_ATTR = 'data-nabi-lang';

export function codeLanguageOf(code: Element): string | null {
  const marked = code.parentElement?.getAttribute(CODE_LANG_ATTR);
  if (marked !== null && marked !== undefined && marked !== '') return marked;
  const named = /(?:^|\s)language-([\w+#.-]+)/.exec(code.className);
  return named?.[1] ?? null;
}

export interface CodePaintOptions {
  // 호스트 하이라이터 — 안 주거나 답을 못 하면 **내장 토크나이저**가 답한다(의존성 0).
  // 편집기의 색칠(`makeCodeAttach`)에 넘기는 것과 같은 훅이다 — 한 벌을 둘에 넘기면 편집 화면과
  // 읽는 화면의 색이 갈리지 않는다.
  readonly highlight?: CodeHighlighter;
}

// 해제는 칠하기 전의 속을 도로 붙인다 — 갈아 끼운 노드가 아니라 **떼어 둔 그 노드들**이라
// 해제 뒤의 DOM 은 붙이기 전과 같다(표 정렬이 행 순서를 되돌리는 것과 같은 결).
export function attachCodePaint(root: HTMLElement, options: CodePaintOptions = {}): () => void {
  const selector = 'pre > code';
  const boxes = [
    ...(root.matches(selector) ? [root as Element] : []),
    ...root.querySelectorAll(selector),
  ];

  const undo: (() => void)[] = [];
  for (const code of boxes) {
    const source = codeSourceOf(code);
    // 빈 상자는 건드리지 않는다 — 받침 `<br>` 하나뿐인 속을 다시 지으면 없던 빈 줄이 생긴다.
    if (source.trim() === '') continue;
    const before = [...code.childNodes];
    // 보는 쪽에는 캐럿이 없다 — 받침을 안 세운다(세우면 발행된 쪽보다 한 줄 길어진다).
    applyTokens(code, tokensFor(source, codeLanguageOf(code), options.highlight), { filler: false });
    undo.push(() => code.replaceChildren(...before));
  }

  return () => {
    for (const back of undo) back();
  };
}
