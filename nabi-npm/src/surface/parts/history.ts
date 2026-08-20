// 로컬 히스토리의 표면 절반 — 저장소에 닿는 손이다. 저장소는 주입받는다: 기본은 이 브라우저의
// `localStorage` 이고, 시험은 가짜를 꽂는다(그래서 이 파일은 DOM 없이도 그물에 잡힌다).
//
// ** 예외 — 서버 조립에서 제외된다.** 다른 부속과 달리 이것은 클라이언트 전용이다:
// 저장소가 그 사람의 브라우저에 있어서, 서버가 대신 기억해 주면 로컬 히스토리가 아니게 된다.
import type { Ask, Nabi, Toast } from '../../editor/index.js';
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

// 이 브라우저의 저장소 — 없거나 막혔으면 null 이다(사생활 보호 모드·`file://`).
//
// **이름이 있는 것과 쓸 수 있는 것은 다르다** (084 ⑤): `file://` 이나 샌드박스 iframe 에서는
// `localStorage` 를 꺼내는 데까지는 성공하고 손을 대는 순간 던진다. 그래서 꺼낸 뒤 한 번
// 두드려 보고, 안 열리면 여기서 null 로 접는다 — 막힌 저장소를 들고 다니지 않는다.
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
  // **막힌 자리도 부속은 선다** — `browserHistoryStorage` 가 null 을 답한 자리에서도 이 mount 를
  // 세운다. 그래야 wing 단추가 판(`openHistoryPanel`) 하나로 이어지고, 왜 아무 일도 안 일어나는지
  // 그 판이 말할 수 있다. 호스트가 "저장소가 없으면 안 세운다" 로 갈라 두면 그 말이 사라진다.
  readonly storage: HistoryStorage | null;
  readonly limit?: number;
  // 이만큼 지나기 전에는 다시 안 적는다 — 타이핑마다 저장소를 두드리지 않는다.
  readonly minIntervalMs?: number;
  readonly now?: () => number;
}

export interface HistoryMount {
  // 지금 문서를 제 줄에 적는다 — 자동 저장이 부르는 그 길이다(간격 무시).
  //
  // **저장소가 막힌 자리에서는 조용히 false 다** (084 ⑤). 자동 스냅샷은 글을 치는 동안 계속
  // 도는데, 그때마다 사람을 붙들면 쓰지도 못하고 알림만 읽게 된다 — 백단은 말이 없다.
  snapshot(): boolean;
  // 저장소에 지금 손이 닿는가 — 판을 열기 **직전**에 재는 자리다(세울 때가 아니라).
  // 사람이 단추를 누른 그 순간의 사정이 답이라야 하고, 그 답이 갈리는 곳은 판 하나뿐이다.
  alive(): boolean;
  list(): HistoryRecord[];
  restore(record: HistoryRecord): boolean;
  // 이 편집기의 줄을 지운다.
  forget(): boolean;
  // 줄 하나를 지운다 — 목록에서 그 줄만 걷을 때.
  remove(sessionId: string): boolean;
  // 전부 지운다.
  clear(): boolean;
  // 이 편집기의 줄 이름 — 목록이 "현재 세션" 을 가려내는 열쇠다.
  readonly sessionId: string;
  // 묻는 길 — **인스턴스의 것을 그대로 물려준다**(`createNabiWith(wings, { ask })`).
  //
  // 여기 있는 까닭: 지우기는 되돌릴 수 없는데, 묻는 상자를 호스트가 판을 열 때마다 따로
  // 넘겨야 한다면 한 번만 빠뜨려도 **말없이 지우거나 말없이 안 지운다.** 기록 판은 이 부속의
  // 얼굴이므로, 물음도 이 부속을 따라오게 둔다 — 호스트가 잊을 자리를 아예 안 만든다.
  readonly ask: Ask;
  // 알리는 길 — 묻는 길(`ask`)과 **같은 까닭**으로 인스턴스의 것을 그대로 물려받는다: 판이
  // 열리지 않는 자리에서 한 마디를 해야 하는데(막힌 저장소), 호스트가 판을 열 때마다 toast 를
  // 따로 넘겨야 한다면 한 번만 빠뜨려도 그 자리가 도로 침묵이 된다.
  readonly toast: Toast;
  unmount(): void;
}

export function mountLocalHistory(options: HistoryMountOptions): HistoryMount {
  const { nabi, storage } = options;
  const limit = options.limit ?? HISTORY_LIMIT;
  const interval = options.minIntervalMs ?? 3000;
  const clock = options.now ?? ((): number => Date.now());
  let lastAt = 0;
  // 이 편집기의 줄이 처음 적힌 때 — 목록의 "만든 날" 이다.
  let createdAt = 0;

  const write = (): boolean => {
    // 막힌 저장소 — 여기서 조용히 접는다. 아래의 읽기·쓰기는 저마다 try–catch 를 두르고 있어
    // 던지지는 않지만, 그 전에 문서를 통째로 직렬화할 까닭도 없다.
    if (!storage) return false;
    const json = nabi.getJson();
    const at = clock();
    if (createdAt === 0) {
      createdAt = readHistory(storage).find((row) => row.sessionId === nabi.sessionId)?.createdAt ?? at;
    }
    lastAt = at;
    return writeHistory(
      storage,
      { sessionId: nabi.sessionId, summary: summarize(json), body: JSON.stringify(json), savedAt: at, createdAt },
      limit,
    );
  };

  const stop = nabi.onChange((change) => {
    if (!change.doc) return;
    if (interval > 0 && clock() - lastAt < interval) return;
    write();
  });

  return {
    snapshot: write,
    alive: () => historyStorageAlive(storage),
    list: () => (storage ? readHistory(storage) : []),
    restore(record) {
      // 되살리기는 커맨드의 문을 지난다 — 잘못 골랐어도 되돌리기 한 번으로 쓰던 글이 돌아온다.
      const done = nabi.applyCommand('restoreHistory', { body: record.body });
      // 이 줄을 다시 열었으면 이제 이 편집기가 그 문서를 이어 쓴다 — 사본이 아니라 같은 줄에 쌓인다.
      if (done && record.sessionId !== nabi.sessionId && storage) {
        createdAt = record.createdAt;
        removeHistory(storage, record.sessionId);
        lastAt = 0;
        write();
      }
      return done;
    },
    forget: () => (storage ? removeHistory(storage, nabi.sessionId) : false),
    remove: (sessionId) => (storage ? removeHistory(storage, sessionId) : false),
    clear: () => (storage ? clearHistory(storage) : false),
    sessionId: nabi.sessionId,
    ask: nabi.$ask,
    toast: nabi.$toast,
    unmount: stop,
  };
}
