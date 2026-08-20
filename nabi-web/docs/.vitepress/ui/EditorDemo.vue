<!-- 'nabi-note' 는 이번 라운드엔 배포 전 프로토타입이라 dist/exports 가 없다 — vite alias 로 -->
<!-- 형제 저장소(`../../nabi-npm/src`)의 TS 소스를 직접 문다(config.mts 참고). -->
<!-- 'nabi-note' has no dist/exports this round — a vite alias points straight at the sibling -->
<!-- repo's TS source (see config.mts) instead of an npm dependency. -->
<!-- The editor needs `document`, so the module is imported dynamically inside `onMounted`, away from SSR and the first bundle -->
<!-- 에디터는 `document` 위에서만 살 수 있어 `onMounted` 안에서 동적으로 부른다 — SSR·첫 번들에 안 실린다 -->
<!-- Toggling a wing rebuilds the whole assembly (core + toolbar + context toolbar + hints + extras) and hands over the on-screen value, so unregistered markup visibly falls to plain text -->
<!-- wing 을 갈아 끼울 때마다 조립 전체(코어 + 툴바 + 컨텍스트 툴바 + 힌트 + 곁들이)를 다시 만들고 지금 화면의 값을 물려준다 — 껍데기가 벗겨지는 것이 눈에 보여야 한다 -->
<template>
  <section class="not-md">
    <!-- No panel around the switches: the editor is the subject, and a box here only pushed it down -->
    <!-- 스위치를 상자에 담지 않는다 — 주인공은 편집기이고, 상자는 그것을 아래로 밀기만 했다 -->
    <div class="mb-2">
      <div>
        <!-- Light/dark is not repeated here — the header already carries that switch -->
        <!-- 라이트·다크는 여기 두지 않는다 — 머리줄에 이미 있는 스위치다 -->
        <!-- The row is drawn before the core lands: the same fourteen names in a fixed order, laid
             out but invisible. On mount they are shuffled in place and faded in — the box never
             changes size, so nothing below it moves. Shuffling before paint is not an option: the
             server would send one order and the browser another, and hydration would tear. -->
        <!-- 코어를 기다리지 않고 먼저 그린다 — **안 섞은** 고정 순서 열넷을 자리만 잡은 채 투명하게
             둔다(서버와 브라우저가 같아야 이어받는다). mount 뒤 그 자리에서 섞고 색을 들인다.
             상자 크기가 안 변하니 그 아래 문서가 밀리지 않는다. -->
        <div
          class="flex flex-wrap items-center gap-1"
          :class="langsReady ? 'opacity-100 transition-opacity duration-200' : 'opacity-0 pointer-events-none'"
        >
          <button
            v-for="[code, name] in languages"
            :key="code"
            type="button"
            class="chip"
            :class="{ 'chip-on': locale === code }"
            @click="setLocale(code)"
          >
            {{ name }}
          </button>
        </div>

        <!-- Wing picker — every wing starts on unless the page narrows it -->
        <!-- wing 고르기 — 페이지가 좁히지 않으면 기본은 전부 켜짐 -->
        <div class="mt-2 mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.8rem]">
          <!-- On a phone the label is the switch; everywhere else it is just the heading of the list -->
          <!-- 폰에서는 이름표가 곧 스위치다 — 그 밖의 화면에서는 목록의 제목일 뿐이다 -->
          <button
            v-if="foldable"
            class="font-semibold g-link-hover inline-flex items-center gap-0.5"
            type="button"
            :aria-expanded="wingsOpen"
            @click="wingsOpen = !wingsOpen"
          >
            {{ t('demo_wings') }}
            <Icon :name="wingsOpen ? 'expand_less' : 'expand_more'" class="demo-fold-caret" />
          </button>
          <span v-else class="font-semibold">{{ t('demo_wings') }}</span>

          <span class="flex-1"></span>
          <template v-if="wingsShown">
            <button class="g-link-hover underline-offset-2 hover:underline" type="button" @click="setAll(true)">
              {{ t('demo_wings_all') }}
            </button>
            <button class="g-link-hover underline-offset-2 hover:underline" type="button" @click="setAll(false)">
              {{ t('demo_wings_none') }}
            </button>
          </template>
        </div>

        <!-- No mark in front: the tint says on or off, and twenty-odd icons cost a whole row of height -->
        <!-- 앞에 표를 두지 않는다 — 켜짐은 물든 색이 말하고, 아이콘 스물은 줄 높이를 통째로 한 줄 먹는다 -->
        <!-- Every wing is listed, on or off — an off chip is the point, not clutter to hide -->
        <!-- 켜졌든 꺼졌든 전부 늘어놓는다 — 꺼진 칩이 요점이지 감출 잡동사니가 아니다 -->
        <div v-if="wingsShown" class="flex flex-wrap gap-1">
          <label v-for="item in catalog" :key="item.id" class="chip" :class="{ 'chip-on': picked[item.id] }">
            <input v-model="picked[item.id]" type="checkbox" class="sr-only" />
            {{ item.label }}
          </label>
        </div>
      </div>
    </div>

    <!-- Page zoom for the demo: it drives the root font-size, so every rem on the page follows at once -->
    <!-- 데모용 확대·축소 — 루트 글자 크기를 몰아 rem 으로 적힌 화면 전체가 한 번에 따라온다 -->
    <div class="mb-2 flex items-center gap-2 text-[0.8rem]">
      <!-- Inline SVG, not an icon-font ligature: the font arrives late and the literal word
           "zoom_in" flashes in its place first -->
      <!-- 아이콘 글꼴의 리거처가 아니라 **인라인 SVG** 다 — 글꼴이 늦게 오면 그 자리에 글자
           "zoom_in" 이 그대로 한 번 보였다가 바뀐다(주인 신고 2026-08-19). 그림은 안 튄다. -->
      <svg
        class="demo-zoom-icon text-[var(--g-muted)]"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <title>{{ t('demo_zoom') }}</title>
        <circle cx="7" cy="7" r="4.25" />
        <path d="m10.2 10.2 3.05 3.05M5.25 7h3.5M7 5.25v3.5" />
      </svg>

      <!-- The drag only moves the readout; the page is rescaled on release, or every step reflows it and it shakes -->
      <!-- 끄는 동안은 숫자만 움직인다 — 화면은 손을 뗄 때 다시 그린다. 매 걸음 바꾸면 화면이 떤다 -->
      <input
        v-if="roomForRange"
        class="demo-zoom"
        type="range"
        :value="draft"
        :min="ZOOM_MIN"
        :max="ZOOM_MAX"
        step="5"
        :aria-label="t('demo_zoom')"
        @input="draft = Number(($event.target as HTMLInputElement).value)"
        @change="applyZoom(draft)"
      />

      <!-- Same chips as the wing switches, so the row reads as one family rather than a second toolbar -->
      <!-- wing 스위치와 같은 칩이다 — 이 줄이 또 하나의 툴바가 아니라 같은 식구로 읽히게 -->
      <div class="flex items-center gap-1">
        <button
          class="chip demo-zoom-step"
          type="button"
          :disabled="zoom <= ZOOM_MIN"
          :aria-label="t('demo_zoom_out')"
          @click="stepZoom(-ZOOM_STEP)"
        >
          −
        </button>
        <!-- The readout is the reset: the number you are looking at is the thing you want to put back -->
        <!-- 숫자가 곧 되돌리기 단추다 — 지금 보고 있는 그 값이 되돌리고 싶은 대상이다 -->
        <button
          class="chip demo-zoom-value tabular-nums"
          type="button"
          :disabled="draft === 100"
          :title="t('demo_zoom_reset')"
          @click="applyZoom(100)"
        >
          {{ draft }}%
        </button>
        <button
          class="chip demo-zoom-step"
          type="button"
          :disabled="zoom >= ZOOM_MAX"
          :aria-label="t('demo_zoom_in')"
          @click="stepZoom(ZOOM_STEP)"
        >
          +
        </button>
      </div>
    </div>

    <!-- 붙는 크롬 — 셋 다 호스트의 선택이라 데모도 호스트의 선택으로 보여 준다.
         클래스가 코어 기본값을, 토큰이 높이를 나르고, 보정은 호스트가 붙이거나 마는 코어 mount 다 -->
    <!-- Sticky chrome — all three are the host's choice -->
    <div class="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem]">
      <label class="chip" :class="{ 'chip-on': stickyOn }">
        <input v-model="stickyOn" type="checkbox" class="sr-only" />
        {{ t('demo_sticky') }}
      </label>
      <label class="chip" :class="{ 'chip-on': stickyKeyboard }">
        <input v-model="stickyKeyboard" type="checkbox" class="sr-only" />
        {{ t('demo_sticky_keyboard') }}
      </label>

      <!-- 서체의 기본값은 wing 을 선언할 때 정한다 — 데모니까 그 선언도 골라 본다 -->
      <!-- The typeface's default is declared when the wing is built; the demo picks that too -->
      <span class="flex items-center gap-1">
        <span class="text-[var(--g-muted)]">{{ t('demo_typeface_base') }}</span>
        <select v-model="typefaceBase" class="demo-sticky-unit" :aria-label="t('demo_typeface_base')">
          <option value="sans">{{ t('demo_typeface_sans') }}</option>
          <option value="serif">{{ t('demo_typeface_serif') }}</option>
          <option value="mono">{{ t('demo_typeface_mono') }}</option>
          <option value="cursive">{{ t('demo_typeface_cursive') }}</option>
        </select>
      </span>

      <!-- 높이는 수가 아니라 CSS 길이다 — 시트가 rem 으로 적혀 있으니 단위는 호스트가 고른다 -->
      <!-- The offset is a CSS length, not a number — the unit is the host's to choose -->
      <span class="flex items-center gap-1" :class="{ 'opacity-45': !stickyOn }">
        <span class="text-[var(--g-muted)]">{{ t('demo_sticky_height') }}</span>
        <input
          v-model.number="stickyTop"
          class="demo-sticky-top"
          type="number"
          min="0"
          max="200"
          step="1"
          :disabled="!stickyOn"
          :aria-label="t('demo_sticky_height')"
        />
        <select v-model="stickyUnit" class="demo-sticky-unit" :disabled="!stickyOn" :aria-label="t('demo_sticky_unit')">
          <option value="px">px</option>
          <option value="rem">rem</option>
        </select>
      </span>
    </div>

    <!-- No `overflow-hidden` here: it makes this a scroll container and the sticky toolbar never sticks -->
    <!-- 여기에 `overflow-hidden` 을 두지 않는다 — 스크롤 컨테이너가 되어 스티키 툴바가 안 붙는다 -->
    <!-- `.nabi`/`.nabi-content` are the core sheet's own root/editor classes — the core has no -->
    <!-- single `create(el, options)` door in this round, so the host builds this shell itself and hands -->
    <!-- each piece to its own mount call (Body/Toolbar/ContextToolbar/Hints), same as nabi-note's own demo. -->
    <!-- `.nabi`/`.nabi-content` 는 코어 시트 자신의 뿌리/편집기 클래스다 — 이번 라운드는 -->
    <!-- `create(el, options)` 한 문이 없어 호스트가 이 뼈대를 직접 짓고 조각마다 제 mount 를 부른다 -->
    <!-- (nabi-note 자신의 데모와 같다). -->
    <div ref="rootEl" class="demo-host rd-box nabi">
      <div ref="chromeEl" class="demo-chrome" :class="{ 'nabi-toolbar': stickyOn }">
        <!-- 도구 자리가 툴바보다 **앞**에 선다 — 코어가 이것을 오른쪽 위로 띄우고(float),
             float 는 자기 뒤에 오는 줄들만 비켜 가게 한다. 순서가 뒤집히면 단추 줄이 도구를
             감싸지 않고 그 아래로 떨어진다 -->
        <!-- The tools slot comes BEFORE the toolbar: the core floats it, and a float only clears
             the line boxes that follow it -->
        <div class="demo-toolbar-row">
          <!-- 미리 그린 뷰 도구 둘 (097) — 툴바와 같은 길이다 -->
          <span ref="toolsEl" v-html="props.viewToolsHtml ?? ''"></span>
          <!-- 미리 그린 툴바 글자를 그대로 심는다 (096) — mountToolbar 가 같은 함수로 그리므로
               이미 서 있는 줄을 알아보고 배선만 건다. 안 주면 지금까지처럼 빈 채로 시작한다. -->
          <!-- `nabi-toolbar-row` 를 **첫 그림부터** 단다 — mountToolbar 가 mount 때 달면 좌우
               여백 .375rem 이 그때 붙어 줄이 옆으로 한 번 밀린다(주인 신고 2026-08-19).
               코어는 호스트가 이미 단 클래스를 안 뗀다. -->
          <div ref="toolbarEl" class="nabi-toolbar-row" v-html="props.toolbarHtml ?? ''"></div>
        </div>
        <div ref="contextToolbarEl" hidden></div>
      </div>
      <!-- 미리 그려 둔 문서를 그대로 심는다 — 서버와 브라우저의 첫 그림이 같아야 hydrate 가
           맞아떨어지므로, 값은 mount 뒤에 건드리지 않는다 (095 ⓐ) -->
      <div
        ref="editorEl"
        class="nabi-content"
        contenteditable="true"
        spellcheck="false"
        v-html="props.ssrHtml ?? ''"
      ></div>
    </div>

    <!-- 나가는 값 둘을 나란히 놓는다 — 왼쪽이 밖으로 나가는 HTML,
         오른쪽이 문서의 실체인 나비트리다. 둘은 같은 문서의 두 얼굴이라, 나란히 놓으면
         "무엇이 저장되는가" 와 "무엇으로 이루어져 있는가" 가 한눈에 맞춰진다.
         좁은 화면에서는 위아래로 선다 — 나란히 두면 둘 다 못 읽는다 -->
    <!-- The two outgoing values side by side: the HTML that leaves, and the tree it came from -->
    <div class="demo-panes mt-4">
      <div>
        <div class="flex items-baseline gap-3 text-[0.85rem]">
          <span class="font-semibold">HTML</span>
          <span class="flex-1"></span>
          <span v-if="!ready" class="opacity-60">{{ t('demo_loading') }}</span>
        </div>
        <!-- 읽기 전용 textarea 다 — 값을 통째로 고르고 복사하기가 <pre> 보다
             쉽고(칸 안에서 Ctrl+A 가 그 값만 고른다), 스크롤도 칸 안에서 끝난다 -->
        <!-- A read-only textarea: selecting and copying the whole value is easier than from a <pre> -->
        <textarea
          class="demo-pad g-glass rd-box mt-2 h-[14rem] w-full resize-y p-3 text-[0.8rem] leading-6"
          readonly
          spellcheck="false"
          aria-label="HTML"
          :value="output"
        ></textarea>
      </div>

      <div>
        <div class="flex items-baseline gap-3 text-[0.85rem]">
          <span class="font-semibold">JSON</span>
          <span class="opacity-60">{{ t('demo_tree') }}</span>
          <span class="flex-1"></span>
          <span v-if="!ready" class="opacity-60">{{ t('demo_loading') }}</span>
        </div>
        <!-- 줄을 접는다 — 값은 시리얼라이즈한 그대로(들여쓰기 없음)라 한 줄이다.
             안 접으면 그 한 줄을 가로로 끌어야 보인다 -->
        <!-- Wraps: the value is the serialized tree as-is, so it is one long line -->
        <textarea
          class="demo-pad g-glass rd-box mt-2 h-[14rem] w-full resize-y p-3 text-[0.8rem] leading-6"
          readonly
          spellcheck="false"
          aria-label="JSON"
          :value="treeJson"
        ></textarea>
      </div>
    </div>

    <div class="mt-4 text-[0.85rem] font-semibold">{{ t('demo_install') }}</div>

    <CodeBox lang="bash" :code="install" />

    <div class="mt-4 text-[0.85rem] font-semibold">{{ t('demo_code') }}</div>

    <!-- Never collapsed — trapped in a scroller you lose the "this is all it takes" impression -->
    <!-- 코드는 접지 않는다 — 스크롤 안에 갇히면 "이만큼이면 된다" 가 한눈에 안 들어온다 -->
    <CodeBox lang="ts" :code="code" />
  </section>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useData } from 'vitepress'

