---
title: Sobrescrito
description: Eleva o texto selecionado acima da linha de base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Sobrescrito

Eleva o texto selecionado acima da linha de base, para expoentes e marcadores de referência. Aplicar novamente remove a formatação.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
