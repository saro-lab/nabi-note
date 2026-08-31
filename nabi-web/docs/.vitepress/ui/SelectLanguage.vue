<!-- 떠나는 것으로 닫지 않는다 — 버튼·목록 사이 틈 때문에 손이 닿기 전에 닫혀 고를 수 없었다. -->
<!-- Never close on pointer leave: the gap between button and list once closed it before the hand arrived. -->
<!-- 닫는 길은 셋뿐이다: 바깥 누름·Escape·골랐음 — 전부 포인터 경로와 무관하다. -->
<!-- The three ways to close all mean "the user is done", regardless of where the pointer travels. -->
<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="hdr-btn g-link-hover gap-1 px-2 text-[0.9rem] font-medium"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Icon name="language" :weight="1.6" class="text-[1.05rem]!" />
      <!-- 지금 언어가 버튼 이름을 대신한다 — 폰 폭에선 물러나되(언어마다 폭이 크게 달라) 지구본만 남는다. -->
      <!-- The current language names the button; it drops on phone width (lengths vary a lot per language), leaving the globe. -->
      <!-- 문턱은 theme/Layout.vue의 GitHub 마크와 같은 값이어야 한다 — 어긋나면 줄이 두 번에 걸쳐 야위어 보인다. -->
      <!-- This threshold must match the GitHub mark's in theme/Layout.vue, or the bar thins out in two steps. -->
      <span translate="no" class="@max-[32rem]:hidden!">{{ langName }}</span>
    </button>

    <!-- top-full로 버튼 아래 모서리에 건다 — 고정 top은 거친 포인터에서 커지는 hdr-btn 밑으로 파고들었다. -->
    <!-- Hung on the button's own bottom edge (top-full); a fixed top slid underneath hdr-btn's touch-size growth. -->
    <!-- 오른쪽이 아니라 글의 방향 쪽 모서리에 건다 — RTL에서 물리 속성 right-0은 레이아웃을 뚫고 나갔다(우르두, 94px). -->
    <!-- Anchored on the inline edge, not the physical right: right-0 broke out of frame on RTL (Urdu, 94px). -->
    <div
      v-if="open"
      ref="panel"
      role="dialog"
      aria-label="language"
      :style="shift ? { transform: `translateX(${shift}px)` } : undefined"
      class="lang-menu g-glass absolute top-full z-50 mt-1 w-[10rem] rounded-xl py-1.5 text-center"
    >
      <input
        ref="searchInput"
        :value="query"
        type="text"
        class="lang-search mb-1.5 block w-full px-3 py-1.5 text-center text-[0.875rem]"
        placeholder="language"
        aria-label="language"
        @compositionstart="composing = true"
        @compositionend="onCompositionEnd"
        @input="onInput"
        @keydown="onSearchKeyDown"
      />
      <!-- 한 줄은 헤더 단추와 같은 자를 쓴다 — 손가락 맞춤 2.75rem은 거친 포인터에서만 부른다(아래 style). -->
      <!-- A row matches the header's own button measure; the finger-sized 2.75rem only applies where the pointer is coarse. -->
      <button
        v-for="([code, name], index) in filteredLanguages"
        :key="code"
        type="button"
        translate="no"
        class="lang-item flex w-full items-center justify-center px-3 py-1.5 text-[0.875rem] g-link-hover"
        :class="{ 'font-semibold lang-item-active': index === activeIndex }"
        @click="pick(code)"
      >
        {{ name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { applyLanguage, languageList, languageMatches, languageRandom } from '../src/langs.ts'

// localeIndex가 아니라 lang을 본다 — 루트 로케일은 'root'라 어느 언어도 가리키지 않는다.
// `lang`, not `localeIndex` — the root locale reports 'root', which names no language.
const { lang } = useData()
// 페이지가 뜰 때 한 번만 섞는다 — 열 때마다 섞으면 고르러 가는 손 밑에서 목록이 다시 늘어선다.
// Shuffled once per page load, not per open, or the list would rearrange under the reaching hand.
const languages = languageRandom()
const langName = computed(() => (languageList as Record<string, string>)[lang.value] ?? lang.value)
const query = ref('')
const activeIndex = ref(-1)
const composing = ref(false)
const filteredLanguages = computed(() => languages.filter(([code, name]) => code !== lang.value && languageMatches(code, name, query.value)))
watch(query, () => {
  activeIndex.value = filteredLanguages.value.length ? 0 : -1
})

const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const open = ref(false)

// 방향 쪽 모서리에 걸고도 밖에 남는 만큼을 도로 끌어들인다 — 목록이 버튼보다 넓어 프레임을 넘길 수 있다.
// Pulls back whatever the inline edge leaves hanging outside; the list is wider than the button and can overflow the frame.
const shift = ref(0)
const EDGE = 8

function clamp(): void {
  const el = panel.value
  if (!el) return
  shift.value = 0
  void el.offsetWidth
  const box = el.getBoundingClientRect()
  const frame = root.value?.closest('.g-frame')?.getBoundingClientRect()
  const min = (frame?.left ?? 0) + EDGE
  const max = (frame?.right ?? window.innerWidth) - EDGE
  if (box.left < min) shift.value = min - box.left
  else if (box.right > max) shift.value = max - box.right
}

// click이 아니라 pointerdown으로 듣는다 — 항목의 click보다 먼저 와서 순서를 따질 일이 없다.
// pointerdown, not click: it lands before the item's click, so containment is the only test needed.
function onPointerDown(event: Event): void {
  const target = event.target as Node | null
  if (target && root.value?.contains(target)) return
  open.value = false
}

function onKeyDown(event: Event): void {
  if ((event as KeyboardEvent).key === 'Escape') open.value = false
}

function onInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value
}

function onCompositionEnd(event: CompositionEvent): void {
  composing.value = false
  query.value = (event.target as HTMLInputElement).value
}

function onSearchKeyDown(event: KeyboardEvent): void {
  if (composing.value || event.isComposing) return

  const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  if (!direction && event.key !== 'Enter') return

  const items = filteredLanguages.value
  if (!items.length) return

  event.preventDefault()
  if (event.key === 'Enter') {
    if (activeIndex.value >= 0) pick(items[activeIndex.value][0])
    return
  }

  activeIndex.value = activeIndex.value < 0
    ? direction > 0 ? 0 : items.length - 1
    : (activeIndex.value + direction + items.length) % items.length
}

// 리스너는 열려 있는 동안에만 산다 — 닫힌 상자가 문서 이벤트를 듣고 있을 이유가 없다.
// Listeners live only while open — a closed menu has no business listening on the document.
watch(open, async (value) => {
  const method = value ? 'addEventListener' : 'removeEventListener'
  document[method]('pointerdown', onPointerDown)
  document[method]('keydown', onKeyDown)
  window[method]('resize', clamp)
  if (!value) {
    shift.value = 0
    query.value = ''
    activeIndex.value = -1
    return
  }
  await nextTick()
  clamp()
  searchInput.value?.focus()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('resize', clamp)
})

function pick(code: string): void {
  open.value = false
  applyLanguage(code)
}
</script>

<style scoped>
/* 방향을 따라 뒤집히는 모서리 — LTR이면 오른쪽, RTL이면 왼쪽에 걸린다. */
/* The edge that flips with the text direction: right in LTR, left in RTL. */
.lang-menu {
  inset-inline-end: 0;
}

.lang-search {
  color: inherit;
  background: color-mix(in srgb, var(--g-bg) 68%, transparent);
  border: 0;
  outline: none;
}

/* 헤더가 안의 모든 것에 line-height:1을 건다(Layout.vue) — 목록은 여러 줄이라 그대로 두면 이름이 달라붙는다. */
/* The header presses line-height:1 onto everything inside it (Layout.vue); the multi-line list needs it undone here. */
.lang-menu .lang-item {
  line-height: 1.25rem;
  opacity: 0.9;
}

.lang-menu .lang-item:hover,
.lang-menu .lang-item:focus-visible {
  color: var(--g-accent);
  font-weight: 600;
  opacity: 1;
}

.lang-menu .lang-item-active {
  color: var(--g-accent);
  font-weight: 600;
  opacity: 1;
}

/* 손가락은 커서가 아니다 — 거친 포인터에서만 줄을 손에 맞게 키운다(.hdr-btn과 같은 값). */
/* A finger is not a cursor: rows grow to the hand only where the pointer is coarse, matching .hdr-btn. */
@media (pointer: coarse) {
  .lang-item {
    min-height: 2.75rem;
  }
}
</style>
