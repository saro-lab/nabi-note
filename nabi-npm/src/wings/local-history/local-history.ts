// 로컬 히스토리 — 이 기계, 이 브라우저 안에만 사는 자동 스냅샷. 서버도 계정도 네트워크도 없다.
// Local history — an automatic snapshot living only on this machine's browser; no server, account, or network involved.
//
// 유일하게 서버 조립에서 빠진다 — 저장소가 브라우저에 있어야 로컬이라는 뜻이라, 코어엔 커맨드·선언만 두고 저장소는 surface가 문다.
// The one thing excluded from server assembly — "local" means the storage lives in the browser, so the core holds only commands/declarations, and surface's mountLocalHistory does the actual storage access.
import { $fromJson } from '../../schema/index.js';
import { caretAt, docStart } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import type { Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// 스냅샷 한 줄 — 한 편집기(sessionId)는 자기 줄 하나를 계속 고쳐 쓴다.
export interface HistoryRecord {
  readonly sessionId: string;
  // 글자만 모아 잘라 둔 것 — 목록에 보이는 게 이것뿐이라, 없으면 그 줄은 못 읽는다.
  readonly summary: string;
  // 문서 JSON 을 담은 글자열 — getJson의 직렬화 그대로다(writeNabiFile과는 다른 모양).
  readonly body: string;
  readonly savedAt: number;
  // 그 세션이 처음 적힌 때 — 옛 줄에 없으면 savedAt으로 읽는다.
  readonly createdAt: number;
}

// localStorage의 모양 그대로다(그 셋이면 충분하다) — 테스트는 가짜를 꽂는다.
// Mirrors localStorage's own shape (these three methods suffice) — tests inject a fake.
export interface HistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const HISTORY_KEY = 'nabi-note.history';
export const HISTORY_LIMIT = 20;
const SUMMARY_LENGTH = 80;

// 문서 JSON에서 글자만 훑어 이어 붙인다 — 모르는 트리 모양이 와도 안 던진다.
// Walks a document's JSON collecting only text — never throws, even on an unfamiliar tree shape.
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

// 저장소를 한 번 두드려 본다 — file://나 샌드박스 iframe은 localStorage가 있어도 손대면 SecurityError가 난다.
// Probes storage once, since existing and usable differ — sandboxed iframes or file:// can have localStorage yet throw SecurityError on touch.
//
// 읽기로만 잰다 — 쓰기로 재면 용량 초과(quota)까지 "막혔다"로 잡혀 다른 사정을 뭉갠다.
// Tests with a read only — testing via write would conflate a full quota with actual access denial, a different problem entirely.
export function historyStorageAlive(storage: HistoryStorage | null | undefined): boolean {
  if (!storage) return false;
  try {
    storage.getItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

// 판이 보여야 할 것 — blocked는 목록이 아니라 한 마디(toast)로 답할 자리다("기록 없음"이라 하면 거짓말이 된다).
// What the panel should show — `blocked` deserves a toast, not an empty list, since calling it "no records" would be a lie.
export type HistoryView = 'blocked' | 'empty' | 'rows';

export function historyView(alive: boolean, rows: readonly HistoryRecord[]): HistoryView {
  if (!alive) return 'blocked';
  return rows.length === 0 ? 'empty' : 'rows';
}

// 갓 선 줄은 만든 때·고친 때가 같은 순간이라 둘 다 적으면 같은 말을 두 번 한다 — 이만큼(1분) 벌어져야 다른 이야기가 된다.
// A freshly created row has identical created/saved times, so showing both is redundant until they diverge by at least this much (1 minute).
export const HISTORY_CREATED_GAP = 60_000;

export function showsCreated(record: HistoryRecord, gap = HISTORY_CREATED_GAP): boolean {
  return record.savedAt - record.createdAt >= gap;
}

// 이름표(hover)가 드는 자세한 시각 — 자리 순서·구분자는 나라마다 다르므로 손으로 안 잇고 Intl.DateTimeFormat에 맡긴다.
// The detailed timestamp shown on hover — field order and separators vary by country, so this defers to Intl.DateTimeFormat rather than hand-assembling a string.
//
// 로케일은 지역까지 그대로 넘긴다(en-GB를 en으로 안 깎는다) — 날짜는 언어가 아니라 나라 단위로 다르다.
// The locale keeps its region tag (en-GB stays en-GB) — date formatting varies by country, not just by language.
export function exactTime(at: number, locale?: string): string {
  const date = new Date(at);
  try {
    return new Intl.DateTimeFormat(locale === '' ? undefined : locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    // Intl이 없거나 유효하지 않은 로케일 — 시각을 통째로 잃느니 ISO로라도 말한다.
    // No Intl, or an invalid locale — falls back to ISO rather than showing nothing at all.
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
}

export function readHistory(storage: HistoryStorage): HistoryRecord[] {
  let raw: string | null = null;
  try {
    raw = storage.getItem(HISTORY_KEY);
  } catch {
    return []; // 사생활 보호 모드·file:// — 저장소 없음은 오류가 아니라 "없음"이다
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
  // Always sorted newest-first here, so callers never need to remember the ordering themselves.
  return out.sort((a, b) => b.savedAt - a.savedAt).slice(0, HISTORY_LIMIT);
}

// 한 세션의 줄을 갈아 쓴다(없으면 새로 선다) — 넘치면 오래된 줄부터 지고, 저장소가 거절하면 false.
// Overwrites (or creates) one session's row; oldest rows drop when over the limit, and a storage failure returns false.
export function writeHistory(storage: HistoryStorage, record: HistoryRecord, limit = HISTORY_LIMIT): boolean {
  const rest = readHistory(storage).filter((row) => row.sessionId !== record.sessionId);
  const next = [record, ...rest].sort((a, b) => b.savedAt - a.savedAt).slice(0, limit);
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
    return true;
  } catch {
    // 용량 초과 — 자동저장이 못 돌았다는 것 말고는 아무 일도 안 일어난다.
    // Over quota — the only consequence is that autosave silently didn't happen.
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

// 문서를 통째로 갈아 끼운다 — setJson과 달리 커맨드의 문을 지나 되돌리기 한 점이 남는다.
// Swaps in the whole document — unlike setJson, this goes through the command path, leaving one undo step in case the restore was a mistake.
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

const HISTORY_NAME: LocaleText = {
  ko: '로컬 히스토리',
  en: 'Local history',
  ja: 'ローカル履歴',
  zh: '本地历史',
  de: 'Lokaler Verlauf',
  fr: 'Historique local',
  es: 'Historial local',
  pt: 'Histórico local',
  ru: 'Локальная история',
  ar: 'السجل المحلي',
  hi: 'स्थानीय इतिहास',
  bn: 'স্থানীয় ইতিহাস',
  ur: 'مقامی تاریخ',
  id: 'Riwayat lokal',
};

const HISTORY_ICON = 'local-history-history';

export const localHistoryWing: Wing = {
  w: 'localHistory',
  place: 'tool',
  // 기본이다 — 저장소·판이 이미 이 꾸러미 안에 있어 호스트가 upload·save/open처럼 뭔가 구현해 줄 필요가 없다.
  // Basic, since storage and panel already live in this bundle — unlike upload or save/open, no host implementation is required.
  basic: true,
  commands: { restoreHistory },
  button: {
    group: 'file',
    icon: HISTORY_ICON,
    label: HISTORY_NAME,
    // 목록 패널은 호스트가 든다 — 저장소가 인스턴스 것이라 ui가 대신 기억할 수 없다.
    // The list panel is mounted by the host — storage belongs to the instance, so ui can't remember it on its own.
    action: { kind: 'host' },
  },
};
