---
title: Dimensione del carattere
description: Modifica la dimensione del testo entro i passaggi consentiti.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Dimensione del carattere

Imposta il testo selezionato su un passaggio di dimensione. Se è selezionato un intervallo, il passaggio si applica a quell'intervallo; se è presente solo il cursore, cambia la dimensione del testo del paragrafo corrente. I dati salvati mantengono solo i passaggi consentiti, non valori arbitrari come `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Se `values` viene omesso, vengono usati i passaggi `xs`, `sm`, `lg` e `xl`. Se restringi l'elenco, gli altri passaggi già presenti nei documenti precedenti vengono rimossi al caricamento.

## Stili CSS

Puoi modificare le dimensioni tramite selettori dei passaggi salvati, come `.nabi-content [data-nabi-size="xs"]`. Non inventare passaggi arbitrari che non sono nel documento; regola il CSS solo entro le `values` registrate.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Mantenere coerente la differenza di dimensione fra i passaggi conserva, nella pubblicazione, il significato scelto dall'autore nell'editor.
