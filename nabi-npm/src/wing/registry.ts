// registry — wing 목록을 받아 계약을 검사(fail-fast)하고, 아래층들이 먹는 산출물로 접는다:
// SchemaEnv/EditEnv(갈래 지식)· HtmlBuilders(조립 맵)· 커맨드 맵· claim(들여오기 역방향)
// repair 맵· escapeKeys 색인· inputRules 목록. 하나라도 어기면 등록 자체가 죽는다.
import { $fromJson, $guarded, BR, P, RESERVED, isElement, type ElementNode, type NabiNode } from '../schema/index.js';
import type { EditEnv } from '../doc/index.js';
import { parseNodes, renderEditorHtml, renderHtml } from '../html/index.js';
import type { HtmlBuilder, HtmlBuilders, HtmlOptions, ImportOptions } from '../html/index.js';
import { $assertIoFilter, type IoFilter, type MdBuilder, type MdBuilders } from '../io/index.js';
import {
  coreCommands,
  createNabi,
  type Command,
  type Nabi,
  type NabiCoreOptions,
  type NabiOptions,
} from '../editor/index.js';
import { $builtinAttrTypes, $closeBuiltinAttrs, $closeKnownTypes, $isBuiltinWing } from '../schema/env.js';
import { erectsNode, type Attach, type InputRule, type StructureDecl, type Wing } from './contract.js';

// 커맨드 이름 규칙 — 동사+목적어 카멜. 낱말 하나(`merge`)나 대문자 시작은 죽는다.
const COMMAND_NAME = /^[a-z][a-z0-9]*([A-Z][A-Za-z0-9]*)+$/;
// 힌트 단축키 — 라틴 대문자·숫자 한 글자. 가속키 — mod+소문자 하나.
const SHORTCUT = /^(?:[A-Z0-9]|↑|↓)$/;
const ACCELERATOR = /^mod\+[a-z]$/;
const EXTENSION_NAME = /^ex[A-Z0-9][A-Za-z0-9]*$/;
const OFFICIAL_WINGS = new Set([
  'b',
  'i',
  'u',
  's',
  'sup',
  'sub',
  'tf',
  'fs',
  'tc',
  'hl',
  'a',
  'h',
  'align',
  'dc',
  'ul',
  'ol',
  'tl',
  'quote',
  'details',
  'code',
  'hr',
  'table',
  'img',
  'youtube',
  'upload',
  'save',
  'open',
  'localHistory',
  'diff',
  'clearFormat',
]);
const CORE_COMMAND_NAMES = new Set(Object.keys(coreCommands()));
const RESERVED_FILTER_IDS = new Set(['nabi', 'html', 'markdown', 'text']);

export interface RegisteredRule extends InputRule {
  readonly w: string;
}

export interface Registry {
  readonly wings: readonly Wing[];
  // 갈래 지식 — createNabi·cocoon·doc 연산이 먹는 환경. repair(allows 필터 포함)가 접혀 있다.
  readonly env: EditEnv;
  readonly builders: HtmlBuilders;
  readonly commands: Readonly<Record<string, Command>>;
  readonly claim: ImportOptions['claim'] | undefined;
  readonly inputRules: readonly RegisteredRule[];
  // 선언형 표면 부속 — mount(surface)가 붙이고 뗀다 (, 10 표의 칸 드래그 칠 류).
  readonly attaches: readonly Attach[];
  // escape 키 → 그 키를 선언한 마크 wing 의 `w` 목록 (surface 09 가 예약 음수 방향에 쓴다).
  readonly escapes: ReadonlyMap<string, readonly string[]>;
  // 연타 키 → 돌릴 커맨드 이름 (`Wing.doubleKeys`). 표면은 이 표만 보고 wing 이름을 모른다.
  readonly doubles: ReadonlyMap<string, string>;
  // IO 필터 목록 — **호스트가 끼운 것이 앞, wing 이 든 것이 뒤**다. 내장 셋(html·md·nabi)은
  // 이 뒤에 붙는다(붙이는 자리는 표면이다). id 는 등록 검사에서 유일함이 보장된다.
  readonly ioFilters: readonly IoFilter[];
  // md 조립 맵 — 조립 맵(builders)과 같은 무늬다. 없는 타입은 md 저장에서 html 로 떨어진다.
  readonly mdBuilders: MdBuilders;
  // 이 타입(부품 포함)을 소유한 wing — 키 소유 판정·ui 가 쓴다.
  ownerOf(typeW: string): Wing | null;
  wingOf(w: string): Wing | null;
}

