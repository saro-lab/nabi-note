// 붙여넣기 한 걸음 — **정책만** 산다. 이벤트에서 값을 뜨는 것은 mount 의 일이고(clipboardData 는
// 동기 구간 밖에서 죽는다), 여기서 도는 것은 DOM 없는 판정이라 그물이 그대로 잡는다.
//
// 규칙:
//   1. 후보가 0 이면 글자가 아예 없었다는 뜻이다 — **파일은 마지막 처리기**가 받는다.
//   2. 후보가 하나면 묻지 않는다.
//   3. 둘 이상이면 판이 뜬다(`$ask.choose`). 판은 ui 의 것이라 이 층이 직접 못 띄운다 —
//      묻는 문 하나만 지난다.
//   4. 판이 뜬 사이에 문서가 바뀔 수 있다(업로드 커밋·다른 탭의 복원). 떠 둔 선택이 그때까지
//      살아 있지 않으면 **아무것도 안 붙인다** — 엉뚱한 자리에 붙는 것보다 낫다.
//   5. version 1 custom MIME은 곧장 검증해 먼저 쓰고, 실패하면 package의 안전한 HTML, 평문
//      순서로 떨어진다. 이 고정 fallback에는 판도 process-wide 복사 기억도 없다.
import { $fromJson, cocoon, isElement, type NabiNode } from '../schema/index.js';
import { $guarded, $ownDataArray, $ownDataObject, $snapshotNodes } from '../schema/json.js';
import { caretAt, isCollapsed, marksAt, ordered, selectionExists, type Selection } from '../caret/index.js';
import { deleteRange } from '../doc/index.js';
import { fragmentOf } from '../html/index.js';
import {
  $isBuiltinHtmlFilter,
  TEXT_ICON,
  TEXT_LABEL,
  collectCandidates,
  textCandidate,
  type IoFilter,
  type PasteCandidate,
  type PasteData,
} from '../io/index.js';
import { localeOf, translate, type LocaleText } from '../locale/index.js';
import { coreCommands, hostOf, type ChooseOption, type Nabi } from '../editor/index.js';
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

