// 로컬 히스토리 — 이 기계, 이 브라우저 안에만 사는 자동 스냅샷. 서버도 계정도 네트워크도 없다.
//
// ** 예외 — 서버 조립에서 제외된다.** 다른 모든 것은 DOM 없이 서버에서도 그대로 도는데
// (조립은 문자열이다), 이것만은 클라이언트 전용이다: 저장소가 그 사람의 브라우저에 있고
// 서버가 대신 기억해 주면 그것은 이미 로컬 히스토리가 아니다. 그래서 코어(이 파일)에는
// **커맨드와 선언만** 두고, 저장소에 닿는 손은 surface 의 mountLocalHistory 가 든다.
//
// 저장 모양은 `.nabi` 파일과 같은 글자열이다 — 되살리기가 파일을 여는 것과 같은 길을 탄다.
import { $fromJson } from '../../schema/index.js';
import { caretAt, docStart } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import type { Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// 스냅샷 한 줄 — 한 편집기(sessionId)는 자기 줄 하나를 계속 고쳐 쓴다.
export interface HistoryRecord {
  readonly sessionId: string;
  // 글자만 모아 잘라 둔 것. 목록에 보이는 것이 이것뿐이라, 없으면 그 줄은 읽을 수 없다.
  readonly summary: string;
  // 문서 JSON 을 담은 글자열 (writeNabiFile 과 같은 모양이 아니라 getJson 의 직렬화 그대로).
  readonly body: string;
  readonly savedAt: number;
  // 그 세션이 **처음** 적힌 때. 옛 줄에 없으면 savedAt 으로 읽는다.
  readonly createdAt: number;
}

// 저장소 — localStorage 의 모양 그대로다(그 셋이면 충분하다). 시험은 가짜를 꽂는다.
export interface HistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const HISTORY_KEY = 'nabi-note.history';
export const HISTORY_LIMIT = 20;
const SUMMARY_LENGTH = 80;

// 목록 요약 — 문서 JSON 에서 글자만 훑어 이어 붙인다. 트리 모양을 모르는 값이 와도 안 던진다.
export function summarize(json: unknown, limit = SUMMARY_LENGTH): string {
  let out = '';
  const walk = (value: unknown): void => {
    if (out.length >= limit) return;
    if (typeof value === 'string') {
      out += out === '' || out.endsWith(' ') ? value : ` ${value}`;
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (typeof value === 'object' && value !== null) walk((value as { ch?: unknown }).ch);
  };
  walk(json);
  const text = out.replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

// --- 저장소가 살아 있는가 (084 ⑤) ---------------------------------------------------------------

// 저장소를 **한 번 두드려 본다**. 있는 것과 쓸 수 있는 것이 다르기 때문이다: `file://` 이나
// 샌드박스 iframe 에서는 `localStorage` 라는 이름은 있어도 손을 대는 순간 SecurityError 가 난다.
//
// **읽기로만 잰다** — 쓰기로 재면 용량이 찬 저장소(quota)까지 "막혔다" 로 잡히는데, 그건 다른
// 사정이고 다른 말이 필요하다(그 자리는 지금도 조용히 넘긴다). 읽기가 막히는 자리가 곧 권한이
// 막힌 자리다.
export function historyStorageAlive(storage: HistoryStorage | null | undefined): boolean {
  if (!storage) return false;
  try {
    storage.getItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

// 판이 무엇을 보여야 하는가 — 셋뿐이고, 그 판정에 DOM 이 필요 없다(그래서 여기 있다).
// `blocked` 는 목록이 아니라 한 마디(toast)로 답할 자리다: 기록이 없는 것이 아니라 저장소에
// 손이 안 닿는 것이라, "기록이 없다" 로 말하면 거짓말이 된다.
export type HistoryView = 'blocked' | 'empty' | 'rows';

export function historyView(alive: boolean, rows: readonly HistoryRecord[]): HistoryView {
  if (!alive) return 'blocked';
  return rows.length === 0 ? 'empty' : 'rows';
}

// --- 시각 (084 ⑤) -------------------------------------------------------------------------------

// 만든 때를 따로 말할 만한가 — 갓 선 줄은 만든 때와 고친 때가 같은 순간이라, 둘 다 적으면 한 말을
// 두 번 한다. 이만큼(1분) 벌어졌을 때부터 둘이 다른 이야기가 된다.
export const HISTORY_CREATED_GAP = 60_000;

export function showsCreated(record: HistoryRecord, gap = HISTORY_CREATED_GAP): boolean {
  return record.savedAt - record.createdAt >= gap;
}

// 자세한 시각 — 이름표(마우스를 올렸을 때)가 드는 말이다. `yyyy-MM-dd HH:mm:ss` 만큼 자세하되
// **자리 순서와 구분자는 그 나라의 것**이다: 미국은 08/18/2026, 독일은 18.08.2026 이고 시간도
// 12시간제와 24시간제로 갈린다. 손으로 이어 붙이면 어느 나라에서는 날짜가 뒤집혀 읽힌다 —
// 그래서 `Intl.DateTimeFormat` 이 짜고 우리는 자릿수만 고른다.
//
// 로케일은 **지역까지 온 그대로** 넘긴다(`en-GB` 를 `en` 으로 깎지 않는다). 사전은 언어 단위로
// 살지만 날짜는 나라 단위로 살아서, 지역을 떼는 순간 8월 18일이 8월 18일이 아니게 된다.
export function exactTime(at: number, locale?: string): string {
  const date = new Date(at);
  try {
    return new Intl.DateTimeFormat(locale === '' ? undefined : locale, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(date);
  } catch {
    // Intl 이 없거나 모양이 아닌 로케일 — 시각을 통째로 잃느니 ISO 로라도 말한다.
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
}

// --- 저장소 읽기·쓰기 (순수 — 저장소는 주입받는다) ----------------------------------------------

export function readHistory(storage: HistoryStorage): HistoryRecord[] {
  let raw: string | null = null;
  try {
    raw = storage.getItem(HISTORY_KEY);
  } catch {
    return []; // 사생활 보호 모드·file:// — 저장소 없음은 오류가 아니라 "없음" 이다
  }
  if (raw === null || raw === '') return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  const out: HistoryRecord[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Partial<HistoryRecord>;
    if (typeof record.sessionId !== 'string' || typeof record.body !== 'string') continue;
    const savedAt = typeof record.savedAt === 'number' ? record.savedAt : 0;
    out.push({
      sessionId: record.sessionId,
      summary: typeof record.summary === 'string' ? record.summary : '',
      body: record.body,
      savedAt,
      createdAt: typeof record.createdAt === 'number' ? record.createdAt : savedAt,
    });
  }
  // 언제나 최근 순 — 목록이 정렬을 기억하지 않아도 되게 읽는 자리에서 세운다.
  return out.sort((a, b) => b.savedAt - a.savedAt).slice(0, HISTORY_LIMIT);
}

// 한 세션의 줄을 갈아 쓴다(없으면 새로 선다). 넘치면 오래된 줄부터 진다. 저장소가 거절하면 false.
export function writeHistory(storage: HistoryStorage, record: HistoryRecord, limit = HISTORY_LIMIT): boolean {
  const rest = readHistory(storage).filter((row) => row.sessionId !== record.sessionId);
  const next = [record, ...rest].sort((a, b) => b.savedAt - a.savedAt).slice(0, limit);
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
    return true;
  } catch {
    // 용량 초과 — 자동저장이 못 돌았다는 것 말고는 아무 일도 안 일어난다.
    return false;
  }
}

export function removeHistory(storage: HistoryStorage, sessionId: string): boolean {
  const next = readHistory(storage).filter((row) => row.sessionId !== sessionId);
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function clearHistory(storage: HistoryStorage): boolean {
  try {
    storage.removeItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

// --- 커맨드 — 되살리기 하나 ---------------------------------------------------------------------

// 문서를 통째로 갈아 끼운다. setJson 과 달리 **커맨드의 문**을 지나므로 되돌리기 한 점이 남는다
// 잘못 되살렸을 때 쓰던 글로 돌아갈 길이 있어야 한다.
const restoreHistory: Command = (_doc, _sel, args, env) => {
  const raw = args['body'];
  const json = typeof raw === 'string' ? safeParse(raw) : raw;
  if (json === undefined) return null;
  const parsed = $fromJson(json, env);
  if (!parsed) return null;
  const start = docStart(parsed, env) ?? { path: [0], offset: 0 };
  return { doc: parsed, selection: caretAt(start) };
};

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

const HISTORY_NAME: LocaleText = { ko: '로컬 히스토리', en: 'Local history', ja: 'ローカル履歴', zh: '本地历史', de: 'Lokaler Verlauf', fr: 'Historique local', es: 'Historial local', pt: 'Histórico local', ru: 'Локальная история', ar: 'السجل المحلي', hi: 'स्थानीय इतिहास', bn: 'স্থানীয় ইতিহাস', ur: 'مقامی تاریخ', id: 'Riwayat lokal' };

const HISTORY_ICON =
  '<path d="M8 4.25V8l2.5 1.5"/><path d="M2.9 6.6A5.5 5.5 0 1 1 2.75 9.4"/><path d="M1.75 3.75v3h3"/>';

export const localHistoryWing: Wing = {
  w: 'localHistory',
  place: 'tool',
  commands: { restoreHistory },
  button: {
    group: 'file',
    svg: HISTORY_ICON,
    label: HISTORY_NAME,
    // 목록 패널은 호스트가 든다 — 저장소가 인스턴스의 것이라 ui 가 대신 기억할 수 없다.
    action: { kind: 'host' },
  },
};