function fail(message: string): never {
  throw new Error(`wing 등록 실패 — ${message}`);
}

// allows 제한을 repair 로 접는다 — 벗어난 엘리먼트 자식은 껍데기를 벗고 속이 올라온다(삭제가
// 아니다 — 글은 남아야 한다). 올라온 것이 또 벗어나면 다시 벗긴다. 떠도는 인라인은 문단으로 모은다.
function allowsRepair(allowed: ReadonlySet<string>): (node: ElementNode) => ElementNode {
  const admit = (nodes: readonly NabiNode[]): NabiNode[] => {
    const out: NabiNode[] = [];
    let loose: NabiNode[] = [];
    const flush = (): void => {
      if (loose.length === 0) return;
      out.push({ w: P, ch: loose });
      loose = [];
    };
    for (const node of nodes) {
      if (!isElement(node)) {
        loose.push(node);
        continue;
      }
      if (allowed.has(node.w)) {
        flush();
        out.push(node);
        continue;
      }
      // 벗어난 자식 — 껍데기를 벗고 속을 같은 자리에서 다시 심사한다.
      for (const inner of admit(node.ch)) {
        if (isElement(inner) && allowed.has(inner.w)) {
          flush();
          out.push(inner);
        } else loose.push(inner);
      }
    }
    flush();
    return out;
  };
  return (node) => {
    const ch = admit(node.ch);
    if (ch.length === node.ch.length && ch.every((child, i) => child === node.ch[i])) return node;
    const next: { w: string; a?: ElementNode['a']; ch: readonly NabiNode[]; _id?: string } = { w: node.w, ch };
    if (node.a) next.a = node.a;
    if (node._id !== undefined) next._id = node._id;
    return next;
  };
}

export interface RegistryExtra {
  // 호스트가 끼우는 IO 필터 — wing 이 든 것보다 **앞**에 선다(제 형식이 내장보다 먼저 답한다).
  readonly ioFilters?: readonly IoFilter[];
}

