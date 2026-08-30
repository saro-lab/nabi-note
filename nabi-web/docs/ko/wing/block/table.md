---
title: 표
description: 행과 열을 만들고 셀 편집과 열 정렬을 지원합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 표

툴바에서 행과 열을 골라 표를 만듭니다. 셀 안에서는 여러 문단 대신 줄바꿈으로 내용을 이어 쓰며, Tab과 Shift+Tab으로 다음·이전 셀로 이동합니다.

행과 열 추가·삭제, 셀 병합, 제목 셀 전환은 선택한 셀을 기준으로 동작합니다. 표를 정렬 가능하게 저장한 뒤 발행 화면에서 열 정렬을 쓰려면 `nabi-note/viewer`의 `attachViewer()`를 연결해야 합니다. 병합된 셀이 있는 표는 열 정렬 대상이 아닙니다.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS 스타일

표는 `.nabi-content table`, 셀은 `.nabi-content :is(th, td)`로 꾸밉니다. 셀의 구조와 viewer가 넣는 정렬 버튼은 바꾸지 마세요.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

viewer를 연결했다면 `.nabi-sort` 버튼은 남겨 두세요. 셀에 `position`이나 오른쪽 padding을
강제로 덮어쓰면 정렬 버튼과 겹칠 수 있습니다.
