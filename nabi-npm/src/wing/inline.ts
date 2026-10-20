// 인라인 단말 표식 — 공개 place를 늘리지 않고 패키지 공식 wing만 글자 사이 단말을 세운다(각주).
// Inline-terminal marker: without widening the public `place`, only official package wings may erect terminals between characters (footnotes).
import { $isBuiltinWing } from '../schema/env.js';
import type { HtmlAppendix } from '../html/index.js';
import type { MdAppendix } from '../io/index.js';
import type { Wing } from './contract.js';

export interface InlineTerminalDecl {
  readonly appendix?: HtmlAppendix;
  readonly mdAppendix?: MdAppendix;
}

const INLINE_TERMINAL = Symbol('nabi.inlineTerminal');

// 펼침 복제(`{ ...wing }`)에도 따라가도록 열거 가능한 심볼로 단다 — 공식 wing 표식과 같은 규칙이다.
// Attached as an enumerable symbol so spread clones (`{ ...wing }`) carry it, the same rule as the official-wing marker.
export function $markInlineTerminal(wing: Wing, decl: InlineTerminalDecl = {}): void {
  Object.defineProperty(wing, INLINE_TERMINAL, {
    value: Object.freeze({ ...decl }),
    enumerable: true,
    configurable: true,
  });
}

export function $inlineTerminalOf(wing: Wing): InlineTerminalDecl | undefined {
  if (wing.place !== 'void' || !$isBuiltinWing(wing)) return undefined;
  return (wing as { readonly [INLINE_TERMINAL]?: InlineTerminalDecl })[INLINE_TERMINAL];
}
