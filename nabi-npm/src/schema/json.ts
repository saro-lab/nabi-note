// 사용자 JSON과 내부 트리는 같은 모양(w·a·ch)이고 차이는 `_` 접두 필드뿐 — 나갈 때 벗기고 들어올 때 안 받는다.
// User JSON and the internal tree share one shape (w/a/ch); the only difference is `_`-prefixed fields, stripped going out and never accepted coming in.
import { cocoon } from './cocoon.js';
import type { SchemaEnv } from './env.js';
import { $snapshotNodes } from './raw.js';
import { isElement, type ElementNode, type NabiDoc, type NabiNode } from './types.js';
export { $callbackTree, $ownDataArray, $ownDataObject, $snapshotNodes } from './raw.js';
export type { CallbackTree, DataDescriptors } from './raw.js';

// `_`로 시작하는 필드를 전부 벗긴다 — 규칙 한 줄이 내부 필드 전부를 처리한다.
// Strips every field starting with `_`; one rule handles all internal fields.
export function $toJson(doc: NabiDoc): unknown[] {
  const strip = (node: NabiNode): unknown => {
    if (!isElement(node)) return node;
    const out: Record<string, unknown> = { w: node.w };
    if (node.a && Object.keys(node.a).length > 0) out['a'] = { ...node.a };
    out['ch'] = node.ch.map(strip);
    return out;
  };
  return doc.map(strip);
}

// 나비트리 모양이 아니면 null로 거절하고, 맞으면 cocoon이 불변식을 세운다 — 거절과 정리는 다른 일이다.
// Rejects with null if it isn't nabi-tree shaped; if it is, cocoon enforces invariants — rejection and cleanup are different jobs.
export function $fromJson(value: unknown, env: SchemaEnv): NabiDoc | null {
  const nodes = $snapshotNodes(value);
  if (!nodes) return null;
  return cocoon(nodes, env);
}

// 검사를 지나고도 조립 중 던지는 값을 잡는 마지막 그물 — 예외가 호스트의 렌더 루프로 안 번지게 거절로 답한다.
// The last net catching a value that passes validation but still throws mid-assembly — answers with rejection instead of letting the exception escape into the host's render loop.
export function $guarded<T>(door: string, fallback: T, run: () => T): T {
  try {
    return run();
  } catch (error) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(`[nabi-note] ${door}: broken document data rejected`, error);
    }
    return fallback;
  }
}

// 파싱 안 되는 글자열과 다른 모양의 멀쩡한 JSON은 같은 답(null)이다.
// An unparseable string and valid JSON of the wrong shape both answer null.
export function $parseJson(text: string, env: SchemaEnv): NabiDoc | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  return $guarded('parseJson', null, () => $fromJson(value, env));
}

export type { ElementNode, NabiDoc, NabiNode };
