---
title: Sobrescrito
description: Eleva o texto selecionado acima da linha de base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Sobrescrito

Mostra o texto selecionado em tamanho menor acima da linha de base. Pode ser usado para expoentes ou chamadas de notas de rodapé e só se aplica ao trecho selecionado.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
