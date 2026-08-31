// 리스트 wing(08)이 키를 배선하고, 여기는 그 wing이 쓰는 순수 연산이다.
// The list wing (08) wires the keys; these are the pure operations it calls.
import { P, isElement, isWrapper, type ElementNode, type NabiDoc, type NabiNode } from '../schema/index.js';
import { isHolder, nodeAt, replaceAt, type EditEnv, type EditResult, type Position } from './position.js';
import { withChildren } from './runs-edit.js';

// 항목 속(문단들)을 리스트 밖으로 꺼낸다 — 가운데 항목이면 리스트가 앞뒤 둘로 갈라진다.
// Pulls one item's paragraphs out of the list; unwrapping a middle item splits the list in two.
export function unwrapItem(doc: NabiDoc, itemPath: readonly number[], env: EditEnv): EditResult {
  const fallback: Position = { path: itemPath, offset: 0 };
  if (itemPath.length < 3) return { doc, caret: fallback };

  const item = nodeAt(doc, itemPath);
  const listPath = itemPath.slice(0, -1);
  const list = nodeAt(doc, listPath);
  const wrapperPath = itemPath.slice(0, -2);
  const wrapper = nodeAt(doc, wrapperPath);
  if (!item || !list || !wrapper || !isWrapper(wrapper, env) || wrapper.ch[0] !== list) {
    return { doc, caret: fallback };
  }
  const index = itemPath[itemPath.length - 1] as number;
  if (!isElement(list.ch[index] as NabiNode) || list.ch[index] !== item) {
    return { doc, caret: fallback };
  }

  // 항목이 비었으면 캐럿이 설 빈 문단 하나를 세운다.
  // If the item was empty, plant one blank paragraph for the caret to land on.
  const freedBlocks = item.ch.filter(isElement);
  const freed: ElementNode[] = freedBlocks.length > 0 ? freedBlocks : [{ w: P, ch: [] }];

  const items = list.ch.filter(isElement);
  const before = items.slice(0, index);
  const after = items.slice(index + 1);

  // 래퍼의 정렬 attrs는 양쪽 반쪽이 나눠 잇는다.
  // Both split halves inherit the wrapper's alignment attrs.
  const half = (slice: readonly ElementNode[], reuse: boolean): ElementNode => {
    const body: ElementNode = reuse
      ? withChildren(list, slice)
      : { w: list.w, ...(list.a ? { a: list.a } : {}), ch: slice };
    return reuse ? withChildren(wrapper, [body]) : { w: P, ...(wrapper.a ? { a: wrapper.a } : {}), ch: [body] };
  };

  let replacement: ElementNode[];
  let caretIndexShift: number;
  if (before.length === 0 && after.length === 0) {
    replacement = freed;
    caretIndexShift = 0;
  } else if (before.length === 0) {
    replacement = [...freed, half(after, true)];
    caretIndexShift = 0;
  } else if (after.length === 0) {
    replacement = [half(before, true), ...freed];
    caretIndexShift = 1;
  } else {
    replacement = [half(before, true), ...freed, half(after, false)];
    caretIndexShift = 1;
  }

  const next = replaceAt(doc, wrapperPath, replacement);
  const parent = wrapperPath.slice(0, -1);
  const wrapperIndex = wrapperPath[wrapperPath.length - 1] as number;
  const caretPath = [...parent, wrapperIndex + caretIndexShift];
  const landed = nodeAt(next, caretPath);
  const caret: Position = landed && isHolder(landed, env) ? { path: caretPath, offset: 0 } : { path: [0], offset: 0 };
  return { doc: next, caret };
}
