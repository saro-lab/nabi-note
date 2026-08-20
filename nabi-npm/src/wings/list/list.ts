// 리스트 셋 — 글머리(ul·li)·번호(ol·oli)·체크(tl·tli). 구조는 한 모양이다:
//   래퍼문단 → 리스트 → 항목 → 문단 배열(항목 속에 다시 리스트가 서면 그것이 중첩이다).
//
// 키는 항목을 품은 wing 의 것이다 — 셋이 같은 onKey 한 벌을 나눠 쓴다:
//   backspace  항목 첫머리 = 표식 하나만 지운다(unwrapItem 리스트 특칙, 3종 공통)
//   tab        앞 항목 속으로 들어간다(중첩)          shiftTab  한 겹 나온다(맨 층이면 리스트 밖)
//   enter      항목 분할 — 빈 항목이면 탈출(내어쓰기)
import {
  P,
  isElement,
  isWrapper,
  type ElementNode,
  type NabiDoc,
  type NabiNode,
} from '../../schema/index.js';
import {
  comparePositions,
  fromRuns,
  holderLength,
  holderRuns,
  holders,
  isHolder,
  nodeAt,
  replaceAt,
  splitParagraph,
  terminalOf,
  withChildren,
  type EditEnv,
  type EditResult,
  type Position,
} from '../../doc/index.js';
import { caretAt, isCollapsed, ordered, type Selection } from '../../caret/index.js';
import type { Command, CommandOutcome } from '../../editor/index.js';
import { listFamily, unwrapItem, type InputRule, type OnKey, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

interface Family {
  readonly list: string;
  readonly item: string;
}

const BULLET: Family = { list: 'ul', item: 'li' };
const ORDERED: Family = { list: 'ol', item: 'oli' };
const TASK: Family = { list: 'tl', item: 'tli' };

// 세 가족이 서로를 아는 유일한 자리 — 토글이 리스트를 리스트로 갈아입히기 때문이다(한 파일 안).
const LIST_TYPES: ReadonlySet<string> = new Set([BULLET.list, ORDERED.list, TASK.list]);

const emptyParagraph = (): ElementNode => ({ w: P, ch: [] });

const outcomeOf = (r: EditResult): CommandOutcome => ({ doc: r.doc, selection: caretAt(r.caret) });

function isEmptyItem(item: ElementNode): boolean {
  if (item.ch.length === 0) return true;
  if (item.ch.length !== 1) return false;
  const only = item.ch[0];
  return isElement(only) && only.w === P && only.ch.length === 0;
}

// 래퍼문단이 입은 리스트 — 아니면 null.
function listIn(block: NabiNode, env: EditEnv): ElementNode | null {
  if (!isElement(block) || !isWrapper(block, env)) return null;
  const inner = block.ch[0];
  return isElement(inner) && LIST_TYPES.has(inner.w) ? inner : null;
}

// --- 들여쓰기 — 앞 항목의 끝에 같은 가족의 리스트로 들어간다 -----------------------------------

function indent(doc: NabiDoc, itemPath: readonly number[], focus: Position, env: EditEnv): CommandOutcome | null {
  const listPath = itemPath.slice(0, -1);
  const list = nodeAt(doc, listPath);
  const index = itemPath[itemPath.length - 1] as number;
  if (!list || index <= 0) return null; // 첫 항목 앞에는 들어갈 항목이 없다
  const items = list.ch.filter(isElement);
  const item = items[index];
  const prev = items[index - 1];
  if (!item || !prev) return null;

  const last = prev.ch[prev.ch.length - 1];
  const sub = last !== undefined ? listIn(last, env) : null;
  const nested = sub && sub.w === list.w ? sub : null;

  let prevCh: NabiNode[];
  let head: number[];
  if (nested && isElement(last)) {
    // 앞 항목이 이미 같은 가족의 중첩 리스트를 들고 있다 — 그 끝에 붙는다.
    prevCh = [...prev.ch.slice(0, -1), withChildren(last, [withChildren(nested, [...nested.ch, item])])];
    head = [...listPath, index - 1, prev.ch.length - 1, 0, nested.ch.length];
  } else {
    prevCh = [...prev.ch, { w: P, ch: [{ w: list.w, ch: [item] }] }];
    head = [...listPath, index - 1, prev.ch.length, 0, 0];
  }

  const nextItems = [...items.slice(0, index - 1), withChildren(prev, prevCh),...items.slice(index + 1)];
  const next = replaceAt(doc, listPath, [withChildren(list, nextItems)]);
  const rest = focus.path.slice(itemPath.length);
  return { doc: next, selection: caretAt({ path: [...head,...rest], offset: focus.offset }) };
}

// --- 내어쓰기 — 한 겹 나온다. 맨 층이면 리스트 밖 문단이다(표식 하나만 걷는 것과 같은 문). ----

function outdent(doc: NabiDoc, itemPath: readonly number[], focus: Position, env: EditEnv): CommandOutcome | null {
  const listPath = itemPath.slice(0, -1);
  const wrapperPath = listPath.slice(0, -1);
  const list = nodeAt(doc, listPath);
  const wrapper = nodeAt(doc, wrapperPath);
  const index = itemPath[itemPath.length - 1] as number;
  if (!list || !wrapper || !isWrapper(wrapper, env)) return null;

  const grandPath = wrapperPath.slice(0, -1);
  const grand = grandPath.length > 0 ? nodeAt(doc, grandPath) : null;
  const outerList = grandPath.length > 1 ? nodeAt(doc, grandPath.slice(0, -1)) : null;
  const inItem = grand !== null && outerList !== null && LIST_TYPES.has(outerList.w) && outerList.ch.includes(grand);
  // 맨 층의 리스트 — 나갈 겹이 없으니 항목이 문단으로 풀린다.
  if (!inItem || !grand) return outcomeOf(unwrapItem(doc, itemPath, env));

  const items = list.ch.filter(isElement);
  const item = items[index];
  if (!item) return null;
  const before = items.slice(0, index);
  const after = items.slice(index + 1);

  // 뒤에 남은 항목들은 나가는 항목을 따라 들어간다 — 순서가 뒤집히지 않는 유일한 자리다.
  const moved =
    after.length === 0
      ? item
      : withChildren(item, [...item.ch, { w: P, ch: [{ w: list.w, ch: after }] } as ElementNode]);

  const wrapperIndex = wrapperPath[wrapperPath.length - 1] as number;
  const keptCh =
    before.length > 0
      ? [
...grand.ch.slice(0, wrapperIndex),
          withChildren(wrapper, [withChildren(list, before)]),
...grand.ch.slice(wrapperIndex + 1),
        ]
      : [...grand.ch.slice(0, wrapperIndex),...grand.ch.slice(wrapperIndex + 1)];
  const keptGrand = withChildren(grand, keptCh.length > 0 ? keptCh : [emptyParagraph()]);

  const next = replaceAt(doc, grandPath, [keptGrand, moved]);
  const grandIndex = grandPath[grandPath.length - 1] as number;
  const rest = focus.path.slice(itemPath.length);
  const caret: Position = { path: [...grandPath.slice(0, -1), grandIndex + 1,...rest], offset: focus.offset };
  return { doc: next, selection: caretAt(caret) };
}

// --- 항목끼리 잇기 (§2 백스페이스· §6 Delete) --------------------------------------------------
//
// 백스페이스와 Delete 는 **서로의 거울**이다: 둘 다 "이 두 항목이 하나가 된다" 는 같은 일을
// 다른 쪽에서 부를 뿐이다. 그래서 셈은 하나이고(`joinItems`), 부르는 자리만 둘이다.

// 항목 속 **마지막 글자리** — 래퍼문단은 글자리가 아니라 건너뛴다(중첩 목록을 든 항목이면
// 그 목록이 아니라 그 앞 문단이 답이다).
function lastHolderIn(root: ElementNode, env: EditEnv): readonly number[] | null {
  let found: readonly number[] | null = null;
  const walk = (node: ElementNode, at: readonly number[]): void => {
    node.ch.forEach((child, i) => {
      if (!isElement(child)) return;
      const path = [...at, i];
      if (isHolder(child, env) && !isWrapper(child, env)) found = path;
      walk(child, path);
    });
  };
  walk(root, []);
  return found;
}

// 항목 `index` 를 그 **앞 항목**에 잇는다 — 앞 항목의 마지막 글자리에 첫 문단이 붙고, 나머지
// 블록(중첩 목록 등)은 그 뒤로 따라간다. 캐럿은 이어 붙은 자리다.
//
// 앞 항목이 없으면 null — 부르는 쪽이 §1/§3(벗기기·내어쓰기)으로 간다.
function joinItems(doc: NabiDoc, listPath: readonly number[], index: number, env: EditEnv): CommandOutcome | null {
  const list = nodeAt(doc, listPath);
  if (!list || index <= 0) return null;
  const items = list.ch.filter(isElement);
  const item = items[index];
  const prev = items[index - 1];
  if (!item || !prev) return null;

  const inner = lastHolderIn(prev, env);
  if (!inner) return null;
  const target = nodeAt(doc, [...listPath, index - 1,...inner]);
  if (!target) return null;

  const terminal = terminalOf(env);
  const junction = holderLength(target, env);
  const head = item.ch[0];
  const rest = item.ch.slice(1);

  // 첫 블록이 글자리면 그 글을 이어 붙이고, 아니면(중첩 목록으로 시작하는 항목) 통째로 따라간다.
  const joinable = head !== undefined && isElement(head) && isHolder(head, env) && !isWrapper(head, env);
  const filled = joinable
    ? withChildren(target, fromRuns([...holderRuns(target, terminal),...holderRuns(head, terminal)]))
    : target;
  const tail = joinable ? rest : item.ch;

  let merged = replaceAt([prev], [0,...inner], [filled])[0] as ElementNode;
  if (tail.length > 0) merged = withChildren(merged, [...merged.ch,...tail]);

  const nextItems = [...items.slice(0, index - 1), merged,...items.slice(index + 1)];
  const next = replaceAt(doc, listPath, [withChildren(list, nextItems)]);
  return { doc: next, selection: caretAt({ path: [...listPath, index - 1,...inner], offset: junction }) };
}

// 목록 **뒤**에 선 블록을 마지막 항목 끝으로 끌어올린다 (§6 의 마지막 항목· §12).
// 뒤가 같은 자리의 문단이면 그 글을, 뒤가 또 다른 목록이면 그 첫 항목을 끌어올린다.
function pullAfterList(
  doc: NabiDoc,
  listPath: readonly number[],
  itemPath: readonly number[],
  env: EditEnv,
): CommandOutcome | null {
  // 목록을 감싼 래퍼문단의 자리 — 그 다음 형제가 끌어올릴 것이다.
  const wrapperPath = listPath.slice(0, -1);
  if (wrapperPath.length === 0) return null;
  const parentPath = wrapperPath.slice(0, -1);
  const at = wrapperPath[wrapperPath.length - 1] as number;
  const siblings = parentPath.length === 0 ? doc : (nodeAt(doc, parentPath)?.ch ?? []);
  const after = siblings[at + 1];
  if (after === undefined || !isElement(after)) return null;

  const item = nodeAt(doc, itemPath);
  if (!item) return null;
  const inner = lastHolderIn(item, env);
  if (!inner) return null;
  const target = nodeAt(doc, [...itemPath,...inner]);
  if (!target) return null;

  const terminal = terminalOf(env);
  const junction = holderLength(target, env);
  const caret = caretAt({ path: [...itemPath,...inner], offset: junction });

  // 뒤가 목록이면 그 **첫 항목**을 끌어올린다 — 목록끼리 붙어 있는 자리다 (§12).
  const lump = isWrapper(after, env) ? after.ch[0] : undefined;
  if (lump !== undefined && isElement(lump) && LIST_TYPES.has(lump.w)) {
    const first = lump.ch.filter(isElement)[0];
    if (first === undefined) return null;
    const firstHead = first.ch[0];
    const joinable = firstHead !== undefined && isElement(firstHead) && isHolder(firstHead, env) && !isWrapper(firstHead, env);
    const filled = joinable
      ? withChildren(target, fromRuns([...holderRuns(target, terminal),...holderRuns(firstHead, terminal)]))
      : target;
    const tail = joinable ? first.ch.slice(1) : first.ch;
    let grown = replaceAt(doc, [...itemPath,...inner], [filled]);
    if (tail.length > 0) {
      const owner = nodeAt(grown, itemPath);
      if (owner) grown = replaceAt(grown, itemPath, [withChildren(owner, [...owner.ch,...tail])]);
    }
    const kept = lump.ch.filter(isElement).slice(1);
    const nextDoc =
      kept.length > 0
        ? replaceAt(grown, [...parentPath, at + 1, 0], [withChildren(lump, kept)])
        : spliceSiblings(grown, parentPath, at + 1, 1);
    return { doc: nextDoc, selection: caret };
  }

  // 뒤가 글 문단이면 그 글만 올라오고 문단은 걷힌다.
  if (!isHolder(after, env) || isWrapper(after, env)) return null;
  const filled = withChildren(target, fromRuns([...holderRuns(target, terminal),...holderRuns(after, terminal)]));
  const grown = replaceAt(doc, [...itemPath,...inner], [filled]);
  return { doc: spliceSiblings(grown, parentPath, at + 1, 1), selection: caret };
}

// 형제 하나를 걷는다 — `replaceAt` 은 갈아 끼우기만 하므로 지우는 손이 따로 필요하다.
function spliceSiblings(doc: NabiDoc, parentPath: readonly number[], at: number, count: number): NabiDoc {
  if (parentPath.length === 0) return [...doc.slice(0, at),...doc.slice(at + count)];
  const parent = nodeAt(doc, parentPath);
  if (!parent) return doc;
  return replaceAt(doc, parentPath, [withChildren(parent, [...parent.ch.slice(0, at),...parent.ch.slice(at + count)])]);
}

// --- 엔터 — 항목이 갈라진다. 체크는 **글을 따라간다** (§10) -----------------------------------

function splitItem(doc: NabiDoc, itemPath: readonly number[], focus: Position, env: EditEnv): CommandOutcome | null {
  const split = splitParagraph(doc, focus, env);
  if (split.doc === doc) return null;
  const item = nodeAt(split.doc, itemPath);
  if (!item) return null;

  const cut = split.caret.path[itemPath.length] as number;
  const head = item.ch.slice(0, cut);
  const tail = item.ch.slice(cut);

  // **체크는 글을 따라간다** (§10). 보통은 앞 반쪽이 원래 항목이라 속성을 그대로 들지만
  // 첫머리에서 가르면 앞 반쪽이 **빈 껍데기**다 — 그때 체크를 거기 두면 체크했던 글 전체가
  // 사용자 모르게 "안 한 일" 로 둔갑한다. 체크는 칸이 아니라 그 할 일에 대한 표시다.
  const headEmpty = head.length === 0 || head.every((block) => isElement(block) && isHolder(block, env) && holderLength(block, env) === 0);
  const withAttrs = (ch: readonly NabiNode[]): ElementNode => ({ w: item.w,...(item.a ? { a: item.a } : {}), ch });
  const bare = (ch: readonly NabiNode[]): ElementNode => ({ w: item.w, ch });
  const dress = headEmpty ? bare : withAttrs;
  const dressTail = headEmpty ? withAttrs : bare;
  const next = replaceAt(split.doc, itemPath, [
    dress(head.length > 0 ? head : [emptyParagraph()]),
    dressTail(tail.length > 0 ? tail : [emptyParagraph()]),
  ]);

  const index = itemPath[itemPath.length - 1] as number;
  const rest = split.caret.path.slice(itemPath.length + 1);
  const caret: Position = {
    path: [...itemPath.slice(0, -1), index + 1, 0,...rest],
    offset: split.caret.offset,
  };
  return { doc: next, selection: caretAt(caret) };
}

// --- 여러 항목 한꺼번에 (들여쓰기·내어쓰기) ----------------------------------------------------
//
// **자리는 경로가 아니라 `_id` 로 쥔다.** 항목 하나를 옮길 때마다 형제들의 인덱스가 흔들려서
// 미리 뽑아 둔 경로 목록은 두 번째 걸음부터 엉뚱한 항목을 가리킨다. 마디마다 다시 찾으면
// 그 흔들림이 셈에서 사라진다.

// `_id` 하나의 자리 — 트리를 훑어 그 노드까지의 경로를 답한다.
function pathOfKey(doc: NabiDoc, id: string): readonly number[] | null {
  let found: readonly number[] | null = null;
  const walk = (nodes: readonly NabiNode[], base: readonly number[]): void => {
    for (let i = 0; i < nodes.length && !found; i += 1) {
      const node = nodes[i];
      if (!isElement(node)) continue;
      const path = [...base, i];
      if (node._id === id) {
        found = path;
        return;
      }
      walk(node.ch, path);
    }
  };
  walk(doc, []);
  return found;
}

const keyAt = (doc: NabiDoc, path: readonly number[]): string | null => {
  const node = nodeAt(doc, path);
  return typeof node?._id === 'string' ? node._id : null;
};

// 선택이 걸친 이 가족의 항목들 — 문서 순서로, 겹치지 않게.
function itemsInRange(doc: NabiDoc, sel: Selection, env: EditEnv, family: Family): string[] {
  const [start, end] = ordered(sel);
  const ids: string[] = [];
  for (const { path, node } of holders(doc, env)) {
    // **래퍼문단은 세지 않는다.** 물건 하나를 감싼 문단이라 사람이 글을 친 자리가 아닌데, 그
    // 자리(0~1)가 속을 걸친 선택과 늘 겹쳐서 **바깥 항목까지 끌려 들어왔다** — 중첩 목록 둘을
    // 잡고 내어쓰기를 하면 그 둘을 품은 바깥 항목이 함께 풀려 목록이 통째로 무너졌다.
    if (isWrapper(node, env)) continue;
    if (comparePositions({ path, offset: holderLength(node, env) }, start) < 0) continue;
    if (comparePositions({ path, offset: 0 }, end) > 0) continue;
    // 이 홀더를 품은 **가장 가까운** 이 가족의 항목 — 중첩이면 안쪽 것이 답이다.
    for (let depth = path.length - 1; depth >= 1; depth -= 1) {
      const owner = nodeAt(doc, path.slice(0, depth));
      if (!owner || owner.w !== family.item) continue;
      if (typeof owner._id === 'string' && !ids.includes(owner._id)) ids.push(owner._id);
      break;
    }
  }
  return ids;
}

// 걸친 항목 전부를 한 겹 옮긴다.
//
// **차례가 반대다.** 들여쓰기는 앞에서부터 — 둘째를 첫째 밑에 넣고 나면 셋째의 앞 형제가 그
// 첫째가 되어 같은 둥지에 이어 붙는다(잡은 것들이 한 덩어리로 유지된다). 내어쓰기는 뒤에서부터
// 나가는 항목이 제 뒤의 형제들을 데리고 나가므로, 앞에서부터 하면 아직 안 옮긴 것들이 먼저
// 끌려 들어간다.
function moveItems(
  doc: NabiDoc,
  sel: Selection,
  env: EditEnv,
  family: Family,
  back: boolean,
): CommandOutcome | null {
  const ids = itemsInRange(doc, sel, env, family);
  if (ids.length === 0) return null;

  const anchorKey = keyAt(doc, sel.anchor.path);
  const focusKey = keyAt(doc, sel.focus.path);

  let next = doc;
  let moved = false;
  for (const id of back ? [...ids].reverse() : ids) {
    const at = pathOfKey(next, id);
    if (!at) continue;
    // 자리는 여기서 안 쓴다 — 캐럿은 아래에서 `_id` 로 다시 잡는다.
    const head: Position = { path: [...at, 0], offset: 0 };
    const out = back ? outdent(next, at, head, env) : indent(next, at, head, env);
    if (!out) continue;
    next = out.doc;
    moved = true;
  }
  if (!moved) return null;

  const settle = (pos: Position, key: string | null): Position => {
    const at = key === null ? null : pathOfKey(next, key);
    return at === null ? pos : { path: at, offset: pos.offset };
  };
  return { doc: next, selection: { anchor: settle(sel.anchor, anchorKey), focus: settle(sel.focus, focusKey) } };
}

// --- 키 한 벌 (셋이 같은 것을 쓴다) ------------------------------------------------------------

function listKeys(family: Family): OnKey {
  return (intent, doc, sel, env, owner) => {
    if (owner.node.w !== family.item) return null;
    // 범위 위의 탭은 **걸친 항목 전부**의 것이다 — 여러 줄을 잡고 한 번에 미는 일이 목록에서
    // 가장 흔하다. 이것을 코어에 흘려보내면 "아무도 안 가져간 탭 = 스페이스 넷" 규칙이 잡은
    // 글을 스페이스로 갈아 버렸다(실제로 그랬다).
    if (!isCollapsed(sel)) {
      if (intent.key !== 'tab' && intent.key !== 'shiftTab') return null; // 삭제·분할은 코어의 것
      return moveItems(doc, sel, env, family, intent.key === 'shiftTab');
    }
    const itemPath = owner.path;
    const focus = sel.focus;
    // 캐럿은 항목 바로 속 블록에 있어야 한다 — 더 깊으면 그 속을 품은 wing 의 일이다.
    if (focus.path.length !== itemPath.length + 1) return null;
    if (!itemPath.every((v, i) => v === focus.path[i])) return null;

    switch (intent.key) {
      case 'backspace': {
        const blockIndex = focus.path[itemPath.length] as number;
        // 항목 첫머리가 아니면 코어의 삭제 표 그대로다.
        if (blockIndex !== 0 || focus.offset !== 0) return null;
        // **앞에 항목이 있으면 합치고, 없으면 한 겹 나온다** — 규칙 하나다 (§2·§3).
        //
        // 글 문단끼리의 백스페이스가 "앞과 합친다" 인데 항목도 글줄이라 같은 답이 자연스럽다.
        // 앞 항목이 없을 때만 목록에서 나가는 일이 되고, 그 나감은 `outdent` 가 층을 보고
        // 답한다 — 중첩이면 한 겹(부모의 형제 항목), 최상위면 문단이다.
        const listPath = itemPath.slice(0, -1);
        const index = itemPath[itemPath.length - 1] as number;
        return joinItems(doc, listPath, index, env) ?? outdent(doc, itemPath, focus, env);
      }
      case 'delete': {
        // 항목 **끝** — 뒤를 끌어올린다 (§6, 백스페이스의 거울). 끝이 아니면 코어의 것이다.
        const item = nodeAt(doc, itemPath);
        if (!item) return null;
        const inner = lastHolderIn(item, env);
        const here = focus.path.slice(itemPath.length);
        if (!inner || inner.length !== here.length || !inner.every((v, i) => v === here[i])) return null;
        const holder = nodeAt(doc, focus.path);
        if (!holder || focus.offset !== holderLength(holder, env)) return null;

        const listPath = itemPath.slice(0, -1);
        const index = itemPath[itemPath.length - 1] as number;
        const list = nodeAt(doc, listPath);
        // 뒤 항목이 있으면 그것을 끌어올리고(= 그 항목이 이 항목에 합쳐진다)
        // 마지막 항목이면 목록 **뒤**에 선 블록을 끌어올린다 (§6· §12).
        if (list && index + 1 < list.ch.filter(isElement).length) return joinItems(doc, listPath, index + 1, env);
        return pullAfterList(doc, listPath, itemPath, env);
      }
      case 'tab':
        // 들어갈 앞 항목이 없으면 **아무 일도 안 한다** — 그래도 키는 삼킨다 (§4).
        // 목록 안에서 탭은 언제나 "깊이" 를 뜻한다. 깊이를 더 줄 수 없다고 글자(스페이스 넷)를
        // 넣는 것은 다른 규칙이 새어 든 것이다 — 그 스페이스는 사고이지 의도인 적이 없다.
        return indent(doc, itemPath, focus, env) ?? { doc, selection: sel };
      case 'shiftTab':
        return outdent(doc, itemPath, focus, env);
      case 'enter':
        return isEmptyItem(owner.node)
          ? outdent(doc, itemPath, focus, env)
          : splitItem(doc, itemPath, focus, env);
      default:
        return null;
    }
  };
}

// --- 토글 커맨드 — 문단↔항목, 그리고 리스트↔리스트(가족 갈아입기) -----------------------------

function toggleList(family: Family): Command {
  return (doc, sel, args, env) => {
    const [start, end] = ordered(sel);
    const a = (start.path[0] ?? 0) as number;
    const b = (end.path[0] ?? a) as number;
    const covered = doc.slice(a, b + 1);
    if (covered.length === 0) return null;
    const checked = family.list === TASK.list && args['ck'] === 1;

    // 자리 옮김표 — 옛 자리 → 새 자리. 선택 양끝이 같은 표를 타므로 범위가 살아남는다.
    const moves = new Map<string, readonly number[]>();
    const key = (path: readonly number[], depth: number): string => path.slice(0, depth).join('.');
    const remap = (pos: Position, depth: number): Position => {
      const head = moves.get(key(pos.path, depth));
      return head === undefined ? pos : { path: [...head,...pos.path.slice(depth)], offset: pos.offset };
    };
    const settle = (next: NabiDoc, depth: number): CommandOutcome => ({
      doc: next,
      selection: { anchor: remap(sel.anchor, depth), focus: remap(sel.focus, depth) },
    });

    // 걸친 최상위가 전부 이 리스트다 — 푼다. 항목의 속이 제자리 문단으로 선다.
    if (covered.every((block) => listIn(block, env)?.w === family.list)) {
      const blocks: ElementNode[] = [];
      covered.forEach((block, bi) => {
        const list = listIn(block, env) as ElementNode;
        list.ch.forEach((item, ii) => {
          if (!isElement(item)) return;
          item.ch.forEach((inner, ki) => {
            if (!isElement(inner)) return;
            moves.set(`${a + bi}.0.${ii}.${ki}`, [a + blocks.length]); // [t,0,i,k] → [새 자리]
            blocks.push(inner);
          });
        });
      });
      const freed = blocks.length > 0 ? blocks : [emptyParagraph()];
      const next = [...doc.slice(0, a),...freed,...doc.slice(b + 1)] as NabiDoc;
      return settle(next, 4);
    }

    // 아니면 감싼다 — 다른 가족의 리스트는 항목째로 갈아입고, 그 밖의 블록은 항목 하나가 된다.
    const items: ElementNode[] = [];
    const makeItem = (ch: readonly NabiNode[]): ElementNode =>
      checked ? { w: family.item, a: { ck: 1 }, ch } : { w: family.item, ch };

    covered.forEach((block, bi) => {
      const list = listIn(block, env);
      if (list) {
        list.ch.forEach((item, ii) => {
          if (!isElement(item)) return;
          moves.set(`${a + bi}.0.${ii}`, [a, 0, items.length]); // 리스트끼리 — 항목 자리만 옮긴다
          items.push(makeItem(item.ch));
        });
        return;
      }
      moves.set(`${a + bi}`, [a, 0, items.length, 0]); // 블록 하나가 항목 하나의 첫 블록이 된다
      items.push(makeItem([block]));
    });

    const wrapper: ElementNode = { w: P, ch: [{ w: family.list, ch: items }] };
    const next = [...doc.slice(0, a), wrapper,...doc.slice(b + 1)] as NabiDoc;
    // 감싸기는 옛 자리의 깊이가 둘(리스트면 [t,0,i], 아니면 [t])이라 깊은 쪽을 먼저 본다.
    const deep = (pos: Position): Position =>
      moves.has(key(pos.path, 3)) ? remap(pos, 3) : remap(pos, 1);
    return { doc: next, selection: { anchor: deep(sel.anchor), focus: deep(sel.focus) } };
  };
}

// --- 체크 토글 (11) -----------------------------------------------------------------------------

// 항목 하나의 경로 — `_id` 로 찾는다(체크 띠 클릭이 짚어 주는 값). 항목은 홀더가 아니라
// 표면의 사상(pathOfKey)이 못 찾는 자리라, 이 커맨드가 제 손으로 걷는다.
function pathOfItem(doc: NabiDoc, id: string, item: string): readonly number[] | null {
  let found: readonly number[] | null = null;
  const walk = (nodes: readonly NabiNode[], base: readonly number[]): void => {
    nodes.forEach((node, i) => {
      if (found || !isElement(node)) return;
      const path = [...base, i];
      if (node.w === item && node._id === id) {
        found = path;
        return;
      }
      walk(node.ch, path);
    });
  };
  walk(doc, []);
  return found;
}

// 캐럿이 든 가장 안쪽 항목의 경로 — 클릭이 아니라 키·버튼으로 부를 때의 대상이다.
function itemPathAt(doc: NabiDoc, focus: Position, item: string): readonly number[] | null {
  for (let depth = focus.path.length; depth > 0; depth -= 1) {
    const path = focus.path.slice(0, depth);
    if (nodeAt(doc, path)?.w === item) return path;
  }
  return null;
}

// 체크 토글 — 값은 불리언 하나(`ck: 1`)이고 끄면 attr 자체가 진다 (: 0 은 "없음").
// 편집 화면에서는 이 커맨드가 돌고, 보기 화면의 표시는 viewer 의 몫이다.
function toggleCheck(family: Family): Command {
  return (doc, sel, args) => {
    const id = args['id'];
    const path =
      typeof id === 'string' && id !== ''
        ? pathOfItem(doc, id, family.item)
        : itemPathAt(doc, ordered(sel)[1], family.item);
    if (!path) return null;
    const item = nodeAt(doc, path);
    if (!item) return null;
    const now = item.a?.['ck'] === 1;
    const raw = args['ck'];
    const next = raw === 1 || raw === '1' ? true : raw === 0 || raw === '0' ? false : !now;
    if (next === now) return null; // 무변화 침묵
    const a = {...(item.a ?? {}) };
    if (next) a['ck'] = 1;
    else delete a['ck'];
    const rebuilt: ElementNode = {
      w: item.w,
...(Object.keys(a).length > 0 ? { a } : {}),
      ch: item.ch,
...(item._id !== undefined ? { _id: item._id } : {}),
    };
    // 트리 모양이 안 바뀌므로(attr 하나) 들어온 자리가 그대로 산다.
    return { doc: replaceAt(doc, path, [rebuilt]), selection: sel };
  };
}

// 체크 띠의 클릭 — 선언형 부속이다: 글자 앞 띠만 히트로 치고, 그 폭은 시트와 짝이다.
export const CHECKBOX_HIT_EM = 2;
const FALLBACK_FONT_SIZE = 16;

const taskAttach: Wing['attach'] = ({ root, nabi }) => {
  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const item = target.closest('li[data-nabi-checked]');
    if (!item || !root.contains(item)) return;
    const id = item.getAttribute('data-key');
    if (!id) return;
    // em 기준이라 띠가 글꼴 크기를 따라간다.
    const style = item.ownerDocument.defaultView?.getComputedStyle(item);
    const fontSize = Number.parseFloat(style?.fontSize ?? '') || FALLBACK_FONT_SIZE;
    const band = CHECKBOX_HIT_EM * fontSize;
    const rect = item.getBoundingClientRect();
    const hit =
      style?.direction === 'rtl' ? event.clientX >= rect.right - band : event.clientX <= rect.left + band;
    if (!hit) return;
    event.preventDefault();
    nabi.applyCommand('toggleCheck', { id });
  };
  root.addEventListener('click', onClick as EventListener);
  return () => root.removeEventListener('click', onClick as EventListener);
};

