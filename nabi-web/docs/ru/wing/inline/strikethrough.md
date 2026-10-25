---
title: Зачёркивание
description: Зачеркните выбранный текст.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Зачёркивание

Проводит линию через середину выбранного текста. Так можно оставить видимыми изменённые формулировки или устаревшие сведения, не удаляя их. Повторное применение к тому же фрагменту снимает форматирование.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
