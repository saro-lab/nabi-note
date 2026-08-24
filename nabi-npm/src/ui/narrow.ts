// 한 줄 모드 — 그릇(툴바 줄·상황 줄)의 **제 폭**이 좁으면 접는 대신 가로로 구른다 (260824_000).
//
// 문턱을 컨테이너 쿼리로 안 재는 까닭: `container-type` 은 layout containment 을 함께 걸어
// 그 상자를 **fixed 의 containing block** 으로 만든다 — 작은 화면의 판(css 의 40rem 분기)이
// 그룹 속에서 `position: fixed` 로 화면 한가운데 서는데, containment 아래서는 그 가운데가
// 화면이 아니라 툴바 상자의 가운데가 된다. 그래서 폭은 여기서 재고, CSS 는 클래스 하나만 듣는다.
//
// 문턱이 뷰포트가 아니라 그릇인 까닭(주인의 "컨텍스트 가로크기"): 넓은 화면이라도 좁은 칼럼에
// 박힌 편집기는 모바일과 같은 처지다. 값은 기존 좁은 화면 분기의 40rem 과 같다 — 두 판정이
// 다른 것을 재지만(겨눔의 굵기 / 그릇의 폭) 같은 지점에서 갈려야 화면이 한 번에 바뀐다.

export const NARROW_CLASS = 'nabi-narrow';
export const NARROW_REM = 40;

type Watcher = { observe(el: Element): void; disconnect(): void };

// 그릇의 폭을 지켜서서 문턱 아래면 클래스를 단다. 걷는 손을 돌려준다 — unmount 가 부른다.
// ResizeObserver 가 없는 브라우저는 그냥 안 잰다: 지금처럼 여러 줄로 접힐 뿐, 나머지는 그대로다.
export function watchNarrow(el: HTMLElement): () => void {
  const owner = el.ownerDocument;
  const view = owner.defaultView;
  const Observer = (view as unknown as { ResizeObserver?: new (fn: () => void) => Watcher } | null)?.ResizeObserver;
  if (!view || !Observer) return () => {};
  const apply = (): void => {
    // rem 은 그때그때 읽는다 — 호스트가 뿌리 글자 크기를 바꾸면 문턱도 함께 옮겨 간다.
    const rem = parseFloat(view.getComputedStyle(owner.documentElement).fontSize) || 16;
    el.classList.toggle(NARROW_CLASS, el.clientWidth <= NARROW_REM * rem);
  };
  const watcher = new Observer(apply);
  watcher.observe(el);
  apply();
  return () => {
    watcher.disconnect();
    el.classList.remove(NARROW_CLASS);
  };
}
