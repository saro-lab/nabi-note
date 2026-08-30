---
layout: home
title: NABI NOTE
description: Un editor WYSIWYG con un modelo de documento persistente.
---

<script setup>
import EditorDemo from '../.vitepress/ui/EditorDemo.vue'
import { mainHtml, toolbarHtml, viewToolsHtml } from '../.vitepress/trees/es.ssr.ts'
</script>

<EditorDemo
  fold-wings
  :ssr-html="mainHtml"
  :toolbar-html="toolbarHtml"
  :view-tools-html="viewToolsHtml"
/>
