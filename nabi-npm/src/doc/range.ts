// 범위 삭제 — 선택 삭제 의미론 (유지 판정 + §2.5):
// 최상위(또는 같은 급) 스코프에서 통째로 덮인 블록은 통삭제 — 래퍼문단이 덮이면 물건도 함께 (042 종결).
// 부분만 걸린 컨테이너는 속만 비운다 — 구조(행·칸·항목)는 지킨다.
// 문단은 안 없앤다 — 경계의 문단은 잘려도 남는다 (빈 문단이 될 수 있다).
// 양 끝이 같은 부모의 글 문단으로 남으면 병합한다 (속성은 윗 속성).
import {
  P,
  isElement,
  isWrapper,
  type ElementNode,
  type NabiDoc,
  type NabiNode,
} from '../schema/index.js';
import {
  comparePositions,
  holderLength,
  isHolder,
  nodeAt,
  positionExists,
  replaceAt,
  terminalOf,
  type EditEnv,
  type EditResult,
  type Position,
} from './position.js';
import { fromRuns, holderRuns, sliceRuns, withChildren } from './runs-edit.js';

export interface DocRange {
  readonly anchor: Position;
  readonly focus: Position;
}

// 속을 전부 비운 같은 구조 — 부분 걸린 컨테이너 안의 "통째 덮임"은 삭제가 아니라 비움이다.
function emptied(node: ElementNode, env: EditEnv): ElementNode {
  const holder = node.w === P || env.inlineHolders.has(node.w);
  if (holder) return withChildren(node, []);
  const ch = node.ch.filter(isElement).map((child) => emptied(child, env));
  return withChildren(node, ch);
}

// 자유 스코프인가 — 자식이 전부 문단(래퍼 포함)·인라인 홀더인 컨테이너 속은 블록을 통째로
// 지워도 되는 자리다(접기·인용·리스트 항목). 행·칸 같은 격자 조각을 든 컨테이너와 문단 하나
// 고정 컨테이너(표의 칸)는 구조 보호 — 속만 비운다 (옛 "구조 안은 내용만" 판정의 새 번역).
function freeScope(container: ElementNode, env: EditEnv): boolean {
  if (env.singleParagraph?.has(container.w)) return false;
  return container.ch.every((child) => !isElement(child) || isHolder(child, env));
}

// 홀더를 [keepFrom, cutFrom)…[cutTo, ∞) 로 자른다 — 경계 문단은 남는다.
function trimmed(holder: ElementNode, from: number, to: number, env: EditEnv): ElementNode {
  const terminal = terminalOf(env);
  const runs = holderRuns(holder, terminal);
  return withChildren(
    holder,
    fromRuns([...sliceRuns(runs, 0, from), ...sliceRuns(runs, to, Number.MAX_SAFE_INTEGER)]),
  );
}

// 한 스코프를 자른다. sp/ep 는 이 스코프 기준의 남은 경로 조각이고, null 은 "그쪽 경계가
// 스코프 밖"(= 그 방향 전부 덮임)이다. mode 'delete' 는 통삭제, 'empty' 는 속만 비움.
// mode 는 물려받은 성격이고, 이 스코프에서 실제로 통삭제해도 되는가(local)는 컨테이너가
// 자유 스코프인가로 한 번 더 좁힌다 — 공통 하강 중의 래퍼·물건은 통과일 뿐 판정이 아니다.
function cut(
  nodes: readonly NabiNode[],
  container: ElementNode | null,
  sp: readonly number[] | null,
  so: number,
  ep: readonly number[] | null,
  eo: number,
  mode: 'delete' | 'empty',
  env: EditEnv,
): NabiNode[] {
  const local: 'delete' | 'empty' =
    mode === 'delete' && (container === null || freeScope(container, env)) ? 'delete' : 'empty';
  const si = sp === null ? Number.NEGATIVE_INFINITY : (sp[0] as number);
  const ei = ep === null ? Number.POSITIVE_INFINITY : (ep[0] as number);
  const out: NabiNode[] = [];

  nodes.forEach((node, i) => {
    if (!isElement(node)) {
      if (i < si || i > ei) out.push(node);
      return;
    }
    // 경계 밖 — 그대로.
    if (i < si || i > ei) {
      out.push(node);
      return;
    }
    // 사이 — 통째로 덮였다.
    if (i > si && i < ei) {
      if (local === 'empty') out.push(emptied(node, env));
      return; // delete — 떨어진다 (래퍼문단이면 물건도 함께)
    }

    const startHere = i === si && sp !== null;
    const endHere = i === ei && ep !== null;
    const sDeeper = startHere && (sp as readonly number[]).length > 1;
    const eDeeper = endHere && (ep as readonly number[]).length > 1;

    // 경계가 이 노드 안 더 깊은 곳이다.
    // 양쪽 다 이 자식 안(공통 조상 하강) — 아직 좁히는 중이므로 모드를 지킨다.
    // 한쪽만 안(부분 걸린 컨테이너) — 속만 비우는 모드로 내려간다.
    // 다른 한쪽 경계가 이 래퍼문단 자신이면(0=속 앞·1=속 뒤) 그쪽 방향은 속 전체가 덮인다.
    if (sDeeper || eDeeper) {
      const both = sDeeper && eDeeper;
      const ch = cut(
        node.ch,
        node,
        sDeeper ? (sp as readonly number[]).slice(1) : null,
        sDeeper ? so : 0,
        eDeeper ? (ep as readonly number[]).slice(1) : null,
        eDeeper ? eo : 0,
        both ? mode : 'empty',
        env,
      );
      out.push(withChildren(node, ch));
      return;
    }

    // 경계가 이 홀더 자신이다.
    const wrapper = isWrapper(node, env);
    const from = startHere ? so : 0;
    const to = endHere ? eo : holderLength(node, env);

    if (wrapper) {
      // 래퍼문단의 칸은 하나뿐 — [0,1) 이 덮이면 통째, 아니면 통째로 남는다.
      const covered = from <= 0 && to >= 1;
      if (!covered) out.push(node);
      else if (local === 'empty') out.push(withChildren(node, []));
      // delete — 물건과 함께 떨어진다
      return;
    }

    out.push(trimmed(node, from, to, env));
  });

  return out;
}

