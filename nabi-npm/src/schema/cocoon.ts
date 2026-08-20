// 고치(cocoon) — 어떤 길로 들어온 나비트리든 여기를 지나면 불변식이 선다 (: 매 커맨드).
// 루트는 문단 배열 — 떠도는 인라인은 문단으로 모이고, 맨몸 물건은 래퍼문단을 입는다.
// 물건과 글이 섞인 문단은 쪼개진다. 이미지 둘이 든 문단은 래퍼문단 둘이 된다.
// 래퍼문단의 attrs 는 정렬(a)만 남는다 (Q11). 글 문단의 attrs 는 h·a·dc 화이트리스트다.
// 빈 문단은 걷지 않는다 — 공백은 내용이다 (엔터 연타).
// 타입별 복구(표 격자 등)는 wing 의 repair 훅에 위임한다 — cocoon 은 호출 자리만 갖는다.
// 모든 엘리먼트에 유일한 _id 를 결정적으로 채운다 — 같은 JSON 은 같은 키를 얻는다 (hydrate).
// 바뀐 것이 없으면 원래 참조를 그대로 돌려준다 — 매 커맨드 위에서도 구조 공유로 싸게 돈다.
import { BR, P } from './reserved.js';
import { isElement, type Attrs, type AttrValue, type ElementNode, type NabiDoc, type NabiNode } from './types.js';
import { isLump, type SchemaEnv } from './env.js';

// 정렬 값은 첫 글자 표기 하나로 통일한다.
const ALIGNS: ReadonlySet<string> = new Set(['l', 'c', 'r']);

// --- attrs ---------------------------------------------------------------------------------

function sameAttrs(a: Attrs | undefined, b: Attrs | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((key) => a[key] === b[key]);
}