// --- 버튼 선언 (12) ------------------------------------------------------------------------------
// 셋이 시트 하나를 나눠 쓴다 — 옛 판의 "가족 수만큼 중복"이 났던 그 가족이다.

const LIST_CSS = `
/* **표식을 우리가 선언한다 — 브라우저 기본값에 기대지 않는다.**
   호스트 페이지의 리셋이 \`ul, ol { list-style: none }\` 을 깔아 두는 일이 흔하고(Tailwind 의
   preflight 가 그렇다), 그러면 글머리와 번호가 통째로 사라진다. 안 적어 두었더니 실제로 그랬다.

   깊이마다 표식이 갈린다 — 같은 점이 세 겹 쌓이면 어느 줄이 어느 층인지 안 보인다.
   \`:where()\` 로 감싸 특정도를 0 으로 둔다: 호스트가 제 목록 모양을 얹고 싶으면 이길 수 있어야 한다. */
.nabi-content :where(ul) { list-style: disc outside; }
.nabi-content :where(ul ul) { list-style: circle outside; }
.nabi-content :where(ul ul ul) { list-style: square outside; }
/* **번호도 같은 규칙이다** — 깊이마다 표식이 갈린다. 숫자만 세 겹 쌓이면 1. / 1. / 1. 이 나란히
   서서 어느 줄이 어느 층인지 안 읽힌다(중첩된 번호는 저마다 1 부터 다시 세기 때문이다).
   숫자 → 알파벳 → 로마자는 개요를 쓰는 오랜 관례이고, 층이 글자꼴부터 다르니 한눈에 갈린다. */
.nabi-content :where(ol) { list-style: decimal outside; }
.nabi-content :where(ol ol) { list-style: lower-alpha outside; }
.nabi-content :where(ol ol ol) { list-style: lower-roman outside; }
/* 체크는 **깊이가 달라도 같은 칸**이다 — 표식이 상태(했나 안 했나)를 말하지 층을 말하지 않는다.
   층은 들여쓰기가 이미 말하고 있고, 칸 모양까지 층마다 바꾸면 켜짐/꺼짐이 안 읽힌다.
   그래서 여기서는 "안 바꾼다" 가 같은 규칙의 답이다 — 아래 체크 규칙이 깊이를 안 가린다. */

/* 들여쓰기 단위가 \`em\` 인 것은 이 자리의 예외다 — 목록의 표식은 제가 붙은 **글자**를 따라
   커져야 한다(제목 안의 목록, 글자 크기를 키운 줄). rem 으로 박으면 글자만 커지고 표식은
   그대로라 줄이 어긋난다.

   **자식(\`>\`)이 아니라 자손으로 겨눈다.** 목록은 물건이라 언제나 래퍼문단 하나를 쓰고 있어서
   (\`div[data-nabi-p] > ul\`), \`.nabi-content > ul\` 도 \`li > ul\` 도 한 겹씩 빗나갔다 — 맨 위
   목록도 중첩 목록도 여백을 통째로 못 받았다. 겉옷이 몇 겹이든 목록은 목록이다.
   중첩된 것만 아래 여백을 뗀다: 항목 안에서 아래로 벌어지면 그 줄만 헐렁해 보인다. */
.nabi-content :where(ul, ol) { margin: 0 0.65em; padding-inline-start: 1.6em; }
.nabi-content li :where(ul, ol) { margin-block-end: 0; }
.nabi-content li { margin-block:.15em; }
.nabi-content li > p { margin: 0; }

/* 체크리스트 — 표식을 끄고 우리 칸을 그린다. \`input\` 을 안 쓰는 까닭: contenteditable 안의
   폼 요소는 캐럿을 엉키게 한다.
   \`padding-inline-start: 2em\` 은 list.ts 의 \`CHECKBOX_HIT_EM\` 과 **같은 값이어야 한다** —
   그 수가 곧 "누르면 켜지는 띠"의 폭이고, 어긋나면 칸 옆의 빈자리를 눌러도 켜지거나 칸을
   눌러도 안 켜진다. */
.nabi-content ul[data-nabi-list="task"] { list-style: none; padding-inline-start: 0; }
.nabi-content ul[data-nabi-list="task"] > li { position: relative; padding-inline-start: 2em; }
/* 빈 칸은 **테두리 상자가 아니라 채운 타일**이다 — 비었다는 것을 모양이 아니라 색조만으로
   말한다. 테두리를 두르면 빈 칸이 켜진 칸보다 요란해진다. 크기는 글자 한 칸(1em) 이라 어느
   글자 크기에서도 줄 높이와 어울린다. */
.nabi-content ul[data-nabi-list="task"] > li::before {
  content: ""; position: absolute; inset-inline-start: 0; inset-block-start:.25em;
  inline-size: 1em; block-size: 1em; box-sizing: border-box;
  border: none; border-radius: var(--nabi-radius-xs);
  background: color-mix(in srgb, var(--nabi-line) 60%, transparent);
  cursor: pointer;
}
/* 켜진 칸 — 강조색 타일 위에 **흰 ✕**. old 의 그림 그대로다.
   왜 체크(✓)가 아니라 ✕ 인가: 이 목록은 "한 일" 이 아니라 "쳐낸 일" 을 말한다. 아래의
   가로줄(line-through)과 한 몸짓이라 ✕ 가 그 뜻과 맞고, 작은 칸에서 ✓ 보다 훨씬 잘 읽힌다.
   그림을 img 태그가 아니라 배경으로 까는 까닭: 이 칸은 ::before 라 자식을 못 든다. */
.nabi-content ul[data-nabi-list="task"] > li[data-nabi-checked="true"]::before {
  background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20vector-effect%3D%22non-scaling-stroke%22%20d%3D%22M1%201l14%2014M15%201l-14%2014%22%2F%3E%3C%2Fsvg%3E") center / 75% no-repeat, var(--nabi-accent);
}
/* 쳐낸 줄은 물러난다 — 색이 옅어지고 가로줄이 그어진다. */
.nabi-content ul[data-nabi-list="task"] > li[data-nabi-checked="true"] {
  color: var(--nabi-muted); text-decoration: line-through;
}
`;

