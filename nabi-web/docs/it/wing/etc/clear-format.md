---
title: Cancella formattazione
description: Rimuove dall'intervallo selezionato la formattazione del testo e dei paragrafi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Cancella formattazione

Rimuove in una volta sola la formattazione dall'intervallo selezionato. Sono inclusi i contrassegni predefiniti registrati, come grassetto, colore e carattere, e gli attributi del paragrafo, come titolo, allineamento e capolettera. Premere rapidamente Esc due volte esegue la stessa azione.

Non trasforma in testo semplice le strutture del documento, come elenchi, tabelle, citazioni o immagini. L'allineamento esterno di immagini e video e i link di allegati creati dai caricamenti restano invariati.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Anche i wing di formattazione che vuoi cancellare devono essere selezionati, altrimenti la loro formattazione non potrà essere rimossa.
