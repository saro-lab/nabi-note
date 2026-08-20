import { inBrowser, type Theme } from 'vitepress'

import Layout from './Layout.vue'
import './style.css'

import { setupGa } from '../src/ga.ts'
import { localeFromPath, translate } from '../src/langs.ts'
import { computed } from 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    // Global so templates can call it without importing anything
    // 템플릿에서 바로 쓰는 번역 함수
    $t: (key: string) => string
  }
}

export default {
  Layout,
  enhanceApp({ app, router }) {
    const lang = computed(() => localeFromPath(router.route.path))
    app.config.globalProperties.$t = (key: string) => translate(lang.value, key)

    if (inBrowser) {
      setupGa(router)
    }
  },
} satisfies Theme
