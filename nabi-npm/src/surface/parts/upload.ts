// 업로드의 표면 절반 — 파일을 받아 호스트 훅에 넘기고, 끝나면 **한 번에** 커밋한다.
//
// 여기 있는 이유: 업로드는 호스트 배선(전송 훅·한도)이 있어야 살아나고, 그 배선은 인스턴스의
// 것이지 wing 의 것이 아니다. wing 이 선언만으로 끝낼 수 있는 부속(체크 띠 클릭·코드
// 색칠·깨짐 감시)은 `attach` 로 선언했고, 이렇게 주입이 필요한 것만 이 층에 선다.
//
// **업로드 중 편집 잠금**: 잠금은 editor 인스턴스의 `$lock` 이다 — 진행 중에는 커맨드가
// 아예 안 돈다(되돌리기·문서 교체까지). 화면 쪽 잠금(contenteditable 끄기)은 같은 순간에 함께
// 건다: 잠긴 트리에 브라우저만 글자를 쓰면 화면과 트리가 갈린다.
//
// 진행률·자리표시자 그림은 ui(12)의 몫이다 — 여기서는 진행을 알리는 통로(onProgress)만 연다.
//
// **오류는 전부 여기서 말한다** (084 ⑦). 예전에는 셋으로 흩어져 있었다: 거절은 화면 구석의
// 인라인 쪽지, 전송 실패는 `catch {}` 의 침묵, 도는 중에 떨어진 파일은 `return` 하나의 침묵.
// 지금은 셋 다 인스턴스의 toast 한 문으로 나간다 — 배치를 아는 것도, 무엇이 몇 개 빠졌는지
// 아는 것도 이 자리뿐이라서다(화면은 상자만 그린다).
//
// **말을 안 하는 자리도 정해 두었다** — 화면이 이미 그 뜻을 들고 있는 곳이다:
//   · 취소 — 사람이 제 손으로 끊은 것이라 오류가 아니다.
//   · 깨진 그림 표식(`wings/img/watch.ts`) — 시트가 그 자리에 깨짐을 그린다.
//   · 미리보기를 못 그린 상자(`ui/upload.ts`) — 그 자리에서 첨부 상자로 모양이 바뀐다.
// 같은 말을 화면과 toast 가 두 번 하면 사람은 두 번 다 안 읽는다.
import type { Nabi } from '../../editor/index.js';
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
  // 범위 밖은 잘라서 반영한다 — 살아 있다는 신호이기도 하다.
  onProgress(percent: number): void;
  // unmount 하면 abort 된다 — 긴 업로드는 이것을 넘겨 취소를 받는다.
  readonly signal: AbortSignal;
}

// `{ uri }` 만 성공이다 — null·빈 답은 그 파일이 안 올라갔다는 뜻이고, 배치는 계속 간다.
export type Uploader = (task: UploadTask) => Promise<{ readonly uri: string } | null> | { readonly uri: string } | null;

