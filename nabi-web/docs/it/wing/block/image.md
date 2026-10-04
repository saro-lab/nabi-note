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

## Collegare un selettore di immagini

Usa `panels.img` in `mountToolbar()` per sostituire il campo URL predefinito del pulsante immagine con il selettore di immagini del tuo servizio. Le chiavi sono i nomi degli slot della barra degli strumenti; gli strumenti omessi mantengono le finestre predefinite.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: ({ root, signal, run }) =>
      mountMyImagePicker(root, {
        signal,
        onSelect: (url: string) => run('insertImage', { src: url }),
      }),
  },
})
```

`mountMyImagePicker` è una funzione da implementare nel tuo servizio. Crea l’interfaccia in modo sincrono nel `root` fornito e restituisce una funzione di pulizia. Collega `signal` alle attività asincrone, come il caricamento di un elenco di immagini o l’upload, e passa l’URL dell’immagine scelta a `onSelect`. Questa API non trasferisce file; restano valide le regole esistenti per gli URL delle immagini.

La chiusura del pannello o lo smontaggio della barra degli strumenti interrompe `signal` e richiama la funzione di pulizia. `run()` chiude il pannello e applica un comando una sola volta alla selezione acquisita all’apertura. Se il pannello è già chiuso o il contenuto del documento è cambiato dall’apertura, restituisce `false` senza eseguire il comando.

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
