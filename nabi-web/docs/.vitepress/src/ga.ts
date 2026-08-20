import { nextTick, watch } from 'vue'
import type { Router } from 'vitepress'

export const GA_ID = 'G-RPQS522JGT'

interface GtagWindow {
  dataLayer: unknown[]
  gtag: (...args: unknown[]) => void
}

// An SPA loads gtag.js once, so automatic page_view would count only the first page
// SPA 라 gtag.js 는 한 번만 온다 — 자동 page_view 에 맡기면 첫 장만 세고 만다
export function setupGa(router: Router): void {
  const w = window as unknown as GtagWindow
  w.dataLayer = w.dataLayer || []
  // `arguments` itself is what gtag.js reads, so this cannot become an arrow function
  // gtag.js 가 읽는 것은 `arguments` 그 자체다 — 화살표 함수로 바꾸면 안 된다
  w.gtag = function gtag() {
    w.dataLayer.push(arguments)
  }

  w.gtag('js', new Date())
  w.gtag('config', GA_ID, { send_page_view: false })

  const send = (): void => {
    w.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: location.href,
      page_path: location.pathname,
    })
  }

  send()
  // The title changes while the new page renders, so sending in the same tick reports the previous one
  // 제목은 새 페이지를 그리는 중에 바뀐다 — 같은 틱에 보내면 이전 제목이 실려 나간다
  watch(
    () => router.route.path,
    () => void nextTick(send),
  )
}
