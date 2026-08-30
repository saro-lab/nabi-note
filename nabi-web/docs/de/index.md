---
layout: home
title: NABI NOTE
description: Ein WYSIWYG-Editor mit einem robusten Dokumentmodell.
---

<script setup>
import EditorDemo from '../.vitepress/ui/EditorDemo.vue'
import { mainHtml, toolbarHtml, viewToolsHtml } from '../.vitepress/trees/de.ssr.ts'
</script>

<EditorDemo
  fold-wings
  :ssr-html="mainHtml"
  :toolbar-html="toolbarHtml"
  :view-tools-html="viewToolsHtml"
/>
