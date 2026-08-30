// 왕복의 문 — 사용자 JSON 과 내부 트리는 같은 어휘(w·a·ch)의 한 모양이고
// 차이는 `_` 접두 필드 하나다: 나갈 때 일괄 벗기고, 들어올 때 받지 않는다.
// 이름의 `$` 접두는 내부용 표시다 — 사용자 API(setJson/getJson)는 05(editor)가 이 위에 세운다.
import { cocoon } from './cocoon.js';
import type { SchemaEnv } from './env.js';
import { $snapshotNodes } from './raw.js';
import { isElement, type ElementNode, type NabiDoc, type NabiNode } from './types.js';
export { $callbackTree, $ownDataArray, $ownDataObject, $snapshotNodes } from './raw.js';
export type { CallbackTree, DataDescriptors } from './raw.js';

// 내부 트리 → 사용자 JSON. `_` 로 시작하는 필드를 전부 벗긴다 — 규칙 한 줄이 내부 필드
// 전부를 처리한다. attrs 값(문자열·숫자 1/0)은 그대로 나간다.
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

// 사용자 JSON → 내부 트리. 나비트리가 아니면 null 로 거절하고(문서 전체가 아니면 안 받는다)
// 나비트리면 cocoon 이 불변식을 세운다 — 거절과 정리는 다른 일이다.
// 루트는 배열이어야 한다. 배열 속 맨몸 물건·떠도는 글자는 cocoon 이 문단으로 거둔다.
export function $fromJson(value: unknown, env: SchemaEnv): NabiDoc | null {
  const nodes = $snapshotNodes(value);
  if (!nodes) return null;
  return cocoon(nodes, env);
}

// 문에서 잡는 마지막 그물 — 바깥 데이터를 받는 문(setJson·setHtml·doc 옵션·renderStored*)이
// 이것으로 몸을 감싼다. 검사(readNode)가 거르는 것은 **모양이 틀린 값**이고, 이 그물이 잡는
// 것은 **검사를 지나고도 조립 중에 예외를 던지는 값**이다 — 어느 쪽이든 문은 거절(fallback)로
// 답할 뿐, 예외가 문 밖(호스트의 렌더 루프)으로 번져 화면을 통째로 무너뜨리지 않는다.
// console 이 있으면 console.error 로 알리고, 없는 환경이면 조용히 거절만 한다.
// The last net at the door: malformed shapes are rejected by validation, but a value that passes
// validation and still throws mid-assembly must not escape into the host's render loop. The door
// answers with its normal rejection value and reports via console.error when a console exists.
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

// 글자열을 받는 편의 문 — 파싱이 안 되는 글자열과 다른 모양의 멀쩡한 JSON 은 같은 답(null)이다.
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
