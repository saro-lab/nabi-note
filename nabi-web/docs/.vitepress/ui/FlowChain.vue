<template>
  <figure class="flow-chain">
    <div class="flow-chain-scroll">
      <ol class="flow-chain-row">
        <li v-for="(step, index) in steps" :key="`${index}-${step.label}`" class="flow-chain-step">
          <div class="flow-chain-card" :class="step.kind ?? 'plain'">
            <strong>{{ step.label }}</strong>
            <span v-if="step.note">{{ step.note }}</span>
          </div>
        </li>
      </ol>
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
export interface FlowStep {
  readonly label: string
  readonly note?: string
  readonly kind?: 'plain' | 'input' | 'core' | 'output' | 'warning'
}

defineProps<{ steps: readonly FlowStep[]; caption?: string }>()
</script>

<style scoped>
.flow-chain { margin: 1.4rem 0; }
.flow-chain-scroll { overflow-x: auto; padding: 0.15rem; }
.flow-chain-row { display: flex; align-items: stretch; width: max-content; min-width: 100%; margin: 0; padding: 0; list-style: none; }
.flow-chain-step { display: flex; align-items: center; }
.flow-chain-step:not(:last-child)::after { content: ''; width: 1.6rem; border-top: 1.5px solid color-mix(in srgb, currentColor 35%, transparent); position: relative; }
.flow-chain-step:not(:last-child)::before { content: ''; order: 2; margin-left: -0.4rem; z-index: 1; border-top: 4px solid transparent; border-bottom: 4px solid transparent; border-left: 7px solid color-mix(in srgb, currentColor 35%, transparent); }
.flow-chain-card { display: flex; flex-direction: column; justify-content: center; gap: 0.18rem; width: 10.5rem; min-height: 4.4rem; padding: 0.65rem 0.75rem; border: 1px solid var(--g-border); border-radius: 0.65rem; background: color-mix(in srgb, currentColor 3%, transparent); }
.flow-chain-card strong { line-height: 1.35; font-size: 0.92rem; }
.flow-chain-card span { color: var(--g-muted); font-size: 0.78rem; line-height: 1.45; }
.flow-chain-card.input { border-style: dashed; }
.flow-chain-card.core { border-color: color-mix(in srgb, var(--g-accent) 55%, transparent); background: color-mix(in srgb, var(--g-accent) 11%, transparent); }
.flow-chain-card.output { border-color: color-mix(in srgb, var(--g-safe) 55%, transparent); }
.flow-chain-card.warning { border-color: color-mix(in srgb, var(--g-danger) 55%, transparent); }
figcaption { margin-top: 0.55rem; color: var(--g-muted); font-size: 0.82rem; line-height: 1.6; }
</style>
