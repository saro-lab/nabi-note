import { standEditor } from './editor.js';
import { mountDiff } from '../src/diff/index.js';
import { attachViewer } from '../src/viewer/index.js';
import type { ElementNode, NabiDoc } from '../src/index.js';

const el = (id: string): HTMLElement => document.getElementById(id)!;
const p = (text: string): ElementNode => ({ w: 'p', ch: [text] });
const body = [
  p(
    '숲길 끝에 작은 도서관이 있습니다. 책을 읽는 사람도, 잠시 쉬어 가는 사람도 같은 문을 지나 들어옵니다. 오른쪽의 플로트 영역에는 방문 전에 알아두면 좋은 정보를 모았습니다. 이 본문은 영역 밖의 독립된 문단이며, 영역 옆으로 자연스럽게 흐릅니다.',
  ),
  p(
    '오전에는 창가로 햇빛이 깊이 들어옵니다. 큰 테이블에는 여행 지도와 식물 도감이 펼쳐져 있고, 안쪽에는 소설과 그림책이 놓여 있습니다. 정해진 순서 없이 서가를 둘러보다가 마음에 드는 자리에 앉으면 됩니다. 글의 길이가 늘어나도 플로트 영역에 담긴 정보는 본문과 함께 읽을 수 있습니다.',
  ),
  p(
    '방문객들은 책에서 찾은 문장을 작은 종이에 적어 서로 나눕니다. 익숙한 문장이 새로운 장소에서 다르게 읽히기도 합니다. 도서관의 하루는 이런 작은 발견으로 채워집니다. 이 문단이 영역의 끝을 지나면, 남은 줄은 다시 본문의 전체 너비를 사용합니다.',
  ),
  p(
    '밖으로 나오면 짧은 산책로가 이어집니다. 나무 아래 의자에 앉아 조금 더 읽어도 좋고, 오늘 고른 책을 다음 사람에게 추천해도 좋습니다. 플로트 영역의 너비나 방향을 바꾸면서 문단이 어떻게 이어지는지 살펴보세요.',
  ),
  { w: 'p', a: { h: 2 }, ch: ['다음 이야기'] } as ElementNode,
  p(
    '제목과 표, 코드, 구분선도 플로트 영역 옆으로 이어집니다. 영역을 해제하면 안에 있던 내용은 이 본문처럼 일반 블록으로 남습니다.',
  ),
];

function sample(side: string, w: number, updated: boolean): NabiDoc {
  return [
    { w: 'p', a: { h: 2 }, ch: ['숲의 작은 도서관'] },
    {
      w: 'p',
      ch: [
        {
          w: 'float',
          a: { side, w },
          ch: [
            { w: 'p', ch: [{ w: 'b', ch: ['방문 안내'] }] },
            p('누구나 책과 함께 쉬어 갈 수 있는 곳입니다. 이 영역 안의 문단과 표를 직접 편집할 수 있습니다.'),
            {
              w: 'p',
              ch: [
                {
                  w: 'table',
                  ch: [
                    {
                      w: 'tr',
                      ch: [
                        { w: 'td', ch: [p('운영 시간')] },
                        { w: 'td', ch: [p('10:00–18:00')] },
                      ],
                    },
                    {
                      w: 'tr',
                      ch: [
                        { w: 'td', ch: [p('쉬는 날')] },
                        { w: 'td', ch: [p(updated ? '매주 월요일' : '매주 화요일')] },
                      ],
                    },
                  ],
                },
              ],
            },
            p('입장료는 없습니다. 음료는 입구의 작은 탁자에서 마실 수 있습니다.'),
          ],
        },
      ],
    },
    ...body,
  ];
}

let baseline: unknown = sample('left', 30, false);
const editor = standEditor(
  {
    root: el('app'),
    chrome: el('chrome'),
    toolbar: el('toolbar'),
    context: el('context'),
    tools: el('tools'),
    content: el('content'),
  },
  { locale: 'ko', doc: sample('right', 40, true), bare: true },
);
const comparison = mountDiff({
  root: el('comparison'),
  before: baseline,
  after: editor.nabi.getJson(),
  registry: editor.registry,
  locale: 'ko',
});
let reader = attachViewer(el('reader'), { locale: 'ko' });
const refresh = (): void => {
  reader.unmount();
  el('reader').innerHTML = editor.nabi.getHtml();
  reader = attachViewer(el('reader'), { locale: 'ko' });
  comparison.update(baseline, editor.nabi.getJson());
};
editor.nabi.onChange((change) => {
  if (change.doc) refresh();
});
refresh();

el('narrow').addEventListener('click', () => {
  const narrow = document.body.classList.toggle('narrow');
  el('narrow').setAttribute('aria-pressed', String(narrow));
});
el('theme').addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  el('theme').setAttribute('aria-pressed', String(dark));
});
el('reset').addEventListener('click', () => {
  baseline = sample('left', 30, false);
  editor.nabi.setJson(sample('right', 40, true));
  el('baseline-label').textContent =
    '왼쪽 30%였던 예시와 현재 문서를 비교합니다. 다음 문단은 영역 아래에서 시작합니다.';
});
el('baseline').addEventListener('click', () => {
  baseline = editor.nabi.getJson();
  el('baseline-label').textContent = '저장한 비교 기준과 현재 문서를 비교합니다.';
  refresh();
});
Object.assign(globalThis, { nabi: editor.nabi, floatDemo: { ...editor, refresh } });
