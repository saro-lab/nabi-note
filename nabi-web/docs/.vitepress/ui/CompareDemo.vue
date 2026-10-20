<template>
  <section class="not-md compare-demo" :aria-label="copy.compareLabel">
    <div class="demo-actions">
      <p role="status">{{ message }}</p>
      <button class="chip" type="button" :disabled="!ready" @click="reset">{{ copy.reset }}</button>
    </div>
    <div ref="root" class="demo-host nabi compare-host"></div>
    <details v-if="merge">
      <summary>{{ copy.compareResult }}</summary>
      <div class="nabi-content demo-result" v-html="resultHtml"></div>
    </details>
    <p v-if="error" role="alert">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { comparisonCopy, demoDocument } from '../src/compare-merge.ts'
import { localeFromPath } from '../src/langs.ts'
import type { DiffMergeProposal, DiffMount } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const props = defineProps<{ merge?: boolean }>()
const { lang } = useData()
const locale = computed(() => localeFromPath(`/${lang.value}/`))
const copy = computed(() => comparisonCopy[locale.value])
const root = ref<HTMLElement>()
const ready = ref(false)
const message = ref(copy.value.loading)
const resultHtml = ref('')
const error = ref('')
let mounted: DiffMount | undefined
let start: (() => void) | undefined
let disposed = false

function reset() {
  start?.()
}

onMounted(async () => {
  try {
    const [core, diff] = await Promise.all([import('nabi-note'), import('nabi-note/diff')])
    if (disposed || !root.value) return
    const registry = core.makeRegistry(core.wings().allBasic().build())
    start = () => {
      mounted?.unmount()
      error.value = ''
      const text = copy.value
      const before = demoDocument(text.compareTitle, [text.beforeTime, text.place, text.cup])
      const after = demoDocument(text.compareTitle, [text.afterTime, text.place, text.laptop, text.free])
      let accepted = 0
      message.value = props.merge ? text.compareHint : text.compareLabel
      resultHtml.value = after
      mounted = diff.mountDiff({
        root: root.value!,
        before,
        after,
        registry,
        locale: locale.value,
        ...(props.merge ? {
          onMerge(proposal: DiffMergeProposal) {
            if (proposal.signal.aborted || !mounted?.update(proposal.before, proposal.result, proposal.revision)) return
            resultHtml.value = core.renderStoredHtml(proposal.result, registry) ?? ''
            message.value = text.applied.replace('{count}', String(++accepted))
          },
        } : {}),
        onError() {
          error.value = copy.value.error
        },
      })
    }
    ready.value = true
    start()
  } catch {
    error.value = copy.value.error
  }
})

watch([locale, () => props.merge], () => start?.())

onBeforeUnmount(() => {
  disposed = true
  mounted?.unmount()
})
</script>

<style scoped>
.compare-demo { margin: 1.25rem 0 2rem; }
.demo-actions { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-bottom: 0; }
.demo-actions p { margin: 0; color: var(--g-muted); font-size: .85rem; }
.demo-actions button { flex-shrink: 0; }
.compare-host { min-height: 16rem; border: 1px solid var(--g-border); border-radius: .5rem; }
details { margin-top: .75rem; }
summary { cursor: pointer; font-size: .85rem; }
.demo-result { padding: 1rem; border: 1px solid var(--g-border); margin-top: .5rem; border-radius: .5rem; }
[role="alert"] { color: #c44040; }
@media (max-width: 36rem) { .demo-actions { align-items: flex-start; } }
</style>
