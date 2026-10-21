// 각주 fn — 글자 사이에 서는 인라인 단말이다. 내용(t)은 한 줄 텍스트이고 번호는 저장하지 않고 문서 순서로 매긴다.
// A footnote is an inline terminal standing between characters; its content (t) is one line of text and its number is never stored, only derived from document order.
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { deleteRange, insertTerminal, nodeAt, replaceAt } from '../../doc/index.js';
import { caretAt, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { $markInlineTerminal, markSpanAt, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';
import { attachFootnotes } from './attach.js';
import {
  FN,
  footnoteAt,
  footnoteList,
  footnoteMdList,
  footnoteText,
  takesFootnote,
  textOf,
  withNode,
} from './model.js';

const FOOTNOTE_NAME: LocaleText = {
  ko: '각주',
  en: 'Footnote',
  ja: '脚注',
  zh: '脚注',
  de: 'Fußnote',
  fr: 'Note de bas de page',
  es: 'Nota al pie',
  pt: 'Nota de rodapé',
  ru: 'Сноска',
  ar: 'حاشية سفلية',
  hi: 'फ़ुटनोट',
  bn: 'পাদটীকা',
  ur: 'حاشیہ',
  id: 'Catatan kaki',
  fa: 'پانویس',
  mr: 'तळटीप',
  vi: 'Chú thích cuối trang',
  te: 'పాదసూచిక',
  ha: 'Bayanin ƙasa',
  tr: 'Dipnot',
  sw: 'Tanbihi',
  ta: 'அடிக்குறிப்பு',
  th: 'เชิงอรรถ',
  it: 'Nota a piè di pagina',
};

const CONTENT_NAME: LocaleText = {
  ko: '각주 내용',
  en: 'Footnote text',
  ja: '脚注の内容',
  zh: '脚注内容',
  de: 'Fußnotentext',
  fr: 'Texte de la note',
  es: 'Texto de la nota',
  pt: 'Texto da nota',
  ru: 'Текст сноски',
  ar: 'نص الحاشية',
  hi: 'फ़ुटनोट का पाठ',
  bn: 'পাদটীকার লেখা',
  ur: 'حاشیے کا متن',
  id: 'Isi catatan kaki',
  fa: 'متن پانویس',
  mr: 'तळटीपेचा मजकूर',
  vi: 'Nội dung chú thích',
  te: 'పాదసూచిక పాఠ్యం',
  ha: 'Rubutun bayanin ƙasa',
  tr: 'Dipnot metni',
  sw: 'Maandishi ya tanbihi',
  ta: 'அடிக்குறிப்பு உரை',
  th: 'ข้อความเชิงอรรถ',
  it: 'Testo della nota',
};

const EDIT_NAME: LocaleText = {
  ko: '각주 수정',
  en: 'Edit footnote',
  ja: '脚注を編集',
  zh: '编辑脚注',
  de: 'Fußnote bearbeiten',
  fr: 'Modifier la note',
  es: 'Editar nota',
  pt: 'Editar nota',
  ru: 'Изменить сноску',
  ar: 'تعديل الحاشية',
  hi: 'फ़ुटनोट संपादित करें',
  bn: 'পাদটীকা সম্পাদনা',
  ur: 'حاشیہ میں ترمیم',
  id: 'Ubah catatan kaki',
  fa: 'ویرایش پانویس',
  mr: 'तळटीप संपादित करा',
  vi: 'Sửa chú thích',
  te: 'పాదసూచికను సవరించు',
  ha: 'Gyara bayanin ƙasa',
  tr: 'Dipnotu düzenle',
  sw: 'Hariri tanbihi',
  ta: 'அடிக்குறிப்பைத் திருத்து',
  th: 'แก้ไขเชิงอรรถ',
  it: 'Modifica nota',
};

const REMOVE_NAME: LocaleText = {
  ko: '각주 삭제',
  en: 'Delete footnote',
  ja: '脚注を削除',
  zh: '删除脚注',
  de: 'Fußnote löschen',
  fr: 'Supprimer la note',
  es: 'Eliminar nota',
  pt: 'Excluir nota',
  ru: 'Удалить сноску',
  ar: 'حذف الحاشية',
  hi: 'फ़ुटनोट हटाएँ',
  bn: 'পাদটীকা মুছুন',
  ur: 'حاشیہ حذف کریں',
  id: 'Hapus catatan kaki',
  fa: 'حذف پانویس',
  mr: 'तळटीप हटवा',
  vi: 'Xóa chú thích',
  te: 'పాదసూచికను తొలగించు',
  ha: 'Share bayanin ƙasa',
  tr: 'Dipnotu sil',
  sw: 'Futa tanbihi',
  ta: 'அடிக்குறிப்பை நீக்கு',
  th: 'ลบเชิงอรรถ',
  it: 'Elimina nota',
};

// 번호와 목록의 서식은 고정이다 — 본문 서체·제목·글자 크기·굵게가 안 미치고, 목록은 본문 기본보다 한 단계 작은(0.875) 산세리프다.
// Number and list formatting is fixed: body typeface, headings, font size, and bold never reach them, and the list is sans-serif one step below the body size (0.875).
const FOOTNOTE_CSS = `
.nabi-content [data-nabi-fn] {
  font-family: var(--nabi-font, var(--nabi-font-fallback)); font-weight: 400; font-style: normal;
  font-size: .75em; line-height: 0; vertical-align: super; white-space: nowrap; color: var(--nabi-accent);
}
.nabi-content.nabi-editing [data-nabi-fn] {
  cursor: pointer; border-radius: var(--nabi-radius-xs);
  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
}
.nabi-content.nabi-editing [data-nabi-fn]::before { content: "[" attr(data-nabi-n) "]"; }
.nabi-content.nabi-editing [data-nabi-fn][data-nabi-picked] { outline: 1px dashed var(--nabi-accent); outline-offset: 1px; }
.nabi-content [data-nabi-fn][data-nabi-fn-open] { background: color-mix(in srgb, var(--nabi-accent) 14%, transparent); }
.nabi-content [data-nabi-footnotes] {
  font-family: var(--nabi-font, var(--nabi-font-fallback)); font-size: .875em; font-weight: 400; font-style: normal;
  line-height: 1.6; text-align: start; margin-block-start: .6em; padding-block-start: .6em;
  border-block-start: 1px solid var(--nabi-line);
}
.nabi-content [data-nabi-footnotes] ol { list-style: none; margin: 0; padding: 0; }
.nabi-content [data-nabi-footnotes] li { margin: 0; padding-block-end: .2em; overflow-wrap: anywhere; }
.nabi-content [data-nabi-fn-num] { color: var(--nabi-accent); font-variant-numeric: tabular-nums; margin-inline-end: .2em; }
.nabi-content [data-nabi-footnotes][data-nabi-fn-ready] [data-nabi-fn-num] { cursor: pointer; }
.nabi-footnote-area { padding-block-start: 0; }
.nabi-footnote-area [data-nabi-footnotes] { margin-block-start: 0; padding-block-end: 0; }
.nabi-fullscreen-content + .nabi-footnote-area {
  box-sizing: border-box; inline-size: var(--nabi-fullscreen-content-width, 100%); max-inline-size: 100%;
  margin-inline: auto; background: var(--nabi-fullscreen-content-bg, var(--nabi-bg));
}
.nabi-fn-tip {
  position: fixed; z-index: var(--nabi-z-dialog); box-sizing: border-box;
  max-inline-size: min(22rem, calc(100vw - 16px)); max-block-size: min(40vh, 16rem); overflow: auto;
  padding: .45em .7em; border: 1px solid var(--nabi-line); border-radius: var(--nabi-radius-sm);
  background: var(--nabi-bg); color: var(--nabi-fg); box-shadow: var(--nabi-shadow);
  font-family: var(--nabi-font, var(--nabi-font-fallback)); font-size: .875em; font-weight: 400; font-style: normal;
  line-height: 1.6; text-align: start; overflow-wrap: anywhere; white-space: normal;
}
.nabi-fn-tip button[data-nabi-fn-num] {
  padding: 0; border: 0; background: transparent; font: inherit; cursor: pointer;
}
`;

const valid = (value: string): boolean => footnoteText(value) !== null;

// 캐럿(또는 선택 끝)에 각주 하나를 세운다 — 고른 글자는 그대로 둔다. 링크 글자 안이면 링크 바깥 끝으로 옮긴다(게시 화면에서 번호 누르기와 링크 이동이 겹치지 않게).
// Plants one footnote at the caret (or the selection's end), leaving selected text alone; inside link text it moves past the link so a number tap never doubles as navigation.
const insertFootnote: Command = (doc, sel, args, env) => {
  const t = footnoteText(args['t']);
  if (t === null) return null;
  let at = ordered(sel)[1];
  const holder = nodeAt(doc, at.path);
  if (!holder || !takesFootnote(holder, env)) return null;
  const link = markSpanAt(doc, at, 'a', env);
  if (link) at = ordered(link.selection)[1];
  const put = insertTerminal(doc, at, { w: FN, a: { t }, ch: [] }, env);
  if (put.doc === doc) return null;
  return { doc: put.doc, selection: caretAt(put.caret) };
};

// 꼭 맞게 고른 각주 하나의 내용만 바꾼다 — 같은 값이면 빈 되돌리기 지점을 안 남긴다.
// Changes only the content of the one footnote exactly selected; the same value leaves no empty undo step.
const setFootnote: Command = (doc, sel, args, env) => {
  const t = footnoteText(args['t']);
  if (t === null) return null;
  const hit = footnoteAt(doc, sel, env);
  if (!hit || textOf(hit.node) === t) return null;
  const next = { w: FN, a: { t }, ch: [], ...(hit.node._id !== undefined ? { _id: hit.node._id } : {}) };
  return { doc: replaceAt(doc, hit.path, [withNode(hit.holder, hit.node, next)]), selection: sel };
};

// 꼭 맞게 고른 각주 하나를 지운다 — 모바일에는 Delete 키가 없어 상황 줄 단추가 이 일을 한다.
// Deletes the one footnote exactly selected; mobile has no Delete key, so the context-row button does this.
const removeFootnote: Command = (doc, sel, _args, env) => {
  const hit = footnoteAt(doc, sel, env);
  if (!hit) return null;
  const cut = deleteRange(
    doc,
    { anchor: { path: hit.path, offset: hit.offset }, focus: { path: hit.path, offset: hit.offset + 1 } },
    env,
  );
  return { doc: cut.doc, selection: caretAt(cut.caret) };
};

export const footnoteWing: Wing = {
  w: FN,
  place: 'void',
  basic: true,
  toHtml: (node, _children, ctx) => {
    const t = textOf(node);
    // 편집 화면의 번호는 attach가 매긴다 — 문단 단위로 다시 그리므로 여기서 굳히면 다른 문단의 번호가 낡는다.
    // The editor's number comes from attach; redraws are per paragraph, so baking it here would leave other paragraphs' numbers stale.
    if (ctx.keys) return ctx.element('span', '', { 'data-nabi-fn': t });
    // 문서 전체가 아닌 조각(diff·병합 줄)에는 번호가 없다 — 번호가 밀린 것만으로 바뀐 블록이 되지 않게 같은 표식을 쓴다.
    // A fragment that isn't the whole document (diff/merge rows) has no number; a fixed mark keeps a shifted number from making a block look changed.
    const label = ctx.ordinal === undefined ? '[*]' : `[${ctx.ordinal}]`;
    return ctx.element('sup', ctx.escape(label), { 'data-nabi-fn': t });
  },
  toMd: (_node, ctx) => (ctx.ordinal === undefined ? ctx.html() : `[^${ctx.ordinal}]`),
  // 내용은 속성 값만 읽는다 — 표식 속 글자(번호)는 파생값이고, 생성된 목록은 원본이 아니라 버린다.
  // Content comes only from the attribute value; the number inside the marker is derived, and the generated list isn't a source, so it's dropped.
  claim: (el) => {
    if (el.tag === 'section' && el.attrs['data-nabi-footnotes'] !== undefined) return [];
    if (el.tag !== 'sup' && el.tag !== 'span') return null;
    const raw = el.attrs['data-nabi-fn'];
    if (raw === undefined) return null;
    const t = footnoteText(raw);
    return t === null ? [] : [{ w: FN, a: { t }, ch: [] }];
  },
  repair: (node) => {
    const t = footnoteText(node.a?.['t']);
    if (t === null) return null;
    return { w: node.w, a: { t }, ch: [], ...(node._id !== undefined ? { _id: node._id } : {}) };
  },
  commands: { insertFootnote, setFootnote, removeFootnote },
  button: {
    group: 'link',
    icon: 'footnote-footnote',
    label: FOOTNOTE_NAME,
    action: {
      kind: 'prompt',
      command: 'insertFootnote',
      submitOnOutside: true,
      fields: [{ name: 't', kind: 'textarea', singleLine: true, label: CONTENT_NAME, validate: valid }],
    },
  },
  context: {
    title: FOOTNOTE_NAME,
    controls: [
      {
        kind: 'prompt',
        name: 'edit',
        label: EDIT_NAME,
        icon: 'footnote-edit',
        command: 'setFootnote',
        submitOnOutside: true,
        fields: [{ name: 't', attr: 't', kind: 'textarea', singleLine: true, label: CONTENT_NAME, validate: valid }],
      },
      { kind: 'button', name: 'remove', label: REMOVE_NAME, icon: 'delete', command: 'removeFootnote' },
    ],
  },
  attach: attachFootnotes,
  styles: FOOTNOTE_CSS,
};

$markBuiltinAttrOwner(footnoteWing, [FN]);
$markInlineTerminal(footnoteWing, { appendix: footnoteList, mdAppendix: footnoteMdList });
