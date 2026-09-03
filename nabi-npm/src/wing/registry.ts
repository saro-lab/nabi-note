// registry — wing 목록을 받아 계약을 검사(fail-fast)하고, 아래층들이 먹는 산출물(EditEnv·builders·
// commands·claim·repair 맵 등)로 접는다. 하나라도 계약을 어기면 등록 자체가 죽는다.
// Takes a wing list, checks the contract fail-fast, and folds it into what lower layers consume (EditEnv, builders, commands, claim, repair map, etc). Any contract violation kills registration itself.
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
// Command naming rule: verb+object camelCase; a single word (`merge`) or a capitalized start fails.
const COMMAND_NAME = /^[a-z][a-z0-9]*([A-Z][A-Za-z0-9]*)+$/;
// 힌트 단축키 — 라틴 대문자·숫자 한 글자. 가속키 — mod+소문자 하나.
// Hint shortcut: one Latin letter/digit. Accelerator: mod+ one lowercase letter.
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
  // The environment createNabi, cocoon, and doc operations consume; repair (including the allows filter) is folded in.
  readonly env: EditEnv;
  readonly builders: HtmlBuilders;
  readonly commands: Readonly<Record<string, Command>>;
  readonly claim: ImportOptions['claim'] | undefined;
  readonly inputRules: readonly RegisteredRule[];
  // 선언형 표면 부속 — mount(surface)가 붙이고 뗀다(표의 칸 드래그 칠 류).
  // Declarative surface attachments; mount (surface) attaches and detaches them (e.g. a table's cell drag-paint).
  readonly attaches: readonly Attach[];
  // escape 키 → 그 키를 선언한 마크 wing의 `w` 목록(surface가 예약 방향에 쓴다).
  // Escape key -> the `w` list of mark wings declaring it; used by the surface for its reservation direction.
  readonly escapes: ReadonlyMap<string, readonly string[]>;
  // 연타 키 → 돌릴 커맨드 이름(`Wing.doubleKeys`). 표면은 이 표만 보고 wing 이름을 모른다.
  // Double-tap key -> command name to run (`Wing.doubleKeys`); the surface only reads this map and never learns wing names.
  readonly doubles: ReadonlyMap<string, string>;
  // IO 필터 목록 — 호스트가 끼운 것이 앞, wing이 든 것이 뒤다. 내장 셋(html·md·nabi)은 이 뒤에 붙는다.
  // IO filters — host-supplied ones come first, wing-declared ones after; the built-in set (html, md, nabi) is appended last (by the surface).
  readonly ioFilters: readonly IoFilter[];
  // md 조립 맵 — builders와 같은 무늬다. 없는 타입은 md 저장에서 html로 떨어진다.
  // Markdown builder map, shaped like `builders`; a type without one falls back to raw HTML in md output.
  readonly mdBuilders: MdBuilders;
  // 이 타입(부품 포함)을 소유한 wing — 키 소유 판정·ui가 쓴다.
  // The wing owning this type (including parts); used by key-ownership resolution and the UI.
  ownerOf(typeW: string): Wing | null;
  wingOf(w: string): Wing | null;
}

function fail(message: string): never {
  throw new Error(`wing 등록 실패 — ${message}`);
}

// allows 제한을 repair로 접는다 — 벗어난 엘리먼트 자식은 삭제가 아니라 껍데기만 벗고 속이 올라온다.
// Folds the `allows` restriction into a repair — a child outside the whitelist isn't deleted, just unwrapped so its contents rise up (recursively, and loose inline nodes are gathered into a paragraph).
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
      // A child outside the whitelist: unwrap it and re-admit its contents in the same slot.
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
  // 호스트가 끼우는 IO 필터 — wing이 든 것보다 앞에 선다(제 형식이 내장보다 먼저 답한다).
  // Host-supplied IO filters, placed before wing-declared ones so a host's own format answers before the built-ins.
  readonly ioFilters?: readonly IoFilter[];
}

export function makeRegistry(wings: readonly Wing[], extra?: RegistryExtra): Registry {
  const byType = new Map<string, Wing>(); // 노드 타입(w·부품) → 소유 wing
  const byW = new Map<string, Wing>(); // wing의 w → wing(tool·attr 포함)
  const shortcuts = new Map<string, string>();
  const accelerators = new Map<string, string>();
  // IO 필터 id → 주장한 이 — 같은 id가 둘이면 어느 쪽이 답하는지가 등록 순서에 숨어버리기 때문에 검사한다.
  // Filter id -> claimant; checked because if two filters share an id, which one answers would silently depend on registration order.
  const filterIds = new Map<string, string>();

  for (const filter of extra?.ioFilters ?? []) {
    $assertIoFilter(filter);
    if (RESERVED_FILTER_IDS.has(filter.id)) fail(`IO 필터 id "${filter.id}" 는 내장 형식이 예약했다`);
    if (filterIds.has(filter.id)) fail(`IO 필터 id "${filter.id}" 를 호스트가 두 번 든다`);
    filterIds.set(filter.id, '호스트');
  }

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
    // 정렬은 래퍼문단의 것이라, 마다하겠다는 말도 래퍼문단을 입는 물건만 할 수 있다.
    // Alignment belongs to the wrapper paragraph, so only objects that get one (void, container) can opt out via noAlign.
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
      // cocoon의 문단 화이트리스트(h·a·dc)가 곧 이 계약의 한계다 — 밖의 키는 어차피 걷힌다.
      // cocoon's paragraph attribute whitelist (h, a, dc) is this contract's actual limit; a key outside it gets stripped anyway.
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
    // 한 번 null이면 끝까지 null이다 — 벗기기로 정해진 껍데기를 뒤의 손이 되살리지 않는다.
    // Once null, always null in the chain — a later step can't resurrect a shell already decided to be stripped.
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
    // The repair chain: the allows filter runs first, then the wing's own repair on top.
    const own: ((node: ElementNode) => ElementNode | null)[] = [];
    if (wing.allows) own.push(allowsRepair(new Set(wing.allows)));
    if (wing.repair) own.push(wing.repair);
    // 노드를 세우는 갈래뿐 아니라 마크도 repair를 단다 — JSON으로 들어온 값도 같은 검사를 지나야 한다.
    // Marks get a repair too, not just node-erecting kinds — a value arriving via JSON must pass the same check an HTML import would.
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
    // 연타 키는 하나에 하나다 — 커맨드처럼 둘이 같이 주장하면 등록이 죽는다(고를 근거가 없다).
    // A double-tap key maps to exactly one command; two wings claiming it fails registration, same as commands (there's no basis to pick one).
    for (const [key, name] of Object.entries(wing.doubleKeys ?? {})) {
      if (doubles.has(key)) fail(`연타 키 "${key}" 를 wing 둘이 같이 주장한다`);
      doubles.set(key, name);
    }
  }

  // 연타가 가리키는 커맨드는 실재해야 한다 — 없는 이름을 두면 그 몸짓만 조용히 죽는다.
  // A double-tap must point to a real command; a nonexistent name would make just that gesture silently do nothing.
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

  // 들여오기 역방향 — 주장한 wing들에게 차례로 묻고, 첫 답이 이긴다. 아무도 안 잡으면 기본 대응.
  // Import claiming, in reverse — asks each claiming wing in turn, first hit wins; falls back to the default if none claim it.
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

