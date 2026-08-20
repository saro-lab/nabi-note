<!-- `currentColor` only, so it takes the text color wherever it sits -->
<!-- 색은 `currentColor` 하나라 놓인 자리의 글자색을 따라간다 -->
<!-- Favicon, app icon and OG need baked colors and are rendered separately — edit the original, then re-render -->
<!-- 파비콘·앱 아이콘·OG 는 색을 박아야 해서 따로 뽑는다 — 고칠 때는 원본을 고치고 다시 뽑는다 -->
<template>
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" :width="size" :height="size">
    <g fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" transform="rotate(-8 16 16)">
    <path d="M14.1 13.2 7.4 16.2 6.3 22.8 10.8 27.4 14.1 22.8z" opacity="0.78"/>
    <path d="M17.9 13.2 24.6 16.2 25.7 22.8 21.2 27.4 17.9 22.8z" opacity="0.4"/>
    <path d="M14.1 6.8 3 1.4 1.9 7.8 6.6 13.2 14.1 17.4z" opacity="1"/>
    <path d="M17.9 6.8 29 1.4 30.1 7.8 25.4 13.2 17.9 17.4z" opacity="0.55"/>
  </g>
  </svg>
</template>

<script setup lang="ts">
// A bare number lands in the SVG as px and then stands still while the text around it grows.
// Sizes are given in `em` so the mark rides the font-size of wherever it sits
// 숫자만 주면 SVG 에 px 로 박혀, 곁의 글자가 커져도 혼자 가만히 있는다.
// 크기를 `em` 으로 주어 마크가 놓인 자리의 글자 크기를 따라가게 한다
withDefaults(defineProps<{ size?: number | string }>(), { size: '1.375em' })
</script>
