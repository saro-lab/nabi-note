---
title: YouTube
description: Incorpora un video YouTube nel documento e regola la larghezza.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Accetta un URL di video YouTube o l'ID del video e lo trasforma in un blocco incorporato. Il documento conserva solo l'ID di 11 caratteri e la larghezza, non l'URL completo; un nuovo video parte centrato con larghezza del 70%.

La larghezza è scelta da passaggi fissi e l'allineamento è salvato nel paragrafo che avvolge il video. Nell'editor il primo clic seleziona il video; dopo la selezione, un altro clic può avviarlo. Per cambiare indirizzo, elimina il video e inseriscine uno nuovo.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## Stili CSS

Usa `.nabi-content iframe` per modificare bordo o angoli del video. Non cambiare la larghezza o l'allineamento salvati.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

Il pacchetto usa `aspect-ratio`, larghezza e margini di allineamento per mantenere corretta la dimensione del video; non sovrascriverli.
