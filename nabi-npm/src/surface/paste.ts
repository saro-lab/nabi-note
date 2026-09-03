// 붙여넣기 정책만 산다(DOM은 mount 몫이라 테스트가 그대로 잡는다). 규칙: 후보 0=파일 처리, 1=안 묻고 바로, 2+=판을 띄운다(ui의 $ask.choose를 문 하나로 지난다). 판이 뜬 사이 문서가 바뀌면 아무것도 안 붙인다(엉뚱한 자리보다 낫다). custom MIME(v1)을 먼저 검증하고, 실패하면 HTML→평문 순으로 fallback한다
// Holds only paste policy (DOM handling is mount's job, so this stays testable without one). Rules: 0 candidates means files; 1 skips the prompt; 2+ opens a menu (calling ui's $ask.choose through one door). If the document changes while the menu is open, nothing gets pasted (safer than landing in the wrong place). The custom MIME (v1) is validated and tried first, falling back to HTML then plain text
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
  // 이미 순서가 정해져 온다 — 호스트 → wing → 내장 html → 내장 md
  // Arrives already ordered: host -> wing -> built-in html -> built-in md
  readonly filters: readonly IoFilter[];
  // 판이 쓸 말 — 값이 바뀔 수 있어 함수로 받는다
  // The menu's language; a function since the current value can change
  readonly locale: () => string;
  // 글자가 하나도 없는 붙여넣기의 마지막 처리기(업로드)
  // The last-resort handler (upload) for a paste with no text candidates at all
  readonly fileSink?: (files: readonly File[]) => void;
}

// 이름 하나 고르기 — 사전 키(내장)든 다국어 레코드(호스트·wing)든 같은 문을 지난다. 사전에 없는 키는 그대로 나온다(폴백) — 호스트가 준 맨 글자도 그래서 산다
// Resolves one label, whether it's a dictionary key (built-in) or a multi-locale record (host/wing); a key missing from the dictionary passes through unchanged (fallback), which is also how a host's raw text survives
export function pickLabel(label: LocaleText | string, locale: string): string {
  if (typeof label === 'string') return translate(label, locale);
  const code = localeOf(locale);
  return label[code] ?? label['en'] ?? '';
}

// 조각의 맨 글자 — 한 줄짜리 후보를 캐럿에 이어 쓸 때 쓴다
// Plain text of a fragment, used to splice a single-line candidate right at the caret
function textOf(node: NabiNode): string {
  if (typeof node === 'string') return node;
  return isElement(node) ? node.ch.map(textOf).join('') : '';
}

export function makePasteFlow(
  options: PasteFlowOptions,
): (data: PasteData, files: readonly File[], target?: Selection) => boolean {
  const { nabi } = options;
  const env = hostOf(nabi).env;

  // 후보 하나를 실제로 붙인다
  // Actually pastes one candidate
  const put = (candidate: PasteCandidate, target?: Selection): boolean => {
    const built = $guarded(`paste candidate ${candidate.id}`, null, () => $snapshotNodes(candidate.build()));
    if (!built) return false;
    const chosen = target ?? nabi.getSelection();
    if (!selectionExists(hostOf(nabi).doc(), chosen, env)) return false;
    if (candidate.inline === true) {
      // 한 줄짜리 맨 글자는 문단을 안 쪼갠다 — 캐럿에 이어 쓰는 것이 그 뜻이다
      // A single-line plain-text candidate never splits the paragraph; it's meant to be spliced right at the caret
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
    // 조각도 문서의 불변식을 입고 들어온다 — 래퍼 입히기·쪼개기는 cocoon이 한다
    // The fragment must also satisfy the document's invariants; wrapping and splitting are cocoon's job
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
    // 글자가 아예 없을 때만 파일로 다룬다 — 엑셀 표는 그림이 아니라 표로 온다
    // Only treated as a file when there's no text candidate at all; an Excel table arrives as a table, not an image
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
    // 판이 뜨는 동안의 선택은 값으로 떠 둔다 — 답이 올 때 캐럿은 다른 곳에 있을 수 있다
    // The selection is captured as a value while the menu is open, since the caret may have moved elsewhere by the time an answer arrives
    const kept = target ?? nabi.getSelection();
    let stale = false;
    const stopRevision = nabi.onChange((change) => {
      if (change.doc) stale = true;
    });
    const question = translate('io.title', locale);
    // 판이 받는 것은 이름과 그림 한 쌍이다 — 그림 없는 후보(호스트 필터)는 이름만 든다
    // The menu receives a label/icon pair; a candidate with no icon (a host filter) carries only the label
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
        // -1·범위 밖 = 취소(Esc)
        // -1 or out of range means cancelled (Esc)
        const chosen = candidates[at];
        if (!chosen) return;
        if (!selectionExists(hostOf(nabi).doc(), kept, env)) return;
        put(chosen, kept);
      },
      () => stopRevision(),
    );
    return true;
  };
}
