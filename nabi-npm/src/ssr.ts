// SSR 엔트리(`nabi-note/ssr`) — **저장본을 HTML 로 그리는 데 드는 것만** 싣는다.
//
// 여기 사는 것의 기준: 서버가 나비트리를 받아 보낼 HTML 을 조립하는 데 필요한가.
// 그 일에는 화면이 없다 — 캐럿도, 툴바도, 떠 있는 상자도 없다. 그래서 이 엔트리는
// **`surface` 와 `ui` 를 한 파일도 안 딛는다** (그물 test/entry.test.ts 가 소스 훑기로 지킨다).
//
// 코어 엔트리와 견준 값(실측 2026-08-19): 112 파일 18,453 줄 → **74 파일 11,750 줄**.
// 덜어내는 38 파일이 전부 ui(24)·surface(13) 다 — 서버에서 한 번도 안 불릴 것들이다.
//
// **`nabi-note` 를 그냥 무는 것과 무엇이 다른가**: 코어 엔트리는 편집기 조립·화면 도구까지
// 함께 내보내므로, 번들러가 그것을 못 흔들어 내면 서버 묶음에 DOM 코드가 통째로 실린다.
// 이 엔트리는 그 걱정이 없다 — 애초에 없는 것은 실릴 수가 없다.
//
// 브라우저에서도 쓴다: 댓글 목록처럼 **읽기만 하는 페이지**가 편집기를 안 싣고 저장본을
// 그릴 때 같은 문이다. 그 페이지에 상호작용(표 정렬·코드 색칠)까지 주려면 `nabi-note/viewer`
// 를 함께 건다 — 그 둘은 서로를 모르고 각자 작다.
//
// 여기 **없는 것**: `createNabiWith`·`mountSurface`·`mount*`·`openPreview` 류. 편집기를 세우는
// 일은 화면의 일이라 코어 엔트리(`nabi-note`)의 몫이다.

// --- 저장본을 그리는 문 둘 (090) ---------------------------------------------------------------
// 나비트리 JSON → (보기|편집기) HTML. 나비트리가 아니면 null 이고, 통과한 값은 편집기의
// `getHtml()`·`getEditorHtml()` 과 한 글자도 다르지 않다 — 같은 걸음을 지나기 때문이다.
export { makeRegistry, renderStoredEditorHtml, renderStoredHtml } from './wing/index.js';
export type { Registry, StoredHtmlOptions } from './wing/index.js';

// --- 툴바의 글자 (096) --------------------------------------------------------------------------
// 단추 줄을 DOM 없이 그린다. 나오는 글자는 `(registry, 말, 그룹 순서)` 만 보는 **상수**라,
// 서버가 뜰 때 한 번 부르고 그 글자를 영원히 재쓴다 — 요청마다 도는 것이 아니다.
// 브라우저에서는 `mountToolbar` 가 **같은 함수**로 그린다: 이미 서 있으면 배선만 걸고 넘어간다.
export { TOOLBAR_GROUPS, renderToolbarHtml, renderViewToolsHtml, toolbarSlots } from './wing/toolbar-html.js';
export type { ToolbarHtmlOptions, ToolbarSlot } from './wing/toolbar-html.js';

// --- 어휘 — 무엇을 아는 문서인가 ---------------------------------------------------------------
// registry 를 짓는 재료다. 서버와 브라우저가 **같은 목록**을 써야 hydrate 가 성립한다.
export { defaultWings, extraWings, wingNames, wings } from './wings/index.js';
export type { WingName, WingsBuilder } from './wings/index.js';
export type { Wing } from './wing/index.js';

// --- 트리를 직접 든 자리의 문 -------------------------------------------------------------------
// 이미 내부 트리를 손에 쥔 곳(그물·직접 조립)이 쓰는 한 걸음 아래의 문이다. 보통은 위의
// `renderStoredHtml` 이면 된다 — 그쪽이 사용자 JSON 을 받고 정규화까지 함께 한다.
export { renderEditorHtml, renderHtml, safeUrl } from './html/index.js';
export type { HtmlOptions } from './html/index.js';

// --- 문서의 모양 -------------------------------------------------------------------------------
export { isElement, isText } from './schema/index.js';
export { BR, P } from './schema/index.js';
export type { Attrs, AttrValue, ElementNode, NabiDoc, NabiNode } from './schema/index.js';

// --- 말 ----------------------------------------------------------------------------------------
// 이름이 문서에 실리는 자리(첨부 링크의 "첨부파일" 같은 것)가 있어 서버도 말을 든다.
export { LOCALES, RTL_LOCALES, localeDirection, localeOf, translate } from './locale/index.js';
export type { Translator } from './locale/index.js';
