---
title: Separatore
description: Inserisci una linea orizzontale tra blocchi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Separatore

È una linea orizzontale che separa il flusso del documento. In un paragrafo vuoto, digita almeno tre trattini e premi Enter oppure inseriscila dalla barra degli strumenti.

Il separatore è un blocco autonomo senza testo, quindi non può contenere formattazioni come titoli o colori. Usalo solo per dividere i paragrafi che lo precedono e lo seguono.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
