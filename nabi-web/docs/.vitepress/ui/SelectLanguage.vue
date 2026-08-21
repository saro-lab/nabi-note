<!-- Never close on pointer leave: a 0.4rem gap sits between button and list, so the trip down closed it before the hand arrived -->
<!-- 떠나는 것으로 닫지 않는다 — 버튼과 목록 사이 틈 때문에 손이 닿기도 전에 닫혀 고를 수 없었다 -->
<!-- The three ways to close all mean "the user is done", regardless of where the pointer travels -->
<!-- 닫는 길은 셋뿐이다: 바깥 누름 · Escape · 골랐음 — 전부 포인터 경로와 무관하다 -->
<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="hdr-btn g-link-hover gap-1 px-2 text-[0.9rem] font-medium"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Icon name="language" :weight="1.6" class="text-[1.05rem]!" />
      <!-- The current language names the button, so the icon no longer stands alone without a label -->
      <!-- 지금 언어가 버튼의 이름을 대신한다 — 아이콘만 있던 자리에 읽을 것이 생긴다 -->
      <!-- …but the name goes when the bar turns phone-narrow. It is the widest thing in the header
           and the one that varies most (`한국어` against `Português`), so a fixed layout that fits
           one language overflows in another. The globe alone still says what the button is, and the
           name is the first line of the list it opens. The threshold must match the GitHub mark's in
           `theme/Layout.vue` — both give way at the same width, or the bar thins out in two steps. -->
      <!-- …다만 줄이 폰만큼 좁아지면 이름은 물러난다. 헤더에서 가장 넓고 **언어마다 가장 크게
           달라지는** 것이 이 글자다(`한국어` 와 `Português`) — 한 언어에 맞춘 자리가 다른 언어에서
           넘친다. 지구본만 남아도 이 단추가 무엇인지는 말하고, 이름은 열리는 목록의 첫 줄에 있다.
           문턱은 `theme/Layout.vue` 의 GitHub 마크와 같은 값이어야 한다 — 어긋나면 줄이 두 번에
           걸쳐 야위어 보인다. -->
      <span translate="no" class="@max-[32rem]:hidden!">{{ langName }}</span>
    </button>

    <!-- Sized by its longest name, not by a number picked in advance: a fixed 11rem box left a
         gutter of empty glass beside `한국어` and still had to be argued about for `Português`.
         `max-content` lets the fourteen names decide the width together, and the row padding is the
         only air that is actually spelled out.
         No height cap and no scroller of its own: the page already scrolls, and a list that has to
         be scrolled inside itself reads as a list that is missing languages. -->
    <!-- 폭은 가장 긴 이름이 정한다 — 미리 고른 11rem 은 `한국어` 옆에 빈 유리를 남기면서도
         `Português` 앞에서는 여전히 아슬아슬했다. `max-content` 는 이름 열넷이 함께 폭을 정하게
         두고, 손으로 적어 넣는 여백은 줄의 좌우 안쪽 하나뿐이다.
         높이를 자르지 않고 제 스크롤도 안 만든다 — 쪽이 이미 스크롤되고, 목록 안에서 또
         굴려야 하는 것은 언어가 모자란 것으로 읽힌다. -->
    <!-- Hung on the button's own bottom edge (`top-full`), not at a measured height: `hdr-btn` grows
         to 2.75rem where the pointer is coarse, and a fixed `top` that cleared the 2rem desktop
         button slid up underneath the taller touch one. -->
    <!-- 높이를 재어 적지 않고 단추의 아래 모서리(`top-full`)에 건다 — `hdr-btn` 은 거친 포인터에서
         2.75rem 로 자라서, 2rem 데스크톱 단추에 맞춰 적어둔 `top` 은 커진 단추 밑으로 파고들었다. -->
    <!-- Anchored on the inline edge, not the right one: on an RTL page the button sits at the other
         end of the bar, and a physical `right-0` grew the list leftwards straight through the frame
         (Urdu, 94px outside). `inset-inline-end` flips with the text direction, and the clamp below
         catches whatever is left. -->
    <!-- 오른쪽이 아니라 **글의 방향 쪽** 모서리에 건다 — RTL 페이지에서는 버튼이 줄의 반대편에
         앉아, 물리 속성인 `right-0` 이 목록을 왼쪽으로 키워 레이아웃을 뚫고 나갔다(우르두, 94px).
         `inset-inline-end` 는 글의 방향을 따라 뒤집히고, 남는 것은 아래 clamp 가 잡는다. -->
    <div
      v-if="open"
      ref="panel"
      role="menu"
      :style="shift ? { transform: `translateX(${shift}px)` } : undefined"
      class="lang-menu g-glass absolute top-full z-50 mt-1 w-max rounded-xl py-1.5 text-center"
    >
      <!-- A row is a line of text plus a little air, the same measure the header's own buttons use;
           the finger-sized 2.75rem is asked for only where the pointer is coarse (see `<style>`),
           so a mouse gets a list it can read in one glance instead of one it has to travel. -->
      <!-- 한 줄은 글줄에 숨 한 모금을 더한 크기다 — 머리줄의 단추들과 같은 자를 쓴다. 손가락에
           맞춘 2.75rem 은 포인터가 거친 곳에서만 부른다(아래 `<style>`). 마우스는 훑어 내려가는
           목록 대신 한눈에 담기는 목록을 받는다. -->
      <button
        v-for="[code, name] in languages"
        :key="code"
        role="menuitem"
        type="button"
        translate="no"
        class="lang-item flex w-full items-center justify-center px-6 py-1.5 text-[0.875rem] g-link-hover"
        :class="code === lang ? 'font-semibold' : ''"
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
import { applyLanguage, languageList, languageRandom } from '../src/langs.ts'

