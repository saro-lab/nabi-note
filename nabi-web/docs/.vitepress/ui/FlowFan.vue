<!-- A fan, not a chain: one source on the left feeds every box on the right, and none of them feeds another -->
<!-- 사슬이 아니라 갈래다 — 왼쪽 근원 하나가 오른쪽 전부를 먹이고, 오른쪽끼리는 서로를 안 부른다 -->
<!-- FlowChain stays as it is: the XSS guide uses it as a real chain. This one exists because getHtml/getJson/getEditorHtml are siblings (089) -->
<!-- FlowChain 은 그대로 둔다 — XSS 가이드가 진짜 사슬로 쓴다. 이 부품은 getHtml/getJson/getEditorHtml 이 형제라서 생겼다 (089) -->
<!-- Labels are text, not an image, so each locale's md passes its own words and the diagram stays translatable and searchable -->
<!-- 라벨이 이미지가 아니라 글자라 로케일별 md 가 자기 말로 넘긴다 — 번역·검색이 된다 -->
<template>
  <figure class="ff">
    <div class="ff-row">
      <div class="ff-box ff-source" :class="source.kind ?? 'plain'">
        <span class="ff-label">{{ source.label }}</span>
        <span v-if="source.note" class="ff-note">{{ source.note }}</span>
      </div>
      <span class="ff-trunk" aria-hidden="true"></span>
      <div class="ff-targets">
        <div v-for="(step, index) in targets" :key="`${index}-${step.label}`" class="ff-slot">
          <span class="ff-link" aria-hidden="true"></span>
          <div class="ff-box" :class="step.kind ?? 'plain'">
            <span class="ff-label">{{ step.label }}</span>
            <span v-if="step.note" class="ff-note">{{ step.note }}</span>
          </div>
        </div>
      </div>
    </div>
    <figcaption v-if="caption" class="ff-caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
// Same `kind` tokens as FlowChain — they name the position on the path, not a color
// FlowChain 과 같은 `kind` 토큰 — 색이 아니라 자리를 말하는 이름이라 갈래 그림에서도 뜻이 같다
export interface FanStep {
  readonly label: string
  readonly note?: string
  readonly kind?: 'in' | 'gate' | 'core' | 'out'
}

defineProps<{ source: FanStep; targets: readonly FanStep[]; caption?: string }>()
</script>

<style scoped>
.ff {
  margin: 1.25rem 0;
}

/* No gap on purpose — the trunk line must touch the source box and the spine */
/* 일부러 gap 이 없다 — 줄기 선이 근원 상자와 등뼈에 닿아야 한다 */
.ff-row {
  display: flex;
  align-items: center;
}

.ff-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--g-border);
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 4%, transparent);
}

.ff-source {
  flex: 0 1 auto;
}

.ff-label {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.4;
}

.ff-note {
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--g-muted);
}

.ff-box.in {
  border-style: dashed;
}

.ff-box.gate {
  border-color: color-mix(in srgb, var(--g-accent) 55%, transparent);
  background: color-mix(in srgb, var(--g-accent) 12%, transparent);
}

.ff-box.core {
  border-color: color-mix(in srgb, currentColor 28%, transparent);
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.ff-box.out {
  border-style: dashed;
  border-color: color-mix(in srgb, var(--g-accent) 45%, transparent);
}

/* The stub from the source to the spine — sits at the row's vertical center, which is the spine's center too */
/* 근원에서 등뼈로 가는 줄기 — 줄의 세로 중앙에 서고, 그 지점이 곧 등뼈의 중앙이다 */
.ff-trunk {
  flex: 0 0 auto;
  width: 1.25rem;
  height: 0;
  border-top: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.ff-targets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.ff-slot {
  position: relative;
  padding-left: 1.75rem;
}

/* The spine — each slot draws its own segment; the first and last stop at their own centers */
/* 등뼈 — 칸마다 제 구간을 그리고, 첫 칸과 끝 칸은 제 중앙에서 멈춘다 */
.ff-slot::before {
  content: '';
  position: absolute;
  left: 0;
  top: -0.5rem;
  bottom: -0.5rem;
  border-left: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.ff-slot:first-child::before {
  top: 50%;
}

.ff-slot:last-child::before {
  bottom: 50%;
}

/* One branch line per target, arrowhead pointing into the box — same stroke as FlowChain's arrows */
/* 갈래 선 하나에 화살촉 하나 — FlowChain 의 화살과 같은 굵기·같은 색이다 */
.ff-link {
  position: absolute;
  left: 0;
  top: 50%;
  width: 1.75rem;
  height: 0;
  border-top: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
}

.ff-link::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -4px;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 7px solid color-mix(in srgb, currentColor 35%, transparent);
}

.ff-caption {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--g-muted);
}

/* Stacks when narrow — the source goes on top, the trunk turns downward, the spine keeps the branches */
/* 좁으면 세로로 선다 — 근원이 위로 가고 줄기가 아래를 향해 꺾이며, 갈래는 등뼈가 그대로 잇는다 */
@media (max-width: 40rem) {
  .ff-row {
    flex-direction: column;
    align-items: stretch;
  }

  .ff-trunk {
    align-self: flex-start;
    width: 0;
    height: 1rem;
    margin-left: 1.2rem;
    border-top: none;
    border-left: 1.5px solid color-mix(in srgb, currentColor 35%, transparent);
  }

  .ff-slot {
    padding-left: 2.65rem;
  }

  .ff-slot::before {
    left: 1.2rem;
  }

  .ff-slot:first-child::before {
    top: 0;
  }

  .ff-link {
    left: 1.2rem;
    width: 1.45rem;
  }
}
</style>