// registry 산출물을 createNabi 옵션으로 편다 — editor는 wing 층을 모른 채 그대로 받는다.
// Unfolds registry output into createNabi options; the editor receives it as-is, with no knowledge of the wing layer.
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

// wing 목록으로 바로 에디터 하나 — 호스트 조립의 기본 문. 배열과 wing 고르기 빌더 둘 다 받는다
// (`.build()` 호출은 잊기 좋은 걸음이라 없앴다 — 빌더는 이름이 아니라 모양(.build)으로 알아본다).
// Builds an editor directly from a wing list — the host's main entry point. Accepts either a plain array or a wing-picking builder (its `.build()` call was error-prone to forget, so this layer detects a builder by shape, not by name, since it can't see the wings layer where builders live).
type InternalNabiOptions = NabiOptions & RegistryExtra & Pick<NabiCoreOptions, 'parseHtml'>;

function createNabiFromWings(
  wings: readonly Wing[] | { build(): readonly Wing[] },
  extra?: InternalNabiOptions,
): { readonly nabi: Nabi; readonly registry: Registry } {
  // `ioFilters` 는 편집기 옵션이 아니라 레지스트리의 몫이다 — 필터 순서(호스트 앞, wing 뒤)는 어휘를 접는 자리에서 정해져야 한다.
  // `ioFilters` belongs to the registry, not the editor's options — filter order (host first, wings after) must be decided where the vocabulary is folded.
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

// 저장본 → HTML, 에디터 없이 DOM 없이 — 보기만 하는 자리(댓글 목록·SSR)에 필요한 건 registry(어휘)뿐이다.
// Stored doc to HTML, with no editor and no DOM — a view-only spot (a comment list, SSR) only needs the registry's vocabulary, not a full state engine.

export interface StoredHtmlOptions {
  readonly allowLocalUrls?: boolean;
}

const storedJob = (registry: Registry, options?: StoredHtmlOptions): HtmlOptions => ({
  env: registry.env,
  builders: registry.builders,
  ...(options?.allowLocalUrls ? { allowLocalUrls: true } : {}),
});

// 저장본(나비트리 JSON) → 보기 HTML. 거절은 setJson과 같은 규칙(나비트리가 아니면 null)이고,
// 통과한 값은 cocoon을 지나 같은 조립으로 나가므로 편집기의 getHtml과 같은 신뢰 경계 안이다.
// Stored NABI TREE JSON to view HTML. Rejection follows the same rule as setJson (null if not a valid tree); a passing value goes through cocoon and the same builder, landing in the same trust boundary as the editor's getHtml.
export function renderStoredHtml(json: unknown, registry: Registry, options?: StoredHtmlOptions): string | null {
  // 조립 중에 던지는 값도 같은 답(null)이다 — 읽기 쪽 문이라 더더욱 예외가 밖으로 못 나간다.
  // A throw during building gets the same answer (null) — this is a read-only door, so exceptions must not escape it.
  return $guarded('renderStoredHtml', null, () => {
    const doc = $fromJson(json, registry.env);
    if (!doc) return null;
    return renderHtml(doc, storedJob(registry, options));
  });
}

// 같은 문의 편집기 HTML — data-key 등 화면 부속을 더한다. cocoon의 _id가 결정적이라(같은 JSON은
// 같은 키) 서버가 그린 DOM을 클라이언트의 mountSurface({hydrate: true})가 그대로 입양할 수 있다.
// The editor-flavored HTML from the same door, adding screen fixtures like data-key. cocoon's _id is deterministic (same JSON -> same keys), so the client's mountSurface({hydrate: true}) can adopt DOM the server rendered.
export function renderStoredEditorHtml(json: unknown, registry: Registry, options?: StoredHtmlOptions): string | null {
  return $guarded('renderStoredEditorHtml', null, () => {
    const doc = $fromJson(json, registry.env);
    if (!doc) return null;
    return renderEditorHtml(doc, storedJob(registry, options));
  });
}