export function makeRegistry(wings: readonly Wing[], extra?: RegistryExtra): Registry {
  const byType = new Map<string, Wing>(); // 노드 타입(w·부품) → 소유 wing
  const byW = new Map<string, Wing>(); // wing 의 w → wing (tool·attr 포함)
  const shortcuts = new Map<string, string>();
  const accelerators = new Map<string, string>();
  // IO 필터 id → 주장한 이가 누구인가. 호스트의 것도 함께 담는다 — 같은 id 가 둘이면 어느 쪽이
  // 답하는지가 등록 순서에 숨는다.
  const filterIds = new Map<string, string>();

  for (const filter of extra?.ioFilters ?? []) {
    $assertIoFilter(filter);
    if (RESERVED_FILTER_IDS.has(filter.id)) fail(`IO 필터 id "${filter.id}" 는 내장 형식이 예약했다`);
    if (filterIds.has(filter.id)) fail(`IO 필터 id "${filter.id}" 를 호스트가 두 번 든다`);
    filterIds.set(filter.id, '호스트');
  }

  // --- 1차 — 이름·모양 검사와 색인 ----------------------------------------------------------
  for (const wing of wings) {
    if (!wing.w) fail('wing 에 w(이름)가 없다');
    const custom = !OFFICIAL_WINGS.has(wing.w);
    const builtinTypes = new Set($builtinAttrTypes(wing) ?? []);
    if (RESERVED.has(wing.w)) fail(`"${wing.w}" 는 코어 예약어라 wing 이 쓸 수 없다`);
    if (custom && !EXTENSION_NAME.test(wing.w)) fail(`custom wing 이름 "${wing.w}" 는 ex 뒤에 영숫자만 써야 한다`);
    if (!['mark', 'void', 'container', 'attr', 'tool'].includes(wing.place))
      fail(`"${wing.w}" 의 place가 올바르지 않다`);
    if (byW.has(wing.w) || byType.has(wing.w)) fail(`"${wing.w}" 가 두 번 등록됐다`);
    if (OFFICIAL_WINGS.has(wing.w) && !$isBuiltinWing(wing)) {
      fail(`"${wing.w}" 는 package 공식 wing 인스턴스만 그 이름을 쓸 수 있다`);
    }
    const stringList = (label: string, value: unknown): readonly string[] => {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item === '')) {
        fail(`"${wing.w}" 의 ${label} 는 빈 값 없는 문자열 배열이어야 한다`);
      }
      if (new Set(value).size !== value.length) fail(`"${wing.w}" 의 ${label} 에 중복 이름이 있다`);
      return value;
    };
    if (wing.attrs !== undefined) stringList('attrs', wing.attrs);
    if (wing.boolAttrs !== undefined) stringList('boolAttrs', wing.boolAttrs);
    if (wing.clearable !== undefined && typeof wing.clearable !== 'boolean')
      fail(`"${wing.w}" 의 clearable 은 true/false 여야 한다`);
    if (wing.clearable !== undefined && wing.place !== 'mark' && wing.place !== 'attr') {
      fail(`"${wing.w}" 의 clearable 은 mark 또는 attr 에만 쓸 수 있다`);
    }
    if ((wing.attrs !== undefined || wing.boolAttrs !== undefined) && !erectsNode(wing.place)) {
      fail(`"${wing.w}" 의 attrs/boolAttrs 는 node를 세우는 wing에만 쓸 수 있다`);
    }
    if (wing.place === 'container') {
      if (wing.holds !== 'blocks' && wing.holds !== 'inline') fail(`"${wing.w}" 컨테이너의 holds가 올바르지 않다`);
    } else {
      if (wing.holds !== undefined) fail(`"${wing.w}" 의 holds 는 container만 가진다`);
      if (wing.singleParagraph !== undefined) fail(`"${wing.w}" 의 singleParagraph 는 container만 가진다`);
    }
    if (wing.singleParagraph !== undefined && typeof wing.singleParagraph !== 'boolean') {
      fail(`"${wing.w}" 의 singleParagraph 는 true/false 여야 한다`);
    }
    if (wing.singleParagraph === true && wing.holds !== 'blocks') {
      fail(`"${wing.w}" 의 singleParagraph 는 blocks holder에만 쓸 수 있다`);
    }
    if (wing.allows !== undefined && wing.place !== 'container') fail(`"${wing.w}" 의 allows 는 container만 가진다`);
    if (wing.allows !== undefined) stringList('allows', wing.allows);
    byW.set(wing.w, wing);

    if (erectsNode(wing.place)) {
      if (!wing.toHtml) fail(`"${wing.w}" 는 노드를 세우는 wing 인데 toHtml 이 없다`);
      byType.set(wing.w, wing);
    }
    if (wing.place === 'container' && !wing.holds) fail(`"${wing.w}" 컨테이너에 holds 선언이 없다`);
    if (wing.place !== 'container' && wing.parts) fail(`"${wing.w}" — parts 는 컨테이너만 가진다`);
    // 정렬은 **래퍼문단**의 것이라, 마다하겠다는 말도 래퍼문단을 입는 물건만 할 수 있다.
    if (wing.noAlign && wing.place !== 'void' && wing.place !== 'container') {
      fail(`"${wing.w}" — noAlign 은 물건(void·container)만 든다`);
    }

    for (const part of Object.keys(wing.parts ?? {})) {
      const decl = wing.parts?.[part] as StructureDecl;
      if (RESERVED.has(part)) fail(`"${wing.w}" 의 부품 "${part}" 가 코어 예약어다`);
      if (byW.has(part) || byType.has(part)) fail(`부품 "${part}" 가 이미 다른 이름과 부딪힌다`);
      if (!builtinTypes.has(part) && !EXTENSION_NAME.test(part)) {
        fail(`"${wing.w}" 의 custom 부품 "${part}" 는 ex namespace여야 한다`);
      }
      if (!wing.partHtml?.[part]) fail(`"${wing.w}" 의 부품 "${part}" 에 partHtml 조립이 없다`);
      if (decl.holds !== 'blocks' && decl.holds !== 'inline')
        fail(`"${wing.w}" 의 부품 "${part}" holds가 올바르지 않다`);
      if (decl.singleParagraph !== undefined && typeof decl.singleParagraph !== 'boolean') {
        fail(`"${wing.w}" 의 부품 "${part}" singleParagraph는 true/false 여야 한다`);
      }
      if (decl.singleParagraph === true && decl.holds !== 'blocks') {
        fail(`"${wing.w}" 의 부품 "${part}" singleParagraph는 blocks holder에만 쓸 수 있다`);
      }
      if (decl.attrs !== undefined) stringList(`부품 "${part}" attrs`, decl.attrs);
      if (decl.boolAttrs !== undefined) stringList(`부품 "${part}" boolAttrs`, decl.boolAttrs);
      byType.set(part, wing);
    }

    for (const [type, attrs, boolAttrs] of [
      [wing.w, wing.attrs ?? [], wing.boolAttrs ?? []] as const,
      ...Object.entries(wing.parts ?? {}).map(
        ([part, decl]) => [part, decl.attrs ?? [], decl.boolAttrs ?? []] as const,
      ),
    ]) {
      if (!builtinTypes.has(type)) {
        for (const attr of attrs)
          if (!EXTENSION_NAME.test(attr)) fail(`custom 타입 "${type}" 의 attr "${attr}" 는 ex namespace여야 한다`);
        for (const attr of boolAttrs)
          if (!attrs.includes(attr)) fail(`custom 타입 "${type}" 의 bool attr "${attr}" 를 attrs에도 선언해야 한다`);
      }
    }

    for (const key of Object.keys(wing.partHtml ?? {}))
      if (!wing.parts?.[key]) fail(`"${wing.w}" 의 partHtml "${key}" 선언이 parts에 없다`);
    for (const key of Object.keys(wing.partMd ?? {}))
      if (!wing.parts?.[key]) fail(`"${wing.w}" 의 partMd "${key}" 선언이 parts에 없다`);
    for (const key of Object.keys(wing.partRepair ?? {}))
      if (!wing.parts?.[key]) fail(`"${wing.w}" 의 partRepair "${key}" 선언이 parts에 없다`);

    if (wing.place === 'attr') {
      if (!wing.attrKey) fail(`"${wing.w}" 는 문단 속성 wing 인데 attrKey 가 없다`);
      // cocoon 의 문단 화이트리스트(h·a·dc)가 곧 이 계약의 한계다 — 밖의 키는 어차피 걷힌다.
      if (!['h', 'a', 'dc'].includes(wing.attrKey)) {
        fail(`"${wing.w}" 의 attrKey "${wing.attrKey}" 는 문단 속성 화이트리스트(h·a·dc) 밖이다`);
      }
    }

    for (const name of Object.keys(wing.commands ?? {})) {
      if (!COMMAND_NAME.test(name)) fail(`"${wing.w}" 의 커맨드 "${name}" 가 이름 규칙(동사+목적어 카멜)을 어긴다`);
      if (CORE_COMMAND_NAMES.has(name)) fail(`"${wing.w}" 의 커맨드 "${name}" 가 core command와 부딪힌다`);
    }

    for (const button of [wing.button, ...(wing.buttons ?? [])]) {
      const shortcut = button?.shortcut;
      if (shortcut !== undefined) {
        if (!SHORTCUT.test(shortcut))
          fail(`"${wing.w}" 의 단축키 "${shortcut}" 는 라틴 대문자·숫자 한 글자 또는 ↑·↓여야 한다`);
        const taken = shortcuts.get(shortcut);
        if (taken) fail(`단축키 "${shortcut}" 를 "${taken}" 와 "${wing.w}" 가 같이 주장한다`);
        shortcuts.set(shortcut, wing.w);
      }
      const accelerator = button?.accelerator;
      if (accelerator !== undefined) {
        if (!ACCELERATOR.test(accelerator)) fail(`"${wing.w}" 의 가속키 "${accelerator}" 는 mod+<소문자> 여야 한다`);
        const taken = accelerators.get(accelerator);
        if (taken) fail(`가속키 "${accelerator}" 를 "${taken}" 와 "${wing.w}" 가 같이 주장한다`);
        accelerators.set(accelerator, wing.w);
      }
    }

    if (wing.ioFilter) {
      $assertIoFilter(wing.ioFilter);
      if (RESERVED_FILTER_IDS.has(wing.ioFilter.id)) fail(`IO 필터 id "${wing.ioFilter.id}" 는 내장 형식이 예약했다`);
      const taken = filterIds.get(wing.ioFilter.id);
      if (taken) fail(`IO 필터 id "${wing.ioFilter.id}" 를 ${taken} 와 "${wing.w}" 가 같이 주장한다`);
      filterIds.set(wing.ioFilter.id, `"${wing.w}"`);
    }
  }

  // --- 2차 — 서로를 보는 검사 (등록 순서를 안 탄다) -----------------------------------------
  for (const wing of wings) {
    if (wing.requiresAnyOf && !wing.requiresAnyOf.some((w) => byW.has(w))) {
      fail(`"${wing.w}" 는 [${wing.requiresAnyOf.join(', ')}] 중 하나가 함께 등록돼야 한다`);
    }
    for (const child of wing.allows ?? []) {
      if (!RESERVED.has(child) && !byType.has(child)) {
        fail(`"${wing.w}" 의 allows 에 모르는 타입 "${child}" 가 있다`);
      }
    }
  }

  // --- 접기 — 아래층 산출물 -----------------------------------------------------------------
  const lumps: string[] = [];
  const voids: string[] = [];
  const blockHolders: string[] = [];
  const inlineHolders: string[] = [];
  const singleParagraph: string[] = [];
  const noAlign: string[] = [];
  const boolAttrs = new Set<string>();
  const attrSchemas = new Map<string, ReadonlySet<string>>();
  const boolAttrsByType = new Map<string, ReadonlySet<string>>();
  const clearableMarks = new Set<string>();
  const clearableAttrs = new Set<string>();
  const closedAttrs = new Set<string>();
  const repair = Object.create(null) as Record<string, (node: ElementNode) => ElementNode | null>;
  const builders = Object.create(null) as Record<string, HtmlBuilder>;
  const commands = Object.create(null) as Record<string, Command>;
  const rules: RegisteredRule[] = [];
  const attaches: Attach[] = [];
  const escapes = new Map<string, string[]>();
  const doubles = new Map<string, string>();
  const ioFilters: IoFilter[] = [...(extra?.ioFilters ?? [])];
  const mdBuilders = Object.create(null) as Record<string, MdBuilder>;

  const addRepair = (w: string, fns: ((node: ElementNode) => ElementNode | null)[]): void => {
    const chain = fns.filter((fn) => fn !== undefined);
    if (chain.length === 0) return;
    // 한 번 null 이면 끝까지 null 이다 — 벗기기로 정해진 껍데기를 뒤의 손이 되살리지 않는다.
    repair[w] = (node) => chain.reduce<ElementNode | null>((acc, fn) => (acc === null ? null : fn(acc)), node);
  };

  for (const wing of wings) {
    const builtinTypes = new Set($builtinAttrTypes(wing) ?? []);
    if (!builtinTypes.has(wing.w) && erectsNode(wing.place)) {
      attrSchemas.set(wing.w, new Set(wing.attrs ?? []));
      boolAttrsByType.set(wing.w, new Set(wing.boolAttrs ?? []));
    }
    if (wing.clearable === true && wing.place === 'mark') {
      clearableMarks.add(wing.w);
    }
    if (wing.clearable === true && wing.place === 'attr' && wing.attrKey) {
      clearableAttrs.add(wing.attrKey);
    }
    for (const w of $builtinAttrTypes(wing) ?? []) {
      if (byType.get(w) === wing) closedAttrs.add(w);
    }
    if (wing.place === 'void') {
      lumps.push(wing.w);
      voids.push(wing.w);
    }
    if (wing.place === 'container') {
      lumps.push(wing.w);
      (wing.holds === 'inline' ? inlineHolders : blockHolders).push(wing.w);
      if (wing.singleParagraph) singleParagraph.push(wing.w);
    }
    for (const [part, decl] of Object.entries(wing.parts ?? {})) {
      if (!builtinTypes.has(part)) {
        attrSchemas.set(part, new Set(decl.attrs ?? []));
        boolAttrsByType.set(part, new Set(decl.boolAttrs ?? []));
      }
      (decl.holds === 'inline' ? inlineHolders : blockHolders).push(part);
      if (decl.singleParagraph) singleParagraph.push(part);
      for (const attr of decl.boolAttrs ?? []) boolAttrs.add(attr);
    }
    for (const attr of wing.boolAttrs ?? []) boolAttrs.add(attr);
    if (wing.noAlign) noAlign.push(wing.w);

    // repair 사슬 — allows 필터가 먼저, wing 자신의 복구가 그 위에 선다.
    const own: ((node: ElementNode) => ElementNode | null)[] = [];
    if (wing.allows) own.push(allowsRepair(new Set(wing.allows)));
    if (wing.repair) own.push(wing.repair);
    // 노드를 세우는 갈래는 물론이고 **마크도** repair 를 단다 — JSON 으로 들어온 마크의 값도
    // 검사를 지나야 한다(: 같은 공격이 HTML 로 오면 지워지고 JSON 으로 오면 남았다).
    if (erectsNode(wing.place) || wing.place === 'mark') addRepair(wing.w, own);
    for (const [part, fn] of Object.entries(wing.partRepair ?? {})) addRepair(part, [fn]);

    if (wing.toHtml) builders[wing.w] = wing.toHtml;
    for (const [part, builder] of Object.entries(wing.partHtml ?? {})) builders[part] = builder;

    if (wing.toMd) mdBuilders[wing.w] = wing.toMd;
    for (const [part, builder] of Object.entries(wing.partMd ?? {})) mdBuilders[part] = builder;
    if (wing.ioFilter) ioFilters.push(wing.ioFilter);

    for (const [name, command] of Object.entries(wing.commands ?? {})) {
      if (commands[name]) fail(`커맨드 "${name}" 를 wing 둘이 같이 주장한다`);
      commands[name] = command;
    }
    for (const rule of wing.inputRules ?? []) rules.push({ ...rule, w: wing.w });
    if (wing.attach) attaches.push(wing.attach);
    for (const key of wing.escapeKeys ?? []) {
      const list = escapes.get(key) ?? [];
      list.push(wing.w);
      escapes.set(key, list);
    }
    // 연타 키는 **하나에 하나**다 — 커맨드처럼 둘이 같이 주장하면 등록이 죽는다(고를 근거가 없다).
    for (const [key, name] of Object.entries(wing.doubleKeys ?? {})) {
      if (doubles.has(key)) fail(`연타 키 "${key}" 를 wing 둘이 같이 주장한다`);
      doubles.set(key, name);
    }
  }

  // 연타가 가리키는 커맨드는 실재해야 한다 — 없는 이름을 두면 그 몸짓만 조용히 죽는다.
  // (커맨드 맵이 다 찬 뒤에 본다 — 선언한 wing 이 먼저 서는 순서를 요구하지 않는다.)
  for (const [key, name] of doubles) {
    if (!commands[name] && !CORE_COMMAND_NAMES.has(name)) fail(`연타 키 "${key}" 가 없는 커맨드 "${name}" 를 가리킨다`);
  }

  const referencedCommand = (action: unknown): string | null => {
    const value = action as { readonly kind?: unknown; readonly command?: unknown } | undefined;
    return value && value.kind !== 'mark' && typeof value.command === 'string' ? value.command : null;
  };
  const assertCommand = (owner: string, name: string | null): void => {
    if (name && !commands[name] && !CORE_COMMAND_NAMES.has(name)) fail(`${owner}가 없는 커맨드 "${name}" 를 가리킨다`);
  };
  for (const wing of wings) {
    for (const button of [wing.button, ...(wing.buttons ?? [])]) {
      assertCommand(`"${wing.w}" button`, referencedCommand(button?.action));
      assertCommand(`"${wing.w}" accelerated button`, referencedCommand(button?.accelerated));
    }
    for (const control of wing.context?.controls ?? []) {
      if (control.kind !== 'lightbox') assertCommand(`"${wing.w}" context "${control.name}"`, control.command);
    }
  }

  const env: EditEnv = {
    lumps: new Set(lumps),
    voids: new Set(voids),
    blockHolders: new Set(blockHolders),
    inlineHolders: new Set(inlineHolders),
    boolAttrs,
    attrSchemas,
    boolAttrsByType,
    clearableMarks,
    clearableAttrs,
    ...(noAlign.length > 0 ? { noAlign: new Set(noAlign) } : {}),
    ...(Object.keys(repair).length > 0 ? { repair } : {}),
    ...(singleParagraph.length > 0 ? { singleParagraph: new Set(singleParagraph) } : {}),
  };
  $closeKnownTypes(env, [P, BR, ...byType.keys()]);
  $closeBuiltinAttrs(env, closedAttrs);

  // 들여오기 역방향 — 주장한 wing 들에게 차례로 묻고, 첫 답이 이긴다. 아무도 안 잡으면 기본 대응.
  const claimers = wings.filter((wing) => wing.claim);
  const claim: ImportOptions['claim'] | undefined =
    claimers.length === 0
      ? undefined
      : (el, inner) => {
          for (const wing of claimers) {
            const taken = wing.claim?.(el, inner);
            if (taken) return taken;
          }
          return null;
        };

  return {
    wings,
    env,
    builders,
    commands,
    claim,
    inputRules: rules,
    attaches,
    escapes,
    doubles,
    ioFilters,
    mdBuilders,
    ownerOf: (typeW) => byType.get(typeW) ?? null,
    wingOf: (w) => byW.get(w) ?? null,
  };
}