// 글 문단이 입을 수 있는 속성은 제목(h: 1~6)·정렬(a: l/c/r)·드롭캡(dc: 1) 셋뿐이고
// 래퍼문단은 그중 정렬만이다 (·Q11). 이름별 검증이 곧 화이트리스트다.
function paragraphAttrs(a: Attrs | undefined, wrapper: boolean): Attrs | undefined {
  if (!a) return undefined;
  const out: Record<string, AttrValue> = {};
  for (const [key, value] of Object.entries(a)) {
    if (key === 'a' && typeof value === 'string' && ALIGNS.has(value)) out['a'] = value;
    if (wrapper) continue;
    if (key === 'h' && typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6) out['h'] = value;
    if (key === 'dc' && value === 1) out['dc'] = 1;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// wing 노드의 attrs 는 일반 규칙만 본다 — 값은 문자열이거나 유한한 숫자, `_` 접두 키는 내부
// 전용이라 걷고, 불리언 attr 는 숫자 1 만 남는다. 이름별 화이트리스트는 그 wing 의 몫이다(07).
function wingAttrs(a: Attrs | undefined, env: SchemaEnv): Attrs | undefined {
  if (!a) return undefined;
  const out: Record<string, AttrValue> = {};
  for (const [key, value] of Object.entries(a)) {
    if (key.startsWith('_')) continue;
    if (env.boolAttrs.has(key)) {
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

// --- 인라인 정리 ----------------------------------------------------------------------------

// 문단·마크·인라인 홀더의 속을 고른다: 빈 글자는 걷고, 이웃한 글자는 잇고, 라인(br)은 속을
// 비우고, 마크는 속으로 내려간다. 물건이 인라인 자리에 잘못 서 있으면 그대로 두지 않고
// 걷어낸다 — 그 물건의 자리는 문단 층이지 글자 사이가 아니다 (허용 규칙의 정밀한 판정은 07).
function inlineChildren(nodes: readonly NabiNode[], env: SchemaEnv): NabiNode[] {
  const out: NabiNode[] = [];
  const push = (node: NabiNode): void => {
    if (typeof node === 'string') {
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
    if (env.lumps.has(node.w)) continue; // 인라인 자리의 물건 — 설 수 없는 자리라 걷는다
    if (node.w === P) {
      // 문단 속 문단 — 속만 이 자리로 푼다 (모양 자체가 불가능하므로 껍데기를 벗긴다).
      for (const inner of inlineChildren(node.ch, env)) push(inner);
      continue;
    }
    // 마크 하나 — 속을 먼저 고치고, 그 wing 의 repair 에게 값을 묻는다.
    //
    // **여기가 JSON 입구의 값 검사 자리다**. 예전에는 마크에 repair 를 안 태워서
    // 같은 공격이 길에 따라 다르게 끝났다: HTML 로 들어온 `a href="javascript:"` 는 껍데기가
    // 벗겨졌는데, JSON 으로 들어온 같은 것은 트리에 그대로 남았다. 출력은 render 가 막으니
    // 안 터졌지만 **저장값이 오염된 채** 백엔드로 갔고, 그 JSON 을 읽는 다른 렌더러에서 터진다.
    // repair 가 null 을 답하면 껍데기를 벗기고 속을 이 자리로 올린다 — HTML 입구와 같은 걸음이다.
    const fixed = rebuild(node, node.w, wingAttrs(node.a, env), inlineChildren(node.ch, env));
    const repair = env.repair?.[fixed.w];
    const kept = repair ? repair(fixed) : fixed;
    if (kept === null) {
      for (const inner of fixed.ch) push(inner);
      continue;
    }
    push(kept);
  }
  return out;
}

// --- 블록 정리 ------------------------------------------------------------------------------

// 물건 하나를 고친다 — 단말은 속을 비우고, 컨테이너는 속을 블록 규칙으로 고친 뒤 repair 훅에 위임한다.
//
// **null 은 "이 물건은 없던 것으로 쳐라" 다.** 못 믿을 주소를 문 그림이 그 자리다 — HTML 입구는
// 그런 그림을 아예 안 들이는데(`import.ts`), JSON 입구만 껍데기를 남기면 두 문의 답이 갈린다.
// 물건은 속이 없거나 제 안에서 끝나므로, 여기서는 벗기지 않고 **통째로 뺀다**(마크와 다른 점).
function lumpNode(node: ElementNode, env: SchemaEnv): ElementNode | null {
  const a = wingAttrs(node.a, env);
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
  const repair = env.repair?.[next.w];
  return repair ? repair(next) : next;
}

// p 가 아닌 블록 노드 하나 — 갈래(단말/블록 홀더/인라인 홀더)에 따라 속을 고치고 repair 를 태운다.
function blockNode(node: ElementNode, env: SchemaEnv): ElementNode {
  const a = wingAttrs(node.a, env);
  let next: ElementNode;
  if (env.voids.has(node.w)) {
    next = rebuild(node, node.w, a, node.ch.length === 0 ? node.ch : []);
  } else if (env.blockHolders.has(node.w)) {
    next = rebuild(node, node.w, a, blockChildren(node.ch, env));
  } else if (env.inlineHolders.has(node.w)) {
    next = rebuild(node, node.w, a, inlineChildren(node.ch, env));
  } else {
    // 모르는 타입 — 속을 인라인으로만 고르고 그대로 둔다. 걸러내는 것은 wing 계약(07)의 몫이다.
    next = rebuild(node, node.w, a, inlineChildren(node.ch, env));
  }
  const repair = env.repair?.[next.w];
  // 블록 자리에서는 벗기지 않는다 — 껍데기만 벗기면 속의 블록들이 갈 곳을 잃는다(계약 주석).
  return repair ? (repair(next) ?? next) : next;
}

// 문단 하나를 문단 목록으로 — 물건이 섞여 있으면 쪼개지고, 물건 하나뿐이면 래퍼문단이 된다.
function paragraph(node: ElementNode, env: SchemaEnv): ElementNode[] {
  // 문단 바로 밑에서 물건과 인라인을 가른다 — 문단 속 문단은 인라인 정리에서 풀린다.
  const lumps: ElementNode[] = [];
  const slots: (ElementNode | NabiNode[])[] = [];
  let buffer: NabiNode[] = [];
  const flush = (): void => {
    if (buffer.length > 0) slots.push(buffer);
    buffer = [];
  };
  for (const child of node.ch) {
    if (isLump(child, env)) {
      flush();
      lumps.push(child);
      slots.push(child);
      continue;
    }
    buffer.push(child);
  }
  flush();

  // 물건이 없다 — 글 문단 하나. 빈 문단도 그대로 선다 (공백은 내용이다).
  if (lumps.length === 0) {
    return [rebuild(node, P, paragraphAttrs(node.a, false), inlineChildren(node.ch, env))];
  }

  // 물건 하나에 글이 없다 — 이미 래퍼문단이다. attrs 만 정렬로 좁힌다.
  if (lumps.length === 1 && slots.length === 1) {
    // 물건이 거절되면 빈 문단만 남는다 — 껍데기 없는 자리에 캐럿이 설 곳은 있어야 한다.
    const only = lumpNode(lumps[0] as ElementNode, env);
    return [rebuild(node, P, paragraphAttrs(node.a, true), only ? [only] : [])];
  }

  // 섞였다 — 쪼갠다. 글 조각은 글 문단으로(속성 화이트리스트), 물건마다 래퍼문단이 선다(정렬만 상속).
  const out: ElementNode[] = [];
  for (const slot of slots) {
    if (Array.isArray(slot)) {
      const inline = inlineChildren(slot, env);
      if (inline.length === 0) continue; // 쪼개다 나온 빈 조각 — 쓴 적 없는 빈 문단은 안 만든다
      const attrs = paragraphAttrs(node.a, false);
      out.push(attrs ? { w: P, a: attrs, ch: inline } : { w: P, ch: inline });
    } else {
      const attrs = paragraphAttrs(node.a, true);
      const wrapped = lumpNode(slot, env);
      if (!wrapped) continue; // 거절된 물건 — 쓴 적 없는 빈 문단을 대신 세우지 않는다
      out.push(attrs ? { w: P, a: attrs, ch: [wrapped] } : { w: P, ch: [wrapped] });
    }
  }
  return out;
}

// 블록 자리(루트·블록 홀더의 속)의 자식들 — 문단·물건·컨테이너는 블록으로 서고
// 떠도는 인라인은 이웃끼리 모여 문단 하나로 감싸진다.
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
  for (const node of nodes) {
    if (isElement(node) && node.w === P) {
      flush();
      out.push(...paragraph(node, env));
      continue;
    }
    if (isLump(node, env)) {
      flush();
      const wrapped = lumpNode(node, env); // 맨몸 물건 — 래퍼문단을 입는다
      if (wrapped) out.push({ w: P, ch: [wrapped] });
      continue;
    }
    if (isElement(node) && (env.blockHolders.has(node.w) || env.inlineHolders.has(node.w))) {
      flush();
      out.push(blockNode(node, env)); // 물건 아닌 구조 조각(행·칸·항목·제목) — 제자리 블록이다
      continue;
    }
    buffer.push(node); // 글자·라인·마크·모르는 타입 — 인라인으로 모은다
  }
  flush();
  return out;
}

// --- _id — 결정적 유도 ----------------------------------------------------------------------

// data-key 로 그대로 나가도 안전한 글자만 받는다 — 밖에서 온 JSON 이 키를 마음대로 정하기 때문이다.
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

// 모든 엘리먼트에 유일한 _id 를 채운다. 이미 실린 유효한 키는 지키고(안정성 — 부분 재그리기
// 구조 공유의 전제), 빈 자리는 경로에서 유도한다(결정성 — 같은 JSON 은 같은 키, hydrate).
// 유도 키가 이미 쓰인 이름과 부딪히면 `~n` 을 붙여 비켜 간다 — 걷는 순서가 같으므로 이것도 결정적이다.
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

// 나비트리 전체를 고친다. 들어오는 것은 느슨한 노드 목록이어도 되고(맨몸 물건·떠도는 글자)
// 나가는 것은 불변식이 선 문단 배열이다. 문서가 통째로 비면 캐럿이 설 빈 문단 하나를 세운다.
export function cocoon(input: readonly NabiNode[], env: SchemaEnv): NabiDoc {
  const blocks = blockChildren(input, env);
  const doc = blocks.filter(isElement); // blockChildren 은 블록만 내놓지만 타입을 좁혀 둔다
  const settled = doc.length > 0 ? doc : [{ w: P, ch: [] } as ElementNode];
  const withIds = assignIds(settled);
  // 아무것도 안 바뀌었으면 입력 배열 참조를 그대로 돌려준다 — 매 커맨드 호출이 공짜가 되는 길.
  if (withIds.length === input.length && withIds.every((node, i) => node === input[i])) {
    return input as NabiDoc;
  }
  return withIds;
}
