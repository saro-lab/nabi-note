// diff 데모 — ailog/todo/260825_001 8번 항목의 배선.
//
// "대조 상태"는 에디터 API가 아니라 이 데모의 평범한 변수 하나다: `getJson()`이 낸,
// 이미 저장용으로 정제된 나비트리 JSON을 그대로 들고 있을 뿐이다(260825_001 1절) — diff
// 쪽은 그 값이 어디서 왔는지 모르고, 그래서 살아있는 에디터 없이도 임의의 두 JSON을 받을 수 있다.
//
// 비교는 **온디맨드**다 — 상시 실시간 갱신이 아니라, 비교 버튼을 누를 때마다 그 시점의
// before/after 로 새로 그린다(260825_001 8번).
import { standEditor, type EditorHosts } from './editor.js';
import { mountDiff, type DiffMount } from '../src/diff/index.js';

const el = <T extends HTMLElement>(id: string): T => {
  const found = document.getElementById(id);
  if (!found) throw new Error(`diff demo: #${id} is missing`);
  return found as T;
};

// 10줄 이하 — 이 데모의 목적은 서식이 아니라 diff 배선을 보는 것이다.
const START: unknown[] = [
  { w: 'p', a: { h: 1 }, ch: ['Diff demo'] },
  { w: 'p', ch: ['이 문단을 고쳐 보세요.'] },
  { w: 'p', ch: [{ w: 'b', ch: ['굵게'] }, ' 같은 서식도 됩니다.'] },
  { w: 'p', ch: ['셋째 줄입니다.'] },
];

// tools 를 안 준다 — 보기 도구(미리보기·전체화면) 없이 서서 툴바 횡스크롤을 그대로 본다.
const hosts: EditorHosts = {
  root: el('app'),
  chrome: el('chrome'),
  toolbar: el('toolbar'),
  context: el('context'),
  content: el('content'),
};

const jsonArea = el<HTMLTextAreaElement>('json');
const baselineStatus = el('baseline-status');
const markButton = el<HTMLButtonElement>('mark-baseline');
const diffButton = el<HTMLButtonElement>('show-diff');
const diffSection = el('diff-section');
const diffRoot = el('diff-root');

const editor = standEditor(hosts, { doc: START, locale: 'en' });

// 대조 상태 — 처음엔 없다("바뀐 게 없다"와 "아직 안 정했다"를 가르려고 null 로 둔다).
let baseline: unknown = null;
let diffMount: DiffMount | null = null;

const refresh = (): void => {
  jsonArea.value = JSON.stringify(editor.nabi.getJson(), null, 1);
};
editor.nabi.onChange(refresh);
refresh();

markButton.addEventListener('click', () => {
  baseline = editor.nabi.getJson();
  baselineStatus.textContent = `대조 상태 저장됨 — ${new Date().toLocaleTimeString()}`;
});

diffButton.addEventListener('click', () => {
  if (baseline === null) {
    baselineStatus.textContent = '먼저 위 버튼으로 대조 상태를 저장하세요.';
    return;
  }
  diffSection.hidden = false;
  if (diffMount) {
    diffMount.update(baseline, editor.nabi.getJson());
  } else {
    diffMount = mountDiff({
      root: diffRoot,
      before: baseline,
      after: editor.nabi.getJson(),
      registry: editor.registry,
      allowLocalUrls: true,
      locale: 'ko',
    });
  }
  diffSection.scrollIntoView({ block: 'nearest' });
});
