// 기본 조립 — 확정된 기본 wing 들의 태그 대응이다 (예시· ask-json-now 대응표).
// 07(wing 계약)이 등록된 wing 의 `toHtml` 로 같은 모양의 맵을 지어 넘기면 여기 것 위에 덮인다
// html 층은 wings 구현을 모른다(경계 시험). 그때까지 이 맵이 문서를 그릴 수 있게 받쳐 준다.
//
// 저장값은 **무엇인가**를 속성으로 말하고, 어떻게 보이는지는 시트가 말한다 — 인라인 `style` 로는
// 아무것도 안 내보낸다. 출력은 `nabi.css` 를 건 `.nabi-content` 안에서 그려진다.
import type { HtmlBuilder, HtmlBuilders } from './contract.js';
import { embedSrc, videoId } from './url.js';
import { language, name, span, text, width } from './values.js';

// 화면 전용 받침 — **셈에 안 든다.** 캐럿 사상(`surface/map.ts`)이 이 표식을 보고 건너뛰므로
// 이 br 하나가 트리의 라인 수를 바꾸지 않는다.
export const FILLER_ATTR = 'data-nabi-filler';

// --- 마크 ------------------------------------------------------------------------------------

// 태그 하나뿐인 마크 — 속성이 없다. 여섯이 한 팩토리에서 나온다 (: 같은 일은 한 벌).
function mark(tag: string): HtmlBuilder {
  return (_node, children, ctx) => ctx.element(tag, children());
}

// 값 마크 — 이름 하나를 속성으로 얹는다 (형광펜·글자색·글자 크기·서체).
function valueMark(tag: string, attr: string, key: string): HtmlBuilder {
  return (node, children, ctx) => ctx.element(tag, children(), { [attr]: name(node.a?.[key]) });
}

// --- 문 -------------------------------------------------------------------------------------

