import type { LocaleInput } from '../locale/index.js';
// 상태 엔진 — 문서 + 캐럿 + undo 를 드는 인스턴스. 커맨드의 유일한 문 하나, 신호 하나.
// The state engine: an instance holding doc + caret + undo, with one door for commands and one signal.
// 모듈 전역 가변 상태 없음 — 전부 이 팩토리의 클로저 안에 산다.
// No module-level mutable state; everything lives inside this factory's closure.
import { $fromJson, $guarded, $toJson, cocoon, type ElementNode, type NabiDoc } from '../schema/index.js';
import { $callbackTree } from '../schema/json.js';
import type { EditEnv } from '../doc/index.js';
import {
  caretAt,
  docStart,
  isCollapsed,
  makeArmed,
  marksAt,
  normalizeSelection,
  ordered,
  sameSelection,
  type Selection,
} from '../caret/index.js';
import {
  renderEditorHtml,
  renderHtml,
  type HtmlBuilders,
  type HtmlOptions,
  type ImportOptions,
  type ParseNode,
} from '../html/index.js';
import { $importDoc } from '../html/import.js';
import { attrsArg, coreCommands, markArg, type Command, type CommandArgs, type CommandOutcome } from './commands.js';
import { diffParagraphs, type NabiChange } from './signal.js';
import { toastAsk, type Ask, type Choose } from './ask.js';
import { TOAST_MAX, TOAST_MS, type Toast } from './toast.js';
import { localeValue, translate } from '../locale/index.js';
import { bindHost, type NabiHost } from './host.js';
import {
  callbackEnv,
  callbackSelection,
  frozenSelection,
  makeSessionId,
  snapshotArgs,
  snapshotCommandResult,
  snapshotSelection,
  type Snapshot,
  type CommandResultSnapshot,
} from './nabi-internals.js';

// 부른 손 — 이 커맨드를 누가 눌렀는가. 문(door)은 이것으로 접힌 캐럿의 마크 몸짓을 가른다: 'keyboard'는 예약을 만들고, 'pointer'(직접 클릭·탭)는 예약 대신 거절+toast다.
// Which hand invoked this command; the door uses it to branch a collapsed caret's mark gesture: 'keyboard' arms a reservation, 'pointer' (a direct click/tap) gets a rejection + toast instead.
export type CommandHand = 'keyboard' | 'pointer';

export interface NabiOptions {
  // 시작 문서 — 사용자 JSON. 안 주면 빈 문서(빈 문단 하나)다.
  // The starting document as user JSON; an empty doc (one blank paragraph) if omitted.
  readonly doc?: unknown;
  readonly allowLocalUrls?: boolean;
  // 묻는 길 — 끼운 칸만 이긴다(부분이라 그렇다). 안 끼운 message는 core toast(info)로 흐르고, 안 끼운 confirm은 "아니오"다.
  // A way to ask the person; only the fields supplied take effect (it's partial) — an unset message falls through to core's toast(info), and an unset confirm answers "no".
  readonly ask?: Partial<Ask>;
  // 알리는 길 — 끼우면 표시가 통째로 그쪽으로 간다(core 기본 toast는 한 번도 안 불린다).
  // A way to surface notifications; supplying it takes over display entirely, so core's default toast is never invoked.
  readonly toast?: Toast;
  // 기본 toast의 결 둘 — 살아 있는 시간(ms)과 동시에 서는 상한. 콜백을 끼운 호스트는 제 그릇의 결을 제가 정하므로 이 둘이 안 걸린다.
  // Two knobs for the default toast: its lifetime (ms) and how many can stack; a host supplying its own toast callback sets its own timing instead, so these have no effect there.
  readonly toastMs?: number;
  readonly toastMax?: number;
  // Command/repair/cocoon and listener failures are isolated and reported here.
  // 커맨드·repair·cocoon·리스너의 실패는 여기로 격리되어 보고된다.
  readonly onError?: (error: unknown) => void;
  // Maximum local undo snapshots. The default is 200 and values must be positive integers.
  // 로컬 undo 스냅샷 상한 — 기본 200, 양의 정수여야 한다.
  readonly undoLimit?: number;
  // Consecutive typing merge window in milliseconds. The default is 1000; 0 disables merging.
  // 연속 타이핑을 한 스냅샷으로 묶는 시간(ms) — 기본 1000, 0이면 병합을 끈다.
  readonly typingMergeMs?: number;
  // 문이 제 이름으로 말할 때의 로케일 — ui 층의 locale 옵션과 같은 값을 주면 된다. 안 주면 en이다.
  // The locale the door speaks in on its own (e.g. the pointer-hand rejection toast); pass the same value as the ui layer's locale option — defaults to en.
  readonly locale?: LocaleInput;
}

