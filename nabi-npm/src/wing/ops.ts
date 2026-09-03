// 공용 부품 — wings 구현들이 나눠 쓰는 연산. 형제 wing import를 없애는 자리다(경계 시험이 지킨다).
// Shared ops that wings implementations reuse instead of importing each other (enforced by a boundary test); all pure functions.
import { P, isElement, runsOf, type Attrs, type ElementNode, type NabiDoc } from '../schema/index.js';
import {
  holderLength,
  holders,
  nodeAt,
  positionExists,
  sameMark,
  terminalOf,
  type EditEnv,
  type EditResult,
  type Position,
} from '../doc/index.js';
import { caretAt, isCollapsed, ordered, type Selection } from '../caret/index.js';
import type { CommandOutcome } from '../editor/index.js';
import type { KeyIntent, OwnerAt } from './contract.js';

export { unwrapItem } from '../doc/index.js';

// 접힌 캐럿은 "아무것도 안 골랐다"가 아니다 — 마크 안에 서 있으면 그 마크가 덮은 글 전체가 겨눔이다.
// A collapsed caret isn't "nothing selected" — standing inside a mark means the whole span it covers is the target (e.g. changing a highlight's color mid-word recolors the whole word, not just future keystrokes).
export function markSpanAt(
  doc: NabiDoc,
  at: Position,
  w: string,
  env: EditEnv,
): { readonly selection: Selection; readonly mark: ElementNode } | null {
  const holder = nodeAt(doc, at.path);
  if (!holder) return null;
  const runs = runsOf(holder, terminalOf(env));
  // 런의 시작 오프셋 표 — 넓히기가 양옆으로 걷기 때문에 먼저 재 둔다.
  // A table of each run's start offset, precomputed since widening walks both directions.
  const starts: number[] = [];
  let total = 0;
  for (const run of runs) {
    starts.push(total);
    total += run.kind === 'text' ? run.text.length : 1;
  }
  const markIn = (index: number): ElementNode | undefined => runs[index]?.marks.find((m) => m.w === w);
  for (let i = 0; i < runs.length; i += 1) {
    const offset = starts[i] as number;
    const length = (i + 1 < runs.length ? (starts[i + 1] as number) : total) - offset;
    const mark = markIn(i);
    // 경계 정규화와 같은 규칙 — 캐럿은 바로 앞 글자의 마크를 따른다. 그래서 끝 오프셋도 든다.
    // Same rule as boundary normalization — the caret follows the mark of the character right before it, so the end offset is included too.
    if (mark && at.offset > offset && at.offset <= offset + length) {
      // 같은 값의 이웃 런까지 넓히되 이어진 런만이다 — 안 그러면 사이에 낀 남의 글(다른 색 등)까지 겨눔에 묶인다.
      // Widens into neighboring runs with the same value, but only contiguous ones — otherwise unrelated text in between (a different color, say) would get swept into the target too.
      let from = offset;
      let to = offset + length;
      for (let j = i - 1; j >= 0; j -= 1) {
        const its = markIn(j);
        if (!its || !sameMark(its, mark)) break;
        from = starts[j] as number;
      }
      for (let j = i + 1; j < runs.length; j += 1) {
        const its = markIn(j);
        if (!its || !sameMark(its, mark)) break;
        to = j + 1 < runs.length ? (starts[j + 1] as number) : total;
      }
      return {
        selection: { anchor: { path: at.path, offset: from }, focus: { path: at.path, offset: to } },
        mark,
      };
    }
  }
  return null;
}

// 문서 처음/조각 안의 첫 캐럿 자리 — 없으면 [0].0(빈 문단 하나는 cocoon이 보장한다).
// The first caret position in the document or a slice of it; falls back to [0].0 (cocoon guarantees at least one empty paragraph).
function firstCaretIn(doc: NabiDoc, env: EditEnv, topIndex?: number): Position {
  for (const holder of holders(doc, env)) {
    if (topIndex !== undefined && holder.path[0] !== topIndex) continue;
    return { path: holder.path, offset: 0 };
  }
  return { path: [0], offset: 0 };
}

