// 4종 팩토리 — "선언 → Wing" 순수 함수로 같은 갈래의 구조 복제를 막는다.
// Four factories turn a declaration into a Wing so sibling wings don't duplicate structure.
import { isElement, type AttrValue, type Attrs, type ElementNode } from '../schema/index.js';
import { DEFAULT_BUILDERS, type HtmlBuilder } from '../html/index.js';
import type { InputRule, OnKey, StructureDecl, Wing, WingButton } from './contract.js';

function builderOf(w: string, given?: HtmlBuilder): HtmlBuilder {
  if (given) return given;
  const base = DEFAULT_BUILDERS[w];
  if (base) return base;
  return (_node, children, ctx) => ctx.element('span', children(), { [`data-nabi-${w}`]: '' });
}

export interface SimpleMarkSpec {
  readonly w: string;
  readonly clearable?: boolean;
  readonly toHtml?: HtmlBuilder;
  readonly escapeKeys?: readonly string[];
  readonly button?: WingButton;
  readonly styles?: string;
  readonly inputRules?: readonly InputRule[];
}

export function simpleMark(spec: SimpleMarkSpec): Wing {
  return {
    w: spec.w,
    place: 'mark',
    toHtml: builderOf(spec.w, spec.toHtml),
    attrs: [],
    ...(spec.clearable === true ? { clearable: true } : {}),
    escapeKeys: spec.escapeKeys ?? ['Escape'],
    ...(spec.button ? { button: spec.button } : {}),
    ...(spec.styles ? { styles: spec.styles } : {}),
    ...(spec.inputRules ? { inputRules: spec.inputRules } : {}),
  };
}

export interface ValueMarkSpec {
  readonly w: string;
  // hl·tc 는 키 'c', fs·tf 는 키 'v'.
  // hl/tc use key 'c'; fs/tf use key 'v'.
  readonly key: string;
  // 목록 밖 값은 눌림 표시가 없다 — 값 거절의 마지막 선은 들여오기·ui 가 지킨다.
  // A value outside this list just shows unpressed; import/UI enforce the real rejection.
  readonly values: readonly string[];
  readonly toHtml?: HtmlBuilder;
  readonly escapeKeys?: readonly string[];
  readonly button?: WingButton;
  readonly styles?: string;
  readonly clearable?: boolean;
}

export function valueMark(spec: ValueMarkSpec): Wing {
  const allowed = new Set(spec.values);
  const valueOf = (node: ElementNode): string | undefined => {
    const value = node.a?.[spec.key];
    return typeof value === 'string' && allowed.has(value) ? value : undefined;
  };
  return {
    w: spec.w,
    place: 'mark',
    toHtml: builderOf(spec.w, spec.toHtml),
    attrs: [spec.key],
    ...(spec.clearable === true ? { clearable: true } : {}),
    escapeKeys: spec.escapeKeys ?? ['Escape'],
    currentValue: valueOf,
    // 값이 없거나 목록 밖이면 마크가 아니다 — 껍데기를 벗기고 글자만 남긴다(HTML 입구와 같은 답).
    // No value or an out-of-list value means it isn't a mark: strip the shell, keep the text.
    repair: (node) => {
      const value = valueOf(node);
      if (value === undefined) return null;
      const same = node.a !== undefined && Object.keys(node.a).length === 1 && node.a[spec.key] === value;
      return same
        ? node
        : { w: node.w, a: { [spec.key]: value }, ch: node.ch, ...(node._id !== undefined ? { _id: node._id } : {}) };
    },
    ...(spec.button ? { button: spec.button } : {}),
    ...(spec.styles ? { styles: spec.styles } : {}),
  };
}

