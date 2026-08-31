<template>
  <div class="mb-16 @container/layout">
    <template v-if="localeIndex !== 'root'">
      <header class="g-glass drop-none @min-md:border-b! absolute w-full z-50 text-[0.9rem]">
        <div class="g-frame g-frame-full">
          <div class="header-content select-none flex items-center h-[3rem] gap-1 px-1.5 @max-[46rem]:px-2">
            <!-- 문턱은 `ui/Menu.vue`의 층 전환과 같은 값이어야 한다 — 어긋나면 버튼 없는 폭이 생긴다. -->
            <!-- This breakpoint must match `ui/Menu.vue` exactly, or some widths get a menu with no button. -->
            <div v-if="hasMenu" class="hdr-btn g-link-hover min-[60rem]:hidden!" @click="onMenu = !onMenu">
              <Icon name="menu" :weight="1.2" class="text-xl!" />
            </div>
            <a :href="`${root}/`" class="flex items-center gap-1.5 px-1 font-medium text-[1rem]">
              <Mark size="1.25em" class="text-[var(--g-accent)]" />
              NABI NOTE
            </a>
            <div class="flex-1"></div>

            <!-- rem 크기를 쓰고 아이콘 글꼴 대신 인라인 svg로 그린다 — 로고 옆이라 늦게 뜨면 깨진 링크로 보인다. -->
            <!-- Sized in rem and drawn inline instead of an icon font — next to the site mark, a late icon reads as broken. -->
            <a
              :href="`${root}/guide/getting-started`"
              class="hdr-btn gap-1.5 px-2 font-medium g-link-hover"
              :title="t('menu_docs')"
              :aria-label="t('menu_docs')"
            >
              <!-- 펼친 책 모양 — 겉장과 등을 그어 "문서"로 읽히게, 둘레선만 써서 옆 아이콘들과 맞춘다. -->
              <!-- An open book shape reads as "documents"; stroked outline only, to match the icons beside it. -->
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

            <!-- 읽는 사람이 이미 들어와 있는 그 언어를 찾는다 — 색인은 이 언어의 것 하나다. -->
            <!-- Searches the language the reader is already in — one index, this one. -->
            <div class="hdr-btn g-link-hover" :title="t('search')" @click="onSearch = true">
              <Icon name="search" :weight="1.6" class="text-[1.05rem]!" />
            </div>

            <!-- GitHub 글리프가 없어 로고를 인라인으로 그리며, 크기는 rem — 줄이 좁아지면 이게 가장 먼저 빠진다. -->
            <!-- No GitHub glyph in material-symbols, so the logo is inline and sized in rem; first to drop when the bar narrows. -->
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

    <!-- 언어 없이 들어온 루트 — 고르게 한다. 보내 주는 스크립트는 클라이언트에서만 돌기 때문이다. -->
    <!-- Root with no language: offer a choice, since the redirect script only runs on the client. -->
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

// ⌘K·Ctrl+K로 연다(다른 문서 사이트처럼) — `/`는 안 쓴다, 첫 화면 진짜 편집기에 타이핑용으로 남겨둔다.
// Opens on ⌘K/Ctrl+K like other docs sites; not `/`, since the front page hosts a real editor for typing.
function onSearchKey(event: KeyboardEvent): void {
  if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
  event.preventDefault()
  onSearch.value = true
}

// 복사 버튼은 두 곳에서 생기고 페이지마다 새로 생겨, 버튼마다 안 달고 문서에 위임 리스너 하나만 건다.
// Copy buttons come from two places and rebuild per page, so one delegated listener replaces one-per-button.
// 칠하느라 심은 span은 글자를 안 바꾸므로 textContent가 곧 원본이다.
// The spans added for painting don't change any characters, so textContent is the original source.
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
