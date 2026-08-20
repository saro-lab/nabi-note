<!-- Teleported to body when narrow: the outer layout is an `@container`, and inside one `fixed` resolves against the container, not the viewport -->
<!-- 좁을 때 body 로 내보낸다 — 바깥이 `@container` 라 그 안에서는 `fixed` 가 뷰포트가 아니라 컨테이너를 잡는다 -->
<template>
  <Teleport to="body" :disabled="!drawer">
    <div v-if="drawer" class="menu-scrim" @click="close"></div>

    <nav
      v-if="!narrow || modelValue"
      class="g-glass rd-box w-[14rem] shrink-0 p-3 text-[0.9rem]"
      :class="drawer ? 'menu-drawer' : ''"
    >
      <div v-for="group in NAV" :key="group.key" class="mb-3">
        <div class="mb-1 px-2 text-[0.8rem] font-semibold opacity-60">{{ t(group.key) }}</div>

        <template v-for="entry in group.entries" :key="entryKey(entry)">
          <a
            v-if="isLink(entry)"
            :href="`${root}${entry.path}`"
            class="block rounded py-1 pr-2 pl-5 g-link-hover"
            :class="isCurrent(entry.path) ? 'font-semibold' : ''"
          >
            {{ t(entry.key) }}
          </a>

          <div v-else class="mt-1">
            <div class="px-2 py-1 text-[0.85rem] opacity-70">{{ t(entry.key) }}</div>
            <a
              v-for="item in entry.items"
              :key="item.path"
              :href="`${root}${item.path}`"
              class="block rounded py-1 pr-2 pl-5 g-link-hover"
              :class="isCurrent(item.path) ? 'font-semibold' : ''"
            >
              {{ t(item.key) }}
            </a>
          </div>
        </template>
      </div>

      <div class="projects pt-3">
        <div class="mb-1 px-2 text-[0.8rem] font-semibold opacity-60">{{ t('menu_projects') }}</div>
        <a
          v-for="project in PROJECTS"
          :key="project.name"
          :href="project.href"
          target="_blank"
          rel="noreferrer"
          class="flex items-center gap-2 rounded px-2 py-1 g-link-hover"
        >
          <img :src="project.icon" :alt="project.name" width="16" height="16" class="size-4 shrink-0" loading="lazy" />
          <span class="truncate">{{ project.name }}</span>
          <Icon name="open_in_new" class="ml-auto text-[0.85rem]! opacity-45" />
        </a>
      </div>
    </nav>
  </Teleport>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'
import { useData } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { NAV, isLink, type NavEntry } from '../src/nav.ts'
import { PROJECTS } from '../src/projects.ts'
import { useRoot, useTranslate } from '../src/langs.ts'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const { page } = useData()
const { t } = useTranslate()
const root = useRoot()

// Must use the header hamburger's breakpoint exactly, or some widths get a drawer with no button
// 헤더 햄버거와 같은 문턱을 써야 한다 — 어긋나면 버튼 없이 층만 뜨는 폭이 생긴다
// `false` on the server, so it renders in the wide layout and the menu is visible without JavaScript
// 서버에서는 `false` 라 넓은 화면 배치로 그려진다 — 자바스크립트 없이도 메뉴가 보인다
const narrow = ref(false)
const drawer = computed(() => narrow.value && props.modelValue)

let media: MediaQueryList | null = null
const onMedia = (event: MediaQueryListEvent | MediaQueryList): void => {
  narrow.value = event.matches
  // Close on widening, or the drawer snaps back in flow and shoves the article aside
  // 넓어지면 열려 있던 층을 닫는다 — 안 닫으면 제자리로 돌아가며 본문을 밀어낸다
  if (!event.matches && props.modelValue) close()
}

function close(): void {
  emit('update:modelValue', false)
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.modelValue) close()
}

onMounted(() => {
  media = window.matchMedia('(max-width: 59.99rem)')
  onMedia(media)
  media.addEventListener('change', onMedia)
  document.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  media?.removeEventListener('change', onMedia)
  document.removeEventListener('keydown', onKey)
})

// A branch has no path, so its locale key stands in as the unique key
// 묶음은 경로가 없으므로 로케일 키가 그 자리를 대신한다
function entryKey(entry: NavEntry): string {
  return isLink(entry) ? entry.path : entry.key
}

function isCurrent(path: string): boolean {
  return page.value.relativePath.replace(/\.md$/, '').endsWith(path.slice(1))
}
</script>

<style scoped>
.projects {
  border-top: 1px solid color-mix(in srgb, var(--g-border) 55%, transparent);
}

/* Teleported to body, so `fixed` here really is viewport-relative */
/* body 로 내보낸 뒤라 여기서 쓰는 `fixed` 는 진짜 뷰포트 기준이다 */
.menu-scrim {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgb(0 0 0 / 35%);
}

.menu-drawer {
  position: fixed;
  top: 3.4rem;
  inset-inline-start: 0.5rem;
  z-index: 61;
  /* A long menu scrolls inside itself rather than the page */
  /* 메뉴가 길어 화면을 넘으면 안쪽만 스크롤한다 */
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
