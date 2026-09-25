import type { LocaleInput } from '../../locale/index.js';
// 업로드의 표면 절반 — 파일을 받아 호스트 훅에 넘기고 끝나면 한 번에 커밋한다. 호스트 배선(전송 훅·한도)이 인스턴스 것이라 wing 선언만으론 안 되는 것만 이 층에 산다. 업로드 중엔 editor의 $lock으로 커맨드 자체를 막고 contenteditable도 같은 순간에 끈다(안 그러면 화면과 트리가 갈린다). 오류는 전부 toast 한 문으로 말한다(084 ⑦, 예전엔 거절·전송 실패·중도 이탈이 셋으로 흩어져 있었다) — 취소·깨진 그림·미리보기 실패처럼 화면이 이미 뜻을 보여주는 자리는 말을 안 보탠다(같은 말을 두 번 하면 둘 다 안 읽는다)
// The screen half of upload: takes files, hands them to a host hook, and commits once at the end. Only things that need instance-level wiring (transfer hook, limits) live here; declaration-only extras (checklist clicks, code highlighting, broken-image watching) live as a wing's `attach`. During upload, the editor's $lock blocks commands outright (even undo/document-swap), and contenteditable is disabled at the same moment, or the browser could write to the tree while it's locked and the screen and tree would diverge. All errors funnel through one toast door (084 7; previously scattered across an inline rejection note, a silent catch{}, and a silent early return) since only here does the code know the whole batch and what fraction failed. Some outcomes deliberately stay silent because the screen already shows them: user-cancelled, a broken-image marker (wings/img/watch.ts), or a preview-less box (ui/upload.ts) turning into an attachment; saying the same thing twice means neither gets read
import { hostOf, type Nabi } from '../../editor/index.js';
import { AsyncMountScope, DisposerStack, HostElementLease } from '../../lifecycle.js';
import { makeTranslator, type Translator } from '../../locale/index.js';
import {
  acceptFiles,
  isImageFile,
  type UploadFile,
  type UploadItem,
  type UploadLimits,
  type UploadReject,
} from '../../wings/upload/upload.js';

export interface UploadTask {
  readonly id: string;
  readonly file: UploadFile;
  readonly name: string;
  readonly extension: string;
  readonly size: number;
  readonly type: string;
  // 범위 밖 값은 잘라서 반영한다 — 살아 있다는 신호이기도 하다
  // Out-of-range values are clamped; this call also serves as a liveness signal
  onProgress(percent: number): void;
  // unmount 하면 abort된다 — 긴 업로드는 이것을 넘겨 취소를 받는다
  // Aborted on unmount; a long-running upload should pass this through to receive cancellation
  readonly signal: AbortSignal;
}

// { uri } 만 성공이다 — null·빈 답은 그 파일이 안 올라갔다는 뜻이고 배치는 계속 간다
// Only { uri } counts as success; a null or empty answer means that file didn't upload, and the batch continues regardless
export type Uploader = (task: UploadTask) => Promise<{ readonly uri: string } | null> | { readonly uri: string } | null;

// 배치 속 파일 하나 — 화면이 자리표시자를 세울 때 필요한 것 전부다. 실물(file)까지 싣는 까닭은 그림이면 화면이 호스트 왕복 없이 그 자리에서 미리보기를 만들기 때문이다
// One file in the batch, carrying everything the screen needs to build a placeholder; the actual `file` is included so the screen can generate an image preview right there, without a round trip to the host
export interface StartedTask {
  readonly id: string;
  readonly file: UploadFile;
  readonly name: string;
  readonly size: number;
  readonly image: boolean;
}

