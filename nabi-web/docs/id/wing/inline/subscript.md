---
title: Subskrip
description: Turunkan teks terpilih di bawah baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Subskrip

Menurunkan teks terpilih di bawah baseline untuk rumus kimia dan indeks. Menerapkannya lagi akan menghapus pemformatan.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
