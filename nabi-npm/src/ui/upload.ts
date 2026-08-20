// 업로드 화면 — 자리표시자·진행률·취소.
//
// **거절 문구는 여기 없다** (084 ⑦). 예전에는 화면 구석에 인라인 쪽지를 띄웠는데, 그것은 이
// 기능만의 알림 자리를 하나 더 세운 셈이었다 — 지금은 오류가 전부 인스턴스의 toast 로 나가고
// 그 손은 배치를 아는 쪽(`surface/parts/upload.ts`)이 든다. 화면은 상자만 그린다.
//
// **자리표시자는 둘이다.** 올라가는 것이 그림이냐 아니냐로 갈리는데, 숫자를 만드는 손은 하나다
// (시계 둘 — 진짜 콜백 + 대역폭 예측 티커). 갈리는 것은 그 숫자를 **그리는 모양**뿐이다.
// 그림  — 올라갈 그림 자신이 서고(폭 60%·가운데, 곧 앉을 그 크기 그대로) 그 위의 사각형
//            타일이 %만큼 걷힌다. 끝나는 순간 크기도 문단 속성도 아무것도 안 변하는 것이 요점이다.
// 그 밖 — 첨부 링크(클립 상자)의 모양으로 서고, 그 안을 왼쪽에서 오른쪽으로 차오르는 띠가
//            %를 말한다. 한 줄 높이라 타일 판이 들어갈 자리가 없다.
//
// **상자는 그 자리에 뜬다.** 파일을 넘겨받던 순간 캐럿이 든 최상위 블록 **바로 뒤**에, 흐름 안에
// 서는 형제로 선다 — 올라간 그림이 결국 앉을 그 자리다. 화면 구석에 따로 모아 두면 "무엇이
// 어디로 들어가는가" 를 사람이 눈으로 잇지 못한다.
//
// **상자는 문서가 아니다.** 나비트리에는 한 줄도 안 들어간다: 올라가는 중인 것은 아직 문서가
// 아니고, 트리에 넣으면 되돌리기·저장·출력이 전부 그 유령을 보게 된다. 그래서 편집기 DOM 에만
// 산다 — 대신 재그리기가 지우면 `onChange` 뒤에 살아 있는 것들을 순서대로 다시 꽂는다.
//
// **진행률은 값 하나(`--nabi-per`)가 몬다.** 숫자·격자가 그 하나를 보므로 함께 움직인다. 그 값을
// 미는 것은 `parts/ticker.ts`(시계 둘)이고, 이 파일은 받아 그리기만 한다.
import type { Nabi } from '../editor/index.js';
import type { Translator } from '../locale/index.js';
import { makeTranslator } from '../locale/index.js';
import type { StartedTask, UploadMount } from '../surface/index.js';
import { extensionOf, formatBytes } from '../wings/upload/upload.js';
import { make } from './parts/dom.js';
import { createTicker, type Ticker } from './parts/ticker.js';

// 상자·격자·칸의 태그 — 등록된 커스텀 엘리먼트가 아니라 **모르는 태그**다. 그래서 들여오기가
// 만나도 껍데기를 벗기고, 어느 wing 도 자기 것이라 주장하지 않는다.
const BOX_TAG = 'nabi-upload';
const GRID_TAG = 'nabi-grid';
const TILE_TAG = 'nabi-tile';

// 칸 하나가 덮는 크기의 목표와 조임쇠 — 작은 그림에도 격자가 생기고, 큰 그림의 칸이 폭주하지 않게.
const TILE_TARGET = 42;
const TILE_MIN = 2;
const TILE_MAX = 16;
// 한 칸이 걷히는 데 걸리는 진행률 폭 — 시트의 `--nabi-span` 과 같아야 한다.
const TILE_SPAN = 25;

