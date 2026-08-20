// 첨부 링크의 표면 부속 — **첨부는 글이 아니라 한 덩어리다.**
//
// 여느 링크는 글 위에 걸린 마크라 그 속에 캐럿이 들어가고 글자를 고칠 수 있다. 첨부(`file` 이
// 실린 링크)는 그러면 안 된다: 그 글자는 사람이 쓴 문장이 아니라 "첨부파일" 이라는 **이름표**이고
// 가운데를 한 글자 지우면 주소는 그대로인데 이름만 망가진 링크가 남는다. 고치는 자리는 상황 줄
// 하나뿐이다(이름 칸·주소 칸).
//
// **스키마는 안 바꾼다.** 저장값은 여전히 `<a href … data-nabi-file>글자</a>` — 글을 품은 인라인
// 마크 그대로다(이미 저장된 문서들이 그 모양이다). "속을 못 여는 인라인 물건" 이라는 성질은
// 여기 표면에서만 입힌다 — 발행된 페이지에서 첨부는 눌러서 내려받는 보통 링크이고, 물건처럼
// 구는 것은 편집기 안에서뿐이라 성질이 살 자리도 표면이 맞다.
//
// 그래서 규칙 넷을 여기서 세운다.
//   ① **닿으면 통째로 골라진다** — 캐럿이 속으로 들어가거나 선택이 스치기만 해도 첨부 전체를 덮게
//      넓힌다. 속에 캐럿이 못 서므로 글자를 칠 자리도 없다(친 글자는 통째로 갈아 끼운다).
//      방향키도 이 규칙 하나로 답이 된다: 옆에서 들어오는 첫 걸음이 속의 한 자리를 짚는 순간
//      통째로 골라지고, 골라진 채의 다음 걸음은 브라우저가 범위를 그 모서리로 접는다 — **한
//      걸음에 골라지고 다음 걸음에 빠져나간다.** 046 의 블록 규칙(←·↑ 는 바로 앞, →·↓ 는 바로
//      뒤)과 같은 답이 인라인에서는 이 두 걸음으로 나온다.
//   ② **붙어 있는 백스페이스·Delete 는 먼저 겨눈다** — 링크 바로 뒤에서 백스페이스를 치면 코어는
//      한 글자를 지운다. 그것이 ①이 막으려던 바로 그 자리라, 첫 번은 통째로 고르고 두 번째가 지운다
//      (그릇의 겨누기와 같은 걸음이다). 골라진 범위의 삭제는 코어의 범위 삭제 한 번이라 지우기·
//      되돌리기가 저절로 **한 글자처럼** 돈다.
//   ③ **누름은 그림·영상과 같은 통째 고르기다** — 눌리는 순간(mousedown) 첨부 전체를 고르고
//      그 몸짓의 남은 걸음(mouseup·click)을 다 삼킨다. 하나만 삼키면 나머지 걸음에서 브라우저가
//      캐럿을 다시 놓는다(081 §3 이 래퍼문단 물건에서 밟은 그 함정 그대로다).
//      삼킨 몸짓은 포커스도 안 옮기므로 직접 준다.
//   ④ **고른 표시는 물건의 그 표시다** — 선택이 첨부 하나를 꼭 맞게 덮으면 그 a 엘리먼트에
//      `data-nabi-picked` 를 얹는다(ui/picked 가 그림·영상에 쓰는 같은 이름 — 같은 시트의 점선
//      테두리가 그려지고, 그 시트가 속의 파란 칠도 걷어 테두리만 남는다). 화면 DOM 에만 얹었다
//      걷는 표식이라 저장·발행 값에는 영영 안 나간다.
//
// **왜 onKey 가 아니라 attach 인가**: 키 소유(`keyOwnerAt`)는 경로를 타고 올라가는데 마크는 경로에
// 없다 — 링크 속 캐럿의 경로는 그냥 그 문단이라, 이 wing 의 `onKey` 는 영영 안 불린다. 표면에
// 손을 대야 하는 wing 이 리스너를 직접 달지 않고 선언하는 자리가 attach 다.
//
// 잡는 것은 **캡처**다. 표면의 keydown 이 먼저 달려 있어서(mount 가 attach 보다 앞이다) 그대로
// 두면 코어가 한 글자를 먼저 지운다. 캡처로 앞에 서서 `preventDefault` 하면 표면의 머리에 있는
// `if (ev.defaultPrevented) return` 가 그 키를 두 번 안 먹는다.
import { runsOf } from '../../schema/index.js';
import { nodeAt, terminalOf, type EditEnv } from '../../doc/index.js';
import { isCollapsed, ordered, type Selection } from '../../caret/index.js';
import type { NabiDoc } from '../../schema/index.js';
import type { Attach } from '../../wing/index.js';

// ui/picked 의 그 이름 — 층이 위(ui)라 가져오지 않고 값을 적는다. 시트도 이 이름 하나를 그린다.
const PICKED_ATTR = 'data-nabi-picked';

