<!-- nabi-note는 dist/exports 없는 프로토타입이라 vite alias로 형제 저장소 TS를 직접 문다(config.mts). -->
<!-- nabi-note has no dist/exports yet, so a vite alias points straight at the sibling repo's TS (see config.mts). -->
<!-- 에디터는 document 위에서만 살아 onMounted 안에서 동적으로 부른다 — SSR·첫 번들엔 안 실린다. -->
<!-- The editor needs document, so it's imported dynamically inside onMounted, away from SSR and the first bundle. -->
<!-- wing을 갈아 끼우면 조립 전체를 다시 만들어 화면 값을 물려준다 — 꺼진 마크업이 평문으로 보이도록. -->
<!-- Toggling a wing rebuilds the whole assembly and hands over the on-screen value, so dropped markup visibly falls to plain text. -->
<template>
  <section class="not-md">
    <!-- 스위치를 상자에 담지 않는다 — 주인공은 편집기이고, 상자는 그것을 아래로 밀기만 했다. -->
    <!-- No panel around the switches: the editor is the subject, and a box here only pushed it down. -->
    <div class="mb-2">
      <div>
        <!-- 라이트·다크는 여기 두지 않는다 — 머리줄에 이미 있는 스위치다. -->
        <!-- Light/dark is not repeated here — the header already carries that switch. -->
        <!-- 고정 순서로 먼저 그리고 mount 후 그 자리에서 섞는다 — 서버·브라우저가 같아야 이어받는다. -->
        <!-- Drawn in a fixed order first, shuffled in place on mount — server and browser must match to hydrate. -->
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

        <!-- wing 고르기 — 페이지가 좁히지 않으면 기본은 전부 켜짐. -->
        <!-- Wing picker — every wing starts on unless the page narrows it. -->
        <div class="mt-2 mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.8rem]">
          <!-- 폰에서는 이름표가 곧 스위치다 — 그 밖의 화면에서는 목록의 제목일 뿐이다. -->
          <!-- On a phone the label is the switch; everywhere else it is just the heading of the list. -->
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

        <!-- 앞에 표를 두지 않는다 — 켜짐은 물든 색이 말하고, 아이콘 스물은 줄 높이를 한 줄 먹는다. -->
        <!-- No mark in front: the tint says on or off, and twenty-odd icons cost a whole row of height. -->
        <!-- 켜졌든 꺼졌든 전부 늘어놓는다 — 꺼진 칩이 요점이지 감출 잡동사니가 아니다. -->
        <!-- Every wing is listed, on or off — an off chip is the point, not clutter to hide. -->
        <div v-if="wingsShown" class="flex flex-wrap gap-1">
          <label v-for="item in catalog" :key="item.id" class="chip" :class="{ 'chip-on': picked[item.id] }">
            <input v-model="picked[item.id]" type="checkbox" class="sr-only" />
            {{ item.label }}
          </label>
        </div>
      </div>
    </div>

    <!-- 데모용 확대·축소 — 루트 글자 크기를 몰아 rem으로 적힌 화면 전체가 한 번에 따라온다. -->
    <!-- Page zoom for the demo: it drives the root font-size, so every rem on the page follows at once. -->
    <div class="mb-2 flex items-center gap-2 text-[0.8rem]">
      <!-- 아이콘 글꼴 대신 인라인 SVG다 — 글꼴이 늦으면 "zoom_in" 글자가 먼저 보였다 바뀐다(2026-08-19). -->
      <!-- Inline SVG, not an icon-font ligature — a late font flashed the literal word "zoom_in" first. -->
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

      <!-- 끄는 동안은 숫자만 움직인다 — 화면은 손을 뗄 때 다시 그린다, 매 걸음 바꾸면 화면이 떤다. -->
      <!-- The drag only moves the readout; the page rescales on release, or every step reflows it and shakes. -->
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

      <!-- wing 스위치와 같은 칩이다 — 이 줄이 또 하나의 툴바가 아니라 같은 식구로 읽히게. -->
      <!-- Same chips as the wing switches, so the row reads as one family rather than a second toolbar. -->
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
        <!-- 숫자가 곧 되돌리기 단추다 — 지금 보고 있는 그 값이 되돌리고 싶은 대상이다. -->
        <!-- The readout is the reset: the number you are looking at is the thing you want to put back. -->
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

    <!-- 붙는 크롬 — 셋 다 호스트의 선택이라 데모도 스위치로 보여 준다(클래스·토큰·mount 하나씩). -->
    <!-- Sticky chrome — all three are the host's choice, so the demo exposes each as a switch. -->
    <div class="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem]">
      <label class="chip" :class="{ 'chip-on': stickyOn }">
        <input v-model="stickyOn" type="checkbox" class="sr-only" />
        {{ t('demo_sticky') }}
      </label>
      <label class="chip" :class="{ 'chip-on': stickyKeyboard }">
        <input v-model="stickyKeyboard" type="checkbox" class="sr-only" />
        {{ t('demo_sticky_keyboard') }}
      </label>

      <!-- 서체의 기본값은 wing을 선언할 때 정한다 — 데모니까 그 선언도 골라 본다. -->
      <!-- The typeface's default is declared when the wing is built; the demo picks that too. -->
      <span class="flex items-center gap-1">
        <span class="text-[var(--g-muted)]">{{ t('demo_typeface_base') }}</span>
        <select v-model="typefaceBase" class="demo-sticky-unit" :aria-label="t('demo_typeface_base')">
          <option value="sans">{{ t('demo_typeface_sans') }}</option>
          <option value="serif">{{ t('demo_typeface_serif') }}</option>
          <option value="mono">{{ t('demo_typeface_mono') }}</option>
          <option value="cursive">{{ t('demo_typeface_cursive') }}</option>
        </select>
      </span>

      <!-- 높이는 수가 아니라 CSS 길이다 — 시트가 rem으로 적혀 있으니 단위는 호스트가 고른다. -->
      <!-- The offset is a CSS length, not a number — the unit is the host's to choose. -->
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

    <!-- 여기에 `overflow-hidden`을 두지 않는다 — 스크롤 컨테이너가 되어 스티키 툴바가 안 붙는다. -->
    <!-- No `overflow-hidden` here: it makes this a scroll container and the sticky toolbar never sticks. -->
    <!-- .nabi/.nabi-content는 코어 시트의 뿌리/편집기 클래스다 — create() 한 문이 없어 조각마다 직접 mount한다. -->
    <!-- .nabi/.nabi-content are the core sheet's own classes; with no single create() door, each piece mounts on its own. -->
    <div ref="rootEl" class="demo-host rd-box nabi">
      <div ref="chromeEl" class="demo-chrome" :class="{ 'nabi-toolbar': stickyOn }">
        <!-- 도구 자리가 툴바보다 앞에 선다 — 코어가 float로 띄우는데, float는 뒤에 오는 줄만 비켜 간다. -->
        <!-- The tools slot comes BEFORE the toolbar: the core floats it, and a float only clears lines after it. -->
        <div class="demo-toolbar-row">
          <!-- 미리 그린 뷰 도구 둘(097) — 툴바와 같은 길이다. -->
          <span ref="toolsEl" v-html="props.viewToolsHtml ?? ''"></span>
          <!-- 미리 그린 툴바를 그대로 심는다(096) — mountToolbar가 이미 선 줄을 알아보고 배선만 건다. -->
          <!-- The toolbar HTML is pre-rendered (096); mountToolbar recognizes the existing markup and just wires it. -->
          <!-- nabi-toolbar-row는 첫 그림부터 단다 — mount 때 달면 여백이 붙어 줄이 밀린다(2026-08-19). -->
          <!-- nabi-toolbar-row is set on first paint, not on mount, or its margin shifts the row (2026-08-19). -->
          <div ref="toolbarEl" class="nabi-toolbar-row" v-html="props.toolbarHtml ?? ''"></div>
        </div>
        <div ref="contextToolbarEl" hidden></div>
      </div>
      <!-- 미리 그려 둔 문서를 그대로 심는다 — 서버·브라우저 첫 그림이 같아야 hydrate가 맞는다(095ⓐ). -->
      <!-- The pre-rendered document is planted as-is; server and browser must match on first paint to hydrate (095a). -->
      <div
        ref="editorEl"
        class="nabi-content"
        contenteditable="true"
        spellcheck="false"
        v-html="props.ssrHtml ?? ''"
      ></div>
    </div>

    <!-- 나가는 값 둘을 나란히 — 왼쪽은 HTML, 오른쪽은 문서의 실체인 나비트리다(좁은 화면은 위아래로). -->
    <!-- The two outgoing values side by side: the HTML that leaves, and the tree it came from. -->
    <div class="demo-panes mt-4">
      <div>
        <div class="flex items-baseline gap-3 text-[0.85rem]">
          <span class="font-semibold">HTML</span>
          <span class="flex-1"></span>
          <span v-if="!ready" class="opacity-60">{{ t('demo_loading') }}</span>
        </div>
        <!-- 읽기 전용 textarea다 — 칸 안 Ctrl+A로 값 전체를 고르기가 <pre>보다 쉽고, 스크롤도 갇힌다. -->
        <!-- A read-only textarea: selecting the whole value with Ctrl+A is easier than from a <pre>. -->
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
        <!-- 줄을 접는다 — 값은 들여쓰기 없이 시리얼라이즈한 한 줄이라, 안 접으면 가로로 끌어야 한다. -->
        <!-- Wraps: the value is the serialized tree as-is, one long line that would need horizontal scroll. -->
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

    <!-- 코드는 접지 않는다 — 스크롤 안에 갇히면 "이만큼이면 된다"가 한눈에 안 들어온다. -->
    <!-- Never collapsed — trapped in a scroller you lose the "this is all it takes" impression. -->
    <CodeBox lang="ts" :code="code" />
  </section>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useData } from 'vitepress'