// 물건의 기본 차림 — 말 없이 넣은 물건이 입는 폭과 정렬이다. 여러 삽입 경로(툴바, 업로드 커밋)가
// 서로 다른 숫자를 들면 "기본값"이 거짓이 되므로, 그 경로들이 공유하는 이 층에 값을 둔다.
// The default width/alignment an object gets when inserted with no explicit choice. Lives here (shared by toolbar insert and upload commit) so the multiple insertion paths can't drift apart.
export const LUMP_DEFAULT_WIDTH = '60';
export const LUMP_DEFAULT_ALIGN = 'c';

// 물건 하나를 캐럿 자리의 최상위에 세운다 — 캐럿의 최상위가 빈 문단이면 교체되고, 아니면 다음에 선다.
// 이미 서 있던 빈 문단을 교체할 때는 그 문단이 들고 있던 정렬이 이긴다(넣은 적 없는 결정이 끼어들지 않게).
// Inserts an object at the top of the caret position, wrapped in a paragraph — replacing an existing empty paragraph there, or standing after it otherwise. When replacing, the existing paragraph's own alignment wins over any default, so inserting never silently overrides a choice the user already made.
export function insertLump(doc: NabiDoc, caret: Position, lump: ElementNode, _env: EditEnv, wrap?: Attrs): EditResult {
  const top = caret.path[0] ?? doc.length - 1;
  const node = doc[top];
  const empty = node !== undefined && node.w === P && node.ch.length === 0;
  const dressed = (own: Attrs | undefined): Attrs | undefined => {
    const a = { ...(wrap ?? {}), ...(own ?? {}) };
    return Object.keys(a).length > 0 ? a : undefined;
  };

  if (empty && node) {
    const a = dressed(node.a);
    const wrapper: ElementNode = {
      w: P,
      ch: [lump],
      ...(a ? { a } : {}),
      ...(node._id !== undefined ? { _id: node._id } : {}),
    };
    const next = [...doc.slice(0, top), wrapper, ...doc.slice(top + 1)] as NabiDoc;
    return { doc: next, caret: { path: [top], offset: 1 } };
  }

  const at = top + 1;
  const a = dressed(undefined);
  const wrapper: ElementNode = { w: P, ch: [lump], ...(a ? { a } : {}) };
  const next = [...doc.slice(0, at), wrapper, ...doc.slice(at)] as NabiDoc;
  return { doc: next, caret: { path: [at], offset: 1 } };
}

// 최상위의 래퍼문단(물건) 하나를 통째로 걷는다 — 캐럿은 앞 문단의 끝(없으면 다음 문단의 처음).
// Removes a whole top-level wrapper paragraph (object); the caret lands at the end of the preceding paragraph, or the start of the next one if there's none before it.
export function removeLump(doc: NabiDoc, topIndex: number, env: EditEnv): EditResult {
  const rest = [...doc.slice(0, topIndex), ...doc.slice(topIndex + 1)] as NabiDoc;
  if (rest.length === 0) {
    const empty: ElementNode = { w: P, ch: [] };
    return { doc: [empty], caret: { path: [0], offset: 0 } };
  }
  // 앞쪽에서 가장 가까운 홀더의 끝 — 없으면 문서의 첫 홀더의 처음.
  // The end of the nearest preceding holder, or the start of the document's first holder if none.
  let landing: Position | null = null;
  for (const holder of holders(rest, env)) {
    if ((holder.path[0] as number) < topIndex) {
      landing = { path: holder.path, offset: holderLength(holder.node, env) };
    } else if (!landing) {
      landing = { path: holder.path, offset: 0 };
      break;
    } else break;
  }
  return { doc: rest, caret: landing ?? { path: [0], offset: 0 } };
}