interface Span {
  from: number;
  to: number;
  readonly href: unknown;
  readonly file: unknown;
}

// 한 홀더 안의 첨부 자리들 — `[from, to)` 목록.
//
// 이웃한 같은 첨부는 한 자리로 합친다: 한 마크가 여러 런으로 쪼개져 있을 수 있다(이름 가운데
// 굵게가 끼면 런이 갈린다). 합치지 않으면 그 반쪽만 골라져 ①이 반만 지켜진다.
function fileSpans(doc: NabiDoc, path: readonly number[], env: EditEnv): Span[] {
  const holder = nodeAt(doc, path);
  if (!holder) return [];
  const out: Span[] = [];
  let offset = 0;
  for (const run of runsOf(holder, terminalOf(env))) {
    const size = run.kind === 'text' ? run.text.length : 1;
    const link = run.marks.find((m) => m.w === 'a');
    const file = link?.a?.['file'];
    if (typeof file === 'string' && file !== '') {
      const href = link?.a?.['href'];
      const last = out[out.length - 1];
      if (last && last.to === offset && last.href === href && last.file === file) last.to = offset + size;
      else out.push({ from: offset, to: offset + size, href, file });
    }
    offset += size;
  }
  return out;
}

// 이 선택이 첨부에 닿는가 — 닿으면 첨부까지 넓힌 선택, 아니면 null(그대로 둔다).
//
// **경계는 밖이다.** 접힌 캐럿은 안쪽(`from < o < to`)일 때만 닿은 것으로 본다 — 경계까지 삼키면
// 첨부 앞뒤에 캐럿을 못 세워 이어서 글을 쓸 수 없다. 범위는 스치기만 해도 닿은 것이다.
function widen(doc: NabiDoc, sel: Selection, env: EditEnv): Selection | null {
  const [start, end] = ordered(sel);
  // 여러 홀더에 걸친 선택은 코어의 것이다 — 문단을 넘는 범위까지 여기서 손대지 않는다.
  if (start.path.length !== end.path.length || start.path.some((v, i) => v !== end.path[i])) return null;
  const spans = fileSpans(doc, start.path, env);
  if (spans.length === 0) return null;

  const collapsed = start.offset === end.offset;
  let from = start.offset;
  let to = end.offset;
  for (const span of spans) {
    const touches = collapsed
      ? start.offset > span.from && start.offset < span.to
      : start.offset < span.to && end.offset > span.from;
    if (!touches) continue;
    from = Math.min(from, span.from);
    to = Math.max(to, span.to);
  }
  if (from === start.offset && to === end.offset) return null; // 이미 그 모양이다 — 되풀이를 끊는다
  return { anchor: { path: start.path, offset: from }, focus: { path: start.path, offset: to } };
}

// 홀더 엘리먼트 속의 첨부 a 무리 — 문서 순서라 fileSpans 의 자리 목록과 1:1 이다.
//
// 무리로 세는 까닭은 fileSpans 의 합침과 같다: 트리에서 한 자리로 합쳐지는 이웃 a(같은 주소·
// 같은 이름표가 틈 없이 잇닿은 것)는 화면에서도 한 물건으로 세야 자리 셈이 안 어긋난다.
function fileAnchorGroups(holderEl: Element): Element[][] {
  const groups: Element[][] = [];
  let prev: Element | null = null;
  for (const el of Array.from(holderEl.querySelectorAll('a[data-nabi-file]'))) {
    const last = groups[groups.length - 1];
    const joined =
      prev !== null &&
      last !== undefined &&
      el.previousSibling === prev &&
      el.getAttribute('href') === prev.getAttribute('href') &&
      el.getAttribute('data-nabi-file') === prev.getAttribute('data-nabi-file');
    if (joined && last) last.push(el);
    else groups.push([el]);
    prev = el;
  }
  return groups;
}