// 편집기 시트는 정적으로 문다(095) — 런타임에 붙이면 서버가 그린 문서가 맨몸으로 그려졌다 펴진다.
// The editor sheet is linked statically (095); injecting it at runtime flashes unstyled content first.
import 'nabi-note/nabi.css'
import { useTranslate } from '../src/langs.ts'
import { loadSampleTrees, type SampleKey, type SampleTree } from '../src/sample.ts'
import { shuffle } from '../src/util.ts'
import { chips as CHIPS } from '../trees/chips.ts'
import { loadEditorFonts } from '../src/fonts.ts'
import CodeBox from './CodeBox.vue'
// 타입만 가져온다 — 런타임에는 지워지므로 Shiki가 SSR·첫 번들에 끌려 들어가지 않는다.
// Type-only import, erased at runtime, so Shiki never reaches SSR or the first bundle.
import type { CodeHighlighting } from '../src/highlight.ts'
import type { CodeHighlighter, Wing } from 'nabi-note'

// wings는 처음 상태만 정한다 — 칩으로 껐다 켜는 것은 그대로고, 안 주면 전부 켜진다.
// wings only sets the initial state; the chips still toggle everything, and omitting it starts all on.
// foldWings는 첫 화면 전용이다 — 거기 칩 목록이 편집기를 폰에서 첫 화면 밖으로 밀어냈었다.
// foldWings is the front page's alone: its chip list once pushed the editor off a phone's first screen.
// sample은 예문 이름표다 — 굳혀 둔 나비트리 중 읽는 쪽 언어 한 벌만 mount 때 불러온다.
// sample names the sample; the frozen nabi-tree for the page's language is fetched on mount.
// ssrHtml은 미리 그려 둔 편집기 HTML이다(095ⓐ) — mount가 hydrate로 그 DOM을 이어받아 빈 상자가 안 생긴다.
// Pre-rendered editor HTML (095a): mount adopts that DOM via hydrate instead of starting from empty.
const props = defineProps<{
  wings?: readonly string[]
  sample?: SampleKey
  foldWings?: boolean
  ssrHtml?: string
  // 미리 그려 둔 툴바 HTML(096) — 주면 아이콘 줄이 코어를 기다리지 않는다.
  // Pre-rendered toolbar HTML (096); the icon row doesn't wait on the core when supplied.
  toolbarHtml?: string
  // 미리 그려 둔 뷰 도구 HTML(097) — 미리보기·전체화면 둘.
  // Pre-rendered view-tools HTML (097) — preview and fullscreen.
  viewToolsHtml?: string
}>()

