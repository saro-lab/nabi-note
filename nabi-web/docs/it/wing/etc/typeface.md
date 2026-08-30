---
title: Carattere
description: Applica una famiglia di caratteri al testo selezionato o a un paragrafo.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Carattere

Applica una famiglia di caratteri al testo selezionato. Se è selezionato un intervallo, cambia solo quell'intervallo; se è presente solo il cursore, si applica al testo del paragrafo corrente. I file dei caratteri effettivi e i valori di `font-family` sono definiti dal CSS del servizio.

Le famiglie predefinite sono `sans`, `serif`, `mono` e `cursive`. Soprattutto nei servizi che includono il coreano o altri contenuti multilingue, è meglio decidere esplicitamente quali caratteri debba usare ciascuna famiglia.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Se `values` viene omesso, vengono usate tutte le famiglie predefinite. Nei documenti sono ammessi solo i valori inclusi in `values`.

## Stili CSS

Il documento salva solo il nome della famiglia e il CSS sceglie i file dei caratteri. Modifica le variabili sullo stesso contenitore sia per l'editor sia per la vista pubblicata.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Se usi caratteri web, carica prima quei file. `cursive` spesso non offre una buona copertura per molte lingue, quindi è meglio fornirlo solo dopo aver scelto il carattere effettivo che il tuo servizio utilizzerà.