// registry 산출물을 createNabi 옵션으로 편다 — editor 는 wing 층을 모른 채 그대로 받는다.
export function nabiOptionsOf(
  registry: Registry,
  extra?: NabiOptions & Pick<NabiCoreOptions, 'parseHtml'>,
): NabiCoreOptions {
  return {
    env: registry.env,
    commands: registry.commands,
    builders: registry.builders,
    ...(registry.claim ? { claim: registry.claim } : {}),
    parseHtml: parseNodes,
    ...(extra ?? {}),
  };
}

// wing 목록으로 바로 에디터 하나 — 호스트 조립의 기본 문. 배열과 함께 **wing 고르기 빌더**
// (087, wings 층의 `wings()`)도 그대로 받는다 — `.build()` 는 잊기 좋은 한 걸음이라 아예
// 없앴다. 이 층은 빌더가 사는 wings 층을 못 보므로 이름이 아니라 모양(build)만 본다.
type InternalNabiOptions = NabiOptions & RegistryExtra & Pick<NabiCoreOptions, 'parseHtml'>;

function createNabiFromWings(
  wings: readonly Wing[] | { build(): readonly Wing[] },
  extra?: InternalNabiOptions,
): { readonly nabi: Nabi; readonly registry: Registry } {
  // `ioFilters` 는 편집기의 옵션이 아니라 **레지스트리의 문**이다 — 필터는 wing 지식이라
  // 어휘를 접는 그 자리에서 순서가 정해져야 한다(호스트가 앞, wing 이 뒤).
  const { ioFilters, ...rest } = extra ?? {};
  const registry = makeRegistry('build' in wings ? wings.build() : wings, ioFilters ? { ioFilters } : undefined);
  return { nabi: createNabi(nabiOptionsOf(registry, rest)), registry };
}

