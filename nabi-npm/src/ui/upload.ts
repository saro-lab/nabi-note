// 자리표시자는 문서(나비트리)에 안 들어간다 — 화면 DOM에만 살아, 재그리기가 지우면 onChange 뒤에 순서대로 다시 꽂는다. 상자는 캐럿이 든 최상위 블록 바로 뒤에 흐름 안의 형제로 서고, 진행률은 값 하나(--nabi-per)가 숫자와 격자를 함께 몬다.
// The placeholder never enters the document (the NABI TREE) — it lives only in the screen DOM, and a redraw that wipes it gets it re-inserted in order after onChange. It sits as a flow sibling right after the block the caret was in when the file arrived, and progress is driven by one value (--nabi-per) that both the number and tile grid read.
import { hostOf, type Nabi } from '../editor/index.js';
import type { Translator } from '../locale/index.js';
import { makeTranslator } from '../locale/index.js';
import type { StartedTask, UploadMount } from '../surface/index.js';
import { extensionOf, formatBytes } from '../wings/upload/upload.js';
import { suppressMousedownTap } from './parts/button.js';
import { make } from './parts/dom.js';
import { createTicker, type Ticker } from './parts/ticker.js';

// 상자·격자·칸의 태그 — 등록된 커스텀 엘리먼트가 아니라 모르는 태그다. 그래서 들여오기가 만나도 껍데기를 벗기고, 어느 wing도 자기 것이라 주장하지 않는다.
// Tags for the box, grid, and tiles — deliberately unregistered custom elements. Import strips them without asking, and no wing claims them as its own.
const BOX_TAG = 'nabi-upload';
const GRID_TAG = 'nabi-grid';
const TILE_TAG = 'nabi-tile';

// 칸 하나가 덮는 크기의 목표와 조임쇠 — 작은 그림에도 격자가 생기고, 큰 그림의 칸이 폭주하지 않게.
// Target size and clamps for one tile — small images still get a grid, and large ones don't explode into too many tiles.
const TILE_TARGET = 42;
const TILE_MIN = 2;
const TILE_MAX = 16;
// 한 칸이 걷히는 데 걸리는 진행률 폭 — 시트의 `--nabi-span` 과 같아야 한다.
// The progress span it takes to clear one tile — must match the stylesheet's `--nabi-span`.
const TILE_SPAN = 25;

export interface UploadViewOptions {
  // 편집 표면 — 상자가 이 안에, 최상위 블록의 형제로 선다.
  // The edit surface — the box is placed inside it, as a sibling of the top-level block.
  readonly nabi: Nabi;
  readonly surface: HTMLElement;
  // 취소 단추가 부를 곳. 없으면 단추를 안 그린다.
  // Where the cancel button calls into; without it, no button is drawn.
  readonly upload?: Pick<UploadMount, 'cancel'>;
  readonly locale?: string;
  readonly translator?: Translator;
  // 회선 짐작 — 그물이 티커를 끄고(0) 진짜 콜백만 보게 할 때 쓴다.
  // Bandwidth estimate — tests set this to 0 to disable the ticker and see only real callbacks.
  readonly bandwidth?: number;
}

export interface UploadView {
  // `mountUpload` 의 `onStart` 에 그대로 잇는다.
  // Wired straight to `mountUpload`'s `onStart`.
  start(tasks: readonly StartedTask[]): void;
  progress(id: string, percent: number): void;
  // `onSettle` 에 잇는다 — 숫자를 100 까지 몰고 그때까지 기다린다(아직 안 걷는다).
  // Wired to `onSettle` — drives the number to 100 and waits for that (doesn't clear yet).
  settle(): Promise<void>;
  // `onDone` 에 잇는다 — 실물이 선 **그 자리에서** 자리표시자를 걷는다. 기다리지 않는다.
  // Wired to `onDone` — clears the placeholder the instant the real thing is in, no waiting.
  done(): void;
  unmount(): void;
}

interface Box {
  readonly id: string;
  readonly el: HTMLElement;
  readonly ticker: Ticker;
  // 미리보기 blob 주소의 임자는 이 상자 하나다 — 상자가 걷힐 때 그 주소만 되돌린다.
  // This box alone owns its preview blob URL — it's revoked only when the box is cleared.
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
  // The key of the top-level block holding the caret — captured at the instant the file arrived.
  const anchorNow = (): string | null => {
    const top = hostOf(nabi).doc()[nabi.getSelection().focus.path[0] ?? -1];
    if (top && typeof top._id === 'string') return top._id;
    const last = hostOf(nabi).doc()[hostOf(nabi).doc().length - 1];
    return last && typeof last._id === 'string' ? last._id : null;
  };