// 편집기 시트 — **정적으로 문다** (095). 발행 패키지를 쓰는 호스트가 하는 그대로다.
// 런타임에 붙이면(`injectSheets`) 편집기 JS 가 도착할 때까지 시트가 없어서, 서버가 미리 그려
// 보낸 문서가 맨몸으로 한 번 그려졌다가 스타일이 얹히며 펴진다 — 새로고침마다 보이던 그 찌그러짐이다.
// 정적으로 물면 사이트 시트에 함께 실려 head 에서 렌더를 막고 들어오므로 그 구간이 없다.
import 'nabi-note/nabi.css'
import { useTranslate } from '../src/langs.ts'
import { loadSampleTrees, type SampleKey, type SampleTree } from '../src/sample.ts'
import { shuffle } from '../src/util.ts'
import { chips as CHIPS } from '../trees/chips.ts'
import { loadEditorFonts } from '../src/fonts.ts'
import CodeBox from './CodeBox.vue'
// Type-only, so Shiki never reaches SSR or the first bundle
// 타입만 가져온다 — 런타임에는 지워지므로 Shiki 가 SSR·첫 번들에 끌려 들어가지 않는다
import type { CodeHighlighting } from '../src/highlight.ts'
import type { CodeHighlighter, Wing } from 'nabi-note'

