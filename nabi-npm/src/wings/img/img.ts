// 이미지 img — 블록 단말 물건. 정렬은 래퍼문단의 `a`가 들고, 물건 자신의 것은 폭(`w`)뿐이다.
// The image wing is a leaf block object; align lives on the wrapper paragraph, the object itself keeps only width (`w`).
//
// 목록 밖 폭·못 믿을 주소는 가장 가까운 값으로 스냅하지 않고 거절되어 없는 값이 된다.
// An out-of-list width or untrusted URL is rejected outright, not snapped to the nearest valid value.
import type { AttrValue } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { replaceAt } from '../../doc/index.js';
import { caretAt, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { safeUrl } from '../../html/url.js';
import { blockOwnerAt } from '../../wing/ops.js';
import {
  LUMP_DEFAULT_ALIGN,
  LUMP_DEFAULT_WIDTH,
  boxObject,
  insertLump,
  type Wing,
  type WingChoice,
} from '../../wing/index.js';
import type { MdBuilder } from '../../io/index.js';
import type { LocaleText } from '../../locale/index.js';
import { imageAttach } from './watch.js';

// `![](주소)` — 폭은 md에 자리가 없어 잃는다. 주소가 없으면 그림이 아니라 빈 글자다.
// Renders as `![](url)`, losing width (md has no slot for it); no URL means no image, so it's an empty string.
const imageMd: MdBuilder = (node) => {
  const src = node.a?.['src'];
  if (typeof src !== 'string' || src === '') return '';
  return `![](${src.replace(/[\\()]/g, '\\$&').replace(/ /g, '%20')})`;
};

const IMAGE_NAME: LocaleText = {
  ko: '이미지',
  en: 'Image',
  ja: '画像',
  zh: '图片',
  de: 'Bild',
  fr: 'Image',
  es: 'Imagen',
  pt: 'Imagem',
  ru: 'Изображение',
  ar: 'صورة',
  hi: 'छवि',
  bn: 'ছবি',
  ur: 'تصویر',
  id: 'Gambar',
};
const WIDTH_NAME: LocaleText = {
  ko: '이미지 너비',
  en: 'Image width',
  ja: '画像の幅',
  zh: '图片宽度',
  de: 'Bildbreite',
  fr: "Largeur de l'image",
  es: 'Ancho de imagen',
  pt: 'Largura da imagem',
  ru: 'Ширина изображения',
  ar: 'عرض الصورة',
  hi: 'छवि की चौड़ाई',
  bn: 'ছবির প্রস্থ',
  ur: 'تصویر کی چوڑائی',
  id: 'Lebar gambar',
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
const VIEW_NAME: LocaleText = {
  ko: '크게 보기',
  en: 'View image',
  ja: '拡大表示',
  zh: '查看大图',
  de: 'Groß anzeigen',
  fr: 'Voir en grand',
  es: 'Ver en grande',
  pt: 'Ver maior',
  ru: 'Открыть крупно',
  ar: 'عرض بحجم أكبر',
  hi: 'बड़ा देखें',
  bn: 'বড় করে দেখুন',
  ur: 'بڑا دیکھیں',
  id: 'Lihat besar',
};
const ZOOM_ICON =
  '<g stroke-width="1.5"><circle cx="7" cy="7" r="4.25"/><path d="M10.2 10.2 13.5 13.5M5.2 7h3.6M7 5.2v3.6"/></g>';

const IMAGE_ICON =
  '<g transform="translate(8 8) scale(1.0476) translate(-8 -8)" stroke-width="1.336">' +
  '<rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.8"/><circle cx="5.75" cy="6.25" r="1.1"/>' +
  '<path d="m2.5 11.5 3.25-3 3 2.5 2-1.75 2.75 2.5"/></g>';

// 폭 표식 하나가 그림·유튜브의 생김새를 다 말한다 — 값은 퍼센트 문자열이다.
const WIDTH_CSS = `
.nabi-content img,.nabi-content iframe { max-inline-size: 100%; block-size: auto; }
/* 그림은 누르는 것이다 — 캐럿이 못 서므로 텍스트 커서 대신 손가락 커서를 쓴다. */
/* An image is clicked, not typed into — no caret can land inside it, so it gets a pointer cursor, not a text one. */
.nabi-content.nabi-editing img { cursor: pointer; }
.nabi-content [data-nabi-width="30"] { inline-size: 30%; }
.nabi-content [data-nabi-width="40"] { inline-size: 40%; }
.nabi-content [data-nabi-width="50"] { inline-size: 50%; }
.nabi-content [data-nabi-width="60"] { inline-size: 60%; }
.nabi-content [data-nabi-width="70"] { inline-size: 70%; }
.nabi-content [data-nabi-width="80"] { inline-size: 80%; }
.nabi-content [data-nabi-width="90"] { inline-size: 90%; }
.nabi-content [data-nabi-width="100"] { inline-size: 100%; }

/* 깨진 그림(죽은/만료/사라진 주소)을 우리 그림으로 갈아 끼운다 — src는 안 건드리므로 되살아나면 load가 표식을 뗀다. */
/* A broken image (dead/expired/gone URL) gets swapped for our own placeholder — src is never touched, so a revived URL clears it on load. */
.nabi-content img[data-nabi-broken] {
  inline-size: min(100%, 16rem);
  aspect-ratio: 1;
  content: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%20width%3D%22512%22%20height%3D%22512%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%2379c8f5%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23d6f0ff%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22xg%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23ff7a7a%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23e33d3d%22%2F%3E%3C%2FlinearGradient%3E%3Cfilter%20id%3D%22sh%22%20x%3D%22-30%25%22%20y%3D%22-30%25%22%20width%3D%22160%25%22%20height%3D%22160%25%22%3E%3CfeDropShadow%20dx%3D%220%22%20dy%3D%228%22%20stdDeviation%3D%2210%22%20flood-color%3D%22%2316294a%22%20flood-opacity%3D%220.22%22%2F%3E%3C%2Ffilter%3E%3CclipPath%20id%3D%22pic%22%3E%3Crect%20x%3D%2294%22%20y%3D%22126%22%20width%3D%22324%22%20height%3D%22260%22%20rx%3D%2216%22%2F%3E%3C%2FclipPath%3E%3Cg%20id%3D%22flw%22%3E%3Ccircle%20cx%3D%220%22%20cy%3D%22-11%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%220%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%220%22%20cy%3D%2211%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%22-11%22%20cy%3D%220%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%226%22%20fill%3D%22%23ffd93d%22%2F%3E%3C%2Fg%3E%3C%2Fdefs%3E%3Cg%20filter%3D%22url(%23sh)%22%3E%3Crect%20x%3D%2272%22%20y%3D%22104%22%20width%3D%22368%22%20height%3D%22304%22%20rx%3D%2228%22%20fill%3D%22%23ffffff%22%2F%3E%3Cg%20clip-path%3D%22url(%23pic)%22%3E%3Crect%20x%3D%2294%22%20y%3D%22126%22%20width%3D%22324%22%20height%3D%22260%22%20fill%3D%22url(%23sky)%22%2F%3E%3Ccircle%20cx%3D%22360%22%20cy%3D%22172%22%20r%3D%2226%22%20fill%3D%22%23fff3b0%22%2F%3E%3Cg%20fill%3D%22%23ffffff%22%20opacity%3D%220.85%22%3E%3Cellipse%20cx%3D%22164%22%20cy%3D%22176%22%20rx%3D%2234%22%20ry%3D%2216%22%2F%3E%3Cellipse%20cx%3D%22190%22%20cy%3D%22168%22%20rx%3D%2224%22%20ry%3D%2218%22%2F%3E%3Cellipse%20cx%3D%22264%22%20cy%3D%22200%22%20rx%3D%2226%22%20ry%3D%2212%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M94%20268%20q80%20-30%20160%20-6%20q86%2026%20164%20-8%20v132%20H94%20Z%22%20fill%3D%22%237fce6e%22%2F%3E%3Cpath%20d%3D%22M94%20306%20q90%20-26%20172%202%20q76%2026%20152%20-6%20v84%20H94%20Z%22%20fill%3D%22%235bb455%22%2F%3E%3Cg%20stroke%3D%22%233f9e4a%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M132%20380%20v-46%22%2F%3E%3Cpath%20d%3D%22M186%20384%20v-56%22%2F%3E%3Cpath%20d%3D%22M240%20378%20v-42%22%2F%3E%3Cpath%20d%3D%22M292%20384%20v-52%22%2F%3E%3Cpath%20d%3D%22M344%20380%20v-40%22%2F%3E%3Cpath%20d%3D%22M158%20386%20v-30%22%2F%3E%3Cpath%20d%3D%22M214%20386%20v-28%22%2F%3E%3Cpath%20d%3D%22M268%20386%20v-32%22%2F%3E%3Cpath%20d%3D%22M320%20386%20v-26%22%2F%3E%3C%2Fg%3E%3Cg%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(132%20328)%22%20fill%3D%22%23ff8fb1%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(186%20322)%22%20fill%3D%22%23ffffff%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(240%20330)%22%20fill%3D%22%23c08cff%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(292%20326)%22%20fill%3D%22%23ff8fb1%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(344%20334)%22%20fill%3D%22%23ffffff%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(158%20352)%20scale(0.8)%22%20fill%3D%22%23ffb45c%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(214%20354)%20scale(0.8)%22%20fill%3D%22%23ff8fb1%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(268%20350)%20scale(0.8)%22%20fill%3D%22%23c08cff%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3Cg%20filter%3D%22url(%23sh)%22%3E%3Ccircle%20cx%3D%22392%22%20cy%3D%22384%22%20r%3D%2276%22%20fill%3D%22%23ffffff%22%2F%3E%3Ccircle%20cx%3D%22392%22%20cy%3D%22384%22%20r%3D%2264%22%20fill%3D%22url(%23xg)%22%2F%3E%3Cg%20stroke%3D%22%23ffffff%22%20stroke-width%3D%2216%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M368%20360%20L416%20408%22%2F%3E%3Cpath%20d%3D%22M416%20360%20L368%20408%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E");
  object-fit: contain;
}
`;

// 폭 칸의 이름은 값 그대로다 — `40%`는 그 자체가 이름이라 번역할 것이 없다.
const widthChoices = (widths: readonly string[]): readonly WingChoice[] =>
  widths.map((value) => ({ value, label: { en: `${value}%` } }));

// 30%부터 10 단위 — 그림을 글 옆에 작게 앉히고 싶을 때가 있어 바닥이 낮다.
export const IMAGE_WIDTHS: readonly string[] = ['30', '40', '50', '60', '70', '80', '90', '100'];

// 저장값은 문자열 퍼센트다 — 목록 밖 값은 거절이지 가장 가까운 단계로의 스냅이 아니다.
// Stored as a percent string; an out-of-list value is rejected, never snapped to the nearest valid step.
function widthAttr(value: AttrValue): AttrValue | null {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  return IMAGE_WIDTHS.includes(raw) ? raw : null;
}

export interface ImageWingOptions {
  // 업로드 미리보기용 로컬 주소(`blob:`·`data:image/…`) 허용 여부 — 문서에 박히면 안 되니 기본은 꺼짐.
  // Whether to accept local URLs (`blob:`, `data:image/…`) for upload previews — off by default, since they die outside the page.
  readonly allowLocalUrls?: boolean;
}

export function makeImageWing(options: ImageWingOptions = {}): Wing {
  const allowLocal = options.allowLocalUrls === true;
  const srcAttr = (value: AttrValue): AttrValue | null =>
    typeof value === 'string' ? safeUrl(value, allowLocal) : null;

  // 이미지 하나를 캐럿 자리에 세운다 — 래퍼문단은 insertLump가 입힌다.
  // Places one image at the caret — insertLump wraps it in its owning paragraph.
  const insertImage: Command = (doc, sel, args, env) => {
    const raw = args['src'];
    if (typeof raw !== 'string') return null;
    const src = safeUrl(raw, allowLocal);
    if (src === null) return null; // 화이트리스트 밖 — 거절이지 다듬기가 아니다
    const a: Record<string, AttrValue> = { src };
    const w = args['w'];
    if (w !== undefined) {
      const width = widthAttr(w as AttrValue);
      if (width === null) return null; // 목록 밖 폭을 든 삽입은 아예 안 돈다
      a['w'] = width;
    } else {
      a['w'] = LUMP_DEFAULT_WIDTH; // 말 없이 넣은 그림의 폭 (old 와 같은 값)
    }
    const [start] = ordered(sel);
    // 래퍼문단은 가운데로 선다 — 이미 있던 빈 문단을 쓰는 길에서는 그 문단의 정렬이 이긴다.
    // The wrapper defaults to center align, but reusing an existing empty paragraph keeps its own align instead.
    const r = insertLump(doc, start, { w: 'img', a, ch: [] }, env, { a: LUMP_DEFAULT_ALIGN });
    return { doc: r.doc, selection: caretAt(r.caret) };
  };

  // 캐럿이 든 래퍼문단의 이미지를 대상으로 폭을 갈아 끼운다.
  // Swaps the width on the image owned by the wrapper the caret sits in.
  const setImageWidth: Command = (doc, sel, args) => {
    const width = widthAttr((args['w'] ?? '') as AttrValue);
    if (width === null) return null;
    const [start] = ordered(sel);
    const owner = blockOwnerAt(doc, start.path, 'img');
    const lump = owner?.node;
    if (!owner || !lump) return null;
    if (lump.a?.['w'] === width) return null; // 같은 값 — 무변화 침묵
    const next = replaceAt(doc, owner.path, [
      {
        w: 'img',
        a: { ...(lump.a ?? {}), w: width },
        ch: [],
        ...(lump._id !== undefined ? { _id: lump._id } : {}),
      },
    ]);
    return { doc: next, selection: sel };
  };

  const wing: Wing = {
    ...boxObject({
      w: 'img',
      // 이름이 곧 화이트리스트다 — 여기 없는 attr은 떨어진다.
      // The declared keys are the whitelist itself — anything else gets dropped.
      attrs: { src: srcAttr, w: widthAttr },
      // 주소 없는 그림은 그림이 아니다 — 걸러진 자리에 유령을 안 남긴다.
      // No URL means no image — a rejected address leaves no ghost node behind.
      requires: ['src'],
      button: {
        group: 'media',
        svg: IMAGE_ICON,
        label: IMAGE_NAME,
        action: {
          kind: 'prompt',
          command: 'insertImage',
          // 주소 하나뿐이다 — 대체 글 칸은 없다. 깨진 그림 표식이 그 화면 몫을 이미 채운다.
          // Just one field, the address — no alt-text slot, since the broken-image placeholder already covers that role.
          fields: [
            { name: 'src', kind: 'url', label: ADDRESS_NAME, validate: (value) => safeUrl(value, allowLocal) !== null },
          ],
        },
      },
      styles: WIDTH_CSS,
    }),
    basic: true,
    toMd: imageMd,
    // 상황 줄엔 폭과 크게 보기 둘뿐 — 정렬은 래퍼문단 몫이고, 대체 글은 넣을 때 한 번 묻는 값이라 여기 없다.
    // Context toolbar has only width and view-large — align belongs to the wrapper, and alt text is asked once at insert time, not shown here.
    context: {
      title: IMAGE_NAME,
      controls: [
        {
          // 폭은 순서를 갖는 값이라 칸 여덟 대신 슬라이더 하나 — 옆 글자가 지금 값을 말해 준다.
          // Width is ordered, so one slider beats eight buttons — the adjacent readout shows the current percent.
          kind: 'range',
          name: 'width',
          command: 'setImageWidth',
          argKey: 'w',
          attr: 'w',
          label: WIDTH_NAME,
          values: widthChoices(IMAGE_WIDTHS),
          readout: true,
        },
        // 커맨드를 안 돌린다 — 보는 것으로는 문서가 안 바뀐다. 주소가 비면 안 선다.
        // Runs no command — viewing never mutates the document; hidden when there's no address.
        { kind: 'lightbox', name: 'view', src: 'src', svg: ZOOM_ICON, label: VIEW_NAME },
      ],
    },
    commands: { insertImage, setImageWidth },
    // 깨짐 감시·라이트박스 자리 — 선언만 하고 붙이는 것은 surface의 mount다.
    // Just a declaration; surface's mount does the actual attaching for broken-image watching and the lightbox.
    attach: imageAttach,
  };
  $markBuiltinAttrOwner(wing, ['img']);
  return wing;
}

// 기본 인스턴스 — 로컬 주소는 꺼져 있다. 업로드 미리보기를 쓰는 호스트는 makeImageWing으로 연다.
// The default instance keeps local URLs off; a host using upload previews opens them via makeImageWing.
export const imageWing: Wing = makeImageWing();
