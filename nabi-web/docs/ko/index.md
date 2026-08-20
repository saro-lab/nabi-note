---
layout: home
---

<div class="g-frame">

<div class="pb-12">
  <EditorDemo fold-wings :ssr-html="mainHtml" :toolbar-html="toolbarHtml" :view-tools-html="viewToolsHtml" />
</div>

</div>

<script setup lang="ts">
import EditorDemo from '../.vitepress/ui/EditorDemo.vue'
// 미리 그려 둔 홈 예문 — 서버가 이것을 그대로 내보내고 브라우저가 이어받는다 (095 ⓐ)
import { mainHtml, toolbarHtml, viewToolsHtml } from '../.vitepress/trees/ko.ssr.ts'
</script>
