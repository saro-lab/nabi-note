---
title: Citazione
description: Raggruppa testo citato o separa il contesto in più paragrafi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Citazione

Raggruppa il testo citato o separa il contesto in più paragrafi. In un paragrafo vuoto digita `>` seguito da Spazio, oppure trasforma i paragrafi selezionati in una citazione dalla barra degli strumenti.

Una citazione può contenere normali paragrafi e blocchi come elenchi e immagini. Applicarla di nuovo allo stesso intervallo la scioglie e ripristina i paragrafi esterni.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Stili CSS

Personalizza le citazioni con `.nabi-content blockquote`, modificando bordi e spaziatura.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Conserva la struttura dei paragrafi dentro `blockquote` e modifica solo la presentazione, come spaziatura esterna, bordi e colore.
