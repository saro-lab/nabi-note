// 로컬 히스토리의 표면 절반(저장소에 닿는 손) — 저장소는 주입받는다(기본 localStorage, 테스트는 가짜라 DOM 없이도 테스트된다). 다른 부속과 달리 클라이언트 전용이라 서버 조립에서 제외된다 — 저장소가 그 사람 브라우저에 있어야 "로컬" 히스토리다
// The screen half of local history (the hand that touches storage); storage is injected (defaults to localStorage, tests supply a fake, so this stays testable without a DOM). Unlike other extras, this is client-only and excluded from server assembly, since it's only "local" history if the store lives in that person's own browser
import { hostOf, type Ask, type Nabi, type Toast } from '../../editor/index.js';
import {
  HISTORY_LIMIT,
  historyStorageAlive,
  readHistory,
  clearHistory,
  removeHistory,
  summarize,
  writeHistory,
  type HistoryRecord,
  type HistoryStorage,
} from '../../wings/local-history/local-history.js';

// 이 브라우저의 저장소 — 없거나 막혔으면 null이다(사생활 보호 모드·file://). 존재하는 것과 쓸 수 있는 것은 다르다(084 ⑤) — file://나 샌드박스 iframe은 꺼내는 데까진 성공하고 손대는 순간 던지므로, 한 번 두드려 보고 안 열리면 null로 접는다
// This browser's storage; null if missing or blocked (private browsing, file://). Existing isn't the same as usable (084 5) -- file:// or a sandboxed iframe can successfully retrieve localStorage yet throw the moment it's touched, so it's tapped once here and folded to null if that fails, rather than carrying around a broken store
export function browserHistoryStorage(view: { localStorage?: Storage } | null | undefined): HistoryStorage | null {
  let storage: HistoryStorage | null = null;
  try {
    storage = view?.localStorage ?? null;
  } catch {
    return null;
  }
  return historyStorageAlive(storage) ? storage : null;
}

export interface HistoryMountOptions {
  readonly nabi: Nabi;
  // 막힌 자리도 부속은 선다 — browserHistoryStorage가 null이어도 이 mount는 세운다. 그래야 wing 단추가 판(openHistoryPanel) 하나로 이어지고, 왜 아무 일도 안 일어나는지 그 판이 말할 수 있다
  // The extra still mounts even when storage is blocked (browserHistoryStorage returned null), so the wing's button still leads to one panel (openHistoryPanel) that can explain why nothing happens, instead of the host branching to skip mounting entirely
  readonly storage: HistoryStorage | null;
  readonly limit?: number;
  // 이만큼 지나기 전에는 다시 안 적는다 — 타이핑마다 저장소를 두드리지 않는다
  // Won't write again before this much time passes, so storage isn't touched on every keystroke
  readonly minIntervalMs?: number;
  readonly now?: () => number;
}

export interface HistoryMount {
  // 지금 문서를 제 줄에 적는다 — 자동 저장이 부르는 길(간격 무시)이다. 저장소가 막힌 자리에서는 조용히 false다(084 ⑤) — 자동 스냅샷은 계속 도는데 그때마다 알림을 띄우면 쓰지도 못하고 알림만 읽는다
  // Writes the current document to its own row; the path automatic saving calls (ignoring the interval). Silently returns false where storage is blocked (084 5) -- automatic snapshots fire constantly while typing, and surfacing a notice each time would drown out actual writing
  snapshot(): boolean;
  // 저장소에 지금 손이 닿는가 — 세울 때가 아니라 판을 열기 직전에 재는 자리다(단추를 누른 그 순간의 사정이 답이어야 한다)
  // Whether storage is reachable right now; checked right before opening the panel, not at mount time, since the answer must reflect the moment the button was pressed
  alive(): boolean;
  list(): HistoryRecord[];
  restore(record: HistoryRecord): boolean;
  // 이 편집기의 줄을 지운다
  // Deletes this editor's own row
  forget(): boolean;
  // 줄 하나를 지운다 — 목록에서 그 줄만 걷을 때
  // Deletes one row, when only that row is removed from the list
  remove(sessionId: string): boolean;
  // 전부 지운다
  // Deletes everything
  clear(): boolean;
  // 이 편집기의 줄 이름 — 목록이 "현재 세션" 을 가려내는 열쇠다
  // This editor's row name; the key the list uses to distinguish the "current session"
  readonly sessionId: string;
  // 묻는 길 — 인스턴스의 것을 그대로 물려준다(createNabiWith(wings, { ask })). 지우기는 되돌릴 수 없는데 호스트가 판을 열 때마다 따로 넘겨야 한다면 한 번만 빠뜨려도 말없이 지워진다 — 그래서 물음이 이 부속을 그대로 따라오게 해 호스트가 잊을 자리를 안 만든다
  // The prompting path, inherited directly from the instance (createNabiWith(wings, { ask })); deletion is irreversible, and if a host had to pass its own confirm dialog every time it opens the panel, missing it once means a silent delete -- so the prompt travels with this extra instead, leaving the host nothing to forget
  readonly ask: Ask;
  // 알리는 길 — ask와 같은 까닭으로 인스턴스의 것을 그대로 물려받는다(판이 안 열리는 자리에서 한 마디 해야 하는데 호스트가 매번 따로 넘기면 한 번만 빠뜨려도 침묵이 된다)
  // The notification path, inherited for the same reason as `ask`; a message must still get through when the panel can't even open (blocked storage), and a host-supplied toast passed in each time would go silent the moment it's missed once
  readonly toast: Toast;
  unmount(): void;
}

