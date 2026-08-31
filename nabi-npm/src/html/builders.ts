// wing 등록 전까지 문서를 그릴 기본 태그 대응(wing의 toHtml이 덮어씀) — 저장값은 무엇인지만 말하고 모양은 시트(nabi.css)의 몫, 인라인 style은 안 낸다.
// A fallback tag mapping so a document renders before wings register (a wing's toHtml overrides by name); stored attrs say only what a thing is, never how it looks — no inline style is emitted.
import type { HtmlBuilder, HtmlBuilders } from './contract.js';
import { embedSrc, videoId } from './url.js';
import { language, name, span, text, width } from './values.js';

// 화면 전용 받침이라 셈에 안 든다 — 캐럿 사상(surface/map.ts)이 이 표식을 보고 건너뛴다.
// A screen-only filler that doesn't count; caret mapping (surface/map.ts) sees this marker and skips it.
export const FILLER_ATTR = 'data-nabi-filler';

// --- 마크 ------------------------------------------------------------------------------------

function mark(tag: string): HtmlBuilder {
  return (_node, children, ctx) => ctx.element(tag, children());
}

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

  // 첨부는 download를 값 없이 달고(글자는 이름표라 파일명이 못 됨), 편집기 HTML에서만 contenteditable/draggable="false"로 "문서 아님"을 선언한다(CSS user-select는 모바일에서 안 먹혔다, 101).
  // An attachment gets a valueless `download` (its text is a label, not a filename) and, in editor HTML only, contenteditable/draggable="false" to declare "not a document" — CSS user-select alone failed on mobile (101).
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
    // 주소를 못 믿는 그림은 없는 것으로 친다.
    // An untrustworthy address is treated as no image at all.
    if (src === null) return '';
    return ctx.element('img', '', {
      src,
      // 언제나 빈 alt다 — 없으면 낭독기가 파일 이름을 소리 내어 읽지만, 빈 값은 조용히 지나간다.
      // Always an empty alt — omitting it makes screen readers speak the filename aloud, but empty is silently skipped.
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

  // 폭이 없는 대신 넘치면 가로로 구른다 — 겉옷은 표 자신의 태그가 아니므로 키를 안 받는다.
  // No fixed width; an overflow just scrolls horizontally. The wrapper isn't the table's own tag, so it takes no key.
  table: (_node, children, ctx) => ctx.wrap('div', ctx.element('table', children()), { class: 'nabi-scroll' }),
  tr: (_node, children, ctx) => ctx.element('tr', children()),
  td: (node, children, ctx) =>
    ctx.element('td', ctx.filled(children()), {
      colspan: span(node.a?.['colspan']),
      rowspan: span(node.a?.['rowspan']),
    }),

  // 체크리스트는 ul을 글머리와 나눠 쓰므로 표식(data-nabi-list)으로 갈린다.
  // A task list shares the `ul` tag with bullets, distinguished only by the data-nabi-list marker.
  ul: (_node, children, ctx) => ctx.element('ul', children()),
  li: (_node, children, ctx) => ctx.element('li', ctx.filled(children())),
  ol: (_node, children, ctx) => ctx.element('ol', children()),
  oli: (_node, children, ctx) => ctx.element('li', ctx.filled(children())),
  tl: (_node, children, ctx) => ctx.element('ul', children(), { 'data-nabi-list': 'task' }),
  tli: (node, children, ctx) =>
    ctx.element('li', ctx.filled(children()), { 'data-nabi-checked': node.a?.['ck'] === 1 ? 'true' : 'false' }),

  // 편집기도 저장값 그대로 그린다 — 예전엔 늘 펼쳐 뒀는데, 그러면 저장될 모습을 화면이 말 못 해 상황줄에 별도 단추가 필요했다.
  // The editor renders the stored value as-is; forcing it always-open (as before) hid what would actually be saved, needing separate toolbar buttons.
  quote: (_node, children, ctx) => ctx.element('blockquote', children()),
  details: (node, children, ctx) => ctx.element('details', children(), { open: node.a?.['o'] === 1 ? '' : undefined }),
  summary: (_node, children, ctx) => ctx.element('summary', ctx.filled(children())),

  // pre > code.language-* 관례로 감싼다 — 끝의 라인 뒤 받침은 ctx.filled가 대신 세운다(모든 홀더의 공통 사정이라 한 문으로 모았다).
  // Wraps in the pre > code.language-* convention; a trailing filler after the last line comes from ctx.filled, since every holder shares this need.
  code: (node, children, ctx) => {
    const lang = language(node.a?.['lang']);
    return ctx.element('pre', ctx.wrap('code', ctx.filled(children()), { class: lang && `language-${lang}` }), {
      'data-nabi-lang': lang,
    });
  },
};