export interface UploadOptions extends UploadLimits {
  readonly nabi: Nabi;
  readonly uploader: Uploader;
  // 편집 표면 — 주면 잠긴 동안 contenteditable이 함께 꺼진다
  // The edit surface; if given, contenteditable is disabled together with the lock
  readonly root?: HTMLElement;
  // 배치가 섰다 — 걸러진 뒤의 목록이다(거절된 것은 안 온다). 화면이 자리표시자를 세우는 자리
  // The batch has started; this is the filtered list (rejected files excluded), where the screen builds placeholders
  readonly onStart?: (tasks: readonly StartedTask[]) => void;
  readonly onProgress?: (id: string, percent: number) => void;
  // 전송이 끝났고 아직 커밋 전이다 — 화면이 숫자를 100까지 몰 시간을 여기서 번다(Promise면 기다린다). 예전엔 커밋을 먼저 하고 알렸는데, 화면이 100까지 미는 250ms 동안 실물과 자리표시자가 함께 보여 눈이 못 따라갔다(특히 한 줄짜리 첨부에서 줄이 늘었다 줄었다 했다)
  // Transfer finished but not yet committed; this buys the screen time to animate the percentage up to 100 (awaited if it returns a Promise). Committing first and notifying after used to show the real content and its placeholder at once during that 250ms animation, which was especially confusing for single-line attachments whose row count flickered
  readonly onSettle?: () => void | Promise<void>;
  // 배치가 끝났다 — 커밋 뒤에 온다(화면이 자리표시자를 걷는 자리, 취소면 cancelled). 커밋의 재그리기와 이 사이에 화면이 안 그려지므로 실물과 자리표시자가 겹쳐 보이는 순간이 없다
  // The batch finished, called after commit (where the screen removes placeholders; cancelled if aborted). No repaint happens between the commit's redraw and this call, so there's no moment where the real content and the placeholder are both visible
  readonly onDone?: (result: { readonly committed: number; readonly cancelled: boolean }) => void;
  // 거절 하나 — 끼우면 그쪽이 이긴다(ask·toast와 같은 규칙). 안 끼우면 toast로 말한다 — 기본값이 침묵이면 한도에 걸린 파일이 소리 없이 사라져 사람이 뭘 잘못 골랐는지 영영 모른다
  // A single rejection callback; supplying one wins (same rule as ask/toast). Without it, a toast speaks up instead -- a silent default would make a file that hit a limit vanish without a trace, leaving no way to know what went wrong
  readonly onReject?: (problem: UploadReject) => void;
  // 첨부 링크의 글자 — 없으면 사전의 upload.attachment("첨부파일")다. 문서에 남는 말인데 커맨드는 화면도 로케일도 모르는 계약이라, 로케일을 아는 가장 안쪽 자리인 이 mount에서 골라 커맨드에 넘긴다
  // The attachment link's label; falls back to the dictionary's upload.attachment ("attached file"). Since this text ends up in the document but commands know neither the screen nor the locale by contract, this mount -- the innermost place that knows the locale -- picks the label and passes it to the command
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
}

export interface UploadMount {
  // 파일을 넘긴다 — surface의 fileSink가 그대로 이어지는 자리다(드롭·붙여넣기)
  // Hands off files; this is where surface's fileSink connects directly (drop, paste)
  take(files: readonly UploadFile[]): void;
  isRunning(): boolean;
  // 도는 배치를 끊는다 — 훅이 받은 signal이 abort된다. 마운트는 살아 있다(다음 배치를 받는다)
  // Cancels the running batch; the hook's `signal` gets aborted. The mount itself stays alive, ready for the next batch
  cancel(): void;
  unmount(): void;
}

// 오류 한 마디가 사는 시간 — toast의 기본 1초(ms 인자, 084 ①)는 "복사했다" 류라 파일 이름이 낀 말을 읽기엔 짧다
// How long an error message stays; toast's default duration (its `ms` param, 084 1) is tuned for something like "copied", too short to read a message with a file name in it
const UPLOAD_TOAST_MS = 5000;