const { t } = useTranslate()
const { lang } = useData()

// 에디터 표시 언어는 이 자리에서만 산다 — 쿠키에도 주소에도 남기지 않는다.
// Editor language lives only in this component — never written to the cookie or the URL.
// 페이지의 언어로 연다 — 예전엔 ko·en만 골라 /ja/에서도 한국어 툴바가 떴다. 칩으로 바꾸는 건 그대로다.
// It opens in the page's own language; picking only ko/en once showed a Korean toolbar on /ja/. Chips still switch it.
const locale = ref((lang.value || 'en').split('-')[0] as string)

// 목록은 패키지의 LOCALES를 그대로 쓰지만, 이름은 패키지에 없어(사전이 wing마다 흩어져 있다) 여기서 채운다.
// The list comes from the package's LOCALES; the display names are the caller's own to fill in.
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
  fa: 'فارسی',
  mr: 'मराठी',
  vi: 'Tiếng Việt',
  te: 'తెలుగు',
  ha: 'Hausa',
  tr: 'Türkçe',
  sw: 'Kiswahili',
  ta: 'தமிழ்',
  th: 'ไทย',
  it: 'Italiano',
}
// 첫 그림은 안 섞은 것이다 — 자리만 잡으면 되고, 서버가 보낸 것과 같아야 한다.
// The first paint is unshuffled: it only needs to hold the space, and it must match the server.
const languages = ref<[string, string][]>(Object.entries(LOCALE_NAMES) as [string, string][])
const langsReady = ref(false)

// 확대·축소는 body가 아니라 루트 글자 크기를 탄다 — 이 사이트 크기는 전부 rem이라 루트만 본다(2026-08-09 실측).
// Zoom rides the root font-size, not body: every size here is in rem, which only answers to the root.
const ZOOM_MIN = 80
const ZOOM_MAX = 300
const ZOOM_STEP = 10
// 100%는 손대기 전 그대로여야 한다 — 박아 둔 15 탓에 돋보기를 만지면 16px 루트가 15px로 남았었다(2026-08-23).
// 100% must mean "as it already was": a hardcoded 15 once left the 16px root a notch smaller after zooming.
// 그래서 바닥은 브라우저가 실제로 쓰는 루트 크기를 첫 그림 때 한 번만 잰다(나중에 재면 우리 값을 도로 읽는다).
// So the base is measured once on first paint from the browser's real root size (re-reading later reads our own override).
const ZOOM_BASE_FALLBACK_PX = 16
let zoomBasePx = ZOOM_BASE_FALLBACK_PX

const readZoomBasePx = () => {
  const px = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  if (px > 0) zoomBasePx = px
}

const zoom = ref(100)
const draft = ref(100)

const applyZoom = (value: number) => {
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value || 100))
  draft.value = clamped
  zoom.value = clamped
}

const stepZoom = (by: number) => applyZoom(zoom.value + by)

watch(zoom, (value) => {
  document.documentElement.style.fontSize = `${(zoomBasePx * value) / 100}px`
})

const RANGE_NEEDS_REM = 32
const PHONE_REM = 40

const viewportRem = ref(Number.POSITIVE_INFINITY)
const roomForRange = computed(() => viewportRem.value >= RANGE_NEEDS_REM)

const foldable = computed(() => props.foldWings === true && viewportRem.value < PHONE_REM)
const wingsOpen = ref(false)
const wingsShown = computed(() => !foldable.value || wingsOpen.value)

const measureViewport = () => {
  viewportRem.value = window.innerWidth / ((zoomBasePx * zoom.value) / 100)
}
watch(zoom, measureViewport)