  // 재그리기가 상자를 지웠으면 다시 꽂는다 — 순서대로, 그 자리에.
  // If a redraw removed the boxes, they're reinserted — in order, back where they were.
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
    // 다시 꽂은 뒤에는 가장 가까운 만큼만 움직인다 — 재그리기는 글자를 칠 때마다 도는데 그때마다 화면이 가운데로 튀면 쓰던 자리를 잃는다.
    // Reinserting only scrolls the nearest amount needed — a redraw fires on every keystroke, and jumping to center each time would lose the user's place.
    boxes[0]?.el.scrollIntoView?.({ block: 'nearest' });
  };

  // 자리표시자는 캐럿이 있던 블록 뒤에 서므로 화면 밖이나 접힌 아래에 있을 수 있다 — 시작할 때만 잘 보이는 가운데로 옮겨, 올라가는 동안 아무 일도 안 일어나는 것처럼 보이지 않게 한다.
  // The placeholder sits after the block the caret was in, so it can land offscreen or below the fold — scrolled to center only at the start, so progress doesn't look like nothing is happening.
  const aim = (): void => {
    boxes[0]?.el.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  };

  const stopWatch = nabi.onChange(() => {
    if (!running) return;
    // 표면의 재그리기가 어느 순서로 돌았든 그 뒤로 미룬다.
    // Deferred until after the surface's own redraw, whatever order it ran in.
    queueMicrotask(() => {
      if (running) place();
    });
  });

  // --- 상자 하나 -------------------------------------------------------------------------------

  // Math.random을 안 쓴다 — 무작위 화면은 그물이 못 붙든다. 자리표시자 id가 씨앗이다.
  // No Math.random — a nondeterministic layout can't be asserted on in tests. The placeholder's id is the seed instead.
  const seedOf = (id: string): number => {
    const digits = id.replace(/\D/g, '');
    return digits === '' ? 1 : Number(digits);
  };

  // 작은 LCG로 도는 피셔-예이츠. 32비트끼리의 보통 곱셈은 낮은 자리를 흘리는데, 아래 나머지 연산이 읽는 것이 바로 그 자리다 — 그래서 Math.imul이다.
  // Fisher-Yates driven by a small LCG. Plain 32-bit multiplication loses low bits, and the modulo below reads exactly those bits — hence `Math.imul`.
  const shuffledRanks = (count: number, seed: number): number[] => {
    const ranks = Array.from({ length: count }, (_, index) => index);
    let state = Math.imul(seed, 2654435761) >>> 0 || 1;
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

  // 격자 — 미리보기 위에 정확히 겹치는 칸들. 칸은 격자 순서대로 놓이고, 섞인 것은 자리가 아니라 걷히는 시점이다. 열 수를 인라인으로 박는 까닭: auto-fill이면 칸 수를 레이아웃이 정해 버려서 여기서 순위를 매길 수가 없다.
  // A grid of tiles overlaid exactly on the preview. Tiles sit in grid order — what's shuffled is the order they clear, not their position. The column count is set inline because with auto-fill, layout would decide the tile count and this couldn't rank them.
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

  // 첨부 상자의 속 — 클립·이름·확장자 배지. 이름의 기본값은 파일 이름이 아니라 "첨부파일"이다: 올라가는 동안 사람이 알아야 하는 것은 "무엇이 들어오는 중인가"이고, 파일 이름은 끝난 뒤 링크의 글자가 대신 말한다.
  // The inside of an attachment box — clip, name, extension badge. The default name is "attachment," not the filename — while uploading, what matters is "something is coming in," and the filename is told by the link's text once it's done.
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
    // The caret can't enter it — it isn't part of the document.
    el.setAttribute('contenteditable', 'false');
    el.setAttribute('data-nabi-label', extensionOf(task.name).toUpperCase() || '');
    el.setAttribute('data-nabi-name', task.name);
    el.setAttribute('data-nabi-size', formatBytes(task.size));
    paint(el, 0);

    // 미리보기를 만들 수 있는 그림인가 — 이 한 줄이 두 모양을 가른다.
    // Whether it's an image a preview can be built from — this one line decides which of the two shapes is drawn.
    let revoke: (() => void) | undefined;
    const url = task.image ? blobUrlOf(task.file) : null;
    if (url) revoke = () => owner.defaultView?.URL.revokeObjectURL(url);

    if (url) {
      const preview = owner.createElement('img');
      preview.alt = '';
      // 못 그리는 그림은 첨부 상자로 되돌린다 — 시트가 :has(img)로 가른다. 여기서는 toast를 안 낸다: 미리보기를 못 그렸을 뿐 전송은 그대로 가고, 상자가 그 자리에서 모양을 바꾸는 것으로 이미 뜻이 보인다.
      // An image that fails to render falls back to the attachment box shape — the stylesheet branches on :has(img). No toast fires here: only the preview failed, not the upload, and the box changing shape already says so without repeating it.
      preview.addEventListener(
        'error',
        () => {
          preview.remove();
          el.setAttribute('data-nabi-kind', 'file');
          el.prepend(...clipParts());
        },
        { once: true },
      );
      // 격자는 그려진 크기를 알아야 하는데 그건 로드 뒤에 생긴다. 기다리면 업로드가 늦어지므로 격자만 뒤늦게 합류하고, 그때까지 진행률은 숫자가 혼자 나른다.
      // The grid needs the rendered size, which only exists after load — rather than delay the upload, the grid joins late while the number alone carries progress until then.
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
      // 그림이 아니다 — 첨부 링크와 같은 클립 상자로 선다. 그림 한 장을 대신 세우지 않는다: 올라가는 것이 무엇인지 그 그림은 어차피 말해 주지 못했고, 크기가 제멋대로라 문단을 밀었다.
      // Not an image — shown as the same clip box as an attachment link, not a generic placeholder image, which never said what was coming anyway and pushed the paragraph around with its arbitrary size.
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
      suppressMousedownTap(stop);
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

    // 숫자를 100까지 — 87%에서 사라지면 "끝난 건가?"가 남는다. 여기서는 안 걷는다: 걷는 것은 실물이 선 뒤라야 하고(done), 그래야 둘이 함께 보이는 순간이 없다.
    // Drives the number to 100 — disappearing at 87% would leave "is it done?" unanswered. It doesn't clear here; that only happens after the real thing is in (done), so the two are never visible at once.
    async settle() {
      await Promise.all(boxes.map((box) => box.ticker.finish()));
    },

    // 실물이 방금 문서에 섰다 — 같은 그리기 안에서 자리표시자를 걷는다.
    // The real thing just landed in the document — the placeholder clears within the same draw.
    done() {
      clearBoxes();
    },

    unmount() {
      stopWatch();
      clearBoxes();
    },
  };
}