// 속성 선택자용 — _id 는 안전 문자만 갖지만(schema), surface/map 과 같은 방어를 한다.
const escapeId = (id: string): string => id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const attachFileLink: Attach = ({ root, nabi, pathOfKey }) => {
  const env = nabi.$env;
  // 우리가 세운 선택이 다시 우리를 부르는 것을 막는다 — 넓힌 선택은 이미 넓어져 있어서 widen 이
  // null 을 답하지만, 그 한 바퀴조차 안 돌게 한다.
  let fixing = false;
  // 표식을 얹어 둔 엘리먼트들 — 걷을 때 이 목록만 걷으면 된다(재그리기가 버린 옛 것을 걷어도
  // 해는 없다).
  let picked: Element[] = [];

  const clearPicked = (): void => {
    for (const el of picked) el.removeAttribute(PICKED_ATTR);
    picked = [];
  };

  // ④ 고른 표시 — 지금 선택이 첨부 하나를 꼭 맞게 덮으면 그 a 에 표식을 얹는다.
  //
  // "꼭 맞게" 다: 첨부보다 넓은 범위(앞뒤 글자까지 잡은 드래그)는 물건 하나를 고른 것이 아니라
  // 글을 잡은 것이라, 브라우저의 보통 선택 칠이 맞는 표시다.
  // 재그리기가 표식을 지우므로(속성은 화면에만 있다) 바뀔 때마다 다시 얹는다 — ui/picked 와
  // 같은 리듬이고, attach 의 구독이 표면의 재그리기 구독보다 뒤라 순서도 맞는다.
  const refreshPicked = (): void => {
    if (typeof root.querySelector !== 'function') return; // 그물의 껍데기 root — 표시는 화면의 것이다
    const sel = nabi.getSelection();
    const [start, end] = ordered(sel);
    const doc = nabi.$doc();
    let group: Element[] | null = null;
    if (
      start.offset !== end.offset &&
      start.path.length === end.path.length &&
      start.path.every((v, i) => v === end.path[i])
    ) {
      const spans = fileSpans(doc, start.path, env);
      const index = spans.findIndex((span) => span.from === start.offset && span.to === end.offset);
      if (index >= 0) {
        const holder = nodeAt(doc, start.path);
        const id = holder && typeof holder._id === 'string' ? holder._id : null;
        const holderEl = id !== null ? root.querySelector(`[data-key="${escapeId(id)}"]`) : null;
        group = holderEl ? (fileAnchorGroups(holderEl)[index] ?? null) : null;
      }
    }
    clearPicked();
    if (!group) return;
    for (const el of group) el.setAttribute(PICKED_ATTR, '');
    picked = group;
  };

  const fix = (): void => {
    if (fixing) return;
    const wanted = widen(nabi.$doc(), nabi.getSelection(), env);
    if (wanted) {
      fixing = true;
      try {
        nabi.select(wanted);
      } finally {
        fixing = false;
      }
    }
    refreshPicked();
  };

  // ③ 눌림 = 통째 고르기 — 눌린 a 가 트리의 몇째 첨부인지는 화면의 무리 차례로 센다
  // (문서 순서 = 화면 순서라 fileSpans 의 차례와 같다). 못 세면 물러선다: 브라우저가 캐럿을
  // 놓고 ①의 넓히기가 받친다.
  let took = false;

  const onMouseDown = (event: MouseEvent): void => {
    took = false;
    // Shift 클릭은 범위를 늘리는 손이다 — 그 범위가 첨부를 스치면 ①이 어차피 끝까지 넓힌다.
    if (event.button > 0 || event.shiftKey) return;
    const el = event.target as Element | null;
    if (!el || typeof el.closest !== 'function') return;
    const anchor = el.closest('a[data-nabi-file]');
    if (!anchor || !root.contains(anchor)) return;
    const keyed = anchor.closest('[data-key]');
    const id = keyed?.getAttribute('data-key') ?? '';
    const path = id !== '' ? pathOfKey(id) : null;
    if (!keyed || !path) return;
    const index = fileAnchorGroups(keyed).findIndex((g) => g.includes(anchor));
    const span = index >= 0 ? fileSpans(nabi.$doc(), path, env)[index] : undefined;
    if (!span) return;
    took = true;
    event.preventDefault();
    if (typeof root.focus === 'function') root.focus({ preventScroll: true });
    nabi.select({ anchor: { path, offset: span.from }, focus: { path, offset: span.to } });
  };

  // 남은 두 걸음도 삼킨다 — click 에서 took 을 내려놓아 다음 몸짓이 새 판으로 시작한다.
  const onSwallow = (event: MouseEvent): void => {
    if (!took) return;
    if (event.type === 'click') took = false;
    event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    const sel = nabi.getSelection();
    if (!isCollapsed(sel)) return; // 이미 골라져 있다 — 지우는 것은 코어의 범위 삭제다
    const at = sel.focus;
    const hit = fileSpans(nabi.$doc(), at.path, env).find((span) =>
      event.key === 'Backspace' ? at.offset === span.to : at.offset === span.from,
    );
    if (!hit) return;
    event.preventDefault();
    nabi.select({ anchor: { path: at.path, offset: hit.from }, focus: { path: at.path, offset: hit.to } });
  };

  const stop = nabi.onChange(fix);
  root.addEventListener('mousedown', onMouseDown);
  root.addEventListener('mouseup', onSwallow);
  root.addEventListener('click', onSwallow);
  // keydown 이 **마지막**이어야 한다 — 그물의 껍데기 root 는 마지막에 단 리스너 하나만 쥔다.
  root.addEventListener('keydown', onKeyDown, true);
  fix();

  return () => {
    stop();
    clearPicked();
    root.removeEventListener('keydown', onKeyDown, true);
    root.removeEventListener('click', onSwallow);
    root.removeEventListener('mouseup', onSwallow);
    root.removeEventListener('mousedown', onMouseDown);
  };
};
