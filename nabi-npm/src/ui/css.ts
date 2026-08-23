// 시트를 문서에 붙이는 문 **하나** — 시트의 글 자체는 아래 `style` 층에 산다(코어 시트·지문·
// 접기 전부 DOM 이 없는 글자 다루기라, `.html` 한 장을 짓는 io 도 같은 글을 봐야 했다).
// 부르던 이름은 여기서 그대로 다시 나간다 — 공개 경로(`ui/css.ts`)는 안 바뀐다.
//
// 기억은 **문서가 한다** — 모듈 전역 집합이 아니다. 붙은 시트의 지문이 `<style>` 의 표식으로
// 남아 있어서, 같은 문서에 에디터가 둘 서도 두 번 안 붙는다.
import { sheetKey } from '../style/index.js';

export * from '../style/index.js';

const MARK = 'data-nabi-sheet';

// 문서에 붙인다 — 이미 있는 지문은 건너뛴다. 답은 떼는 함수 하나다(이 부름이 새로 붙인 것만 뗀다).
export function injectSheets(owner: Document, sheets: readonly string[]): () => void {
  const mine: HTMLStyleElement[] = [];
  for (const text of sheets) {
    const key = sheetKey(text);
    if (owner.head.querySelector(`style[${MARK}="${key}"]`)) continue;
    const style = owner.createElement('style');
    style.setAttribute(MARK, key);
    style.textContent = text;
    owner.head.append(style);
    mine.push(style);
  }
  return () => {
    for (const style of mine) style.remove();
  };
}
