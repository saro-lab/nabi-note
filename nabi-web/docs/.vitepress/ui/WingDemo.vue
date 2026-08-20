<!-- The page only passes its own path; `src/wings.ts` owns the picking rule, so adding docs never touches this component -->
<!-- 페이지는 자기 경로만 넘긴다 — 고르는 규칙은 `src/wings.ts` 에 있어 문서를 늘려도 그대로다 -->
<template>
  <EditorDemo :wings="wings" :sample="sample" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EditorDemo from './EditorDemo.vue'
import { wingsFor } from '../src/wings.ts'
import { sampleKeyFor } from '../src/sample.ts'

const props = defineProps<{ path: string }>()

const wings = computed(() => wingsFor(props.path))
// A short text using that wing — the home sample would mostly fall to plain text here
// 그 wing 을 쓴 짧은 글이다 — 홈의 긴 예시는 여기서 대부분 평문으로 떨어져 지저분하다
// 넘기는 것은 이름표뿐이다 — 그 이름의 나비트리를 여는 일은 데모가 한다
// Only the name travels; the demo opens the tree that goes with it
const sample = computed(() => sampleKeyFor(props.path))
</script>
