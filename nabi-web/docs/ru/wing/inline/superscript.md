---
title: Верхний индекс
description: Поднимите выбранный текст над базовой линией.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Верхний индекс

Показывает выбранный текст уменьшенным выше базовой линии. Подходит для степеней и знаков сносок и применяется только к выбранному фрагменту.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
