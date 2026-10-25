---
title: Barrato
description: Barra il testo selezionato.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Barrato

Traccia una linea al centro del testo selezionato. Puoi usarla per mantenere visibili espressioni modificate o contenuti non più validi senza eliminarli. Applicarla di nuovo allo stesso intervallo rimuove il formato.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
