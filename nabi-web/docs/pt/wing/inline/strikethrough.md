---
title: Tachado
description: Risca o texto selecionado.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tachado

Traça uma linha pelo meio do texto selecionado. Use para manter visíveis expressões alteradas ou conteúdo que não é mais válido, sem apagá-los. Aplicar novamente ao mesmo trecho remove o formato.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