// `wings` only sets the initial state — the chips still toggle everything; omit it to start with all on
// `wings` 는 처음 상태만 정한다 — 칩으로 껐다 켜는 것은 그대로고, 안 주면 전부 켜진다
// `foldWings` is the front page's alone: there the chip list is the tallest thing above the editor,
// and on a phone it pushed the editor clean off the first screen. A wing page shows its few chips always
// `foldWings` 는 첫 화면만의 것이다 — 거기서는 칩 목록이 편집기 위에서 가장 키가 크고, 폰에서는
// 편집기를 첫 화면 밖으로 밀어냈다. wing 페이지는 칩이 몇 개뿐이라 늘 펴 둔다
// `sample` 은 예문의 이름표다 — 글이 아니라 이름만 받는다. 굳혀 둔 나비트리 한 벌은 읽는 쪽
// 언어의 것 하나만 늦게 오고(`src/sample.ts`), 그것을 그대로 편집기에 넣는다
// `sample` names the sample; the frozen nabi-tree for the page's language is fetched on mount
// `ssrHtml` 은 **미리 그려 둔 편집기 HTML** 이다 (095 ⓐ). 주면 서버가 그것을 그대로 내보내
// 독자가 처음부터 완성된 문서를 보고, mount 는 `hydrate` 로 그 DOM 을 이어받는다 — 빈 상자가
// 갑자기 채워지며 페이지가 밀리는 구간이 사라진다. 안 주면 지금까지처럼 빈 채로 시작한다.
// Pre-rendered editor HTML: the server ships it, and mount adopts that DOM instead of redrawing
const props = defineProps<{
  wings?: readonly string[]
  sample?: SampleKey
  foldWings?: boolean
  ssrHtml?: string
  // 미리 그려 둔 **툴바 HTML** (096). 주면 아이콘 줄이 코어를 기다리지 않는다.
  toolbarHtml?: string
  // 미리 그려 둔 **뷰 도구 HTML** (097) — 미리보기·전체화면 둘.
  viewToolsHtml?: string
}>()

const { t } = useTranslate()
const { lang } = useData()

// Editor language lives only in this component — never written to the cookie or the URL
// 에디터 표시 언어는 이 자리에서만 산다 — 쿠키에도 주소에도 남기지 않는다
// It opens in the page's own language: the site speaks fourteen and so does the package, so a
// reader on /ja/ met a Korean toolbar until this line stopped choosing between ko and en alone
// The chips below still switch it freely
// 페이지의 언어로 연다 — 사이트도 패키지도 열넷을 말하는데, 이 줄이 ko·en 만 고르고 있어서
// /ja/ 로 온 사람이 한국어 툴바를 봤다. 아래 칩으로 바꾸는 것은 그대로다
const locale = ref((lang.value || 'en').split('-')[0] as string)

// 편집기가 말하는 언어는 사이트가 말하는 언어(ko·en)와 다른 것이다 — **목록**은 패키지가 든
// 것을 그대로 쓴다(`LOCALES`). 다만 **이름**은 패키지가 안 든다: 사전이 wing 마다 흩어져 있어
// "무슨 언어를 아는가" 만 나오고 "그 언어를 뭐라 부르는가" 는 안 나온다. 그 이름은 부르는 쪽의
// 것이라 여기 적는다 — 패키지가 언어를 늘리면 목록에는 곧장 뜨고, 이름만 여기서 채우면 된다
// The list comes from the package (`LOCALES`); the display names are the caller's own
const LOCALE_NAMES: Readonly<Record<string, string>> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  ur: 'اردو',
  id: 'Indonesia',
}
// 첫 그림은 **안 섞은** 것이다 — 자리만 잡으면 되고, 서버가 보낸 것과 같아야 한다.
// The first paint is unshuffled: it only needs to hold the space, and it must match the server.
const languages = ref<[string, string][]>(Object.entries(LOCALE_NAMES) as [string, string][])
const langsReady = ref(false)

// Zoom rides the root font-size, not `body`: every size on this site is written in `rem`, and `rem`
// answers to the root alone — setting it on `body` moves nothing (measured 2026-08-09)
// 확대·축소는 `body` 가 아니라 루트 글자 크기를 탄다 — 이 사이트의 크기는 전부 `rem` 이고 `rem` 은
// 루트만 본다. `body` 에 걸면 아무것도 안 움직인다 (2026-08-09 실측)
const ZOOM_MIN = 80
const ZOOM_MAX = 300
const ZOOM_STEP = 10
const ZOOM_BASE_PX = 15

const zoom = ref(100)
const draft = ref(100)

const applyZoom = (value: number) => {
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value || 100))
  draft.value = clamped
  zoom.value = clamped
}

const stepZoom = (by: number) => applyZoom(zoom.value + by)

watch(zoom, (value) => {
  document.documentElement.style.fontSize = `${(ZOOM_BASE_PX * value) / 100}px`
})

const RANGE_NEEDS_REM = 32
const PHONE_REM = 40

const viewportRem = ref(Number.POSITIVE_INFINITY)
const roomForRange = computed(() => viewportRem.value >= RANGE_NEEDS_REM)

const foldable = computed(() => props.foldWings === true && viewportRem.value < PHONE_REM)
const wingsOpen = ref(false)
const wingsShown = computed(() => !foldable.value || wingsOpen.value)

const measureViewport = () => {
  viewportRem.value = window.innerWidth / ((ZOOM_BASE_PX * zoom.value) / 100)
}
watch(zoom, measureViewport)

// 붙는 크롬 — 코어가 주는 것은 셋이고 셋 다 호스트가 켜고 끈다: `.nabi-toolbar` 클래스(기본 동작),
// `--nabi-sticky-top` 토큰(얼마나 내려 붙나), `mountSticky`(모바일 키보드가 먹은 만큼 보정).
// 데모가 이 셋을 스위치로 내놓는 이유는, 쓰는 쪽에서도 딱 이 셋만 만지면 되기 때문이다
// Sticky chrome — the core offers three, and the host owns all three
// 표식 없는 글이 입는 서체도 이제 **토큰 하나**다(`--nabi-typeface-base`) — 예전엔 wing 을 지을
// 때 굳는 옵션이라 고를 때마다 wing 을 다시 지어야 했다. 지금은 뿌리에 값 하나를 적으면 끝이고,
// 서체 wing 은 그 위에 `span` 으로 덧입는다
// The base typeface is a token now, not an option frozen when the wing is built
const typefaceBase = ref<'sans' | 'serif' | 'mono' | 'cursive'>('sans')
const TYPEFACE_TOKENS: Record<string, string> = {
  sans: 'var(--nabi-font)',
  serif: 'var(--nabi-font-serif)',
  mono: 'var(--nabi-font-mono)',
  cursive: 'var(--nabi-font-cursive)',
}

