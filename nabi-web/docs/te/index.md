---
layout: home
title: NABI NOTE
description: దృఢమైన డాక్యుమెంట్ మోడల్ ఉన్న WYSIWYG ఎడిటర్.
---

<script setup>
import EditorDemo from '../.vitepress/ui/EditorDemo.vue'
import { mainHtml, toolbarHtml, viewToolsHtml } from '../.vitepress/trees/te.ssr.ts'
</script>

<EditorDemo
  fold-wings
  :ssr-html="mainHtml"
  :toolbar-html="toolbarHtml"
  :view-tools-html="viewToolsHtml"
/>
