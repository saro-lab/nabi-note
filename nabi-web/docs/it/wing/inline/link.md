---
title: Link
description: Collega indirizzi web sicuri e mostra gli allegati caricati.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Link

Seleziona del testo e associa un indirizzo. Se inserisci un indirizzo senza selezionare testo, l’indirizzo stesso viene inserito come testo del link. Anche digitare un indirizzo `http://` o `https://` e poi premere Space o Enter lo trasforma in link.

I link salvano solo `http:`, `https:` e percorsi dello stesso sito che iniziano con `.` o `/`. Gli indirizzi la cui origine non può essere identificata chiaramente, come `javascript:` o `//example.com`, vengono rifiutati. I link allegato creati dagli upload salvano anche informazioni sul file e non possono essere creati manualmente come link ordinari.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Stili CSS

Stilizza i link ordinari con `.nabi-content a` e i link allegato separatamente con `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Le parti `::before` e `::after` dei link allegato sono usate per mostrare icona ed estensione del file, quindi di solito è meglio non sostituire o rimuovere il loro `content`.
