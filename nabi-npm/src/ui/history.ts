// 로컬 기록 판 — **막 위에 뜨는 사각형 하나**다. 목록·미리보기·지우기가 한 상자에 산다.
//
// 왜 ui 층인가: wing 은 화면을 모른다(계약). 그렇다고 "호스트가 알아서 그려라" 로 두면 호스트마다
// 다른 모양이 나오고, 그러면 이 기능의 생김새란 것이 없어진다 — 실제로 그렇게 됐었다. 그래서
// **부품 하나**로 내놓는다: 호스트는 이 문을 부르기만 하면 되고, 모양은 한 곳에서 정해진다.
//
// 덮개 부품(`openScrim`)을 그대로 쓴다 — Escape·바깥 클릭·포커스 복원이 미리보기·라이트박스와
// 같은 한 벌이다.
//
// 판이 **안 서는 자리가 하나** 있다: 저장소가 막힌 곳(`file://`·사생활 보호 모드). 거기서는 빈
// 목록을 띄우는 대신 toast 한 마디로 왜 안 되는지 말한다 (084 ⑤) — 없는 것과 못 여는 것은
// 다른 이야기이고, "기록이 없다" 로 얼버무리면 사람이 제 기록을 잃은 줄 안다.
import type { HistoryMount } from '../surface/index.js';
import {
  exactTime,
  historyView,
  showsCreated,
  type HistoryRecord,
} from '../wings/local-history/local-history.js';
import { makeTranslator, type Translator } from '../locale/index.js';
import { make } from './parts/dom.js';
import { openScrim } from './parts/scrim.js';
import type { Overlay } from './overlay.js';

const CLOSE_ICON = '✕';
const WIPE_ICON = '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5h5.6l.7-8.5"/>';
const VIEW_ICON =
  '<g stroke-width="1.4"><path d="M1.8 8s2.4-4 6.2-4 6.2 4 6.2 4-2.4 4-6.2 4-6.2-4-6.2-4z"/><circle cx="8" cy="8" r="1.6"/></g>';

export interface HistoryPanelOptions {
  readonly history: HistoryMount;
  // 겨눔이 돌아갈 자리 — 닫으면 여기로 포커스가 간다.
  readonly surface: HTMLElement;
  // 말과 **날짜 차림**을 함께 정한다 — 사전은 언어만 보지만 시각은 지역까지 본다
  // (`en-GB` 는 18/08/2026, `en-US` 는 08/18/2026). 그래서 깎지 않은 값을 받는다.
  readonly locale?: string;
  readonly translator?: Translator;
  // 한 줄의 미리보기를 그릴 때 쓰는 조립 — 기록의 JSON 을 보기 HTML 로 바꾼다.
  readonly render: (record: HistoryRecord) => string;
  // 지금 편집 중인 줄을 가려낸다 — 그 줄은 "현재 세션" 으로 표시하고 되살리기를 안 시킨다.
  readonly sessionId?: string;
}

// 막힌 저장소를 알리는 한 마디가 사는 시간 — 기본 1초로는 못 읽는다. 두 줄짜리 안내라
// 읽고 무엇을 해야 하는지(서버에 올려서 열기)까지 닿을 만큼 세워 둔다 (084 ①의 `ms` 인자).
const BLOCKED_MS = 6000;

// 얼마 전인가 — 사람이 읽는 단위 하나로만 말한다("20분 전"). 정확한 시각은 이름표가 든다.
function ago(t: Translator, from: number, now: number): string {
  const sec = Math.max(0, Math.round((now - from) / 1000));
  if (sec < 60) return t.t('history.now');
  const min = Math.round(sec / 60);
  if (min < 60) return t.t('history.minutes', { n: min });
  const hour = Math.round(min / 60);
  if (hour < 24) return t.t('history.hours', { n: hour });
  return t.t('history.days', { n: Math.round(hour / 24) });
}

