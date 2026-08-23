// 고르는 판 — 여럿 중 하나. 지금 이 판이 뜨는 자리는 하나다: 붙여넣은 것을 읽는 길이 둘
// 이상일 때(`Ask.choose`). 판을 띄우는 손은 표면이 아니라 **코어의 물음 문**이다 — surface 는
// ui 아래층이라 판을 직접 못 세운다. 그 문에 이 판을 걸어 주는 것이 툴바의 한 줄이다.
//
// 판의 모양은 **한 줄에 셋까지의 격자**다. 고르는 것은 형식 서넛이고 이름은 한 낱말(`HTML`)이라,
// 세로 목록으로 세우면 짧은 글자 셋이 왼쪽에 붙어 허공이 남는다. 나란히 세우고 그림을 이름 위에
// 얹으면 눈이 한 번에 셋을 견준다 — 이름을 읽기 전에 그림이 먼저 답한다.
//
// 그 격자는 **저장 판과 나눠 쓰는 부품**이다(`parts/grid.ts`) — 걸음도 첫 겨눔도 DOM 짓는 손도
// 거기 하나뿐이라, 두 판이 다음 라운드에 갈릴 자리가 없다(주인 지시 2026-08-23).
//
// 덮개 부품(`openScrim`)을 그대로 쓴다 — Escape·바깥 클릭·포커스 복원이 미리보기·기록 판과
// 같은 한 벌이다. **취소는 `-1`** 이고, 그때는 아무것도 안 붙는다.
import type { ChooseOption } from '../editor/index.js';
import { localeDirection, makeTranslator } from '../locale/index.js';
import type { Translator } from '../locale/index.js';
import { make } from './parts/dom.js';
import { GRID_COLS, gridStep, initialChoice, makeGrid } from './parts/grid.js';
import { openScrim } from './parts/scrim.js';

export interface ChoosePanelOptions {
  readonly question: string;
  readonly options: readonly ChooseOption[];
  // 겨눔이 돌아갈 자리 — 닫으면 여기로 포커스가 간다. 판이 사는 문서도 여기서 나온다.
  readonly surface: HTMLElement;
  readonly locale?: string;
  readonly translator?: Translator;
}

// 옛 이름들 — 격자의 산수는 `parts/grid.ts` 로 옮겼고(저장 판과 한 벌), 부르던 자리를 위해
// 여기서 그대로 다시 내보낸다.
export { gridStep, initialChoice };
export const CHOOSE_COLS = GRID_COLS;

export function openChoosePanel(options: ChoosePanelOptions): Promise<number> {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  const direction = localeDirection(t.locale);

  return new Promise<number>((resolve) => {
    // 답은 한 번뿐이다 — 덮개 클릭과 Enter 가 같은 순간에 와도 먼저 온 것이 답이다.
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
      dir: direction,
    });
    const title = make(owner, 'div', 'nabi-choose-title');
    title.textContent = options.question;

    // Escape·바깥 클릭으로 닫히면 취소다 — 덮개가 그 길을 이미 들고 있어 여기서 지을 것이 없다.
    const scrim = openScrim(owner, { card, restore: options.surface, onClose: () => answer(-1) });

    const grid = makeGrid(owner, {
      prefix: 'nabi-choose',
      rtl: direction === 'rtl',
      cells: options.options.map((choice) => ({
        label: choice.label,
        ...(choice.icon !== undefined && choice.icon !== '' ? { icon: choice.icon } : {}),
      })),
      onPick: (at) => {
        answer(at);
        scrim.close();
      },
    });
    card.append(title, grid.list);

    // 키는 카드가 받아 격자에 건넨다 — 겨눔이 아리아 표식 하나뿐이라 칸에 포커스가 안 선다.
    card.addEventListener('keydown', (event) => {
      grid.key(event);
    });

    card.focus({ preventScroll: true });
  });
}
