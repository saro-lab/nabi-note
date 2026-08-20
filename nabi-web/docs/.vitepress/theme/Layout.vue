<template>
  <div class="mb-16 @container/layout">
    <template v-if="localeIndex !== 'root'">
      <header class="g-glass drop-none @min-md:border-b! absolute w-full z-50 text-[0.9rem]">
        <div class="g-frame g-frame-full">
          <div class="header-content select-none flex items-center h-[3rem] gap-1 px-1.5 @max-[46rem]:px-2">
            <!-- This breakpoint must match `ui/Menu.vue` exactly, or some widths get a menu with no button (or the reverse) -->
            <!-- 문턱은 `ui/Menu.vue` 의 층 전환과 같은 값이어야 한다 — 어긋나면 버튼 없는 폭이 생긴다 -->
            <div v-if="hasMenu" class="hdr-btn g-link-hover min-[60rem]:hidden!" @click="onMenu = !onMenu">
              <Icon name="menu" :weight="1.2" class="text-xl!" />
            </div>
            <a :href="`${root}/`" class="flex items-center gap-1.5 px-1 font-medium text-[1rem]">
              <Mark size="1.25em" class="text-[var(--g-accent)]" />
              NABI NOTE
            </a>
            <div class="flex-1"></div>

            <!-- The only worded link in a bar of icons, so it wears one too and gives its word up at
                 the same width the language name does — see `ui/SelectLanguage.vue` for why 32rem.
                 The book is drawn here rather than named from material-symbols because an icon font
                 paints on a second round trip (`display: block`), and this one sits beside the site's
                 own mark where a late arrival reads as a broken link. Its size is in `rem` like every
                 neighbour: the header is sized off the root, so one `html { font-size }` moves the
                 whole bar together — a pixel value here would stay behind. -->
            <!-- 아이콘 줄에서 유일하게 글자를 든 링크다 — 그래서 아이콘을 하나 달고, 그 글자는
                 언어 이름과 **같은 폭에서** 물러난다(32rem 인 까닭은 `ui/SelectLanguage.vue`).
                 책을 material-symbols 이름으로 부르지 않고 여기 그리는 까닭: 아이콘 글꼴은 한 번
                 더 오가야 그려지는데(`display: block`), 이 자리는 사이트 마크 바로 옆이라 늦게
                 도착하면 깨진 링크로 읽힌다. 크기는 이웃들과 같이 `rem` 이다 — 헤더가 뿌리 글자
                 크기를 타므로 `html { font-size }` 하나로 줄 전체가 같이 움직인다(px 이면 이것만
                 뒤에 남는다). -->
            <a
              :href="`${root}/intro`"
              class="hdr-btn gap-1.5 px-2 font-medium g-link-hover"
              :title="t('menu_docs')"
              :aria-label="t('menu_docs')"
            >
              <!-- Outer sheet then the spine: two pages opened flat, the shape a reader already
                   reads as "documents" — stroked to sit with the outlined icons around it -->
              <!-- 겉장을 두르고 가운데 등을 긋는다 — 펼쳐 놓은 두 쪽, 읽는 사람이 이미 "문서"로
                   읽는 모양이다. 둘레선으로 그려 옆의 아웃라인 아이콘들과 한 줄에 선다 -->
              <svg
                viewBox="0 0 16 16"
                class="w-[1.05rem] h-[1.05rem]"
                fill="none"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M8 4.35C6.55 3.4 4.83 3 2.9 3.2a.62.62 0 0 0-.55.62v7.51c0 .37.31.65.67.61 1.79-.18 3.36.22 4.98 1.26 1.62-1.04 3.19-1.44 4.98-1.26a.62.62 0 0 0 .67-.61V3.82a.62.62 0 0 0-.55-.62c-1.93-.2-3.65.2-5.1 1.15Z"
                />
                <path d="M8 4.35v8.85" />
              </svg>
              <span class="@max-[32rem]:hidden!">{{ t('menu_docs') }}</span>
            </a>

            <!-- Searches the language the reader is already in — one index, this one -->
            <!-- 읽는 사람이 이미 들어와 있는 그 언어를 찾는다 — 색인은 이 언어의 것 하나다 -->
            <div class="hdr-btn g-link-hover" :title="t('search')" @click="onSearch = true">
              <Icon name="search" :weight="1.6" class="text-[1.05rem]!" />
            </div>

            <!-- The one brand mark in the header — material-symbols has no GitHub glyph, so the
                 logo rides inline rather than pulling a second icon font over the wire -->
            <!-- 헤더의 유일한 브랜드 마크 — material-symbols 에 GitHub 글리프가 없어, 아이콘
                 글꼴을 하나 더 받아 오는 대신 로고를 안에 그린다 -->
            <!-- Two rules ride on this one link. First, its size is in `rem`, not the `width`/`height`
                 attributes it used to carry: those are pixels, so the zoom moved every other icon in
                 the bar and left this one behind. Second, it is the first thing to go when the bar
                 runs out of room — the repo is one tap away from the footer, while search, theme and
                 language have nowhere else to be. -->
            <!-- 이 링크 하나에 규칙이 둘 붙는다. 하나, 크기가 `rem` 이다 — 예전의 `width`/`height`
                 속성은 픽셀이라 돋보기가 줄의 다른 아이콘을 다 키우는 동안 이것만 그대로였다.
                 둘, 줄이 좁아지면 **가장 먼저 물러난다** — 저장소는 바닥글에서도 한 번에 닿지만
                 검색·테마·언어는 갈 곳이 없다. -->
            <a
              :href="REPO"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              class="hdr-btn g-link-hover @max-[32rem]:hidden!"
            >
              <svg viewBox="0 0 16 16" class="w-[1.05rem] h-[1.05rem]" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
            </a>

            <div class="hdr-btn g-link-hover" @click="isDark = !isDark">
              <Icon :name="isDark ? 'dark_mode' : 'light_mode'" :weight="1.6" class="text-[1.05rem]!" />
            </div>

            <SelectLanguage />
          </div>
        </div>
      </header>

      <div class="h-[3rem]"></div>

      <Search v-if="onSearch" @close="onSearch = false" />

      <div class="mt-4 g-frame g-frame-full" :class="hasMenu ? 'flex items-start justify-center gap-[1rem]' : ''">
        <Menu v-if="hasMenu" v-model="onMenu" />
        <main v-if="hasPage" :class="hasMenu ? 'g-glass rd-box g-frame flex-1 md' : ''">
          <Content />
        </main>
        <div v-else class="flex-1 g-glass rd-box">
          <div class="pt-[9rem] pb-[10rem]">
            <div class="text-3xl text-center">404<br /><br />{{ t('page_not_found') }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- Root with no language: offer a choice, since the redirect script only runs on the client -->
    <!-- 언어 없이 들어온 루트 — 고르게 한다. 보내 주는 스크립트는 클라이언트에서만 돌기 때문이다 -->
    <div v-else class="g-frame pt-[9rem] pb-[10rem] text-center">
      <Mark size="3.5em" class="mx-auto text-[var(--g-accent)]" />
      <div class="mt-4 text-3xl">NABI NOTE</div>
      <div class="mt-8 flex flex-wrap justify-center gap-6">
        <a v-for="[code, name] in languages" :key="code" :href="`/${code}/`" class="g-link">{{ name }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '../ui/Icon.vue'
import { Content, useData, useRouter } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'

import Mark from '../ui/Mark.vue'
import Menu from '../ui/Menu.vue'
import Search from '../ui/Search.vue'
import SelectLanguage from '../ui/SelectLanguage.vue'
import { applyLanguage, languageList, useRoot, useTranslate } from '../src/langs.ts'
import { REPO } from '../src/projects.ts'
import { doCopyToClipboard } from '../src/util.ts'

const { t } = useTranslate()
const { frontmatter, page, isDark, localeIndex } = useData()
const root = useRoot()

const languages = Object.entries(languageList)

const hasPage = computed(() => !page.value.isNotFound)
const hasMenu = computed(() => hasPage.value && frontmatter.value?.layout !== 'home')

const onMenu = ref(false)
const onSearch = ref(false)

useRouter().onBeforeRouteChange = () => {
  onMenu.value = false
  onSearch.value = false
}

// ⌘K · Ctrl+K opens it, the way every other docs site does. Not `/`: this site puts a real editor
// on its front page, and a lone slash belongs to whoever is typing.
// ⌘K · Ctrl+K 로 연다 — 문서 사이트가 다 그렇게 한다. `/` 는 안 쓴다: 이 사이트 첫 화면에는 진짜
// 편집기가 있고, 빗금 하나는 지금 글을 치는 사람의 것이다.
function onSearchKey(event: KeyboardEvent): void {
  if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
  event.preventDefault()
  onSearch.value = true
}

// Copy buttons come from two places and are rebuilt per page, so one delegated listener beats one per button
// 복사 버튼은 두 곳에서 생기고 페이지마다 새로 생긴다 — 버튼마다 달지 않고 문서에 하나만 걸어 위임한다
// `textContent` is the original source — the spans added for painting don't change any characters
// 칠하느라 심은 span 은 글자를 바꾸지 않으므로 `textContent` 가 곧 원본이다
function onCopyClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null
  const button = target?.closest?.('div[class*="language-"] > .copy')
  if (!(button instanceof HTMLElement)) return

  const code = button.parentElement?.querySelector('pre')?.textContent ?? ''
  if (code !== '') void doCopyToClipboard(button, code)
}

onMounted(() => {
  watchEffect(() => {
    if (page.value.isNotFound) {
      document.title = 'NABI NOTE'
    }
  })
  applyLanguage()
  document.addEventListener('click', onCopyClick)
  document.addEventListener('keydown', onSearchKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onCopyClick)
  document.removeEventListener('keydown', onSearchKey)
})
</script>

<style scoped>
.header-content,
.header-content * {
  line-height: 1;
}
</style>
