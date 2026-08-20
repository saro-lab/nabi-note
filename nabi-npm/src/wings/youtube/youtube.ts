// 유튜브 youtube — img 와 같은 틀의 블록 단말 물건이다. 저장하는 것은 **영상 id 하나**(`v`)와
// 폭(`w`) 뿐이다: 임베드 주소를 값으로 들면 주소 모양이 바뀔 때마다 문서가 흔들린다.
// id 판정·임베드 주소 짓기·주소에서 id 되읽기는 `html/url.ts` 한 벌이다.
//
// **첫 클릭 = 선택(재생 아님)** — 래퍼문단 클릭이 물건을 통째로 고르는 것은 surface 의 몫이고
// (mount 의 onClick), 화면에서 iframe 이 첫 클릭을 안 삼키게 하는 것은 시트의 몫이다.
// 여기서는 그 규칙을 선언으로만 든다 — wing 은 화면 도구를 모른다.
import type { AttrValue } from '../../schema/index.js';
import { caretAt, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { videoId, youtubeId } from '../../html/url.js';
import { replaceAt } from '../../doc/index.js';
import {
  LUMP_DEFAULT_ALIGN,
  boxObject,
  insertLump,
  topNodeAt,
  type Wing,
  type WingChoice,
} from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// 이름들 — old 사전 이식(14 로케일). 서비스 이름은 어느 말에서도 같다.
const YOUTUBE_NAME: LocaleText = { ko: '유튜브', en: 'YouTube', ja: 'YouTube', zh: 'YouTube', de: 'YouTube', fr: 'YouTube', es: 'YouTube', pt: 'YouTube', ru: 'YouTube', ar: 'YouTube', hi: 'YouTube', bn: 'YouTube', ur: 'YouTube', id: 'YouTube' };
const WIDTH_NAME: LocaleText = { ko: '유튜브 너비', en: 'YouTube width', ja: 'YouTube の幅', zh: 'YouTube 宽度', de: 'YouTube-Breite', fr: 'Largeur YouTube', es: 'Ancho de YouTube', pt: 'Largura do YouTube', ru: 'Ширина YouTube', ar: 'عرض YouTube', hi: 'YouTube की चौड़ाई', bn: 'YouTube-এর প্রস্থ', ur: 'YouTube کی چوڑائی', id: 'Lebar YouTube' };
const ADDRESS_NAME: LocaleText = { ko: '주소', en: 'Address', ja: 'リンク先', zh: '链接地址', de: 'Adresse', fr: 'Adresse', es: 'Dirección', pt: 'Endereço', ru: 'Адрес', ar: 'عنوان الرابط', hi: 'लिंक का पता', bn: 'লিঙ্কের ঠিকানা', ur: 'لنک کا پتہ', id: 'Alamat' };

const YOUTUBE_ICON =
  '<g transform="translate(8 8) scale(1.2857) translate(-8 -7.995)" stroke-width="1.089">' +
  '<rect x="2.75" y="4.3" width="10.5" height="7.39" rx="1.95"/><path d="M7.03 6.64 9.95 8l-2.92 1.36z"/></g>';

// 클릭이 두 걸음이다 — **첫 클릭은 고르기, 두 번째는 재생.**
//
// iframe 은 제 안에서 클릭을 다 삼킨다. 그대로 두면 영상을 고를 길이 아예 없다(눌러도 유튜브의
// 재생 단추만 눌린다). 그래서 편집기 안에서는 `pointer-events: none` 으로 첫 클릭을 우리가
// 받아 물건을 고르고, **고른 뒤에는 되돌려 준다** — 그때부터의 클릭은 영상의 것이라 그 자리에서
// 재생된다. 고르기가 풀리면 다시 우리 것이 된다.
//
// 커서는 손가락이다 — 눌러서 고르는 것이라고 말한다(그림도 같다).
const YOUTUBE_CSS = `
.nabi-content iframe { aspect-ratio: 16 / 9; border: 0; border-radius: var(--nabi-radius, 6px); }
/* 첫 클릭을 받는 **방패** — 래퍼문단의 ::after 로 영상 위를 통째로 덮는다.
   iframe 에 pointer-events: none 만 거는 길도 있는데, 그것만으로는 진짜 마우스 클릭이 여전히
   영상 쪽으로 새는 자리가 있었다(합성 이벤트로는 통과하는데 손으로 누르면 안 됐다). 방패는
   우리 DOM 이라 그런 틈이 없고, 눌린 자리가 곧 래퍼문단이라 코어의 "물건 통째 고르기" 가
   그대로 걸린다. */
.nabi-content.nabi-editing [data-nabi-p]:has(> iframe) { position: relative; }
.nabi-content.nabi-editing [data-nabi-p]:has(> iframe)::after {
  content: ""; position: absolute; inset: 0; cursor: pointer;
}
/* 고른 뒤에는 방패를 걷는다 — 그때부터의 클릭은 영상의 것이라 그 자리에서 재생된다. */
.nabi-content.nabi-editing [data-nabi-p]:has(> iframe[data-nabi-picked])::after { content: none; }
`;

const widthChoices = (widths: readonly string[]): readonly WingChoice[] =>
  widths.map((value) => ({ value, label: { en: `${value}%` } }));

// 폭 단계 — old 번역. 영상은 50% 보다 작아지면 무엇이 나오는지 안 보여 바닥이 그림보다 높다.
export const YOUTUBE_WIDTHS: readonly string[] = ['50', '60', '70', '80', '90', '100'];

// 말 없이 넣었을 때의 폭. 그림(60)보다 넓다 — 영상은 그 안에서 또 한 겹 줄어들기 때문이다
// (16:9 상자 안의 화면, 그 위의 유튜브 크롬). 60 으로 두면 재생 단추와 제목이 답답해진다.
//
// **넣는 순간 트리에 적힌다.** 시트의 기본값으로 두고 트리를 비워 두면 두 가지가 어긋난다:
// 화면은 100% 로 서고(폭 표식이 없으니 `max-inline-size` 만 걸린다) 상황 줄의 눈금은 "값 없음"
// 자리에 앉아 엉뚱한 %를 말한다. 값이 트리에 있으면 둘이 같은 것을 읽는다.
const DEFAULT_WIDTH = '70';

function widthAttr(value: AttrValue): AttrValue | null {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  return YOUTUBE_WIDTHS.includes(raw) ? raw : null;
}

// 영상 id — 모양이 확실할 때만 받는다(11 글자). 목록 밖은 거절이라 attr 가 떨어진다.
function videoAttr(value: AttrValue): AttrValue | null {
  return typeof value === 'string' ? videoId(value) : null;
}

// 사람이 적어 넣은 것에서 영상 id 하나 — 주소가 아니면 id 자체로 한 번 더 본다.
//
// **커맨드와 확인 단추가 나눠 쓰는 한 줄이다** (084 ⑧). 넣기가 거절할 값이면 확인도 안 눌려야
// 하는데, 두 곳에 같은 식을 따로 적으면 한쪽만 고쳐지는 날이 온다.
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
  // 래퍼문단이 **가운데**로 선다 — 물건의 정렬은 물건이 아니라 래퍼문단의 것이다.
  const r = insertLump(doc, start, { w: 'youtube', a, ch: [] }, env, { a: LUMP_DEFAULT_ALIGN });
  return { doc: r.doc, selection: caretAt(r.caret) };
};

