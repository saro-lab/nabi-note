<!-- Labels are text, not an image, so each locale's md passes its own words and the diagram stays translatable and searchable -->
<!-- 라벨이 이미지가 아니라 글자라 로케일별 md 가 자기 말로 넘긴다 — 번역·검색이 된다 -->
<template>
  <figure class="fc">
    <div class="fc-row">
      <template v-for="(step, index) in steps" :key="`${index}-${step.label}`">
        <span v-if="index > 0" class="fc-arrow" aria-hidden="true"></span>
        <div class="fc-box" :class="step.kind ?? 'plain'">
          <span class="fc-label">{{ step.label }}</span>
          <span v-if="step.note" class="fc-note">{{ step.note }}</span>
        </div>
      </template>
    </div>
    <figcaption v-if="caption" class="fc-caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
// `kind` names the position on the path, not a color: incoming, the gate everything passes, the core, outgoing
// `kind` 는 색이 아니라 자리를 말한다 — 밖에서 온 것 · 반드시 지나는 관문 · 안쪽 · 밖으로 나가는 것
// `danger`/`safe` are the two the XSS guide adds: a step that runs the attack, and one that ends it
// `danger`/`safe` 는 XSS 가이드가 더한 둘이다 — 공격이 도는 칸과 공격이 끝나는 칸
export interface FlowStep {
  readonly label: string
  readonly note?: string
  readonly kind?: 'in' | 'gate' | 'core' | 'out' | 'danger' | 'safe'
}

defineProps<{ steps: readonly FlowStep[]; caption?: string }>()
</script>

<style scoped>
.fc {
  margin: 1.25rem 0;
}

.fc-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0.4rem;
}

.fc-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--g-border);
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 4%, transparent);
}

.fc-label {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.4;
}

.fc-note {
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--g-muted);
}

/* Dashed because it isn't ours yet */
/* 밖에서 들어오는 것 — 아직 우리 것이 아니라 점선으로 둔다 */
.fc-box.in {
  border-style: dashed;
}

/* The only box using the accent — it is the most important cell in the diagram */
/* 이 그림에서 가장 중요한 칸이라 유일하게 강조색을 쓴다 */
.fc-box.gate {
  border-color: color-mix(in srgb, var(--g-accent) 55%, transparent);
  background: color-mix(in srgb, var(--g-accent) 12%, transparent);
}

.fc-box.core {
  border-color: color-mix(in srgb, currentColor 28%, transparent);
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.fc-box.out {
  border-style: dashed;
  border-color: color-mix(in srgb, var(--g-accent) 45%, transparent);
}

.fc-box.danger {
  border-color: color-mix(in srgb, var(--g-danger) 60%, transparent);
  background: color-mix(in srgb, var(--g-danger) 12%, transparent);
}

.fc-box.danger .fc-label {
  color: var(--g-danger);
}

.fc-box.safe {
  border-color: color-mix(in srgb, var(--g-safe) 60%, transparent);
  background: color-mix(in srgb, var(--g-safe) 12%, transparent);
}

.fc-box.safe .fc-label {
  color: var(--g-safe);
}

.fc-arrow {
  align-self: center;
  position: relative;
  flex: 0 0 auto;
  width: 1.5rem;
  height: 0;
  border-top: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.fc-arrow::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -4px;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 7px solid color-mix(in srgb, currentColor 35%, transparent);
}

.fc-caption {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--g-muted);
}

/* Stacks when narrow — boxes take the full width and only the arrows rotate downward */
/* 좁으면 세로로 선다 — 상자는 폭을 다 쓰고 화살표만 아래를 향해 돈다 */
@media (max-width: 40rem) {
  .fc-row {
    flex-direction: column;
    align-items: stretch;
  }

  .fc-arrow {
    align-self: flex-start;
    margin-left: 1.2rem;
    transform: rotate(90deg);
  }
}
</style>