const stickyOn = ref(true)
const stickyKeyboard = ref(true)
const stickyTop = ref(0)
const stickyUnit = ref<'px' | 'rem'>('px')

const rootEl = ref<HTMLElement | null>(null)
const chromeEl = ref<HTMLElement | null>(null)
const toolbarEl = ref<HTMLElement | null>(null)
const contextToolbarEl = ref<HTMLElement | null>(null)
const editorEl = ref<HTMLElement | null>(null)
const toolsEl = ref<HTMLElement | null>(null)
const output = ref('')
// 문서의 실체 — 화면의 HTML 이 아니라 그것이 나온 자리다
// The document itself, not the HTML drawn from it
const treeJson = ref('')
const ready = ref(false)

// 칩 줄도 코어를 안 기다린다 — 이름은 `build:trees` 가 패키지 사전에서 뽑아 굳혀 둔 것이라
// 서버가 보내는 HTML 에 이미 칩이 서 있다. 코어가 와서 다시 매기는 이름이 **같은 값**이라
// 그때 줄이 다시 접히지 않는다.
// The chip row does not wait for the core either: the labels are frozen at build time from the
// package dictionary, so the server already ships them. The core recomputes the same strings.
const catalog = ref<{ id: string; label: string }[]>([
  ...(CHIPS[(lang.value || 'en').split('-')[0] as string] ?? CHIPS['en'] ?? []),
])
const picked = reactive<Record<string, boolean>>({})
// 미리 선 칩에도 켜짐을 미리 적는다 — 안 적으면 코어가 올 때까지 전부 꺼진 색으로 서 있다가
// 한꺼번에 물든다(자리는 안 밀려도 눈에는 깜박임이다).
for (const item of catalog.value) picked[item.id] = props.wings ? props.wings.includes(item.id) : true

// Every wing stays on screen and an off one merely looks off — the same shape the package's own demo uses.
// wing 은 언제나 다 보이고 꺼진 것은 꺼진 모양일 뿐이다 — 패키지 자신의 데모와 같은 결이다.

// Loaded once on mount — the module only arrives on the client (§ SSR)
// mount 때 한 번만 불러온다 — 모듈이 클라이언트에서만 오기 때문이다 (§ SSR)
type NabiModule = typeof import('nabi-note')
let nabiModule: NabiModule | null = null
// 보는 쪽 런타임은 **다른 엔트리**다(`nabi-note/viewer`) — 편집기와 같은 규칙으로 클라이언트에서만
// 온다. 미리보기 본문에만 얹히므로 편집기 묶음과 갈라 둔 그 갈림을 여기서도 지킨다.
// The reading-side runtime is a separate entry, loaded on the client like the editor is
type ViewerModule = typeof import('nabi-note/viewer')
let viewerModule: ViewerModule | null = null

// 데모의 wing 목록 — `defaultWings` 에서 셋만 갈아 끼운다.
//
// img·upload 는 **짝이라 한쪽만 켜면 안 된다**: 이 데모의 업로더는 서버가 없어 `blob:` 주소를
// 돌려주는데, 커밋 쪽이 그 주소를 통과시켜도 그림 wing 이 안 받으면 그림이 안 선다. 링크는
// `createNabiWith` 의 `allowLocalUrls` 하나로 함께 열린다 — wing 옵션이 아니다.
// code 는 색칠할 사람을 여기서 꽂는다 — wing 자체는 상수고, 붙는 일(`attach`)만 갈아 낀다.
// Three swaps on top of `defaultWings`: image/upload allow local URLs, and code gets a highlighter
function demoWings(mod: NabiModule): Wing[] {
  return mod.defaultWings.map((wing) => {
    if (wing.w === 'img') return mod.makeImageWing({ allowLocalUrls: true })
    if (wing.w === 'upload') return mod.makeUploadWing({ allowLocalUrls: true })
    if (wing.w === 'code') return { ...wing, attach: mod.makeCodeAttach({ highlight: highlightCode, version: () => grammarAge }) }
    return wing
  })
}

let allWings: Wing[] = []

// 칩으로 껐다 켜는 것은 **단추를 든 wing** 뿐이다 — 조각(`parts`: tr·td·li·summary…)은 이제
// 제 주인 wing 안에 선언돼 있어서 따로 끌 것이 없다. 예전의 `owns` 대물림이 사라진 자리다
// Only wings with a button are chips — parts (tr/td/li/summary…) now live inside their owner
function pickedWings(): Wing[] {
  return allWings.filter((wing) => picked[wing.w] !== false)
}

// Arrives late, and only once the code wing has been toggled on
// 늦게 도착하고, 코드 wing 을 켠 뒤에만 온다
let highlighting: CodeHighlighting | null = null
let highlightRequested = false
let stopGrammarWatch: (() => void) | null = null
// 문법이 하나 더 도착할 때마다 하나씩 오른다 — 색칠의 서명에 함께 들어가는 값이다(아래)
// Bumped on every grammar that lands — it rides the paint signature
let grammarAge = 0

const highlightCode: CodeHighlighter = (source, language) => {
  if (!highlighting) {
    ensureHighlighting()
    return null
  }
  return highlighting.highlight(source, language)
}

// 미리보기의 정적 HTML 에 얹는 것 — 읽는 사람이 발행된 쪽에서 실제로 겪는 것들(열 정렬·코드
// 색칠)이다. **로직은 하나도 여기 없다**: 문 하나(`attachViewer`)를 부르고, 호스트의 것인
// 하이라이터만 넘긴다. 보는 쪽 기능이 늘어도 이 줄은 그대로다.
// Nothing but a declaration: one door does it all, and the host only hands over its highlighter.
function attachPreviewRuntime(body: HTMLElement, locale: string): () => void {
  return viewerModule ? viewerModule.attachViewer(body, { locale, highlight: highlightCode }) : () => {}
}

function ensureHighlighting(): void {
  if (highlightRequested) return
  highlightRequested = true

  void import('../src/highlight.ts')
    .then((module) => module.loadCodeHighlighting())
    .then((loaded) => {
      if (!loaded) return
      highlighting = loaded
      stopGrammarWatch = loaded.onGrammarLoaded(repaint)
      repaint()
    })
    .catch(() => {
      // Only the color is missing; code blocks keep working
      // 색칠만 없다 — 코드 블록 기능 자체는 그대로 돈다
    })
}

// 늦게 도착한 문법은 **다시 칠하기만** 하면 된다. 색칠은 "언어 + 글" 로 만든 서명이 그대로면
// 건너뛰는데(안 그러면 글자마다 통째로 다시 칠한다), 문법이 늦게 오는 경우엔 문서가 안 바뀌었으니
// 그 서명도 그대로다 — 그래서 아무 글자나 하나 더 쳐야 색이 들어왔다. `version` 이 그 서명에
// 함께 드는 값이라, 하나 올리고 캐럿을 제자리에 다시 놓으면 그 한 번이 진짜 다시 칠하기가 된다.
// 편집기를 통째로 다시 만들지 않으므로 타이핑 중에 불려도 캐럿을 잃지 않는다.
// A late grammar only needs a repaint: `version` rides the paint signature, so bumping it and
// re-seating the caret repaints without rebuilding the editor (and without losing the caret).
function repaint(): void {
  grammarAge += 1
  if (nabi) nabi.select(nabi.getSelection())
}

