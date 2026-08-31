// 변경 비교 diff — 노드를 안 세우는 도구 wing. 알맹이(`diffDocs`/`mountDiff`)는 `src/diff`에 있고 이건 단추 하나다.
// A diff-comparison tool wing — the real logic lives in `src/diff` (`diffDocs`/`mountDiff`); this is just the toolbar button.
//
// 배선(`mountDiffWing`) 없이 등록만 하면 단추가 조용히 아무 일도 안 해서 `basic`이 아니다.
// Not `basic` — without `mountDiffWing` wired up, the button would silently do nothing.
import type { Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

const DIFF_NAME: LocaleText = { ko: '변경 비교', en: 'Diff' };

// 엇갈린 화살표 둘 — before/after를 오가는 모양이다.
// Two crossing arrows, evoking the back-and-forth between before and after.
const DIFF_ICON =
  '<g stroke-width="1.4">' +
  '<path d="M2.5 5h9M9 2.5 11.5 5 9 7.5"/>' +
  '<path d="M13.5 11h-9M7 8.5 4.5 11 7 13.5"/></g>';

export const diffWing: Wing = {
  w: 'diff',
  place: 'tool',
  button: {
    group: 'file',
    svg: DIFF_ICON,
    label: DIFF_NAME,
    // 판을 여는 것은 화면의 일이라 호스트가 받는다 — `mountDiffWing(...).open()`이 그 답이다.
    // Opening the panel is a screen concern handed to the host — `mountDiffWing(...).open()` answers it.
    action: { kind: 'host' },
  },
};
