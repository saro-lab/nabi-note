// 조립의 계약 — 타입만 산다. render 와 조립 함수 맵(builders)이 서로를 안 부르게 가르는 자리다.
//
// 조립 함수는 태그 글자열을 직접 잇지 않는다 — `ctx.element`·`ctx.wrap` 이 태그를 짓는 유일한 문이고
// 이스케이프와 URL 화이트리스트는 그 문 뒤에 한 벌만 있다 (신뢰 경계: `a` 안 = 전부 검증 대상).
import type { ElementNode } from '../schema/types.js';
import type { SchemaEnv } from '../schema/env.js';

// 속성 한 벌 — 값이 `undefined` 면 안 적고, 빈 글자열이면 이름만 적는다(`<div data-nabi-p>`).
export type HtmlAttrs = Readonly<Record<string, string | undefined>>;

export interface HtmlContext {
  // 이 노드의 태그 하나 — 편집기 HTML 이면 `data-key` 가 여기에 얹힌다.
  element(tag: string, inner: string, attrs?: HtmlAttrs): string;
  // 키 없는 덧태그 — 한 노드가 태그를 여럿 지을 때의 겉옷·속옷(표의 횡스크롤 겉옷, 코드의 <code>).
  wrap(tag: string, inner: string, attrs?: HtmlAttrs): string;
  // 글자 이스케이프 — 조립이 속을 직접 짓는 드문 자리(코드 평문)에서만 쓴다.
  escape(text: string): string;
  // URL 화이트리스트 — 통과 못 한 주소는 null 이고, 그때 무엇을 그릴지는 조립이 정한다.
  //
  // **문이 둘인 까닭은 자리가 둘이기 때문이다.**
  // `url` — 사람이 **가는** 자리(`a href`). `http(s)` 와 같은 사이트 상대 경로만이다.
  //     `blob:`·`data:` 는 여기 올 이유가 없다 — 링크로 눌러 여는 `data:` 는 그림이 아니라 문서다.
  // `src` — 브라우저가 **가져오는** 자리(`img`·`iframe`). 여기서만 호스트의 `allowLocalUrls`
  //     가 산다(업로드 미리보기가 `blob:`·`data:image` 를 쓴다).
  //
  // 예전에는 문이 하나라 호스트가 미리보기 하나를 켜려고 연 것이 링크에까지 열렸다.
  url(raw: string | undefined): string | null;
  src(raw: string | undefined): string | null;
  // 빈 속에 받침 한 줄을 댄다 — 캐럿이 설 줄 상자가 없으면 빈 칸은 화면에서 사라진다.
  filled(inner: string): string;
  // 편집기 HTML 인가 — 보기와 편집기를 다르게 그리는 조립(접기의 open)이 읽는다.
  readonly keys: boolean;
}

// 타입 하나의 조립 — 자식 조립은 `children` 으로 미룬다(속을 안 쓰는 물건은 안 부른다).
export type HtmlBuilder = (node: ElementNode, children: () => string, ctx: HtmlContext) => string;

// 타입별 조립 함수 맵 — 07(wing 계약)이 등록된 wing 의 toHtml 로 이 맵을 지어 넘긴다.
// html 층은 wing 구현을 모른다(경계) — 기본 조립은 이 맵의 아래에 깔리고, 같은 이름은 넘긴 쪽이 이긴다.
export type HtmlBuilders = Readonly<Record<string, HtmlBuilder>>;

export interface HtmlOptions {
  // 갈래 지식(물건·단말·컨테이너) — 래퍼문단 판별과 data-key 자리를 정하는 데 쓴다.
  readonly env: SchemaEnv;
  readonly builders?: HtmlBuilders;
  // `blob:`·`data:image/…` 까지 받을지 — 업로드 중인 그림을 그리는 화면만 켠다.
  readonly allowLocalUrls?: boolean;
}
