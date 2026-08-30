---
title: Evidenziazione
description: Applica un colore di evidenziazione consentito dietro il testo selezionato.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Evidenziazione

Applica un colore di evidenziazione consentito dietro il testo selezionato. I dati salvati conservano solo nomi di colore consentiti, non valori CSS arbitrari, così i dati del documento e lo stile visivo restano separati.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Se `values` viene omesso, la palette predefinita è `yellow`, `green`, `cyan`, `pink`, `purple` e `orange`. Se restringi la lista, i colori non registrati non vengono mantenuti neppure quando si carica un documento esistente.

## Stili CSS

Il documento salva solo nomi di colore. Cambia i colori dell’editor e della vista pubblicata tramite variabili CSS.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Modificare più colori insieme permette di mantenere i nomi dei colori nel documento adattando solo il tono del prodotto.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
