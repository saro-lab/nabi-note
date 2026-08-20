// 접기 details — 제목(summary: 문단 하나 고정, 엔터는 라인) + 문단 배열, 펼침은 `o`(1/0).
// 자기 속의 복구는 자기가 안다: 제목은 언제나 하나이고 맨 앞이며, 속은 비지 않는다
// (캐럿이 설 자리가 없는 접기는 못 만든다). 남는 제목은 지우지 않고 문단으로 내려온다.
import { P, isElement, isWrapper, type ElementNode, type NabiNode } from '../../schema/index.js';
import { DEFAULT_BUILDERS } from '../../html/index.js';
import { caretAt, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { replaceAt } from '../../doc/index.js';
import { topNodeAt, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';
import { attachDetailsOpen } from './attach.js';

const SUMMARY = 'summary';

// 이름들 — old 사전 이식(14 로케일).
const DETAILS_NAME: LocaleText = { ko: '접기', en: 'Details', ja: '折りたたみ', zh: '折叠块', de: 'Klappbox', fr: 'Bloc dépliant', es: 'Bloque plegable', pt: 'Bloco recolhível', ru: 'Спойлер', ar: 'كتلة قابلة للطي', hi: 'फ़ोल्ड ब्लॉक', bn: 'ভাঁজযোগ্য ব্লক', ur: 'قابلِ تہہ بلاک', id: 'Blok lipat' };

const DETAILS_ICON =
  '<g transform="translate(8 8) scale(1.0185) translate(-8 -8)" stroke-width="1.375">' +
  '<path d="M3.4 2.6h5.4l3.8 3.8v7H3.4z"/><path d="M8.8 2.6v3.8h3.8"/></g>';

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
      else body.push({ w: P, ch: child.ch }); // 제목이 둘 — 뒤엣것은 문단으로 내려온다
      continue;
    }
    body.push(child);
  }
  if (body.length === 0) body.push({ w: P, ch: [] }); // 캐럿의 집 하나는 늘 있다
  const ch: NabiNode[] = [head ?? { w: SUMMARY, ch: [] },...body];
  const same = ch.length === node.ch.length && ch.every((child, i) => child === node.ch[i]);
  if (same) return node;
  return {
    w: node.w,
...(node.a ? { a: node.a } : {}),
    ch,
...(node._id !== undefined ? { _id: node._id } : {}),
  };
}

// 감싸기·풀기 — 푼 제목은 문단이 되어 앞에 선다 (글이 사라지는 자리를 안 만든다).
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
    const next = [...doc.slice(0, a),...freed,...doc.slice(b + 1)];
    return { doc: next, selection: caretAt({ path: [a], offset: 0 }) };
  }

  const box: ElementNode = { w: 'details', a: { o: 1 }, ch: [{ w: SUMMARY, ch: [] },...covered] };
  const next = [...doc.slice(0, a), { w: P, ch: [box] } as ElementNode,...doc.slice(b + 1)];
  // 캐럿은 제목으로 — 새 접기에서 제일 먼저 쓰는 것이 제목이다.
  return { doc: next, selection: caretAt({ path: [a, 0, 0], offset: 0 }) };
};

// 저장될 때의 펼침 상태 하나를 뒤집는다 — 캐럿이 든 접기가 대상이다.
// (편집기 화면에서는 늘 펼쳐 둔다: 접힌 속에는 캐럿이 못 들어간다. 이 값은 **저장 HTML** 의 것이다.)
// **저장될 때 펼쳐져 있을지 접혀 있을지**를 정한다 — 편집 화면에서는 늘 펼쳐 둔다(접힌 속에는
// 캐럿이 못 들어간다). 인자를 안 주면 토글이고, 주면 그 값으로 정한다: 상황 줄의 두 단추가
// 각자 자기 상태를 말하려면 "정하기"가 있어야 한다(토글 하나면 지금 어느 쪽인지 단추가 못 말한다).
const setDetailsOpen: Command = (doc, sel, args) => {
  const [start] = ordered(sel);
  const top = topNodeAt(doc, start.path);
  const box = top?.ch[0];
  if (!top || box === undefined || !isElement(box) || box.w !== 'details') return null;
  const raw = args['open'];
  const now = box.a?.['o'] === 1;
  const want = raw === undefined ? !now : raw === 1 || raw === '1' || raw === true;
  if (want === now) return null; // 같은 값 — 무변화 침묵
  const a = {...(box.a ?? {}) };
  if (!want) delete a['o'];
  else a['o'] = 1;
  const next: ElementNode = {
    w: 'details',
...(Object.keys(a).length > 0 ? { a } : {}),
    ch: box.ch,
...(box._id !== undefined ? { _id: box._id } : {}),
  };
  return { doc: replaceAt(doc, [start.path[0] as number, 0], [next]), selection: sel };
};

export const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],
  parts: { [SUMMARY]: { holds: 'inline' } },
  toHtml: DEFAULT_BUILDERS['details'],
  partHtml: { [SUMMARY]: DEFAULT_BUILDERS[SUMMARY] },
  repair: repairDetails,
  // 눌림 표시 — 저장될 때 펼쳐져 있는가('open' 토큰).
  currentValue: (node) => (node.w === 'details' ? (node.a?.['o'] === 1 ? 'open' : 'shut') : undefined),
  commands: { toggleDetails, setDetailsOpen },
  // 삼각형을 누른 것이 곧 저장될 모습이다 — 상황 줄 단추 둘이 하던 일을 이것이 받는다 (attach.ts).
  attach: attachDetailsOpen,
  button: {
    group: 'container',
    shortcut: 'D',
    svg: DETAILS_ICON,
    label: DETAILS_NAME,
    action: { kind: 'command', command: 'toggleDetails' },
  },
  // **상황 줄이 없다.** 여기 있던 단추 둘(`펼친 채로 저장`·`접은 채로 저장`)은 화면이 저장값을
  // 안 그려서 필요했던 것이다 — 편집 중에는 늘 펼쳐 두었으니 지금 어느 쪽으로 저장될지 화면이
  // 말을 못 했다. 이제 화면이 저장값 그대로 그리고 삼각형이 그것을 바꾸므로, 같은 말을 두 번
  // 하는 자리가 됐다.
  styles: DETAILS_CSS,
};
