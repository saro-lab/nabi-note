import { createNabi } from '../src/editor/index.js';
import { createNabiWith, makeRegistry, nabiOptionsOf, routeKey, type Wing } from '../src/wing/index.js';
import { defaultWings, floatWing, wings } from '../src/wings/index.js';
import { positionExists } from '../src/doc/index.js';
import { renderStoredHtml, renderStoredEditorHtml } from '../src/ssr.js';
import { diffDocs } from '../src/diff/index.js';
import type { ElementNode, NabiDoc } from '../src/schema/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

const registry = makeRegistry(defaultWings);
const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const float = (ch: readonly ElementNode[] = [p('안쪽')], side = 'right', w = 40): ElementNode => ({
  w: 'p',
  ch: [{ w: 'float', a: { side, w }, ch }],
});
const make = (doc: unknown = [p()]) => createNabi(nabiOptionsOf(registry, { doc, parseHtml: tinyHtml }));
const select = (nabi: ReturnType<typeof make>, path: readonly number[], offset = 0): boolean =>
  nabi.select({ anchor: { path, offset }, focus: { path, offset } });
const json = (nabi: ReturnType<typeof make>): NabiDoc => nabi.getJson() as NabiDoc;

{
  const nabi = make();
  ok('빈 문단에 삽입', nabi.applyCommand('insertFloat'));
  eq('기본 오른쪽 40%', json(nabi), [float([p()])]);
  eq('캐럿은 영역 내부', nabi.getSelection().focus.path, [0, 0, 0]);
  ok('중첩 삽입 거절', !nabi.applyCommand('insertFloat'));
  ok('내부 입력', nabi.applyCommand('insertText', { text: '직접 편집' }));
  ok('undo', nabi.undo());
  eq('undo로 내용만 복원', json(nabi), [float([p()])]);
  ok('redo', nabi.redo());
  eq('redo 내용', json(nabi), [float([p('직접 편집')])]);
}
{
  const nabi = make([p('첫 문단'), p('둘째'), p('본문')]);
  nabi.select({ anchor: { path: [1], offset: 2 }, focus: { path: [0], offset: 1 } });
  ok('역방향 범위 감싸기', nabi.applyCommand('insertFloat', { side: 'left', w: 30 }));
  eq('선택 문단 보존', json(nabi), [float([p('첫 문단'), p('둘째')], 'left', 30), p('본문')]);
  ok('내용을 남기고 해제', nabi.applyCommand('unwrapFloat'));
  eq('해제한 문단 순서', json(nabi), [p('첫 문단'), p('둘째'), p('본문')]);
  ok('해제 undo', nabi.undo());
  ok('해제 undo 선택', positionExists(json(nabi), nabi.getSelection().focus, registry.env));
}
{
  const nabi = make([float(), p('본문')]);
  select(nabi, [0, 0, 0]);
  for (const w of [20, 30, 40, 50]) {
    nabi.applyCommand('setFloatWidth', { w });
    eq(`최대 너비 ${w}`, (json(nabi)[0]?.ch[0] as ElementNode).a?.['w'], w);
  }
  const before = nabi.getJson();
  for (const w of [0, 19, 35, 51, 100, Infinity, NaN, '40%', '40; color:red', null, {}])
    ok(`잘못된 너비 ${String(w)}`, !nabi.applyCommand('setFloatWidth', { w }));
  eq('잘못된 입력으로 내용 불변', nabi.getJson(), before);
  ok('왼쪽으로 변경', nabi.applyCommand('setFloatSide', { side: 'left' }));
  ok('같은 방향은 무변화', !nabi.applyCommand('setFloatSide', { side: 'left' }));
  ok('잘못된 방향 거절', !nabi.applyCommand('setFloatSide', { side: 'center' }));
  ok('방향 undo', nabi.undo());
  eq('방향 복원', (json(nabi)[0]?.ch[0] as ElementNode).a?.['side'], 'right');
}
for (const [command, args, expected] of [
  ['insertImage', { src: 'https://example.com/photo.png' }, 'img'],
  ['commitUpload', { items: [{ kind: 'image', uri: 'https://example.com/upload.png', name: 'upload.png' }] }, 'img'],
  ['insertTable', { rows: 2, cols: 2 }, 'table'],
  ['insertDivider', {}, 'hr'],
  ['toggleQuote', {}, 'quote'],
  ['toggleDetails', {}, 'details'],
  ['toggleCode', {}, 'code'],
  ['toggleBulletList', {}, 'ul'],
  ['toggleOrderedList', {}, 'ol'],
  ['toggleTaskList', {}, 'tl'],
] as const) {
  const nabi = make([float([p()]), p('영역 밖')]);
  select(nabi, [0, 0, 0]);
  ok(`${command} 실행`, nabi.applyCommand(command, args));
  const doc = json(nabi);
  eq(`${command} 바깥 본문 보존`, doc.slice(1), [p('영역 밖')]);
  const inner = doc[0]?.ch[0] as ElementNode;
  ok(`${command} 영역 내부 삽입`, JSON.stringify(inner.ch).includes(`"w":"${expected}"`));
  ok(`${command} 내부 선택 유지`, nabi.getSelection().focus.path.slice(0, 2).join() === '0,0');
  ok(`${command} 선택 유효`, positionExists(doc, nabi.getSelection().focus, registry.env));
  ok(`${command} undo`, nabi.undo());
  eq(`${command} undo 복원`, json(nabi), [float([p()]), p('영역 밖')]);
}
{
  const nabi = make([float(), p('바깥')]);
  nabi.select({ anchor: { path: [0, 0, 0], offset: 0 }, focus: { path: [1], offset: 1 } });
  ok('컨테이너를 가로지르는 변환 거절', !nabi.applyCommand('toggleQuote'));
  select(nabi, [1]);
  ok('영역 밖 삽입은 기존 동작', nabi.applyCommand('insertImage', { src: 'https://example.com/out.png' }));
  eq('영역 밖에 이미지 삽입', (json(nabi)[2]?.ch[0] as ElementNode).w, 'img');
}
{
  const nabi = make([{ w: 'float', a: { side: 'bad', w: 85, style: 'bad' }, ch: [] }]);
  eq('잘못된 저장 속성은 기본값, 빈 문단 보장', json(nabi), [float([p()])]);
  nabi.setJson([float([p('앞'), float([p('중첩 내용')]), p('뒤')])]);
  eq('중첩 영역은 내용 보존하여 해제', json(nabi), [float([p('앞'), p('중첩 내용'), p('뒤')])]);
  const html = nabi.getHtml();
  ok('HTML 왕복', nabi.setHtml(html));
  eq('HTML 왕복 결과', nabi.getHtml(), html);
  ok('임의 style을 플로트로 가져오지 않음', nabi.setHtml('<div style="float:left;width:40%"><p>본문</p></div>'));
  ok('임의 HTML에 float 없음', !nabi.getHtml().includes('data-nabi-float'));
}
{
  const doc = [float([p('SSR 본문')])];
  const stored = renderStoredHtml(doc, registry)!;
  const editing = renderStoredEditorHtml(doc, registry)!;
  ok('SSR 저장 마커', stored.includes('data-nabi-float="right"') && stored.includes('data-nabi-float-width="40"'));
  ok('편집용 키는 저장하지 않음', !stored.includes('data-key') && editing.includes('data-key'));
  ok('저장된 편집 장식 없음', !stored.includes('outline') && !stored.includes('contenteditable'));
  for (const [label, next] of [
    ['방향', [float([p('SSR 본문')], 'left')]],
    ['너비', [float([p('SSR 본문')], 'right', 50)]],
    ['내용', [float([p('SSR 새 본문')])]],
  ] as const) {
    const diff = diffDocs(doc, next, registry)!;
    eq(`${label} 변경 판정`, diff.changes.length, 1);
  }
  eq('동일한 영역 비교', diffDocs(doc, doc, registry)?.changes, []);
}
{
  const nabi = make([float([p('한글')]), p('끝')]);
  select(nabi, [0, 0, 0]);
  ok('영역 안 Enter', nabi.applyCommand('splitParagraph'));
  ok('Enter 뒤 선택 유지', nabi.getSelection().focus.path.slice(0, 2).join() === '0,0');
  const selection = { anchor: { path: [0, 0, 0], offset: 0 }, focus: { path: [0, 0, 0], offset: 0 } };
  eq(
    '위쪽 경계 탈출',
    routeKey({ key: 'arrow', dir: 'up' }, json(nabi), selection, registry.env, registry)?.selection.focus,
    { path: [0], offset: 0 },
  );
}
{
  ok('선택형 Wing 조립', wings().use('float').build().includes(floatWing));
  const nabi = createNabiWith([floatWing], { doc: [p()] }).nabi;
  ok('다른 Wing 없이도 등록 가능', nabi.applyCommand('insertFloat'));
  let rejected = false;
  try {
    makeRegistry([{ ...floatWing, scopedCommands: ['insertText'] } as Wing]);
  } catch {
    rejected = true;
  }
  ok('코어 명령 scope 금지', rejected);
}

done('float');
