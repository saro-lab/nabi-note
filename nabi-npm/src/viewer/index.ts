// viewer 엔트리(nabi-note/viewer) — 편집기 없이 싣는 읽기 쪽 런타임이다. 여기 사는 기준은 "CSS만으론 못 하는데 읽는 사람에게 필요한 것"뿐이다(표 정렬, 코드 색칠 — 어디에 색을 얹을지는 토큰화가 답하는 로직이다). 보이기만 하는 것(체크 표시·드롭캡 등)은 전부 dist/nabi.css가 진다. 이 엔트리는 editor·surface·ui·schema를 안 물고 locale·code 둘만 딛는다(test/entry.test.ts가 소스 훑기로 지킨다) — 문법 사전은 안 실어 여전히 몇 KB대, 런타임 의존성 0이다. 더 나은 색칠은 호스트가 highlight 훅으로 제 하이라이터를 꽂는다
// The viewer entry (nabi-note/viewer): reader-side runtime with no editor attached. What belongs here is only what CSS alone can't do but a reader needs (table sort; code highlighting, where tokenizing to decide what gets colored is logic, not styling). Purely visual things (checkbox styling, dropcaps, etc.) are entirely dist/nabi.css's job. This entry never touches editor/surface/ui or anything under schema, only locale/ and code/ (enforced by test/entry.test.ts scanning the source). No grammar dictionary ships, so it stays a few KB with zero runtime dependencies; a host wanting better highlighting plugs in its own via the `highlight` hook, at whatever cost that brings
export { attachViewer } from './attach.js';
export type { ViewerAttachment, ViewerOptions } from './attach.js';
export { CODE_LANG_ATTR, attachCodePaint, codeLanguageOf } from './code-paint.js';
export type { CodePaintOptions } from './code-paint.js';
export { SORTABLE_ATTR, attachTableSort, hasMergedCells, nextSortState, rankRows } from './table-sort.js';
export type { SortDirection, SortState, TableSortOptions } from './table-sort.js';
// 색칠에 넘기는 훅의 모양 — 코어 엔트리를 안 실은 페이지에서도 타입을 쓸 수 있어야 한다
// The shape of the highlighting hook; its type must be usable even on a page that never loads the core entry
export type { CodeHighlighter, CodeToken } from '../code/index.js';
