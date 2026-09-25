// 유튜브 youtube — img와 같은 틀의 블록 단말 물건. 저장하는 건 영상 id(`v`)와 폭(`w`)뿐 — 임베드 주소를 값으로 들면 주소 모양이 바뀔 때마다 문서가 흔들린다.
// A block-leaf object like img — stores only a video id (`v`) and width (`w`), never the embed URL, so a URL format change wouldn't rattle the document.
//
// 첫 클릭은 선택, 재생은 두 번째부터 — 물건을 통째로 고르는 건 surface 몫, iframe이 첫 클릭을 안 삼키게 하는 건 시트 몫이라 여긴 선언만 둔다.
// First click selects, second plays — surface handles whole-object selection, the stylesheet stops the iframe from swallowing that first click; this file only declares the rule.
import type { AttrValue } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { caretAt, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { videoId, youtubeId } from '../../html/url.js';
import { replaceAt } from '../../doc/index.js';
import { blockOwnerAt } from '../../wing/ops.js';
import { LUMP_DEFAULT_ALIGN, boxObject, insertLump, type Wing, type WingChoice } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

const YOUTUBE_NAME: LocaleText = {
  ko: '유튜브',
  en: 'YouTube',
  ja: 'YouTube',
  zh: 'YouTube',
  de: 'YouTube',
  fr: 'YouTube',
  es: 'YouTube',
  pt: 'YouTube',
  ru: 'YouTube',
  ar: 'YouTube',
  hi: 'YouTube',
  bn: 'YouTube',
  ur: 'YouTube',
  id: 'YouTube',
};
const WIDTH_NAME: LocaleText = {
  ko: '유튜브 너비',
  en: 'YouTube width',
  ja: 'YouTube の幅',
  zh: 'YouTube 宽度',
  de: 'YouTube-Breite',
  fr: 'Largeur YouTube',
  es: 'Ancho de YouTube',
  pt: 'Largura do YouTube',
  ru: 'Ширина YouTube',
  ar: 'عرض YouTube',
  hi: 'YouTube की चौड़ाई',
  bn: 'YouTube-এর প্রস্থ',
  ur: 'YouTube کی چوڑائی',
  id: 'Lebar YouTube',
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

const YOUTUBE_ICON = 'youtube-youtube';

// iframe은 클릭을 제 안에서 다 삼켜 영상을 고를 길이 없어지므로, 편집기 안에선 방패 element가 대신 첫 클릭을 받는다.
// An iframe swallows every click, leaving no way to select the video, so an overlay shield intercepts the first click in the editor instead.
const YOUTUBE_CSS = `
.nabi-content iframe { aspect-ratio: 16 / 9; border: 0; border-radius: var(--nabi-radius, 6px); }
/* pointer-events: none만으로는 실제 마우스 클릭이 여전히 새는 자리가 있어, DOM 방패(::after)로 통째로 덮는다. */
/* pointer-events: none alone still let real mouse clicks leak through in some cases, so a DOM overlay (::after) covers the video entirely instead. */
.nabi-content.nabi-editing [data-nabi-p]:has(> iframe) { position: relative; }
.nabi-content.nabi-editing [data-nabi-p]:has(> iframe)::after {
  content: ""; position: absolute; inset: 0; cursor: pointer;
}
/* 고른 뒤에는 방패를 걷는다 — 그때부터의 클릭은 영상의 것이라 그 자리에서 재생된다. */
/* The shield lifts once selected — clicks from then on belong to the video and play it in place. */
.nabi-content.nabi-editing [data-nabi-p]:has(> iframe[data-nabi-picked])::after { content: none; }
`;

const widthChoices = (widths: readonly string[]): readonly WingChoice[] =>
  widths.map((value) => ({ value, label: { en: `${value}%` } }));

// 영상은 50%보다 작아지면 무엇이 나오는지 안 보여 바닥이 그림보다 높다.
// The floor sits higher than image's — below 50% a video becomes unreadable in a way a picture doesn't.
export const YOUTUBE_WIDTHS: readonly string[] = ['50', '60', '70', '80', '90', '100'];

// 그림(60)보다 넓다 — 영상은 16:9 화면 안에 유튜브 크롬까지 한 겹 더 줄어들기 때문이다.
// Wider than image's default (60) — a video shrinks by one more layer inside its 16:9 frame plus YouTube's own chrome.
//
// 넣는 순간 트리에 적힌다 — 안 그러면 화면은 시트 기본값(100%)으로 서고 상황 줄 눈금은 "값 없음"을 읽어 서로 어긋난다.
// Written to the tree at insert time — otherwise the screen falls to the stylesheet default (100%) while the toolbar reads "no value," and the two disagree.
const DEFAULT_WIDTH = '70';

function widthAttr(value: AttrValue): AttrValue | null {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  return YOUTUBE_WIDTHS.includes(raw) ? raw : null;
}

// 영상 id는 모양이 확실할 때만 받는다(11 글자) — 아니면 거절되어 attr가 떨어진다.
// Accepts a video id only when its shape checks out (11 chars); anything else is rejected, dropping the attr.
function videoAttr(value: AttrValue): AttrValue | null {
  return typeof value === 'string' ? videoId(value) : null;
}

// 커맨드와 확인 단추가 나눠 쓰는 한 줄 — 따로 적으면 한쪽만 고쳐지는 날이 온다.
// Shared by both the command and the confirm button's validation — duplicating this logic risks one side drifting from the other.
const youtubeVideo = (raw: string): string | null => youtubeId(raw) ?? videoId(raw);

// 넣기 — 사람은 주소를 붙여넣고, 문서에는 id 만 남는다.
const insertYoutube: Command = (doc, sel, args, env) => {
  const raw = args['v'];
  if (typeof raw !== 'string') return null;
  const id = youtubeVideo(raw);
  if (id === null) return null;
  const a: Record<string, AttrValue> = { v: id };
  const w = args['w'];
  if (w !== undefined) {
    const width = widthAttr(w as AttrValue);
    if (width === null) return null;
    a['w'] = width;
  } else {
    a['w'] = DEFAULT_WIDTH; // 말 없이 넣은 영상의 폭
  }
  const [start] = ordered(sel);
  // 래퍼문단이 가운데로 선다 — 정렬은 물건이 아니라 래퍼문단의 것이다.
  // The wrapper defaults to center — align belongs to the wrapping paragraph, not the object.
  const r = insertLump(doc, start, { w: 'youtube', a, ch: [] }, env, { a: LUMP_DEFAULT_ALIGN });
  return { doc: r.doc, selection: caretAt(r.caret) };
};

// 폭 하나를 갈아 끼운다 — 그림의 것과 같은 모양(값 목록만 다르다).
// Swaps in a new width — same shape as image's version, just a different value list.
const setYoutubeWidth: Command = (doc, sel, args) => {
  const width = widthAttr((args['w'] ?? '') as AttrValue);
  if (width === null) return null;
  const [start] = ordered(sel);
  const owner = blockOwnerAt(doc, start.path, 'youtube');
  const lump = owner?.node;
  if (!owner || !lump) return null;
  if (lump.a?.['w'] === width) return null; // 같은 값 — 무변화 침묵
  return {
    doc: replaceAt(doc, owner.path, [
      {
        w: 'youtube',
        a: { ...(lump.a ?? {}), w: width },
        ch: [],
        ...(lump._id !== undefined ? { _id: lump._id } : {}),
      },
    ]),
    selection: sel,
  };
};

export const youtubeWing: Wing = {
  ...boxObject({
    w: 'youtube',
    attrs: { v: videoAttr, w: widthAttr },
    // 영상 id 없는 영상은 영상이 아니다 — 그림의 src와 같은 규칙이다.
    // No video id, no video — the same rule as image's `src`.
    requires: ['v'],
    button: {
      group: 'media',
      icon: YOUTUBE_ICON,
      label: YOUTUBE_NAME,
      action: {
        kind: 'prompt',
        command: 'insertYoutube',
        // 확인은 insertYoutube가 id를 뽑아낼 수 있는 값일 때만 눌린다 — 커맨드와 같은 검사다.
        // Confirm enables only for a value insertYoutube could extract an id from — the same check the command itself runs.
        fields: [{ name: 'v', kind: 'url', label: ADDRESS_NAME, validate: (value) => youtubeVideo(value) !== null }],
      },
    },
    styles: YOUTUBE_CSS,
  }),
  basic: true,
  context: {
    title: YOUTUBE_NAME,
    controls: [
      {
        // 그림의 폭 눈금과 같은 모양 — 값이 순서를 갖는다.
        // Same slider shape as image's width — the values are ordered.
        kind: 'range',
        name: 'width',
        command: 'setYoutubeWidth',
        argKey: 'w',
        attr: 'w',
        label: WIDTH_NAME,
        values: widthChoices(YOUTUBE_WIDTHS),
        readout: true,
      },
      // 주소 고치기는 없다 — 물건의 주소는 고치는 게 아니라 지우고 다시 놓는 것이다.
      // No address-editing control — an object's source is replaced by deleting and re-inserting, not edited in place.
    ],
  },
  commands: { insertYoutube, setYoutubeWidth },
};

$markBuiltinAttrOwner(youtubeWing, ['youtube']);