export function createNabiWith(
  wings: readonly Wing[] | { build(): readonly Wing[] },
  extra?: NabiOptions & RegistryExtra,
): { readonly nabi: Nabi; readonly registry: Registry } {
  const options: InternalNabiOptions = {
    ...(extra?.doc !== undefined ? { doc: extra.doc } : {}),
    ...(extra?.allowLocalUrls !== undefined ? { allowLocalUrls: extra.allowLocalUrls } : {}),
    ...(extra?.ask !== undefined ? { ask: extra.ask } : {}),
    ...(extra?.toast !== undefined ? { toast: extra.toast } : {}),
    ...(extra?.toastMs !== undefined ? { toastMs: extra.toastMs } : {}),
    ...(extra?.toastMax !== undefined ? { toastMax: extra.toastMax } : {}),
    ...(extra?.onError !== undefined ? { onError: extra.onError } : {}),
    ...(extra?.undoLimit !== undefined ? { undoLimit: extra.undoLimit } : {}),
    ...(extra?.typingMergeMs !== undefined ? { typingMergeMs: extra.typingMergeMs } : {}),
    ...(extra?.locale !== undefined ? { locale: extra.locale } : {}),
    ...(extra?.ioFilters !== undefined ? { ioFilters: extra.ioFilters } : {}),
  };
  return createNabiFromWings(wings, options);
}