export interface NabiCoreOptions extends NabiOptions {
  readonly env: EditEnv;
  readonly commands?: Readonly<Record<string, Command>>;
  readonly builders?: HtmlBuilders;
  readonly parseHtml?: (html: string) => readonly ParseNode[];
  readonly claim?: ImportOptions['claim'];
}

export interface Nabi {
  // --- 사용자(호스트)용 ---------------------------------------------------------------------
  readonly sessionId: string;
  getJson(): unknown[];
  // 빈 값은 빈 문서다 — null·undefined·공백뿐인 글자열·빈 배열은 거절이 아니라 빈 화면으로 앉는다. 모양이 틀린 값은 그대로 거절(false)이다.
  // An empty value means an empty document — null, undefined, a blank string, or an empty array all land as a blank doc rather than a rejection; only a malformed value is rejected (false).
  setJson(value: unknown): boolean;
  getHtml(): string;
  getEditorHtml(): string;
  // 빈 값의 규칙은 setJson과 같고, 그 한 가지는 parseHtml 어댑터 없이도 된다.
  // Follows setJson's empty-value rule; that one case works even without a parseHtml adapter.
  setHtml(html: string): boolean;
  // by는 부른 손이다 — 안 주면 'keyboard'. 갈리는 자리는 접힌 캐럿의 마크 몸짓 하나뿐이다: 키보드는 예약이 되고, 포인터는 거절(false)+toast다.
  // `by` is which hand called this, defaulting to 'keyboard'; the only place it branches is a collapsed caret's mark gesture — keyboard arms it, pointer gets rejected (false) + a toast.
  applyCommand(name: string, args?: CommandArgs, by?: CommandHand): boolean;
  select(sel: Selection): boolean;
  getSelection(): Selection;
  undo(): boolean;
  redo(): boolean;
  // 여러 커맨드를 undo 한 걸음으로 — 오토포맷 같은 "사용자에게 한 동작"이 쓴다.
  // Groups several commands into one undo step; used by things like autoformat that read as a single user action.
  group(fn: () => void): void;
  onChange(fn: (change: NabiChange) => void): () => void;
  isChanged(): boolean;
}