// 답이 null 인 자리가 하나 있다 — **저장소가 막힌 곳**이다(`file://`·사생활 보호 모드).
// 거기서는 판이 안 서고 toast 한 마디가 대신 선다.
export function openHistoryPanel(options: HistoryPanelOptions): Overlay | null {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  // 날짜는 나라 단위로 산다 — 사전이 깎아 둔 언어(`t.locale`)가 아니라 호스트가 준 그대로를
  // 먼저 본다(`en-GB` 와 `en-US` 는 8월 18일을 다르게 적는다).
  const stamp = options.locale ?? t.locale;
  const now = Date.now();

  // 저장소가 막힌 자리 — **사람이 단추를 누른 이 순간에만** 말한다. 백단(자동 스냅샷)은 같은
  // 사정을 조용히 넘긴다: 글 치는 내내 같은 말을 반복하는 알림은 알림이 아니라 방해다 (084 ⑤).
  if (historyView(options.history.alive(), options.history.list()) === 'blocked') {
    options.history.toast('warn', t.t('history.blocked'), BLOCKED_MS);
    return null;
  }

  const card = make(owner, 'div', 'nabi-card nabi-history', { tabindex: '-1' });
  const head = make(owner, 'div', 'nabi-history-head');
  const title = make(owner, 'div', 'nabi-history-title');
  title.textContent = t.t('history.title');
  head.append(title);

  const list = make(owner, 'div', 'nabi-history-list');
  card.append(head, list);

  const scrim = openScrim(owner, { card, restore: options.surface });
  const close = (): void => scrim.close();

  // 모서리에 뜨는 단추 둘 — 전체 지우기와 닫기. 머리줄에 안 끼운다(미리보기 카드와 같은 자리).
  const corner = make(owner, 'div', 'nabi-history-corner');
  const wipe = make(owner, 'button', 'nabi-btn', {
    type: 'button',
    'aria-label': t.t('history.clear'),
    'data-nabi-tip': t.t('history.clear'),
  }) as HTMLButtonElement;
  wipe.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${WIPE_ICON}</svg>`;
  const shut = make(owner, 'button', 'nabi-btn', {
    type: 'button',
    'aria-label': t.t('close'),
    'data-nabi-tip': t.t('close'),
  }) as HTMLButtonElement;
  shut.textContent = CLOSE_ICON;
  corner.append(wipe, shut);
  card.append(corner);
  shut.addEventListener('click', close);

  // --- 지우기 ----------------------------------------------------------------------------------

  // 되돌리기가 못 닿는 곳이라 먼저 묻는다 — 되돌리기는 **문서**의 것이고, 기록은 저장소에 산다.
  //
  // 묻는 상자는 **인스턴스의 것**이다(`nabi.$ask`, 부속이 물려준다). 브라우저의 `confirm` 을
  // 부르지 않는다: 제 대화상자를 가진 페이지에 회색 상자가 끼어들면 안 되고, 플러그인
  // (인텔리제이·VS Code)에는 그것이 아예 없다. 아무도 안 물어 주면 답은 "아니오" 라
  // 기록은 그대로 남는다(silentAsk) — 말없이 지우는 것보다 안 지우는 쪽이 낫다.
  //
  // 답을 기다리는 동안 단추를 잠근다 — 두 번 눌러 두 번 묻는 일이 없게.
  let asking = false;
  const wipeIf = async (key: string, run: () => boolean): Promise<void> => {
    if (asking) return;
    asking = true;
    try {
      if (!(await options.history.ask.confirm(t.t(key)))) return;
      run();
      draw();
    } finally {
      asking = false;
    }
  };

  // --- 목록 ------------------------------------------------------------------------------------

  const draw = (): void => {
    list.replaceChildren();
    const drawn = options.history.list();
    // 판이 선 시점에 저장소는 살아 있음이 이미 확인됐다(막힌 자리는 위에서 되돌아갔다) — 그래서
    // 여기서 갈리는 것은 둘뿐이다. 한 줄도 없으면 **빈 상자를 그대로 두지 않는다**: 빈 판은
    // "고장났나" 로 읽히고, 그 침묵이 이번 라운드가 걷는 것이다 (084 ⑤).
    if (historyView(true, drawn) === 'empty') {
      const empty = make(owner, 'div', 'nabi-history-empty');
      empty.textContent = t.t('history.empty');
      list.append(empty);
      return;
    }

    for (const record of drawn) {
      const row = make(owner, 'div', 'nabi-history-row');
      const mine = options.sessionId !== undefined && record.sessionId === options.sessionId;

      // 요약 — 누르면 그 줄로 되돌린다. 지금 세션은 되돌릴 것이 자기 자신이라 안 누른다.
      const open = make(owner, 'button', 'nabi-history-open', { type: 'button' }) as HTMLButtonElement;
      const summary = make(owner, 'div', 'nabi-history-summary');
      summary.textContent = record.summary;
      // 시각은 두 겹이다: 눈에 보이는 것은 사람의 단위 하나("20분 전")이고, 마우스를 올리면
      // 이름표가 그 나라 차림의 자세한 시각을 든다 (084 ⑤). 둘을 한 줄에 같이 적으면 목록이
      // 시각표가 된다 — 목록에서 읽는 것은 "얼마나 됐나" 이지 초가 아니다.
      const when = make(owner, 'div', 'nabi-history-when');
      const time = make(owner, 'div', 'nabi-history-time', {
        'data-nabi-tip': exactTime(record.savedAt, stamp),
      });
      time.textContent = ago(t, record.savedAt, now);
      when.append(time);
      // 만든 때 — 고친 때와 벌어졌을 때만 따로 선다(갓 선 줄은 둘이 같은 순간이다).
      if (showsCreated(record)) {
        const born = make(owner, 'div', 'nabi-history-made', {
          'data-nabi-tip': exactTime(record.createdAt, stamp),
        });
        born.textContent = t.t('history.created', { when: ago(t, record.createdAt, now) });
        when.append(born);
      }
      if (mine) {
        const here = make(owner, 'div', 'nabi-history-here');
        here.textContent = t.t('history.current');
        when.append(here);
      }
      open.append(summary, when);
      open.disabled = mine;
      open.addEventListener('click', () => {
        options.history.restore(record);
        close();
      });

      // 미리보기 — 되살리기 전에 무엇이 들었는지 본다. 문서는 안 건드린다.
      const view = make(owner, 'button', 'nabi-btn nabi-history-tool', {
        type: 'button',
        'aria-label': t.t('preview'),
        'data-nabi-tip': t.t('preview'),
      }) as HTMLButtonElement;
      view.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${VIEW_ICON}</svg>`;
      view.addEventListener('click', () => {
        const body = make(owner, 'div', 'nabi-card nabi-content nabi-history-preview');
        body.innerHTML = options.render(record);
        // 이 판보다 **위**에 선다 — 어느 줄의 미리보기든 목록을 덮는다.
        openScrim(owner, { card: body, restore: card });
      });

      // 그 줄만 지우기.
      const drop = make(owner, 'button', 'nabi-btn nabi-history-tool', {
        type: 'button',
        'aria-label': t.t('history.remove'),
        'data-nabi-tip': t.t('history.remove'),
      }) as HTMLButtonElement;
      drop.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${WIPE_ICON}</svg>`;
      drop.addEventListener('click', () => {
        void wipeIf('history.removeAsk', () => options.history.remove(record.sessionId));
      });

      row.append(open, view, drop);
      list.append(row);
    }
  };

  wipe.addEventListener('click', () => {
    void wipeIf('history.clearAsk', () => options.history.clear());
  });

  draw();
  card.focus();
  return { card, close };
}
