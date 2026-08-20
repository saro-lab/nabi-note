<!-- The array is passed bottom layer first and drawn reversed — stacking goes upward, so a top-first list would contradict the word -->
<!-- 넘기는 배열은 아래층이 먼저고 화면에서는 뒤집어 그린다 — 쌓인다는 말과 그림이 반대가 되지 않게 -->
<!-- Layers alone: the arrow rail and its vertical label are gone (owner, 2026-08-16) — the stack says it already -->
<!-- 층만 남긴다 — 화살표 눈금과 세로 글씨는 걷었다 (주인 2026-08-16). 쌓인 모양이 이미 그 말을 한다 -->
<template>
  <figure class="ls">
    <div class="ls-stack">
      <div v-for="layer in reversed" :key="layer.name" class="ls-row">
        <code class="ls-name">{{ layer.name }}</code>
        <span class="ls-what">{{ layer.what }}</span>
      </div>
    </div>
    <figcaption v-if="caption" class="ls-caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface Layer {
  // The folder name verbatim, which is why it is drawn in a code font
  // 폴더 이름 그대로라 코드 글꼴로 그린다
  readonly name: string
  readonly what: string
}

const props = defineProps<{
  layers: readonly Layer[]
  caption?: string
}>()

const reversed = computed(() => [...props.layers].reverse())
</script>

<style scoped>
.ls {
  margin: 1.25rem 0;
}

.ls-stack {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.ls-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.15rem 0.7rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--g-border);
  border-radius: 8px;
  background: color-mix(in srgb, currentColor 4%, transparent);
}

.ls-name {
  flex: 0 0 5.5rem;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--g-accent);
}

.ls-what {
  flex: 1 1 12rem;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--g-muted);
}

.ls-caption {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--g-muted);
}

/* 좁으면 이름이 한 줄을 통째로 갖는다 */
/* When narrow the name takes a whole row of its own */
@media (max-width: 40rem) {
  .ls-name {
    flex-basis: 100%;
  }
}
</style>