// 배치에 낀 파일 하나 — 화면(12)이 자리표시자를 세울 때 필요한 것 전부다.
// 실물(`file`)까지 싣는 까닭: 그림이면 화면이 그 자리에서 미리보기를 만든다(호스트 왕복 없이).
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
  // 편집 표면 — 주면 잠긴 동안 contenteditable 이 함께 꺼진다.
  readonly root?: HTMLElement;
  // 배치가 섰다 — 걸러진 뒤의 목록이다(거절된 것은 안 온다). 화면이 자리표시자를 세우는 자리.
  readonly onStart?: (tasks: readonly StartedTask[]) => void;
  readonly onProgress?: (id: string, percent: number) => void;
  // 전송이 끝났고 **아직 커밋 전**이다 — 화면이 숫자를 100 까지 몰 시간을 여기서 번다.
  // 답이 Promise 면 기다린다.
  //
  // 왜 커밋 전인가: 예전에는 커밋을 먼저 하고 화면에게 알렸는데, 화면은 숫자를 100 까지 미느라
  // 250ms 를 더 썼다. 그 사이 **실물과 자리표시자가 함께 보였다** — 첨부처럼 한 줄짜리는 줄이
  // 둘로 늘었다가 하나가 사라져서, 무엇이 생기고 무엇이 없어지는지 눈이 따라가지 못했다.
  readonly onSettle?: () => void | Promise<void>;
  // 배치가 끝났다 — 커밋 **뒤**에 온다(화면이 자리표시자를 걷는 자리). 취소면 `cancelled`.
  //
  // 여기서 자리표시자를 걷으면 **그리기 한 번 안에** 실물이 서고 자리표시자가 사라진다
  // 커밋의 재그리기와 이 걸음 사이에 화면이 안 그려지므로 둘이 겹쳐 보이는 순간이 없다.
  readonly onDone?: (result: { readonly committed: number; readonly cancelled: boolean }) => void;
  // 거절 하나 — **끼우면 그쪽이 이긴다**(ask·toast 와 같은 규칙). 안 끼우면 우리가 toast 로
  // 말한다: 기본값이 침묵이면 한도에 걸린 파일이 소리 없이 사라지고, 사람은 자기가 무엇을
  // 잘못 골랐는지 영영 모른다.
  readonly onReject?: (problem: UploadReject) => void;
  // 첨부 링크의 글자 — 없으면 사전의 `upload.attachment`("첨부파일")다.
  //
  // 왜 여기서 정하나: 문서에 남는 글자라 **말**이 필요한데, 커맨드는 화면도 말도 모른다(계약).
  // 로케일을 아는 가장 안쪽 자리가 이 mount 이므로, 여기서 한 마디를 골라 커맨드에 넘긴다.
  readonly locale?: string;
  readonly translator?: Translator;
}

export interface UploadMount {
  // 파일을 넘긴다 — surface 의 `fileSink` 가 그대로 이어지는 자리다(드롭·붙여넣기).
  take(files: readonly UploadFile[]): void;
  isRunning(): boolean;
  // 도는 배치를 끊는다 — 훅이 받은 `signal` 이 abort 된다. 마운트는 살아 있다(다음 배치를 받는다).
  cancel(): void;
  unmount(): void;
}

// 오류 한 마디가 사는 시간 — 기본 1초는 "복사했다" 류의 것이라 파일 이름이 낀 말을 읽기엔
// 짧다. 부르는 쪽이 시간을 얹으라고 둔 인자가 이 자리를 위한 것이다 (084 ①의 `ms`).
const UPLOAD_TOAST_MS = 5000;

