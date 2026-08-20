// 상태 엔진 — 문서 + 캐럿 + undo 를 드는 인스턴스. 커맨드의 유일한 문 하나, 신호 하나.
// 모듈 전역 가변 상태 없음 — 전부 이 팩토리의 클로저 안에 산다.
import {
  $fromJson,
  $guarded,
  $toJson,
  cocoon,
  type NabiDoc,
} from '../schema/index.js';
import type { EditEnv } from '../doc/index.js';
import {
  caretAt,
  docStart,
  isCollapsed,
  makeArmed,
  marksAt,
  ordered,
  sameSelection,
  selectionExists,
  type ArmedState,
  type Selection,
} from '../caret/index.js';
import {
  importDoc,
  renderEditorHtml,
  renderHtml,
  type HtmlBuilders,
  type HtmlOptions,
  type ImportOptions,
  type ParseNode,
} from '../html/index.js';
import { attrsArg, coreCommands, markArg, type Command, type CommandArgs } from './commands.js';
import { diffParagraphs, type NabiChange } from './signal.js';
import { toastAsk, type Ask } from './ask.js';
import { TOAST_MAX, TOAST_MS, type Toast } from './toast.js';
import { translate } from '../locale/index.js';

// 부른 손 — 이 커맨드를 누가 눌렀는가 (084 ⑨). 문(door)은 이것으로 접힌 캐럿의 마크 몸짓을
// 가른다: 'keyboard' 는 예약을 만들고(Shift 연타 힌트·가속키·호스트의 프로그램 호출이 다
// 이쪽이다 — 안 밝힌 손은 키보드로 친다), 'pointer'(직접 클릭·탭)는 예약을 안 만든다 —
// 걸 글자가 없으면 아무 일도 않고 toast 로 "적용할 대상이 없다"고 말한다.
// 터치 사용자가 예약을 잃는 것은 주인이 감수한 값이다(084 ask ⑦ — "그러려면 선택을 해야 한다").
export type CommandHand = 'keyboard' | 'pointer';

export interface NabiOptions {
  // 갈래 지식 — 07(wing 계약)이 등록 선언에서 짓는다. 그 전에는 손으로 짠 환경을 준다.
  readonly env: EditEnv;
  // 시작 문서 — 사용자 JSON. 안 주면 빈 문서(빈 문단 하나)다.
  readonly doc?: unknown;
  // wing 커맨드 — 코어 내장 위에 얹힌다. 같은 이름은 얹은 쪽이 이긴다.
  readonly commands?: Readonly<Record<string, Command>>;
  // wing 의 toHtml 조립 맵 — 07 이 짓는다.
  readonly builders?: HtmlBuilders;
  readonly allowLocalUrls?: boolean;
  // 들여오기 파서 주입 — DOM 환경은 html/parse 의 어댑터를, 그물은 초소형 토크나이저를 준다.
  readonly parseHtml?: (html: string) => readonly ParseNode[];
  // wing 의 역방향 주장(claimsHtml 류) — 07 이 잇는다.
  readonly claim?: ImportOptions['claim'];
  // 묻는 길 — 끼운 칸만 이긴다(부분이라 그렇다). 안 끼운 `message` 는 core toast(info) 로
  // 흐르고, 안 끼운 `confirm` 은 "아니오" 다 — 브라우저 confirm 만 끼우고 말은 toast 에
  // 맡기는 호스트가 있어서 통짜가 아니라 부분이다.
  readonly ask?: Partial<Ask>;
  // 알리는 길 — 끼우면 표시가 통째로 그쪽으로 간다(core 기본 toast 는 한 번도 안 불린다).
  readonly toast?: Toast;
  // 기본 toast 의 결 둘 — 살아 있는 시간(ms)과 동시에 서는 상한. **기본 그릇의 것**이다:
  // 콜백을 끼운 호스트는 제 그릇의 결을 제가 정하므로 이 둘이 안 걸린다.
  readonly toastMs?: number;
  readonly toastMax?: number;
  // 문이 제 이름으로 말할 때의 로케일 (084 ⑨ — 포인터 손의 "적용할 대상이 없다").
  // ui 층의 locale 옵션과 같은 값을 주면 된다. 안 주면 en 이다(사전 폴백 규칙 그대로).
  readonly locale?: string;
}

