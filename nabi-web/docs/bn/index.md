---
layout: home
title: NABI NOTE
description: দীর্ঘস্থায়ী ডকুমেন্ট মডেলসহ একটি WYSIWYG এডিটর।
---

<script setup>
import EditorDemo from '../.vitepress/ui/EditorDemo.vue'
import { mainHtml, toolbarHtml, viewToolsHtml } from '../.vitepress/trees/bn.ssr.ts'
</script>

<EditorDemo
  fold-wings
  :ssr-html="mainHtml"
  :toolbar-html="toolbarHtml"
  :view-tools-html="viewToolsHtml"
/>
