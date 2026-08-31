// 접기의 표면 부속 — 삼각형을 누른 것이 곧 저장될 모습이다. 브라우저의 여닫음을 받아 `o`에 그대로 적는다.
// The details-toggle surface attach — clicking the triangle IS the saved state; the browser's own toggle writes straight to `o`.
//
// `toggle`은 버블링을 안 해서 캡처로 받는다 — 재그리기 때마다 리스너를 다시 달 필요 없이 표면 하나에 한 번 단다.
// `toggle` doesn't bubble, so this listens in the capture phase — one listener on the surface survives every redraw.
import { isElement } from '../../schema/index.js';
import { selectObject } from '../../caret/index.js';
import type { Attach } from '../../wing/index.js';

export const attachDetailsOpen: Attach = ({ root, nabi, doc, pathOfKey }) => {
  const onToggle = (event: Event): void => {
    const target = event.target as Node | null;
    if (target?.nodeType !== 1) return;
    const box = target as HTMLDetailsElement;
    if (box.tagName !== 'DETAILS' || !root.contains(box)) return;
    const key = box.getAttribute('data-key');
    if (key === null || key === '') return;
    const path = pathOfKey(key);
    if (!path) return;
    const node = doc()[path[0] as number];
    if (!node) return;

    const want = box.open ? 1 : 0;
    // 이미 그 값이면 아무 일도 안 한다 — 빈 되돌리기 지점을 안 남긴다.
    // A no-op when the value already matches — avoids leaving an empty undo entry.
    const lump = node.ch[0];
    if (lump !== undefined && isElement(lump) && (lump.a?.['o'] === 1 ? 1 : 0) === want) return;

    // 접히는 속에 캐럿이 있으면 밖으로 옮긴다 — 접힌 속은 안 그려져 캐럿이 설 자리가 없다.
    // If the caret is inside the collapsing body, move it out — hidden content has nowhere on-screen to hold it.
    const focus = nabi.getSelection().focus;
    const inside = want === 0 && focus.path.length > 1 && focus.path[0] === path[0];
    nabi.group(() => {
      if (inside) nabi.select(selectObject([path[0] as number]));
      nabi.applyCommand('setDetailsOpen', { open: want });
    });
  };

  root.addEventListener('toggle', onToggle, true);
  return () => root.removeEventListener('toggle', onToggle, true);
};
