// 오토포맷 디스패처 — wing의 inputRules를 스페이스·엔터 순간에 돌린다(011). 스페이스는 reconcile이 이미 트리에 넣은 뒤라 scanTo가 캐럿을 한 글자 물려 스캔한다
// Autoformat dispatcher; runs each wing's inputRules on space/enter (011). Space triggers scan one character behind the caret (scanTo), since reconcile has already inserted it into the tree
import { P, isWrapper, runsOf, type ElementNode, type Terminal } from '../schema/index.js';
import { nodeAt, sliceRuns, terminalOf } from '../doc/index.js';
import { caretAt, isCollapsed } from '../caret/index.js';
import { hostOf, type Nabi } from '../editor/index.js';
import type { Registry } from '../wing/index.js';
import { holderTextOf } from './text.js';

function wordStartOf(text: string, at: number): number {
  let start = at;
  while (start > 0 && !/\s/.test(text[start - 1] as string)) start -= 1;
  return start;
}

// 규칙이 만들 결과가 이미 서 있으면 다시 안 뜬다 — 링크가 된 URL은 여전히 URL 패턴에 맞아, 이 검사가 없으면 그 뒤 엔터를 계속 가로챈다
// Skips a rule whose result already exists; a URL already turned into a link still matches the URL pattern, so without this check every later Enter would be intercepted again
function alreadyMarked(holder: ElementNode, from: number, to: number, w: string, terminal: Terminal): boolean {
  const runs = sliceRuns(runsOf(holder, terminal), from, to);
  const texts = runs.filter((run) => run.kind === 'text');
  return texts.length > 0 && texts.every((run) => run.marks.some((mark) => mark.w === w));
}

export function tryInputRule(nabi: Nabi, registry: Registry, trigger: 'space' | 'enter'): boolean {
  const env = hostOf(nabi).env;
  const doc = hostOf(nabi).doc();
  const sel = nabi.getSelection();
  if (!isCollapsed(sel)) return false;
  const focus = sel.focus;
  const holder = nodeAt(doc, focus.path);
  // 규칙은 글 문단에서만 뜬다 — 코드·제목칸(inlineHolder)과 래퍼문단은 대상이 아니다
  // Rules only fire in text paragraphs; code/heading holders (inline) and wrapper paragraphs are excluded
  if (!holder || holder.w !== P || isWrapper(holder, env)) return false;

  const terminal = terminalOf(env);
  const text = holderTextOf(holder, terminal);
  const scanTo = trigger === 'space' ? focus.offset - 1 : focus.offset;
  if (scanTo < 0 || scanTo > text.length) return false;
  const prefix = text.slice(0, scanTo);
  // \n 뒤는 문단의 첫 줄이 아니다 — 블록 규칙은 첫 줄에서만 뜬다
  // Text after a \n isn't the paragraph's first line; block rules only fire on the first line
  const lineStart = prefix.lastIndexOf('\n') + 1;
  const blockPrefix = lineStart === 0 ? prefix : '';
  const wordStart = wordStartOf(text, scanTo);
  const word = text.slice(wordStart, scanTo);

  for (const rule of registry.inputRules) {
    if (rule.trigger !== trigger) continue;
    const candidate = rule.scope === 'word' ? word : blockPrefix;
    if (candidate === '') continue;
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    try {
      match = rule.pattern.exec(candidate);
    } finally {
      rule.pattern.lastIndex = 0;
    }
    if (!match) continue;
    const target = rule.run(match);

    if (rule.scope === 'word') {
      if (alreadyMarked(holder, wordStart, scanTo, rule.w, terminal)) continue;
      const back = caretAt(focus);
      let done = false;
      nabi.group(() => {
        nabi.select({
          anchor: { path: focus.path, offset: wordStart },
          focus: { path: focus.path, offset: scanTo },
        });
        done = nabi.applyCommand(target.name, target.args ?? {});
      });
      // 마크는 문단을 갈아 끼우지 않으므로 캐럿을 트리거 뒤 제자리로 되돌린다
      // A mark doesn't replace the paragraph, so the caret is restored to its place right after the trigger
      nabi.select(back);
      if (done) return true;
      continue;
    }

    let done = false;
    nabi.group(() => {
      // 규격 글자를 걷는다 — 스페이스 트리거면 그 스페이스까지 함께 지운다
      // Removes the matched prefix; a space trigger also removes that trailing space
      const to = trigger === 'space' ? scanTo + 1 : scanTo;
      if (to > 0) {
        nabi.select({
          anchor: { path: focus.path, offset: 0 },
          focus: { path: focus.path, offset: to },
        });
        nabi.applyCommand('deleteRange');
      }
      done = nabi.applyCommand(target.name, target.args ?? {});
    });
    if (done) return true;
    // 변환이 거절됐다 — 걷은 규격 글자를 undo 한 걸음으로 되돌리고 다음 규칙을 본다
    // The transform was rejected; undo the removed prefix as one step and try the next rule
    nabi.undo();
    nabi.select(caretAt(focus));
  }
  return false;
}