export const DEFAULT_BUILDERS: HtmlBuilders = {
  // 마크 여섯 — 뜻이 그대로 태그인 것들.
  b: mark('b'),
  i: mark('i'),
  u: mark('u'),
  s: mark('s'),
  sub: mark('sub'),
  sup: mark('sup'),

  // 값 마크 넷 — 색·크기·서체는 값이 있어야 뜻이 선다.
  hl: valueMark('mark', 'data-color', 'c'),
  tc: valueMark('span', 'data-color', 'c'),
  fs: valueMark('span', 'data-nabi-size', 'v'),
  tf: valueMark('span', 'data-nabi-typeface', 'v'),

  // 링크 — 주소가 화이트리스트를 통과 못 하면 껍데기를 벗겨 평문으로 내보낸다.
  // 첨부 표식(`file`)은 그대로 나간다 — 클립·확장자 배지는 시트의 몫이라 값에 흔적이 안 실린다.
  //
  // 첨부에는 `download` 를 단다 — **여는 것이 아니라 받는 것**이라고 말하는 자리다. 값을 안 준다:
  // 값을 주면 그 글자가 파일 이름이 되는데, 링크의 글자는 "첨부파일" 이라 그것을 파일 이름으로
  // 쓸 수 없다. 값이 없으면 서버가 준 이름(Content-Disposition)이나 주소의 끝이 이름이 된다.
  // (브라우저는 다른 출처의 주소에서는 이 표식을 무시한다 — 그건 브라우저의 규칙이다.)
  //
  // **첨부는 편집기에서만 캐럿이 안 드는 섬이다** (101). 보기·저장·발행값은 글자 하나 안 바뀐다 —
  // 발행된 페이지에서 첨부는 눌러서 내려받는 보통 링크이고, 물건처럼 구는 것은 편집기 안에서뿐이다.
  //
  // `ctx.keys` 가 그 갈림이다 — 편집기 HTML 에만 서는 표이고(계약이 "보기와 편집기를 다르게
  // 그리는 조립이 읽는다" 고 적어 둔 그 값), 그래서 이 두 속성은 `renderHtml` 로는 영영 안 나간다.
  //
  // 왜 `contenteditable="false"` 인가: 첨부의 글자는 사람이 쓴 문장이 아니라 이름표라 속에 캐럿이
  // 서면 안 된다(attach.ts 규칙 ①). 그런데 CSS(`user-select`)로 막는 것은 모바일에서 안 들었고,
  // 몸짓의 걸음을 하나씩 가로채는 것은 기기마다 새는 자리를 뒤쫓는 길이었다(101 §3·§4).
  // 이 속성은 칠이나 몸짓이 아니라 **"여기는 문서가 아니다" 라는 구조적 선언**이라 브라우저가
  // 스스로 캐럿·가상 자판을 안 들인다. 같은 편집기 안에 이미 같은 선언을 쓰는 자리가 있다 —
  // 올라가는 중인 첨부 상자(`ui/upload.ts`)이고, 그 상자가 다 올라가면 되는 것이 바로 이 링크다.
  // 봉하지 않으면 같은 물건이 올라가는 동안과 올라간 뒤에 규칙이 갈린다.
  //
  // `draggable="false"` 가 짝이다 — 브라우저는 안 고쳐지는 조각을 끌 수 있게 만드는데, 끌어다
  // 놓으면 트리 모르게 화면에서만 자리가 바뀐다.
  //
  // **표식이 빈 첨부(`file=""`)는 안 봉한다** — attach.ts 가 그것을 첨부로 안 세므로(`file !== ''`)
  // 봉하면 고를 수도 캐럿을 넣을 수도 없는, 손이 닿지 않는 조각이 된다.
  a: (node, children, ctx) => {
    const href = ctx.url(text(node.a?.['href']));
    if (href === null) return children();
    const file = text(node.a?.['file']);
    const lump = file !== undefined && file !== '';
    return ctx.element('a', children(), {
      href,
      'data-nabi-file': file,
      ...(file === undefined ? {} : { download: '' }),
      ...(lump && ctx.keys ? { contenteditable: 'false', draggable: 'false' } : {}),
    });
  },

  // 물건 — 단말 셋.
  img: (node, _children, ctx) => {
    const src = ctx.src(text(node.a?.['src']));
    // 주소를 못 믿는 그림은 없는 것으로 친다 — 깨진 그림을 문서에 박지 않는다.
    if (src === null) return '';
    return ctx.element('img', '', {
      src,
      // **언제나 빈 alt 다.** 대체 글은 걷었지만(깨진 그림 자리에 우리 그림이 선다) 속성 자체는
      // 남긴다 — `alt` 가 아예 없는 그림을 낭독기는 파일 이름으로 읽어 주소를 소리 내어 읽고
      // 빈 `alt` 는 "읽을 글이 없다" 는 뜻이라 조용히 지나간다. 없는 것보다 빈 것이 낫다.
      alt: '',
      'data-nabi-width': width(node.a?.['w']),
    });
  },
  youtube: (node, _children, ctx) => {
    const id = videoId(text(node.a?.['v']));
    if (id === null) return '';
    return ctx.element('iframe', '', {
      src: embedSrc(id),
      title: 'YouTube',
      allowfullscreen: '',
      loading: 'lazy',
      'data-nabi-width': width(node.a?.['w']),
    });
  },
  hr: (_node, _children, ctx) => ctx.element('hr', ''),

  // 표 — 폭이 없는 대신 넘치면 가로로 구른다. 겉옷은 표 자신의 태그가 아니므로 키를 안 받는다.
  table: (_node, children, ctx) => ctx.wrap('div', ctx.element('table', children()), { class: 'nabi-scroll' }),
  tr: (_node, children, ctx) => ctx.element('tr', children()),
  td: (node, children, ctx) =>
    ctx.element('td', ctx.filled(children()), {
      colspan: span(node.a?.['colspan']),
      rowspan: span(node.a?.['rowspan']),
    }),

  // 리스트 셋 — 체크리스트는 `ul` 을 글머리와 나눠 쓰므로 표식으로 갈린다.
  ul: (_node, children, ctx) => ctx.element('ul', children()),
  li: (_node, children, ctx) => ctx.element('li', ctx.filled(children())),
  ol: (_node, children, ctx) => ctx.element('ol', children()),
  oli: (_node, children, ctx) => ctx.element('li', ctx.filled(children())),
  tl: (_node, children, ctx) => ctx.element('ul', children(), { 'data-nabi-list': 'task' }),
  tli: (node, children, ctx) =>
    ctx.element('li', ctx.filled(children()), { 'data-nabi-checked': node.a?.['ck'] === 1 ? 'true' : 'false' }),

  // 인용·접기 — **편집기도 저장값 그대로 그린다.**
  //
  // 전에는 편집기에서만 늘 펼쳐 뒀다(접힌 속에는 캐럿이 못 들어가니까). 그 값으로 화면이
  // 저장될 모습을 못 말해서, 상황 줄에 "펼친 채로 저장"·"접은 채로 저장" 단추 둘이 따로 서야
  // 했다. 이제 삼각형을 누른 것이 곧 저장값이라(`wings/details/attach.ts`) 화면과 값이 한 몸이다.
  // 접힌 속을 고치려면 열면 된다 — 여는 걸음 하나가, 지금 어느 쪽인지 못 읽는 것보다 싸다.
  quote: (_node, children, ctx) => ctx.element('blockquote', children()),
  details: (node, children, ctx) => ctx.element('details', children(), { open: node.a?.['o'] === 1 ? '' : undefined }),
  summary: (_node, children, ctx) => ctx.element('summary', ctx.filled(children())),

  // 코드 — 바깥 관례(`pre > code.language-*`)로 감싼다. 속은 평문 + 라인이라 마크가 없다.
  //
  // 끝의 라인 뒤에 받침을 하나 더 세우는 일은 `ctx.filled` 가 한다 — 코드만의 사정이 아니라
  // **모든 홀더**의 사정이라 그 문 하나로 모았다(문단·칸·항목·요약도 같은 자리에서 걸렸다).
  code: (node, children, ctx) => {
    const lang = language(node.a?.['lang']);
    return ctx.element('pre', ctx.wrap('code', ctx.filled(children()), { class: lang && `language-${lang}` }), {
      'data-nabi-lang': lang,
    });
  },
};