// 감싸기 토글 — 선택이 걸친 최상위 블록들을 컨테이너 하나로 감싸거나, 이미 그 컨테이너면 도로 편다.
// Toggles wrapping — wraps the top-level blocks a selection spans into one container, or unwraps them if they're already that container (used by quote and similar).
export function toggleWrap(doc: NabiDoc, sel: Selection, containerW: string, env: EditEnv): EditResult {
  const [start, end] = ordered(sel);
  const a = (start.path[0] ?? 0) as number;
  const b = (end.path[0] ?? a) as number;
  const covered = doc.slice(a, b + 1);

  const wrapped = covered.every((node) => {
    const lump = node.ch[0];
    return node.w === P && node.ch.length === 1 && isElement(lump) && lump.w === containerW;
  });

  if (wrapped && covered.length > 0) {
    // 푼다 — 컨테이너 속 블록들이 제자리에 선다.
    // Unwrap: the container's inner blocks take its place.
    const inner: ElementNode[] = [];
    for (const node of covered) {
      const lump = node.ch[0] as ElementNode;
      for (const child of lump.ch) if (isElement(child)) inner.push(child);
    }
    const blocks = inner.length > 0 ? inner : [{ w: P, ch: [] } as ElementNode];
    const next = [...doc.slice(0, a), ...blocks, ...doc.slice(b + 1)] as NabiDoc;
    return { doc: next, caret: firstCaretIn(next, env, a) };
  }

  // 감싼다 — 걸친 블록 전부가 컨테이너의 속이 되고, 컨테이너는 래퍼문단을 입는다.
  // Wrap: all covered blocks become the container's contents, and the container itself gets a wrapper paragraph.
  const container: ElementNode = { w: containerW, ch: covered };
  const wrapper: ElementNode = { w: P, ch: [container] };
  const next = [...doc.slice(0, a), wrapper, ...doc.slice(b + 1)] as NabiDoc;
  const caret = firstCaretIn(next, env, a);
  return { doc: next, caret: positionExists(next, caret, env) ? caret : { path: [a], offset: 0 } };
}

// 최상위 인덱스의 노드 — wings가 자기 물건을 찾을 때 쓰는 잔 도우미.
// The node at a path's top-level index; a small helper wings use to locate their own objects.
export function topNodeAt(doc: NabiDoc, path: readonly number[]): ElementNode | null {
  return nodeAt(doc, [path[0] ?? 0]);
}

export function blockOwnerAt(
  doc: NabiDoc,
  path: readonly number[],
  w: string,
): { readonly path: readonly number[]; readonly node: ElementNode } | null {
  for (let depth = path.length; depth >= 1; depth -= 1) {
    const at = path.slice(0, depth);
    const node = nodeAt(doc, at);
    if (!node) continue;
    if (node.w === w) return { path: at, node };
    const child = node.w === P && node.ch.length === 1 ? node.ch[0] : undefined;
    if (isElement(child) && child.w === w) return { path: [...at, 0], node: child };
  }
  return null;
}

// 컨테이너(표·인용·접기·코드…) 밖으로 — 래퍼문단을 가리키는 자리에 캐럿을 세운다(0=앞, 1=뒤).
// 이웃 문단이 미리 있을 필요는 없다 — 거기서 타이핑하면 `doc/insert.ts` 가 새 문단을 즉석에서 만든다.
// Exits a container (table, quote, details, code...) by placing the caret next to its wrapper paragraph (offset 0 = before, 1 = after). No neighboring paragraph needs to exist yet — typing there makes `doc/insert.ts` create one on the spot.
export function exitWrapper(doc: NabiDoc, ownerPath: readonly number[], dir: 'up' | 'down'): CommandOutcome {
  return { doc, selection: caretAt({ path: ownerPath.slice(0, -1), offset: dir === 'up' ? 0 : 1 }) };
}

// `holds: 'blocks'` 컨테이너(인용·접기)의 위/아래 탈출 판정 — 첫/마지막 자식의 끝단일 때만 `exitWrapper` 로 넘긴다.
// Escape check for `holds: 'blocks'` containers (quote, details) — only hands off to `exitWrapper` at the very start of the first child or end of the last; movement between children stays the core's job.
export function blocksBoundaryEscape(
  intent: KeyIntent,
  doc: NabiDoc,
  sel: Selection,
  env: EditEnv,
  owner: OwnerAt,
): CommandOutcome | null {
  if (intent.key !== 'arrow' || (intent.dir !== 'up' && intent.dir !== 'down')) return null;
  if (!isCollapsed(sel)) return null;
  const index = sel.focus.path[owner.path.length];
  if (index === undefined) return null;

  if (intent.dir === 'up') {
    if (index !== 0 || sel.focus.offset !== 0) return null;
    return exitWrapper(doc, owner.path, 'up');
  }
  const last = owner.node.ch.length - 1;
  if (index !== last) return null;
  const holder = nodeAt(doc, [...owner.path, last]);
  if (!holder || sel.focus.offset !== holderLength(holder, env)) return null;
  return exitWrapper(doc, owner.path, 'down');
}
