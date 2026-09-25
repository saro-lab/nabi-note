import { Translations } from './parts/translation.js';
import type { LocaleInput } from '../locale/index.js';
import { iconHtml } from '../style/icon.js';
// 저장소가 막힌 곳(file://·사생활 보호 모드)에서는 판 대신 toast로 이유를 알린다 — 반환값이 null일 수 있다는 뜻이다.
// Where storage is blocked (file://, private browsing) this shows a toast instead of a panel — meaning the return value can be null.
import type { HistoryMount } from '../surface/index.js';
import { exactTime, historyView, showsCreated, type HistoryRecord } from '../wings/local-history/local-history.js';
import { localeDirection, localeValue, makeTranslator, type Translator } from '../locale/index.js';
import { make } from './parts/dom.js';
import { openScrim, type Scrim } from './parts/scrim.js';
import type { Overlay } from './overlay.js';

export interface HistoryPanelOptions {
  readonly history: HistoryMount;
  // 겨눔이 돌아갈 자리 — 닫으면 여기로 포커스가 간다.
  // Focus returns here when the panel closes.
  readonly surface: HTMLElement;
  // 말과 날짜 차림을 함께 정한다 — 사전은 언어만 보지만 시각은 지역까지 본다(en-GB는 18/08/2026, en-US는 08/18/2026). 그래서 깎지 않은 값을 받는다.
  // Drives both language and date formatting — the dict resolves language only, while the date format needs the full region (en-GB writes 18/08/2026, en-US 08/18/2026), so this takes the raw, unresolved value.
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
  // 한 줄의 미리보기를 그릴 때 쓰는 조립 — 기록의 JSON을 보기 HTML로 바꾼다.
  // Renders a one-row preview — turns a record's JSON into display HTML.
  readonly render: (record: HistoryRecord) => string;
  // 지금 편집 중인 줄을 가려낸다 — 그 줄은 "현재 세션"으로 표시하고 되살리기를 안 시킨다.
  // Marks the currently-open record as "current session" and disables restoring it.
  readonly sessionId?: string;
}

// 막힌 저장소를 알리는 toast가 사는 시간 — 기본 1초로는 두 줄짜리 안내(왜 안 되는지 + 무엇을 하면 되는지)를 못 읽는다.
// How long the storage-blocked toast stays up — the default 1s isn't enough to read a two-line message (what's wrong plus what to do about it).
const BLOCKED_MS = 6000;

// 얼마 전인가 — 사람이 읽는 단위 하나로만 말한다("20분 전"). 정확한 시각은 이름표가 든다.
// How long ago, in one human unit ("20 minutes ago"); the exact time lives in the tooltip.
function ago(t: Translator, from: number, now: number): string {
  const sec = Math.max(0, Math.round((now - from) / 1000));
  if (sec < 60) return t.t('history.now');
  const min = Math.round(sec / 60);
  if (min < 60) return t.t('history.minutes', { n: min });
  const hour = Math.round(min / 60);
  if (hour < 24) return t.t('history.hours', { n: hour });
  return t.t('history.days', { n: Math.round(hour / 24) });
}

