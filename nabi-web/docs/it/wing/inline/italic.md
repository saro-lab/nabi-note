---
title: Corsivo
description: Metti in corsivo il testo selezionato.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Corsivo

Mostra il testo selezionato in corsivo. È utile per distinguere leggermente dal corpo del testo i titoli di opere o le parole straniere. Premi di nuovo su un intervallo già in corsivo per rimuovere il formato.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
