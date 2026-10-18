<template>
  <section class="not-md merge-demo" :aria-label="partial ? copy.partialLabel : copy.mergeLabel">
    <div class="demo-actions">
      <p role="status">{{ message }}</p>
      <button class="chip" type="button" :disabled="!ready" @click="reset">{{ copy.reset }}</button>
    </div>
    <div ref="root" class="demo-host nabi merge-host"></div>
    <details v-if="submittedHtml" open>
      <summary>{{ copy.finalResult }}</summary>
      <div class="nabi-content demo-result" v-html="submittedHtml"></div>
    </details>
    <p v-if="error" role="alert">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { comparisonCopy, demoDocument } from '../src/compare-merge.ts'
import { localeFromPath } from '../src/langs.ts'
import type { MergeMount } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const props = defineProps<{ partial?: boolean }>()
const { lang } = useData()
const locale = computed(() => localeFromPath(`/${lang.value}/`))
const copy = computed(() => comparisonCopy[locale.value])
const root = ref<HTMLElement>()
const ready = ref(false)
const message = ref(copy.value.loading)
const submittedHtml = ref('')
const error = ref('')
let mounted: MergeMount | undefined
let unsubscribe: (() => void) | undefined
let start: (() => void) | undefined
let disposed = false

function reset() {
  start?.()
}

onMounted(async () => {
  try {
    const [core, merge] = await Promise.all([import('nabi-note'), import('nabi-note/merge')])
    if (disposed || !root.value) return
    const selectedWings = core.wings().allBasic().build()
    start = () => {
      unsubscribe?.()
      mounted?.unmount()
      error.value = ''
      submittedHtml.value = ''
      let lastRevision = -1
      const text = copy.value
      const documentHtml = (time: string, owner: string, room: string) =>
        demoDocument(text.mergeTitle, [time, text.agenda, owner, text.materials, room])
      const base = documentHtml(text.timeBase, text.owner, text.roomBase)
      const local = documentHtml(text.timeLocal, props.partial ? text.owners : text.owner, text.roomBase)
      const incoming = documentHtml(props.partial ? text.timeIncoming : text.timeBase, text.owner, text.roomIncoming)
      mounted = merge.mountMerge({
        root: root.value!,
        base,
        local,
        incoming,
        wings: selectedWings,
        locale: locale.value,
        incomingVersion: 'demo-2',
        onConfirm(result) {
          submittedHtml.value = result.html
          message.value = text.confirmed
        },
        onError() {
          error.value = copy.value.error
        },
      })
      const refresh = () => {
        const state = mounted!.session.getState()
        if (lastRevision !== state.revision) submittedHtml.value = ''
        lastRevision = state.revision
        if (submittedHtml.value) return
        message.value = state.unresolvedCount
          ? text.remaining.replace('{count}', String(state.unresolvedCount))
          : text.ready
      }
      unsubscribe = mounted.session.onChange(refresh)
      refresh()
    }
    ready.value = true
    start()
  } catch {
    error.value = copy.value.error
  }
})

watch(locale, () => start?.())

onBeforeUnmount(() => {
  disposed = true
  unsubscribe?.()
  mounted?.unmount()
})
</script>

<style scoped>
.merge-demo { margin: 1.25rem 0 2rem; }
.demo-actions { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-bottom: .75rem; }
.demo-actions p { margin: 0; color: var(--g-muted); font-size: .85rem; }
.demo-actions button { flex-shrink: 0; }
.merge-host { min-height: 20rem; border: 1px solid var(--g-border); border-radius: .5rem; }
details { margin-top: .75rem; }
summary { cursor: pointer; font-size: .85rem; }
.demo-result { padding: 1rem; border: 1px solid var(--g-border); margin-top: .5rem; border-radius: .5rem; }
[role="alert"] { color: #c44040; }
@media (max-width: 36rem) { .demo-actions { align-items: flex-start; } }
</style>
