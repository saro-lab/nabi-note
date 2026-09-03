// pointerdown을 듣는다 — click은 떼는 순간에 오므로, 그 사이 판이 자리를 옮기면 클릭이 엉뚱한 것 위에서 끝난다.
// Listens on pointerdown, not click — click fires on release, and if the panel moves in between, the click lands on the wrong thing.
export function closeOnOutside(
  owner: Document,
  inside: () => readonly (Element | null)[],
  close: () => void,
): () => void {
  const onDown = (event: Event): void => {
    const target = event.target;
    if (target !== null && typeof (target as Node).nodeType === 'number') {
      for (const el of inside()) {
        if (el && el.contains(target as Node)) return;
      }
    }
    close();
  };
  owner.addEventListener('pointerdown', onDown, true);
  return () => owner.removeEventListener('pointerdown', onDown, true);
}
