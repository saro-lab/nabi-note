// 단순 마크 여섯 — b·i·u·s·sub·sup. 뜻이 그대로 태그인 것들이라 선언 말고는 코드가 없다.
// 커맨드를 따로 안 두는 까닭: 코어의 `toggleMark` 가 이미 이 여섯의 문이고, 접힌 캐럿에서는
// 그 문이 예약(armed)으로 갈린다 (①). 여기서 이름을 새로 내면 그 갈림이 끊긴다.
//
// 12 가 채운 것: 아이콘·이름·`action: 'mark'`(= 코어의 toggleMark 로 간다). 아이콘 속(path)은
// old 번역이고, 16×16 틀은 ui 가 씌운다 — wing 은 화면 도구를 모른다.
import { simpleMark, type Wing } from '../../wing/index.js';

const ICONS = {
  b:
    '<g transform="translate(8 8) scale(1) translate(-7 -8.25)" stroke-width="1.4">' +
    '<path d="M4.75 2.75h3.75a2.6 2.6 0 0 1 0 5.5H4.75z" stroke-width="2"/>' +
    '<path d="M4.75 8.25h4.5a2.6 2.6 0 0 1 0 5.5h-4.5z" stroke-width="2"/></g>',
  i:
    '<g transform="translate(8 8) scale(1.1) translate(-8 -8)" stroke-width="1.273">' +
    '<path d="M10.5 3h-4M9.5 13h-4M9.5 3l-3 10"/></g>',
  u:
    '<g transform="translate(8 8) scale(1.0476) translate(-8 -8)" stroke-width="1.336">' +
    '<path d="M4.5 2.75v5a3.5 3.5 0 0 0 7 0v-5M3.5 13.25h9"/></g>',
  s:
    '<g transform="translate(8 8) scale(1.0476) translate(-8 -8)" stroke-width="1.336">' +
    '<path d="M2.75 8h10.5M12 4.5C11.3 3.3 9.8 2.75 8 2.75 6 2.75 4.5 3.6 4.5 5.2c0 1 .6 1.9 2 2.4' +
    'M4.2 11c.6 1.4 2 2.25 4 2.25 2.2 0 3.6-1 3.6-2.6 0-.9-.4-1.6-1.2-2.1"/></g>',
  sub:
    '<g transform="translate(8 8) scale(1.2857) translate(-8.4 -8.105)" stroke-width="1.089">' +
    '<path d="M3.15 10.43 8 4.03M3.15 4.03 8 10.43M10.65 9.1c0-.88.71-1.41 1.5-1.41.79 0 1.41.53 1.41 1.23 ' +
    '0 1.23-2.91 1.68-2.91 3.26h3"/></g>',
  sup:
    '<g transform="translate(8 8) scale(1.2857) translate(-8.4 -8.175)" stroke-width="1.089">' +
    '<path d="M3.15 12.19 8 5.79M3.15 5.79 8 12.19M10.65 5.57c0-.88.71-1.41 1.5-1.41.79 0 1.41.53 1.41 1.23 ' +
    '0 1.23-2.91 1.68-2.91 3.26h3"/></g>',
} as const;

// 위·아래 첨자만 시트를 든다 — 나머지 넷은 브라우저의 기본 태그 생김새 그대로가 맞다.
const SCRIPT_CSS = `
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
.nabi-content sub { vertical-align: sub; }
`;

export const boldWing: Wing = simpleMark({
  w: 'b',
  button: {
    group: 'emphasis',
    accelerator: 'mod+b',
    shortcut: 'B',
    svg: ICONS.b,
    label: { ko: '굵게', en: 'Bold', ja: '太字', zh: '加粗', de: 'Fett', fr: 'Gras', es: 'Negrita', pt: 'Negrito', ru: 'Полужирный', ar: 'عريض', hi: 'बोल्ड', bn: 'গাঢ়', ur: 'جلی', id: 'Tebal' },
    action: { kind: 'mark' },
  },
});