export function openHistoryPanel(options: HistoryPanelOptions): Overlay | null {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  // 날짜 표기는 t.locale이 아니라 호스트가 준 지역을 그대로 따른다.
  // Date formatting follows the host's raw locale, not the dict's resolved t.locale.
  const stamp = (): string => (options.locale === undefined ? t.locale : localeValue(options.locale));
  const copy = new Translations(t);
  const rowsCopy = new Translations(t);
  const now = Date.now();

  // 저장소가 막힌 것은 사람이 단추를 누른 이 순간에만 말한다 — 백단(자동 스냅샷)은 조용히 넘긴다. 글 치는 내내 반복되는 알림은 알림이 아니라 방해다.
  // A blocked-storage message only fires on a user's button press — background autosaves swallow it silently, since repeating the same warning on every keystroke would be noise, not a notice.
  if (historyView(options.history.alive(), options.history.list()) === 'blocked') {
    options.history.toast('warn', t.t('history.blocked'), BLOCKED_MS);
    return null;
  }

  const card = make(owner, 'div', 'nabi-card nabi-history', {
    tabindex: '-1',
    'aria-label': t.t('history.title'),
    dir: localeDirection(t.locale),
  });
  const head = make(owner, 'div', 'nabi-history-head');
  const title = make(owner, 'div', 'nabi-history-title');
  title.textContent = t.t('history.title');
  head.append(title);

  const list = make(owner, 'div', 'nabi-history-list');
  card.append(head, list);

  let disposed = false;
  let scrim: Scrim | null = null;
  let preview: Scrim | null = null;
  let previewBody: HTMLElement | null = null;
  let previewGeneration = 0;
  const close = (): void => scrim?.close();
  const closePreview = (): void => {
    const active = preview;
    if (active) active.close();
  };

  // 모서리에 뜨는 단추 둘 — 전체 지우기와 닫기. 머리줄에 안 끼운다(미리보기 카드와 같은 자리).
  // Two corner buttons — clear all and close. Kept out of the header row (matches the preview card's layout).
  const corner = make(owner, 'div', 'nabi-history-corner');
  const wipe = make(owner, 'button', 'nabi-btn', {
    type: 'button',
    'aria-label': t.t('history.clear'),
    'data-nabi-tip': t.t('history.clear'),
  }) as HTMLButtonElement;
  wipe.innerHTML = iconHtml('panel-history-clear', 'delete');
  const shut = make(owner, 'button', 'nabi-btn', {
    type: 'button',
    'aria-label': t.t('close'),
    'data-nabi-tip': t.t('close'),
  }) as HTMLButtonElement;
  shut.innerHTML = iconHtml('panel-history-close', 'close');
  corner.append(wipe, shut);
  card.append(corner);
  shut.addEventListener('click', close);

  // --- 지우기 ----------------------------------------------------------------------------------

  // 브라우저 confirm() 대신 인스턴스의 ask.confirm을 쓴다 — 페이지 자체 대화상자와 안 겹치고, IDE 플러그인엔 confirm이 아예 없다. 응답이 없으면 "아니오"로 쳐서 기록을 지우지 않는다.
  // Uses the instance's own ask.confirm instead of the browser's confirm() — it won't clash with a page's own dialogs, and IDE plugin hosts (IntelliJ, VS Code) have no confirm at all. An unanswered ask defaults to "no", so records are never silently deleted.
  //
  // 답을 기다리는 동안 단추를 잠근다 — 두 번 눌러 두 번 묻는 일이 없게.
  // The button locks while waiting for an answer, so a double click can't ask twice.
  let asking = false;
  const wipeIf = async (key: string, run: () => boolean): Promise<void> => {
    if (disposed || asking) return;
    asking = true;
    try {
      if (!(await options.history.ask.confirm(t.t(key)))) return;
      if (disposed) return;
      run();
      if (!disposed) draw();
    } finally {
      asking = false;
    }
  };

  // --- 목록 ------------------------------------------------------------------------------------

  const draw = (): void => {
    if (disposed) return;
    rowsCopy.clear();
    list.replaceChildren();
    const drawn = options.history.list();
    // 저장소가 살아 있음은 판이 서기 전에 이미 확인됐다(막힌 자리는 위에서 되돌아갔다) — 그래서 여기서는 빈 목록/찬 목록 둘만 가른다. 빈 상자를 그대로 두면 "고장났나"로 읽힌다.
    // Storage's aliveness was already checked before this panel opened (blocked storage returned above), so this only distinguishes empty from populated. Leaving an empty box blank would read as broken.
    if (historyView(true, drawn) === 'empty') {
      const empty = make(owner, 'div', 'nabi-history-empty');
      rowsCopy.text(empty, () => t.t('history.empty'));
      list.append(empty);
      return;
    }

    for (const record of drawn) {
      const row = make(owner, 'div', 'nabi-history-row');
      const mine = options.sessionId !== undefined && record.sessionId === options.sessionId;

      // 요약 — 누르면 그 줄로 되돌린다. 지금 세션은 되돌릴 것이 자기 자신이라 안 누른다.
      // The summary restores this record on click; the current session's own row is disabled since it would be restoring itself.
      const open = make(owner, 'button', 'nabi-history-open', { type: 'button' }) as HTMLButtonElement;
      const summary = make(owner, 'div', 'nabi-history-summary');
      summary.textContent = record.summary;
      // 눈에 보이는 시각은 사람의 단위("20분 전")뿐이고, 자세한 시각은 이름표로 미룬다 — 목록에서 읽는 것은 "얼마나 됐나"이지 초가 아니다.
      // The visible time is just the human unit ("20 minutes ago"); the exact timestamp lives in the tooltip — a list reads "how long ago," not seconds.
      const when = make(owner, 'div', 'nabi-history-when');
      const time = make(owner, 'div', 'nabi-history-time', {
        'data-nabi-tip': exactTime(record.savedAt, stamp()),
      });
      rowsCopy.text(time, () => ago(t, record.savedAt, now));
      rowsCopy.attribute(time, 'data-nabi-tip', () => exactTime(record.savedAt, stamp()));
      when.append(time);
      // 만든 때 — 고친 때와 벌어졌을 때만 따로 선다(갓 선 줄은 둘이 같은 순간이다).
      // "Created" only shows when it differs from "saved" — a brand-new record has both at the same instant.
      if (showsCreated(record)) {
        const born = make(owner, 'div', 'nabi-history-made', {
          'data-nabi-tip': exactTime(record.createdAt, stamp()),
        });
        rowsCopy.text(born, () => t.t('history.created', { when: ago(t, record.createdAt, now) }));
        rowsCopy.attribute(born, 'data-nabi-tip', () => exactTime(record.createdAt, stamp()));
        when.append(born);
      }
      if (mine) {
        const here = make(owner, 'div', 'nabi-history-here');
        rowsCopy.text(here, () => t.t('history.current'));
        when.append(here);
      }
      open.append(summary, when);
      open.disabled = mine;
      open.addEventListener('click', () => {
        if (disposed) return;
        options.history.restore(record);
        close();
      });

      // 미리보기 — 되살리기 전에 무엇이 들었는지 본다. 문서는 안 건드린다.
      // Preview — see what's in a record before restoring it; the document itself is untouched.
      const view = make(owner, 'button', 'nabi-btn nabi-history-tool', {
        type: 'button',
        'aria-label': t.t('preview'),
        'data-nabi-tip': t.t('preview'),
      }) as HTMLButtonElement;
      view.innerHTML = iconHtml('panel-history-preview', 'history-preview');
      rowsCopy.button(view, () => t.t('preview'));
      view.addEventListener('click', () => {
        if (disposed) return;
        const generation = ++previewGeneration;
        closePreview();
        const body = make(owner, 'div', 'nabi-card nabi-content nabi-history-preview', {
          'aria-label': t.t('preview'),
          dir: localeDirection(t.locale),
        });
        body.innerHTML = options.render(record);
        previewBody = body;
        if (disposed || generation !== previewGeneration || !scrim?.root.isConnected) return;
        // 이 판보다 위에 선다 — 어느 줄의 미리보기든 목록을 덮는다.
        // Stacks above this panel — any row's preview covers the list.
        let opened: Scrim | null = null;
        opened = openScrim(owner, {
          card: body,
          restore: card,
          onClose: () => {
            if (preview === opened) {
              preview = null;
              previewBody = null;
            }
          },
        });
        if (disposed || generation !== previewGeneration || !scrim?.root.isConnected) {
          opened.close();
          return;
        }
        preview = opened;
      });

      const drop = make(owner, 'button', 'nabi-btn nabi-history-tool', {
        type: 'button',
        'aria-label': t.t('history.remove'),
        'data-nabi-tip': t.t('history.remove'),
      }) as HTMLButtonElement;
      drop.innerHTML = iconHtml('panel-history-delete', 'delete');
      rowsCopy.button(drop, () => t.t('history.remove'));
      drop.addEventListener('click', () => {
        if (disposed) return;
        void wipeIf('history.removeAsk', () => options.history.remove(record.sessionId));
      });

      row.append(open, view, drop);
      list.append(row);
    }
  };

  wipe.addEventListener('click', () => {
    if (disposed) return;
    void wipeIf('history.clearAsk', () => options.history.clear());
  });

  try {
    copy.attribute(card, 'dir', () => localeDirection(t.locale));
    copy.attribute(card, 'aria-label', () => t.t('history.title'));
    copy.text(title, () => t.t('history.title'));
    copy.button(wipe, () => t.t('history.clear'));
    copy.button(shut, () => t.t('close'));
    copy.add(() => {
      previewBody?.setAttribute('aria-label', t.t('preview'));
      previewBody?.setAttribute('dir', localeDirection(t.locale));
    });
    draw();
    scrim = openScrim(owner, {
      card,
      restore: options.surface,
      onClose: () => {
        disposed = true;
        copy.dispose();
        rowsCopy.dispose();
        previewGeneration += 1;
        try {
          closePreview();
        } catch {}
        preview = null;
      },
    });
    card.focus();
    return { card, close };
  } catch (error) {
    copy.dispose();
    rowsCopy.dispose();
    disposed = true;
    try {
      scrim?.close();
    } catch {}
    try {
      closePreview();
    } catch {}
    throw error;
  }
}
