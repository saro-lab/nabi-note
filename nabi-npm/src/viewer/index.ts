// viewer 엔트리(`nabi-note/viewer`) — 편집기 없이 싣는 읽기 쪽 런타임이다.
//
// 여기 사는 것의 기준: **발행된 HTML 을 읽는 사람에게 필요한데 CSS 만으로는 못 하는 것.**
// 지금 그것은 둘이다 — 표 정렬(열 제목을 눌러 행 순서를 바꾼다)과 코드 색칠(글자를 토막 내
// span 을 얹는다). 시트는 둘 다 못 한다. 색은 시트가 쥐지만 **어디에 그 색을 얹을지**는
// 토큰화가 답하는 것이고, 그것은 로직이다.
// 체크 표시·드롭캡·코드 배경처럼 **보이기만 하는 것은 전부 `dist/nabi.css` 가 진다**
// (읽는 페이지에 자바스크립트를 한 줄도 안 실어도 그대로 보인다는 뜻이다).
//
// **이 엔트리는 코어를 안 문다** — editor·surface·ui 는 물론이고 schema 아래까지 안 딛는다.
// 딛는 것은 `locale/`(말)과 `code/`(색칠의 지식) **둘**이고, 그 규칙을 그물
// (test/entry.test.ts)이 소스 훑기로 지킨다.
//
// `code/` 가 드는 값(088): 순수 토크나이저 310줄 + span 얹기 71줄이 이 엔트리에 함께 실린다
// (그물이 세는 viewer 소스 파일 수 5 → 10, 절반은 주석이다). **문법 사전은 안 실린다** —
// 그래서 여전히 "몇 KB" 자리이고 런타임 의존성은 0 이다. 더 나은 색칠을 원하는 호스트는
// `highlight` 훅으로 제 하이라이터를 꽂는다 — 그때 지는 값은 호스트의 것이다.
export { attachViewer } from './attach.js';
export type { ViewerOptions } from './attach.js';
export { CODE_LANG_ATTR, attachCodePaint, codeLanguageOf } from './code-paint.js';
export type { CodePaintOptions } from './code-paint.js';
export { SORTABLE_ATTR, attachTableSort, hasMergedCells, nextSortState, rankRows } from './table-sort.js';
export type { SortDirection, SortState, TableSortOptions } from './table-sort.js';
// 색칠에 넘기는 훅의 모양 — 코어 엔트리를 안 실은 페이지에서도 타입을 쓸 수 있어야 한다.
export type { CodeHighlighter, CodeToken } from '../code/index.js';
