import { Translations } from './parts/translation.js';
import type { LocaleInput } from '../locale/index.js';
// 저장 판과 격자 부품을 나눠 쓴다(parts/grid.ts) — 한쪽만 손대면 두 판이 어긋난다. 취소는 -1을 반환한다.
// Shares its grid with the save panel (parts/grid.ts) — editing only one drifts them apart; cancel resolves to -1.
import type { ChooseOption } from '../editor/index.js';
import { localeDirection, makeTranslator } from '../locale/index.js';
import type { Translator } from '../locale/index.js';
import { make } from './parts/dom.js';
import { GRID_COLS, gridStep, initialChoice, makeGrid } from './parts/grid.js';
import { openScrim } from './parts/scrim.js';

export interface ChoosePanelOptions {
  readonly question: string;
  readonly options: readonly ChooseOption[];
  // 닫히면 포커스가 여기로 돌아가고, 판이 속할 문서도 여기서 얻는다.
  // Focus returns here on close, and this is also where the panel's owner document comes from.
  readonly surface: HTMLElement;
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
}

// 격자 산수는 parts/grid.ts로 옮겼다 — 옛 호출부를 위해 이름만 다시 내보낸다.
// The grid math moved to parts/grid.ts — re-exported under the old names for existing callers.
export { gridStep, initialChoice };
export const CHOOSE_COLS = GRID_COLS;

export function openChoosePanel(options: ChoosePanelOptions): Promise<number> {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  const direction = localeDirection(t.locale);
  const copy = new Translations(t);

  return new Promise<number>((resolve) => {
    // 답은 한 번뿐이다 — 덮개 클릭과 Enter가 같은 순간에 와도 먼저 온 것이 답이다.
    // Only the first answer counts, even if a scrim click and Enter land in the same tick.
    let answered = false;
    const answer = (at: number): void => {
      if (answered) return;
      answered = true;
      resolve(at);
    };

    const card = make(owner, 'div', 'nabi-card nabi-choose', {
      tabindex: '-1',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': options.question,
      dir: direction,
    });
    const title = make(owner, 'div', 'nabi-choose-title');
    title.textContent = options.question;

    let scrim: ReturnType<typeof openScrim> | null = null;

    try {
      copy.attribute(card, 'dir', () => localeDirection(t.locale));
      copy.attribute(card, 'aria-label', () => options.question);
      copy.text(title, () => options.question);
      const grid = makeGrid(owner, {
        prefix: 'nabi-choose',
        get rtl() {
          return localeDirection(t.locale) === 'rtl';
        },
        translations: copy,
        cells: options.options.map((choice) => ({
          get label() {
            return choice.label;
          },
          ...(choice.icon !== undefined && choice.icon !== '' ? { icon: choice.icon } : {}),
        })),
        onPick: (at) => {
          answer(at);
          scrim?.close();
        },
      });
      card.append(title, grid.list);

      // 키는 카드가 받아 격자에 건넨다 — 겨눔이 아리아 표식뿐이라 칸에는 실제 포커스가 안 선다.
      // The card catches keys and forwards them to the grid, since the highlighted cell is only an ARIA marker, not real focus.
      card.addEventListener('keydown', (event) => {
        grid.key(event);
      });

      // Escape·바깥 클릭으로 닫히면 취소다 — 그 경로는 덮개가 이미 처리하므로 여기서 더 할 일이 없다.
      // Escape or an outside click cancels; the scrim already handles that path, so nothing more is needed here.
      scrim = openScrim(owner, {
        card,
        restore: options.surface,
        onClose: () => {
          copy.dispose();
          answer(-1);
        },
      });
      card.focus({ preventScroll: true });
    } catch (error) {
      copy.dispose();
      scrim?.close();
      throw error;
    }
  });
}
