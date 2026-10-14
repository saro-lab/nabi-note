---
title: Titolo
description: Trasforma un paragrafo in titolo e scegli il livello.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Titolo

Trasforma un paragrafo in un titolo e scegline il livello. Attiva il titolo dalla barra degli strumenti e scegli da H1 a H6, oppure, in un paragrafo vuoto, digita da `#` a `######` seguito da Spazio.

Un titolo non è un tipo di blocco separato, ma un attributo salvato nel paragrafo. Selezionando di nuovo il titolo, torna a essere un paragrafo normale: puoi quindi cambiare solo il livello mantenendo intatta la struttura del testo.

Nelle celle normali puoi trasformare i paragrafi interni in titoli. I titoli non si applicano alle celle di intestazione e la conversione in intestazione rimuove anche la formattazione dei titoli esistente. Se selezioni più paragrafi, la barra mostra un solo valore attivo soltanto se hanno tutti lo stesso livello di titolo.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