// Every mounted piece, torn down in reverse order on rebuild/unmount
// 마운트한 조각 전부 — 다시 만들거나 걷을 때 반대 순서로 해제한다
type Unmountable = { unmount(): void }
let surface: Unmountable | null = null
let settle: (Unmountable & Record<string, unknown>) | null = null
let toolbar: Unmountable | null = null
let contextToolbar: Unmountable | null = null
let hints: Unmountable | null = null
let pickedMark: Unmountable | null = null
let viewTools: Unmountable | null = null
let upload: (Unmountable & { take(files: readonly File[]): void }) | null = null
let uploadView: Unmountable | null = null
let fileMount: (Unmountable & { takeFiles(files: readonly File[]): Promise<boolean> }) | null = null
let historyMount: (Unmountable & { sessionId: string }) | null = null
// 첫 조립인가 — 서버가 그린 DOM 을 이어받을 수 있는 것은 이때뿐이다 (095 ⓐ).
let firstBuild = true
let nabi: ReturnType<NabiModule['createNabiWith']>['nabi'] | null = null
let registry: ReturnType<NabiModule['createNabiWith']>['registry'] | null = null
let stopChange: (() => void) | null = null
// 처음 한 번 넣는 문서 — 굳혀 둔 나비트리다. 두 번째부터는 아래 `value` 가 물려받는다
// The first document: the frozen nabi-tree. From the second build on, `value` carries it
let doc: SampleTree | null = null
// Handed to the next build() so toggling a wing off/on reparses the same document instead of
// starting over — whatever markup the dropped wing owned falls to plain text right there
// 다음 build() 에 물려준다 — wing 을 껐다 켜도 처음부터 시작하지 않는다. 뺀 wing 이
// 쥐고 있던 마크업은 그 자리에서 평문으로 떨어진다
// **여기만 HTML 이다** — 트리로 물려주면 껐던 wing 의 마크업이 되살아나 데모가 거짓말을 한다
// This one stays HTML: carrying the tree over would resurrect the markup a dropped wing owned
let value = ''

