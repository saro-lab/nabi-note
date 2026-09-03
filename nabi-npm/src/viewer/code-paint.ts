// 코드 색칠은 보는 쪽에서만 도는 로직이다(편집기는 wings/code/paint.ts가 트리를 보고 따로 칠한다). 발행된 HTML(<pre data-nabi-lang><code>…<br>…</code></pre>)을 칠하며 저장값엔 토큰이 안 들어가므로 하이라이터를 바꾸면 옛 글도 새 색이 된다. 두 걸음(codeSourceOf로 원본 복원, applyTokens로 span 얹기)뿐이고 둘 다 code/ 층의 문이다 — 이어 붙인 글이 원본과 한 글자라도 어긋나면 색칠이 통째로 평문으로 떨어진다(usableTokens)
// Code highlighting is reader-only logic (the editor paints separately, from the tree, via wings/code/paint.ts). It colors the published HTML (<pre data-nabi-lang><code>...<br>...</code></pre>) directly; no tokens are stored, so swapping highlighters recolors old text too. Just two steps, both doors into the code/ layer: reconstructing the source (codeSourceOf, where <br> is a newline) and applying spans (applyTokens) -- a host must not do these by hand, since a single mismatched character between the joined text and the source drops highlighting entirely back to plain text (usableTokens), silently
import { applyTokens, codeSourceOf, tokensFor, type CodeHighlighter } from '../code/index.js';

// 언어가 적히는 자리 — 우리 조립기의 표식이 먼저고, 없으면 바깥 관례(language-*)를 본다(남이 만든 페이지의 코드 상자에도 붙는다는 뜻)
// Where the language is recorded; our own marker is checked first, falling back to the common convention (language-*), so it also works on code boxes from pages we didn't build
export const CODE_LANG_ATTR = 'data-nabi-lang';

export function codeLanguageOf(code: Element): string | null {
  const marked = code.parentElement?.getAttribute(CODE_LANG_ATTR);
  if (marked !== null && marked !== undefined && marked !== '') return marked;
  const named = /(?:^|\s)language-([\w+#.-]+)/.exec(code.className);
  return named?.[1] ?? null;
}

export interface CodePaintOptions {
  // 호스트 하이라이터 — 안 주거나 답을 못 하면 내장 토크나이저가 답한다(의존성 0). 편집기의 색칠(makeCodeAttach)에 넘기는 것과 같은 훅이라, 한 벌을 둘 다에 넘기면 편집 화면과 읽는 화면의 색이 갈리지 않는다
  // Host highlighter; if omitted or it declines, the built-in tokenizer answers instead (zero dependencies). It's the same hook passed to the editor's own highlighting (makeCodeAttach), so passing one implementation to both keeps edit and read colors in sync
  readonly highlight?: CodeHighlighter;
}

// 해제는 칠하기 전의 속을 도로 붙인다 — 새로 만든 노드가 아니라 떼어 둔 그 노드들이라 해제 뒤의 DOM이 붙이기 전과 같다(표 정렬이 행 순서를 되돌리는 것과 같은 결)
// Detaching restores the pre-paint content by reattaching the original nodes that were set aside, not freshly built ones, so the DOM after detach matches before attach (the same approach as table sort restoring row order)
export function attachCodePaint(root: HTMLElement, options: CodePaintOptions = {}): () => void {
  const selector = 'pre > code';
  const boxes = [...(root.matches(selector) ? [root as Element] : []), ...root.querySelectorAll(selector)];

  const undo: (() => void)[] = [];
  try {
    for (const code of boxes) {
      const source = codeSourceOf(code);
      // 빈 상자는 건드리지 않는다 — 받침 <br> 하나뿐인 속을 다시 지으면 없던 빈 줄이 생긴다
      // Empty boxes are left alone; rebuilding content that's just a filler <br> would create a blank line that wasn't there
      if (source.trim() === '') continue;
      const before = [...code.childNodes];
      const beforeHtml = code.innerHTML;
      // 보는 쪽에는 캐럿이 없다 — 받침을 안 세운다(세우면 발행된 쪽보다 한 줄 길어진다)
      // The reader has no caret, so no filler is added (adding one would make it one line longer than what was published)
      const tokens = tokensFor(source, codeLanguageOf(code), options.highlight);
      const current = [...code.childNodes];
      if (
        code.innerHTML !== beforeHtml ||
        current.length !== before.length ||
        current.some((node, at) => node !== before[at])
      )
        continue;
      applyTokens(code, tokens, { filler: false });
      const painted = [...code.childNodes];
      const paintedHtml = code.innerHTML;
      undo.push(() => {
        // 호스트가 refresh 전에 같은 code 노드를 바꿀 수 있다 — 아직 우리 것이 남아 있을 때만 되돌린다
        // A host can update the same code node before refresh. Restore only our still-current projection.
        const current = [...code.childNodes];
        if (
          code.innerHTML !== paintedHtml ||
          current.length !== painted.length ||
          current.some((node, at) => node !== painted[at])
        )
          return;
        code.replaceChildren(...before);
      });
    }
  } catch (error) {
    for (const back of undo.reverse()) {
      try {
        back();
      } catch {
        // 설정 실패를 보존하며 앞선 코드 상자들을 되돌린다
        // Preserve the setup failure while restoring earlier code boxes.
      }
    }
    throw error;
  }

  return () => {
    for (const back of undo) back();
  };
}
