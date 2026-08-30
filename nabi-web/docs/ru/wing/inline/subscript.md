---
title: Нижний индекс
description: Опустите выбранный текст ниже базовой линии.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Нижний индекс

Опускает выбранный текст ниже базовой линии для химических формул и индексов. Повторное применение удаляет форматирование.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
