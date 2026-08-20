// 코어 내장 커맨드 — doc 연산의 배선이다. wing 커맨드도 이 모양으로 같은 문(door)에 들어온다.
// 커맨드는 순수 함수이고, null 은 "안 한다"(거절·무의미)다 — 문에서 침묵으로 끝난다.
import {
  deleteBackward as docDeleteBackward,
  deleteForward as docDeleteForward,
  deleteRange as docDeleteRange,
  insertLine as docInsertLine,
  insertText as docInsertText,
  setMark as docSetMark,
  setParagraphAttr as docSetParagraphAttr,
  splitParagraph as docSplitParagraph,
  toggleMark as docToggleMark,
  type EditEnv,
  type EditResult,
  type Position,
} from '../doc/index.js';
import { caretAt, isCollapsed, ordered, type Selection } from '../caret/index.js';
import type { Attrs, AttrValue, ElementNode, NabiDoc } from '../schema/index.js';

export type CommandArgs = Readonly<Record<string, unknown>>;

export interface CommandOutcome {
  readonly doc: NabiDoc;
  readonly selection: Selection;
  // 접힌 캐럿에서 "이 마크를 예약해 달라"는 순수한 답 — 예약 자체는 문(door)이 한다 (①).
  // 값 검증을 아는 wing 커맨드가 자기 이름으로도 예약 갈래를 탈 수 있는 문이다 (08 인계).
  // 문이 이 답을 받드는 것은 **키보드 손일 때만이다** (084 ⑨) — 포인터 손이면 예약 대신
  // 거절(false) + toast 다. 커맨드는 손을 모른 채 사실만 답하면 된다.
  readonly arm?: ElementNode;
}

export type Command = (
  doc: NabiDoc,
  sel: Selection,
  args: CommandArgs,
  env: EditEnv,
) => CommandOutcome | null;

// EditResult → 선택. anchor 가 실리면 범위를 남기는 연산(마크)이다.
function outcome(r: EditResult): CommandOutcome {
  return {
    doc: r.doc,
    selection: r.anchor ? { anchor: r.anchor, focus: r.caret } : caretAt(r.caret),
  };
}

// 범위가 있으면 먼저 지운다 — 타이핑·엔터가 선택을 덮어쓰는 표준 동작.
function collapsedAt(
  doc: NabiDoc,
  sel: Selection,
  env: EditEnv,
): { readonly doc: NabiDoc; readonly caret: Position } {
  if (isCollapsed(sel)) return { doc, caret: sel.focus };
  const [start, end] = ordered(sel);
  const r = docDeleteRange(doc, { anchor: start, focus: end }, env);
  return { doc: r.doc, caret: r.caret };
}

// args 에서 마크 노드 하나를 꺼낸다 — 모양이 아니면 null.
export function markArg(args: CommandArgs): ElementNode | null {
  const mark = args['mark'];
  if (mark === null || typeof mark !== 'object' || Array.isArray(mark)) return null;
  const node = mark as { readonly w?: unknown; readonly ch?: unknown };
  if (typeof node.w !== 'string' || !Array.isArray(node.ch)) return null;
  return mark as ElementNode;
}

// args 에서 attrs 를 꺼낸다 — null 은 "벗긴다", 모양이 아니면 undefined(거절).
export function attrsArg(args: CommandArgs): Attrs | null | undefined {
  const a = args['a'];
  if (a === null) return null;
  if (typeof a !== 'object' || Array.isArray(a)) return undefined;
  return a as Attrs;
}

export function coreCommands(): Readonly<Record<string, Command>> {
  return {
    // 글자 삽입 — marks 는 문(door)이 경계 정규화 + 예약 소비로 채워 넣는다.
    insertText(doc, sel, args, env) {
      const text = args['text'];
      if (typeof text !== 'string' || text === '') return null;
      const marks = args['marks'] as readonly ElementNode[] | undefined;
      const base = collapsedAt(doc, sel, env);
      return outcome(docInsertText(base.doc, base.caret, text, env, marks));
    },

    // 라인 삽입 (Shift+Enter) — 마크는 앞 글자를 잇는다.
    insertLine(doc, sel, _args, env) {
      const base = collapsedAt(doc, sel, env);
      return outcome(docInsertLine(base.doc, base.caret, env));
    },

    // 문단 분할 (엔터) — §2.4 표 전 행은 doc 연산이 안다.
    splitParagraph(doc, sel, _args, env) {
      const base = collapsedAt(doc, sel, env);
      return outcome(docSplitParagraph(base.doc, base.caret, env));
    },

    // 삭제 — 범위면 범위 삭제, 접힘이면 방향 규칙 (§2.5).
    deleteBackward(doc, sel, _args, env) {
      if (!isCollapsed(sel)) {
        const [start, end] = ordered(sel);
        return outcome(docDeleteRange(doc, { anchor: start, focus: end }, env));
      }
      return outcome(docDeleteBackward(doc, sel.focus, env));
    },

    deleteForward(doc, sel, _args, env) {
      if (!isCollapsed(sel)) {
        const [start, end] = ordered(sel);
        return outcome(docDeleteRange(doc, { anchor: start, focus: end }, env));
      }
      return outcome(docDeleteForward(doc, sel.focus, env));
    },

    deleteRange(doc, sel, _args, env) {
      if (isCollapsed(sel)) return null;
      const [start, end] = ordered(sel);
      return outcome(docDeleteRange(doc, { anchor: start, focus: end }, env));
    },

    // 마크 토글 — 접힌 캐럿은 문(door)의 예약 갈래가 먼저 받는다. 여기 닿으면 무의미.
    toggleMark(doc, sel, args, env) {
      const mark = markArg(args);
      if (!mark || isCollapsed(sel)) return null;
      return outcome(docToggleMark(doc, { anchor: sel.anchor, focus: sel.focus }, mark, env));
    },

    // 값 마크 — a 를 주면 교체하며 입히고, null 이면 벗긴다. 접힌 캐럿은 예약 갈래 몫.
    setMark(doc, sel, args, env) {
      const w = args['w'];
      const a = attrsArg(args);
      if (typeof w !== 'string' || a === undefined || isCollapsed(sel)) return null;
      return outcome(docSetMark(doc, { anchor: sel.anchor, focus: sel.focus }, w, a, env));
    },

    // 문단 속성 — 접힌 캐럿은 자기 문단 하나를 겨눈다 (doc 연산이 안다).
    setParagraphAttr(doc, sel, args, env) {
      const key = args['key'];
      const value = args['value'];
      if (typeof key !== 'string') return null;
      if (value !== null && typeof value !== 'string' && typeof value !== 'number') return null;
      return outcome(
        docSetParagraphAttr(doc, { anchor: sel.anchor, focus: sel.focus }, key, value as AttrValue | null, env),
      );
    },
  };
}