export const italicWing: Wing = simpleMark({
  w: 'i',
  button: {
    group: 'emphasis',
    accelerator: 'mod+i',
    shortcut: 'I',
    svg: ICONS.i,
    label: { ko: '기울임', en: 'Italic', ja: '斜体', zh: '斜体', de: 'Kursiv', fr: 'Italique', es: 'Cursiva', pt: 'Itálico', ru: 'Курсив', ar: 'مائل', hi: 'इटैलिक', bn: 'তির্যক', ur: 'ترچھا', id: 'Miring' },
    action: { kind: 'mark' },
  },
});

export const underlineWing: Wing = simpleMark({
  w: 'u',
  button: {
    group: 'emphasis',
    accelerator: 'mod+u',
    shortcut: 'U',
    svg: ICONS.u,
    label: { ko: '밑줄', en: 'Underline', ja: '下線', zh: '下划线', de: 'Unterstrichen', fr: 'Souligné', es: 'Subrayado', pt: 'Sublinhado', ru: 'Подчёркнутый', ar: 'تسطير', hi: 'रेखांकित', bn: 'আন্ডারলাইন', ur: 'خط کشیدہ', id: 'Garis bawah' },
    action: { kind: 'mark' },
  },
});

export const strikeWing: Wing = simpleMark({
  w: 's',
  button: {
    group: 'emphasis',
    shortcut: 'S',
    svg: ICONS.s,
    label: { ko: '취소선', en: 'Strikethrough', ja: '取り消し線', zh: '删除线', de: 'Durchgestrichen', fr: 'Barré', es: 'Tachado', pt: 'Tachado', ru: 'Зачёркнутый', ar: 'يتوسطه خط', hi: 'स्ट्राइकथ्रू', bn: 'স্ট্রাইকথ্রু', ur: 'خط زدہ', id: 'Coret' },
    action: { kind: 'mark' },
  },
});

export const subscriptWing: Wing = simpleMark({
  w: 'sub',
  button: { group: 'script', svg: ICONS.sub, label: {
      ko: '아랫첨자', en: 'Subscript', ja: '下付き文字', zh: '下标', de: 'Tiefgestellt', fr: 'Indice',
      es: 'Subíndice', pt: 'Subscrito', ru: 'Подстрочный', ar: 'منخفض', hi: 'सबस्क्रिप्ट',
      bn: 'সাবস্ক্রিপ্ট', ur: 'زیریں', id: 'Subskrip',
    }, action: { kind: 'mark' } },
  styles: SCRIPT_CSS,
});

export const superscriptWing: Wing = simpleMark({
  w: 'sup',
  button: { group: 'script', svg: ICONS.sup, label: {
      ko: '윗첨자', en: 'Superscript', ja: '上付き文字', zh: '上标', de: 'Hochgestellt', fr: 'Exposant',
      es: 'Superíndice', pt: 'Sobrescrito', ru: 'Надстрочный', ar: 'مرتفع', hi: 'सुपरस्क्रिप्ट',
      bn: 'সুপারস্ক্রিপ্ট', ur: 'بالائی', id: 'Superskrip',
    }, action: { kind: 'mark' } },
  // 첨자 둘이 시트 하나를 나눠 쓴다 — 문자열이 같으므로 문서에는 **한 번만** 실린다 (12 의 dedupe).
  styles: SCRIPT_CSS,
});

// 서식 지우기(11)가 겨눌 대상 목록이자 등록 묶음.
// 줄에 서는 차례가 곧 이 순서다 (툴바는 그룹 안에서 등록 순서를 지킨다) — 강조 넷 다음 첨자 둘
// 첨자는 윗첨자가 먼저다 (old 배치).
export const simpleMarkWings: readonly Wing[] = [
  boldWing,
  italicWing,
  underlineWing,
  strikeWing,
  superscriptWing,
  subscriptWing,
];