export function createNabi(options: NabiCoreOptions): Nabi {
  const env = options.env;
  const customEnv = callbackEnv(env);
  const undoLimit = options.undoLimit ?? 200;
  const typingMergeMs = options.typingMergeMs ?? 1_000;
  if (!Number.isInteger(undoLimit) || undoLimit < 1) throw new RangeError('undoLimit must be a positive integer');
  if (!Number.isFinite(typingMergeMs) || typingMergeMs < 0)
    throw new RangeError('typingMergeMs must be a non-negative number');
  const htmlOptions: HtmlOptions = {
    env,
    ...(options.builders ? { builders: options.builders } : {}),
    ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
  };

  const core = coreCommands();
  const trustedCommands = new Set<Command>(Object.values(core));
  const commands = new Map<string, Command>(Object.entries(core));
  for (const [name, command] of Object.entries(options.commands ?? {})) commands.set(name, command);
  const commandLayers = new Map<
    string,
    {
      readonly baseline: Command | undefined;
      readonly entries: { readonly command: Command }[];
    }
  >();

  // --- 상태 (전부 인스턴스 소유) -------------------------------------------------------------
  // 시작 문서도 문이다 — 깨진 값이 조립 중에 던지면 인스턴스가 못 서서 호스트의 마운트이 통째로 죽는다. 거절하고 빈 문서로 선다.
  // The starting doc goes through the door too — a broken value throwing during assembly would kill the instance and the host's whole mount with it, so it's rejected and falls back to an empty doc instead.
  const initial = options.doc !== undefined ? $guarded('doc option', null, () => $fromJson(options.doc, env)) : null;
  let doc: NabiDoc = initial ?? cocoon([], env);
  let cleanDoc: NabiDoc = doc;
  const startAt = (d: NabiDoc): Selection => frozenSelection(caretAt(docStart(d, env) ?? { path: [0], offset: 0 }));
  let selection: Selection = startAt(doc);
  const past: Snapshot[] = [];
  let future: Snapshot[] = [];
  let typingAt: Selection | null = null;
  let typingTime = 0;
  let groupDepth = 0;
  let groupPushed = false;
  let groupSelection: Selection | null = null;
  const listeners = new Set<(change: NabiChange) => void>();
  const pushSnapshot = (stack: Snapshot[], snapshot: Snapshot): void => {
    stack.push(snapshot);
    if (stack.length > undoLimit) stack.splice(0, stack.length - undoLimit);
  };
  // 진행 중 잠금 — 잡힌 까닭들. 하나라도 있으면 문서를 바꾸는 길이 전부 막힌다. 손잡이는 값이 아니라 객체다 — 같은 까닭으로 둘이 잠가도 서로의 것을 안 푼다.
  // In-progress locks, one entry per reason held; any entry blocks every doc-changing path. The handle is an object, not a value, so two locks with the same reason string don't release each other.
  const locks: { readonly reason: string }[] = [];
  // 문 안에서 난 예약 변화는 문이 한 신호로 묶는다 — 밖(직접 $armed)에서는 즉시 낸다.
  // An armed-state change from inside the door is folded into that one signal; from outside (armed called directly) it fires immediately.
  let inDoor = false;
  let armedDirty = false;
  // 화면이 건 그릇들 — 나중에 선 화면이 이기고, 그 화면을 먼저 떼면 아직 산 바로 아래 화면이 다시 드러난다. 등록 값이 같아도 해제는 entry 자기 것만 걷는다.
  // Sinks stacked by screens — the most recently mounted wins, and removing it first reveals whatever screen is still under it; unbinding always removes just its own entry, even if the value matches another.
  const localeSinks: { readonly value: LocaleInput }[] = [];
  const toastSinks: { readonly value: Toast }[] = [];
  const chooseSinks: { readonly value: Choose }[] = [];
  const bindSink = <T>(sinks: { readonly value: T }[], value: T): (() => void) => {
    const entry = { value };
    sinks.push(entry);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      const at = sinks.indexOf(entry);
      if (at !== -1) sinks.splice(at, 1);
    };
  };
  const localeNow = (): string => localeValue(localeSinks.at(-1)?.value ?? options.locale);
  // 알리는 문 — 호스트 콜백이 먼저다. 그릇도 콜백도 없으면(머리 없는 환경) 말은 조용히 사라진다 — 알림은 잃어도 되는 말이라 침묵이 맞다.
  // The notification path prefers the host callback; with neither a callback nor a sink (headless), the message quietly vanishes — a notification is fine to lose, unlike an Ask.confirm question.
  const report = (error: unknown): void => {
    if (options.onError) {
      try {
        options.onError(error);
      } catch {
        // 에러 보고 자체가 새 편집기 오류가 되면 안 된다.
        // Error reporting must not become another editor failure.
      }
      return;
    }
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error('[nabi-note] editor callback failed', error);
    }
  };
  const isolateAsync = <T>(value: T | Promise<T>, fallback: T): T | Promise<T> => {
    if ((typeof value !== 'object' || value === null) && typeof value !== 'function') return value;
    try {
      if (typeof (value as { readonly then?: unknown }).then !== 'function') return value;
      return Promise.resolve(value).catch((error) => {
        report(error);
        return fallback;
      });
    } catch (error) {
      report(error);
      return fallback;
    }
  };
  const toast: Toast = (level, message, ms) => {
    try {
      (options.toast ?? toastSinks.at(-1)?.value)?.(level, message, ms);
    } catch (error) {
      report(error);
    }
  };
  const fallbackAsk = toastAsk(toast);

  const emit = (change: NabiChange): void => {
    const snapshot = Object.freeze({
      ...change,
      paragraphs: Object.freeze([...change.paragraphs]),
      removed: Object.freeze([...change.removed]),
    });
    for (const fn of listeners) {
      try {
        fn(snapshot);
      } catch (error) {
        report(error);
      }
    }
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
  // Collects the in-door armed-change flag, to be carried on the outgoing signal.
  const takeArmedFlag = (): boolean => {
    const flag = armedDirty;
    armedDirty = false;
    return flag;
  };

  // 포인터 손의 빈손 — 예약이 설 자리였지만 안 세운다. 침묵이 아니라 말로 거절한다 — 조용하면 "이 단추 고장났나?"가 된다.
  // A pointer hand's empty-handed case: a reservation would have been armed but isn't. Rejected out loud, not silently — silence here just reads as "is this button broken?"
  const refuseArm = (): false => {
    toast('info', translate('noTarget', localeNow()));
    return false;
  };

  const invalidCommand = (name: string, detail: string): false => {
    report(new TypeError(`command ${name}: ${detail}`));
    return false;
  };

  const armedMarks = (base: readonly ElementNode[]): readonly ElementNode[] => {
    const pending = armed.peek();
    const stripped = base.filter((mark) => !pending.minus.includes(mark.w));
    return [...stripped.filter((mark) => !pending.plus.some((armedMark) => armedMark.w === mark.w)), ...pending.plus];
  };

  // --- 커맨드의 유일한 문 --------------------------------------------------------------------
  const door = (name: string, command: Command, rawArgs: CommandArgs, by: CommandHand = 'keyboard'): boolean => {
    // 진행 중 잠금 — 업로드·색칠이 도는 동안 문서는 아무도 못 바꾼다. 예약도 안 선다.
    // An in-progress lock: while an upload or paint is running, no one can change the doc, and arming is blocked too.
    if (locks.length > 0) return false;
    let args: CommandArgs;
    try {
      const copied = snapshotArgs(rawArgs);
      if (!copied) return invalidCommand(name, 'invalid arguments');
      args = copied;
    } catch (error) {
      report(error);
      return false;
    }

    // 접힌 캐럿의 마크 버튼 = 예약 — 문서를 안 바꾸고 상태만 만든다. 키보드 손만이다: 포인터 손은 빈손으로 돌려보낸다(음수 예약도 예약이라 같이 거절한다).
    // A mark button on a collapsed caret means arming — it changes only state, never the doc. Keyboard hand only: a pointer hand is sent away empty-handed, and a negative reservation (escape) is rejected the same way since it's still a reservation.
    if (isCollapsed(selection)) {
      if (name === 'toggleMark') {
        const mark = markArg(args);
        if (mark) {
          if (by === 'pointer') return refuseArm();
          armed.arm(mark);
          return true;
        }
      }
      if (name === 'setMark') {
        const w = args['w'];
        const a = attrsArg(args);
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
      let commandArgs = args;
      let consumeArmed = false;
      // 입력 순간 — 경계 정규화의 답에 예약을 적용해 소비한다.
      // At insert time, apply and consume the armed reservation onto boundary normalization's answer.
      if (name === 'insertText' && commandArgs['marks'] === undefined) {
        const text = commandArgs['text'];
        if (typeof text !== 'string' || text === '') return false;
        const [start] = ordered(selection);
        consumeArmed = !armed.isEmpty();
        commandArgs = Object.freeze({ ...commandArgs, marks: Object.freeze(armedMarks(marksAt(doc, start, env))) });
      }

      const trusted = trustedCommands.has(command);
      const given = trusted ? null : $callbackTree(doc);
      let rawResult: CommandOutcome | null;
      try {
        rawResult = command(
          trusted ? doc : ((given as NonNullable<typeof given>).nodes as NabiDoc),
          trusted ? selection : callbackSelection(selection),
          commandArgs,
          trusted ? env : customEnv,
        );
      } catch (error) {
        report(error);
        return false;
      }
      if (rawResult === null) {
        pendingArmed = takeArmedFlag();
        return false;
      }
      let result: CommandResultSnapshot | null;
      try {
        result = trusted
          ? rawResult
          : snapshotCommandResult(rawResult, doc, (given as NonNullable<typeof given>).originals);
      } catch (error) {
        report(error);
        return false;
      }
      if (result === null) {
        pendingArmed = takeArmedFlag();
        return invalidCommand(name, 'invalid result');
      }

      // 예약 답은 현재 문서와 캐럿을 그대로 둔다는 계약이므로 cocoon 전에 끝낸다 — 받은 답 자체가 현 상태를 그대로 가리키는지만 본다.
      // An armed result is contracted to leave the current doc and caret untouched, so this resolves before cocoon runs — it just checks the returned answer still points at the current state as-is.
      if (result.arm && isCollapsed(selection)) {
        if (result.doc !== doc || !sameSelection(result.selection, selection))
          return invalidCommand(name, 'armed result changed editor state');
        if (by === 'pointer') return refuseArm();
        armed.arm(result.arm);
        pendingArmed = takeArmedFlag();
        return true;
      }

      // 매 커맨드 cocoon — 어떤 커맨드도 불변식을 깬 문서를 남길 수 없다.
      // cocoon runs after every command; no command may leave a doc that breaks an invariant.
      let cocooned: NabiDoc;
      try {
        cocooned = cocoon(result.doc, env);
      } catch (error) {
        report(error);
        return false;
      }
      const normalized = normalizeSelection(cocooned, result.selection, env);
      if (!normalized) return invalidCommand(name, 'selection does not exist in result document');
      const nextSel = frozenSelection(normalized);

      const treeChanged = cocooned !== doc;
      const selChanged = !sameSelection(nextSel, selection);
      if (!treeChanged && !selChanged) {
        // 침묵 — 스냅샷도 신호도 없다.
        pendingArmed = takeArmedFlag();
        return false;
      }

      if (treeChanged) {
        // 이어 친 글자는 스냅샷을 안 쌓는다 — undo 한 번에 방금 친 말이 통째로 걷힌다.
        // Consecutive typed characters skip pushing a snapshot, so one undo clears the whole run just typed.
        const now = Date.now();
        const coalesce =
          name === 'insertText' &&
          typingMergeMs > 0 &&
          typingAt !== null &&
          now - typingTime <= typingMergeMs &&
          sameSelection(typingAt, selection);
        const grouped = groupDepth > 0;
        if (!coalesce && !(grouped && groupPushed)) {
          // 묶음의 스냅샷은 묶음이 시작될 때의 캐럿을 담는다 — 되돌리기가 그 자리에 선다.
          // A group's snapshot carries the caret from when the group started, so undo lands there.
          pushSnapshot(past, { doc, selection: grouped && groupSelection ? groupSelection : selection });
          future = [];
          if (grouped) groupPushed = true;
        }
        typingTime = name === 'insertText' ? now : 0;
      }
      typingAt = name === 'insertText' && treeChanged ? nextSel : null;
      if (consumeArmed && treeChanged) armed.clear();
      // 입력 밖의 몸짓은 예약을 푼다.
      // Any gesture other than insertion clears the armed reservation.
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

  // 들어온 값이 비었는가 — 비었으면 형식 오류가 아니라 빈 문서다(setJson·setHtml). 거절(false)로 답하면 비우려던 손이 아무 일도 못 한 채 쓰던 글만 남으므로, 빈 화면이 맞는 답이다.
  // Whether the incoming value is empty — if so it's a blank doc, not a format error (setJson/setHtml); rejecting (false) would leave the old content behind with nothing accomplished, so an empty screen is the correct answer.
  // 무엇이 비었나: 값이 없거나(null·undefined), 공백뿐인 글자열, 빈 배열. 여기 안 걸리는 값은 제 문을 지난다 — 모양이 틀린 값은 그대로 거절이다.
  // What counts as empty: no value (null/undefined), or a whitespace-only string; anything else still goes through normal validation, so a malformed value is still rejected.
  const blank = (value: unknown): boolean =>
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

  // 문서 교체 (setJson·setHtml) — undo 한 점을 남기고, 이 문서가 새 기준선(cleanDoc)이 된다.
  // Replacing the document (setJson/setHtml): leaves one undo point, and this doc becomes the new baseline (cleanDoc).
  const load = (next: NabiDoc): void => {
    inDoor = true;
    try {
      pushSnapshot(past, { doc, selection });
      future = [];
      const before = doc;
      doc = next;
      cleanDoc = next;
      selection = startAt(next);
      typingAt = null;
      typingTime = 0;
      armed.clear();
      const diff = diffParagraphs(before, doc);
      emit({
        doc: true,
        selection: true,
        armed: takeArmedFlag(),
        loaded: true,
        paragraphs: diff.paragraphs,
        removed: diff.removed,
      });
    } finally {
      inDoor = false;
    }
  };

  // 시간 여행 (undo·redo) — 캐럿 이동은 역사의 새 갈래가 아니므로 redo 는 select 에 안 죽는다.
  // Time travel (undo/redo); a caret move isn't a new branch of history, so redo survives a select.
  const travel = (from: Snapshot[], to: Snapshot[]): boolean => {
    if (locks.length > 0) return false; // 잠긴 동안은 시간 여행도 편집이다
    const snap = from.pop();
    if (!snap) return false;
    inDoor = true;
    try {
      pushSnapshot(to, { doc, selection });
      const before = doc;
      const beforeSel = selection;
      doc = snap.doc;
      const normalized = normalizeSelection(doc, snap.selection, env);
      selection = normalized ? frozenSelection(normalized) : startAt(doc);
      typingAt = null;
      typingTime = 0;
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
      if (blank(value)) {
        load(cocoon([], env));
        return true;
      }
      // 조립 중에 던지는 값도 거절(false)이다 — 예외가 문 밖으로 못 나간다.
      // A value that throws during assembly is rejected (false) too; exceptions never escape this door.
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
      // 빈 값은 파서 없이도 답이 있다 — 읽을 것이 없으니 빈 문서다. parseHtml을 안 꽂은 호스트도 "비우기"만은 할 수 있다.
      // An empty value has an answer even without a parser — nothing to read means an empty doc, so a host without parseHtml wired up can still clear.
      if (blank(html)) {
        load(cocoon([], env));
        return true;
      }
      const parse = options.parseHtml;
      if (!parse) return false;
      // 파싱·들여오기·cocoon 까지가 바깥 데이터의 걸음이다 — 던지면 거절(false)로 바뀐다.
      // Parsing, importing, and cocoon are all one step for outside data; any throw becomes a rejection (false).
      const next = $guarded('setHtml', null, () => {
        const nodes = parse(html);
        return $importDoc(nodes, {
          env,
          ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
          ...(options.claim ? { claim: options.claim } : {}),
        });
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
      let copied: Selection | null;
      try {
        copied = snapshotSelection(sel);
      } catch {
        return false;
      }
      const normalized = copied ? normalizeSelection(doc, copied, env) : null;
      if (!normalized) return false;
      const next = frozenSelection(normalized);
      if (sameSelection(next, selection)) return false;
      typingAt = null;
      typingTime = 0;
      inDoor = true;
      let armedFlag = false;
      try {
        armed.clear();
        armedFlag = takeArmedFlag();
        selection = next;
      } finally {
        inDoor = false;
      }
      emit({ doc: false, selection: true, armed: armedFlag, paragraphs: [], removed: [] });
      return true;
    },

    getSelection() {
      return frozenSelection(selection);
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

    isChanged() {
      return doc !== cleanDoc;
    },
  };

  const host: NabiHost = {
    doc: () => doc,
    env,
    armed,
    // 기본은 toastAsk("message는 toast(info)·confirm은 아니오")다 — 호스트는 끼운 칸만 이긴다. 스프레드로 안 섞는 까닭: 호스트 상자의 this가 끊기면 안 되고, undefined인 칸이 기본을 밀어내면 안 된다.
    // Defaults to toastAsk ("message goes to toast(info), confirm answers no") — only fields the host actually supplies take effect. Not merged via spread, since that would break the host object's `this` binding and let an undefined field shadow the default.
    ask: {
      message: (text) => {
        try {
          return options.ask?.message ? options.ask.message(text) : fallbackAsk.message(text);
        } catch (error) {
          report(error);
        }
      },
      confirm: (text) => {
        try {
          const answer = options.ask?.confirm ? options.ask.confirm(text) : fallbackAsk.confirm(text);
          return isolateAsync(answer, false);
        } catch (error) {
          report(error);
          return false;
        }
      },
      // 3단이다 — 호스트가 끼운 상자, 화면이 건 판, 그리고 아무도 없으면 첫째(0).
      // Three tiers: the host's own callback, a screen-mounted panel, or (with neither) the first option (0).
      choose: (question, choices) => {
        try {
          const answer = options.ask?.choose
            ? options.ask.choose(question, choices)
            : (chooseSinks.at(-1)?.value(question, choices) ?? 0);
          return isolateAsync(answer, -1);
        } catch (error) {
          report(error);
          return 0;
        }
      },
    },
    toast,
    bindToast(sink) {
      return bindSink(toastSinks, sink);
    },
    bindChoose(sink) {
      return bindSink(chooseSinks, sink);
    },
    toastMs: options.toastMs ?? TOAST_MS,
    toastMax: options.toastMax ?? TOAST_MAX,
    bindLocale(locale) {
      return bindSink(localeSinks, locale);
    },
    locale: localeNow,
    applyRaw(run, name = 'raw') {
      return door(name, run, {});
    },
    markSaved(saved) {
      cleanDoc = saved;
    },
    registerCommand(name, command) {
      let layer = commandLayers.get(name);
      if (!layer) {
        layer = { baseline: commands.get(name), entries: [] };
        commandLayers.set(name, layer);
      }
      const entry = { command };
      layer.entries.push(entry);
      commands.set(name, command);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        const at = layer?.entries.indexOf(entry) ?? -1;
        if (!layer || at === -1) return;
        const top = at === layer.entries.length - 1;
        layer.entries.splice(at, 1);
        if (top && commands.get(name) === command) {
          const previous = layer.entries.at(-1)?.command ?? layer.baseline;
          if (previous) commands.set(name, previous);
          else commands.delete(name);
        }
        if (layer.entries.length === 0) commandLayers.delete(name);
      };
    },
    lock(reason) {
      const token = { reason };
      locks.push(token);
      // 두 번 불러도 한 번만 푼다 — 실패 갈래와 성공 갈래가 같은 손잡이를 쥐고 있기 때문이다.
      // Calling this twice only unlocks once, since both the failure and success paths hold the same handle.
      return () => {
        const at = locks.indexOf(token);
        if (at !== -1) locks.splice(at, 1);
      };
    },
    lockedBy() {
      return locks[0]?.reason ?? null;
    },
  };

  bindHost(nabi, host);
  return nabi;
}
