---
title: Capolettera
description: Inizia il testo con una prima lettera grande.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Capolettera

Mostra la prima lettera di un paragrafo in dimensione maggiore e lascia che le righe successive le scorrano accanto. È una formattazione a livello di paragrafo, quindi non si applica soltanto a una parte della parola selezionata.

La vista pubblicata e quella di modifica mantengono la stessa forma. Durante la modifica, la prima lettera è racchiusa in un elemento reale affinché le posizioni del cursore e di eliminazione non slittino; quell'elemento non è incluso nel contenuto salvato del documento.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## Stili CSS

La vista pubblicata e quella di modifica usano selettori diversi per la prima lettera. La vista pubblicata usa `[data-nabi-dropcap="1"]::first-letter`, mentre quella di modifica usa l'elemento reale `[data-nabi-dropcap-letter]`. Quando cambi valori visibili come colore, carattere o dimensione, scrivi insieme entrambi i selettori affinché modifica e pubblicazione abbiano lo stesso aspetto.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Se modifichi dimensione e altezza della riga, applica gli stessi valori a entrambi i selettori.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

I capolettera calcolano il flusso delle righe attorno alla prima lettera; modificare un solo lato o rendere i valori troppo grandi può quindi rompere la forma WYSIWYG. Evita comunque di aggiungere una nuova regola `::first-letter` all'editor. Nell'editor applica stili solo all'esistente `[data-nabi-dropcap-letter]`.
