// 붙여넣기 자료 — HTML 한 덩어리를 **문단 배열 조각**으로 바꿔 주는 얇은 층이다.
// 조각을 어디에 어떻게 끼우는가(캐럿 자리·분할·병합)는 doc·surface 의 일이고, 여기서는
// "무엇을 붙이려는가"만 답한다.
import { isLump, isWrapper, type SchemaEnv } from '../schema/env.js';
import { P } from '../schema/reserved.js';
import { isElement, type ElementNode, type NabiDoc } from '../schema/types.js';
import type { ImportOptions } from './import.js';
import { parseHtml } from './parse.js';

// 문서와 조각의 차이 한 가지 — 문서는 캐럿이 설 빈 문단 하나를 늘 세우지만(cocoon)
// 조각은 아무것도 아닐 수 있다. 빈 조각에 빈 문단이 딸려 오면 붙여넣을 때 없던 줄이 생긴다.
export function fragmentOf(doc: NabiDoc): readonly ElementNode[] {
  if (doc.length !== 1) return doc;
  const only = doc[0];
  if (only !== undefined && only.w === P && only.ch.length === 0 && only.a === undefined) return [];
  return doc;
}

// HTML 글자열 → 문단 배열 조각. `parse` 를 타므로 브라우저 전용이다.
export function pasteFragment(html: string, options: ImportOptions): readonly ElementNode[] {
  return fragmentOf(parseHtml(html, options));
}

// 조각이 물건 하나뿐인가 — 맞으면 그 물건을 돌려준다.
// **빈 문단 + 단일 물건 = 교체**의 자료다: 부르는 쪽은 빈 문단의 자식만 이것으로
// 갈아 끼우면 된다(같은 노드가 그대로 래퍼문단이 되므로 _id 도 캐럿도 안 흔들린다).
export function singleLumpOf(fragment: readonly ElementNode[], env: SchemaEnv): ElementNode | null {
  if (fragment.length !== 1) return null;
  const only = fragment[0];
  if (only === undefined || !isWrapper(only, env)) return null;
  const lump = only.ch[0];
  return lump !== undefined && isElement(lump) && isLump(lump, env) ? lump : null;
}
