import { inBrowser, type Theme } from 'vitepress'

import Layout from './Layout.vue'
import './style.css'

import { setupGa } from '../src/ga.ts'
import { localeFromPath, translate } from '../src/langs.ts'
import { computed } from 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    // 전역에 달아 둬서 템플릿에서 따로 들여오지 않고 바로 부를 수 있다.
    // Global, so templates can call it without importing anything.
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
