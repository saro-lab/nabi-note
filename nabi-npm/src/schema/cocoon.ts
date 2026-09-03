// cocoon 을 지나면 나비트리 불변식이 선다(래퍼문단·attrs 화이트리스트 등) — 세부는 각 함수 주석에.
// Passing through cocoon establishes nabi-tree invariants; per-invariant detail lives on each function below.
import { BR, P } from './reserved.js';
import { canonicalTextLines } from './text.js';
import { $callbackTree, $snapshotNodes } from './raw.js';
import { isElement, type Attrs, type AttrValue, type ElementNode, type NabiDoc, type NabiNode } from './types.js';
import {
  $hasClosedBuiltinAttrs,
  $isKnownType,
  $usesClosedBuiltinAttrs,
  isLump,
  refusesAlign,
  type SchemaEnv,
} from './env.js';

// 정렬 값은 첫 글자 표기 하나로 통일한다.
// Alignment values are normalized to a single first-letter code.
const ALIGNS: ReadonlySet<string> = new Set(['l', 'c', 'r']);

const BUILTIN_ATTRS: Readonly<Record<string, ReadonlySet<string>>> = {
  b: new Set(),
  i: new Set(),
  u: new Set(),
  s: new Set(),
  sub: new Set(),
  sup: new Set(),
  hl: new Set(['c']),
  tc: new Set(['c']),
  fs: new Set(['v']),
  tf: new Set(['v']),
  a: new Set(['href', 'file']),
  ul: new Set(),
  li: new Set(),
  ol: new Set(),
  oli: new Set(),
  tl: new Set(),
  tli: new Set(['ck']),
  quote: new Set(),
  details: new Set(['o']),
  summary: new Set(),
  code: new Set(['lang']),
  hr: new Set(),
  table: new Set(['sort']),
  tr: new Set(),
  td: new Set(['colspan', 'rowspan', 'th']),
  img: new Set(['src', 'w']),
  youtube: new Set(['v', 'w']),
};

const BUILTIN_BOOL_ATTRS: Readonly<Record<string, ReadonlySet<string>>> = {
  tli: new Set(['ck']),
  details: new Set(['o']),
  table: new Set(['sort']),
  td: new Set(['th']),
};
const BUILTIN_BOOL_KEYS: ReadonlySet<string> = new Set(['ck', 'o', 'sort', 'th']);

export function $hasBuiltinAttrSchema(w: string): boolean {
  return Object.prototype.hasOwnProperty.call(BUILTIN_ATTRS, w);
}

// --- attrs ---------------------------------------------------------------------------------

function sameAttrs(a: Attrs | undefined, b: Attrs | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((key) => a[key] === b[key]);
}

