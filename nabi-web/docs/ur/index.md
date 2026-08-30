---
layout: home
title: NABI NOTE
description: ایک پائیدار دستاویزی ماڈل والا WYSIWYG ایڈیٹر۔
---

<script setup>
import EditorDemo from '../.vitepress/ui/EditorDemo.vue'
import { mainHtml, toolbarHtml, viewToolsHtml } from '../.vitepress/trees/ur.ssr.ts'
</script>

<EditorDemo
  fold-wings
  :ssr-html="mainHtml"
  :toolbar-html="toolbarHtml"
  :view-tools-html="viewToolsHtml"
/>