export interface UploadViewOptions {
  // 편집 표면 — 상자가 이 안에, 최상위 블록의 형제로 선다.
  readonly nabi: Nabi;
  readonly surface: HTMLElement;
  // 취소 단추가 부를 곳. 없으면 단추를 안 그린다.
  readonly upload?: Pick<UploadMount, 'cancel'>;
  readonly locale?: string;
  readonly translator?: Translator;
  // 회선 짐작 — 그물이 티커를 끄고(0) 진짜 콜백만 보게 할 때 쓴다.
  readonly bandwidth?: number;
}

export interface UploadView {
  // `mountUpload` 의 `onStart` 에 그대로 잇는다.
  start(tasks: readonly StartedTask[]): void;
  progress(id: string, percent: number): void;
  // `onSettle` 에 잇는다 — 숫자를 100 까지 몰고 그때까지 기다린다(아직 안 걷는다).
  settle(): Promise<void>;
  // `onDone` 에 잇는다 — 실물이 선 **그 자리에서** 자리표시자를 걷는다. 기다리지 않는다.
  done(): void;
  unmount(): void;
}

interface Box {
  readonly id: string;
  readonly el: HTMLElement;
  readonly ticker: Ticker;
  // 미리보기 blob 주소의 임자는 이 상자 하나다 — 상자가 걷힐 때 그 주소만 되돌린다.
  revoke?: () => void;
}