export function mountUpload(options: UploadOptions): UploadMount {
  const { nabi, uploader } = options;
  const t = options.translator ?? makeTranslator(options.locale);
  const attachmentLabel = t.t('upload.attachment');
  let running = false;
  let controller = new AbortController();
  let counter = 0;
  let release: (() => void) | null = null;

  const lock = (): void => {
    release = nabi.$lock('upload');
    const root = options.root;
    if (root) {
      root.setAttribute('contenteditable', 'false');
      root.classList.add('nabi-uploading');
    }
  };
  const unlock = (): void => {
    release?.();
    release = null;
    const root = options.root;
    if (root) {
      root.setAttribute('contenteditable', 'true');
      root.classList.remove('nabi-uploading');
    }
  };

  // 거절 — 호스트가 받겠다고 하면 그쪽으로만 가고, 아니면 우리가 말한다. 급은 `warn` 이다:
  // 터진 것이 아니라 규격이 안 맞은 것이고, 다른 파일을 고르면 되는 일이다.
  const refuse = (problem: UploadReject): void => {
    if (options.onReject) {
      options.onReject(problem);
      return;
    }
    const said = t.t(`upload.${problem.code}`, { name: problem.file?.name ?? '', max: problem.max ?? '' });
    nabi.$toast('warn', said, UPLOAD_TOAST_MS);
  };

  const take = (files: readonly UploadFile[]): void => {
    if (files.length === 0) return;
    // 배치는 한 번에 하나다 — 도는 중에 넘어온 파일은 무시한다(잠긴 동안의 편집과 같은 규칙).
    // 다만 **무시했다는 것은 말한다**: 떨어뜨린 파일이 아무 자국도 없이 사라지면 사람은 자기가
    // 놓친 줄 알고 같은 몸짓을 되풀이한다.
    if (running) {
      nabi.$toast('warn', t.t('upload.busy'), UPLOAD_TOAST_MS);
      return;
    }
    const accepted = acceptFiles(files, options, refuse);
    if (accepted.length === 0) return;

    running = true;
    lock();
    const signal = controller.signal;

    // 화면이 세울 자리표시자 목록 — **전송을 시작하기 전에** 알린다. 상자가 먼저 서고 그 위에서
    // 숫자가 걷는 것이 순서다(끝나고 나서 나타나면 아무것도 안 보인 채로 기다린 것이 된다).
    const started: StartedTask[] = accepted.map((file, at) => ({
      id: `u${counter + at + 1}`,
      file,
      name: file.name,
      size: file.size,
      image: isImageFile(file),
    }));
    options.onStart?.(started);

    // 못 올라간 파일의 이름 — 배치가 끝난 뒤 한 마디로 모아 말한다. 파일마다 따로 말하면
    // 상한(기본 셋)을 넘겨 서로를 밀어내고, 정작 몇 개가 빠졌는지가 안 남는다.
    const failed: string[] = [];

    const work = accepted.map(async (file): Promise<UploadItem | null> => {
      counter += 1;
      const id = `u${counter}`;
      const dot = file.name.lastIndexOf('.');
      const task: UploadTask = {
        id,
        file,
        name: file.name,
        extension: dot > 0 ? file.name.slice(dot + 1).toLowerCase() : '',
        size: file.size,
        type: file.type,
        onProgress: (percent) => options.onProgress?.(id, Math.max(0, Math.min(100, percent))),
        signal,
      };
      try {
        const answer = await uploader(task);
        // 빈 답도 실패다 — 훅이 주소를 못 돌려줬다는 뜻이라 문서에 세울 것이 없다.
        if (!answer || typeof answer.uri !== 'string' || answer.uri === '') {
          failed.push(file.name);
          return null;
        }
        return { kind: isImageFile(file) ? 'image' : 'file', uri: answer.uri, name: file.name };
      } catch {
        // 파일 하나가 터져도 배치는 간다 — 올라간 것들은 올라간 것이다. 다만 **조용히 가지는
        // 않는다**: 여기서 삼킨 예외가 예전에는 어디에도 안 남아, 자리표시자만 걷히고 끝났다.
        failed.push(file.name);
        return null;
      }
    });

    void Promise.all(work).then(async (answers) => {
      const items = answers.filter((item): item is UploadItem => item !== null);
      // **잠금을 먼저 푼다** — 커밋도 커맨드라, 잠긴 채로는 자기 자신도 못 들어온다.
      running = false;
      unlock();
      const cancelled = signal.aborted;
      // 숫자를 100 까지 몰고 나서 커밋한다 — 87% 에서 실물이 튀어나오면 "끝난 건가?" 가 남고
      // 커밋 뒤에 몰면 실물과 자리표시자가 함께 보인다. 그 사이에 이 한 걸음이 있다.
      if (!cancelled) await options.onSettle?.();
      // 끊긴 배치는 커밋하지 않는다 — 취소는 "여기까지만 올려 두기"가 아니다.
      if (!cancelled && items.length > 0) {
        // 배치 전체가 undo 한 점이다.
        nabi.group(() => {
          nabi.applyCommand('commitUpload', { items, label: attachmentLabel });
        });
      }
      // 못 올라간 것이 있으면 여기서 말한다 — 커밋 뒤라야 "무엇이 섰고 무엇이 빠졌나"가
      // 화면과 말이 같은 순간을 가리킨다. **취소된 배치는 말하지 않는다**: 끊긴 파일이 전부
      // 실패로 잡히지만 그것은 사람이 시킨 일이라 오류가 아니다.
      if (!cancelled && failed.length > 0) {
        const said =
          failed.length === 1
            ? t.t('upload.failed', { name: failed[0] as string })
            : t.t('upload.failed_many', { n: failed.length });
        nabi.$toast('error', said, UPLOAD_TOAST_MS);
      }
      // 커밋 **뒤**에 알린다 — 화면은 실물이 선 다음에 자리표시자를 걷어야 깜박이지 않는다.
      options.onDone?.({ committed: cancelled ? 0 : items.length, cancelled });
    });
  };

  const abort = (): void => {
    controller.abort();
    controller = new AbortController();
  };

  return {
    take,
    isRunning: () => running,
    cancel() {
      if (!running) return;
      abort();
    },
    unmount() {
      abort();
      running = false;
      unlock();
    },
  };
}
