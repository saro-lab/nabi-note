import { JSDOM } from 'jsdom';
import { visibleViewportRect, watchDockViewport, type DockViewportState } from '../src/ui/dock.js';
import { done, eq, ok } from './net.js';

function fixture(touch = true) {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="frame"><div id="chrome"></div><div id="surface" tabindex="0"></div></div><div id="panel"></div></body></html>',
    { pretendToBeVisual: true },
  );
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const panel = owner.getElementById('panel') as HTMLElement;
  const geometry = { width: 390, height: 812, offsetTop: 0, offsetLeft: 0, scale: 1 };
  const layout = { width: 390, height: 812 };
  const visual = new dom.window.EventTarget();
  for (const key of Object.keys(geometry) as (keyof typeof geometry)[])
    Object.defineProperty(visual, key, { get: () => geometry[key] });
  Object.defineProperty(dom.window, 'visualViewport', { value: visual });
  Object.defineProperty(dom.window, 'innerWidth', { get: () => layout.width });
  Object.defineProperty(dom.window, 'innerHeight', { get: () => layout.height });
  Object.defineProperty(owner.documentElement, 'clientWidth', { get: () => layout.width });
  Object.defineProperty(owner.documentElement, 'clientHeight', { get: () => layout.height });
  Object.defineProperty(dom.window.navigator, 'maxTouchPoints', { value: touch ? 5 : 0 });
  const changes: DockViewportState[] = [];
  const viewport = watchDockViewport({ surface, onChange: (state) => changes.push(state) });
  const resize = (next: Partial<typeof geometry>, nextLayout?: Partial<typeof layout>): void => {
    Object.assign(geometry, next);
    Object.assign(layout, nextLayout);
    visual.dispatchEvent(new dom.window.Event('resize'));
  };
  const finish = (): void => {
    viewport.unmount();
    dom.window.close();
  };
  return { dom, owner, surface, panel, geometry, layout, visual, changes, viewport, resize, finish };
}

{
  const f = fixture();
  eq('dock - 초기 callback은 호출하지 않는다', f.changes.length, 0);
  ok('dock - snapshot은 외부 변경을 받지 않는다', Object.isFrozen(f.viewport.read()));
  f.surface.focus();
  f.resize({ height: 462, offsetTop: 200 });
  eq('dock - 키보드 높이는 offsetTop을 더해 줄이지 않는다', f.viewport.read().keyboardHeight, 350);
  f.viewport.preparePanel(f.panel);
  eq('dock - 도구판으로 포커스를 옮긴다', f.owner.activeElement?.id, 'panel');
  ok('dock - blur 뒤에도 닫히는 키보드를 추적한다', f.viewport.read().keyboardOpen);
  f.resize({ height: 732, offsetTop: 0 });
  ok('dock - 닫힘 애니메이션 중 작은 키보드 위로 도구판을 겹치지 않는다', f.viewport.read().keyboardOpen);
  eq('dock - 닫히는 중간 높이로 도구판 높이를 덮지 않는다', f.viewport.read().lastKeyboardHeight, 350);
  f.resize({ height: 812, offsetTop: 0 });
  eq('dock - 키보드가 닫히면 현재 높이는 0이다', f.viewport.read().keyboardHeight, 0);
  eq('dock - 도구판용 마지막 키보드 높이는 남긴다', f.viewport.read().lastKeyboardHeight, 350);
  f.viewport.restore();
  eq('dock - 쓰기로 돌아갈 때만 편집기에 포커스를 준다', f.owner.activeElement?.id, 'surface');
  ok('dock - 도구판에 임시로 준 tabindex를 정리한다', !f.panel.hasAttribute('tabindex'));
  f.finish();
}

{
  const f = fixture();
  f.surface.focus();
  f.resize({ height: 462 });
  f.viewport.preparePanel(f.panel);
  f.resize({ height: 772 });
  await new Promise((resolve) => f.dom.window.setTimeout(resolve, 220));
  ok('dock - 키보드 닫힌 뒤 남은 주소 표시줄 차이에서 영구 대기하지 않는다', !f.viewport.read().keyboardOpen);
  eq('dock - 작은 뷰포트 차이가 안정되어도 마지막 키보드 높이는 유지한다', f.viewport.read().lastKeyboardHeight, 350);
  f.finish();
}

{
  const f = fixture();
  f.surface.focus();
  f.resize({ height: 492 }, { height: 492 });
  eq('dock - layout viewport도 줄이는 터치 브라우저의 키보드', f.viewport.read().keyboardHeight, 320);
  f.viewport.preparePanel(f.panel);
  f.resize({ height: 812 }, { height: 812 });
  ok('dock - layout viewport 복원 뒤 도구판 교대 가능', !f.viewport.read().keyboardOpen);
  f.finish();
}