// 붙는 크롬 — 코어가 주는 셋(클래스·토큰·mountSticky)을 다 호스트가 켜고 끄니, 데모도 스위치 셋으로 낸다.
// Sticky chrome — the core offers three knobs (class/token/mountSticky), all host-owned, so the demo exposes three switches.
// 기본 서체도 이제 토큰 하나(--nabi-typeface-base)다 — 예전엔 wing을 다시 지어야 바뀌었다.
// The base typeface is a token now, not an option frozen when the wing was built.
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
// 문서의 실체 — 화면의 HTML이 아니라 그것이 나온 자리다.
// The document itself, not the HTML drawn from it.
const treeJson = ref('')
const ready = ref(false)

// 칩 줄도 코어를 안 기다린다 — 이름은 build:trees가 패키지 사전에서 뽑아 굳혀 둔 것이라 서버가 이미 보낸다.
// The chip row doesn't wait for the core either: labels are frozen at build time and already shipped by the server.
const catalog = ref<{ id: string; label: string }[]>([
  ...(CHIPS[(lang.value || 'en').split('-')[0] as string] ?? CHIPS['en'] ?? []),
])
const picked = reactive<Record<string, boolean>>({})
// 미리 선 칩에도 켜짐을 미리 적는다 — 안 적으면 코어가 올 때까지 꺼진 색으로 있다 한꺼번에 물든다.
// Pre-set the on state on the pre-rendered chips too, or they sit off-color until the core arrives.
for (const item of catalog.value) picked[item.id] = props.wings ? props.wings.includes(item.id) : true

// wing은 언제나 다 보이고 꺼진 것은 꺼진 모양일 뿐이다 — 패키지 자신의 데모와 같은 결이다.
// Every wing stays on screen and an off one merely looks off — the same shape the package's own demo uses.

// mount 때 한 번만 불러온다 — 모듈이 클라이언트에서만 오기 때문이다(§ SSR).
// Loaded once on mount — the module only arrives on the client (§ SSR).
type NabiModule = typeof import('nabi-note')
let nabiModule: NabiModule | null = null
// 보는 쪽 런타임은 다른 엔트리다(nabi-note/viewer) — 편집기와 같은 규칙으로 클라이언트에서만 온다.
// The reading-side runtime is a separate entry (nabi-note/viewer), loaded on the client like the editor.
type ViewerModule = typeof import('nabi-note/viewer')
let viewerModule: ViewerModule | null = null
// diff도 다른 엔트리다(nabi-note/diff) — 같은 규칙으로 클라이언트에서만 온다.
// The diff runtime is another entry (nabi-note/diff), loaded on the client by the same rule.
type DiffModule = typeof import('nabi-note/diff')
let diffModule: DiffModule | null = null

// img·upload는 짝이다 — 데모 업로더가 돌려주는 blob: 주소를 그림 wing도 받아야 그림이 선다.
// img/upload are paired: the demo uploader's blob: URL needs the image wing to accept local URLs too.
function demoWings(mod: NabiModule): Wing[] {
  return mod.defaultWings.map((wing) => {
    if (wing.w === 'img') return mod.makeImageWing({ allowLocalUrls: true })
    if (wing.w === 'upload') return mod.makeUploadWing({ allowLocalUrls: true })
    if (wing.w === 'code') return { ...wing, attach: mod.makeCodeAttach({ highlight: highlightCode, version: () => grammarAge }) }
    return wing
  })
}

let allWings: Wing[] = []

// 칩으로 껐다 켜는 것은 단추를 든 wing뿐이다 — 조각(tr·td·li·summary…)은 이제 주인 wing 안에 있다.
// Only wings with a button are chips — parts (tr/td/li/summary…) now live inside their owner.
function pickedWings(): Wing[] {
  return allWings.filter((wing) => picked[wing.w] !== false)
}

// 늦게 도착하고, 코드 wing을 켠 뒤에만 온다.
// Arrives late, and only once the code wing has been toggled on.
let highlighting: CodeHighlighting | null = null
let highlightRequested = false
let stopGrammarWatch: (() => void) | null = null
// 문법이 하나 더 도착할 때마다 하나씩 오른다 — 색칠의 서명에 함께 들어가는 값이다(아래).
// Bumped on every grammar that lands — it rides the paint signature (below).
let grammarAge = 0

const highlightCode: CodeHighlighter = (source, language) => {
  if (!highlighting) {
    ensureHighlighting()
    return null
  }
  return highlighting.highlight(source, language)
}

// 미리보기가 실제로 겪을 것(열 정렬·코드 색칠)을 얹는다 — attachViewer 하나를 부르고 하이라이터만 넘긴다.
// What the reader's published page actually gets (sortable columns, code color): one door, one highlighter handed over.
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
      // 색칠만 없다 — 코드 블록 기능 자체는 그대로 돈다.
      // Only the color is missing; code blocks keep working.
    })
}

// version이 색칠 서명에 들어가므로, 하나 올리고 캐럿을 다시 놓으면 편집기를 안 다시 만들고 다시 칠한다.
// version rides the paint signature, so bumping it and re-seating the caret repaints without rebuilding.
function repaint(): void {
  grammarAge += 1
  if (nabi) nabi.select(nabi.getSelection())
}

