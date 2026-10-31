import { P, isElement, type ElementNode, type NabiNode } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { caretAt, isCollapsed, ordered } from '../../caret/index.js';
import { holders, replaceAt } from '../../doc/index.js';
import type { Command } from '../../editor/index.js';
import type { LocaleText } from '../../locale/index.js';
import type { Wing } from '../../wing/index.js';
import { blockOwnerAt, blocksBoundaryEscape, insertLump } from '../../wing/ops.js';

const NAME: LocaleText = {
  en: 'Float region',
  ko: '플로트 영역',
  ja: 'フロート領域',
  zh: '浮动区域',
  de: 'Float-Bereich',
  fr: 'Zone flottante',
  es: 'Región flotante',
  pt: 'Área flutuante',
  ru: 'Плавающая область',
  ar: 'منطقة عائمة',
  hi: 'फ़्लोट क्षेत्र',
  bn: 'ভাসমান অঞ্চল',
  ur: 'فلوٹ علاقہ',
  id: 'Area mengambang',
  fa: 'ناحیه شناور',
  mr: 'फ्लोट क्षेत्र',
  vi: 'Vùng nổi',
  te: 'ఫ్లోట్ ప్రాంతం',
  ha: 'Yanki mai iyo',
  tr: 'Kayan bölge',
  sw: 'Eneo linaloelea',
  ta: 'மிதக்கும் பகுதி',
  th: 'พื้นที่ลอย',
  it: 'Area flottante',
};
const WIDTH: LocaleText = {
  en: 'Maximum width',
  ko: '최대 너비',
  ja: '最大幅',
  zh: '最大宽度',
  de: 'Maximale Breite',
  fr: 'Largeur maximale',
  es: 'Ancho máximo',
  pt: 'Largura máxima',
  ru: 'Максимальная ширина',
  ar: 'الحد الأقصى للعرض',
  hi: 'अधिकतम चौड़ाई',
  bn: 'সর্বোচ্চ প্রস্থ',
  ur: 'زیادہ سے زیادہ چوڑائی',
  id: 'Lebar maksimum',
  fa: 'حداکثر عرض',
  mr: 'कमाल रुंदी',
  vi: 'Chiều rộng tối đa',
  te: 'గరిష్ఠ వెడల్పు',
  ha: 'Faɗi mafi girma',
  tr: 'En fazla genişlik',
  sw: 'Upana wa juu zaidi',
  ta: 'அதிகபட்ச அகலம்',
  th: 'ความกว้างสูงสุด',
  it: 'Larghezza massima',
};
const LEFT: LocaleText = {
  en: 'Left',
  ko: '왼쪽',
  ja: '左',
  zh: '左侧',
  de: 'Links',
  fr: 'Gauche',
  es: 'Izquierda',
  pt: 'Esquerda',
  ru: 'Слева',
  ar: 'يسار',
  hi: 'बायाँ',
  bn: 'বাম',
  ur: 'بائیں',
  id: 'Kiri',
  fa: 'چپ',
  mr: 'डावीकडे',
  vi: 'Trái',
  te: 'ఎడమ',
  ha: 'Hagu',
  tr: 'Sol',
  sw: 'Kushoto',
  ta: 'இடது',
  th: 'ซ้าย',
  it: 'Sinistra',
};
const RIGHT: LocaleText = {
  en: 'Right',
  ko: '오른쪽',
  ja: '右',
  zh: '右侧',
  de: 'Rechts',
  fr: 'Droite',
  es: 'Derecha',
  pt: 'Direita',
  ru: 'Справа',
  ar: 'يمين',
  hi: 'दायाँ',
  bn: 'ডান',
  ur: 'دائیں',
  id: 'Kanan',
  fa: 'راست',
  mr: 'उजवीकडे',
  vi: 'Phải',
  te: 'కుడి',
  ha: 'Dama',
  tr: 'Sağ',
  sw: 'Kulia',
  ta: 'வலது',
  th: 'ขวา',
  it: 'Destra',
};
const UNWRAP: LocaleText = {
  en: 'Unwrap float region',
  ko: '플로트 영역 해제',
  ja: 'フロート領域を解除',
  zh: '解除浮动区域',
  de: 'Float-Bereich auflösen',
  fr: 'Dissocier la zone flottante',
  es: 'Deshacer región flotante',
  pt: 'Desfazer área flutuante',
  ru: 'Убрать плавающую область',
  ar: 'إلغاء المنطقة العائمة',
  hi: 'फ़्लोट क्षेत्र हटाएँ',
  bn: 'ভাসমান অঞ্চল খুলুন',
  ur: 'فلوٹ علاقہ ختم کریں',
  id: 'Lepaskan area mengambang',
  fa: 'لغو ناحیه شناور',
  mr: 'फ्लोट क्षेत्र काढा',
  vi: 'Bỏ vùng nổi',
  te: 'ఫ్లోట్ ప్రాంతాన్ని విడదీయి',
  ha: 'Warware yankin mai iyo',
  tr: 'Kayan bölgeyi kaldır',
  sw: 'Ondoa eneo linaloelea',
  ta: 'மிதக்கும் பகுதியை நீக்கு',
  th: 'ยกเลิกพื้นที่ลอย',
  it: 'Sciogli area flottante',
};

