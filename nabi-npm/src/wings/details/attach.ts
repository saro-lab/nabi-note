// 접기의 표면 부속 — **삼각형을 누른 것이 곧 저장될 모습이다.**
//
// 전에는 상황 줄에 단추 둘(`펼친 채로 저장`·`접은 채로 저장`)이 있었고, 편집 화면은 저장값과
// 상관없이 **늘 펼쳐** 그렸다. 그래서 눌러 접으면 화면만 접히고 저장값(`o`)은 안 움직였다
// 손이 한 일과 문서에 남는 것이 달랐다. 그 자리를 짚은 말이 있었다: "어차피 클릭하면 되는 거라
// 필요 없을 거 같아."
//
// 그래서 둘을 하나로 합쳤다. 화면이 저장값을 그대로 그리고(`toHtml` 이 `o` 만 본다), 브라우저가
// 저 혼자 여닫은 것을 여기서 받아 `o` 에 적는다. 이제 보이는 것이 곧 저장되는 것이다.
//
// **`toggle` 은 안 올라온다**(버블링을 안 한다) — 그래서 캡처로 받는다. 접기마다 리스너를 다는
// 길도 있지만, 재그리기가 노드를 갈아 끼우므로 그때마다 다시 달아야 한다. 표면 하나에 한 번
// 다는 편이 적게 틀린다.
import { isElement } from '../../schema/index.js';
import { selectObject } from '../../caret/index.js';
import type { Attach } from '../../wing/index.js';

export const attachDetailsOpen: Attach = ({ root, nabi, pathOfKey }) => {
  const onToggle = (event: Event): void => {
    const box = event.target;
    if (!(box instanceof HTMLDetailsElement) || !root.contains(box)) return;
    const key = box.getAttribute('data-key');
    if (key === null || key === '') return;
    const path = pathOfKey(key);
    if (!path) return;
    const node = nabi.$doc()[path[0] as number];
    if (!node) return;

    const want = box.open ? 1 : 0;
    // 이미 그 값이면 아무 일도 안 한다 — 우리가 그린 것을 도로 적어 빈 되돌리기 지점을 안 남긴다.
    const lump = node.ch[0];
    if (lump !== undefined && isElement(lump) && (lump.a?.['o'] === 1 ? 1 : 0) === want) return;

    // **접으면서 그 속에 캐럿이 있으면 캐럿을 밖으로 옮긴다.** 접힌 속은 안 그려져서 화면에
    // 캐럿이 설 자리가 없다 — 그대로 두면 트리의 자리와 화면이 갈라진다. 접기를 통째로 겨눠
    // 두면 다음 걸음(방향키·글자)이 갈 곳이 분명하다.
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