export function mountUploadView(options: UploadViewOptions): UploadView {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  const { nabi, surface } = options;

  let boxes: Box[] = [];
  let anchorKey: string | null = null;
  let running = false;

  // --- 자리 잡기 -------------------------------------------------------------------------------

  // 캐럿이 든 최상위 블록의 키 — 파일을 넘겨받던 그 순간의 자리다.
  const anchorNow = (): string | null => {
    const top = nabi.$doc()[nabi.getSelection().focus.path[0] ?? -1];
    if (top && typeof top._id === 'string') return top._id;
    const last = nabi.$doc()[nabi.$doc().length - 1];
    return last && typeof last._id === 'string' ? last._id : null;
  };

  // 재그리기가 상자를 지웠으면 다시 꽂는다 — 순서대로, 그 자리에.
  const place = (): void => {
    let anchor: Element | null = anchorKey
      ? surface.querySelector(`[data-key="${anchorKey.replace(/["\\]/g, '\\$&')}"]`)
      : null;
    if (anchor && anchor.parentElement !== surface) anchor = null;

    for (const box of boxes) {
      if (!box.el.isConnected) {
        if (anchor) anchor.insertAdjacentElement('afterend', box.el);
        else surface.append(box.el);
      }
      anchor = box.el;
    }
    // 다시 꽂은 뒤에는 **가장 가까운 만큼만** 움직인다 — 재그리기는 글자를 칠 때마다 도는데
    // 그때마다 화면이 가운데로 튀면 쓰던 자리를 잃는다.
    boxes[0]?.el.scrollIntoView?.({ block: 'nearest' });
  };

  // 배치가 막 섰다 — 여기서는 **가운데까지** 데려간다. 자리표시자는 캐럿이 있던 블록 뒤에 서므로
  // 화면 밖이나 접힌 아래에 있을 수 있고, 그러면 올라가는 동안 아무 일도 안 일어나는 것처럼 보인다.
  // 진행률은 보라고 있는 것이라, 시작할 때 한 번은 잘 보이는 자리로 옮긴다.
  const aim = (): void => {
    boxes[0]?.el.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  };

  const stopWatch = nabi.onChange(() => {
    if (!running) return;
    // 표면의 재그리기가 어느 순서로 돌았든 그 뒤로 미룬다.
    queueMicrotask(() => {
      if (running) place();
    });
  });

  // --- 상자 하나 -------------------------------------------------------------------------------

  // Math.random 을 안 쓴다 — 무작위 화면은 그물이 못 붙든다. 자리표시자 id 가 씨앗이다.
  const seedOf = (id: string): number => {
    const digits = id.replace(/\D/g, '');
    return digits === '' ? 1 : Number(digits);
  };

  // 작은 LCG 로 도는 피셔-예이츠. 32비트끼리의 보통 곱셈은 낮은 자리를 흘리는데, 아래 나머지
  // 연산이 읽는 것이 바로 그 자리다 — 그래서 `Math.imul` 이다.
  const shuffledRanks = (count: number, seed: number): number[] => {
    const ranks = Array.from({ length: count }, (_, index) => index);
    let state = (Math.imul(seed, 2654435761) >>> 0) || 1;
    for (let i = count - 1; i > 0; i -= 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const pick = state % (i + 1);
      const held = ranks[i] as number;
      ranks[i] = ranks[pick] as number;
      ranks[pick] = held;
    }
    return ranks;
  };

  const tileCount = (size: number): number =>
    size > 0 ? Math.min(TILE_MAX, Math.max(TILE_MIN, Math.round(size / TILE_TARGET))) : 0;

  // 격자 — 미리보기 위에 정확히 겹치는 칸들. 칸은 격자 순서대로 놓이고, **섞인 것은 자리가 아니라
  // 걷히는 시점**이다. 열 수를 인라인으로 박는 까닭: `auto-fill` 이면 칸 수를 레이아웃이 정해
  // 버려서 여기서 순위를 매길 수가 없다.
  const buildGrid = (id: string, width: number, height: number): HTMLElement | null => {
    const columns = tileCount(width);
    const rows = tileCount(height);
    if (columns === 0 || rows === 0) return null;

    const grid = owner.createElement(GRID_TAG);
    grid.style.setProperty('--nabi-cols', String(columns));
    const total = columns * rows;
    const step = total > 1 ? (100 - TILE_SPAN) / (total - 1) : 0;

    for (const rank of shuffledRanks(total, seedOf(id))) {
      const tile = owner.createElement(TILE_TAG);
      tile.style.setProperty('--nabi-t', String(Math.round(rank * step * 10) / 10));
      grid.append(tile);
    }
    return grid;
  };

  const blobUrlOf = (file: unknown): string | null => {
    const view = owner.defaultView;
    if (!view || typeof view.URL?.createObjectURL !== 'function') return null;
    const Blob_ = (view as unknown as { Blob?: unknown }).Blob;
    if (typeof Blob_ !== 'function' || !(file instanceof (Blob_ as new () => object))) return null;
    try {
      return view.URL.createObjectURL(file as Blob);
    } catch {
      return null;
    }
  };

  const paint = (el: HTMLElement, value: number): void => {
    el.setAttribute('data-nabi-per', String(value));
    el.style.setProperty('--nabi-per', String(value));
  };

  // 첨부 상자의 속 — 클립·이름·확장자 배지. 이름의 기본값은 **파일 이름이 아니라 "첨부파일"**
  // 이다: 올라가는 동안 사람이 알아야 하는 것은 "무엇이 들어오는 중인가" 이고, 파일 이름은
  // 끝난 뒤 링크의 글자가 대신 말한다.
  const clipParts = (): HTMLElement[] => {
    const clip = make(owner, 'span', 'nabi-upload-clip');
    clip.textContent = '📎';
    const what = make(owner, 'span', 'nabi-upload-what');
    what.textContent = t.t('upload.attachment');
    return [clip, what];
  };

  const drawBox = (task: StartedTask): Box => {
    const el = owner.createElement(BOX_TAG);
    el.setAttribute('data-nabi-id', task.id);
    // 캐럿이 못 들어간다 — 문서가 아니기 때문이다.
    el.setAttribute('contenteditable', 'false');
    el.setAttribute('data-nabi-label', extensionOf(task.name).toUpperCase() || '');
    el.setAttribute('data-nabi-name', task.name);
    el.setAttribute('data-nabi-size', formatBytes(task.size));
    paint(el, 0);

    // 미리보기를 만들 수 있는 그림인가 — 이 한 줄이 두 모양을 가른다.
    let revoke: (() => void) | undefined;
    const url = task.image ? blobUrlOf(task.file) : null;
    if (url) revoke = () => owner.defaultView?.URL.revokeObjectURL(url);

    if (url) {
      const preview = owner.createElement('img');
      preview.alt = '';
      // 못 그리는 그림은 첨부 상자로 되돌린다 — 시트가 `:has(img)` 로 가른다.
      // **여기서는 toast 를 안 낸다**: 미리보기를 못 그렸을 뿐 전송은 그대로 가고, 상자가 그
      // 자리에서 모양을 바꾸는 것으로 이미 뜻이 보인다 (084 ⑦ — 같은 말을 두 번 안 한다).
      preview.addEventListener(
        'error',
        () => {
          preview.remove();
          el.setAttribute('data-nabi-kind', 'file');
          el.prepend(...clipParts());
        },
        { once: true },
      );
      // 격자는 **그려진 크기**를 알아야 하는데 그건 로드 뒤에 생긴다. 기다리면 업로드가 늦어지므로
      // 격자만 뒤늦게 합류하고, 그때까지 진행률은 숫자가 혼자 나른다.
      preview.addEventListener(
        'load',
        () => {
          if (!preview.isConnected) return;
          const rect = preview.getBoundingClientRect();
          const grid = buildGrid(task.id, rect.width, rect.height);
          if (grid) el.append(grid);
        },
        { once: true },
      );
      preview.src = url;
      el.append(preview);
    } else {
      // 그림이 아니다 — 첨부 링크와 같은 클립 상자로 선다. 그림 한 장을 대신 세우지 않는다:
      // 올라가는 것이 무엇인지 그 그림은 어차피 말해 주지 못했고, 크기가 제멋대로라 문단을 밀었다.
      el.setAttribute('data-nabi-kind', 'file');
      el.append(...clipParts());
    }

    if (options.upload) {
      const stop = owner.createElement('button');
      stop.type = 'button';
      stop.className = 'nabi-upload-stop';
      stop.setAttribute('contenteditable', 'false');
      stop.setAttribute('aria-label', t.t('cancel'));
      stop.setAttribute('data-nabi-tip', t.t('cancel'));
      stop.textContent = '×';
      stop.addEventListener('mousedown', (event) => event.preventDefault());
      stop.addEventListener('click', () => options.upload?.cancel());
      el.append(stop);
    }

    const box: Box = {
      id: task.id,
      el,
      ...(revoke ? { revoke } : {}),
      ticker: createTicker({
        size: task.size,
        ...(options.bandwidth === undefined ? {} : { bandwidth: options.bandwidth }),
        onChange: (value) => paint(el, value),
      }),
    };
    return box;
  };

  const clearBoxes = (): void => {
    for (const box of boxes) {
      box.ticker.stop();
      box.revoke?.();
      box.el.remove();
    }
    boxes = [];
    running = false;
  };

  // --- 문 --------------------------------------------------------------------------------------

  return {
    start(tasks) {
      clearBoxes();
      anchorKey = anchorNow();
      boxes = tasks.map(drawBox);
      running = true;
      place();
      aim();
    },

    progress(id, percent) {
      boxes.find((box) => box.id === id)?.ticker.report(percent);
    },

    // 숫자를 100 까지 — 87% 에서 사라지면 "끝난 건가?" 가 남는다. **여기서는 안 걷는다**:
    // 걷는 것은 실물이 선 뒤라야 하고(`done`), 그래야 둘이 함께 보이는 순간이 없다.
    async settle() {
      await Promise.all(boxes.map((box) => box.ticker.finish()));
    },

    // 실물이 방금 문서에 섰다 — 같은 그리기 안에서 자리표시자를 걷는다.
    done() {
      clearBoxes();
    },

    unmount() {
      stopWatch();
      clearBoxes();
    },
  };
}