const BULLET_ICON =
  '<path d="M5.5 4h8M5.5 8h8M5.5 12h8"/>' +
  '<circle cx="2.75" cy="4" r="1" fill="currentColor" stroke="none"/>' +
  '<circle cx="2.75" cy="8" r="1" fill="currentColor" stroke="none"/>' +
  '<circle cx="2.75" cy="12" r="1" fill="currentColor" stroke="none"/>';
const ORDERED_ICON =
  '<path d="M6.24 4.47h6.62M6.24 8h6.62M6.24 11.53h6.62M2.71 3.37h.88v2.21M2.62 5.57h1.5"/>' +
  '<path d="M2.62 7.47c0-.35.35-.62.79-.62s.79.26.79.62l-1.58 1.59h1.68"/>' +
  '<path d="M2.71 10.56h1.41L3.15 11.7c.53 0 1.06.18 1.06.71s-.44.79-.97.79c-.35 0-.71-.09-.88-.35"/>';
const TASK_ICON =
  '<path d="M6.25 4.5h6.56M6.25 11.06h6.56M2.31 4.15l1.05 1.05 1.75-1.93M2.31 10.71l1.05 1.05 1.75-1.93"/>';

// 이름 셋 — old 사전 이식(14 로케일).
const BULLET_NAME: LocaleText = { ko: '글머리 목록', en: 'Bullet list', ja: '箇条書き', zh: '项目符号列表', de: 'Aufzählung', fr: 'Liste à puces', es: 'Lista con viñetas', pt: 'Lista com marcadores', ru: 'Маркированный список', ar: 'قائمة نقطية', hi: 'बुलेट सूची', bn: 'বুলেট তালিকা', ur: 'بلٹ فہرست', id: 'Daftar berpoin' };
const ORDERED_NAME: LocaleText = { ko: '번호 목록', en: 'Numbered list', ja: '番号付きリスト', zh: '编号列表', de: 'Nummerierte Liste', fr: 'Liste numérotée', es: 'Lista numerada', pt: 'Lista numerada', ru: 'Нумерованный список', ar: 'قائمة مرقمة', hi: 'क्रमांकित सूची', bn: 'সংখ্যাযুক্ত তালিকা', ur: 'نمبر شدہ فہرست', id: 'Daftar bernomor' };
const TASK_NAME: LocaleText = { ko: '체크리스트', en: 'Checklist', ja: 'チェックリスト', zh: '任务列表', de: 'Checkliste', fr: 'Liste de tâches', es: 'Lista de tareas', pt: 'Lista de tarefas', ru: 'Список задач', ar: 'قائمة المهام', hi: 'चेकलिस्ट', bn: 'চেকলিস্ট', ur: 'چیک لسٹ', id: 'Daftar tugas' };

