---
title: Colore del testo
description: Applica al testo selezionato un nome di colore consentito.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Colore del testo

Applica al testo selezionato un nome di colore consentito. Il valore salvato non è una stringa colore CSS: è un nome consentito, e il colore reale è definito dalla variabile CSS `--nabi-tc-<name>`. Questo permette allo stesso documento di restare leggibile nei temi chiari e scuri.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Se `values` viene omesso, la palette predefinita è `green`, `coral`, `violet`, `amber` e `blue`. Se riduci la lista, gli altri colori vengono rifiutati dai comandi e durante il caricamento dei documenti.

## Stili CSS

Il documento salva solo nomi di colore. Imposta i colori reali dell’editor e della vista pubblicata con variabili CSS.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Controlla il contrasto insieme al colore di sfondo. In un tema scuro, lo stesso nome di colore può ricevere un valore diverso.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
