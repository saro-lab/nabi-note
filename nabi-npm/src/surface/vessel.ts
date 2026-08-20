// 그릇 — parts 없는 컨테이너(인용·접기·코드)다. 탈출은 빠른 이중 엔터 (, 옛 048):
// 첫 엔터가 남긴 흔적(마지막 빈 문단·끝 라인) 위에서 빠르게 한 번 더 치면, 그 흔적을 걷고
// 래퍼문단 다음의 새 빈 문단으로 나간다. 타이밍 창은 조정 가능한 상수다 (surface 옵션).
import {
  P,
  isElement,
  isWrapper,
  lengthOf,
  runsOf,
  type ElementNode,
  type NabiDoc,
  type SchemaEnv,
} from '../schema/index.js';
import {
  fromRuns,
  nodeAt,
  replaceAt,
  terminalOf,
  withChildren,
  type Position,
} from '../doc/index.js';
import { caretAt } from '../caret/index.js';
import type { Command } from '../editor/index.js';
import type { Registry } from '../wing/index.js';

export interface VesselAt {
  readonly path: readonly number[];
  readonly node: ElementNode;
}

// 캐럿을 품은 가장 안쪽 그릇 — 컨테이너 wing 의 노드다.
//
// **`parts` 가 있는지로 가르지 않는다.** 접기는 요약(summary)을 부품으로 데려오지만 본문은 자기
// 자식으로 직접 든다 — 그릇이 맞다. `parts` 로 걸렀더니 접기에서 빠른 엔터 탈출이 아예 안 됐다.
//
// 표·리스트가 안 걸리는 것은 여기가 아니라 `canEscape` 가 이미 지킨다: 그 둘은 캐럿의 홀더가
// 컨테이너의 **직계 자식이 아니라** 부품 속(표는 tr>td>문단, 리스트는 li>문단)이라 깊이가 안 맞는다.
// 조건 하나로 두 번 거를 이유가 없다 — 자리로 갈리는 것을 이름으로 또 가르면 곧 어긋난다.
export function vesselAt(doc: NabiDoc, focus: Position, registry: Registry): VesselAt | null {
  for (let depth = focus.path.length; depth >= 1; depth -= 1) {
    const path = focus.path.slice(0, depth);
    const node = nodeAt(doc, path);
    if (!node || node.w === P) continue;
    const wing = registry.wingOf(node.w);
    if (wing && wing.place === 'container') return { path, node };
  }
  return null;
}

const samePrefix = (prefix: readonly number[], path: readonly number[]): boolean =>
  prefix.every((v, i) => v === path[i]);

// 탈출 조건 — 캐럿이 "첫 엔터의 흔적" 위에 서 있다:
//   블록 그릇(인용·접기): 그릇의 마지막 블록인 빈 문단의 첫머리
//   인라인 그릇(코드): 글 끝이고 마지막 칸이 라인
export function canEscape(doc: NabiDoc, focus: Position, vessel: VesselAt, env: SchemaEnv): boolean {
  const node = nodeAt(doc, vessel.path);
  if (!node) return false;

  if (env.inlineHolders.has(node.w)) {
    if (focus.path.length !== vessel.path.length || !samePrefix(vessel.path, focus.path)) return false;
    const terminal = terminalOf(env);
    const runs = runsOf(node, terminal);
    const last = runs[runs.length - 1];
    return last !== undefined && last.kind === 'node' && focus.offset === lengthOf(node, terminal);
  }

  if (focus.path.length !== vessel.path.length + 1 || focus.offset !== 0) return false;
  if (!samePrefix(vessel.path, focus.path)) return false;
  const index = focus.path[focus.path.length - 1] as number;
  if (index !== node.ch.length - 1) return false;
  const block = node.ch[index];
  return block !== undefined && isElement(block) && block.w === P && block.ch.length === 0;
}

// 탈출 연산 — 흔적을 걷고, 래퍼문단 다음에 빈 문단을 세워 캐럿을 놓는다.
// 그릇이 통째로 비면 그릇(래퍼째)도 같이 사라진다 — 방금 걸어 나온 빈 그릇을 남길 이유가 없다.
export function escapeVesselOp(vessel: VesselAt): Command {
  return (doc, _sel, _args, env) => {
    const wrapperPath = vessel.path.slice(0, -1);
    if (wrapperPath.length === 0) return null;
    const wrapper = nodeAt(doc, wrapperPath);
    const node = nodeAt(doc, vessel.path);
    if (!wrapper || !node || !isWrapper(wrapper, env)) return null;

    // 첫 엔터의 흔적을 걷는다 — 코드는 끝 라인 하나, 블록 그릇은 마지막 빈 문단 하나.
    let kept: ElementNode | null;
    if (env.inlineHolders.has(node.w)) {
      const runs = runsOf(node, terminalOf(env));
      const trimmed = runs.slice(0, -1);
      kept = trimmed.length === 0 ? null : withChildren(node, fromRuns(trimmed));
    } else {
      const blocks = node.ch.slice(0, -1);
      kept = blocks.some((child) => isElement(child)) ? withChildren(node, blocks) : null;
    }

    const empty: ElementNode = { w: P, ch: [] };
    const replacement = kept === null ? [empty] : [withChildren(wrapper, [kept]), empty];
    const next = replaceAt(doc, wrapperPath, replacement);
    const parent = wrapperPath.slice(0, -1);
    const index = wrapperPath[wrapperPath.length - 1] as number;
    const caret: Position = { path: [...parent, index + (kept === null ? 0 : 1)], offset: 0 };
    return { doc: next, selection: caretAt(caret) };
  };
}