export function mountLocalHistory(options: HistoryMountOptions): HistoryMount {
  const { nabi, storage } = options;
  const limit = options.limit ?? HISTORY_LIMIT;
  const interval = options.minIntervalMs ?? 3000;
  const clock = options.now ?? ((): number => Date.now());
  let lastAt = 0;
  let trailing = false;
  let unmounted = false;
  // 이 편집기의 줄이 처음 적힌 때 — 목록의 "만든 날" 이다
  // When this editor's row was first written; the "created" date shown in the list
  let createdAt = 0;

  const write = (): boolean => {
    // 막힌 저장소는 여기서 조용히 접는다 — 아래 읽기·쓰기가 각자 try-catch를 둘러 던지진 않지만, 그 전에 문서를 통째로 직렬화할 까닭도 없다
    // Blocked storage folds quietly here; the reads/writes below are each wrapped in try-catch and wouldn't throw anyway, but there's no reason to serialize the whole document first if storage is unusable
    if (!storage) return false;
    const json = nabi.getJson();
    const at = clock();
    if (createdAt === 0) {
      createdAt = readHistory(storage).find((row) => row.sessionId === nabi.sessionId)?.createdAt ?? at;
    }
    const saved = writeHistory(
      storage,
      { sessionId: nabi.sessionId, summary: summarize(json), body: JSON.stringify(json), savedAt: at, createdAt },
      limit,
    );
    if (saved) {
      lastAt = at;
      trailing = false;
    }
    return saved;
  };

  const stop = nabi.onChange((change) => {
    if (!change.doc) return;
    trailing = true;
    if (interval > 0 && clock() - lastAt < interval) return;
    write();
  });

  return {
    snapshot: write,
    alive: () => historyStorageAlive(storage),
    list: () => (storage ? readHistory(storage) : []),
    restore(record) {
      // 되살리기는 커맨드의 문을 지난다 — 잘못 골랐어도 되돌리기 한 번으로 쓰던 글이 돌아온다
      // Restoring goes through a command, so picking the wrong record can still be undone in one step back to the unsaved work
      const done = nabi.applyCommand('restoreHistory', { body: record.body });
      // 이 줄을 다시 열었으면 이제 이 편집기가 그 문서를 이어 쓴다 — 사본이 아니라 같은 줄에 쌓인다
      // Reopening this row means this editor now continues that document; it accumulates on the same row instead of forking a copy
      if (done && record.sessionId !== nabi.sessionId && storage) {
        createdAt = record.createdAt;
        lastAt = 0;
        trailing = true;
        if (write()) removeHistory(storage, record.sessionId);
      }
      return done;
    },
    forget: () => (storage ? removeHistory(storage, nabi.sessionId) : false),
    remove: (sessionId) => (storage ? removeHistory(storage, sessionId) : false),
    clear: () => (storage ? clearHistory(storage) : false),
    sessionId: nabi.sessionId,
    ask: hostOf(nabi).ask,
    toast: hostOf(nabi).toast,
    unmount() {
      if (unmounted) return;
      unmounted = true;
      stop();
      if (trailing) write();
    },
  };
}
