---
title: Pedice
description: Abbassa il testo selezionato sotto la baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Pedice

Mostra il testo selezionato più piccolo sotto la linea di base. È adatto alle notazioni che richiedono pedici, come la formula chimica `H₂O`. Questo formato non aggiunge il calcolo delle formule: usalo per preservare la notazione stessa.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