// 스코프 배열에서 si 였던 자리와 그다음 자리가 둘 다 글 문단이면 병합한다.
function mergeAt(nodes: NabiNode[], index: number, env: EditEnv): NabiNode[] {
  const head = nodes[index];
  const tail = nodes[index + 1];
  if (
    head === undefined || tail === undefined ||
    !isElement(head) || !isElement(tail) ||
    head.w !== P || tail.w !== P ||
    isWrapper(head, env) || isWrapper(tail, env)
  ) {
    return nodes;
  }
  const terminal = terminalOf(env);
  const merged = withChildren(head, fromRuns([...holderRuns(head, terminal), ...holderRuns(tail, terminal)]));
  return [...nodes.slice(0, index), merged, ...nodes.slice(index + 2)];
}


// --- 지운 뒤 두 끝이 만난다 (§11) ---------------------------------------------------------------
//
// 글 문단끼리는 이미 그렇다(`mergeAt`). 그런데 그 병합은 **같은 부모**일 때만 서는 규칙이라
// 목록이 걸치면 반쪽들이 따로 남았다 — `he|ad` 와 항목을 걸쳐 지우면 문단은 문단대로 항목은
// 항목대로. 같은 목록의 두 항목을 걸쳐도 마찬가지였다.
//
// "범위 삭제 = 지운 뒤 두 끝이 만난다" 가 문단에서 참인데 목록만 다른 답일 이유가 없다. 여기서는
// **부모를 안 본다**: 자른 뒤 남은 시작 글자리와 그 **다음 글자리**가 곧 두 끝이다(사이는 이미
// 사라졌다). 그 둘을 잇고, 글을 내준 쪽은 빈 껍데기가 되는 만큼 위로 따라 걷는다.

// 문서 순서로 이 경로 **다음**에 오는 글자리 — 없으면 null. 래퍼문단은 글자리가 아니다.
function nextHolderAfter(doc: NabiDoc, path: readonly number[], env: EditEnv): readonly number[] | null {
  const after = (a: readonly number[], b: readonly number[]): boolean => {
    for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
      const x = a[i] as number;
      const y = b[i] as number;
      if (x !== y) return x > y;
    }
    return a.length > b.length;
  };
  let found: readonly number[] | null = null;
  const walk = (nodes: readonly NabiNode[], at: readonly number[]): void => {
    for (const [i, node] of nodes.entries()) {
      if (found) return;
      if (!isElement(node)) continue;
      const here = [...at, i];
      if (isHolder(node, env) && !isWrapper(node, env)) {
        if (after(here, path)) {
          found = here;
          return;
        }
        continue; // 글자리 속은 안 판다 — 글자리 안의 글자리는 없다
      }
      walk(node.ch, here);
    }
  };
  walk(doc, []);
  return found;
}

