// 그릇은 parts 없는 컨테이너(인용·접기·코드)다 — 첫 엔터가 남긴 흔적(마지막 빈 문단·끝 라인) 위에서 빠르게 한 번 더 치면(이중 엔터, 048) 그 흔적을 걷고 래퍼문단 뒤 새 빈 문단으로 나간다
// A vessel is a part-less container (quote/details/code); a quick second Enter (double-tap, 048) on the trace of the first (a trailing empty paragraph or line) removes that trace and exits to a fresh empty paragraph after the wrapper
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
import { fromRuns, nodeAt, replaceAt, terminalOf, withChildren, type Position } from '../doc/index.js';
import { caretAt } from '../caret/index.js';
import type { Command } from '../editor/index.js';
import type { Registry } from '../wing/index.js';

export interface VesselAt {
  readonly path: readonly number[];
  readonly node: ElementNode;
}

// 캐럿을 품은 가장 안쪽 그릇(컨테이너 wing 노드)을 찾는다 — parts 유무로는 안 가른다(접기는 요약만 부품이고 본문은 직계 자식이라, parts로 거르면 접기의 빠른 엔터 탈출이 안 됐다). 표·리스트는 여기가 아니라 canEscape가 깊이 불일치로 이미 걸러 준다
// Finds the innermost vessel (a container-wing node) holding the caret; it doesn't branch on whether the node has `parts` (details' body is a direct child, only its summary is a part, so filtering by parts broke double-Enter escape there). Tables/lists are already excluded by canEscape via depth mismatch, not here
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

// 탈출 조건: 캐럿이 첫 엔터의 흔적 위에 있다 — 블록 그릇(인용·접기)은 마지막 빈 문단의 첫머리, 인라인 그릇(코드)은 글 끝이자 마지막 칸이 라인일 때
// Escape condition: the caret sits on the trace of the first Enter -- for a block vessel (quote/details), the start of its last (empty) paragraph; for an inline vessel (code), the text's end where the last unit is a line
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

// 탈출 연산 — 흔적을 걷고 래퍼문단 다음에 빈 문단을 세워 캐럿을 놓는다. 그릇이 통째로 비면 래퍼째 함께 사라진다(방금 나온 빈 그릇을 남길 이유가 없다)
// Removes the trace and plants a new empty paragraph after the wrapper for the caret; if the vessel ends up entirely empty, the wrapper vanishes with it (no reason to leave behind the empty vessel just exited)
export function escapeVesselOp(vessel: VesselAt): Command {
  return (doc, _sel, _args, env) => {
    const wrapperPath = vessel.path.slice(0, -1);
    if (wrapperPath.length === 0) return null;
    const wrapper = nodeAt(doc, wrapperPath);
    const node = nodeAt(doc, vessel.path);
    if (!wrapper || !node || !isWrapper(wrapper, env)) return null;

    // 첫 엔터의 흔적을 걷는다 — 코드는 끝 라인 하나, 블록 그릇은 마지막 빈 문단 하나
    // Removes the first Enter's trace: for code, its trailing line; for a block vessel, its last empty paragraph
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
