// 링크 a — 마크 하나에 주소(href)와 첨부 이름(file)이 실린다.
// 주소 화이트리스트는 새로 짜지 않는다 — `html/url.ts` 의 `safeUrl` 한 벌이 조립·들여오기
// 커맨드의 같은 문이다. http/https 절대 주소와 같은 사이트 상대 경로만 지난다.
import { isElement, type Attrs, type ElementNode, type NabiNode } from '../../schema/index.js';
import { deleteRange, insertText, setMark, type EditEnv } from '../../doc/index.js';
import { isCollapsed, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { safeUrl } from '../../html/index.js';
import { attachFileLink } from './attach.js';

// attr 값 하나를 글자로 — 수로 들어온 값도 받아 준다(밖에서 온 JSON 이다).
const text = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : undefined;
import { markSpanAt, simpleMark, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// 맨 URL 오토포맷 — 한 토큰이 통째로 주소일 때만. 질의문자열(`&`·`#`)도 `\S+` 라 한 토큰에 든다.
const BARE_URL = /^https?:\/\/\S+$/;

// 이 마크가 덮은 글 — 표시 이름 칸이 채워 넣고 되돌려 받는 값이다. 속의 다른 마크(굵게)는
// 글자를 안 바꾸므로 그대로 이어 붙인다.
function markText(node: NabiNode): string {
  if (!isElement(node)) return node;
  let out = '';
  for (const kid of node.ch) out += markText(kid);
  return out;
}

// 링크를 걸거나(href) 벗긴다(href: null). 목록 밖 주소는 문서에 닿지 않는다.
// **안 준 인자는 지금 값을 잇는다** — 상황 줄의 칸 하나가 나머지를 지우면 안 되기 때문이다.
const setLink: Command = (doc, sel, args, env: EditEnv) => {
  const raw = args['href'];
  if (raw !== undefined && raw !== null && typeof raw !== 'string') return null;
  let aimed = sel;
  let now: Attrs | undefined;
  if (isCollapsed(sel)) {
    // 캐럿이 이미 링크 안이면 그 링크 전체가 겨눔이다(상황 줄의 고치기).
    // 형광펜·글자색과 **같은 규칙**이고, 이제 손잡이(`markSpanAt`)도 같은 하나다.
    const span = markSpanAt(doc, sel.focus, 'a', env);
    if (span) {
      aimed = span.selection;
      now = span.mark.a;
    } else {
      // **걸 글자가 없으면 주소가 곧 글자다** (주인 지시 2026-08-19: "링크는 선택이 없어도
      // 주소가 있으면 주소가 들어가야지"). 여기서 침묵하면 툴바의 링크 단추가 캐럿만 있을 때
      // 아무 일도 안 한다 — 사람이 주소까지 적어 확인을 눌렀는데 문서가 그대로다.
      //
      // 넣는 글자는 **사람이 적은 그대로**다(다듬은 주소가 아니다). `safeUrl` 은 끝에 슬래시를
      // 붙이는 등 모양을 바꾸는데, 화면에 보일 이름표까지 그렇게 바꾸면 제가 적은 것과 다른
      // 글자가 선다. 거는 주소는 다듬은 것, 보이는 글자는 적은 것 — 오토포맷도 같은 짝이다
      // (친 글자는 그대로 두고 그 위에 링크를 건다).
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
  // 넓혀서 겨눴으면(접힌 캐럿) 캐럿은 있던 자리에 그대로 둔다 — 주소 한 번 고쳤다고 링크가
  // 통째로 긁힌 것처럼 보이면 안 된다.
  if (aimed !== sel) return { doc: on.doc, selection: sel };
  return { doc: on.doc, selection: { anchor: on.anchor ?? on.caret, focus: on.caret } };
};

// 표시 이름만 바꾼다 — 주소와 첨부 표식은 그 링크가 이미 들고 있던 것을 그대로 쓴다.
// 빈 이름은 받지 않는다: 이름 없는 링크를 남기는 것은 이름 바꾸기가 아니라 지우기다.
//
// 하는 일은 셋의 합이다 — 그 범위를 지우고, 같은 마크를 입힌 글자를 그 자리에 놓는다.
// 새 편집 연산을 만들지 않는다 (doc 층의 것을 그대로 쓴다).
const renameLink: Command = (doc, sel, args, env: EditEnv) => {
  const text = args['text'];
  if (typeof text !== 'string' || text.trim() === '') return null;
  // 접히지 않은 겨눔은 시작점으로 먼저 찾는다 — 마크 속에서 시작해 밖으로 번진 선택도 잡는다.
  // 시작점이 마크의 **왼쪽 경계와 정확히 같으면** markSpanAt 은 그 점을 "마크 밖"으로 본다
  // (캐럿은 바로 앞 글자를 따르므로, 경계 자체는 아직 마크 앞이다). 첨부를 클릭해 통째로
  // 고른 겨눔이 꼭 그 모양이다(attach.ts 가 [from, to) 로 정확히 만든다) — 그래서 끝점으로
  // 한 번 더 찾는다: 끝점은 "마지막 글자 바로 뒤"라 항상 마크 안으로 잡힌다.
  const at = isCollapsed(sel) ? sel.focus : ordered(sel)[0];
  const span = markSpanAt(doc, at, 'a', env) ?? (isCollapsed(sel) ? null : markSpanAt(doc, ordered(sel)[1], 'a', env));
  if (!span) return null;
  if (markText(span.mark) === text) return null; // 안 바뀌었다 — 빈 되돌리기 지점을 안 남긴다

  const [start, end] = ordered(span.selection);
  const cut = deleteRange(doc, { anchor: start, focus: end }, env);
  const mark: ElementNode = { w: 'a', ch: [], ...(span.mark.a ? { a: span.mark.a } : {}) };
  const put = insertText(cut.doc, cut.caret, text, env, [mark]);
  // 지우기는 됐는데 넣기가 아무것도 안 넣었으면 **링크가 통째로 사라진다.** 그럴 바에는
  // 아무 일도 안 한 것이 낫다 — 이름을 못 바꾼 것은 눈에 보이지만, 사라진 링크는 안 보인다.
  if (put.caret.offset === cut.caret.offset && put.doc === cut.doc) return null;

  // 첨부는 **글이 아니라 한 덩어리다** (attach.ts 규칙 ①) — 이름을 갈아 끼운 자리에 캐럿을
  // 접어 두면 "고를 수 없는 자리에 선 캐럿" 이 남는다. 그 캐럿은 어디를 눌러도 표면이 다시
  // 첨부 속으로 끌어와서, 눌린 자리와 캐럿이 갈린다(주인 신고 2026-08-19).
  // 그래서 첨부는 **통째로 고른 채**로 돌려준다 — 닿으면 통째로 골라진다는 그 규칙 그대로이고,
  // 화면에는 규칙 ④ 의 점선 테두리가 그려진다. 여느 링크는 글이라 캐럿을 그대로 둔다.
  const file = mark.a?.['file'];
  const lump = typeof file === 'string' && file !== '';
  return {
    doc: put.doc,
    selection: lump
      ? { anchor: cut.caret, focus: put.caret }
      : { anchor: put.caret, focus: put.caret },
  };
};

// 이름 셋 — old 사전 이식(14 로케일).
const LINK_NAME: LocaleText = { ko: '링크', en: 'Link', ja: 'リンク', zh: '链接', de: 'Link', fr: 'Lien', es: 'Enlace', pt: 'Link', ru: 'Ссылка', ar: 'رابط', hi: 'लिंक', bn: 'লিঙ্ক', ur: 'لنک', id: 'Tautan' };
const ADDRESS_NAME: LocaleText = { ko: '주소', en: 'Address', ja: 'リンク先', zh: '链接地址', de: 'Adresse', fr: 'Adresse', es: 'Dirección', pt: 'Endereço', ru: 'Адрес', ar: 'عنوان الرابط', hi: 'लिंक का पता', bn: 'লিঙ্কের ঠিকানা', ur: 'لنک کا پتہ', id: 'Alamat' };
const TEXT_NAME: LocaleText = { ko: '표시 이름', en: 'Display name', ja: '表示文字列', zh: '显示文字', de: 'Anzeigetext', fr: 'Texte à afficher', es: 'Texto para mostrar', pt: 'Texto exibido', ru: 'Текст ссылки', ar: 'نص الرابط', hi: 'लिंक का टेक्स्ट', bn: 'প্রদর্শিত লেখা', ur: 'لنک کا متن', id: 'Teks tautan' };
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
/* 편집기 안의 첨부는 글이 아니라 물건이다 — 그림·영상과 같은 손가락 커서(081 §1 의 그 규칙).
   글자 커서(I-빔)가 뜨면 "속을 고칠 수 있다"는 거짓말이 된다. 겨눔이 .nabi-editing 인 까닭도
   같다: 보는 쪽에서 첨부는 눌러서 내려받는 보통 링크라 브라우저의 링크 커서가 맞는 말이다.
   골라진 표시(data-nabi-picked 의 점선 테두리)는 ui 시트의 공용 규칙이 그린다 — 여기는
   커서 하나만 보탠다. */
.nabi-content.nabi-editing a[data-nabi-file] { cursor: pointer; }
/* 봉해진 첨부는 **고를 수도 없다** — 편집기 안에서만 (101, 주인 신고 2026-08-21).
   contenteditable="false" 는 "못 고친다" 는 말이지 "못 고른다" 는 말이 아니다. iOS 는 안 고쳐지는
   조각을 탭하면 그 속 글자를 통째로 골라 손잡이를 띄운다 — 눈에는 "링크 안의 글자가 잡힌" 모양이고,
   그게 바로 고치려던 그 그림이다. 봉인은 캐럿을 막고, 이 줄이 고르기를 막는다. **둘은 짝이다.**
   §3 에서 이 줄이 혼자 안 들었던 까닭도 여기 있다: WebKit 은 고쳐지는 자리 **안에서는** user-select
   를 무시한다(글 쓰는 자리는 늘 고를 수 있어야 하므로). 그때 첨부는 편집 가능한 글의 일부였고,
   지금은 봉해져서 그 예외 밖이라 같은 말이 비로소 선다.
   겨눔에 봉인 자체를 적는 것은 **봉한 것만 고른다**는 뜻이다 — 표식이 빈 첨부는 봉인도 이 줄도
   안 받아야 손이 닿는다(조립이 쓰는 그 잣대와 같은 하나다).
   touch-callout 은 길게 눌렀을 때 뜨는 링크 메뉴(복사·공유·미리보기)를 끈다 — 편집기 안에서 첨부는
   눌러 여는 링크가 아니라 물건이다. */
.nabi-content.nabi-editing a[data-nabi-file][contenteditable="false"] {
  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
}
`;

export const linkWing: Wing = {
  ...simpleMark({
    w: 'a',
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
          // 확인은 `setLink` 가 받을 주소일 때만 눌린다 — 커맨드가 쓰는 그 `safeUrl` 그대로다
          // (상황 줄의 주소 칸도 아래에서 같은 줄을 쓴다). `allowLocal` 을 안 주는 것까지 같다.
          { name: 'href', kind: 'url', label: ADDRESS_NAME, validate: (value) => safeUrl(value) !== null },
          // **첨부 칸은 없다** (주인 지시 2026-08-19): "첨부 링크는 업로드 시에만 걸리는 거야."
          // 첨부는 사람이 손으로 다는 이름표가 아니라 **파일을 올린 결과**다 — 그 표식(`file`)은
          // 올린 파일의 확장자이고, 그것을 손으로 적게 하면 아무 주소에나 첨부 얼굴을 씌울 수
          // 있게 된다(눌러도 내려받을 것이 없는 첨부). 다는 자리는 업로드 한 곳뿐이다
          // (`wings/upload` 가 `{ w: 'a', a: { href, file } }` 를 직접 짓는다).
          // 커맨드는 `file` 을 여전히 받는다 — 이미 첨부인 링크의 **주소만** 고칠 때 그 표식이
          // 살아남아야 하기 때문이다(상황 줄의 주소 칸이 그 길이다).
        ],
      },
    },
    styles: LINK_CSS,
  }),
  // JSON 으로 들어온 링크의 검사 — HTML 입구(`import.ts`)가 하는 것과 **같은 답**을 낸다.
  //
  // 예전에는 이 자리가 비어 있어서 같은 공격이 길에 따라 다르게 끝났다: `<a href="javascript:…">`
  // 를 HTML 로 넣으면 껍데기가 벗겨졌는데, 같은 것을 JSON 으로 넣으면 트리에 그대로 남았다.
  // 출력은 render 가 막으니 안 터졌지만 **저장값이 오염된 채** 백엔드로 갔다.
  //
  // `allowLocal` 을 안 준다 — 링크는 사람이 **가는** 자리라 `blob:`·`data:` 를 받을 이유가 없다
  // (★3 과 같은 규칙이고, `setLink` 커맨드도 처음부터 이렇게 부른다).
  repair: (node) => {
    const href = safeUrl(text(node.a?.['href']));
    if (href === null) return null; // 못 믿을 주소 — 링크가 아니라 평문이다
    // 첨부 표식은 글자 그대로 둔다 — 시트가 배지로 그릴 뿐이고, 그리는 자리는 render 가
    // 이스케이프한다. 여기서 좁히면 `setLink` 로 사람이 적은 이름이 조용히 사라진다.
    const file = text(node.a?.['file']);
    const a: Attrs = file !== undefined && file !== '' ? { href, file } : { href };
    return { w: node.w, a, ch: node.ch, ...(node._id !== undefined ? { _id: node._id } : {}) };
  },
  // 상황 줄 — 캐럿이 링크(첨부 포함) 안에 서면 칸 둘이 뜬다: 주소와 표시 이름.
  //
  // **칸은 판을 여는 단추가 아니라 줄 안에 서는 글자 칸이다.** 값이 이미 있고 그것을 고치러 온
  // 자리라, 보이고 바로 칠 수 있는 것이 한 걸음이다 — 단추를 눌러 판을 띄우는 것은 두 걸음이다.
  //
  // 각자 자기 것만 바꾼다: 주소를 고쳐도 이름은 그대로고, 이름을 고쳐도 주소는 그대로다.
  context: {
    title: LINK_NAME,
    controls: [
      {
        // **첨부에는 주소 칸이 안 뜬다** — 그 주소는 업로드가 정한 것이고 손으로 고칠 값이 아니다.
        kind: 'text',
        name: 'href',
        command: 'setLink',
        argKey: 'href',
        attr: 'href',
        label: ADDRESS_NAME,
        placeholder: ADDRESS_HINT,
        visible: (node) => node.a?.['file'] === undefined,
        // 화이트리스트 밖 주소는 확정 자체가 안 된다 — 커맨드까지 안 간다.
        validate: (value) => safeUrl(value) !== null,
      },
      {
        // 표시 이름은 갈래를 안 가린다 — 보통 링크든 첨부든 같은 칸으로 고친다.
        // 속성이 아니라 그 마크가 덮은 **글**이라 `initial` 로 읽는다.
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
  // 눌림 표시의 한 길 — 지금 선 링크의 주소다 (상황 줄이 읽는다).
  currentValue: (node) => {
    const href = node.a?.['href'];
    return typeof href === 'string' && href !== '' ? href : undefined;
  },
  commands: { setLink, renameLink },
  // 첨부는 한 덩어리다 — 클릭·닿기에 통째로 골라져 물건의 점선 테두리를 입고, 붙어 있는
  // 지우기는 먼저 겨눈다 (규칙 넷은 attach.ts 머리말에).
  attach: attachFileLink,
  inputRules: [
    { trigger: 'space', scope: 'word', pattern: BARE_URL, run: (m) => ({ name: 'setLink', args: { href: m[0] } }) },
    { trigger: 'enter', scope: 'word', pattern: BARE_URL, run: (m) => ({ name: 'setLink', args: { href: m[0] } }) },
  ],
};