export function $createNabiWith(
  wings: readonly Wing[] | { build(): readonly Wing[] },
  extra?: InternalNabiOptions,
): { readonly nabi: Nabi; readonly registry: Registry } {
  return createNabiFromWings(wings, extra);
}

// --- 저장본 → HTML — 에디터 없이, DOM 없이 (090) ---------------------------------------------
// 보기만 하는 자리(댓글 목록·SSR)에 상태 엔진·표면을 세우는 것은 낭비가 아니라 모양의 잘못이다:
// 저장본을 그리는 데 필요한 것은 registry(어휘)뿐이다. 이 문이 그 한 벌이다.

export interface StoredHtmlOptions {
  readonly allowLocalUrls?: boolean;
}

const storedJob = (registry: Registry, options?: StoredHtmlOptions): HtmlOptions => ({
  env: registry.env,
  builders: registry.builders,
  ...(options?.allowLocalUrls ? { allowLocalUrls: true } : {}),
});

// 저장본(나비트리 JSON) → 보기 HTML. 거절은 setJson 과 같은 규칙이다 — 나비트리가 아니면 null.
// 통과한 값은 cocoon(불변식·wing repair)을 지나 같은 조립으로 나가므로, 나온 HTML 은 편집기의
// getHtml 과 같은 신뢰 경계 안이다.
export function renderStoredHtml(json: unknown, registry: Registry, options?: StoredHtmlOptions): string | null {
  // 조립 중에 던지는 값도 같은 답(null)이다 — 읽기 쪽 문이라 더더욱 예외가 밖으로 못 나간다.
  return $guarded('renderStoredHtml', null, () => {
    const doc = $fromJson(json, registry.env);
    if (!doc) return null;
    return renderHtml(doc, storedJob(registry, options));
  });
}

// 같은 문의 편집기 HTML — data-key 와 봉인·실제 드롭캡 글자 같은 화면 부속을 더한다.
// cocoon 의 _id 가 결정적이라(같은 JSON 은 같은 키) 서버가 이것으로 그린 DOM 을 클라이언트의
// mountSurface({hydrate: true})가 입양한다.
export function renderStoredEditorHtml(json: unknown, registry: Registry, options?: StoredHtmlOptions): string | null {
  return $guarded('renderStoredEditorHtml', null, () => {
    const doc = $fromJson(json, registry.env);
    if (!doc) return null;
    return renderEditorHtml(doc, storedJob(registry, options));
  });
}
