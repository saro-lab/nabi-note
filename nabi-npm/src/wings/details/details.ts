// 접기 details — 제목(고정 문단 하나) + 문단 배열, 펼침은 `o`(1/0). 제목은 늘 하나이고 맨 앞, 속은 안 빈다.
// A details block: a fixed title paragraph plus body paragraphs, open state in `o` (1/0) — always one title up front, body never empty.
import { P, isElement, isWrapper, type ElementNode, type NabiNode } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { DEFAULT_BUILDERS } from '../../html/index.js';
import { caretAt, isCollapsed, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { replaceAt } from '../../doc/index.js';
import { blockOwnerAt, blocksBoundaryEscape, exitWrapper } from '../../wing/ops.js';
import { type OnKey, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';
import { attachDetailsOpen } from './attach.js';

const SUMMARY = 'summary';

const DETAILS_NAME: LocaleText = {
  ko: '접기',
  en: 'Details',
  ja: '折りたたみ',
  zh: '折叠块',
  de: 'Klappbox',
  fr: 'Bloc dépliant',
  es: 'Bloque plegable',
  pt: 'Bloco recolhível',
  ru: 'Спойлер',
  ar: 'كتلة قابلة للطي',
  hi: 'फ़ोल्ड ब्लॉक',
  bn: 'ভাঁজযোগ্য ব্লক',
  ur: 'قابلِ تہہ بلاک',
  id: 'Blok lipat',
};

const DETAILS_ICON = 'details-details';

const DETAILS_CSS = `
.nabi-content details {
  border: 1px solid var(--nabi-line); border-radius: var(--nabi-radius, 6px); padding:.4em.8em;
}
.nabi-content details > summary { cursor: pointer; font-weight: 600; }
`;

function repairDetails(node: ElementNode): ElementNode {
  let head: ElementNode | null = null;
  const body: NabiNode[] = [];
  for (const child of node.ch) {
    if (isElement(child) && child.w === SUMMARY) {
      if (head === null) head = child;
      else body.push({ w: P, ch: child.ch }); // 제목이 둘이면 뒤엣것은 문단으로 내려온다
      continue;
    }
    body.push(child);
  }
  if (body.length === 0) body.push({ w: P, ch: [] }); // 캐럿의 집 하나는 늘 있어야 한다
  const ch: NabiNode[] = [head ?? { w: SUMMARY, ch: [] }, ...body];
  const same = ch.length === node.ch.length && ch.every((child, i) => child === node.ch[i]);
  if (same) return node;
  return {
    w: node.w,
    ...(node.a ? { a: node.a } : {}),
    ch,
    ...(node._id !== undefined ? { _id: node._id } : {}),
  };
}

// 감싸기·풀기 — 풀면 제목이 문단이 되어 앞에 선다(글이 사라지는 자리를 안 만든다).
// Wrap/unwrap — unwrapping turns the title into a plain leading paragraph, so no text is ever lost.
const toggleDetails: Command = (doc, sel, _args, env) => {
  const [start, end] = ordered(sel);
  const a = (start.path[0] ?? 0) as number;
  const b = (end.path[0] ?? a) as number;
  const covered = doc.slice(a, b + 1);
  if (covered.length === 0) return null;

  const boxIn = (block: ElementNode): ElementNode | null => {
    if (!isWrapper(block, env)) return null;
    const inner = block.ch[0];
    return isElement(inner) && inner.w === 'details' ? inner : null;
  };

  if (covered.every((block) => boxIn(block) !== null)) {
    const blocks: ElementNode[] = [];
    for (const block of covered) {
      const box = boxIn(block) as ElementNode;
      for (const child of box.ch) {
        if (!isElement(child)) continue;
        blocks.push(child.w === SUMMARY ? { w: P, ch: child.ch } : child);
      }
    }
    const freed = blocks.length > 0 ? blocks : [{ w: P, ch: [] } as ElementNode];
    const next = [...doc.slice(0, a), ...freed, ...doc.slice(b + 1)];
    return { doc: next, selection: caretAt({ path: [a], offset: 0 }) };
  }

  const box: ElementNode = { w: 'details', a: { o: 1 }, ch: [{ w: SUMMARY, ch: [] }, ...covered] };
  const next = [...doc.slice(0, a), { w: P, ch: [box] } as ElementNode, ...doc.slice(b + 1)];
  // 캐럿은 제목으로 — 새 접기에서 제일 먼저 쓰는 것이 제목이다.
  // The caret lands in the title — it's the first thing you'd write in a fresh details block.
  return { doc: next, selection: caretAt({ path: [a, 0, 0], offset: 0 }) };
};

// 저장될 때 펼쳐질지 접힐지를 정한다 — 편집 화면은 늘 펼쳐 두고, 이 값은 저장 HTML의 것이다.
// Sets the open state the saved HTML will carry — the editor always shows it expanded regardless.
//
// 인자를 안 주면 토글, 주면 그 값으로 정한다 — 상황 줄의 단추 둘이 자기 상태를 각각 말하려면 필요하다.
// No argument toggles; a given value sets it directly — needed so each context-toolbar button can state its own side.
const setDetailsOpen: Command = (doc, sel, args) => {
  const [start] = ordered(sel);
  const owner = blockOwnerAt(doc, start.path, 'details');
  const box = owner?.node;
  if (!owner || !box) return null;
  const raw = args['open'];
  const now = box.a?.['o'] === 1;
  const want = raw === undefined ? !now : raw === 1 || raw === '1' || raw === true;
  if (want === now) return null; // 같은 값 — 무변화 침묵
  const a = { ...(box.a ?? {}) };
  if (!want) delete a['o'];
  else a['o'] = 1;
  const next: ElementNode = {
    w: 'details',
    ...(Object.keys(a).length > 0 ? { a } : {}),
    ch: box.ch,
    ...(box._id !== undefined ? { _id: box._id } : {}),
  };
  return { doc: replaceAt(doc, owner.path, [next]), selection: sel };
};

// summary는 details의 부품(parts)이라 캐럿이 제목 속일 때 `owner`는 details가 아니라 summary 자신이다.
// summary is registered as details' part, so `owner` is summary itself when the caret sits in the title, not details.
//
// 제목은 늘 details의 첫 자식이라 offset 0의 위쪽 방향키만 탈출 대상 — 아래는 몸 첫 문단으로 가는 보통 걸음이다.
// Only up-arrow at offset 0 escapes (the title is always child 0); down-arrow is an ordinary step into the body.
const onKey: OnKey = (intent, doc, sel, env, owner) => {
  if (owner.node.w === 'summary') {
    if (intent.key !== 'arrow' || intent.dir !== 'up') return null;
    if (!isCollapsed(sel) || sel.focus.offset !== 0) return null;
    return exitWrapper(doc, owner.path.slice(0, -1), 'up');
  }
  return blocksBoundaryEscape(intent, doc, sel, env, owner);
};

export const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  basic: true,
  holds: 'blocks',
  boolAttrs: ['o'],
  parts: { [SUMMARY]: { holds: 'inline' } },
  toHtml: DEFAULT_BUILDERS['details'],
  partHtml: { [SUMMARY]: DEFAULT_BUILDERS[SUMMARY] },
  repair: repairDetails,
  onKey,
  currentValue: (node) => (node.w === 'details' ? (node.a?.['o'] === 1 ? 'open' : 'shut') : undefined),
  commands: { toggleDetails, setDetailsOpen },
  // 삼각형을 누른 것이 곧 저장될 모습 — 예전 상황 줄 단추 둘이 하던 일을 이것이 받는다(attach.ts).
  // Clicking the triangle sets the saved state directly, replacing what two old context-toolbar buttons did (attach.ts).
  attach: attachDetailsOpen,
  button: {
    group: 'container',
    shortcut: 'D',
    icon: DETAILS_ICON,
    label: DETAILS_NAME,
    action: { kind: 'command', command: 'toggleDetails' },
  },
  // 상황 줄이 없다 — 예전 단추 둘은 화면이 저장값을 안 그리던 시절의 대체 수단이었다. 이제 같은 말의 중복이다.
  // No context toolbar — the old two buttons only existed because the screen didn't reflect the saved state; now it does.
  styles: DETAILS_CSS,
};

$markBuiltinAttrOwner(detailsWing, ['details', 'summary']);
