// 팩토리 4종 — "선언 → Wing" 순수 함수. 같은 갈래의 wing 이 구조를 복제하지 않게 하는 자리다.
// 조립 기본값은 html 층의 DEFAULT_BUILDERS 를 잇는다 — 팩토리 사용자는 다르게 그릴 때만 toHtml 을 준다.
import { isElement, type AttrValue, type Attrs, type ElementNode } from '../schema/index.js';
import { DEFAULT_BUILDERS, type HtmlBuilder } from '../html/index.js';
import type { InputRule, OnKey, StructureDecl, Wing, WingButton } from './contract.js';

// 조립 기본값 — 아는 타입이면 html 기본 조립, 모르면 자기 이름의 data 표식을 단 span 이다.
function builderOf(w: string, given?: HtmlBuilder): HtmlBuilder {
  if (given) return given;
  const base = DEFAULT_BUILDERS[w];
  if (base) return base;
  return (_node, children, ctx) => ctx.element('span', children(), { [`data-nabi-${w}`]: '' });
}

// --- 단순 마크 (b·i·u·s·sub·sup) -------------------------------------------------------------

export interface SimpleMarkSpec {
  readonly w: string;
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
    escapeKeys: spec.escapeKeys ?? ['Escape'],
    ...(spec.button ? { button: spec.button } : {}),
    ...(spec.styles ? { styles: spec.styles } : {}),
    ...(spec.inputRules ? { inputRules: spec.inputRules } : {}),
  };
}

// --- 값 마크 (hl·tc 는 키 c, fs·tf 는 키 v) -----------------------------------------

export interface ValueMarkSpec {
  readonly w: string;
  // 값이 실리는 attr 키 — hl·tc 의 'c', fs·tf 의 'v'.
  readonly key: string;
  // 허용 값 목록 — 목록 밖 값은 눌림 표시가 없다(값 거절의 마지막 선은 들여오기·ui 가 지킨다).
  readonly values: readonly string[];
  readonly toHtml?: HtmlBuilder;
  readonly escapeKeys?: readonly string[];
  readonly button?: WingButton;
  readonly styles?: string;
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
    escapeKeys: spec.escapeKeys ?? ['Escape'],
    currentValue: valueOf,
    // 값이 없거나 목록 밖이면 **마크가 아니다** — 껍데기를 벗기고 글자만 남긴다.
    // 값 마크는 값이 곧 뜻이라(노란 형광펜의 '노랑'), 값을 잃은 껍데기는 아무것도 안 말한다.
    // HTML 입구가 하는 것과 같은 답이라, 두 입구가 같은 트리를 낸다 (의 경로 대칭).
    repair: (node) => {
      const value = valueOf(node);
      if (value === undefined) return null;
      // 값 하나만 남긴다 — 곁에 실려 온 다른 attr 은 계약 밖이다.
      const same = node.a !== undefined && Object.keys(node.a).length === 1 && node.a[spec.key] === value;
      return same ? node : { w: node.w, a: { [spec.key]: value }, ch: node.ch, ...(node._id !== undefined ? { _id: node._id } : {}) };
    },
    ...(spec.button ? { button: spec.button } : {}),
    ...(spec.styles ? { styles: spec.styles } : {}),
  };
}

// --- 블록 단말 물건 (img·youtube·hr) ---------------------------------------------------------

export interface BoxObjectSpec {
  readonly w: string;
  // attr 검증기 — 이름이 곧 화이트리스트다. null 을 답하면 그 attr 는 **거절**되어 떨어진다
  // (목록 밖 값을 기본값으로 슬쩍 바꾸지 않는다 — 옛 img 스냅 버그의 교훈).
  readonly attrs?: Readonly<Record<string, (value: AttrValue) => AttrValue | null>>;
  // 이것이 없으면 그 물건이 아니다 — 하나라도 빠지면 노드째 거절된다(껍데기가 안 남는다).
  // 그림의 `src` 가 그 자리다: 못 믿을 주소를 걸러 낸 뒤 빈 `img` 를 남기면, HTML 입구는 아예
  // 안 들이는 것을 JSON 입구만 유령으로 남기게 된다 (의 경로 대칭).
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
        changed = true; // 모르는 attr — 계약 밖이라 떨어진다
        continue;
      }
      const valid = validate(value);
      if (valid === null) {
        changed = true; // 목록 밖 값 — 거절
        continue;
      }
      if (valid !== value) changed = true;
      out[key] = valid;
    }
    for (const key of needed) {
      if (out[key] === undefined) return null; // 있어야 할 것이 없다 — 이 물건은 안 선다
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
    repair,
    ...(spec.button ? { button: spec.button } : {}),
    ...(spec.styles ? { styles: spec.styles } : {}),
    ...(spec.claim ? { claim: spec.claim } : {}),
  };
}

// --- 리스트 가족 (ul/li· ol/oli· tl/tli — 체크는 override 훅) ------------------------------

export interface ListFamilySpec {
  readonly w: string;
  readonly item: string;
  // 항목 선언 덧붙이기 — 체크리스트가 boolAttrs: ['ck'] 를 얹는 자리.
  readonly itemDecl?: Partial<StructureDecl>;
  readonly toHtml?: HtmlBuilder;
  readonly itemHtml?: HtmlBuilder;
  // 항목 자신의 복구 덧붙이기 (체크 값 다듬기 류) — 목록의 "항목만 품기" 복구 위에 선다.
  readonly repairItem?: (node: ElementNode) => ElementNode;
  readonly onKey?: OnKey;
  readonly button?: WingButton;
  readonly styles?: string;
  readonly inputRules?: readonly InputRule[];
}

export function listFamily(spec: ListFamilySpec): Wing {
  // 목록의 자기 복구 — 속은 항목뿐이다. 항목 아닌 블록(문단·래퍼문단·다른 컨테이너)은
  // 항목 하나로 감싼다 (삭제가 아니다 — 글은 남는다).
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
    ...(spec.itemDecl ?? {}),
  };

  return {
    w: spec.w,
    place: 'container',
    holds: 'blocks',
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
