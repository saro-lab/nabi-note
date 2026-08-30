---
title: Elenco numerato
description: Crea un elenco numerato automaticamente.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Elenco numerato

Crea un elenco numerato per elementi il cui ordine è importante. In un paragrafo vuoto, digita un numero seguito da un punto, ad esempio `1.`, e premi Spazio, oppure trasforma i paragrafi selezionati dalla barra degli strumenti.

I numeri visualizzati sono calcolati in base alla posizione degli elementi, quindi proseguono automaticamente anche quando aggiungi o rientri elementi. Non è disponibile la funzione per salvare un numero iniziale digitato e iniziare il conteggio da un numero arbitrario.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
