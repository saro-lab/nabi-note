<!-- Searches THIS language only: one index is loaded (the page's own) and every hit is checked to
     live under `/<lang>/`. A reader on the Japanese site never gets a Korean page back. -->
<!-- 지금 이 언어만 찾는다 — 색인도 이 페이지의 것 하나만 싣고, 나온 것도 `/<lang>/` 아래인지
     다시 본다. 일본어 사이트에서 한국어 문서가 나오는 일은 없다. -->
<template>
  <div class="search-scrim" @click.self="emit('close')">
    <div class="search-box g-glass rd-box" @keydown="onKey">
      <div class="search-head">
        <Icon name="search" class="head-icon" />
        <input
          ref="inputRef"
          class="search-input"
          type="text"
          :placeholder="t('search')"
          :value="query"
          @input="onInput"
        />
        <Icon
          v-if="query"
          name="backspace"
          class="head-icon g-link-hover cursor-pointer"
          @click="clear"
        />
        <Icon name="close" class="head-icon g-link-hover cursor-pointer" @click="emit('close')" />
      </div>

      <ul v-if="shown.length" class="search-results">
        <li v-for="(item, i) in shown" :key="item.id">
          <a :href="item.id" :class="{ sel: i === sel }" @click="emit('close')" @mouseenter="sel = i">
            <div class="row-head">
              <strong>{{ item.title }}</strong>
              <span v-if="item.group" class="cat">{{ item.group }}</span>
            </div>
            <div class="snippet" v-html="item.snippet"></div>
          </a>
        </li>
      </ul>
      <!-- 빈 자리에도 말이 선다 — 아직 아무것도 안 친 사람에게 빈 칸만 보이면 판이 고장 난 것으로
           읽힌다. 결과가 없다는 말과 같은 자리, 같은 결이다. -->
      <!-- The empty state speaks too: a blank panel before the first keystroke reads as broken -->
      <div v-else class="search-empty">
        {{ query ? t('search_no_results') : t('search_hint') }}
      </div>

      <div class="search-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> {{ t('search_move') }}</span>
        <span><kbd>↵</kbd> {{ t('search_open') }}</span>
        <span><kbd>esc</kbd> {{ t('search_close') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import MiniSearch from 'minisearch'
import { useData, useRouter } from 'vitepress'
import { useTranslate } from '../src/langs.ts'
import { NAV, isLink } from '../src/nav.ts'
import type { SearchDoc } from '../theme/search-loader.ts'

const emit = defineEmits<{ close: [] }>()
const { localeIndex, lang } = useData()
const { t } = useTranslate()
const router = useRouter()

const MAX_SHOWN = 20
const SNIPPET_LEN = 160

const query = ref('')
const hits = ref<Result[]>([])
const sel = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
let engine: MiniSearch<SearchDoc> | null = null

interface Result {
  readonly id: string
  readonly title: string
  readonly group: string
  readonly snippet: string
}

// The left menu already names every page; a hit says which group it came from with the same word.
// 왼쪽 메뉴가 이미 모든 문서를 이름 짓는다 — 결과도 그 낱말 그대로 어느 무리인지 말한다.
const groupOf = (id: string): string => {
  const path = id.replace(/^\/[a-z-]+/, '').replace(/\.html$/, '').replace(/\/$/, '')
  for (const group of NAV) {
    for (const entry of group.entries) {
      if (isLink(entry)) {
        if (entry.path === path) return t(group.key)
      } else if (entry.items.some((item) => item.path === path)) {
        return t(entry.key)
      }
    }
  }
  return ''
}

function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// The line the word actually sits on, not the head of the page — a document is long and the first
// 160 characters are the same introduction on every one of them.
// 낱말이 실제로 앉은 자리를 보여 준다 — 문서는 길고, 앞 160자는 어느 문서나 같은 머리말이다.
function snippetOf(text: string, terms: readonly string[]): string {
  const lower = text.toLowerCase()
  let first = -1
  for (const term of terms) {
    const at = lower.indexOf(term.toLowerCase())
    if (at >= 0 && (first < 0 || at < first)) first = at
  }
  const start = Math.max(0, first < 0 ? 0 : first - 40)
  const raw =
    (start > 0 ? '…' : '') +
    text.slice(start, start + SNIPPET_LEN) +
    (start + SNIPPET_LEN < text.length ? '…' : '')
  const marks = terms.filter((term) => term.length >= 2).map(escapeRegex)
  const html = escapeHtml(raw)
  return marks.length ? html.replace(new RegExp(`(${marks.join('|')})`, 'gi'), '<mark>$1</mark>') : html
}

// `{{ t('menu_docs') }}` and friends survive into the rendered text; the reader never sees the
// braces, so neither should a result.
// 그려진 글에 `{{ t('menu_docs') }}` 같은 것이 남는다 — 읽는 사람에게 안 보이는 것이니 결과에도
// 안 보여야 한다.
function localize(text: string): string {
  return text
    .replace(/\{\{\s*\$?t\(\s*'([^']+)'\s*\)\s*\}\}/g, (_, key: string) => t(key))
    .replace(/\{\{[^}]*\}\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const indexes = import.meta.glob<{ data: SearchDoc[] }>('../theme/search/*.data.ts')

onMounted(async () => {
  await nextTick()
  inputRef.value?.focus()

  // Only this language's index is loaded — the other thirteen are never fetched.
  // 이 언어의 색인 하나만 싣는다 — 나머지 열셋은 받아 오지도 않는다.
  const load = indexes[`../theme/search/${localeIndex.value}.data.ts`]
  if (!load) return
  const { data } = await load()

  const search = new MiniSearch<SearchDoc>({
    fields: ['title', 'text'],
    storeFields: ['title', 'text'],
    // CJK and Devanagari do not put spaces between words, so the default splitter would hand the
    // engine one enormous token. Splitting on characters as well keeps those languages findable.
    // 한중일·데바나가리는 낱말을 띄지 않아 기본 쪼개기로는 통짜 토큰 하나가 된다. 글자로도 쪼개야
    // 그 언어들이 찾아진다.
    tokenize: (text) => text.split(/[\s\-_/.,()[\]{}<>:;"'`]+/u).filter(Boolean),
  })
  search.addAll(data)
  engine = search
  run()
})

function onInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value
  run()
}

function run(): void {
  sel.value = 0
  if (!query.value.trim() || !engine) {
    hits.value = []
    return
  }
  const prefix = `/${localeIndex.value}/`
  const terms = query.value.split(/\s+/).filter(Boolean)
  hits.value = engine
    .search(query.value, { prefix: true, fuzzy: (term) => (term.length > 3 ? 0.2 : 0), combineWith: 'AND' })
    .filter((hit) => String(hit.id).startsWith(prefix))
    .slice(0, MAX_SHOWN)
    .map((hit) => ({
      id: String(hit.id),
      title: localize(hit['title'] as string),
      group: groupOf(String(hit.id)),
      snippet: snippetOf(localize(hit['text'] as string), terms),
    }))
}

const shown = computed(() => hits.value)

function clear(): void {
  query.value = ''
  hits.value = []
  inputRef.value?.focus()
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (!shown.value.length) return
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    sel.value = (sel.value + step + shown.value.length) % shown.value.length
    return
  }
  if (event.key === 'Enter') {
    const item = shown.value[sel.value]
    if (!item) return
    event.preventDefault()
    emit('close')
    void router.go(item.id)
  }
}

// Nothing here reads the page's language beyond the index it picks, but the input needs it: an
// Arabic reader types right to left.
// 여기서 언어를 보는 곳은 색인 고르기뿐이지만 입력 칸은 다르다 — 아랍어를 쓰는 사람은 오른쪽에서
// 왼쪽으로 친다.
defineExpose({ lang })
</script>

<style scoped>
.search-scrim {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  padding: 4.5rem 1rem 1rem;
  /* 막도 함께 짙게 — 판이 또렷해진 만큼 뒤가 옅어야 눈이 판으로 간다. */
  background: rgb(0 0 0 / 55%);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}

/* Nearly opaque, on purpose. This panel is a *reading* surface — twenty snippets of dense text —
   and at the shared 72% the page behind it (chips, toolbar icons) read straight through the
   sentences. Worse, the box cannot blur its own backdrop: the scrim above it already blurs, and a
   blurring layer is a backdrop root, so everything inside it has nothing left to sample. Opacity is
   what is left, and it is the right answer here anyway — a search panel is not decoration. */
/* 일부러 거의 불투명하다. 이 판은 **읽는 자리**다(빽빽한 글 스무 토막) — 공용값 72% 에서는 뒤의
   칩과 툴바 아이콘이 문장 사이로 그대로 읽혀 글이 안 잡혔다. 게다가 이 상자는 제 뒤를 못 흐린다:
   위의 막이 이미 흐리고 있어서 그 속의 것들은 볼 것이 남지 않는다(backdrop root). 남는 손은
   불투명도이고, 여기서는 그것이 맞는 답이기도 하다 — 검색 판은 장식이 아니다. */
.search-box {
  width: min(40rem, 100%);
  /* `max-height` 가 아니라 `height` 다 — 결과가 없거나 한둘일 때 상자가 그만큼 쪼그라들면,
     칠해진 바탕이 글자 몇 줄에 딱 붙어 판이 찌그러져 보인다. 키를 고정해 두면 결과가 몇이든
     같은 상자이고, 안의 목록만 늘고 준다. */
  /* Fixed height, not a cap: a box that shrinks to two results looks broken. The panel keeps its
     size and only the list inside grows and shrinks. */
  height: min(34rem, calc(100vh - 6rem));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: color-mix(in srgb, var(--g-bg) 96%, transparent);
}

.search-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--g-border);
}

.head-icon {
  font-size: 1.15rem !important;
  opacity: 0.65;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 1rem;
  outline: none;
}

.search-results {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0.35rem;
}

.search-results a {
  display: block;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
}

.search-results a.sel {
  background: color-mix(in srgb, var(--g-accent) 14%, transparent);
}

.row-head {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.row-head strong {
  font-weight: 600;
}

.cat {
  margin-inline-start: auto;
  font-size: 0.72rem;
  color: var(--g-muted);
  white-space: nowrap;
}

.snippet {
  margin-top: 0.15rem;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--g-muted);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.snippet :deep(mark) {
  background: color-mix(in srgb, var(--g-accent) 30%, transparent);
  color: inherit;
  border-radius: 3px;
}

/* 남은 자리를 다 먹고 그 한가운데 선다 — 상자가 제 키를 지키므로 이 자리도 그만큼 넓다. */
/* Fills what is left and centers in it — the box holds its height, so this space is the rest of it */
.search-empty {
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  text-align: center;
  color: var(--g-muted);
}

.search-foot {
  display: flex;
  gap: 1rem;
  padding: 0.45rem 0.9rem;
  border-top: 1px solid var(--g-border);
  font-size: 0.72rem;
  color: var(--g-muted);
}

.search-foot kbd {
  display: inline-block;
  min-width: 1.1rem;
  margin-inline-end: 0.15rem;
  padding: 0 0.25rem;
  border: 1px solid var(--g-border);
  border-radius: 4px;
  text-align: center;
  font-family: inherit;
}

/* 좁은 화면에서는 키 안내를 접는다 — 폰에는 그 키가 없다 */
/* The key hints fold on a narrow screen: a phone has none of those keys */
@media (max-width: 34rem) {
  .search-foot {
    display: none;
  }
}
</style>
