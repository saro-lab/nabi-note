<!-- 화면에서 만들어지는 코드라 빌드 때 칠할 수 없다 — 껍데기를 마크다운 펜스와 맞춰 시트를 한 벌만 쓴다. -->
<!-- Code built at runtime can't be painted at build time, so the wrapper mimics a markdown fence to share one stylesheet. -->
<template>
  <div :class="`language-${lang}`">
    <span class="lang" aria-hidden="true">{{ lang }}</span>
    <!-- 누르는 동작은 Layout.vue의 위임 리스너가 맡는다 — 손으로 적은 펜스와 같은 한 곳이다. -->
    <!-- Handled by the delegated listener in Layout.vue, the same one hand-written fences use. -->
    <button type="button" class="copy" :title="t('code_copy')" :aria-label="t('code_copy')"></button>
    <!-- 칠해지기 전에는 평문으로 보여 준다 — 빈 상자가 잠깐 스치지 않게. -->
    <!-- Plain text until painted, so no empty box flashes by. -->
    <pre v-if="html === ''" class="shiki"><code>{{ code }}</code></pre>
    <div v-else v-html="html"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useTranslate } from '../src/langs.ts'

const props = defineProps<{ lang: string; code: string }>()

const { t } = useTranslate()
const html = ref('')

// 마지막 요청만 화면에 붙인다 — 앞선 것이 뒤늦게 끝날 수 있어서다.
// Only the latest request may write to the DOM — earlier ones can still resolve after it.
let revision = 0

async function render(): Promise<void> {
  const mine = ++revision
  // Shiki는 브라우저 것이다 — 여기서 가져와야 SSR·첫 번들에 안 끌려 들어간다.
  // Shiki is browser-only, so importing it here keeps it out of SSR and the first bundle.
  const { highlightToHtml } = await import('../src/highlight.ts')
  const painted = await highlightToHtml(props.code, props.lang)
  if (mine === revision) html.value = painted
}

watch(() => [props.lang, props.code], render)
onMounted(render)
</script>
