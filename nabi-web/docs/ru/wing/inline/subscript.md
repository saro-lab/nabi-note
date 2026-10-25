---
title: Нижний индекс
description: Опустите выбранный текст ниже базовой линии.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Нижний индекс

Показывает выбранный текст уменьшенным ниже базовой линии. Подходит для записей с нижними индексами, например химической формулы `H₂O`. Это форматирование не добавляет вычисление формул, а сохраняет саму запись.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
