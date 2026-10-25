---
title: Подчёркивание
description: Подчеркните выбранный текст.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Подчёркивание

Подчёркивает выбранный текст. Он может выглядеть как ссылка, но это только форматирование текста, без адреса и действия перехода.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
