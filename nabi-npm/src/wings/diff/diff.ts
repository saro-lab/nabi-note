// 변경 비교 diff — 노드를 안 세우는 도구 wing 이다. 알맹이는 이미 있는 diff 기능
// (`src/diff` 의 `diffDocs`/`mountDiff`)이고, 이 wing 은 그 기능으로 가는 툴바 단추 하나다.
//
// 대조 스냅샷(문서를 setJson/setHtml 로 실은 순간)과 전체화면 판은 배선(`mountDiffWing`,
// src/diff)이 든다 — upload 처럼 배선 없이 등록만 하면 단추가 조용히 아무 일도 안 하므로
// `basic` 이 아니다. 단추는 `kind: 'host'` 로 호스트에 되돌아간다(로컬 기록과 같은 결).
import type { Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// 나머지 지원 로케일은 locale catalog가 같은 원문 키의 실제 번역으로 완성한다.
const DIFF_NAME: LocaleText = { ko: '변경 비교', en: 'Diff' };

// 엇갈린 화살표 둘 — 위는 오른쪽으로, 아래는 왼쪽으로 (before/after 를 오가는 모양).
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
    // 판을 여는 것은 화면의 일이라 호스트가 받는다 — `mountDiffWing(...).open()` 이 그 답이다.
    action: { kind: 'host' },
  },
};