// 노드 하나를 걷고, 그 바람에 **빈 껍데기**가 생기면 위로 따라 걷는다.
// 문서 뿌리까지 비면 거기서 멈춘다(캐럿의 집은 부르는 쪽이 세운다).
function pruneAt(doc: NabiDoc, path: readonly number[]): NabiDoc {
  let out = doc;
  let cut: readonly number[] = path;
  for (;;) {
    const parentPath = cut.slice(0, -1);
    const at = cut[cut.length - 1] as number;
    const siblings = parentPath.length === 0 ? out : (nodeAt(out, parentPath)?.ch ?? []);
    const kept = [...siblings.slice(0, at), ...siblings.slice(at + 1)];
    if (parentPath.length === 0) return kept as NabiDoc;
    if (kept.length === 0) {
      cut = parentPath; // 껍데기가 비었다 — 한 겹 위를 걷는다
      continue;
    }
    const parent = nodeAt(out, parentPath);
    if (!parent) return out;
    return replaceAt(out, parentPath, [withChildren(parent, kept)]) as NabiDoc;
  }
}

// 이 글자리를 품은 **보호 칸**(`singleParagraph`) — 없으면 null. 두 끝이 같은 칸(또는 둘 다
// 칸 밖)일 때만 이어도 된다.
function cellOf(doc: NabiDoc, path: readonly number[], env: EditEnv): ElementNode | null {
  for (let depth = path.length - 1; depth >= 1; depth -= 1) {
    const node = nodeAt(doc, path.slice(0, depth));
    if (node && env.singleParagraph?.has(node.w)) return node;
  }
  return null;
}

// 이 노드가 품은 글자리 수 — 둘까지만 센다(하나뿐인지만 알면 된다).
function holdersUnder(node: ElementNode, env: EditEnv): number {
  let count = 0;
  const walk = (nodes: readonly NabiNode[]): void => {
    for (const child of nodes) {
      if (count > 1) return;
      if (!isElement(child)) continue;
      if (isHolder(child, env) && !isWrapper(child, env)) {
        count += 1;
        continue;
      }
      walk(child.ch);
    }
  };
  walk(node.ch);
  return count;
}

// 시작 글자리와 그 다음 글자리를 잇는다. 이을 것이 없으면 그대로 돌려준다.
function joinEnds(doc: NabiDoc, startPath: readonly number[], env: EditEnv): NabiDoc {
  const head = nodeAt(doc, startPath);
  if (!head || head.w !== P) return doc;
  const tailPath = nextHolderAfter(doc, startPath, env);
  if (!tailPath) return doc;
  const tail = nodeAt(doc, tailPath);
  // **글 문단끼리만 만난다.** 접기 제목·코드 상자는 글자리이긴 해도 문단이 아니라, 그 경계는
  // 병합의 자리가 아니다(코어의 백스페이스가 이미 그렇게 판단한다).
  if (!tail || tail.w !== P) return doc;
  // **격자는 안 넘는다.** 칸(`singleParagraph`)은 지워도 구조가 남는 자리다 — 두 칸의 글이
  // 하나로 합쳐지면 표가 무너진다. 서로 다른 칸에 있으면 잇지 않는다.
  if (cellOf(doc, startPath, env) !== cellOf(doc, tailPath, env)) return doc;

  const terminal = terminalOf(env);
  const filled = withChildren(head, fromRuns([...holderRuns(head, terminal), ...holderRuns(tail, terminal)]));
  let out = replaceAt(doc, startPath, [filled]) as NabiDoc;
  out = pruneAt(out, tailPath);

  // **전부 잡았으면 그릇이 걷힌다.** 이은 글자리가 비었고 그 그릇에 남은 글자리가 그것뿐이면
  // 그 그릇은 글을 다 잃은 것이다 — 빈 껍데기(빈 항목 하나짜리 목록)로 남기지 않는다.
  const joined = nodeAt(out, startPath);
  if (!joined || holderLength(joined, env) > 0) return out;
  for (let depth = startPath.length - 1; depth >= 1; depth -= 1) {
    const at = startPath.slice(0, depth);
    const node = nodeAt(out, at);
    if (!node) break;
    if (!isWrapper(node, env)) continue;
    // 이 래퍼문단이 품은 그릇에 글자리가 **이것 하나뿐인가** — 그렇다면 그릇은 글을 다 잃었다.
    if (holdersUnder(node, env) <= 1) out = replaceAt(out, at, [{ w: P, ch: [] }]) as NabiDoc;
    break;
  }
  return out;
}