export const FLOAT_WIDTHS: readonly number[] = [20, 30, 40, 50];
const widthOf = (value: unknown): number | null => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const width = Number(value);
  return FLOAT_WIDTHS.includes(width) ? width : null;
};

function unnest(nodes: readonly NabiNode[]): readonly NabiNode[] {
  return nodes.flatMap((node): readonly NabiNode[] => {
    if (!isElement(node)) return [node];
    if (node.w === 'float') return unnest(node.ch);
    const only = node.ch[0];
    if (node.w === P && node.ch.length === 1 && isElement(only) && only.w === 'float') return unnest(only.ch);
    const ch = unnest(node.ch);
    return ch.every((child, i) => child === node.ch[i]) && ch.length === node.ch.length ? [node] : [{ ...node, ch }];
  });
}

function repairFloat(node: ElementNode): ElementNode {
  const side = node.a?.['side'] === 'left' ? 'left' : 'right';
  const w = widthOf(node.a?.['w']) ?? 40;
  const children = unnest(node.ch);
  const ch = children.length > 0 ? children : [{ w: P, ch: [] }];
  if (
    node.a?.['side'] === side &&
    node.a?.['w'] === w &&
    ch.length === node.ch.length &&
    ch.every((v, i) => v === node.ch[i])
  )
    return node;
  return { ...node, a: { side, w }, ch };
}

const insertFloat: Command = (doc, sel, args, env) => {
  const [start, end] = ordered(sel);
  if (start.path.length !== 1 || end.path.length !== 1) return null;
  const side = args['side'] ?? 'right';
  const w = args['w'] === undefined ? 40 : widthOf(args['w']);
  if ((side !== 'left' && side !== 'right') || w === null) return null;
  const a = start.path[0] ?? 0;
  const b = end.path[0] ?? a;
  const selected = !isCollapsed(sel);
  const covered = doc.slice(a, b + 1);
  if (selected && covered.some((node) => node.ch.some((child) => isElement(child) && child.w === 'float'))) return null;
  const node: ElementNode = { w: 'float', a: { side, w }, ch: selected ? covered : [{ w: P, ch: [] }] };
  if (!selected) {
    const result = insertLump(doc, start, node, env);
    return { doc: result.doc, selection: caretAt({ path: [...result.caret.path, 0, 0], offset: 0 }) };
  }
  const next = [...doc.slice(0, a), { w: P, ch: [node] }, ...doc.slice(b + 1)];
  return { doc: next, selection: caretAt({ path: [a, 0, 0], offset: 0 }) };
};

const unwrapFloat: Command = (doc, sel, _args, env) => {
  const owner = blockOwnerAt(doc, sel.focus.path, 'float');
  if (!owner) return null;
  const wrapper = owner.path.slice(0, -1);
  const next = replaceAt(doc, wrapper, owner.node.ch);
  const target = [...wrapper.slice(0, -1), wrapper[wrapper.length - 1] ?? 0];
  for (const holder of holders(next, env)) {
    if (target.every((index, i) => holder.path[i] === index))
      return { doc: next, selection: caretAt({ path: holder.path, offset: 0 }) };
  }
  return null;
};

const setFloatSide: Command = (doc, sel, args) => {
  const side = args['side'];
  if (side !== 'left' && side !== 'right') return null;
  const owner = blockOwnerAt(doc, sel.focus.path, 'float');
  if (!owner || owner.node.a?.['side'] === side) return null;
  return { doc: replaceAt(doc, owner.path, [{ ...owner.node, a: { ...owner.node.a, side } }]), selection: sel };
};

const setFloatWidth: Command = (doc, sel, args) => {
  const w = widthOf(args['w']);
  if (w === null) return null;
  const owner = blockOwnerAt(doc, sel.focus.path, 'float');
  if (!owner || owner.node.a?.['w'] === w) return null;
  return { doc: replaceAt(doc, owner.path, [{ ...owner.node, a: { ...owner.node.a, w } }]), selection: sel };
};