export function makePasteFlow(
  options: PasteFlowOptions,
): (data: PasteData, files: readonly File[], target?: Selection) => boolean {
  const { nabi } = options;
  const env = hostOf(nabi).env;

  // 후보 하나를 실제로 붙인다 — 옛 onPaste 의 마지막 세 줄이 그대로 여기다.
  const put = (candidate: PasteCandidate, target?: Selection): boolean => {
    const built = $guarded(`paste candidate ${candidate.id}`, null, () => $snapshotNodes(candidate.build()));
    if (!built) return false;
    const chosen = target ?? nabi.getSelection();
    if (!selectionExists(hostOf(nabi).doc(), chosen, env)) return false;
    if (candidate.inline === true) {
      // 한 줄짜리 맨 글자는 문단을 안 쪼갠다 — 캐럿에 이어 쓰는 것이 그 손의 뜻이다.
      const text = built.map(textOf).join('');
      if (text === '') return false;
      const insertText = coreCommands()['insertText'];
      return (
        insertText !== undefined &&
        hostOf(nabi).applyRaw((doc, _selection, _args, editEnv) => {
          const [start] = ordered(chosen);
          return insertText(doc, chosen, { text, marks: marksAt(doc, start, editEnv) }, editEnv);
        }, 'insertFragment')
      );
    }
    // 조각도 문서의 불변식을 입고 들어온다 — 래퍼 입히기·쪼개기는 cocoon 의 것이다.
    const fragment = $guarded(`paste candidate ${candidate.id} normalize`, null, () => fragmentOf(cocoon(built, env)));
    if (!fragment || fragment.length === 0) return false;
    const insert = insertFragmentOp(fragment);
    return hostOf(nabi).applyRaw((doc, _selection, args, editEnv) => {
      const selection = chosen;
      if (isCollapsed(selection)) return insert(doc, selection, args, editEnv);
      const [start, end] = ordered(selection);
      const deleted = deleteRange(doc, { anchor: start, focus: end }, editEnv);
      return insert(deleted.doc, caretAt(deleted.caret), args, editEnv);
    }, 'insertFragment');
  };

  const customCandidate = (text: string): PasteCandidate | null => {
    if (text === '') return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return null;
    }
    const envelope = $ownDataObject(parsed);
    if (!envelope || Object.keys(envelope).some((key) => key !== 'version' && key !== 'body')) return null;
    if (envelope['version']?.value !== 1) return null;
    const body = $ownDataArray(envelope['body']?.value);
    if (!body) return null;
    const normalized = $guarded('clipboard custom body', null, () => $fromJson(body, env));
    if (!normalized) return null;
    const fragment = fragmentOf(normalized);
    return { id: 'nabi', label: 'nabi', build: () => fragment };
  };

  return (data, files, target) => {
    const internal = customCandidate(data.custom);
    if (internal && put(internal, target)) return true;

    if (data.html !== '') {
      const filter = options.filters.find($isBuiltinHtmlFilter);
      const candidate = $guarded('clipboard HTML candidate', null, () => filter?.paste?.(data) ?? null);
      if (candidate && !Array.isArray(candidate) && put(candidate as PasteCandidate, target)) return true;
      if (data.plain !== '') return put(textCandidate(data.plain, TEXT_LABEL, TEXT_ICON), target);
      return false;
    }

    if (data.custom !== '' && data.plain !== '') {
      return put(textCandidate(data.plain, TEXT_LABEL, TEXT_ICON), target);
    }
    const locale = options.locale();
    const candidates = collectCandidates(data, {
      filters: options.filters,
      textLabel: TEXT_LABEL,
      textIcon: TEXT_ICON,
    });
    // 글자가 아예 없다 — 그때만 파일이다 (엑셀의 표는 그림이 아니라 표다).
    if (candidates.length === 0) {
      if (files.length === 0 || !options.fileSink) return false;
      const before = nabi.getSelection();
      const atTarget =
        !target ||
        (target.anchor.offset === before.anchor.offset &&
          target.focus.offset === before.focus.offset &&
          target.anchor.path.length === before.anchor.path.length &&
          target.focus.path.length === before.focus.path.length &&
          target.anchor.path.every((value, index) => value === before.anchor.path[index]) &&
          target.focus.path.every((value, index) => value === before.focus.path[index]));
      if (target && !atTarget && !nabi.select(target)) return false;
      try {
        options.fileSink(files);
        return true;
      } catch {
        if (target) nabi.select(before);
        return false;
      }
    }
    if (candidates.length === 1) {
      return put(candidates[0] as PasteCandidate, target);
    }
    // 판이 뜨는 동안의 선택은 **값으로 떠 둔다** — 답이 올 때 캐럿은 다른 곳에 있을 수 있다.
    const kept = target ?? nabi.getSelection();
    let stale = false;
    const stopRevision = nabi.onChange((change) => {
      if (change.doc) stale = true;
    });
    const question = translate('io.title', locale);
    // 판이 받는 것은 이름과 그림 한 쌍이다 — 그림 없는 후보(호스트 필터)는 이름만 든다.
    const choices: readonly ChooseOption[] = candidates.map((candidate) => ({
      label: pickLabel(candidate.label, locale),
      ...(candidate.icon === undefined ? {} : { icon: candidate.icon }),
    }));
    void Promise.resolve(hostOf(nabi).ask.choose?.(question, choices) ?? 0).then(
      (at) => {
        stopRevision();
        if (stale) {
          hostOf(nabi).toast('warn', translate('paste.changed', locale));
          return;
        }
        const chosen = candidates[at]; // -1·범위 밖 = 취소(Esc)
        if (!chosen) return;
        if (!selectionExists(hostOf(nabi).doc(), kept, env)) return;
        put(chosen, kept);
      },
      () => stopRevision(),
    );
    return true;
  };
}
