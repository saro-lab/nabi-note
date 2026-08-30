---
title: Tabella
description: Crea righe e colonne, modifica le celle e supporta l'ordinamento delle colonne.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabella

Scegli righe e colonne dalla barra degli strumenti per creare una tabella. All'interno di una cella il contenuto prosegue con interruzioni di riga anziché con più paragrafi; Tab e Maiusc+Tab spostano alla cella successiva o precedente.

L'aggiunta e l'eliminazione di righe o colonne, l'unione di celle e l'attivazione delle celle di intestazione operano attorno alle celle selezionate. Per ordinare le colonne nella vista pubblicata dopo aver salvato una tabella come ordinabile, collega `attachViewer()` da `nabi-note/viewer`. Le tabelle con celle unite non vengono ordinate.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## Stili CSS

Personalizza la tabella con `.nabi-content table` e le celle con `.nabi-content :is(th, td)`. Non modificare la struttura delle celle né il pulsante di ordinamento inserito dal viewer.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Se il viewer è collegato, conserva il pulsante `.nabi-sort`. Se sovrascrivi forzatamente `position` o il padding destro della cella, il pulsante di ordinamento può sovrapporsi.