function unmountAll(): void {
  // 세운 역순으로 뗀다.
  stopChange?.()
  stopChange = null
  viewTools?.unmount()
  pickedMark?.unmount()
  hints?.unmount()
  contextToolbar?.unmount()
  toolbar?.unmount()
  settle?.unmount()
  surface?.unmount()
  historyMount?.unmount()
  fileMount?.unmount()
  upload?.unmount()
  uploadView?.unmount()
  viewTools = pickedMark = hints = contextToolbar = toolbar = surface = uploadView = null
  settle = null
  historyMount = null
  fileMount = null
  upload = null
  nabi = null
  registry = null
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 데모의 전송 훅 — 서버가 없으니 그 자리에서 만든 `blob:` 주소를 그대로 돌려준다.
// 진행률을 흉내 내는 걸음이 촘촘한 것이 요점이다(5%씩 45ms): 진짜 콜백이 촘촘히 오면 화면은
// 그것을 따라가고 코어의 예측 티커는 거의 안 나선다 — 티커는 콜백이 뜸할 때를 메우는 쪽이다.
// The demo uploader: no server, so it hands back the `blob:` URL it just made. The fine-grained
// progress is the point — the core's estimating ticker only fills in when callbacks go quiet.
async function demoUpload(task: {
  file: { name: string; size: number; type: string }
  onProgress(percent: number): void
  signal: AbortSignal
}): Promise<{ uri: string } | null> {
  const file = task.file as unknown as File
  for (let percent = 5; percent <= 100; percent += 5) {
    await sleep(45)
    if (task.signal.aborted) return null
    task.onProgress(percent)
  }
  // 그림이 아닌 파일도 올라간 것으로 친다 — 첨부 링크가 된다. `blob:` 을 안 돌려주는 까닭은
  // 그 주소가 이 탭에서만 살아서, 눌러도 아무 일이 없는 첨부가 문서에 박히기 때문이다
  // A non-image counts as uploaded too; a `blob:` link would be dead outside this tab
  if (!file.type.startsWith('image/')) return { uri: 'https://nabi.saro.me/file-link-test.txt' }
  return { uri: URL.createObjectURL(file) }
}

function build(): void {
  const mod = nabiModule
  const root = rootEl.value
  const chrome = chromeEl.value
  const toolbarHost = toolbarEl.value
  const contextHost = contextToolbarEl.value
  const content = editorEl.value
  const toolsHost = toolsEl.value
  if (!mod || !root || !chrome || !toolbarHost || !contextHost || !content || !toolsHost) return

  unmountAll()

  const wings = pickedWings()
  const here = locale.value

  // 1. 에디터 하나 — wing 목록이 갈래 지식·커맨드·조립기를 함께 짓는다.
  //    `parseHtml` 을 꽂아야 `setHtml` 이 산다 — 들여오기는 DOMParser 를 타서 브라우저의 일이다.
  // One editor: the wing list builds the schema, the commands and the assembler together
  // 묻는 길 — 코어는 아무것도 안 묻고 "아니오" 로 답한다(머리 없는 곳에서도 돌아야 하니까).
  // 브라우저에서 쓰려면 호스트가 이 세 줄을 끼운다. 그러면 편집기 어디서 물어도(파일 열기,
  // 기록 지우기) 그 상자가 뜬다 — 제 대화상자가 있는 페이지는 여기에 제 것을 물리면 된다.
  // The core asks nobody and answers "no" — the host plugs the box in, once, for every question
  const made = mod.createNabiWith(wings, {
    ask: {
      message: (text: string) => window.alert(text),
      confirm: (text: string) => window.confirm(text),
    },
    allowLocalUrls: true,
    parseHtml: mod.parseNodes,
    // 예문은 나비트리로 굳혀 두고 그대로 넣는다 — 들여오기(파싱·화이트리스트)를 안 거친다.
    // `parseHtml` 은 여전히 꽂는다: 붙여넣기와 아래 `setHtml` 이 그 문으로 산다
    // The sample goes in as a tree; `parseHtml` still rides along for paste and `setHtml`
    ...(value === '' && doc ? { doc } : {}),
  })
  nabi = made.nabi
  registry = made.registry
  if (value) nabi.setHtml(value)

  // 2. 시트는 여기서 안 붙인다 — 이 파일 맨 위에서 `nabi-note/nabi.css` 를 **정적으로** 문다.
  //    런타임에 붙이면 서버가 보낸 문서가 잠깐 맨몸으로 그려졌다 스타일이 얹히며 펴진다 (095).
  // Sheets are linked statically at the top of this file, not injected here — see the import

  // 3. 배선이 있어야 사는 wing 넷 — upload·save·open·localHistory. 등록만 하면 커맨드가 조용히
  //    아무 일도 안 한다. 화면(자리표시자·진행률·나비·거절 문구·취소)은 ui 의 것이고 전송은
  //    surface 의 것이라, 둘을 잇는 선은 넷뿐이다: 시작·진행·끝·거절
  // Four wings need wiring; the view and the transfer meet on four lines only
  if (wings.some((wing) => wing.w === 'upload')) {
    upload = mod.mountUpload({
      nabi,
      uploader: demoUpload,
      root: content,
      extensions: ['txt', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'zip'],
      maxFileSize: 10 * 1024 * 1024,
      maxTotalSize: 20 * 1024 * 1024,
      // 첨부 링크의 글자("첨부파일")를 이 말로 고른다 — 커밋은 커맨드라 말을 모른다
      // The attachment link's word comes from here; the commit command knows no language
      locale: here,
      onStart: (tasks) => uploadView?.start(tasks),
      onProgress: (id, percent) => uploadView?.progress(id, percent),
      // 숫자를 100 까지 몰고(커밋 전) → 커밋 → 자리표시자를 걷는다(커밋 뒤). 그 차례라야
      // 실물과 자리표시자가 함께 보이는 순간이 없다
      // Settle to 100 before the commit, clear after it — so the two never show together
      onSettle: () => uploadView?.settle(),
      onDone: () => uploadView?.done(),
      // `onReject` 는 안 끼운다 — 안 끼우면 부속이 toast 로 말한다(업로드 오류는 전부 그 길이다)
      // No `onReject`: left unwired, the mount says it through the toast — every upload error does
    }) as never
    uploadView = mod.mountUploadView({ nabi, surface: content, upload: upload as never, locale: here }) as never
  }
  if (wings.some((wing) => wing.w === 'save' || wing.w === 'open')) {
    fileMount = mod.mountFile({
      nabi,
      store: mod.browserFileStore(document),
      name: () => 'nabi-note',
      locale: here,
    }) as never
  }
  if (wings.some((wing) => wing.w === 'localHistory')) {
    historyMount = mod.mountLocalHistory({ nabi, storage: mod.browserHistoryStorage(window) }) as never
  }

  // 4. 편집 표면 — 드롭·붙여넣기로 온 파일은 먼저 `.nabi` 인지 물어보고, 아니면 업로드로 간다.
  // The edit surface: a dropped file is asked whether it is a `.nabi` document first
  surface = mod.mountSurface({
    nabi,
    registry,
    root: content,
    allowLocalUrls: true,
    // 말이 곧 방향이다 (098) — 아랍어·우르두를 고르면 편집 영역이 오른쪽에서 왼쪽으로 선다.
    // 페이지가 한국어여도 그렇다: 여기서 고르는 것은 **편집기의 말**이지 쪽의 말이 아니다.
    locale: here,
    // **첫 조립에서만** 이어받는다 (095 ⓐ) — 그때만 화면에 서 있는 것이 서버가 그린 그 DOM 이다.
    // wing 을 껐다 켜는 두 번째부터는 앞선 편집기가 그려 둔 것이라, 이어받으면 껐던 wing 의
    // 마크업을 그대로 물려받는 꼴이 된다. 어긋나면 코어가 알아서 새로 그리므로 안전한 쪽이다.
    hydrate: firstBuild && props.ssrHtml !== undefined,
    fileSink: (files) => {
      const taken = fileMount
      if (!taken) {
        upload?.take(files as never)
        return
      }
      void taken.takeFiles(files as never).then((ok) => {
        if (!ok) upload?.take(files as never)
      })
    },
  })

  // 5. 화면 도구 — 몸짓 가라앉기 **하나**를 툴바·상황 줄·스티키가 나눠 쓴다.
  // The view tools: one settle watcher, shared by the toolbar, the context bar and the sticky band
  settle = mod.watchSettle(document, { surface: content }) as never
  const common = { nabi, registry, surface: content, settle: settle as never, locale: here }

  toolbar = mod.mountToolbar({
    ...common,
    root: toolbarHost,
    onFiles: (files) => upload?.take(files as never),
    // 판이 필요한 도구(로컬 기록)는 호스트가 받는다 — 다만 **모양은 호스트가 짓지 않는다**.
    // ui 가 부품 하나(`openHistoryPanel`)로 내놓으므로 호스트는 그 문을 부르기만 한다
    // A tool that needs a panel comes back to the host — but the host does not draw it
    onHost: (w: string) => {
      if (w !== 'localHistory' || !historyMount) return
      mod.openHistoryPanel({
        history: historyMount as never,
        surface: content,
        locale: here,
        // 미리보기 — 기록의 값을 보기 HTML 로 그린다. 편집기를 새로 세우지 않는다
        // The preview draws the record as read-only HTML; it stands no second editor
        render: (record) => {
          const seen = mod.createNabiWith(wings, {
            doc: JSON.parse(record.body) as unknown,
            allowLocalUrls: true,
          })
          return seen.nabi.getHtml()
        },
        sessionId: historyMount.sessionId,
      })
    },
  })
  contextToolbar = mod.mountContextToolbar({ ...common, root: contextHost })
  hints = mod.mountHints({ toolbar: toolbar as never, context: contextToolbar as never, root: chrome, surface: content })
  // 골라진 물건의 표시 — 브라우저가 그림·영상 위에 선택을 안 그려 주므로 우리가 말한다
  // The browser draws no selection over an image or a video, so we say it ourselves
  pickedMark = mod.mountPickedMark({ nabi, surface: content })
  // The preview is the published page, so what a reader gets there has to work: sorting a column,
  // and code that has colour. The core cannot attach it — the viewer runtime sits above the editor's
  // layers — so the host does, through the hook the preview opens, with one call.
  // 미리보기는 곧 발행된 쪽이라, 읽는 사람이 거기서 겪는 것(열 정렬·코드 색칠)도 살아 있어야 한다.
  // 코어는 못 건다(보는 쪽 런타임이 편집기 층 위에 있다) — 미리보기가 연 훅으로 호스트가 건다.
  // 표식이 달린 표만 붙는다 — 발행 페이지와 똑같이.
  viewTools = mod.mountViewTools({
    nabi,
    surface: content,
    root,
    container: toolsHost,
    locale: here,
    onBody: (body: HTMLElement) => attachPreviewRuntime(body, here),
  })

  const editor = nabi
  stopChange = editor.onChange(() => {
    value = editor.getHtml()
    output.value = value
    treeJson.value = JSON.stringify(editor.getJson())
  })

  // Re-read from what actually survived — turning a wing back on must not resurrect stripped markup
  // 값은 화면에 실제로 남은 것으로 다시 잡는다 — 껐다 켜도 지운 마크업이 되살아나면 데모가 거짓말이 된다
  value = editor.getHtml()
  output.value = value
  treeJson.value = JSON.stringify(editor.getJson())
  ready.value = true
  firstBuild = false

  applySticky()
}

// 붙는 크롬의 셋 중 **보정**만 mount 다 — 붙을지 말지는 `.nabi-toolbar` 클래스이고, 얼마나
// 내려 붙을지는 `--nabi-sticky-top` 토큰이다. 둘은 호스트가 DOM·CSS 로 직접 만진다
// Of the three, only the inset is a mount: the other two are a class and a token
let sticky: { unmount(): void } | null = null

function applySticky(): void {
  const root = rootEl.value
  const chrome = chromeEl.value
  const content = editorEl.value
  if (!root || !chrome || !content) return

  const top = Math.max(0, Number(stickyTop.value) || 0)
  root.style.setProperty('--nabi-sticky-top', `${top}${stickyUnit.value}`)

  sticky?.unmount()
  sticky =
    stickyOn.value && stickyKeyboard.value && nabiModule
      ? nabiModule.mountSticky({ root, surface: content, chrome, ...(settle ? { settle: settle as never } : {}) })
      : null
}

watch([stickyOn, stickyKeyboard, stickyTop, stickyUnit], applySticky)

const install = computed(() => 'npm install nabi-note')

// wing 하나마다 그 wing 을 내보내는 이름 — 표(tr·td)나 목록 항목(li)처럼 조각을 거느린 것은
// 묶음 이름으로 나간다(`...tableWings`). 전부 켠 자리라면 `defaultWings` 한 줄이 곧 이 목록이다
// One export name per wing; the ones that carry parts ship as a bundle (`...tableWings`)
const EXPORT_NAME: Readonly<Record<string, string>> = {
  b: 'boldWing',
  i: 'italicWing',
  u: 'underlineWing',
  s: 'strikeWing',
  sup: 'superscriptWing',
  sub: 'subscriptWing',
  tf: 'typefaceWing',
  fs: 'fontSizeWing',
  tc: 'textColorWing',
  hl: 'highlightWing',
  a: 'linkWing',
  h: 'headingWing',
  align: 'alignWing',
  dc: 'dropCapWing',
  ul: 'bulletListWing',
  ol: 'orderedListWing',
  tl: 'taskListWing',
  quote: 'quoteWing',
  details: 'detailsWing',
  code: 'codeWing',
  hr: 'dividerWing',
  table: 'tableWings',
  img: 'imageWing',
  youtube: 'youtubeWing',
  upload: 'uploadWing',
  save: 'saveFileWing',
  open: 'openFileWing',
  localHistory: 'localHistoryWing',
  clearFormat: 'clearFormatWing',
}
// 묶음으로 나가는 것들 — 조각(tr·td, li, summary…)이 딸려 있어 한 이름이 여럿을 데려온다
// These ship as arrays: their parts ride along
const BUNDLES = new Set(['table'])

const code = computed(() => {
  const on = (id: string): boolean => picked[id] === true
  const ko = locale.value === 'ko'
  const ids = catalog.value.map((item) => item.id).filter(on)
  const all = ids.length === catalog.value.length && catalog.value.length > 0

  const imports = ['createNabiWith', 'mountSurface', 'mountToolbar', 'mountContextToolbar', 'mountHints', 'watchSettle']
  const wingLines: string[] = []

  if (all) {
    imports.push('defaultWings')
    wingLines.push('  ...defaultWings,')
  } else {
    for (const id of ids) {
      const name = EXPORT_NAME[id]
      if (!name) continue
      if (!imports.includes(name)) imports.push(name)
      wingLines.push(BUNDLES.has(id) ? `  ...${name},` : `  ${name},`)
    }
  }

  // 배선이 있어야 사는 wing 넷 — 등록만으로는 커맨드가 조용히 아무 일도 안 한다
  // Four wings need wiring; registering alone leaves their commands silent
  const wired: string[] = []
  if (on('upload')) {
    imports.push('mountUpload', 'mountUploadView')
    wired.push(
      'const upload = mountUpload({',
      '  nabi, root: content,',
      ko
        ? '  // 여기에 서버로 올리는 코드 — 진행률은 task.onProgress(0~100)'
        : '  // your upload goes here — report progress with task.onProgress(0–100)',
      ko
        ? "  uploader: async (task) => ({ uri: '올라간 파일 주소' }),"
        : "  uploader: async (task) => ({ uri: 'https://cdn.example/uploaded' }),",
      "  extensions: ['png', 'jpg', 'pdf'], maxFileSize: 10 * 1024 * 1024,",
      '  onStart: (tasks) => view.start(tasks),',
      '  onProgress: (id, percent) => view.progress(id, percent),',
      '  onDone: () => view.done(),',
      '})',
      'const view = mountUploadView({ nabi, surface: content, upload })',
    )
  }
  if (on('save') || on('open')) {
    imports.push('browserFileStore', 'mountFile')
    wired.push("mountFile({ nabi, store: browserFileStore(document), name: () => 'note' })")
  }
  imports.push('mountViewTools')
  if (on('localHistory')) {
    imports.push('browserHistoryStorage', 'mountLocalHistory', 'openHistoryPanel')
    wired.push('const history = mountLocalHistory({ nabi, storage: browserHistoryStorage(window) })')
  }
  const codeNote = on('code')
    ? [
        '',
        ko
          ? '// 색칠은 호스트의 하이라이터가 한다 (Prism·highlight.js·Shiki…) — wing 은 그대로 두고'
          : '// Bring your own highlighter (Prism, highlight.js, Shiki, …) — the wing stays as it is',
        ko ? '// 붙는 일(attach)만 갈아 낀다 — `makeCodeAttach` 도 같은 문에서 나온다' : '// and only the attach is swapped (`makeCodeAttach` ships from the same door)',
        '// { ...codeWing, attach: makeCodeAttach({ highlight: (source, lang) => [{ text: source }] }) }',
      ]
    : []

  // 묻는 일이 있는 wing(열기·기록 지우기)을 켠 예문에만 `ask` 를 보여 준다 — 안 주면 코어는
  // 아무것도 안 묻고 "아니오" 로 답해서, 베껴 간 사람의 지우기 단추가 말없이 죽는다
  // Only shown when a wing actually asks something — without it the core answers "no" to every question
  const asks = on('open') || on('save') || on('localHistory')
  const askNote = asks
    ? [
        ko
          ? '// 묻는 상자 — 안 주면 코어는 묻지 않고 "아니오" 로 답한다 (제 상자를 물려도 된다)'
          : '// The box that asks — without it the core answers "no" to everything (plug in your own)',
        'const ask = { message: (t: string) => alert(t), confirm: (t: string) => confirm(t) }',
        '',
      ]
    : []

  const lines = [
    importBlock(imports),
    '',
    ...askNote,
    'const { nabi, registry } = createNabiWith([',
    ...wingLines,
    asks ? '], { ask })' : '])',
    ...codeNote,
    '',
    "const root = document.querySelector('.nabi')!",
    "const content = document.querySelector('.nabi-content')!",
    ...(wired.length > 0 ? ['', ...wired] : []),
    '',
    ko
      ? '// locale 이 글의 방향도 정한다 — 아랍어·우르두면 오른쪽에서 왼쪽으로 선다'
      : '// The locale also sets the direction — Arabic and Urdu run right to left',
    `mountSurface({ nabi, registry, root: content, locale: '${locale.value}' })`,
    '',
    'const settle = watchSettle(document, { surface: content })',
    `const shared = { nabi, registry, surface: content, settle, locale: '${locale.value}' }`,
    ...(on('localHistory')
      ? [
          ko
            ? '// 판이 필요한 도구는 호스트로 돌아온다 — 이 줄이 없으면 단추가 무반응이다'
            : '// A tool that needs a panel comes back to the host — without this the button is dead',
          'const toolbar = mountToolbar({',
          "  ...shared, root: document.querySelector('#toolbar')!,",
          '  onHost: (w) => {',
          "    if (w !== 'localHistory') return",
          `    openHistoryPanel({ history, surface: content, locale: '${locale.value}', sessionId: history.sessionId })`,
          '  },',
          '})',
        ]
      : ["const toolbar = mountToolbar({ ...shared, root: document.querySelector('#toolbar')! })"]),
    "const context = mountContextToolbar({ ...shared, root: document.querySelector('#context')! })",
    'mountHints({ toolbar, context, root, surface: content })',
    ko
      ? '// 미리보기·전체화면 두 단추 — 툴바 줄의 끝에 제 상자를 세워 앉는다'
      : '// The preview and fullscreen buttons — they stand their own box at the end of the row',
    "mountViewTools({ ...shared, root, container: document.querySelector('#toolbar')! })",
    '',
    // 예문은 **그대로 복사해서 돌아가야 한다** — `저장(...)` 은 이 자리에 없는 함수라, 살려 두면
    // 붙여 넣는 순간 던진다. 무엇을 걸어야 하는지는 보여 주되 줄은 주석으로 내린다.
    ko ? '// 값이 바뀔 때마다 — 여기에 당신의 코드를 건다' : '// on every change — hook up your own code here',
    '// nabi.onChange(() => user_callback(nabi.getHtml()))',
  ]

  return lines.join('\n')
})

function importBlock(names: readonly string[]): string {
  const single = `import { ${names.join(', ')} } from 'nabi-note'`
  if (single.length <= 78) return single

  const lines: string[] = []
  let line = ''
  for (const name of names) {
    const piece = `${name},`
    const next = line === '' ? piece : `${line} ${piece}`
    if (next.length > 70) {
      lines.push(`  ${line}`)
      line = piece
    } else {
      line = next
    }
  }
  if (line !== '') lines.push(`  ${line}`)

  return ['import {', ...lines, "} from 'nabi-note'"].join('\n')
}

function setAll(on: boolean): void {
  for (const item of catalog.value) picked[item.id] = on
}

// 말은 세울 때 한 번 건네진다 — 툴바·상황 줄·판이 저마다 제 번역기를 들고 있어서, 바꾸려면
// 그 조각들을 다시 세워야 한다. 문서 값(`value`)은 그대로 물려가므로 쓰던 글은 안 잃는다
// The locale is handed over at mount time, so switching it re-stands the pieces; the document rides along
function setLocale(code: string): void {
  if (locale.value === code) return
  locale.value = code
  catalog.value = catalog.value.map((item) => ({ ...item, label: labelOf(item.id, code) }))
  build()
}

function labelOf(id: string, code: string): string {
  const mod = nabiModule
  if (!mod) return id
  const wing = allWings.find((candidate) => candidate.w === id)
  if (!wing) return id
  // 이름이 선언에 없으면 ui 와 똑같이 사전의 `wing.<w>` 를 본다 — 화면의 이름표와 칩이 어긋나지 않게
  // With no declared name, look up `wing.<w>` exactly as the ui does, so chip and tooltip agree
  return mod.makeTranslator(code).pick(wing.button?.label, `wing.${id}`)
}

onMounted(async () => {
  measureViewport()
  // 서체 wing 이 고를 네 갈래의 실제 글꼴 — 데모가 뜰 때만 부른다 (src/fonts.ts 머리말)
  // The four genera's actual fonts — fetched only where a demo exists (see src/fonts.ts)
  loadEditorFonts()
  window.addEventListener('resize', measureViewport)
  // 셋을 **함께** 부른다 — 서로를 안 기다린다. 차례로 await 하면 왕복이 셋이 되고, 그동안
  // 데모 자리는 빈 상자로 남는다(095). 코어가 제일 크므로 그 하나가 곧 이 구간의 길이다.
  const [nabi, viewer, trees] = await Promise.all([
    import('nabi-note'),
    import('nabi-note/viewer'),
    // 예문 한 벌 — 페이지의 언어 것만 온다. 편집기 표시 언어(칩)와는 다른 축이다
    // One sheet of samples, in the page's language — a different axis from the editor's own locale
    loadSampleTrees(lang.value),
  ])
  nabiModule = nabi
  viewerModule = viewer

  // Shuffled once, when the demo is built — the same rule the header's language list follows.
  // A fixed order always puts the same two languages under the reader's thumb.
  // 데모를 세울 때 한 번 섞는다 — 머리줄의 언어 목록과 같은 규칙이다. 고정 순서는 늘 같은 둘을
  // 읽는 사람 엄지 밑에 놓는다.
  languages.value = shuffle(
    nabiModule.LOCALES.map((code) => [code, LOCALE_NAMES[code] ?? code] as [string, string]),
  )
  langsReady.value = true
  allWings = demoWings(nabiModule)
  catalog.value = allWings
    .filter((wing) => wing.button !== undefined || wing.buttons !== undefined)
    .map((wing) => ({ id: wing.w, label: labelOf(wing.w, locale.value) }))

  doc = trees[props.sample ?? 'main']

  const initial = props.wings
  for (const item of catalog.value) {
    picked[item.id] = initial ? initial.includes(item.id) : true
  }

  build()
})

// Rebuilding on every chip change is the whole point — you see what the value loses
// 체크가 바뀌면 다시 만든다 — 껐을 때 값이 어떻게 떨어지는지가 데모의 요점이다
watch(picked, () => build(), { deep: true })

// 토큰 하나만 바꾼다 — wing 을 다시 지을 것도, 편집기를 다시 세울 것도 없다
// One token, no rebuild
watch(
  typefaceBase,
  () => {
    rootEl.value?.style.setProperty('--nabi-typeface-base', TYPEFACE_TOKENS[typefaceBase.value] as string)
  },
  { immediate: false },
)

onBeforeUnmount(() => {
  stopGrammarWatch?.()
  stopGrammarWatch = null
  sticky?.unmount()
  sticky = null
  unmountAll()
  window.removeEventListener('resize', measureViewport)
  document.documentElement.style.fontSize = ''
})
</script>

<style scoped>
.demo-zoom {
  flex: 1;
  max-width: 16rem;
  accent-color: var(--g-accent);
}

/* 인라인 SVG 라 글자 크기가 아니라 상자 크기로 잰다 — `1em` 으로 두어 옛 리거처와 같은 키다 */
.demo-zoom-icon {
  font-size: 1.05rem;
  line-height: 1;
  inline-size: 1em;
  block-size: 1em;
  flex: none;
}

.demo-zoom-value {
  justify-content: center;
  min-width: 3.25rem;
}

.demo-zoom-step {
  justify-content: center;
  min-width: 1.75rem;
}

.chip:disabled {
  opacity: 0.45;
  cursor: default;
}

.chip:disabled:hover {
  background: color-mix(in srgb, var(--g-fg) 6%, transparent);
}

/* 칩과 같은 결로 — 이 줄이 또 하나의 툴바가 아니라 위 스위치들과 같은 식구로 읽히게 */
/* Same look as the chips, so this row reads as one family with the switches above */
/* 값을 보여 주는 칸 — 읽기 전용이지만 글꼴·색은 이 페이지의 코드 상자와 같은 결이다 */
/* The value panes: read-only, but dressed like this page's code boxes */
.demo-pad {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  color: var(--g-fg);
  border: 0;
  display: block;
}

.demo-pad:focus-visible {
  outline: 2px solid var(--g-accent);
  outline-offset: 2px;
}

/* 반반 — 좁아지면 위아래로 선다. 판이 둘이라 각자 제 폭 안에서 스크롤한다 */
/* Half and half, stacking when narrow; each pane scrolls inside its own width */
.demo-panes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem 1rem;
}

