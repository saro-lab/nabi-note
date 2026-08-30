---
title: Подчёркивание
description: Подчеркните выбранный текст.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Подчёркивание

Подчёркивает выбранный текст. Повторное применение к тому же диапазону удаляет форматирование, а метка сохраняется в сохранённых документах.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