export interface Nabi {
  // --- 사용자(호스트)용 ---------------------------------------------------------------------
  readonly sessionId: string;
  getJson(): unknown[];
  // **빈 값은 빈 문서다** — `null`·`undefined`·공백뿐인 글자열·빈 배열은 거절이 아니라
  // 빈 화면으로 앉는다(비우려는 손은 늘 성공한다). 모양이 틀린 값은 그대로 거절(false)이다.
  setJson(value: unknown): boolean;
  getHtml(): string;
  getEditorHtml(): string;
  // 빈 값의 규칙은 `setJson` 과 같고, 그 한 가지는 `parseHtml` 어댑터 없이도 된다.
  setHtml(html: string): boolean;
  // `by` 는 부른 손이다 — 안 주면 'keyboard'. 갈리는 자리는 접힌 캐럿의 마크 몸짓 하나뿐이다:
  // 키보드는 예약이 되고, 포인터는 거절(false) + toast 다. 나머지 커맨드는 손을 안 본다.
  applyCommand(name: string, args?: CommandArgs, by?: CommandHand): boolean;
  select(sel: Selection): boolean;
  getSelection(): Selection;
  undo(): boolean;
  redo(): boolean;
  // 여러 커맨드를 undo 한 걸음으로 — 오토포맷 같은 "사용자에게 한 동작"이 쓴다.
  group(fn: () => void): void;
  onChange(fn: (change: NabiChange) => void): () => void;
  isChanged(): boolean;
  // --- 내부용 (`$` 이름 규약. 은닉 기계는 없다, 이름이 경고다) --------------------
  $doc(): NabiDoc;
  readonly $env: EditEnv;
  readonly $armed: ArmedState;
  readonly $ask: Ask;
  // 알리는 문 하나 — wing·업로드·`Ask.message` 가 전부 이 문으로 말한다. 호스트 콜백(옵션
  // `toast`)이 있으면 그쪽, 없으면 ui 가 세운 기본 그릇($bindToast), 그것도 없으면 침묵.
  readonly $toast: Toast;
  // 기본 그릇이 서는 자리 — ui/toast 가 스스로 건다. 답은 떼는 함수 하나이고, 나중에 선
  // 그릇이 이긴다(한 인스턴스에 그릇은 하나면 된다).
  $bindToast(sink: Toast): () => void;
  // 기본 그릇이 읽는 결 — 옵션 `toastMs`·`toastMax` 의 확정값.
  readonly $toastMs: number;
  readonly $toastMax: number;
  // 문이 제 이름으로 말할 때 쓰는 말 — **화면을 세운 쪽이 건다**(`ui` 의 mount 가 제 `locale` 로).
  //
  // 왜 옵션 하나로 안 두는가: 로케일은 이미 화면 도구마다 선언된다(툴바·상황 줄·업로드…).
  // 코어에도 또 적게 하면 **같은 사실을 두 곳에 선언**하는 꼴이고, 한 곳만 빠지면 화면은
  // 한국어인데 코어만 영어로 말한다 — 실제로 그렇게 어긋났다(주인 신고 2026-08-18).
  // 건 값이 먼저고, 안 걸렸으면 옵션 `locale`, 그것도 없으면 en 이다.
  $bindLocale(locale: string): () => void;
  // 지금 쓰는 말 — 위 세 자리의 확정값이다(그물·호스트가 읽는다).
  $locale(): string;
  // 이름 없는 커맨드 한 번 — surface·wing 이 순수 변환을 같은 문으로 태운다.
  $applyRaw(run: Command, name?: string): boolean;
  // **이 문서가 지금 저장된 것이다** — `isChanged` 의 기준선을 갈아 끼운다.
  //
  // 저장하던 그 순간의 트리를 받는다(지금 트리가 아니다): 저장이 오래 걸리는 동안 친 글자는
  // 여전히 "바뀐 것" 으로 남아야 한다. 저장이 성사됐을 때만 부른다 — 실패한 저장은 기준선이 아니다.
  $markSaved(saved: NabiDoc): void;
  $registerCommand(name: string, command: Command): void;
  // 진행 중 편집 잠금 — 업로드·색칠처럼 "변화 도중"에는 커맨드가 아예 안 돈다.
  // 잠금은 인스턴스의 것이다(전역 깃발이 아니다). 답은 푸는 함수 하나이고, 겹쳐 잠글 수 있다.
  $lock(reason: string): () => void;
  // 지금 잠근 까닭 — 가장 먼저 잠근 쪽의 이름이다. 안 잠겼으면 null.
  $lockedBy(): string | null;
}

