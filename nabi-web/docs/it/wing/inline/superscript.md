---
title: Apice
description: Solleva il testo selezionato sopra la baseline.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Apice

Mostra il testo selezionato più piccolo sopra la linea di base. Può essere usato per esponenti o richiami di note a piè di pagina e si applica solo all’intervallo selezionato.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
