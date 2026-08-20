// 오토포맷 디스패처 — wing 의 inputRules 선언을 스페이스·엔터 순간에 돌린다 (옛 011 규격표).
// 스페이스 트리거의 함정: 그 스페이스는 되맞추기가 **이미 트리에 넣은 뒤**다 — 훑는 캐럿을
// 한 글자 물린다(scanTo). 규격 글자(맞은 앞부분 + 트리거 스페이스)는 wing 이 보기 전에 걷고
// 전체가 undo 한 걸음(group)이다.
import { P, isWrapper, runsOf, type ElementNode, type Terminal } from '../schema/index.js';
import { nodeAt, sliceRuns, terminalOf } from '../doc/index.js';
import { caretAt, isCollapsed } from '../caret/index.js';
import type { Nabi } from '../editor/index.js';
import type { Registry } from '../wing/index.js';
import { holderTextOf } from './text.js';

function wordStartOf(text: string, at: number): number {
  let start = at;
  while (start > 0 && !/\s/.test(text[start - 1] as string)) start -= 1;
  return start;
}

// 규칙이 만들 결과가 이미 서 있으면 다시 안 뜬다 — 맨 URL 로 만든 링크의 글자는 여전히
// URL 패턴에 맞아, 이 검사가 없으면 그 끝의 엔터를 영영 가로챈다 (옛 판의 교훈).
function alreadyMarked(
  holder: ElementNode,
  from: number,
  to: number,
  w: string,
  terminal: Terminal,
): boolean {
  const runs = sliceRuns(runsOf(holder, terminal), from, to);
  const texts = runs.filter((run) => run.kind === 'text');
  return texts.length > 0 && texts.every((run) => run.marks.some((mark) => mark.w === w));
}

export function tryInputRule(nabi: Nabi, registry: Registry, trigger: 'space' | 'enter'): boolean {
  const env = nabi.$env;
  const doc = nabi.$doc();
  const sel = nabi.getSelection();
  if (!isCollapsed(sel)) return false;
  const focus = sel.focus;
  const holder = nodeAt(doc, focus.path);
  // 규칙은 글 문단에서만 뜬다 — 코드·제목칸(inlineHolder)과 래퍼문단은 자리가 아니다.
  if (!holder || holder.w !== P || isWrapper(holder, env)) return false;

  const terminal = terminalOf(env);
  const text = holderTextOf(holder, terminal);
  const scanTo = trigger === 'space' ? focus.offset - 1 : focus.offset;
  if (scanTo < 0 || scanTo > text.length) return false;
  const prefix = text.slice(0, scanTo);
  // 라인(\n) 뒤는 문단의 첫 줄이 아니다 — 블록 규칙은 첫 줄에서만 뜬다.
  const lineStart = prefix.lastIndexOf('\n') + 1;
  const blockPrefix = lineStart === 0 ? prefix : '';
  const wordStart = wordStartOf(text, scanTo);
  const word = text.slice(wordStart, scanTo);

  for (const rule of registry.inputRules) {
    if (rule.trigger !== trigger) continue;
    const candidate = rule.scope === 'word' ? word : blockPrefix;
    if (candidate === '') continue;
    const match = rule.pattern.exec(candidate);
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
      // 마크는 문단을 갈아 끼우지 않으므로 캐럿이 제자리(트리거 뒤)로 돌아온다.
      nabi.select(back);
      if (done) return true;
      continue;
    }

    let done = false;
    nabi.group(() => {
      // 규격 글자를 걷는다 — 스페이스 트리거면 그 스페이스까지 함께.
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
    // 변환이 거절됐다 — 걷은 규격 글자를 undo 한 걸음으로 되돌리고 다음 규칙을 본다.
    nabi.undo();
    nabi.select(caretAt(focus));
  }
  return false;
}