interface Snapshot {
  readonly doc: NabiDoc;
  readonly selection: Selection;
}

// 인스턴스의 이름 — 유닉스 시각 + nonce. 정렬되는 이름표이지 비밀이 아니다 (옛 동작 보존).
function makeSessionId(): string {
  const random = globalThis.crypto?.getRandomValues?.(new Uint32Array(1))?.[0];
  const nonce = (random ?? Math.floor(Math.random() * 0xffffffff)).toString(36);
  return `${Date.now()}-${nonce}`;
}

export function createNabi(options: NabiOptions): Nabi {
  const env = options.env;
  const htmlOptions: HtmlOptions = {
    env,
...(options.builders ? { builders: options.builders } : {}),
...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
  };

  const commands = new Map<string, Command>(Object.entries(coreCommands()));
  for (const [name, command] of Object.entries(options.commands ?? {})) commands.set(name, command);

  // --- 상태 (전부 인스턴스 소유) -------------------------------------------------------------
  // 시작 문서도 문이다 — 깨진 값이 조립 중에 던지면 인스턴스가 아예 못 서서 호스트의 마운트가
  // 통째로 죽는다. 거절하고 빈 문서로 선다(모양이 틀린 값이 null 로 거절되는 것과 같은 자리).
  const initial = options.doc !== undefined ? $guarded('doc option', null, () => $fromJson(options.doc, env)) : null;
  let doc: NabiDoc = initial ?? cocoon([], env);
  let cleanDoc: NabiDoc = doc;
  const startAt = (d: NabiDoc): Selection => caretAt(docStart(d, env) ?? { path: [0], offset: 0 });
  let selection: Selection = startAt(doc);
  const past: Snapshot[] = [];
  let future: Snapshot[] = [];
  let typingAt: Selection | null = null;
  let groupDepth = 0;
  let groupPushed = false;
  let groupSelection: Selection | null = null;
  const listeners = new Set<(change: NabiChange) => void>();
  // 진행 중 잠금 — 잡힌 까닭들. 하나라도 있으면 문서를 바꾸는 길이 전부 막힌다.
  // 손잡이는 값이 아니라 객체다 — 같은 까닭으로 둘이 잠가도 서로의 것을 안 푼다.
  const locks: { readonly reason: string }[] = [];
  // 문 안에서 난 예약 변화는 문이 한 신호로 묶는다 — 밖(직접 $armed)에서는 즉시 낸다.
  let inDoor = false;
  let armedDirty = false;
  // 화면이 건 말 — ui 의 mount 가 $bindLocale 로 건다. toast 그릇과 같은 결이다.
  let localeSink: string | null = null;
  const localeNow = (): string => localeSink ?? options.locale ?? 'en';
  // 기본 toast 그릇 — ui 가 $bindToast 로 건다. 인스턴스의 것이라 여기 산다(편집기 둘이면 그릇도 둘).
  let toastSink: Toast | null = null;
  // 알리는 문 — 호스트 콜백이 먼저다. 그릇도 콜백도 없으면(머리 없는 환경) 말은 조용히 사라진다:
  // 알림은 잃어도 되는 말이라 침묵이 맞다(잃으면 안 되는 물음은 `Ask.confirm` 의 길이다).
  const toast: Toast = (level, message, ms) => {
    (options.toast ?? toastSink)?.(level, message, ms);
  };
  const fallbackAsk = toastAsk(toast);

  const emit = (change: NabiChange): void => {
    for (const fn of listeners) fn(change);
  };
  const emitArmedOnly = (): void => {
    emit({ doc: false, selection: false, armed: true, paragraphs: [], removed: [] });
  };

  const armed = makeArmed(() => {
    armedDirty = true;
    if (!inDoor) {
      armedDirty = false;
      emitArmedOnly();
    }
  });

  // 문 안 예약 변화 깃발을 걷어 온다 — 신호에 실을 몫이다.
  const takeArmedFlag = (): boolean => {
    const flag = armedDirty;
    armedDirty = false;
    return flag;
  };

  // 포인터 손의 빈손 — 예약이 설 자리였지만 안 세운다 (084 ⑨). 침묵이 아니라 말로 거절한다:
  // 여기서 조용하면 "이 단추 고장났나?" 가 되고, 그 침묵이 바로 이 라운드가 걷은 혼란이다.
  const refuseArm = (): false => {
    toast('info', translate('noTarget', localeNow()));
    return false;
  };

  // --- 커맨드의 유일한 문 --------------------------------------------------------------------
  const door = (name: string, command: Command, rawArgs: CommandArgs, by: CommandHand = 'keyboard'): boolean => {
    // 진행 중 잠금 — 업로드·색칠이 도는 동안 문서는 아무도 못 바꾼다. 예약도 안 선다.
    if (locks.length > 0) return false;
    // 접힌 캐럿의 마크 버튼 = 예약 (①) — 문서를 안 바꾸고 상태만 만든다. **키보드 손만이다**:
    // 포인터 손은 빈손으로 돌려보낸다 (084 ⑨ — 음수 예약(escape)도 예약이라 같이 거절한다).
    if (isCollapsed(selection)) {
      if (name === 'toggleMark') {
        const mark = markArg(rawArgs);
        if (mark) {
          if (by === 'pointer') return refuseArm();
          armed.arm(mark);
          return true;
        }
      }
      if (name === 'setMark') {
        const w = rawArgs['w'];
        const a = attrsArg(rawArgs);
        if (typeof w === 'string' && a !== undefined) {
          if (by === 'pointer') return refuseArm();
          if (a === null) armed.escape(w);
          else armed.arm({ w, a, ch: [] });
          return true;
        }
      }
    }

    inDoor = true;
    let pendingArmed = false;
    try {
      let args = rawArgs;
      // 입력 순간 — 경계 정규화의 답에 예약을 적용해 소비한다 (③).
      if (name === 'insertText' && args['marks'] === undefined) {
        const text = args['text'];
        if (typeof text !== 'string' || text === '') return false;
        const [start] = ordered(selection);
        args = {...args, marks: armed.takeForInsert(marksAt(doc, start, env)) };
      }

      const result = command(doc, selection, args, env);
      if (result === null) {
        pendingArmed = takeArmedFlag();
        return false;
      }

      // 커맨드가 예약을 답했다 — 문서는 그대로 두고 예약 상태만 만든다 (wing 값 마크의 접힌 캐럿).
      // 이 길도 같은 규칙이다: 포인터 손이면 예약 대신 빈손이다 (084 ⑨ — 문서는 이미 그대로다).
      if (result.arm && isCollapsed(selection)) {
        if (by === 'pointer') return refuseArm();
        armed.arm(result.arm);
        pendingArmed = takeArmedFlag();
        return true;
      }

      // 매 커맨드 cocoon — 어떤 커맨드도 불변식을 깬 문서를 남길 수 없다.
      const cocooned = result.doc === doc ? doc : cocoon(result.doc, env);
      const treeChanged = cocooned !== doc;
      let nextSel = result.selection;
      if (treeChanged && !selectionExists(cocooned, nextSel, env)) nextSel = startAt(cocooned);
      const selChanged = !sameSelection(nextSel, selection);
      if (!treeChanged && !selChanged) {
        // 침묵 — 스냅샷도 신호도 없다.
        pendingArmed = takeArmedFlag();
        return false;
      }

      if (treeChanged) {
        // 이어 친 글자는 스냅샷을 안 쌓는다 — undo 한 번에 방금 친 말이 통째로 걷힌다.
        const coalesce = name === 'insertText' && typingAt !== null && sameSelection(typingAt, selection);
        const grouped = groupDepth > 0;
        if (!coalesce && !(grouped && groupPushed)) {
          // 묶음의 스냅샷은 묶음이 시작될 때의 캐럿을 담는다 — 되돌리기가 그 자리에 선다.
          past.push({ doc, selection: grouped && groupSelection ? groupSelection : selection });
          future = [];
          if (grouped) groupPushed = true;
        }
      }
      typingAt = name === 'insertText' && treeChanged ? nextSel : null;
      // 입력 밖의 몸짓은 예약을 푼다 (②).
      if (name !== 'insertText' && (treeChanged || selChanged)) armed.clear();

      const before = doc;
      doc = cocooned;
      selection = nextSel;
      const diff = treeChanged ? diffParagraphs(before, doc) : { paragraphs: [], removed: [] };
      emit({
        doc: treeChanged,
        selection: selChanged,
        armed: takeArmedFlag(),
        paragraphs: diff.paragraphs,
        removed: diff.removed,
      });
      return true;
    } finally {
      inDoor = false;
      if (pendingArmed) emitArmedOnly();
    }
  };

  // 들어온 값이 **비었는가** — 비었으면 형식 오류가 아니라 빈 문서다 (setJson·setHtml).
  //
  // 비우는 것은 흔한 걸음이다: 새 글을 시작하고, 초안을 버리고, 서버가 아직 아무것도 안 준
  // 자리를 그대로 싣는다. 그때 거절(false)로 답하면 호스트는 "형식이 틀렸다"는 말을 듣고
  // **쓰던 글이 그대로 남는다** — 비우려던 손이 아무 일도 못 한 채로. 빈 화면이 맞는 답이다.
  //
  // 무엇이 비었나: 값이 없거나(null·undefined), 공백뿐인 글자열(`''`·`'  '`·빈 HTML), 빈 배열.
  // 여기 안 걸리는 값은 여전히 제 문을 지난다 — 모양이 틀린 값은 그대로 거절이다(빈 것과
  // 틀린 것은 다르다).
  const blank = (value: unknown): boolean =>
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);

  // 문서 교체 (setJson·setHtml) — undo 한 점을 남기고, 이 문서가 새 기준선(cleanDoc)이 된다.
  const load = (next: NabiDoc): void => {
    inDoor = true;
    try {
      past.push({ doc, selection });
      future = [];
      const before = doc;
      doc = next;
      cleanDoc = next;
      selection = startAt(next);
      typingAt = null;
      armed.clear();
      const diff = diffParagraphs(before, doc);
      emit({
        doc: true,
        selection: true,
        armed: takeArmedFlag(),
        paragraphs: diff.paragraphs,
        removed: diff.removed,
      });
    } finally {
      inDoor = false;
    }
  };

  // 시간 여행 (undo·redo) — 캐럿 이동은 역사의 새 갈래가 아니므로 redo 는 select 에 안 죽는다.
  const travel = (from: Snapshot[], to: Snapshot[]): boolean => {
    if (locks.length > 0) return false; // 잠긴 동안은 시간 여행도 편집이다
    const snap = from.pop();
    if (!snap) return false;
    inDoor = true;
    try {
      to.push({ doc, selection });
      const before = doc;
      const beforeSel = selection;
      doc = snap.doc;
      selection = selectionExists(doc, snap.selection, env) ? snap.selection : startAt(doc);
      typingAt = null;
      armed.clear();
      const diff = diffParagraphs(before, doc);
      emit({
        doc: before !== doc,
        selection: !sameSelection(beforeSel, selection),
        armed: takeArmedFlag(),
        paragraphs: diff.paragraphs,
        removed: diff.removed,
      });
    } finally {
      inDoor = false;
    }
    return true;
  };

  const nabi: Nabi = {
    sessionId: makeSessionId(),

    getJson() {
      return $toJson(doc);
    },
    setJson(value) {
      if (locks.length > 0) return false;
      // 빈 값은 형식 오류가 아니다 — **빈 문서**다 (아래 blank 의 그 규칙).
      if (blank(value)) {
        load(cocoon([], env));
        return true;
      }
      // 조립 중에 던지는 값도 거절(false)이다 — 예외가 문 밖으로 못 나간다 ($guarded).
      const parsed = $guarded('setJson', null, () => $fromJson(value, env));
      if (!parsed) return false;
      load(parsed);
      return true;
    },
    getHtml() {
      return renderHtml(doc, htmlOptions);
    },
    getEditorHtml() {
      return renderEditorHtml(doc, htmlOptions);
    },
    setHtml(html) {
      if (locks.length > 0) return false;
      // 빈 값은 파서 없이도 답이 있다 — 읽을 것이 없으니 빈 문서다. `parseHtml` 을 안 꽂은
      // 호스트도 "비우기"만은 할 수 있다.
      if (blank(html)) {
        load(cocoon([], env));
        return true;
      }
      const parse = options.parseHtml;
      if (!parse) return false;
      // 파싱·들여오기·cocoon 까지가 바깥 데이터의 걸음이다 — 던지면 거절(false)로 바뀐다.
      const next = $guarded('setHtml', null, () => {
        const nodes = parse(html);
        const imported = importDoc(nodes, {
          env,
          ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
          ...(options.claim ? { claim: options.claim } : {}),
        });
        return cocoon(imported, env);
      });
      if (!next) return false;
      load(next);
      return true;
    },

    applyCommand(name, args = {}, by = 'keyboard') {
      const command = commands.get(name);
      if (!command) return false;
      return door(name, command, args, by);
    },

    select(sel) {
      if (!sel || !selectionExists(doc, sel, env)) return false;
      if (sameSelection(sel, selection)) return false;
      typingAt = null;
      inDoor = true;
      let armedFlag = false;
      try {
        armed.clear();
        armedFlag = takeArmedFlag();
        selection = sel;
      } finally {
        inDoor = false;
      }
      emit({ doc: false, selection: true, armed: armedFlag, paragraphs: [], removed: [] });
      return true;
    },

    getSelection() {
      return selection;
    },

    undo() {
      return travel(past, future);
    },
    redo() {
      return travel(future, past);
    },

    group(fn) {
      if (groupDepth === 0) {
        groupPushed = false;
        groupSelection = selection;
      }
      groupDepth += 1;
      try {
        fn();
      } finally {
        groupDepth -= 1;
        if (groupDepth === 0) groupSelection = null;
      }
    },

    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    $markSaved(saved) {
      cleanDoc = saved;
    },
    isChanged() {
      return doc !== cleanDoc;
    },

    // --- $ 내부용 ---------------------------------------------------------------------------
    $doc() {
      return doc;
    },
    $env: env,
    $armed: armed,
    // 기본은 "message 는 toast(info)·confirm 은 아니오"(toastAsk) 다 — 호스트는 끼운 칸만
    // 이긴다. 스프레드로 안 섞는 까닭 둘: 호스트 상자의 `this` 가 끊기면 안 되고(메서드 호출로
    // 부른다), 값이 undefined 인 칸이 기본을 밀어내면 안 된다.
    $ask: {
      message: (text) => (options.ask?.message ? options.ask.message(text) : fallbackAsk.message(text)),
      confirm: (text) => (options.ask?.confirm ? options.ask.confirm(text) : fallbackAsk.confirm(text)),
    },
    $toast: toast,
    $bindToast(sink) {
      toastSink = sink;
      // 자기 것일 때만 걷는다 — 나중에 선 그릇을 먼저 선 그릇의 unmount 가 밀어내면 안 된다.
      return () => {
        if (toastSink === sink) toastSink = null;
      };
    },
    $toastMs: options.toastMs ?? TOAST_MS,
    $toastMax: options.toastMax ?? TOAST_MAX,
    $bindLocale(locale) {
      localeSink = locale;
      // 자기 것일 때만 걷는다 — 나중에 선 화면을 먼저 선 화면의 unmount 가 밀어내면 안 된다.
      return () => {
        if (localeSink === locale) localeSink = null;
      };
    },
    $locale: localeNow,
    $applyRaw(run, name = '$raw') {
      return door(name, run, {});
    },
    $registerCommand(name, command) {
      commands.set(name, command);
    },
    $lock(reason) {
      const token = { reason };
      locks.push(token);
      // 두 번 불러도 한 번만 푼다 — 실패 갈래와 성공 갈래가 같은 손잡이를 쥐고 있기 때문이다.
      return () => {
        const at = locks.indexOf(token);
        if (at !== -1) locks.splice(at, 1);
      };
    },
    $lockedBy() {
      return locks[0]?.reason ?? null;
    },
  };

  return nabi;
}
