---
title: Dettagli
description: Raggruppa un riepilogo e un corpo, e conserva se inizia aperto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Dettagli

Raggruppa un breve riepilogo e il corpo in un unico blocco. Quando lo crei dalla barra degli strumenti, inserisci prima il riepilogo e poi continua a scrivere il contenuto sotto.

Lo stato aperto impostato con il triangolo viene salvato nel documento e diventa lo stato iniziale della vista pubblicata. Durante la modifica il corpo resta aperto per poterlo cambiare, ma il valore dello stato salvato viene mantenuto.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Stili CSS

Personalizza il blocco con `.nabi-content details` e il titolo con `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

L'attributo `open` è lo stato iniziale aperto salvato dall'autore. Il CSS può applicare stili a questo stato, ma è meglio non forzare lo stato stesso.