// 폭 하나를 갈아 끼운다 — 그림의 것과 같은 모양이다(값 목록만 다르다).
const setYoutubeWidth: Command = (doc, sel, args) => {
  const width = widthAttr((args['w'] ?? '') as AttrValue);
  if (width === null) return null;
  const [start] = ordered(sel);
  const top = topNodeAt(doc, start.path);
  const lump = top?.ch[0];
  if (!top || lump === undefined || typeof lump === 'string' || lump.w !== 'youtube') return null;
  if (lump.a?.['w'] === width) return null; // 같은 값 — 무변화 침묵
  const at = [start.path[0] as number, 0];
  return {
    doc: replaceAt(doc, at, [{ w: 'youtube', a: {...(lump.a ?? {}), w: width }, ch: [] }]),
    selection: sel,
  };
};

export const youtubeWing: Wing = {
...boxObject({
    w: 'youtube',
    attrs: { v: videoAttr, w: widthAttr },
    // 영상 id 없는 영상은 영상이 아니다 — 그림의 src 와 같은 규칙이다.
    requires: ['v'],
    button: {
      group: 'media',
      svg: YOUTUBE_ICON,
      label: YOUTUBE_NAME,
      action: {
        kind: 'prompt',
        command: 'insertYoutube',
        // 확인은 `insertYoutube` 가 id 를 뽑아낼 수 있는 값일 때만 눌린다 — 커맨드의 그 줄
        // (`youtubeId(raw) ?? videoId(raw)`) 그대로다. 주소도 받고 id 한 개도 받는 것까지 같다.
        fields: [{ name: 'v', kind: 'url', label: ADDRESS_NAME, validate: (value) => youtubeVideo(value) !== null }],
      },
    },
    styles: YOUTUBE_CSS,
  }),
  context: {
    title: YOUTUBE_NAME,
    controls: [
      {
        // 눈금 — 그림의 폭과 같은 모양이다(값이 순서를 갖는다).
        kind: 'range',
        name: 'width',
        command: 'setYoutubeWidth',
        argKey: 'w',
        attr: 'w',
        label: WIDTH_NAME,
        values: widthChoices(YOUTUBE_WIDTHS),
        readout: true,
      },
      // 주소 고치기는 **없다** (주인 지시 2026-08-18). 그림이 이미 그렇게 서 있었고
      // 영상만 혼자 갖고 있었다 — 물건의 주소는 고치는 것이 아니라 지우고 다시 놓는 것이다.
    ],
  },
  commands: { insertYoutube, setYoutubeWidth },
};
