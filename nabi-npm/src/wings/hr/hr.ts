// 구분선 hr — 블록 단말이다. 속도 속성도 없어서 팩토리 선언 한 줄이 전부다.
// `attrs` 를 빈 벌로 두는 것이 곧 화이트리스트다 — 어떤 속성도 이 노드에 못 붙는다(repair 가 걷는다).
import { caretAt, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { boxObject, insertLump, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

const DIVIDER_NAME: LocaleText = { ko: '구분선', en: 'Divider', ja: '区切り線', zh: '分隔线', de: 'Trennlinie', fr: 'Séparateur', es: 'Separador', pt: 'Separador', ru: 'Разделитель', ar: 'فاصل', hi: 'विभाजक', bn: 'বিভাজক', ur: 'خط فاصل', id: 'Pembatas' };

const DIVIDER_CSS = `
.nabi-content hr { border: 0; border-block-start: 1px solid var(--nabi-line); margin-block: 1.2em; }
`;

const insertDivider: Command = (doc, sel, _args, env) => {
  const [start] = ordered(sel);
  const r = insertLump(doc, start, { w: 'hr', ch: [] }, env);
  return { doc: r.doc, selection: caretAt(r.caret) };
};

export const dividerWing: Wing = {
  ...boxObject({
    w: 'hr',
    attrs: {},
    button: {
      group: 'structure',
      svg: '<path d="M2 8h12"/>',
      label: DIVIDER_NAME,
      action: { kind: 'command', command: 'insertDivider' },
    },
    styles: DIVIDER_CSS,
  }),
  commands: { insertDivider },
  // `---` 뒤의 엔터 — 하이픈이 셋 이상이면 된다 (old 규격표).
  inputRules: [{ trigger: 'enter', pattern: /^-{3,}$/, run: () => ({ name: 'insertDivider' }) }],
};