export function deleteRange(doc: NabiDoc, range: DocRange, env: EditEnv): EditResult {
  const forward = comparePositions(range.anchor, range.focus) <= 0;
  const start = forward ? range.anchor : range.focus;
  const end = forward ? range.focus : range.anchor;
  if (comparePositions(start, end) === 0) return { doc, caret: start };

  let next = cut(doc, null, start.path, start.offset, end.path, end.offset, 'delete', env) as ElementNode[];

  // 양 끝이 같은 부모의 글 문단이면 병합 — 경로가 같은 깊이·같은 부모일 때만이다.
  const sameParent =
    start.path.length === end.path.length &&
    start.path.slice(0, -1).every((v, i) => v === end.path[i]);
  if (sameParent && start.path.length >= 1 && start.path[start.path.length - 1] !== end.path[end.path.length - 1]) {
    const parentPath = start.path.slice(0, -1);
    const index = start.path[start.path.length - 1] as number;
    if (parentPath.length === 0) {
      next = mergeAt(next, index, env).filter(isElement);
    } else {
      const parent = nodeAt(next, parentPath);
      // 자유 스코프에서만 병합한다 — 보호 스코프(격자)는 사이가 비워졌을 뿐 지워진 게 아니다.
      if (parent && freeScope(parent, env)) {
        const merged = mergeAt([...parent.ch], index, env);
        next = replaceAt(next, parentPath, [withChildren(parent, merged)]) as ElementNode[];
      }
    }
  }

  // 양 끝의 부모가 달랐다 — 문단끼리의 규칙이 안 서는 자리라 여기서 두 끝을 잇는다 (§11).
  if (!sameParent) next = joinEnds(next, start.path, env) as ElementNode[];

  // **빈 문서의 모양은 하나다** — 어느 길로 비웠든 맨몸 문단 하나다.
  //
  // 비는 길이 둘이라 그렇다: 블록이 통째로 걷혀 아무것도 안 남는 길(`next.length === 0`)과,
  // **껍데기 한 장이 남는 길**이다 — 전체선택 삭제가 그 둘째다. 글만 빠지고 시작 문단의 그릇은
  // 남아서, 그 문단이 입고 있던 속성(정렬 `a`·제목 `h`·드롭캡 `dc`)이 빈 줄에 그대로 붙어 있다.
  // 화면에서는 다 지웠는데 가운데 정렬이 살아 있고, 다시 쓰기 시작하면 그 서식으로 써진다
  // (주인 신고 2026-08-20). 같은 "빈 문서"가 어떻게 비웠느냐에 따라 두 모양이 되는 셈이다.
  //
  // 걷는 자리를 여기로 잡은 까닭: 지우기는 **전부 이 문 하나**를 지난다(백스페이스·Delete·
  // 범위 삭제 커맨드가 다 `deleteRange` 로 모인다). 반대로 cocoon 에 두면 못 쓴다 — 빈 문서에서
  // 제목 단추부터 누르고 쓰는 걸음이 있고, 그 자리는 속성이 살아야 한다.
  //
  // **문단 하나만 비운 것은 안 건드린다.** 여러 줄 중 한 줄을 비운 것은 그 줄을 다시 쓰려는
  // 것이라 서식이 남는 것이 맞다 — 여기서 걷는 것은 문서가 통째로 빈 자리뿐이다.
  const only = next.length === 1 ? next[0] : undefined;
  const husk = only !== undefined && isElement(only) && only.w === P && only.ch.length === 0 && only.a !== undefined;
  if (next.length === 0 || husk) {
    const empty: ElementNode = { w: P, ch: [] };
    return { doc: [empty], caret: { path: [0], offset: 0 } };
  }

  // 캐럿은 범위의 시작 자리다 — 시작 홀더가 사라졌으면(래퍼 통삭제) 그 인덱스로 당겨진 홀더의
  // 처음, 그것도 없으면 앞 홀더의 끝이다.
  const caret: Position = { path: start.path, offset: start.offset };
  if (positionExists(next, caret, env)) return { doc: next, caret };
  const atIndex: Position = { path: start.path, offset: 0 };
  if (positionExists(next, atIndex, env)) return { doc: next, caret: atIndex };
  const parentPath = start.path.slice(0, -1);
  const index = start.path[start.path.length - 1] as number;
  for (let back = index - 1; back >= 0; back -= 1) {
    const candidate = nodeAt(next, [...parentPath, back]);
    if (candidate && isHolder(candidate, env)) {
      return { doc: next, caret: { path: [...parentPath, back], offset: holderLength(candidate, env) } };
    }
  }
  // 이 스코프에 홀더가 안 남았다 — 빈 문단을 세운다.
  const empty: ElementNode = { w: P, ch: [] };
  const scope = parentPath.length === 0 ? next : nodeAt(next, parentPath)?.ch ?? [];
  const clamped = Math.min(index, scope.length);
  if (parentPath.length === 0) {
    const rebuilt = [...next.slice(0, clamped), empty, ...next.slice(clamped)];
    return { doc: rebuilt, caret: { path: [clamped], offset: 0 } };
  }
  const parent = nodeAt(next, parentPath);
  if (!parent) return { doc: next, caret: { path: [0], offset: 0 } };
  const rebuiltParent = withChildren(parent, [
    ...parent.ch.slice(0, clamped),
    empty,
    ...parent.ch.slice(clamped),
  ]);
  const rebuilt = replaceAt(next, parentPath, [rebuiltParent]) as ElementNode[];
  return { doc: rebuilt, caret: { path: [...parentPath, clamped], offset: 0 } };
}
