// 붙여넣기 한 걸음 — **정책만** 산다. 이벤트에서 값을 뜨는 것은 mount 의 일이고(clipboardData 는
// 동기 구간 밖에서 죽는다), 여기서 도는 것은 DOM 없는 판정이라 그물이 그대로 잡는다.
//
// 규칙 넷:
//   1. 후보가 0 이면 글자가 아예 없었다는 뜻이다 — **파일은 마지막 처리기**가 받는다.
//   2. 후보가 하나면 묻지 않는다.
//   3. 둘 이상이면 판이 뜬다(`$ask.choose`). 판은 ui 의 것이라 이 층이 직접 못 띄운다 —
//      묻는 문 하나만 지난다.
//   4. 판이 뜬 사이에 문서가 바뀔 수 있다(업로드 커밋·다른 탭의 복원). 떠 둔 선택이 그때까지
//      살아 있지 않으면 **아무것도 안 붙인다** — 엉뚱한 자리에 붙는 것보다 낫다.
//   5. **방금 나비에서 복사·잘라내기 한 것이면 안 묻는다** — 규칙 셋보다 앞선다. 제 집 글을
//      되붙이는 걸음에 형식을 고를 까닭이 없다(260823_007). 기억은 `clip.ts` 의 전역 하나다.
import { cocoon, isElement, type NabiNode } from '../schema/index.js';
import { isCollapsed, selectionExists } from '../caret/index.js';
import { fragmentOf } from '../html/index.js';
import { TEXT_ICON, TEXT_LABEL, collectCandidates, type IoFilter, type PasteCandidate, type PasteData } from '../io/index.js';
import { localeOf, translate, type LocaleText } from '../locale/index.js';
import type { ChooseOption, Nabi } from '../editor/index.js';
import { clipMemory, sameClip } from './clip.js';
import { insertFragmentOp } from './fragment.js';

export interface PasteFlowOptions {
  readonly nabi: Nabi;
  // 이미 순서가 정해져 온다 — 호스트 → wing → 내장 html → 내장 md.
  readonly filters: readonly IoFilter[];
  // 판이 쓸 말 — 걸린 값이 바뀔 수 있어 함수다.
  readonly locale: () => string;
  // 글자가 하나도 없는 붙여넣기의 마지막 처리기 (업로드).
  readonly fileSink?: (files: readonly File[]) => void;
}

// 이름 하나 고르기 — 사전 키(내장)든 다국어 레코드(호스트·wing)든 같은 문을 지난다.
// 키가 사전에 없으면 그 키가 그대로 나온다(폴백 규칙) — 호스트가 든 맨 글자도 그래서 산다.
export function pickLabel(label: LocaleText | string, locale: string): string {
  if (typeof label === 'string') return translate(label, locale);
  const code = localeOf(locale);
  return label[code] ?? label['en'] ?? '';
}

// 조각의 맨 글자 — 한 줄짜리 후보를 캐럿에 이어 쓸 때 쓴다.
function textOf(node: NabiNode): string {
  if (typeof node === 'string') return node;
  return isElement(node) ? node.ch.map(textOf).join('') : '';
}

export function makePasteFlow(options: PasteFlowOptions): (data: PasteData, files: readonly File[]) => void {
  const { nabi } = options;
  const env = nabi.$env;

  // 후보 하나를 실제로 붙인다 — 옛 onPaste 의 마지막 세 줄이 그대로 여기다.
  const put = (candidate: PasteCandidate): void => {
    if (candidate.inline === true) {
      // 한 줄짜리 맨 글자는 문단을 안 쪼갠다 — 캐럿에 이어 쓰는 것이 그 손의 뜻이다.
      const text = candidate.build().map(textOf).join('');
      if (text !== '') nabi.applyCommand('insertText', { text });
      return;
    }
    // 조각도 문서의 불변식을 입고 들어온다 — 래퍼 입히기·쪼개기는 cocoon 의 것이다.
    const fragment = fragmentOf(cocoon([...candidate.build()], env));
    if (fragment.length === 0) return;
    nabi.group(() => {
      if (!isCollapsed(nabi.getSelection())) nabi.applyCommand('deleteRange');
      nabi.$applyRaw(insertFragmentOp(fragment), 'insertFragment');
    });
  };

  return (data, files) => {
    const locale = options.locale();
    const candidates = collectCandidates(data, {
      filters: options.filters,
      textLabel: TEXT_LABEL,
      textIcon: TEXT_ICON,
    });
    // 글자가 아예 없다 — 그때만 파일이다 (엑셀의 표는 그림이 아니라 표다).
    if (candidates.length === 0) {
      if (files.length > 0) options.fileSink?.(files);
      return;
    }
    // 나비가 방금 낸 조각이 그대로 돌아왔다 — 후보를 세지 않고 html 로 바로 붙인다.
    // 후보 수집 뒤에 서는 까닭은 지름길이 **기존 파이프라인의 후보 하나**를 그대로 쓰기
    // 때문이다: 짓는 법도 붙이는 법도 갈라지지 않는다. html 필터가 안 섰으면(파서 없음)
    // 찾을 것이 없어 그대로 아래로 흘러간다.
    if (data.html !== '' && sameClip(clipMemory(), data.html)) {
      const own = candidates.find((candidate) => candidate.id === 'html');
      if (own) {
        put(own);
        return;
      }
    }
    if (candidates.length === 1) {
      put(candidates[0] as PasteCandidate);
      return;
    }
    // 판이 뜨는 동안의 선택은 **값으로 떠 둔다** — 답이 올 때 캐럿은 다른 곳에 있을 수 있다.
    const kept = nabi.getSelection();
    const question = translate('io.title', locale);
    // 판이 받는 것은 이름과 그림 한 쌍이다 — 그림 없는 후보(호스트 필터)는 이름만 든다.
    const choices: readonly ChooseOption[] = candidates.map((candidate) => ({
      label: pickLabel(candidate.label, locale),
      ...(candidate.icon === undefined ? {} : { icon: candidate.icon }),
    }));
    void Promise.resolve(nabi.$ask.choose?.(question, choices) ?? 0).then((at) => {
      const chosen = candidates[at]; // -1·범위 밖 = 취소(Esc)
      if (!chosen) return;
      if (!selectionExists(nabi.$doc(), kept, env)) return;
      nabi.select(kept);
      put(chosen);
    });
  };
}
