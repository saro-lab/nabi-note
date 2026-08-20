// 이미지 img — 블록 단말 물건이다. 래퍼문단이 감싸고, **정렬 attr 은 없다**:
// 정렬은 래퍼문단의 `a` 가 든다 (물건의 정렬 attr 폐지). 물건 자신의 것은 폭(`w`)뿐이다.
//
// 값 거절이 이 wing 의 성격이다 — 목록 밖 폭·못 믿을 주소는 **거절되어 없는 값이 된다**.
// 옛 판은 낯선 폭을 가장 가까운 단계로 스냅했고(clampWidth), 그래서 쓰레기 값이 그럴듯한 값으로
// 살아남았다 (옛 확실 버그 4 — image 값 스냅). 여기서는 boxObject 의 검증기가 null 을 답하고
// repair 가 그 attr 를 떨어뜨린다.
import type { AttrValue } from '../../schema/index.js';
import { replaceAt } from '../../doc/index.js';
import { caretAt, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { safeUrl } from '../../html/url.js';
import {
  LUMP_DEFAULT_ALIGN,
  LUMP_DEFAULT_WIDTH,
  boxObject,
  insertLump,
  topNodeAt,
  type Wing,
  type WingChoice,
} from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';
import { imageAttach } from './watch.js';

// 이름들 — old 사전 이식(14 로케일).
const IMAGE_NAME: LocaleText = { ko: '이미지', en: 'Image', ja: '画像', zh: '图片', de: 'Bild', fr: 'Image', es: 'Imagen', pt: 'Imagem', ru: 'Изображение', ar: 'صورة', hi: 'छवि', bn: 'ছবি', ur: 'تصویر', id: 'Gambar' };
const WIDTH_NAME: LocaleText = { ko: '이미지 너비', en: 'Image width', ja: '画像の幅', zh: '图片宽度', de: 'Bildbreite', fr: "Largeur de l'image", es: 'Ancho de imagen', pt: 'Largura da imagem', ru: 'Ширина изображения', ar: 'عرض الصورة', hi: 'छवि की चौड़ाई', bn: 'ছবির প্রস্থ', ur: 'تصویر کی چوڑائی', id: 'Lebar gambar' };
const ADDRESS_NAME: LocaleText = { ko: '주소', en: 'Address', ja: 'リンク先', zh: '链接地址', de: 'Adresse', fr: 'Adresse', es: 'Dirección', pt: 'Endereço', ru: 'Адрес', ar: 'عنوان الرابط', hi: 'लिंक का पता', bn: 'লিঙ্কের ঠিকানা', ur: 'لنک کا پتہ', id: 'Alamat' };
const VIEW_NAME: LocaleText = { ko: '크게 보기', en: 'View image', ja: '拡大表示', zh: '查看大图', de: 'Groß anzeigen', fr: 'Voir en grand', es: 'Ver en grande', pt: 'Ver maior', ru: 'Открыть крупно', ar: 'عرض بحجم أكبر', hi: 'बड़ा देखें', bn: 'বড় করে দেখুন', ur: 'بڑا دیکھیں', id: 'Lihat besar' };
// 돋보기 — 크게 보기 단추의 속.
const ZOOM_ICON = '<g stroke-width="1.5"><circle cx="7" cy="7" r="4.25"/><path d="M10.2 10.2 13.5 13.5M5.2 7h3.6M7 5.2v3.6"/></g>';

const IMAGE_ICON =
  '<g transform="translate(8 8) scale(1.0476) translate(-8 -8)" stroke-width="1.336">' +
  '<rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.8"/><circle cx="5.75" cy="6.25" r="1.1"/>' +
  '<path d="m2.5 11.5 3.25-3 3 2.5 2-1.75 2.75 2.5"/></g>';

// 폭 표식 하나가 그림·유튜브의 생김새를 다 말한다 — 값은 퍼센트 문자열이다.
const WIDTH_CSS = `
.nabi-content img,.nabi-content iframe { max-inline-size: 100%; block-size: auto; }
/* 그림은 **누르는 것**이다 — 눌러서 통째로 고르고(surface 의 onClick), 보는 쪽에서는 호스트가
   크게 보기를 건다. 글줄 위의 텍스트 커서가 뜨면 "여기에 캐럿을 놓을 수 있다" 는 거짓말이 된다 —
   그림 안에는 캐럿이 못 선다. */
.nabi-content.nabi-editing img { cursor: pointer; }
.nabi-content [data-nabi-width="30"] { inline-size: 30%; }
.nabi-content [data-nabi-width="40"] { inline-size: 40%; }
.nabi-content [data-nabi-width="50"] { inline-size: 50%; }
.nabi-content [data-nabi-width="60"] { inline-size: 60%; }
.nabi-content [data-nabi-width="70"] { inline-size: 70%; }
.nabi-content [data-nabi-width="80"] { inline-size: 80%; }
.nabi-content [data-nabi-width="90"] { inline-size: 90%; }
.nabi-content [data-nabi-width="100"] { inline-size: 100%; }

/* 깨진 그림 — 죽은 주소·만료된 서명 주소·사라진 blob: 이 그리는 것을 우리 그림으로 갈아 끼운다.
   고유 크기가 0 이라 표식이 없으면 납작한 한 줄로 주저앉고, 그 자리에 브라우저의 깨진 아이콘과
   alt 글자가 그려진다 — 문서 한가운데에 브라우저의 살림이 비치는 자리다. content 가 그려지는
   것을 통째로 대신하므로 그 둘이 아예 안 그려진다. src 는 절대 안 건드리므로 주소가 되살아나면 load 가 표식을
   떼고 그림이 저절로 돌아온다. 그림 자체는 old 의 것 그대로다. */
.nabi-content img[data-nabi-broken] {
  inline-size: min(100%, 16rem);
  aspect-ratio: 1;
  content: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%20width%3D%22512%22%20height%3D%22512%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%2379c8f5%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23d6f0ff%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22xg%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23ff7a7a%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23e33d3d%22%2F%3E%3C%2FlinearGradient%3E%3Cfilter%20id%3D%22sh%22%20x%3D%22-30%25%22%20y%3D%22-30%25%22%20width%3D%22160%25%22%20height%3D%22160%25%22%3E%3CfeDropShadow%20dx%3D%220%22%20dy%3D%228%22%20stdDeviation%3D%2210%22%20flood-color%3D%22%2316294a%22%20flood-opacity%3D%220.22%22%2F%3E%3C%2Ffilter%3E%3CclipPath%20id%3D%22pic%22%3E%3Crect%20x%3D%2294%22%20y%3D%22126%22%20width%3D%22324%22%20height%3D%22260%22%20rx%3D%2216%22%2F%3E%3C%2FclipPath%3E%3Cg%20id%3D%22flw%22%3E%3Ccircle%20cx%3D%220%22%20cy%3D%22-11%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%220%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%220%22%20cy%3D%2211%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%22-11%22%20cy%3D%220%22%20r%3D%228%22%2F%3E%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%226%22%20fill%3D%22%23ffd93d%22%2F%3E%3C%2Fg%3E%3C%2Fdefs%3E%3Cg%20filter%3D%22url(%23sh)%22%3E%3Crect%20x%3D%2272%22%20y%3D%22104%22%20width%3D%22368%22%20height%3D%22304%22%20rx%3D%2228%22%20fill%3D%22%23ffffff%22%2F%3E%3Cg%20clip-path%3D%22url(%23pic)%22%3E%3Crect%20x%3D%2294%22%20y%3D%22126%22%20width%3D%22324%22%20height%3D%22260%22%20fill%3D%22url(%23sky)%22%2F%3E%3Ccircle%20cx%3D%22360%22%20cy%3D%22172%22%20r%3D%2226%22%20fill%3D%22%23fff3b0%22%2F%3E%3Cg%20fill%3D%22%23ffffff%22%20opacity%3D%220.85%22%3E%3Cellipse%20cx%3D%22164%22%20cy%3D%22176%22%20rx%3D%2234%22%20ry%3D%2216%22%2F%3E%3Cellipse%20cx%3D%22190%22%20cy%3D%22168%22%20rx%3D%2224%22%20ry%3D%2218%22%2F%3E%3Cellipse%20cx%3D%22264%22%20cy%3D%22200%22%20rx%3D%2226%22%20ry%3D%2212%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M94%20268%20q80%20-30%20160%20-6%20q86%2026%20164%20-8%20v132%20H94%20Z%22%20fill%3D%22%237fce6e%22%2F%3E%3Cpath%20d%3D%22M94%20306%20q90%20-26%20172%202%20q76%2026%20152%20-6%20v84%20H94%20Z%22%20fill%3D%22%235bb455%22%2F%3E%3Cg%20stroke%3D%22%233f9e4a%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M132%20380%20v-46%22%2F%3E%3Cpath%20d%3D%22M186%20384%20v-56%22%2F%3E%3Cpath%20d%3D%22M240%20378%20v-42%22%2F%3E%3Cpath%20d%3D%22M292%20384%20v-52%22%2F%3E%3Cpath%20d%3D%22M344%20380%20v-40%22%2F%3E%3Cpath%20d%3D%22M158%20386%20v-30%22%2F%3E%3Cpath%20d%3D%22M214%20386%20v-28%22%2F%3E%3Cpath%20d%3D%22M268%20386%20v-32%22%2F%3E%3Cpath%20d%3D%22M320%20386%20v-26%22%2F%3E%3C%2Fg%3E%3Cg%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(132%20328)%22%20fill%3D%22%23ff8fb1%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(186%20322)%22%20fill%3D%22%23ffffff%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(240%20330)%22%20fill%3D%22%23c08cff%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(292%20326)%22%20fill%3D%22%23ff8fb1%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(344%20334)%22%20fill%3D%22%23ffffff%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(158%20352)%20scale(0.8)%22%20fill%3D%22%23ffb45c%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(214%20354)%20scale(0.8)%22%20fill%3D%22%23ff8fb1%22%2F%3E%3Cuse%20href%3D%22%23flw%22%20transform%3D%22translate(268%20350)%20scale(0.8)%22%20fill%3D%22%23c08cff%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3Cg%20filter%3D%22url(%23sh)%22%3E%3Ccircle%20cx%3D%22392%22%20cy%3D%22384%22%20r%3D%2276%22%20fill%3D%22%23ffffff%22%2F%3E%3Ccircle%20cx%3D%22392%22%20cy%3D%22384%22%20r%3D%2264%22%20fill%3D%22url(%23xg)%22%2F%3E%3Cg%20stroke%3D%22%23ffffff%22%20stroke-width%3D%2216%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M368%20360%20L416%20408%22%2F%3E%3Cpath%20d%3D%22M416%20360%20L368%20408%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E");
  object-fit: contain;
}
`;

// 폭 칸의 이름은 값 그대로다 — `40%` 는 그 자체가 이름이라 번역할 것이 없다.
const widthChoices = (widths: readonly string[]): readonly WingChoice[] =>
  widths.map((value) => ({ value, label: { en: `${value}%` } }));

// 폭 단계 — old 번역(30% 부터 10 단위). 그림은 글 옆에 작게 앉히고 싶을 때가 있어 바닥이 낮다.
export const IMAGE_WIDTHS: readonly string[] = ['30', '40', '50', '60', '70', '80', '90', '100'];

// 저장값은 문자열 퍼센트다 (의 `"w": "40"`). 숫자로 들어와도 같은 값이므로 표기만 맞춘다
// 목록 밖은 **거절**이지 가장 가까운 단계로의 스냅이 아니다.
function widthAttr(value: AttrValue): AttrValue | null {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  return IMAGE_WIDTHS.includes(raw) ? raw : null;
}

export interface ImageWingOptions {
  // 로컬 주소(`blob:`·`data:image/…`)를 살릴지. 업로드 미리보기가 쓰는 길이라 옵션으로 열되
  // **기본은 꺼짐**이다 — 페이지를 벗어나면 죽는 주소가 문서에 박히면 안 된다.
  readonly allowLocalUrls?: boolean;
}

export function makeImageWing(options: ImageWingOptions = {}): Wing {
  const allowLocal = options.allowLocalUrls === true;
  const srcAttr = (value: AttrValue): AttrValue | null =>
    typeof value === 'string' ? safeUrl(value, allowLocal) : null;

  // 이미지 하나를 캐럿 자리에 세운다 — 래퍼문단은 insertLump 가 입힌다 (wing/ops 의 한 벌).
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
    // 래퍼문단이 **가운데**로 선다 — 물건의 정렬은 물건이 아니라 래퍼문단의 것이다.
    // 이미 서 있던 빈 문단을 쓰는 길에서는 그 문단이 들고 있던 정렬이 이긴다 (wing/ops).
    const r = insertLump(doc, start, { w: 'img', a, ch: [] }, env, { a: LUMP_DEFAULT_ALIGN });
    return { doc: r.doc, selection: caretAt(r.caret) };
  };

  // 폭 하나를 갈아 끼운다 — 캐럿이 든 래퍼문단의 이미지가 대상이다(캐럿은 물건 속에 못 선다).
  const setImageWidth: Command = (doc, sel, args) => {
    const width = widthAttr((args['w'] ?? '') as AttrValue);
    if (width === null) return null;
    const [start] = ordered(sel);
    const top = topNodeAt(doc, start.path);
    const lump = top?.ch[0];
    if (!top || lump === undefined || typeof lump === 'string' || lump.w !== 'img') return null;
    if (lump.a?.['w'] === width) return null; // 같은 값 — 무변화 침묵
    const at = [start.path[0] as number, 0];
    const next = replaceAt(doc, at, [{ w: 'img', a: {...(lump.a ?? {}), w: width }, ch: [] }]);
    return { doc: next, selection: sel };
  };

  return {
...boxObject({
      w: 'img',
      // 이름이 곧 화이트리스트다 — 여기 없는 attr(옛 판의 정렬 `a` 가 그것이다)는 떨어진다.
      attrs: { src: srcAttr, w: widthAttr },
      // 주소 없는 그림은 그림이 아니다 — 못 믿을 주소를 걸러 낸 자리에 유령을 안 남긴다.
      requires: ['src'],
      button: {
        group: 'media',
        svg: IMAGE_ICON,
        label: IMAGE_NAME,
        action: {
          kind: 'prompt',
          command: 'insertImage',
          // **주소 하나뿐이다.** 대체 글 칸은 걷었다 — 깨진 그림 자리에 우리 그림이 서므로
          // "안 보일 때 대신 읽을 글" 의 화면 몫이 이미 채워져 있고, 넣을 때마다 비워 둘 칸이
          // 하나 더 있으면 그 칸은 늘 비어 있게 된다.
          // 확인은 `insertImage` 가 받을 주소일 때만 눌린다 — 같은 `safeUrl(값, allowLocal)` 이다.
          // **`allowLocal` 까지 같아야 한다**: 로컬 주소를 여는 인스턴스에서는 `blob:` 도 눌려야
          // 하고, 안 여는 인스턴스에서는 눌러 봐야 커맨드가 거절한다. 그래서 이 검사는 모듈이
          // 아니라 이 팩토리 안에 산다(인스턴스마다 답이 다른 검사다).
          fields: [
            { name: 'src', kind: 'url', label: ADDRESS_NAME, validate: (value) => safeUrl(value, allowLocal) !== null },
          ],
        },
      },
      styles: WIDTH_CSS,
    }),
    // 상황 줄 — **폭과 크게 보기 둘뿐**이다. 정렬은 래퍼문단의 것이라 여기 없고
    // 대체 글도 여기 없다 — old 의 상황 줄에도 없었다. 대체 글은 그림을 **넣을 때** 한 번 묻는
    // 것이지(단추의 prompt 가 그 자리다) 그림을 고른 채 늘 곁에 두고 고치는 것이 아니다.
    // 늘 띄워 두면 자주 쓰는 폭이 글칸 하나만큼 밀리고, 상황 줄은 그 물건의 **지금 모양**을
    // 말하는 자리인데 대체 글은 모양이 아니다.
    context: {
      title: IMAGE_NAME,
      controls: [
        {
          // 눈금이다 — 폭은 순서를 갖는 값이라 칸 여덟보다 슬라이더 하나가 맞다. 옆의 글자가
          // 지금 몇 %인지 말한다.
          kind: 'range',
          name: 'width',
          command: 'setImageWidth',
          argKey: 'w',
          attr: 'w',
          label: WIDTH_NAME,
          values: widthChoices(IMAGE_WIDTHS),
          readout: true,
        },
        // 크게 보기 — 커맨드를 안 돌린다(본다고 문서가 바뀌지 않는다). 주소가 비면 안 선다.
        { kind: 'lightbox', name: 'view', src: 'src', svg: ZOOM_ICON, label: VIEW_NAME },
      ],
    },
    commands: { insertImage, setImageWidth },
    // 깨짐 감시·라이트박스 자리 — 선언만 하고 붙이는 것은 surface 의 mount 다.
    attach: imageAttach,
  };
}

// 기본 인스턴스 — 로컬 주소는 꺼져 있다. 업로드 미리보기를 쓰는 호스트가 makeImageWing 으로 연다.
export const imageWing: Wing = makeImageWing();
