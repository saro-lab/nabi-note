// 붙여넣기 — HTML 한 덩어리를 문단 배열 조각으로 바꾸는 얇은 층. 끼워 넣는 자리·분할·병합은 doc·surface의 일이다.
// Paste — a thin layer turning one HTML chunk into a paragraph-array fragment; where/how it's inserted (caret, split, merge) is doc/surface's job.
import { isLump, isWrapper, type SchemaEnv } from '../schema/env.js';
import { P } from '../schema/reserved.js';
import { isElement, type ElementNode, type NabiDoc } from '../schema/types.js';
import type { ImportOptions } from './import.js';
import { parseHtml } from './parse.js';

// 문서는 캐럿이 설 빈 문단을 늘 세우지만(cocoon) 조각은 아무것도 아닐 수 있다 — 그대로 두면 붙여넣기에 없던 줄이 생긴다.
// A doc always carries an empty paragraph for the caret (cocoon), but a fragment may be nothing at all — left as-is, paste would add a phantom line.
export function fragmentOf(doc: NabiDoc): readonly ElementNode[] {
  if (doc.length !== 1) return doc;
  const only = doc[0];
  if (only !== undefined && only.w === P && only.ch.length === 0 && only.a === undefined) return [];
  return doc;
}

// HTML 글자열 → 문단 배열 조각. `parse` 를 타므로 브라우저 전용이다.
// HTML string to a paragraph-array fragment; browser-only since it goes through `parse`.
export function pasteFragment(html: string, options: ImportOptions): readonly ElementNode[] {
  return fragmentOf(parseHtml(html, options));
}

// 빈 문단 + 단일 물건은 교체 자료다 — 부르는 쪽은 빈 문단의 자식만 이걸로 갈아 끼우면 된다(같은 노드가 래퍼문단이 되어 _id·캐럿이 안 흔들린다).
// An empty paragraph plus a single lump is a replacement payload — the caller just swaps the empty paragraph's child for it, so the same node stays the wrapper and _id/caret don't move.
export function singleLumpOf(fragment: readonly ElementNode[], env: SchemaEnv): ElementNode | null {
  if (fragment.length !== 1) return null;
  const only = fragment[0];
  if (only === undefined || !isWrapper(only, env)) return null;
  const lump = only.ch[0];
  return lump !== undefined && isElement(lump) && isLump(lump, env) ? lump : null;
}
