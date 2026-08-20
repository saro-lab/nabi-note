// 바깥 클릭 닫기 — **하나**다. 옛 판은 툴바·상황 줄·미리보기가 각자 문서에 리스너를 걸었다
// (부검: "전역 리스너 각자 등록"). 여는 쪽은 이제 이 함수 하나를 부르고, 답으로 온 끊는 함수를
// 닫을 때 부른다.
//
// `pointerdown` 을 듣는다 — `click` 은 눌렀다 뗀 뒤에 오므로, 그 사이에 판이 자리를 옮기면
// 클릭이 엉뚱한 것 위에서 끝난다.

// `inside` 중 어느 것 안에서도 안 눌렸으면 닫는다.
export function closeOnOutside(
  owner: Document,
  inside: () => readonly (Element | null)[],
  close: () => void,
): () => void {
  const onDown = (event: Event): void => {
    const target = event.target;
    if (target instanceof Node) {
      for (const el of inside()) {
        if (el && el.contains(target)) return;
      }
    }
    close();
  };
  owner.addEventListener('pointerdown', onDown, true);
  return () => owner.removeEventListener('pointerdown', onDown, true);
}
