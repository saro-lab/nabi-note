---
title: Курсив
description: Сделайте выбранный текст курсивным.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Курсив

Делает выбранный текст курсивным. Повторное применение к тому же диапазону удаляет форматирование, а метка сохраняется в сохранённых документах.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
