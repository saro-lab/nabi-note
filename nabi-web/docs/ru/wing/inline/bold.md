---
title: Жирный
description: Сделайте выбранный текст жирным.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Жирный

Делает выбранный текст жирным. Повторное применение к тому же диапазону удаляет форматирование. Метка остаётся с текстом в сохранённых документах.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
