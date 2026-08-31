// 서식 지우기 clearFormat — 마크 전부(b·i·u·s·sub·sup·hl·tc·fs·tf·a)와 문단 속성 전부(h·a·dc)를 한 번에 걷는다.
// clearFormat wipes every mark (b/i/u/s/sub/sup/hl/tc/fs/tf/a) and every paragraph attr (h/a/dc) in one pass.
//
// 예외 둘 — 래퍼문단의 정렬은 물건이 서는 자리라 남기고, 첨부 링크(`a`+`file`)는 벗기면 되살릴 수 없어 남긴다.
// Two exceptions: a wrapper paragraph's align describes placement (kept), and an attachment link (`a`+`file`) would go dead if stripped (kept).
import { P, isWrapper, runsOf, type Attrs, type ElementNode, type NabiDoc, type Run } from '../../schema/index.js';
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

const CLEAR_NAME: LocaleText = {
  ko: '서식 지우기',
  en: 'Clear formatting',
  ja: '書式をクリア',
  zh: '清除格式',
  de: 'Formatierung löschen',
  fr: 'Effacer la mise en forme',
  es: 'Borrar formato',
  pt: 'Limpar formatação',
  ru: 'Очистить форматирование',
  ar: 'مسح التنسيق',
  hi: 'फ़ॉर्मैटिंग हटाएँ',
  bn: 'ফরম্যাটিং মুছুন',
  ur: 'فارمیٹنگ ہٹائیں',
  id: 'Hapus format',
};

const CLEAR_ICON =
  '<g transform="translate(8 8) scale(1.134) translate(-8.2 -7.75)" stroke-width="1.235">' +
  '<path d="M5.9 12.6 2.9 9.6a1.4 1.4 0 0 1 0-2l4.7-4.7a1.4 1.4 0 0 1 2 0l3.5 3.5a1.4 1.4 0 0 1 0 2l-4.2 4.2"/>' +
  '<path d="M5.1 7 9.9 11.8"/><path d="M6 12.6h7.5"/></g>';

export const CLEARED_MARKS: readonly string[] = ['b', 'i', 'u', 's', 'sub', 'sup', 'hl', 'tc', 'fs', 'tf', 'a'];

// 문단 속성은 이 셋뿐이다.
// These three are the only paragraph attrs that exist.
export const CLEARED_ATTRS: readonly string[] = ['h', 'a', 'dc'];

// 벗길 수 있는 마크인가 — 첨부 링크만 불가침이다.
// Whether a mark may be stripped — an attachment link is the one exception.
function strippable(mark: ElementNode, env: EditEnv): boolean {
  if (!env.clearableMarks?.has(mark.w)) return false;
  return !(mark.w === 'a' && mark.a?.['file'] !== undefined);
}

// 래퍼문단은 정렬만 지키고 나머지 속성을 잃는다.
// A wrapper paragraph keeps only its align attr, losing the rest.
function withoutAttrs(node: ElementNode, wrapper: boolean, env: EditEnv): ElementNode {
  const a = node.a;
  if (!a) return node;
  const kept: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(a)) {
    const drop = env.clearableAttrs?.has(key) === true && !(wrapper && key === 'a');
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

// [from, to) 구간의 마크만 벗긴다 — 글자는 그대로, 껍데기만 진다.
// Strips marks over just [from, to) — the text survives, only the wrapping marks go.
function strippedHolder(holder: ElementNode, from: number, to: number, env: EditEnv): ElementNode {
  const runs = runsOf(holder, terminalOf(env));
  const inside = sliceRuns(runs, from, to);
  if (!inside.some((run) => run.marks.some((mark) => strippable(mark, env)))) return holder;
  const peeled = inside.map((run): Run =>
    run.kind === 'text'
      ? { kind: 'text', text: run.text, marks: run.marks.filter((mark) => !strippable(mark, env)) }
      : { kind: 'node', node: run.node, marks: run.marks.filter((mark) => !strippable(mark, env)) },
  );
  return withChildren(
    holder,
    fromRuns([...sliceRuns(runs, 0, from), ...peeled, ...sliceRuns(runs, to, Number.MAX_SAFE_INTEGER)]),
  );
}

// 걸친 홀더마다 마크를 벗기고, 걸친 문단마다 속성을 걷는다 — 한 번에 전부다.
// Strips marks on every holder the range touches, and attrs on every paragraph it touches, in one pass.
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
    // 속성은 문단의 것 — 인라인 홀더(접기 제목·코드)는 애초에 가진 적이 없다.
    // Attrs belong to paragraphs only — an inline holder (details' title, code) never had any.
    if (rebuilt.w === P) rebuilt = withoutAttrs(rebuilt, wrapper, env);
    if (rebuilt !== node) next = replaceAt(next, path, [rebuilt]);
  }
  return next;
}

// 접힌 캐럿에서는 가장 안쪽 마크를 그 연속 구간 전체로 벗기고, 벗길 마크가 없을 때만 문단 속성이 떨어진다.
// At a collapsed caret, the innermost mark is stripped over its whole run; paragraph attrs fall only once no mark remains.
function clearAtCaret(doc: NabiDoc, caret: Position, env: EditEnv): NabiDoc {
  const holder = nodeAt(doc, caret.path);
  if (!holder) return doc;
  if (!isWrapper(holder, env)) {
    const runs = runsOf(holder, terminalOf(env));
    // 경계에서는 앞쪽 런의 마크로 본다 — 막 친 글자가 그 마크 안에 든다.
    // At a boundary, the run before it wins — a just-typed character sits inside that mark.
    let acc = 0;
    let at = -1;
    for (let i = 0; i < runs.length; i += 1) {
      const run = runs[i] as Run;
      const size = run.kind === 'text' ? run.text.length : 1;
      if (caret.offset > acc && caret.offset <= acc + size) at = i;
      acc += size;
    }
    const target = at === -1 ? undefined : [...(runs[at] as Run).marks].reverse().find((mark) => strippable(mark, env));
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
  const bare = withoutAttrs(holder, isWrapper(holder, env), env);
  return bare === holder ? doc : replaceAt(doc, caret.path, [bare]);
}

const clearFormat: Command = (doc, sel, _args, env) => {
  if (isCollapsed(sel)) {
    const next = clearAtCaret(doc, sel.focus, env);
    return next === doc ? null : { doc: next, selection: sel };
  }
  const [start, end] = ordered(sel);
  const next = clearRange(doc, start, end, env);
  // 글자 수가 안 바뀌는 연산이라 자리는 그대로 유효하다.
  // Character counts never shift here, so the old selection stays valid.
  return next === doc ? null : { doc: next, selection: sel };
};

// Esc 두 번 = 이 단추와 같은 일 — 툴바 단추 말고는 담을 길이 없어 연타(doubleKeys)로 선언한다.
// Double-Escape does exactly what this button does — no shortcut/mod-key could carry the gesture, so it's a doubleKeys entry.
export const clearFormatWing: Wing = {
  w: 'clearFormat',
  place: 'tool',
  basic: true,
  commands: { clearFormat },
  doubleKeys: { Escape: 'clearFormat' },
  button: {
    group: 'clear',
    svg: CLEAR_ICON,
    label: CLEAR_NAME,
    action: { kind: 'command', command: 'clearFormat' },
  },
};
