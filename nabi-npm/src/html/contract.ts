// 타입만 사는 자리 — render와 builders가 서로 안 부르게 가른다. 태그는 ctx.element/ctx.wrap 문 하나로만 지어지고, 이스케이프·URL 검증도 그 뒤 한 벌뿐이다.
// Types only, keeping render and builders from calling each other. Tags are built only through ctx.element/ctx.wrap, with escaping and URL validation living just behind that one door.
import type { ElementNode } from '../schema/types.js';
import type { SchemaEnv } from '../schema/env.js';

// 값이 undefined면 안 적고, 빈 글자열이면 이름만 적는다(`<div data-nabi-p>`).
// A value of undefined omits the attr entirely; an empty string keeps just the name (`<div data-nabi-p>`).
export type HtmlAttrs = Readonly<Record<string, string | undefined>>;

export interface HtmlContext {
  element(tag: string, inner: string, attrs?: HtmlAttrs): string;
  // 키 없는 덧태그 — 한 노드가 태그를 여럿 지을 때의 겉옷·속옷(표의 횡스크롤 겉옷, 코드의 <code>).
  // A keyless extra tag for when one node needs several — an outer wrapper (table's scroll box) or inner one (code's <code>).
  wrap(tag: string, inner: string, attrs?: HtmlAttrs): string;
  escape(text: string): string;
  // 문이 둘인 까닭은 자리가 둘이라서다 — url은 사람이 가는 곳(a href, http(s)/상대경로만), src는 브라우저가 가져오는 곳(img/iframe, allowLocalUrls도 여기서만 산다).
  // Two doors because there are two kinds of places — `url` is where a person navigates (a href, http(s)/relative only), `src` is what the browser fetches (img/iframe, where allowLocalUrls alone applies).
  url(raw: string | undefined): string | null;
  src(raw: string | undefined): string | null;
  // 캐럿이 설 줄 상자가 없으면 빈 칸은 화면에서 사라진다.
  // With no line box for the caret to land in, an empty slot would visually vanish.
  filled(inner: string): string;
  readonly keys: boolean;
}

export type HtmlBuilder = (node: ElementNode, children: () => string, ctx: HtmlContext) => string;

// wing의 toHtml이 이 맵 위에 덮인다 — html 층은 wing 구현을 모른다.
// A wing's toHtml overrides this map by name; the html layer stays unaware of wing implementations.
export type HtmlBuilders = Readonly<Record<string, HtmlBuilder>>;

export interface HtmlOptions {
  readonly env: SchemaEnv;
  readonly builders?: HtmlBuilders;
  // blob:/data:image/… 까지 받을지 — 업로드 중인 그림을 그리는 화면만 켠다.
  // Whether to accept blob:/data:image/… too — only the screen rendering an in-flight upload turns this on.
  readonly allowLocalUrls?: boolean;
}
