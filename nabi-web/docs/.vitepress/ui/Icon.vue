<!-- One inline-SVG icon set for the chrome. Not an icon font: the font arrives late and the
     literal ligature word ("search", "dark_mode") flashes in its place first, and the row jumps
     when the glyph finally swaps in. An SVG is in the HTML from the first paint. -->
<!-- 크롬이 쓰는 아이콘 한 벌 — **글꼴이 아니라 인라인 SVG** 다. 아이콘 글꼴은 늦게 오고, 그동안
     리거처 낱말("search"·"dark_mode")이 그 자리에 글자로 보였다가 그림으로 바뀐다. 바뀌는 순간
     폭이 달라져 줄이 튄다(주인 신고 2026-08-19). SVG 는 첫 그림부터 문서 안에 있다.

     크기는 `1em` 이다 — 부르던 자리의 `text-[1.05rem]` 같은 글자 크기 클래스가 그대로 듣는다. -->
<template>
  <svg
    class="ui-icon"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    :stroke-width="weight"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="PATHS[name]"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ name: keyof typeof PATHS; weight?: number }>(), {
  weight: 1.4,
})
const { name, weight } = props

// 16×16 한 틀 — 패키지 툴바 아이콘과 같은 결(획 색은 currentColor, 둥근 끝)이다.
const PATHS = {
  menu: '<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>',
  search: '<circle cx="7" cy="7" r="4.25"/><path d="m10.2 10.2 3.05 3.05"/>',
  close: '<path d="m4 4 8 8M12 4l-8 8"/>',
  backspace:
    '<path d="M5.75 3.25h6.6a.9.9 0 0 1 .9.9v7.7a.9.9 0 0 1-.9.9h-6.6L2.1 8Z"/>' +
    '<path d="M10.6 6.3 7.35 9.55M7.35 6.3l3.25 3.25"/>',
  language:
    '<circle cx="8" cy="8" r="5.75"/><path d="M2.4 6.25h11.2M2.4 9.75h11.2"/>' +
    '<path d="M8 2.25c1.6 1.6 2.45 3.5 2.45 5.75S9.6 12.15 8 13.75C6.4 12.15 5.55 10.25 5.55 8S6.4 3.85 8 2.25Z"/>',
  dark_mode: '<path d="M13.1 9.65A5.65 5.65 0 0 1 6.35 2.9a5.8 5.8 0 1 0 6.75 6.75Z"/>',
  light_mode:
    '<circle cx="8" cy="8" r="2.9"/>' +
    '<path d="M8 1.4v1.5M8 13.1v1.5M1.4 8h1.5M13.1 8h1.5M3.35 3.35 4.4 4.4M11.6 11.6l1.05 1.05M12.65 3.35 11.6 4.4M4.4 11.6l-1.05 1.05"/>',
  open_in_new:
    '<path d="M9.6 2.75h3.65V6.4M13.25 2.75 7.6 8.4"/>' +
    '<path d="M12.05 9.6v3.05a.6.6 0 0 1-.6.6H3.35a.6.6 0 0 1-.6-.6V4.55a.6.6 0 0 1 .6-.6H6.4"/>',
  expand_more: '<path d="m4 6.4 4 4 4-4"/>',
  expand_less: '<path d="m4 9.6 4-4 4 4"/>',
} as const
</script>

<style scoped>
.ui-icon {
  inline-size: 1em;
  block-size: 1em;
  flex: none;
}
</style>