const FLOAT_CSS = `
.nabi-ctx-group[data-wing="float"] .nabi-ctx-readout { min-inline-size: 3ch; }
.nabi-content:has(> [data-nabi-p] > [data-nabi-float]) {
  display: flow-root; container-type: inline-size; container-name: nabi-floats;
}
:is(.nabi-content, .nabi-diff-block) > [data-nabi-p]:has(> [data-nabi-float]) {
  --nabi-float-max: 40%; float: right; clear: both; box-sizing: border-box;
  inline-size: auto; max-inline-size: var(--nabi-float-max); min-inline-size: min(8rem, var(--nabi-float-max));
  margin: 0 0 .75em 1em; padding: 0;
}
:is(.nabi-content, .nabi-diff-block) > [data-nabi-p]:has(> [data-nabi-float="left"]) {
  float: left; margin: 0 1em .75em 0;
}
:is(.nabi-content, .nabi-diff-block) > [data-nabi-p]:has(> [data-nabi-float-width="20"]) { --nabi-float-max: 20%; }
:is(.nabi-content, .nabi-diff-block) > [data-nabi-p]:has(> [data-nabi-float-width="30"]) { --nabi-float-max: 30%; }
:is(.nabi-content, .nabi-diff-block) > [data-nabi-p]:has(> [data-nabi-float-width="50"]) { --nabi-float-max: 50%; }
.nabi-content [data-nabi-float] { padding: .35em .5em; box-sizing: border-box; overflow-wrap: anywhere; }
.nabi-content [data-nabi-float] > * { margin: 0; padding-block-end: .6em; }
.nabi-content [data-nabi-float] > :last-child { padding-block-end: 0; }
.nabi-content [data-nabi-float] table { display: block; max-inline-size: 100%; overflow-x: auto; }
.nabi-content.nabi-editing [data-nabi-float] { outline: 1px dashed var(--nabi-muted); outline-offset: -1px; }
.nabi-content.nabi-editing [data-nabi-float] > p:only-child { min-block-size: 1lh; }
.nabi-content:has(> [data-nabi-p] > [data-nabi-float]) > [data-nabi-p]:has(> :is(table, pre, hr), > .nabi-scroll > table) {
  display: flow-root; overflow-x: auto;
}
.nabi-diff-block:has(> [data-nabi-p] > [data-nabi-float]) { display: flow-root; }
@container nabi-floats (width < 36rem) {
  .nabi-content > [data-nabi-p]:has(> [data-nabi-float]) {
    float: none; inline-size: 100%; max-inline-size: 100%; min-inline-size: 0; margin: 0 0 .75em;
  }
}
@media print {
  .nabi-content > [data-nabi-p]:has(> [data-nabi-float]) {
    float: none; inline-size: 100%; max-inline-size: 100%; min-inline-size: 0; margin: 0 0 .75em;
  }
  .nabi-content.nabi-editing [data-nabi-float] { outline: none; }
}
`;

export const floatWing: Wing = {
  w: 'float',
  place: 'container',
  holds: 'blocks',
  basic: true,
  noAlign: true,
  attrs: ['side', 'w'],
  repair: repairFloat,
  onKey: (intent, doc, sel, env, owner) => blocksBoundaryEscape(intent, doc, sel, env, owner),
  toHtml: (node, children, ctx) =>
    ctx.element('div', children(), {
      'data-nabi-float': node.a?.['side'] === 'left' ? 'left' : 'right',
      'data-nabi-float-width': String(widthOf(node.a?.['w']) ?? 40),
    }),
  claim: (el, inner) =>
    el.tag === 'div' && el.attrs['data-nabi-float'] !== undefined
      ? [
          {
            w: 'float',
            a: { side: el.attrs['data-nabi-float'] ?? 'right', w: el.attrs['data-nabi-float-width'] ?? 40 },
            ch: inner(true),
          },
        ]
      : null,
  commands: { insertFloat, unwrapFloat, setFloatSide, setFloatWidth },
  scopedCommands: [
    'insertImage',
    'commitUpload',
    'insertYoutube',
    'insertTable',
    'insertDivider',
    'toggleQuote',
    'toggleDetails',
    'toggleCode',
    'toggleBulletList',
    'toggleOrderedList',
    'toggleTaskList',
  ],
  currentValue: (node) => String(node.a?.['side'] ?? 'right'),
  button: { group: 'container', icon: 'float-float', label: NAME, action: { kind: 'command', command: 'insertFloat' } },
  context: {
    title: NAME,
    controls: [
      { kind: 'toggle', name: 'left', label: LEFT, token: 'left', command: 'setFloatSide', args: { side: 'left' } },
      { kind: 'toggle', name: 'right', label: RIGHT, token: 'right', command: 'setFloatSide', args: { side: 'right' } },
      {
        kind: 'range',
        name: 'width',
        label: WIDTH,
        command: 'setFloatWidth',
        argKey: 'w',
        attr: 'w',
        rest: '40',
        readout: true,
        values: FLOAT_WIDTHS.map((value) => ({ value, label: { en: `${value}%` } })),
      },
      { kind: 'button', name: 'unwrap', icon: 'float-unwrap', label: UNWRAP, command: 'unwrapFloat' },
    ],
  },
  styles: FLOAT_CSS,
};

$markBuiltinAttrOwner(floatWing, ['float']);
