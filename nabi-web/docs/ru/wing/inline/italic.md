---
title: Курсив
description: Сделайте выбранный текст курсивным.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Курсив

Выделяет выбранный текст курсивом. Это удобно, чтобы слегка отличить названия произведений или иностранные слова от основного текста. Повторное нажатие на уже выделенном курсивом фрагменте снимает форматирование.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