export interface BoxObjectSpec {
  readonly w: string;
  // 이름이 곧 화이트리스트다 — null 을 답하면 그 attr 는 거절되어 떨어진다.
  // The name list is the whitelist; returning null rejects and drops that attr.
  readonly attrs?: Readonly<Record<string, (value: AttrValue) => AttrValue | null>>;
  // 하나라도 빠지면 노드째 거절된다 — 그림의 `src`처럼 껍데기도 안 남긴다.
  // Missing any of these rejects the whole node (e.g. an image's `src`), no empty shell left.
  readonly requires?: readonly string[];
  readonly toHtml?: HtmlBuilder;
  readonly button?: WingButton;
  readonly styles?: string;
  readonly claim?: Wing['claim'];
}

export function boxObject(spec: BoxObjectSpec): Wing {
  const validators = spec.attrs ?? {};
  const needed = spec.requires ?? [];
  const repair = (node: ElementNode): ElementNode | null => {
    if (!node.a) return needed.length === 0 ? node : null;
    const out: Record<string, AttrValue> = {};
    let changed = false;
    for (const [key, value] of Object.entries(node.a)) {
      const validate = validators[key];
      if (!validate) {
        changed = true;
        continue;
      }
      const valid = validate(value);
      if (valid === null) {
        changed = true;
        continue;
      }
      if (valid !== value) changed = true;
      out[key] = valid;
    }
    for (const key of needed) {
      if (out[key] === undefined) return null;
    }
    if (!changed) return node;
    const a: Attrs | undefined = Object.keys(out).length > 0 ? out : undefined;
    return {
      w: node.w,
      ch: node.ch,
      ...(a ? { a } : {}),
      ...(node._id !== undefined ? { _id: node._id } : {}),
    };
  };
  return {
    w: spec.w,
    place: 'void',
    toHtml: builderOf(spec.w, spec.toHtml),
    attrs: Object.keys(validators),
    repair,
    ...(spec.button ? { button: spec.button } : {}),
    ...(spec.styles ? { styles: spec.styles } : {}),
    ...(spec.claim ? { claim: spec.claim } : {}),
  };
}

export interface ListFamilySpec {
  readonly w: string;
  readonly item: string;
  readonly itemDecl?: Partial<StructureDecl>;
  readonly toHtml?: HtmlBuilder;
  readonly itemHtml?: HtmlBuilder;
  readonly repairItem?: (node: ElementNode) => ElementNode;
  readonly onKey?: OnKey;
  readonly button?: WingButton;
  readonly styles?: string;
  readonly inputRules?: readonly InputRule[];
}

export function listFamily(spec: ListFamilySpec): Wing {
  // 항목이 아닌 자식은 항목 하나로 감싼다 — 삭제가 아니라 글을 살리는 복구다.
  // A non-item child gets wrapped in one item; this repairs the tree, it doesn't delete text.
  const repair = (node: ElementNode): ElementNode => {
    let changed = false;
    const ch = node.ch.map((child) => {
      if (isElement(child) && child.w === spec.item) return child;
      changed = true;
      return { w: spec.item, ch: [child] } as ElementNode;
    });
    if (!changed) return node;
    return {
      w: node.w,
      ch,
      ...(node.a ? { a: node.a } : {}),
      ...(node._id !== undefined ? { _id: node._id } : {}),
    };
  };

  const itemDecl: StructureDecl = {
    holds: 'blocks',
    attrs: [],
    ...(spec.itemDecl ?? {}),
  };

  return {
    w: spec.w,
    place: 'container',
    holds: 'blocks',
    attrs: [],
    parts: { [spec.item]: itemDecl },
    toHtml: builderOf(spec.w, spec.toHtml),
    partHtml: { [spec.item]: builderOf(spec.item, spec.itemHtml) },
    repair,
    ...(spec.repairItem ? { partRepair: { [spec.item]: spec.repairItem } } : {}),
    ...(spec.onKey ? { onKey: spec.onKey } : {}),
    ...(spec.button ? { button: spec.button } : {}),
    ...(spec.styles ? { styles: spec.styles } : {}),
    ...(spec.inputRules ? { inputRules: spec.inputRules } : {}),
  };
}