export function mountUpload(options: UploadOptions): UploadMount {
  const { nabi, uploader } = options;
  const t = options.translator ?? makeTranslator(options.locale);
  const lifetime = new AsyncMountScope();
  let running = false;
  let counter = 0;
  let active: {
    readonly generation: number;
    readonly controller: AbortController;
    readonly release: () => void;
  } | null = null;

  const lock = (): (() => void) => {
    const releases = new DisposerStack();
    try {
      releases.add(hostOf(nabi).lock('upload'));
      const root = options.root;
      if (root) {
        const lease = new HostElementLease(root);
        releases.add(() => lease.dispose());
        lease.attribute('contenteditable', 'false');
        lease.className('nabi-uploading', true);
      }
      return () => releases.dispose();
    } catch (error) {
      releases.dispose();
      throw error;
    }
  };

  const call = (fn: (() => void) | undefined): void => {
    try {
      fn?.();
    } catch {
      // Host UI callbacks are not allowed to strand the editor lock.
    }
  };

  // 거절 — 호스트가 받겠다고 하면 그쪽으로만 가고, 아니면 우리가 warn 급으로 말한다(터진 게 아니라 규격이 안 맞은 것이라 다른 파일을 고르면 된다)
  // Rejection: goes only to the host if it supplied a handler, otherwise we speak up at `warn` level (this isn't a crash, just a mismatched constraint, fixable by picking another file)
  const refuse = (problem: UploadReject): void => {
    if (options.onReject) {
      options.onReject(problem);
      return;
    }
    const said = t.t(`upload.${problem.code}`, { name: problem.file?.name ?? '', max: problem.max ?? '' });
    hostOf(nabi).toast('warn', said, UPLOAD_TOAST_MS);
  };

  const take = (files: readonly UploadFile[]): void => {
    if (files.length === 0 || lifetime.disposed) return;
    // 배치는 한 번에 하나다 — 도는 중 온 파일은 무시하되(잠긴 동안 편집과 같은 규칙) 무시했다는 것은 말한다. 안 그러면 떨어뜨린 파일이 자국 없이 사라져 사람이 같은 몸짓을 되풀이한다
    // Only one batch runs at a time; a file dropped while one is running is ignored (same rule as editing during the lock), but that ignoring is announced -- otherwise a dropped file vanishes without a trace and the person repeats the same gesture
    if (running) {
      hostOf(nabi).toast('warn', t.t('upload.busy'), UPLOAD_TOAST_MS);
      return;
    }
    const generation = lifetime.next();
    const accepted = acceptFiles(files, options, (problem) => {
      if (!lifetime.active(generation) || running || active !== null) return;
      refuse(problem);
    });
    if (accepted.length === 0 || !lifetime.active(generation) || running || active !== null) return;

    const controller = new AbortController();
    const batch = { generation, controller, release: lock() };
    active = batch;
    running = true;
    const signal = controller.signal;

    // 화면이 세울 자리표시자 목록을 전송 시작 전에 알린다 — 상자가 먼저 서고 그 위에서 숫자가 걷는 순서다(끝나고 나타나면 아무것도 안 보인 채로 기다린 셈이 된다)
    // Announces the placeholder list before transfer starts; the box appears first, then the percentage climbs on it (announcing after would mean waiting with nothing visible)
    const started: StartedTask[] = accepted.map((file) => {
      counter += 1;
      return {
        id: `u${counter}`,
        file,
        name: file.name,
        size: file.size,
        image: isImageFile(file),
      };
    });
    try {
      options.onStart?.(started);
    } catch {
      if (lifetime.active(generation) && active === batch) {
        lifetime.invalidate();
        active = null;
        running = false;
        controller.abort();
        batch.release();
        call(() => options.onDone?.({ committed: 0, cancelled: true }));
      }
      return;
    }
    if (!lifetime.active(generation) || active !== batch) return;

    // 못 올라간 파일의 이름을 모아 뒀다가 배치가 끝난 뒤 한 마디로 말한다 — 파일마다 따로 말하면 toast 상한(기본 셋)을 넘겨 서로 밀어내고 몇 개가 빠졌는지 안 남는다
    // Names of failed files are collected and reported together once the batch ends; announcing each separately would exceed the toast limit (3 by default), pushing each other out and losing track of how many actually failed
    const failed: string[] = [];

    const work = accepted.map(async (file, at): Promise<UploadItem | null> => {
      if (!lifetime.active(generation) || active !== batch) return null;
      const id = (started[at] as StartedTask).id;
      const dot = file.name.lastIndexOf('.');
      const task: UploadTask = {
        id,
        file,
        name: file.name,
        extension: dot > 0 ? file.name.slice(dot + 1).toLowerCase() : '',
        size: file.size,
        type: file.type,
        onProgress: (percent) => {
          if (!lifetime.active(generation) || active !== batch) return;
          call(() => options.onProgress?.(id, Math.max(0, Math.min(100, percent))));
        },
        signal,
      };
      try {
        if (!lifetime.active(generation) || active !== batch) return null;
        const answer = await uploader(task);
        if (!lifetime.active(generation) || active !== batch) return null;
        // 빈 답도 실패다 — 훅이 주소를 못 돌려줬다는 뜻이라 문서에 세울 것이 없다
        // An empty answer also counts as failure; the hook couldn't return a URI, so there's nothing to place in the document
        if (!answer || typeof answer.uri !== 'string' || answer.uri === '') {
          failed.push(file.name);
          return null;
        }
        return { kind: isImageFile(file) ? 'image' : 'file', uri: answer.uri, name: file.name };
      } catch {
        if (!lifetime.active(generation) || active !== batch) return null;
        // 파일 하나가 터져도 배치는 간다(올라간 것들은 올라간 것이다) — 다만 조용히 넘어가지 않는다. 예전엔 여기서 삼킨 예외가 어디에도 안 남아 자리표시자만 걷히고 끝났다
        // One failing file doesn't stop the batch (whatever uploaded, uploaded), but it isn't swallowed silently; previously an exception caught here left no trace at all, and only the placeholder quietly disappeared
        failed.push(file.name);
        return null;
      }
    });

    void Promise.all(work).then(async (answers) => {
      if (!lifetime.active(generation) || active !== batch) return;
      const items = answers.filter((item): item is UploadItem => item !== null);
      // 잠금을 먼저 푼다 — 커밋도 커맨드라, 잠긴 채로는 자기 자신도 못 들어온다
      // Unlocks first; commit is itself a command, and it couldn't get through the very lock it needs to clear
      batch.release();
      // 숫자를 100까지 몰고 나서 커밋한다 — 87%에서 실물이 나오면 "끝난 건가?" 헷갈리고, 커밋 뒤에 몰면 실물·자리표시자가 겹쳐 보인다. onSettle이 그 사이에 선다
      // Drives the percentage to 100 before committing; committing at 87% would leave the real content appearing before "done" reads clearly, while animating after commit would show both real content and placeholder at once. onSettle sits between the two to avoid either
      try {
        await options.onSettle?.();
      } catch {
        // Settling is presentation only; uploaded data can still commit.
      }
      if (!lifetime.active(generation) || active !== batch) return;
      // 끊긴 배치는 커밋하지 않는다 — 취소는 "여기까지만 올려 두기"가 아니다
      // A cancelled batch never commits; cancelling doesn't mean "keep what made it so far"
      if (items.length > 0) {
        // 배치 전체가 undo 한 점이다
        // The whole batch is one undo step
        nabi.group(() => {
          nabi.applyCommand('commitUpload', { items, label: t.t('upload.attachment') });
        });
      }
      // 못 올라간 것은 커밋 뒤에 말한다 — 그래야 "무엇이 섰고 무엇이 빠졌나"가 화면과 같은 순간을 가리킨다. 취소된 배치는 말 안 한다 — 끊긴 파일이 전부 실패로 잡혀도 그건 사람이 시킨 일이라 오류가 아니다
      // Failures are announced only after commit, so "what landed vs. what didn't" matches what the screen shows at that moment. A cancelled batch says nothing, even though every interrupted file counts as failed, since that was the person's own choice, not an error
      if (failed.length > 0) {
        const said =
          failed.length === 1
            ? t.t('upload.failed', { name: failed[0] as string })
            : t.t('upload.failed_many', { n: failed.length });
        hostOf(nabi).toast('error', said, UPLOAD_TOAST_MS);
      }
      // 커밋 뒤에 알린다 — 화면은 실물이 선 다음에 자리표시자를 걷어야 깜박이지 않는다
      // Notified only after commit; the screen must remove the placeholder only after the real content is in place, or it flickers
      active = null;
      running = false;
      call(() => options.onDone?.({ committed: items.length, cancelled: false }));
    });
  };

  const abort = (notify: boolean): void => {
    const batch = active;
    if (!batch) return;
    lifetime.invalidate();
    active = null;
    running = false;
    batch.controller.abort();
    batch.release();
    if (notify) call(() => options.onDone?.({ committed: 0, cancelled: true }));
  };

  return {
    take,
    isRunning: () => running,
    cancel() {
      if (!running) return;
      abort(true);
    },
    unmount() {
      abort(false);
      lifetime.dispose();
    },
  };
}
