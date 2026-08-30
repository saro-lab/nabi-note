---
title: Immagine
description: Inserisci l'URL di un'immagine e regola larghezza e allineamento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Immagine

Inserisci l'URL di un'immagine e regolane larghezza e allineamento. Per impostazione predefinita sono ammessi solo `http:`, `https:` o percorsi dello stesso sito; una nuova immagine parte centrata con larghezza del 60%.

La larghezza viene salvata solo in passaggi fissi e l'allineamento nel paragrafo che racchiude l'immagine. Per usare anteprime `blob:` o `data:image/...`, abilita esplicitamente gli URL locali sia nell'wing immagine sia nella configurazione dell'editor. Gli URL di dati SVG non sono ammessi.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Questo wing inserisce un indirizzo nel documento, ma non carica file. Per inviare file a un server, collega il [wing di caricamento](/it/wing/etc/upload).

## Stili CSS

Personalizza le immagini con `.nabi-content img`. Mantieni la larghezza e l'allineamento salvati e modifica solo dettagli visivi, come bordi od ombre.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Mantieni le regole predefinite per `max-inline-size`, `block-size`, larghezza e allineamento. La dimensione dell'immagine è salvata nel documento, quindi imporre una larghezza CSS fissa può entrare in conflitto con quella scelta dall'autore.