// 글 문단은 h·a·dc 만, 래퍼문단은 정렬(a)만 남기고 나머진 걷는다 — 옛 저장본의 무효값도 여기서 씻긴다.
// Text paragraphs keep only h/a/dc, wrapper paragraphs only alignment; stale invalid values are dropped here too.
function paragraphAttrs(a: Attrs | undefined, wrapper: boolean, align = true): Attrs | undefined {
  if (!a) return undefined;
  const out: Record<string, AttrValue> = {};
  for (const [key, value] of Object.entries(a)) {
    if (key === 'a' && align && typeof value === 'string' && ALIGNS.has(value)) out['a'] = value;
    if (wrapper) continue;
    if (key === 'h' && typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6)
      out['h'] = value;
    if (key === 'dc' && value === 1) out['dc'] = 1;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// wing attrs 는 일반 규칙만 본다(문자열/유한수, `_` 접두 걷기, 불리언은 1만) — 이름별 화이트리스트는 wing 몫.
// Wing attrs only get generic checks; per-name whitelisting is each wing's own job.
function wingAttrs(w: string, a: Attrs | undefined, env: SchemaEnv): Attrs | undefined {
  if (!a) return undefined;
  const closed = $hasClosedBuiltinAttrs(env, w);
  const schema = closed ? BUILTIN_ATTRS[w] : env.attrSchemas?.get(w);
  const out: Record<string, AttrValue> = {};
  for (const [key, value] of Object.entries(a)) {
    if (key.startsWith('_')) continue;
    if (schema && !schema.has(key)) continue;
    const builtinBool = closed && (BUILTIN_BOOL_ATTRS[w]?.has(key) ?? false);
    const customBool =
      !closed &&
      (env.boolAttrsByType?.get(w)?.has(key) ?? env.boolAttrs.has(key)) &&
      (!$usesClosedBuiltinAttrs(env) || !BUILTIN_BOOL_KEYS.has(key));
    if (builtinBool || customBool) {
      if (value === 1) out[key] = 1;
      continue;
    }
    if (typeof value === 'string') out[key] = value;
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// --- 재조립 도우미 — 바뀐 것이 없으면 원래 참조를 지킨다 ------------------------------------

function sameChildren(a: readonly NabiNode[], b: readonly NabiNode[]): boolean {
  return a.length === b.length && a.every((node, i) => node === b[i]);
}

function rebuild(orig: ElementNode, w: string, a: Attrs | undefined, ch: readonly NabiNode[]): ElementNode {
  if (orig.w === w && sameAttrs(orig.a, a) && sameChildren(orig.ch, ch)) return orig;
  const next: { w: string; a?: Attrs; ch: readonly NabiNode[]; _id?: string } = { w, ch };
  if (a) next.a = a;
  if (orig._id !== undefined) next._id = orig._id;
  return next;
}

function repairOf(env: SchemaEnv, w: string): ((node: ElementNode) => ElementNode | null) | undefined {
  const repairs = env.repair;
  return repairs && Object.prototype.hasOwnProperty.call(repairs, w) ? repairs[w] : undefined;
}

function isUnknown(node: ElementNode, env: SchemaEnv): boolean {
  return !$isKnownType(env, node.w);
}

function repairResult(
  value: ElementNode,
  original: ElementNode,
  env: SchemaEnv,
  known: Readonly<WeakMap<object, NabiNode>>,
): ElementNode {
  const copied = $snapshotNodes([value], true, known)?.[0];
  if (!copied || !isElement(copied) || copied.w !== original.w) {
    throw new TypeError(`invalid repair result for ${original.w}`);
  }
  const attrs = wingAttrs(copied.w, copied.a, env);
  const children = env.voids.has(copied.w)
    ? []
    : env.blockHolders.has(copied.w)
      ? blockChildren(copied.ch, env)
      : inlineChildren(copied.ch, env);
  return rebuild(copied, copied.w, attrs, children);
}

function runRepair(
  repair: (node: ElementNode) => ElementNode | null,
  original: ElementNode,
  env: SchemaEnv,
): ElementNode | null {
  const given = $callbackTree([original]);
  const value = repair(given.nodes[0] as ElementNode);
  return value === null ? null : repairResult(value, original, env, given.originals);
}

// --- 인라인 정리 ----------------------------------------------------------------------------

// 문단·마크·인라인 홀더의 속을 고른다: 빈 글자는 걷고, 이웃한 글자는 잇고, 라인(br)은 속을 비우고,
// 마크는 속으로 내려간다. 물건이 인라인 자리에 잘못 서 있으면 걷어낸다 — 그 자리는 문단 층이지 글자 사이가 아니다.
// Cleans the content of a paragraph/mark/inline holder: drops empty text, merges neighboring text, empties a br's
// content, and recurses into marks. A lump wrongly sitting in an inline slot is dropped — its place is the paragraph layer, not between text.
function inlineChildren(nodes: readonly NabiNode[], env: SchemaEnv): NabiNode[] {
  const out: NabiNode[] = [];
  const push = (node: NabiNode): void => {
    if (typeof node === 'string') {
      const lines = canonicalTextLines(node);
      if (lines.length > 1) {
        lines.forEach((line, index) => {
          if (index > 0) push({ w: BR, ch: [] });
          if (line !== '') push(line);
        });
        return;
      }
      if (node === '') return;
      const last = out[out.length - 1];
      if (typeof last === 'string') {
        out[out.length - 1] = last + node;
        return;
      }
    }
    out.push(node);
  };
  for (const node of nodes) {
    if (!isElement(node)) {
      push(node);
      continue;
    }
    if (node.w === BR) {
      push(rebuild(node, BR, undefined, node.ch.length === 0 ? node.ch : []));
      continue;
    }
    // 인라인 자리의 물건 — 설 수 없는 자리라 걷는다.
    // A lump in an inline slot — it can't stand there, so it's dropped.
    if (env.lumps.has(node.w)) continue;
    if (node.w === P) {
      // 문단 속 문단 — 그 모양은 불가능하므로 껍데기를 벗기고 속만 이 자리로 푼다.
      // A paragraph inside a paragraph is an impossible shape, so its wrapper is dropped and only its content unfolds here.
      for (const inner of inlineChildren(node.ch, env)) push(inner);
      continue;
    }
    if (isUnknown(node, env)) {
      for (const inner of inlineChildren(node.ch, env)) push(inner);
      continue;
    }
    // 마크의 repair 를 여기서 태우는 게 JSON 입구의 값 검사다 — 안 태우면 `javascript:` href 가
    // HTML 입구와 달리 JSON 입구에선 트리에 그대로 남아 오염된 값이 백엔드로 간다.
    // Running repair here is JSON's own validation gate — skip it and a `javascript:` href
    // survives via JSON while HTML strips it, leaking a poisoned value to storage.
    const fixed = rebuild(node, node.w, wingAttrs(node.w, node.a, env), inlineChildren(node.ch, env));
    const repair = repairOf(env, fixed.w);
    const kept = repair ? runRepair(repair, fixed, env) : fixed;
    if (kept === null) {
      for (const inner of fixed.ch) push(inner);
      continue;
    }
    push(kept);
  }
  return out;
}

// --- 블록 정리 ------------------------------------------------------------------------------

// repair 가 null 을 답하면 물건은 통째로 뺀다(마크처럼 벗기지 않음) — HTML 입구가 못 믿을 그림을
// 아예 안 들이는 것과 JSON 입구의 답을 맞추기 위해서다.
// A null repair drops the whole lump (unlike marks, which get unwrapped) so JSON matches
// HTML's door, which never admits an untrusted image in the first place.
function lumpNode(node: ElementNode, env: SchemaEnv): ElementNode | null {
  const a = wingAttrs(node.w, node.a, env);
  let next: ElementNode;
  if (env.voids.has(node.w)) {
    next = rebuild(node, node.w, a, node.ch.length === 0 ? node.ch : []);
  } else if (env.blockHolders.has(node.w)) {
    next = rebuild(node, node.w, a, blockChildren(node.ch, env));
  } else if (env.inlineHolders.has(node.w)) {
    next = rebuild(node, node.w, a, inlineChildren(node.ch, env));
  } else {
    next = rebuild(node, node.w, a, inlineChildren(node.ch, env));
  }
  const repair = repairOf(env, next.w);
  if (!repair) return next;
  return runRepair(repair, next, env);
}

// p가 아닌 블록 노드 하나 — 갈래(단말/블록 홀더/인라인 홀더)에 따라 속을 고치고 repair를 태운다.
// One non-`p` block node — its content is cleaned per grade (terminal/block holder/inline holder), then repair runs.
function blockNode(node: ElementNode, env: SchemaEnv): ElementNode {
  const a = wingAttrs(node.w, node.a, env);
  let next: ElementNode;
  if (env.voids.has(node.w)) {
    next = rebuild(node, node.w, a, node.ch.length === 0 ? node.ch : []);
  } else if (env.blockHolders.has(node.w)) {
    next = rebuild(node, node.w, a, blockChildren(node.ch, env));
  } else if (env.inlineHolders.has(node.w)) {
    next = rebuild(node, node.w, a, inlineChildren(node.ch, env));
  } else {
    // 모르는 타입 — 속을 인라인으로만 고르고 그대로 둔다. 걸러내는 것은 wing 계약의 몫이다.
    // An unknown type — only its content gets cleaned (as inline) and it's left standing; filtering it out is the wing contract's job.
    next = rebuild(node, node.w, a, inlineChildren(node.ch, env));
  }
  const repair = repairOf(env, next.w);
  // 블록 자리에서는 벗기지 않는다 — 껍데기만 벗기면 속의 블록들이 갈 곳을 잃는다.
  // Never unwrapped in a block slot — stripping just the wrapper would leave its inner blocks with nowhere to go.
  if (!repair) return next;
  return runRepair(repair, next, env) ?? next;
}

function unwrapUnknown(nodes: readonly NabiNode[], env: SchemaEnv): NabiNode[] {
  const out: NabiNode[] = [];
  for (const node of nodes) {
    if (isElement(node) && isUnknown(node, env)) out.push(...unwrapUnknown(node.ch, env));
    else out.push(node);
  }
  return out;
}

// 문단 하나를 문단 목록으로 — 물건이 섞여 있으면 쪼개지고, 물건 하나뿐이면 래퍼문단이 된다.
// One paragraph into a list of paragraphs — mixed-in lumps split it apart; a single lone lump becomes a wrapper.
function paragraph(node: ElementNode, env: SchemaEnv): ElementNode[] {
  // 문단 바로 밑에서 물건과 인라인을 가른다 — 문단 속 문단은 인라인 정리에서 풀린다.
  // Splits lumps from inline content right under the paragraph — a nested paragraph gets unwound in inline cleanup.
  const lumps: ElementNode[] = [];
  const slots: (ElementNode | NabiNode[])[] = [];
  let buffer: NabiNode[] = [];
  const flush = (): void => {
    if (buffer.length > 0) slots.push(buffer);
    buffer = [];
  };
  const children = unwrapUnknown(node.ch, env);
  for (const child of children) {
    if (isLump(child, env)) {
      const fixed = lumpNode(child, env);
      if (!fixed) continue;
      flush();
      lumps.push(fixed);
      slots.push(fixed);
      continue;
    }
    buffer.push(child);
  }
  flush();

  // 물건이 없다 — 글 문단 하나. 빈 문단도 그대로 선다(공백은 내용이다).
  // No lump — one text paragraph. An empty one still stands (blank is still content).
  if (lumps.length === 0) {
    return [rebuild(node, P, paragraphAttrs(node.a, false), inlineChildren(children, env))];
  }

  // 물건 하나에 글이 없다 — 이미 래퍼문단이다. attrs 만 정렬로 좁힌다.
  // One lump, no text — already a wrapper paragraph; attrs just narrow down to alignment.
  if (lumps.length === 1 && slots.length === 1) {
    const only = lumps[0] as ElementNode;
    const attrs = paragraphAttrs(node.a, true, !refusesAlign(only.w, env));
    return [rebuild(node, P, attrs, [only])];
  }

  // 섞였다 — 쪼갠다. 글 조각은 글 문단으로(속성 화이트리스트), 물건마다 래퍼문단이 선다(정렬만 상속).
  // Mixed — split apart. A text piece becomes a text paragraph (attr whitelist); each lump gets its own wrapper (alignment only).
  const out: ElementNode[] = [];
  for (const slot of slots) {
    if (Array.isArray(slot)) {
      const inline = inlineChildren(slot, env);
      // 쪼개다 나온 빈 조각 — 쓴 적 없는 빈 문단은 안 만든다.
      // An empty piece from splitting — never fabricates a paragraph nobody wrote.
      if (inline.length === 0) continue;
      const attrs = paragraphAttrs(node.a, false);
      out.push(attrs ? { w: P, a: attrs, ch: inline } : { w: P, ch: inline });
    } else {
      const attrs = paragraphAttrs(node.a, true, !refusesAlign(slot.w, env));
      out.push(attrs ? { w: P, a: attrs, ch: [slot] } : { w: P, ch: [slot] });
    }
  }
  return out;
}

// 블록 자리(루트·블록 홀더의 속)의 자식들 — 문단·물건·컨테이너는 블록으로 서고 떠도는 인라인은 이웃끼리 모여 문단 하나로 감싸진다.
// Children of a block slot (the root or a block holder's content) — paragraphs, lumps, and containers stand as blocks; stray inline neighbors get wrapped together into one paragraph.
function blockChildren(nodes: readonly NabiNode[], env: SchemaEnv): NabiNode[] {
  const out: NabiNode[] = [];
  let buffer: NabiNode[] = [];
  const flush = (): void => {
    if (buffer.length === 0) return;
    const inline = inlineChildren(buffer, env);
    buffer = [];
    if (inline.length === 0) return;
    out.push({ w: P, ch: inline });
  };
  for (const node of unwrapUnknown(nodes, env)) {
    if (isElement(node) && node.w === P) {
      flush();
      out.push(...paragraph(node, env));
      continue;
    }
    if (isLump(node, env)) {
      // 맨몸 물건 — 래퍼문단을 입는다.
      // A bare lump — gets a wrapper paragraph put on.
      const wrapped = lumpNode(node, env);
      if (!wrapped) continue;
      flush();
      out.push({ w: P, ch: [wrapped] });
      continue;
    }
    if (isElement(node) && (env.blockHolders.has(node.w) || env.inlineHolders.has(node.w))) {
      flush();
      // 물건 아닌 구조 조각(행·칸·항목·제목) — 제자리 블록이다.
      // A structural piece that isn't a lump (row, cell, item, heading) — a block in its own right.
      out.push(blockNode(node, env));
      continue;
    }
    // 글자·라인·마크·모르는 타입 — 인라인으로 모은다.
    // Text, line, mark, or an unknown type — collected as inline.
    buffer.push(node);
  }
  flush();
  return out;
}

// --- _id — 결정적 유도 ----------------------------------------------------------------------

// data-key 로 그대로 나가도 안전한 글자만 받는다 — 밖에서 온 JSON 이 키를 마음대로 정하기 때문이다.
// Only accepts characters safe to emit as-is in data-key, since incoming JSON can set the key to anything.
const SAFE_ID = /^[A-Za-z0-9._~-]+$/;

function collectIds(nodes: readonly NabiNode[], seen: Map<string, number>): void {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (typeof node._id === 'string' && SAFE_ID.test(node._id)) {
      seen.set(node._id, (seen.get(node._id) ?? 0) + 1);
    }
    collectIds(node.ch, seen);
  }
}

// 기존 유효 _id 는 지키고(구조 공유 전제), 빈 자리는 경로에서 결정적으로 유도한다(hydrate 전제).
// Existing valid `_id`s are kept for structural sharing; empty ones are derived deterministically from path, for hydrate.
function assignIds(doc: readonly ElementNode[]): NabiDoc {
  const existing = new Map<string, number>();
  collectIds(doc, existing);
  const taken = new Set<string>();

  const claim = (node: ElementNode, path: string): string => {
    const id = node._id;
    if (typeof id === 'string' && SAFE_ID.test(id) && !taken.has(id)) return id;
    let derived = `n${path}`;
    if (existing.has(derived) || taken.has(derived)) {
      let bump = 1;
      while (existing.has(`${derived}~${bump}`) || taken.has(`${derived}~${bump}`)) bump += 1;
      derived = `${derived}~${bump}`;
    }
    return derived;
  };

  const walk = (node: ElementNode, path: string): ElementNode => {
    const id = claim(node, path);
    taken.add(id);
    const ch = node.ch.map((child, i) => (isElement(child) ? walk(child, `${path}.${i}`) : child));
    if (id === node._id && sameChildren(node.ch, ch)) return node;
    const next: { w: string; a?: Attrs; ch: readonly NabiNode[]; _id: string } = { w: node.w, ch, _id: id };
    if (node.a) next.a = node.a;
    return next;
  };

  return doc.map((node, i) => walk(node, String(i)));
}

// --- 문 -------------------------------------------------------------------------------------

// 나비트리 전체를 고친다 — 들어오는 것은 느슨한 노드 목록이어도 되고(맨몸 물건·떠도는 글자), 나가는 것은 불변식이 선 문단 배열이다. 문서가 통째로 비면 캐럿이 설 빈 문단 하나를 세운다.
// Repairs an entire nabi-tree — the input may be a loose node list (a bare lump, stray text); the output is a paragraph array with invariants established. An entirely empty doc gets one empty paragraph for the caret.
export function cocoon(input: readonly NabiNode[], env: SchemaEnv): NabiDoc {
  const blocks = blockChildren(input, env);
  // blockChildren은 블록만 내놓지만 타입을 좁혀 둔다.
  // blockChildren only ever emits blocks; this narrows the type accordingly.
  const doc = blocks.filter(isElement);
  const settled = doc.length > 0 ? doc : [{ w: P, ch: [] } as ElementNode];
  const withIds = assignIds(settled);
  // 아무것도 안 바뀌었으면 입력 배열 참조를 그대로 돌려준다 — 매 커맨드 호출이 공짜가 되는 길.
  // If nothing changed, the input array reference is returned as-is — the path that makes every command call free.
  if (withIds.length === input.length && withIds.every((node, i) => node === input[i])) {
    return input as NabiDoc;
  }
  return withIds;
}
