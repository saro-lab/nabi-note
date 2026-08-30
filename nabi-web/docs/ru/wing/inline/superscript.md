---
title: Верхний индекс
description: Поднимите выбранный текст над базовой линией.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Верхний индекс

Поднимает выбранный текст над базовой линией для степеней и ссылочных маркеров. Повторное применение удаляет форматирование.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
