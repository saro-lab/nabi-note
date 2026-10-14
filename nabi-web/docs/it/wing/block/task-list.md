---
title: Elenco attività
description: Un elenco che salva lo stato di completamento nel documento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Elenco attività

È un elenco che tiene traccia dello stato di completamento. In un paragrafo vuoto, digita `[ ]` oppure `[x]` seguito da Spazio, oppure crealo dalla barra degli strumenti; fai clic sulla casella di controllo per cambiare stato.

Lo stato di completamento viene salvato nel documento come proprietà dell'elemento. Quando dividi un elemento, lo stato segue quello che conserva il testo, non l'elemento vuoto precedente: così, anche se dividi in due un'attività completata, il suo stato non si inverte.

Enter divide un elemento e Shift+Enter inserisce solo un'interruzione di riga al suo interno. Tab e Shift+Tab aumentano e riducono il rientro. Nelle celle valgono le stesse regole e viene salvato anche lo stato della casella di spunta.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