// `lang`, not `localeIndex` — the root locale reports `'root'`, which names no language
// `localeIndex` 가 아니라 `lang` 을 본다 — 루트 로케일은 `'root'` 라 어느 언어도 가리키지 않는다
const { lang } = useData()
// Shuffled, and shuffled ONCE per page load — not per open, or the list would rearrange itself
// under the hand that is reaching for it. Fourteen languages in a fixed order always put the same
// two on top; a language should not have to be first to be found.
// 섞되 **페이지가 뜰 때 한 번만** 섞는다 — 열 때마다 섞으면 고르러 가는 손 밑에서 목록이 다시
// 늘어선다. 열넷을 고정 순서로 두면 늘 같은 둘이 맨 위에 앉는다. 어떤 언어도 찾아지기 위해
// 첫 줄일 필요는 없다.
const languages = languageRandom()
const langName = computed(() => (languageList as Record<string, string>)[lang.value] ?? lang.value)

const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const open = ref(false)

// Whatever the inline edge leaves hanging outside, this pulls back in. The list is wider than the
// button, so near either end of the bar — or on a narrow phone — it can still reach past the frame.
// Measured against the frame the page is drawn in, falling back to the window.
// 방향 쪽 모서리에 걸고도 밖에 남는 만큼을 도로 끌어들인다. 목록은 버튼보다 넓어서 줄의 어느
// 끝에서든, 좁은 폰에서든 프레임을 넘길 수 있다. 기준은 페이지가 그려지는 그 프레임이고, 없으면 창이다.
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

// `pointerdown`, not `click`: it lands before the item's `click`, so containment is the only test needed
// `click` 이 아니라 `pointerdown` 으로 듣는다 — 항목의 click 보다 먼저 와서 순서를 따질 일이 없다
function onPointerDown(event: Event): void {
  const target = event.target as Node | null
  if (target && root.value?.contains(target)) return
  open.value = false
}

function onKeyDown(event: Event): void {
  if ((event as KeyboardEvent).key === 'Escape') open.value = false
}

// Listeners live only while open — a closed menu has no business listening on the document
// 리스너는 열려 있는 동안에만 산다 — 닫힌 상자가 문서 이벤트를 듣고 있을 이유가 없다
watch(open, async (value) => {
  const method = value ? 'addEventListener' : 'removeEventListener'
  document[method]('pointerdown', onPointerDown)
  document[method]('keydown', onKeyDown)
  window[method]('resize', clamp)
  if (!value) {
    shift.value = 0
    return
  }
  await nextTick()
  clamp()
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
/* 방향을 따라 뒤집히는 모서리 — LTR 이면 오른쪽, RTL 이면 왼쪽에 걸린다 */
/* The edge that flips with the text direction: right in LTR, left in RTL */
/* 폭은 이름이 정하되(`w-max`) 바닥은 두어, 짧은 이름만 있는 언어에서도 단추보다 좁아지지 않는다 */
/* The width is the names' (`w-max`), with a floor so short names never make it narrower than the button */
.lang-menu {
  inset-inline-end: 0;
  min-width: 7rem;
}

/* 머리줄은 제 안의 **모든** 것에 `line-height: 1` 을 건다(`theme/Layout.vue` 의 `.header-content *`)
   — 한 줄짜리 단추들을 위한 자다. 목록은 그 안에 살면서 여러 줄이라, 그대로 두면 글줄이
   글자 높이까지 눌려 이름들이 서로 달라붙는다(실측 14px, dat 은 20px). 여기서 되돌린다.
   선택자를 셋(`.lang-menu .lang-item`)으로 세우는 것이 그 규칙을 이기는 유일한 길이다. */
/* The header presses `line-height: 1` onto *everything* inside it (`.header-content *` in
   `theme/Layout.vue`) — a measure meant for its one-line buttons. The list lives inside the header
   but is many lines, so the names were squeezed to the glyph height (measured 14px against dat's
   20px). Three classes deep is what it takes to outrank that rule. */
.lang-menu .lang-item {
  line-height: 1.25rem;
}

/* 손가락은 커서가 아니다 — 거친 포인터에서만 줄을 손에 맞게 키운다(`.hdr-btn` 과 같은 값) */
/* A finger is not a cursor: the rows grow to the hand only where the pointer is coarse,
   the same 2.75rem the header buttons take */
@media (pointer: coarse) {
  .lang-item {
    min-height: 2.75rem;
  }
}
</style>