// --- wing 셋 -----------------------------------------------------------------------------------

function listWing(
  family: Family,
  command: string,
  rules: readonly InputRule[],
  icon: string,
  label: LocaleText,
  shortcut?: string,
  itemDecl?: { boolAttrs: string[] },
  extra?: Partial<Wing>,
): Wing {
  return {
...listFamily({
      w: family.list,
      item: family.item,
...(itemDecl ? { itemDecl } : {}),
      onKey: listKeys(family),
      inputRules: rules,
      button: {
        group: 'list',
        svg: icon,
        label,
...(shortcut ? { shortcut } : {}),
        action: { kind: 'command', command },
      },
      styles: LIST_CSS,
    }),
    commands: { [command]: toggleList(family) },
...(extra ?? {}),
  };
}

export const bulletListWing: Wing = listWing(
  BULLET,
  'toggleBulletList',
  [{ trigger: 'space', pattern: /^-$/, run: () => ({ name: 'toggleBulletList' }) }],
  BULLET_ICON,
  BULLET_NAME,
  'L',
);

export const orderedListWing: Wing = listWing(
  ORDERED,
  'toggleOrderedList',
  // 번호가 몇이든 목록의 시작으로 본다 — `1.2` 는 점 뒤가 남아 안 잡힌다.
  [{ trigger: 'space', pattern: /^\d{1,9}\.$/, run: () => ({ name: 'toggleOrderedList' }) }],
  ORDERED_ICON,
  ORDERED_NAME,
  'N',
);

export const taskListWing: Wing = listWing(
  TASK,
  'toggleTaskList',
  [
    {
      trigger: 'space',
      pattern: /^\[( |x|X)\]$/,
      run: (m) => ({
        name: 'toggleTaskList',
        args: m[1]?.toLowerCase() === 'x' ? { ck: 1 } : {},
      }),
    },
  ],
  TASK_ICON,
  TASK_NAME,
  'K',
  { boolAttrs: ['ck'] },
  {
    commands: { toggleTaskList: toggleList(TASK), toggleCheck: toggleCheck(TASK) },
    attach: taskAttach,
  },
);

export const listWings: readonly Wing[] = [bulletListWing, orderedListWing, taskListWing];
