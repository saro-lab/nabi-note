<!-- Two fans sharing one core box: several sources converge in, several targets fan back out -->
<!-- 갈래 둘이 코어 상자 하나를 공유한다 — 왼쪽 여럿이 모여들고, 오른쪽 여럿으로 다시 갈라진다 -->
<!-- Labels are text, not an image, so each locale's md passes its own words and the diagram stays translatable and searchable -->
<!-- 라벨이 이미지가 아니라 글자라 로케일별 md 가 자기 말로 넘긴다 — 번역·검색이 된다 -->
<template>
  <figure class="fh">
    <div class="fh-scroll">
    <div class="fh-row">
      <div class="fh-sources">
        <div v-for="(step, index) in sources" :key="`s-${index}-${step.label}`" class="fh-slot-in">
          <div class="fh-box" :class="step.kind ?? 'plain'">
            <span class="fh-label">{{ step.label }}</span>
            <span v-if="step.note" class="fh-note">{{ step.note }}</span>
          </div>
          <span class="fh-stub-in" aria-hidden="true"></span>
        </div>
      </div>
      <span class="fh-trunk-in" aria-hidden="true"></span>
      <div class="fh-box fh-core" :class="core.kind ?? 'core'">
        <span class="fh-label">{{ core.label }}</span>
        <span v-if="core.note" class="fh-note">{{ core.note }}</span>
      </div>
      <span class="fh-trunk-out" aria-hidden="true"></span>
      <div class="fh-targets">
        <div v-for="(step, index) in targets" :key="`t-${index}-${step.label}`" class="fh-slot-out">
          <span class="fh-link-out" aria-hidden="true"></span>
          <div class="fh-box" :class="step.kind ?? 'plain'">
            <span class="fh-label">{{ step.label }}</span>
            <span v-if="step.note" class="fh-note">{{ step.note }}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
    <figcaption v-if="caption" class="fh-caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
// Same `kind` tokens as FlowChain/FlowFan — they name the position on the path, not a color
// FlowChain/FlowFan 과 같은 `kind` 토큰 — 색이 아니라 자리를 말하는 이름이라 여기서도 뜻이 같다
export interface HubStep {
  readonly label: string
  readonly note?: string
  readonly kind?: 'in' | 'gate' | 'core' | 'out'
}

defineProps<{ sources: readonly HubStep[]; core: HubStep; targets: readonly HubStep[]; caption?: string }>()
</script>

<style scoped>
.fh {
  margin: 1.25rem 0;
}

/* The shape (fan-in → core → fan-out) doesn't reflow into something narrower without losing its point —
   so instead of forcing a cramped stack, this wrapper scrolls sideways once it no longer fits. */
/* 이 모양(모여듦→코어→갈라짐)은 뜻을 잃지 않고는 더 좁게 접히지 않는다 — 그래서 억지로 욱여넣는 대신
   안 들어가면 이 감싸개가 옆으로 스크롤한다. */
.fh-scroll {
  overflow-x: auto;
}

.fh-row {
  display: flex;
  align-items: center;
  width: max-content;
}

.fh-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--g-border);
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 4%, transparent);
  flex-shrink: 0;
}

.fh-core {
  flex: 0 1 auto;
}

.fh-label {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.4;
}

.fh-note {
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--g-muted);
}

.fh-box.in {
  border-style: dashed;
}

.fh-box.gate {
  border-color: color-mix(in srgb, var(--g-accent) 55%, transparent);
  background: color-mix(in srgb, var(--g-accent) 12%, transparent);
}

.fh-box.core {
  border-color: color-mix(in srgb, currentColor 28%, transparent);
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.fh-box.out {
  border-style: dashed;
  border-color: color-mix(in srgb, var(--g-accent) 45%, transparent);
}

.fh-sources,
.fh-targets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Fan-in: each source keeps its own stub, all stubs meet a shared spine, one trunk carries the merge into the core */
/* 안으로 모이는 쪽 — 근원마다 제 줄기를 갖고, 그 줄기들이 공유 등뼈에서 만나 몸통 하나로 코어에 든다 */
.fh-slot-in {
  position: relative;
  padding-right: 1.75rem;
}

.fh-slot-in::after {
  content: '';
  position: absolute;
  right: 0;
  top: -0.5rem;
  bottom: -0.5rem;
  border-right: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.fh-slot-in:first-child::after {
  top: 50%;
}

.fh-slot-in:last-child::after {
  bottom: 50%;
}

/* No arrowhead here — it doesn't point into a box yet, only into the shared spine (same idea as FlowFan's trunk) */
/* 여기엔 화살촉이 없다 — 아직 상자가 아니라 공유 등뼈로 들어갈 뿐이다 (FlowFan 의 줄기와 같은 생각) */
.fh-stub-in {
  position: absolute;
  right: 0;
  top: 50%;
  width: 1.75rem;
  height: 0;
  border-top: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

/* The merge — the only fan-in arrowhead, pointing straight into the core */
/* 합류 지점 — 안으로 모이는 쪽에서 유일한 화살촉이고, 코어로 곧장 든다 */
.fh-trunk-in {
  flex: 0 0 auto;
  position: relative;
  width: 1.25rem;
  height: 0;
  border-top: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.fh-trunk-in::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -4px;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 7px solid color-mix(in srgb, currentColor 35%, transparent);
}

/* Fan-out: identical shape to FlowFan's source→targets half */
/* 밖으로 갈라지는 쪽 — FlowFan 의 근원→갈래 절반과 같은 모양이다 */
.fh-trunk-out {
  flex: 0 0 auto;
  width: 1.25rem;
  height: 0;
  border-top: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.fh-slot-out {
  position: relative;
  padding-left: 1.75rem;
}

.fh-slot-out::before {
  content: '';
  position: absolute;
  left: 0;
  top: -0.5rem;
  bottom: -0.5rem;
  border-left: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.fh-slot-out:first-child::before {
  top: 50%;
}

.fh-slot-out:last-child::before {
  bottom: 50%;
}

.fh-link-out {
  position: absolute;
  left: 0;
  top: 50%;
  width: 1.75rem;
  height: 0;
  border-top: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.fh-link-out::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -4px;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 7px solid color-mix(in srgb, currentColor 35%, transparent);
}

.fh-caption {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--g-muted);
}

</style>
