// 링크 a — 마크 하나에 주소(href)와 첨부 이름(file)이 실린다.
// A link mark carries a URL (href) and, for attachments, a file name (file).
//
// 주소 화이트리스트는 새로 짜지 않는다 — `safeUrl` 한 벌이 조립·들여오기·커맨드의 같은 문이다.
// The URL whitelist isn't reimplemented here — `safeUrl` is the one gate every path (build, import, command) shares.
import { isElement, type Attrs, type ElementNode, type NabiNode } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { deleteRange, insertText, setMark, type EditEnv } from '../../doc/index.js';
import { isCollapsed, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { safeUrl } from '../../html/index.js';
import { attachFileLink } from './attach.js';

// attr 값 하나를 글자로 — 수로 들어온 값도 받아 준다(밖에서 온 JSON이다).
// Coerces an attr value to text — accepts a number too, since this may come from external JSON.
const text = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : undefined;
import { markSpanAt, simpleMark, type Wing } from '../../wing/index.js';
import type { MdBuilder } from '../../io/index.js';
import type { LocaleText } from '../../locale/index.js';

// md 링크의 주소 자리 — 괄호가 짝을 흔들지 않게 막고, 공백은 부호로 바꾼다.
// The URL slot of an md link — escapes parens so they can't unbalance the syntax, and encodes spaces.
const mdUrl = (raw: string): string => raw.replace(/[\\()]/g, '\\$&').replace(/ /g, '%20');

// 첨부는 md에 자리가 없다 — `file` 표식을 실을 칸이 없어 껍데기만 남으면 못 내려받는 링크가 되니 html로 낸다.
// Attachments have no slot in md — without room for the `file` tag, a stripped-down link would be un-downloadable, so it renders as html instead.
const linkMd: MdBuilder = (node, ctx) => {
  const href = text(node.a?.['href']);
  const file = text(node.a?.['file']);
  if (href === undefined || href === '' || (file !== undefined && file !== '')) return ctx.html();
  return `[${ctx.children()}](${mdUrl(href)})`;
};

// 맨 URL 오토포맷 — 한 토큰이 통째로 주소일 때만.
// Bare-URL autoformat — fires only when one whole token is the address.
const BARE_URL = /^https?:\/\/\S+$/;

// 이 마크가 덮은 글 — 속의 다른 마크(굵게 등)는 글자를 안 바꾸므로 그대로 이어 붙인다.
// The text this mark covers — nested marks (bold etc.) don't change characters, so they're just concatenated through.
function markText(node: NabiNode): string {
  if (!isElement(node)) return node;
  let out = '';
  for (const kid of node.ch) out += markText(kid);
  return out;
}

// 링크를 걸거나(href) 벗긴다(href: null) — 목록 밖 주소는 문서에 안 닿는다.
// Sets (href) or strips (href: null) a link — a rejected URL never reaches the document.
//
// 안 준 인자는 지금 값을 잇는다 — 상황 줄의 칸 하나가 나머지를 지우면 안 되기 때문이다.
// An omitted argument carries the current value forward — one context-toolbar field must not wipe the others.
const setLink: Command = (doc, sel, args, env: EditEnv) => {
  const raw = args['href'];
  if (raw !== undefined && raw !== null && typeof raw !== 'string') return null;
  let aimed = sel;
  let now: Attrs | undefined;
  if (isCollapsed(sel)) {
    // 캐럿이 이미 링크 안이면 그 링크 전체가 겨눔이다 — 형광펜·글자색과 같은 규칙이다.
    // If the caret already sits inside a link, the whole link becomes the target — same rule as highlight/text-color.
    const span = markSpanAt(doc, sel.focus, 'a', env);
    if (span) {
      aimed = span.selection;
      now = span.mark.a;
    } else {
      // 걸 글자가 없으면 주소가 곧 글자다 — 캐럿만 있어도 주소를 적었으면 문서에 반영돼야 한다.
      // With nothing selected, the URL becomes the visible text — typing an address must still do something at a bare caret.
      //
      // 거는 주소는 safeUrl이 다듬은 것, 보이는 글자는 사람이 적은 그대로 — 서로 다른 값을 쓴다.
      // The stored href is safeUrl's normalized form, but the visible text stays exactly as typed — the two intentionally differ.
      if (typeof raw !== 'string' || raw === '') return null;
      const href = safeUrl(raw);
      if (href === null) return null;
      const mark: ElementNode = { w: 'a', a: { href }, ch: [] };
      const put = insertText(doc, sel.focus, raw, env, [mark]);
      return { doc: put.doc, selection: { anchor: put.caret, focus: put.caret } };
    }
  }
  const [start, end] = ordered(aimed);
  const range = { anchor: start, focus: end };

  if (raw === null) {
    const off = setMark(doc, range, 'a', null, env);
    return { doc: off.doc, selection: { anchor: off.anchor ?? off.caret, focus: off.caret } };
  }

  const wanted = raw ?? (typeof now?.['href'] === 'string' ? (now['href'] as string) : undefined);
  if (wanted === undefined) return null;
  const href = safeUrl(wanted);
  if (href === null) return null; // 화이트리스트 밖 — 거절이지 다듬기가 아니다

  const given = args['file'];
  const file = given === undefined ? now?.['file'] : given;
  const a: Attrs = typeof file === 'string' && file !== '' ? { href, file } : { href };
  const on = setMark(doc, range, 'a', a, env);
  // 넓혀서 겨눴으면(접힌 캐럿) 캐럿을 그대로 둔다 — 주소만 고쳤을 뿐인데 링크가 통째로 골라진 것처럼 보이면 안 된다.
  // If the target was widened from a collapsed caret, keep the caret put — editing just the URL shouldn't look like selecting the whole link.
  if (aimed !== sel) return { doc: on.doc, selection: sel };
  return { doc: on.doc, selection: { anchor: on.anchor ?? on.caret, focus: on.caret } };
};

// 표시 이름만 바꾼다 — 주소·첨부 표식은 그대로 두고, 빈 이름은 안 받는다(그건 지우기다).
// Renames only the display text — address and file tag carry over unchanged; an empty name is rejected (that's deletion, not renaming).
const renameLink: Command = (doc, sel, args, env: EditEnv) => {
  const text = args['text'];
  if (typeof text !== 'string' || text.trim() === '') return null;
  // 시작점이 마크 왼쪽 경계와 같으면 markSpanAt은 "마크 밖"으로 본다 — 첨부를 통째로 고른 선택이 그 모양이라 끝점으로도 한 번 더 찾는다.
  // markSpanAt reads a start position exactly at a mark's left edge as "outside" it — an attachment's whole-selection click is shaped exactly that way, so the end point is tried too.
  const at = isCollapsed(sel) ? sel.focus : ordered(sel)[0];
  const span = markSpanAt(doc, at, 'a', env) ?? (isCollapsed(sel) ? null : markSpanAt(doc, ordered(sel)[1], 'a', env));
  if (!span) return null;
  if (markText(span.mark) === text) return null; // 안 바뀌었다 — 빈 되돌리기 지점을 안 남긴다

  const [start, end] = ordered(span.selection);
  const cut = deleteRange(doc, { anchor: start, focus: end }, env);
  const mark: ElementNode = { w: 'a', ch: [], ...(span.mark.a ? { a: span.mark.a } : {}) };
  const put = insertText(cut.doc, cut.caret, text, env, [mark]);
  // 지우기는 됐는데 넣기가 아무것도 안 넣었으면 링크가 통째로 사라진다 — 그럴 바엔 아무 일도 안 하는 게 낫다.
  // If the delete succeeded but the insert added nothing, the link would vanish entirely — better to no-op than lose it.
  if (put.caret.offset === cut.caret.offset && put.doc === cut.doc) return null;

  // 첨부는 글이 아니라 한 덩어리다(attach.ts) — 캐럿을 접어 두면 눌러도 늘 통째로 다시 골라져 눌린 자리와 갈린다.
  // An attachment is a lump, not text (attach.ts) — a collapsed caret there would just get re-selected whole on any click, diverging from where it was placed.
  const file = mark.a?.['file'];
  const lump = typeof file === 'string' && file !== '';
  return {
    doc: put.doc,
    selection: lump ? { anchor: cut.caret, focus: put.caret } : { anchor: put.caret, focus: put.caret },
  };
};

const LINK_NAME: LocaleText = {
  ko: '링크',
  en: 'Link',
  ja: 'リンク',
  zh: '链接',
  de: 'Link',
  fr: 'Lien',
  es: 'Enlace',
  pt: 'Link',
  ru: 'Ссылка',
  ar: 'رابط',
  hi: 'लिंक',
  bn: 'লিঙ্ক',
  ur: 'لنک',
  id: 'Tautan',
};
const ADDRESS_NAME: LocaleText = {
  ko: '주소',
  en: 'Address',
  ja: 'リンク先',
  zh: '链接地址',
  de: 'Adresse',
  fr: 'Adresse',
  es: 'Dirección',
  pt: 'Endereço',
  ru: 'Адрес',
  ar: 'عنوان الرابط',
  hi: 'लिंक का पता',
  bn: 'লিঙ্কের ঠিকানা',
  ur: 'لنک کا پتہ',
  id: 'Alamat',
};
const TEXT_NAME: LocaleText = {
  ko: '표시 이름',
  en: 'Display name',
  ja: '表示文字列',
  zh: '显示文字',
  de: 'Anzeigetext',
  fr: 'Texte à afficher',
  es: 'Texto para mostrar',
  pt: 'Texto exibido',
  ru: 'Текст ссылки',
  ar: 'نص الرابط',
  hi: 'लिंक का टेक्स्ट',
  bn: 'প্রদর্শিত লেখা',
  ur: 'لنک کا متن',
  id: 'Teks tautan',
};
const ADDRESS_HINT: LocaleText = { ko: 'https://…', en: 'https://…' };

const LINK_ICON =
  '<g transform="translate(8 8) scale(1.1) translate(-8 -8)" stroke-width="1.273">' +
  '<path d="M6.5 9.5 9.5 6.5"/>' +
  '<path d="M6.75 4.25 8 3a2.8 2.8 0 0 1 4 4l-1.25 1.25M9.25 11.75 8 13a2.8 2.8 0 0 1-4-4l1.25-1.25"/></g>';

const LINK_CSS = `
.nabi-content a { color: var(--nabi-accent); text-underline-offset: 2px; }
.nabi-content a[data-nabi-file] {
  display: inline-flex; align-items: center; gap: .35em; text-decoration: none;
  border: 1px solid var(--nabi-line); border-radius: 4px; padding: .1em .5em;
}
.nabi-content a[data-nabi-file]::before { content: "📎"; font-size: .9em; }
.nabi-content a[data-nabi-file]:not([data-nabi-file=""])::after {
  content: attr(data-nabi-file); font-size: .75em; color: var(--nabi-muted); text-transform: uppercase;
}
/* 첨부는 글이 아니라 물건이라 손가락 커서를 쓴다 — 글자 커서는 "속을 고칠 수 있다"는 거짓말이 된다. */
/* An attachment is an object, not text, so it gets a pointer cursor — a text cursor would falsely promise editable content. */
.nabi-content.nabi-editing a[data-nabi-file] { cursor: pointer; }
/* iOS Safari는 <a> 탭을 preventDefault와 무관하게 네이티브로 이동시킨다 — mount의 click 가로채기만으론 못 막아 포인터 자체를 죽인다. */
/* iOS Safari navigates a tapped <a> natively regardless of preventDefault — click interception alone can't stop it, so pointer events are killed outright. */
@media (hover: none) {
  .nabi-content.nabi-editing a:not([data-nabi-file]) { pointer-events: none; }
}
/* 봉해진 첨부는 편집기 안에서 고를 수도 없다 — contenteditable="false"는 못 고친다는 말이지 못 고른다는 말이 아니라서, 이 줄이 그 나머지를 막는다. */
/* A sealed attachment can't even be selected inside the editor — contenteditable="false" blocks editing, not selection, so this rule covers the gap. */
.nabi-content.nabi-editing a[data-nabi-file][contenteditable="false"] {
  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
}
`;

export const linkWing: Wing = {
  ...simpleMark({
    w: 'a',
    clearable: true,
    escapeKeys: ['Escape'],
    button: {
      group: 'link',
      accelerator: 'mod+k',
      svg: LINK_ICON,
      label: LINK_NAME,
      action: {
        kind: 'prompt',
        command: 'setLink',
        fields: [
          // 확인은 setLink가 받을 주소일 때만 눌린다 — 커맨드가 쓰는 그 safeUrl 그대로다.
          // Confirm enables only for a URL setLink would accept — the same safeUrl the command itself uses.
          { name: 'href', kind: 'url', label: ADDRESS_NAME, validate: (value) => safeUrl(value) !== null },
          // 첨부 칸은 없다 — 첨부는 손으로 다는 이름표가 아니라 업로드 결과라, 다는 자리는 업로드 한 곳뿐이다.
          // No attachment field here — a `file` tag comes only from an upload, never typed by hand onto an arbitrary URL.
        ],
      },
    },
    styles: LINK_CSS,
  }),
  basic: true,
  toMd: linkMd,
  // JSON으로 들어온 링크도 HTML 입구(import.ts)와 같은 검사를 받는다 — 안 그러면 `javascript:` 같은 값이 트리에 그대로 남는다.
  // A link arriving as JSON gets the same check as the HTML import path — otherwise something like `javascript:` would survive untouched in the tree.
  //
  // allowLocal을 안 준다 — 링크는 사람이 가는 자리라 blob:/data:를 받을 이유가 없다.
  // No allowLocal here — a link is a place people navigate to, so blob:/data: URLs have no reason to be accepted.
  repair: (node) => {
    const href = safeUrl(text(node.a?.['href']));
    if (href === null) return null; // 못 믿을 주소 — 링크가 아니라 평문이다
    // 첨부 표식은 글자 그대로 둔다 — 좁히면 사람이 적은 이름이 조용히 사라진다.
    // The file tag passes through untouched — narrowing it here would silently erase a name someone typed.
    const file = text(node.a?.['file']);
    const a: Attrs = file !== undefined && file !== '' ? { href, file } : { href };
    return { w: node.w, a, ch: node.ch, ...(node._id !== undefined ? { _id: node._id } : {}) };
  },
  // 캐럿이 링크(첨부 포함) 안에 서면 주소·표시 이름 칸 둘이 뜬다 — 판을 여는 단추가 아니라 바로 칠 수 있는 글자 칸이다.
  // Standing inside a link shows two inline fields (address, display name) instead of a panel-opening button — one step, not two.
  context: {
    title: LINK_NAME,
    controls: [
      {
        // 첨부에는 주소 칸이 안 뜬다 — 그 주소는 업로드가 정한 것이고 손으로 고칠 값이 아니다.
        // Hidden for attachments — that URL was set by the upload, not something to hand-edit.
        kind: 'text',
        name: 'href',
        command: 'setLink',
        argKey: 'href',
        attr: 'href',
        label: ADDRESS_NAME,
        placeholder: ADDRESS_HINT,
        visible: (node) => node.a?.['file'] === undefined,
        validate: (value) => safeUrl(value) !== null,
      },
      {
        // 표시 이름은 갈래를 안 가린다(보통 링크든 첨부든 같은 칸) — 속성이 아니라 글이라 initial로 읽는다.
        // The display-name field doesn't care whether it's a plain link or attachment — it's text, not an attr, so it reads via `initial`.
        kind: 'text',
        name: 'text',
        command: 'renameLink',
        argKey: 'text',
        label: TEXT_NAME,
        initial: (node) => markText(node),
        validate: (value) => value.trim() !== '',
      },
    ],
  },
  currentValue: (node) => {
    const href = node.a?.['href'];
    return typeof href === 'string' && href !== '' ? href : undefined;
  },
  commands: { setLink, renameLink },
  // 첨부는 한 덩어리 — 클릭에 통째로 골라져 물건의 점선 테두리를 입는다(규칙은 attach.ts 머리말).
  // An attachment is one lump — a click selects it whole, wearing an object's dashed outline (see attach.ts's header for the rules).
  attach: attachFileLink,
  inputRules: [
    { trigger: 'space', scope: 'word', pattern: BARE_URL, run: (m) => ({ name: 'setLink', args: { href: m[0] } }) },
    { trigger: 'enter', scope: 'word', pattern: BARE_URL, run: (m) => ({ name: 'setLink', args: { href: m[0] } }) },
  ],
};

$markBuiltinAttrOwner(linkWing, ['a']);
