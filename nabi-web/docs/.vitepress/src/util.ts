const COPIED_MS = 1400

// Answers on the button itself instead of a toast; returns false where the clipboard is unavailable
// 알림 상자 대신 누른 자리에서 답한다. 클립보드를 못 쓰는 자리에서는 조용히 false 를 돌려준다
export async function doCopyToClipboard(element: EventTarget | null, text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    if (element instanceof HTMLElement) {
      element.classList.add('copied')
      setTimeout(() => element.classList.remove('copied'), COPIED_MS)
    }
    return true
  } catch {
    return false
  }
}

export function shuffle<T>(items: readonly T[]): T[] {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}
