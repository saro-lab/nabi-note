// 서식 지우기 clearFormat — 노드를 안 세우는 도구 wing 이다. 사정권은 둘이고 둘 다 한 번에 간다:
//   ① 마크 전부 — b·i·u·s·sub·sup·hl·tc·fs·tf·a (값 마크 fs·tf 도 마크다)
//   ② 문단 속성 전부 — 제목(h)·정렬(a)·드롭캡(dc). **제목도 정렬도 대상이다.**
//
// **옛 확실 버그 3 — 정렬된 제목을 못 지웠다.** 옛 판은 제목이 블록 *타입*이라, 속성 걷기가
// `type === 'p'` 일 때만 돌고 제목은 그 문을 못 지났다. 새 판에서 제목은 문단 속성이므로
// 셋(h·a·dc)이 한 켜로 함께 떨어진다 — 회귀 그물이 이 한 줄을 지킨다.
//
// 예외 하나 — **래퍼문단의 정렬은 남는다.** 래퍼문단이 든 정렬은 글의 서식이 아니라 그 물건이
// 어디 서 있는가다 (물건은 정렬 attr 이 없다). 글 서식을 지웠다고 그림이 옮겨
// 다니면 안 된다.
//
// 예외 둘 — **첨부 링크(`a` 에 `file` 이 실린 것)는 벗기지 않는다** (old 번역). 껍데기를 벗기면
// 첨부가 되살릴 수 없는 죽은 평문이 된다 — 그건 서식 지우기가 아니라 삭제다.
import {
  P,
  isWrapper,
  runsOf,
  type Attrs,
  type ElementNode,
  type NabiDoc,
  type Run,
} from '../../schema/index.js';
import {
  comparePositions,
  fromRuns,
  holderLength,
  holders,
  nodeAt,
  replaceAt,
  sameMark,
  sliceRuns,
  terminalOf,
  withChildren,
  type EditEnv,
  type Position,
} from '../../doc/index.js';
import { isCollapsed, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import type { Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

const CLEAR_NAME: LocaleText = { ko: '서식 지우기', en: 'Clear formatting', ja: '書式をクリア', zh: '清除格式', de: 'Formatierung löschen', fr: 'Effacer la mise en forme', es: 'Borrar formato', pt: 'Limpar formatação', ru: 'Очистить форматирование', ar: 'مسح التنسيق', hi: 'फ़ॉर्मैटिंग हटाएँ', bn: 'ফরম্যাটিং মুছুন', ur: 'فارمیٹنگ ہٹائیں', id: 'Hapus format' };

const CLEAR_ICON =
  '<g transform="translate(8 8) scale(1.134) translate(-8.2 -7.75)" stroke-width="1.235">' +
  '<path d="M5.9 12.6 2.9 9.6a1.4 1.4 0 0 1 0-2l4.7-4.7a1.4 1.4 0 0 1 2 0l3.5 3.5a1.4 1.4 0 0 1 0 2l-4.2 4.2"/>' +
  '<path d="M5.1 7 9.9 11.8"/><path d="M6 12.6h7.5"/></g>';

// 지우는 마크 열하나 — 등록된 마크 wing 전부의 이름이다 (의 마크 목록).
export const CLEARED_MARKS: readonly string[] = [
  'b', 'i', 'u', 's', 'sub', 'sup', 'hl', 'tc', 'fs', 'tf', 'a',
];

// 걷는 문단 속성 셋 — 문단 속성은 이 셋뿐이다.
export const CLEARED_ATTRS: readonly string[] = ['h', 'a', 'dc'];

const CLEARED = new Set(CLEARED_MARKS);

// 벗길 수 있는 마크인가 — 첨부 링크만 불가침이다.
function strippable(mark: ElementNode): boolean {
  if (!CLEARED.has(mark.w)) return false;
  return !(mark.w === 'a' && mark.a?.['file'] !== undefined);
}

// 문단 속성을 걷은 문단 — 래퍼문단은 정렬만 지키고 나머지를 잃는다(어차피 그것뿐이다).
function withoutAttrs(node: ElementNode, wrapper: boolean): ElementNode {
  const a = node.a;
  if (!a) return node;
  const kept: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(a)) {
    const drop = CLEARED_ATTRS.includes(key) && !(wrapper && key === 'a');
    if (!drop) kept[key] = value;
  }
  if (Object.keys(kept).length === Object.keys(a).length) return node; // 걷을 것이 없었다
  const next: Attrs | undefined = Object.keys(kept).length > 0 ? kept : undefined;
  return {
    w: node.w,
    ...(next ? { a: next } : {}),
    ch: node.ch,
    ...(node._id !== undefined ? { _id: node._id } : {}),
  };
}

// 홀더 하나의 [from, to) 구간에서 마크를 벗긴 홀더 — 글자는 그대로 남고 껍데기만 진다.
function strippedHolder(holder: ElementNode, from: number, to: number, env: EditEnv): ElementNode {
  const runs = runsOf(holder, terminalOf(env));
  const inside = sliceRuns(runs, from, to);
  if (!inside.some((run) => run.marks.some(strippable))) return holder;
  const peeled = inside.map((run): Run =>
    run.kind === 'text'
      ? { kind: 'text', text: run.text, marks: run.marks.filter((mark) => !strippable(mark)) }
      : { kind: 'node', node: run.node, marks: run.marks.filter((mark) => !strippable(mark)) },
  );
  return withChildren(holder, fromRuns([
    ...sliceRuns(runs, 0, from),
    ...peeled,
    ...sliceRuns(runs, to, Number.MAX_SAFE_INTEGER),
  ]));
}

// 범위 — 걸친 홀더마다 마크를 벗기고, 걸친 문단마다 속성을 걷는다. 한 번에 전부다.
function clearRange(doc: NabiDoc, start: Position, end: Position, env: EditEnv): NabiDoc {
  let next = doc;
  for (const { path } of holders(doc, env)) {
    const node = nodeAt(next, path);
    if (!node) continue;
    const wrapper = isWrapper(node, env);
    const length = holderLength(node, env);
    if (comparePositions({ path, offset: length }, start) < 0) continue;
    if (comparePositions({ path, offset: 0 }, end) > 0) continue;

    let rebuilt = node;
    if (!wrapper) {
      const samePathAs = (p: Position): boolean =>
        p.path.length === path.length && p.path.every((v, i) => v === path[i]);
      const from = samePathAs(start) ? start.offset : 0;
      const to = samePathAs(end) ? end.offset : length;
      if (from < to) rebuilt = strippedHolder(rebuilt, from, to, env);
    }
    // 속성은 문단의 것이다 — 인라인 홀더(접기 제목·코드)는 애초에 가진 적이 없다.
    if (rebuilt.w === P) rebuilt = withoutAttrs(rebuilt, wrapper);
    if (rebuilt !== node) next = replaceAt(next, path, [rebuilt]);
  }
  return next;
}

// 접힌 캐럿 — 가장 안쪽 마크 하나를 그 **연속 구간 전체**로 벗긴다(부분만 벗기면 마크가 둘로
// 갈릴 뿐이다). 벗길 마크가 없으면 그때 문단 속성이 한 켜로 떨어진다 (old 의 한 켜씩 규칙).
function clearAtCaret(doc: NabiDoc, caret: Position, env: EditEnv): NabiDoc {
  const holder = nodeAt(doc, caret.path);
  if (!holder) return doc;
  if (!isWrapper(holder, env)) {
    const runs = runsOf(holder, terminalOf(env));
    // 캐럿이 든 런 — 경계에서는 앞쪽 런의 것으로 본다(글자를 막 친 자리가 그 마크 안이다).
    let acc = 0;
    let at = -1;
    for (let i = 0; i < runs.length; i += 1) {
      const run = runs[i] as Run;
      const size = run.kind === 'text' ? run.text.length : 1;
      if (caret.offset > acc && caret.offset <= acc + size) at = i;
      acc += size;
    }
    const target = at === -1 ? undefined : [...(runs[at] as Run).marks].reverse().find(strippable);
    if (target) {
      let lo = at;
      let hi = at;
      while (lo > 0 && (runs[lo - 1] as Run).marks.some((mark) => sameMark(mark, target))) lo -= 1;
      while (hi + 1 < runs.length && (runs[hi + 1] as Run).marks.some((mark) => sameMark(mark, target))) hi += 1;
      const peeled = runs.map((run, i): Run =>
        i < lo || i > hi
          ? run
          : run.kind === 'text'
            ? { kind: 'text', text: run.text, marks: run.marks.filter((mark) => !sameMark(mark, target)) }
            : { kind: 'node', node: run.node, marks: run.marks.filter((mark) => !sameMark(mark, target)) },
      );
      return replaceAt(doc, caret.path, [withChildren(holder, fromRuns(peeled))]);
    }
  }
  if (holder.w !== P) return doc;
  const bare = withoutAttrs(holder, isWrapper(holder, env));
  return bare === holder ? doc : replaceAt(doc, caret.path, [bare]);
}

const clearFormat: Command = (doc, sel, _args, env) => {
  if (isCollapsed(sel)) {
    const next = clearAtCaret(doc, sel.focus, env);
    return next === doc ? null : { doc: next, selection: sel };
  }
  const [start, end] = ordered(sel);
  const next = clearRange(doc, start, end, env);
  // 글자 수가 안 바뀌는 연산이라 자리는 그대로 산다 — 반환 자리는 반환 트리에 실재한다.
  return next === doc ? null : { doc: next, selection: sel };
};

export const clearFormatWing: Wing = {
  w: 'clearFormat',
  place: 'tool',
  commands: { clearFormat },
  button: {
    group: 'clear',
    svg: CLEAR_ICON,
    label: CLEAR_NAME,
    action: { kind: 'command', command: 'clearFormat' },
  },
};