@media (min-width: 48rem) {
  .demo-panes {
    grid-template-columns: 1fr 1fr;
  }
}

/* grid 항목의 바닥은 min-content 다 — 0 으로 낮춰야 긴 줄이 칸을 밀어 넓히지 않는다 */
/* A grid item floors at min-content; 0 keeps a long line from widening the column */
.demo-panes > * {
  min-width: 0;
}

.demo-sticky-top,
.demo-sticky-unit {
  padding: 0.05rem 0.35rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.75rem;
  line-height: 1.55;
  color: var(--g-fg);
  background: color-mix(in srgb, var(--g-fg) 6%, transparent);
}

.demo-sticky-top {
  width: 3.25rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.demo-sticky-top:disabled,
.demo-sticky-unit:disabled {
  cursor: default;
}

.demo-fold-caret {
  font-size: 1.05rem;
  line-height: 1;
}

/* Matches the site's panels: no border, lifted by shadow alone; nabi.css owns the editor's own look */
/* 사이트의 판과 결을 맞춘다 — 에디터 자신의 색과 모양은 nabi.css 가 쥔다 */
/* `overflow: hidden` 을 두지 않는다 — 위 마크업의 경고가 이 상자에도 그대로 걸린다.
   숨김·자동 무엇이든 overflow 를 주면 이 상자가 스크롤 컨테이너가 되고, 그러면 안의 크롬은
   "이 상자 안에서" 붙는다 — 상자 자신은 안 스크롤하니 화면에는 영영 안 붙는다.
   모서리는 상자가 잘라 주는 대신 조각들이 각자 자기 모서리를 둥글린다 (2026-08-13 실측) */
/* No `overflow` here — any value makes this a scroll container and the chrome sticks to a box
   that never scrolls, i.e. never. The pieces round their own corners instead */
.demo-host {
  box-shadow: var(--g-shadow);
  border-radius: 12px;
}

/* 편집기가 오기 전에도 자리를 잡아 둔다 (095) — 안 그러면 빈 상자가 납작하게 접혀 있다가
   툴바와 본문이 한꺼번에 들어차며 페이지가 통째로 밀린다. 그 튐이 "깜박임" 으로 읽힌다.
   값은 툴바 줄 + 첫 화면에 보일 만큼의 본문이다 — 다 채우려는 것이 아니라 **밀림을 없애는
   것**이 목적이라, 온 뒤 늘어나는 것은 스크롤 아래쪽이라 눈에 안 띈다.
   `:has()` 로 **아직 안 채워졌을 때만** 건다 — 채워진 뒤에는 내용이 높이를 정해야 한다. */
.demo-host:has(> .nabi-content:empty) {
  min-block-size: 22rem;
}

.demo-host .nabi-content {
  border-radius: 0 0 12px 12px;
  /* 비워도 한 줄로 접히지 않게 — 데모는 만져 보는 자리라, 글을 다 지운 순간 상자가 한 줄로
     주저앉으면 그 아래가 통째로 위로 딸려 올라온다. 200px 만큼은 늘 열어 둔다.
     Keep the editing area open even when emptied (200px) - a collapsed box yanks the page up */
  min-block-size: 12.5rem;
}

/* 붙는 것 자체는 코어의 `.nabi-toolbar` 기본값이다 — 여기는 라운드 모서리만 맞춘다 */
/* The sticking itself is core's `.nabi-toolbar` default — only the corner radius lives here */
.demo-chrome {
  border-radius: 12px 12px 0 0;
}

/* float 를 품어야 크롬이 도구의 높이를 센다 — 안 그러면 상황 줄이 그 위로 겹쳐 올라온다 */
/* Contain the float or the chrome ignores the tools' height and the context row rides over it */
.demo-toolbar-row::after {
  content: '';
  display: block;
  clear: both;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.05rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.75rem;
  line-height: 1.55;
  color: var(--g-muted);
  background: color-mix(in srgb, var(--g-fg) 6%, transparent);
  cursor: pointer;
  user-select: none;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.chip:hover {
  background: color-mix(in srgb, var(--g-fg) 11%, transparent);
}

.chip-on {
  color: var(--g-accent);
  background: color-mix(in srgb, var(--g-accent) 14%, transparent);
}

.chip-on:hover {
  background: color-mix(in srgb, var(--g-accent) 22%, transparent);
}

.chip:has(:focus-visible) {
  outline: 2px solid var(--g-accent);
  outline-offset: 2px;
}
</style>
