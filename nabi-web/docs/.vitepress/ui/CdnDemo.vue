<!-- The CDN example page, whole: the lead line with its download button and the code itself -->
<!-- CDN 예제 쪽의 머리 — 안내 한 줄(내려받기 단추가 그 안에 산다)과 코드가 한 부품이다 -->
<!-- The shown code and the downloaded file are one string, so they can never drift apart -->
<!-- 보이는 코드와 내려받는 파일이 같은 문자열이라 둘이 어긋날 자리가 없다 -->
<template>
  <p class="cdn-lead"><span>{{ before }}</span><button
      type="button"
      class="cdn-file"
      :title="t('cdn_demo_download')"
      :aria-label="t('cdn_demo_download')"
      @click="download"
    ><svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path
        d="M8 2v7m0 0 3-3M8 9 5 6M3 12h10"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      /></svg>{{ file }}</button><span>{{ after }}</span></p>

  <CodeBox lang="html" :code="code" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import CodeBox from './CodeBox.vue'
import { useTranslate } from '../src/langs.ts'
import { CDN_DEMO_FILE, cdnDemoHtml } from '../src/cdn-demo.ts'

const { lang } = useData()
const { t } = useTranslate()

const file = CDN_DEMO_FILE
const code = computed(() => cdnDemoHtml(lang.value))

// The button stands where `{file}` sits, so each language keeps its own word order — RTL included
// 단추는 `{file}` 자리에 선다 — 그래서 언어마다 제 어순 그대로다(오른쪽에서 읽는 쪽까지)
const parts = computed(() => {
  const [head, tail] = t('cdn_demo_lead').split('{file}')
  return { head: head ?? '', tail: tail ?? '' }
})
const before = computed(() => parts.value.head)
const after = computed(() => parts.value.tail)

function download(): void {
  const blob = new Blob([code.value], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = CDN_DEMO_FILE
  link.click()
  // Revoking in the same tick can cut the download off in some browsers — let this one finish first
  // 같은 틱에 거두면 브라우저에 따라 내려받기가 끊긴다 — 이번 틱을 넘기고 거둔다
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
</script>

<style scoped>
.cdn-lead {
  /* Sits directly above the code box, so it keeps the paragraph rhythm of the page around it */
  /* 바로 아래가 코드 상자다 — 쪽의 문단 사이 리듬을 그대로 쓴다 */
  margin: 1rem 0;
}

.cdn-file {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  /* Reads as the file name it writes, so it wears the inline-code face rather than a button's */
  /* 제가 쓰는 파일 이름을 그대로 입는다 — 단추가 아니라 인라인 코드의 얼굴이다 */
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-size: 0.875em;
  line-height: 1.4;
  padding: 0.15em 0.45em;
  border: 1px solid color-mix(in srgb, var(--g-accent) 40%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--g-accent) 8%, transparent);
  color: var(--g-accent);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.cdn-file:hover {
  background: color-mix(in srgb, var(--g-accent) 16%, transparent);
  border-color: var(--g-accent);
}

.cdn-file:focus-visible {
  outline: 2px solid var(--g-accent);
  outline-offset: 2px;
}

.cdn-file svg {
  /* The arrow says "this saves a file" — without it the box reads as a plain code span */
  /* 화살표가 "이걸 누르면 파일이 된다" 를 말한다 — 없으면 그냥 코드 조각으로 읽힌다 */
  flex: none;
  opacity: 0.8;
}
</style>
