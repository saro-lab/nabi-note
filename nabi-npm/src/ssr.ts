// SSR 엔트리 — 서버가 저장본을 HTML로 그리는 데만 쓰인다. surface·ui를 한 파일도 안 딛어(entry.test.ts가 소스 훑기로 지킨다) 서버 번들에 DOM 코드가 안 실리고, 브라우저의 읽기 전용 페이지도 같은 문을 쓴다(상호작용은 nabi-note/viewer를 따로 건다).
// SSR entry — used only for a server to render a stored doc to HTML. It touches no file under surface or ui (enforced by entry.test.ts's source scan), so no DOM code ships in a server bundle; browser read-only pages use this same door too (pair with nabi-note/viewer for interactivity).

// --- 저장본을 그리는 문 둘 (090) ---------------------------------------------------------------
// 나비트리 JSON → (보기|편집기) HTML — 나비트리가 아니면 null이고, 통과한 값은 편집기의 getHtml()·getEditorHtml()과 한 글자도 다르지 않다(같은 걸음을 지난다).
// Nabi-tree JSON to (view|editor) HTML — null if it isn't a nabi-tree; a passing value matches the editor's getHtml()/getEditorHtml() character for character, since it runs through the same steps.
export { makeRegistry, renderStoredEditorHtml, renderStoredHtml } from './wing/index.js';
export type { Registry, StoredHtmlOptions } from './wing/index.js';

// --- 툴바의 글자 (096) --------------------------------------------------------------------------
// 단추 줄을 DOM 없이 그린다 — 결과는 (registry·말·그룹 순서)만 보는 상수라 서버가 뜰 때 한 번만 부르고 재쓴다. 브라우저의 mountToolbar도 같은 함수로 그리고, 이미 서 있으면 배선만 건다.
// Renders the button row with no DOM — the output is a constant depending only on (registry, locale, group order), so the server calls it once at boot and reuses it. The browser's mountToolbar draws with this same function, wiring up an existing render rather than redrawing.
export { TOOLBAR_GROUPS, renderToolbarHtml, renderViewToolsHtml, toolbarSlots } from './wing/toolbar-html.js';
export type { ToolbarHtmlOptions, ToolbarSlot } from './wing/toolbar-html.js';

// --- 어휘 — 무엇을 아는 문서인가 ---------------------------------------------------------------
// registry 를 짓는 재료다. 서버와 브라우저가 **같은 목록**을 써야 hydrate 가 성립한다.
// The material a registry is built from — hydration only works if server and browser use the exact same list.
export { defaultWings, wingNames, wings } from './wings/index.js';
export type { WingName, WingsBuilder } from './wings/index.js';
export type { Wing } from './wing/index.js';

export { safeUrl } from './html/index.js';

// --- 문서의 모양 -------------------------------------------------------------------------------
export { isElement, isText } from './schema/index.js';
export { BR, P } from './schema/index.js';
export type { Attrs, AttrValue, ElementNode, NabiDoc, NabiNode } from './schema/index.js';

// --- 말 ----------------------------------------------------------------------------------------
// 이름이 문서에 실리는 자리(첨부 링크의 "첨부파일" 같은 것)가 있어 서버도 말을 든다.
// The server carries locale text too, since some names land right in the document (e.g. an attachment link's label).
export { LOCALES, RTL_LOCALES, createLocale, localeDirection, localeOf, translate } from './locale/index.js';
export type { Translator, LocaleController, LocaleInput, LocaleSource } from './locale/index.js';

export type { ViewToolsVisibility, ViewToolsHtmlOptions } from './wing/toolbar-html.js';