{
  const f = fixture(false);
  f.surface.focus();
  f.resize({ height: 492 }, { height: 492 });
  ok('dock - 데스크톱 창 높이 변경을 키보드로 보지 않는다', !f.viewport.read().keyboardOpen);
  f.finish();
}

{
  const f = fixture();
  f.surface.focus();
  f.resize({ height: 406, width: 195, scale: 2, offsetTop: 100 });
  ok('dock - pinch zoom으로 줄어든 visual viewport는 키보드가 아니다', !f.viewport.read().keyboardOpen);
  eq(
    'dock - 도구판 좌표에는 실제 visual viewport 값을 준다',
    [f.viewport.read().top, f.viewport.read().height, f.viewport.read().width],
    [100, 406, 195],
  );
  f.resize({ width: 812, height: 390, scale: 1, offsetTop: 0 }, { width: 812, height: 390 });
  ok('dock - 가로 회전은 이전 세로 높이와 비교하지 않는다', !f.viewport.read().keyboardOpen);
  eq('dock - 회전한 layout 높이로 다시 기준을 세운다', f.viewport.read().layoutHeight, 390);
  f.finish();
}

{
  const f = fixture();
  f.surface.focus();
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart'));
  f.viewport.preparePanel(f.panel);
  eq('dock - IME 조합 중에는 편집기를 blur하지 않는다', f.owner.activeElement?.id, 'surface');
  ok('dock - 조합 상태를 알린다', f.viewport.read().composing);
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionend'));
  await Promise.resolve();
  eq('dock - 조합 확정 뒤 도구판을 연다', f.owner.activeElement?.id, 'panel');
  f.viewport.restore();
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart'));
  f.viewport.preparePanel(f.panel);
  f.viewport.restore();
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionend'));
  await Promise.resolve();
  eq('dock - 취소한 IME 대기 도구판은 뒤늦게 열리지 않는다', f.owner.activeElement?.id, 'surface');
  f.finish();
}

{
  const f = fixture();
  f.viewport.preparePanel(f.panel);
  f.panel.setAttribute('tabindex', '5');
  f.viewport.restore();
  eq('dock - host가 바꾼 tabindex는 되돌리지 않는다', f.panel.tabIndex, 5);
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart'));
  f.viewport.preparePanel(f.panel);
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionend'));
  f.viewport.unmount();
  const count = f.changes.length;
  await Promise.resolve();
  f.resize({ height: 400 });
  f.viewport.preparePanel(f.panel);
  f.viewport.restore();
  eq(
    'dock - 해제 후 callback이나 예약 포커스를 실행하지 않는다',
    [f.changes.length, f.owner.activeElement?.id],
    [count, 'surface'],
  );
  f.finish();
}

{
  const f = fixture();
  f.viewport.preparePanel(f.panel);
  f.viewport.cancelPanel();
  eq('dock - 도구판 예약 취소는 포커스를 옮기지 않는다', f.owner.activeElement?.id, 'panel');
  ok('dock - 예약 취소는 임시 tabindex도 정리한다', !f.panel.hasAttribute('tabindex'));
  f.surface.focus();
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart'));
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionend'));
  await Promise.resolve();
  eq('dock - 취소 뒤 새 조합은 닫힌 도구판에 포커스를 주지 않는다', f.owner.activeElement?.id, 'surface');
  f.viewport.preparePanel(f.panel);
  f.panel.hidden = true;
  f.surface.focus();
  f.surface.dispatchEvent(new f.dom.window.CompositionEvent('compositionend'));
  await Promise.resolve();
  eq('dock - 연결된 도구판도 숨김 상태이면 예약 포커스를 버린다', f.owner.activeElement?.id, 'surface');
  f.finish();
}

{
  const f = fixture();
  const close = f.owner.createElement('button');
  f.panel.append(close);
  f.viewport.preparePanel(close);
  eq('dock - 닫기 버튼의 Tab 순서를 바꾸지 않는다', close.tabIndex, 0);
  ok('dock - 원래 포커스 가능한 요소에는 tabindex를 만들지 않는다', !close.hasAttribute('tabindex'));
  f.finish();
}

{
  const f = fixture();
  f.resize({ height: 462, offsetTop: 200 });
  const before = f.owner.body.childElementCount;
  eq('visible viewport - Android client 좌표계', visibleViewportRect(f.owner), { top: 200, bottom: 662 });
  const original = f.dom.window.HTMLElement.prototype.getBoundingClientRect;
  f.dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { top: this.style.position === 'fixed' ? -200 : 0 } as DOMRect;
  };
  eq('visible viewport - iOS client 좌표계', visibleViewportRect(f.owner), { top: 0, bottom: 462 });
  eq('visible viewport - 측정 표식은 남기지 않는다', f.owner.body.childElementCount, before);
  f.dom.window.HTMLElement.prototype.getBoundingClientRect = original;
  f.finish();
}

done('dock');
