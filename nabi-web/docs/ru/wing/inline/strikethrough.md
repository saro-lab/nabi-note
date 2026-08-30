---
title: Зачёркивание
description: Зачеркните выбранный текст.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Зачёркивание

Зачёркивает выбранный текст. Повторное применение к тому же диапазону удаляет форматирование, а метка сохраняется в сохранённых документах.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