// 마운트한 조각 전부 — 다시 만들거나 걷을 때 반대 순서로 해제한다.
// Every mounted piece, torn down in reverse order on rebuild/unmount.
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
let fileMount: (Unmountable & Record<string, unknown>) | null = null
let historyMount: (Unmountable & { sessionId: string }) | null = null
let diffMount: (Unmountable & { open(): void }) | null = null
// 첫 조립인가 — 서버가 그린 DOM을 이어받을 수 있는 것은 이때뿐이다(095ⓐ).
let firstBuild = true
let nabi: ReturnType<NabiModule['createNabiWith']>['nabi'] | null = null
let registry: ReturnType<NabiModule['createNabiWith']>['registry'] | null = null
let stopChange: (() => void) | null = null
// 처음 한 번 넣는 문서 — 굳혀 둔 나비트리다. 두 번째부터는 아래 value가 물려받는다.
// The first document: the frozen nabi-tree. From the second build on, `value` carries it.
let doc: SampleTree | null = null
// 다음 build()에 HTML로 물려준다 — 트리로 물려주면 껐던 wing의 마크업이 되살아나 데모가 거짓말한다.
// Handed to the next build() as HTML; carrying the tree over would resurrect a dropped wing's markup.
let value = ''

function unmountAll(): void {
  stopChange?.()
  stopChange = null
  viewTools?.unmount()
  pickedMark?.unmount()
  hints?.unmount()
  contextToolbar?.unmount()
  toolbar?.unmount()
  settle?.unmount()
  surface?.unmount()
  diffMount?.unmount()
  historyMount?.unmount()
  fileMount?.unmount()
  upload?.unmount()
  uploadView?.unmount()
  viewTools = pickedMark = hints = contextToolbar = toolbar = surface = uploadView = null
  settle = null
  diffMount = null
  historyMount = null
  fileMount = null
  upload = null
  nabi = null
  registry = null
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 데모의 전송 훅 — 서버가 없으니 blob: 주소를 돌려준다. 촘촘한 진행률(5%씩 45ms)이라 코어의 예측 티커는 안 나선다.
// The demo uploader: no server, so it hands back a blob: URL. Fine-grained progress keeps the core's estimating ticker quiet.
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
  // 그림이 아닌 파일은 blob: 대신 고정 링크를 준다 — blob:은 이 탭 밖에선 죽은 링크가 된다.
  // A non-image gets a fixed link instead of blob:, which would be dead outside this tab.
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
  // One editor: the wing list builds the schema, the commands and the assembler together.
  // 코어는 아무것도 안 묻고 "아니오"로 답한다(헤드리스에서도 돌아야 하니) — 호스트가 여기서 대화상자를 끼운다.
  // The core asks nobody and answers "no" (it must run headless too) — the host plugs the dialog in here.
  const made = mod.createNabiWith(wings, {
    ask: {
      message: (text: string) => window.alert(text),
      confirm: (text: string) => window.confirm(text),
    },
    allowLocalUrls: true,
    parseHtml: mod.parseNodes,
    // 예문은 나비트리로 굳혀 두고 그대로 넣는다 — parseHtml은 붙여넣기와 아래 setHtml을 위해 남긴다.
    // The sample goes in as a frozen tree; parseHtml still rides along for paste and setHtml below.
    ...(value === '' && doc ? { doc } : {}),
  })
  nabi = made.nabi
  registry = made.registry
  if (value) nabi.setHtml(value)

  // 2. 시트는 여기서 안 붙인다 — 파일 맨 위에서 nabi-note/nabi.css를 정적으로 문다(095).
  // Sheets are linked statically at the top of this file, not injected here — see the import.

  // 3. 배선이 있어야 사는 wing 다섯: upload·save·open·localHistory·diff — 등록만으론 커맨드가 조용히 죈다.
  // Five wings need wiring; registering alone leaves their commands silently inert.
  if (wings.some((wing) => wing.w === 'upload')) {
    upload = mod.mountUpload({
      nabi,
      uploader: demoUpload,
      root: content,
      extensions: ['txt', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'zip'],
      maxFileSize: 10 * 1024 * 1024,
      maxTotalSize: 20 * 1024 * 1024,
      // 첨부 링크의 글자("첨부파일")를 이 말로 고른다 — 커밋 커맨드는 언어를 모른다.
      // The attachment link's word comes from here; the commit command knows no language.
      locale: here,
      onStart: (tasks) => uploadView?.start(tasks),
      onProgress: (id, percent) => uploadView?.progress(id, percent),
      // 100까지 채운 뒤 커밋, 그 뒤에 자리표시자를 걷는다 — 실물과 자리표시자가 겹쳐 보이지 않게.
      // Settle to 100 before the commit, clear after it, so the two never show together.
      onSettle: () => uploadView?.settle(),
      onDone: () => uploadView?.done(),
      // onReject는 안 끼운다 — 안 끼우면 부속이 toast로 말한다(업로드 오류는 전부 그 길이다).
      // No onReject: left unwired, the mount reports it through the toast, as every upload error does.
    }) as never
    uploadView = mod.mountUploadView({ nabi, surface: content, upload: upload as never, locale: here }) as never
  }
  if (wings.some((wing) => wing.w === 'save' || wing.w === 'open')) {
    fileMount = mod.mountFile({
      nabi,
      // 형식 목록이 여기서 온다 — 저장 형식도 여는 형식도 등록된 어휘가 정한다. **필수다**
      // The format list comes from here — required
      registry,
      store: mod.browserFileStore(document),
      name: () => 'nabi-note',
      // 붙여넣기와 같은 파서다 — .html 파일을 여는 길도 그것으로 열린다.
      // The same parser paste uses; it is also what opens a plain .html file.
      parse: mod.parseNodes,
      allowLocalUrls: true,
      locale: here,
    }) as never
  }
  if (wings.some((wing) => wing.w === 'localHistory')) {
    historyMount = mod.mountLocalHistory({ nabi, storage: mod.browserHistoryStorage(window) }) as never
  }
  // diff — 대조 상태는 문서를 실을 때마다 갈리고, 단추는 아래 툴바의 onHost로 전체화면 판을 연다.
  // The diff wing: the baseline follows every document load; the button opens a fullscreen panel.
  if (diffModule && wings.some((wing) => wing.w === 'diff')) {
    diffMount = diffModule.mountDiffWing({
      nabi,
      registry,
      surface: content,
      allowLocalUrls: true,
      locale: here,
    }) as never
  }

  // 4. 편집 표면 — 드롭·붙여넣기로 온 파일은 업로드로 간다.
  // The edit surface: a dropped file goes to upload.
  surface = mod.mountSurface({
    nabi,
    registry,
    root: content,
    allowLocalUrls: true,
    // 말이 곧 방향이다(098) — 아랍어·우르두를 고르면 편집 영역만 오른쪽에서 왼쪽으로 선다(쪽의 말과 별개).
    // Language decides direction (098) — Arabic/Urdu flips only the edit area to RTL, independent of the page's language.
    locale: here,
    // 첫 조립에서만 이어받는다(095ⓐ) — 그때만 서버가 그린 DOM이 화면에 있어, 나중엔 새로 그리는 쪽이 안전하다.
    // Hydrates only on the first build (095a) — later builds redraw instead, since the DOM by then is the editor's own.
    hydrate: firstBuild && props.ssrHtml !== undefined,
    // 드롭·붙여넣기 파일은 전부 업로드로 간다 — 파일로 문서를 여는 길은 열기 단추 하나뿐이다.
    // Every dropped file goes to upload; opening a document by file is the open button's job alone.
    fileSink: (files) => upload?.take(files as never),
  })

  // 5. 화면 도구 — 몸짓 가라앉기 하나를 툴바·상황 줄·스티키가 나눠 쓴다.
  // The view tools: one settle watcher, shared by the toolbar, the context bar and the sticky band.
  settle = mod.watchSettle(document, { surface: content }) as never
  const common = { nabi, registry, surface: content, settle: settle as never, locale: here }

  toolbar = mod.mountToolbar({
    ...common,
    root: toolbarHost,
    onFiles: (files) => upload?.take(files as never),
    // 저장 판은 배선 한 낱말이다 — fileMount를 건네면 저장 단추와 ⌘S가 그 판을 연다.
    // The save panel is one word of wiring: hand over fileMount and the button/⌘S opens it.
    ...(fileMount ? { file: fileMount as never } : {}),
    // 판이 필요한 도구(로컬 기록)는 호스트로 되돌아오지만, 모양은 openHistoryPanel 하나로 짓는다.
    // A tool needing a panel (local history) comes back to the host, drawn by openHistoryPanel alone.
    onHost: (w: string) => {
      if (w === 'diff') {
        diffMount?.open()
        return
      }
      if (w !== 'localHistory' || !historyMount) return
      mod.openHistoryPanel({
        history: historyMount as never,
        surface: content,
        locale: here,
        // 미리보기 — 기록의 값을 읽기 전용 HTML로 그린다. 편집기를 새로 세우지 않는다.
        // The preview draws the record as read-only HTML; it stands no second editor.
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
  // 브라우저가 그림·영상 위에 선택을 안 그려 주므로, 골라진 물건의 표시는 우리가 그린다.
  // The browser draws no selection over an image or video, so we draw the picked-mark ourselves.
  pickedMark = mod.mountPickedMark({ nabi, surface: content })
  // 미리보기는 발행된 쪽이라 열 정렬·코드 색칠도 살아 있어야 한다 — 코어는 못 걸어(뷰어가 위 층이라)
  // 미리보기가 연 훅으로 호스트가 건다.
  // The preview is the published page, so sorting/code-color must work there too; the core can't attach
  // it (the viewer sits above the editor's layers), so the host does through the hook the preview opens.
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

  // 값은 화면에 실제로 남은 것으로 다시 잡는다 — 껐다 켜도 지운 마크업이 되살아나면 데모가 거짓말이 된다.
  // Re-read from what actually survived — turning a wing back on must not resurrect stripped markup.
  value = editor.getHtml()
  output.value = value
  treeJson.value = JSON.stringify(editor.getJson())
  ready.value = true
  firstBuild = false

  applySticky()
}

// 붙는 크롬 셋 중 보정만 mount다 — 나머지 둘(붙을지, 얼마나 내려 붙을지)은 호스트가 클래스·토큰으로 직접 만진다.
// Of the three sticky knobs, only the inset is a mount; the other two are a class and a token the host sets directly.
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
      ? nabiModule.mountSticky({
          root,
          surface: content,
          chrome,
          ...(nabi ? { nabi: nabi as never } : {}),
          ...(settle ? { settle: settle as never } : {}),
        })
      : null
}

watch([stickyOn, stickyKeyboard, stickyTop, stickyUnit], applySticky)

const install = computed(() => 'npm install nabi-note')

// wing 하나마다 내보내는 이름 하나 — 조각을 거느린 것(표·목록)은 묶음 이름으로 나간다(...tableWings).
// One export name per wing; the ones that carry parts ship as a bundle (...tableWings).
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
  diff: 'diffWing',
  clearFormat: 'clearFormatWing',
}
// 묶음으로 나가는 것들 — 조각(tr·td, li, summary…)이 딸려 있어 한 이름이 여럿을 데려온다.
// These ship as arrays: their parts ride along.
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

  // 배선이 있어야 사는 wing 다섯 — 등록만으로는 커맨드가 조용히 아무 일도 안 한다.
  // Five wings need wiring; registering alone leaves their commands silent.
  const wired: string[] = []
  if (on('upload')) {
    imports.push('mountUpload', 'mountUploadView')
    wired.push(
      'const view = mountUploadView({ nabi, surface: content })',
      'const upload = mountUpload({',
      '  nabi, root: content,',
      ko
        ? '  // 여기에 서버로 올리는 코드 — 진행률은 task.onProgress(0~100)'
        : '  // your upload goes here — report progress with task.onProgress(0–100)',
      ko
        ? "  uploader: async (task) => ({ uri: 'https://example.com/uploaded-file' }),"
        : "  uploader: async (task) => ({ uri: 'https://cdn.example/uploaded' }),",
      "  extensions: ['png', 'jpg', 'pdf'], maxFileSize: 10 * 1024 * 1024,",
      '  onStart: (tasks) => view.start(tasks),',
      '  onProgress: (id, percent) => view.progress(id, percent),',
      '  onSettle: () => view.settle(),',
      '  onDone: () => view.done(),',
      '})',
    )
  }
  if (on('save') || on('open')) {
    imports.push('browserFileStore', 'mountFile', 'parseNodes')
    wired.push(
      `const file = mountFile({ nabi, registry, store: browserFileStore(document), parse: parseNodes, locale: '${locale.value}', name: () => 'note' })`,
    )
  }
  imports.push('mountViewTools')
  if (on('localHistory')) {
    imports.push('browserHistoryStorage', 'mountLocalHistory', 'openHistoryPanel')
    wired.push('const history = mountLocalHistory({ nabi, storage: browserHistoryStorage(window) })')
  }
  if (on('diff')) wired.push(`const diff = mountDiffWing({ nabi, registry, surface: content, locale: '${locale.value}' })`)
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

  // 묻는 wing(열기·기록 지우기)을 켠 예문에만 ask를 보여 준다 — 안 주면 베껴 간 사람의 지우기 단추가 말없이 죽는다.
  // Only shown when a wing actually asks something — without it, a copied clear button dies silently.
  const asks = on('open') || on('save') || on('localHistory')
  const askNote = asks
    ? [
        ko
          ? '// 묻는 상자 — 안 주면 코어는 "아니오"로 답한다(제 상자를 물려도 된다)'
          : '// The box that asks — without it the core answers "no" to everything (plug in your own)',
        'const ask = { message: (t: string) => alert(t), confirm: (t: string) => confirm(t) }',
        '',
      ]
    : []

  const lines = [
    importBlock(imports),
    ...(on('diff') ? ["import { mountDiffWing } from 'nabi-note/diff'"] : []),
    '',
    ...askNote,
    'const selected = [',
    ...wingLines,
    ']',
    asks
      ? 'const { nabi, registry } = createNabiWith(selected, { ask })'
      : 'const { nabi, registry } = createNabiWith(selected)',
    ...codeNote,
    '',
    "const root = document.querySelector('.nabi')!",
    "const content = document.querySelector('.nabi-content')!",
    ...(wired.length > 0 ? ['', ...wired] : []),
    '',
    ko
      ? '// locale 이 글의 방향도 정한다 — 아랍어·우르두면 오른쪽에서 왼쪽으로 선다'
      : '// The locale also sets the direction — Arabic and Urdu run right to left',
    `mountSurface({ nabi, registry, root: content, locale: '${locale.value}'${on('upload') ? ', fileSink: upload.take' : ''} })`,
    '',
    'const settle = watchSettle(document, { surface: content })',
    `const shared = { nabi, registry, surface: content, settle, locale: '${locale.value}' }`,
    ...(on('localHistory') || on('diff')
      ? [
          ko
            ? '// 판이 필요한 도구는 호스트로 돌아온다 — 이 줄이 없으면 단추가 무반응이다'
            : '// A tool that needs a panel comes back to the host — without this the button is dead',
          'const toolbar = mountToolbar({',
          "  ...shared, root: document.querySelector('#toolbar')!,",
          ...(on('save') || on('open') ? ['  file,'] : []),
          ...(on('upload') ? ['  onFiles: upload.take,'] : []),
          '  onHost: (w) => {',
          ...(on('diff') ? ["    if (w === 'diff') { diff.open(); return }"] : []),
          ...(on('localHistory')
            ? [
                "    if (w !== 'localHistory') return",
                '    openHistoryPanel({',
                `      history, surface: content, locale: '${locale.value}', sessionId: history.sessionId,`,
                '      render: (record) => createNabiWith(selected, { doc: JSON.parse(record.body) }).nabi.getHtml(),',
                '    })',
              ]
            : []),
          '  },',
          '})',
        ]
      : [
          `const toolbar = mountToolbar({ ...shared, root: document.querySelector('#toolbar')!${on('save') || on('open') ? ', file' : ''}${on('upload') ? ', onFiles: upload.take' : ''} })`,
        ]),
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

// 말은 세울 때 한 번 건네진다 — 바꾸려면 조각들을 다시 세워야 하지만, 문서 값은 그대로 물려간다.
// The locale is handed over at mount time, so switching it re-stands the pieces; the document rides along.
function setLocale(code: string): void {
  if (locale.value === code) return
  locale.value = code
  loadEditorFonts(code)
  catalog.value = catalog.value.map((item) => ({ ...item, label: labelOf(item.id, code) }))
  build()
}

function labelOf(id: string, code: string): string {
  const mod = nabiModule
  if (!mod) return id
  const wing = allWings.find((candidate) => candidate.w === id)
  if (!wing) return id
  // 이름이 선언에 없으면 ui와 똑같이 사전의 wing.<w>를 본다 — 이름표와 칩이 어긋나지 않게.
  // With no declared name, look up wing.<w> exactly as the ui does, so chip and tooltip agree.
  return mod.makeTranslator(code).pick(wing.button?.label, `wing.${id}`)
}

onMounted(async () => {
  // 재는 것이 먼저다 — 아래 measureViewport()가 이 값으로 폭을 rem으로 옮긴다.
  // Measure first: measureViewport() below converts the width into rem using this number.
  readZoomBasePx()
  measureViewport()
  // 서체 wing이 고를 실제 글꼴 — 펜글씨는 로케일 공통, 본문 보조 글꼴은 이 페이지 문자권만 부른다(src/fonts.ts).
  // The actual typeface fonts — handwriting is shared across locales; body fallbacks load only for this page's script.
  loadEditorFonts(locale.value)
  window.addEventListener('resize', measureViewport)
  // 셋을 함께 부른다 — 차례로 await하면 왕복이 셋이 되어 그동안 데모 자리가 빈 상자로 남는다(095).
  // Fetched together, not sequentially, or the demo would sit empty across three round-trips (095).
  const [nabi, viewer, diff, trees] = await Promise.all([
    import('nabi-note'),
    import('nabi-note/viewer'),
    import('nabi-note/diff'),
    // 예문 한 벌 — 페이지의 언어 것만 온다. 편집기 표시 언어(칩)와는 다른 축이다.
    // One sheet of samples, in the page's language — a different axis from the editor's own locale.
    loadSampleTrees(lang.value),
  ])
  nabiModule = nabi
  viewerModule = viewer
  diffModule = diff

  // 데모를 세울 때 한 번 섞는다 — 머리줄의 언어 목록과 같은 규칙이다(고정 순서는 늘 같은 둘만 엄지 밑에 놓는다).
  // Shuffled once when the demo is built, like the header's language list — a fixed order favors the same two.
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

// 체크가 바뀌면 다시 만든다 — 껐을 때 값이 어떻게 떨어지는지가 데모의 요점이다.
// Rebuilding on every chip change is the whole point — you see what the value loses.
watch(picked, () => build(), { deep: true })

// 토큰 하나만 바꾼다 — wing을 다시 지을 것도, 편집기를 다시 세울 것도 없다.
// One token, no rebuild.
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

/* 인라인 SVG라 상자 크기로 잰다 — 1em으로 두어 옛 리거처와 같은 키다. */
/* Inline SVG, sized by the box not the font — 1em keeps it the old ligature's height. */
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

/* 값을 보여 주는 칸 — 읽기 전용이지만 글꼴·색은 이 페이지의 코드 상자와 같은 결이다. */
/* The value panes: read-only, but dressed like this page's code boxes. */
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

/* 반반 — 좁아지면 위아래로 선다. 각자 제 폭 안에서 스크롤한다. */
/* Half and half, stacking when narrow; each pane scrolls inside its own width. */
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

/* grid 항목의 바닥은 min-content다 — 0으로 낮춰야 긴 줄이 칸을 밀어 넓히지 않는다. */
/* A grid item floors at min-content; 0 keeps a long line from widening the column. */
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

/* 사이트의 판과 결을 맞춘다 — 에디터 자신의 색과 모양은 nabi.css가 쥔다. */
/* Matches the site's panels: no border, lifted by shadow alone; nabi.css owns the editor's own look. */
/* overflow를 두지 않는다 — 스크롤 컨테이너가 되면 안의 크롬이 다시는 안 붙는다(2026-08-13 실측). */
/* No overflow here — any value makes this a scroll container, and the chrome never sticks again. */
.demo-host {
  box-shadow: var(--g-shadow);
  border-radius: 12px;
}

/* 편집기가 오기 전에도 자리를 잡아 둔다(095) — 안 그러면 빈 상자가 갑자기 차며 페이지가 밀린다. */
/* Holds space before the editor lands (095), or the empty box fills suddenly and the page jumps. */
.demo-host:has(> .nabi-content:empty) {
  min-block-size: 22rem;
}

/* 비워도 한 줄로 안 접히는 것은 이제 코어 몫이다(--nabi-content-min-height) — 여기 있던 사본은 걷었다. */
/* The min height now lives in core (--nabi-content-min-height); the copy here is gone. */
.demo-host .nabi-content {
  border-radius: 0 0 12px 12px;
}

/* 붙는 것 자체는 코어의 .nabi-toolbar 기본값이다 — 여기는 라운드 모서리만 맞춘다. */
/* The sticking itself is core's .nabi-toolbar default — only the corner radius lives here. */
.demo-chrome {
  border-radius: 12px 12px 0 0;
}

/* float를 품어야 크롬이 도구의 높이를 센다 — 안 그러면 상황 줄이 그 위로 겹쳐 올라온다. */
/* Contain the float or the chrome ignores the tools' height and the context row rides over it. */
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
