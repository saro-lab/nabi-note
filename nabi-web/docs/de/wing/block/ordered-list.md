---
title: Nummerierte Liste
---

# Nummerierte Liste

## Beschreibung

`orderedListWing` (Name `ol`, Kürzel `N`) besitzt `<ol>`. Der Eintrag kommt über `parts` mit, `oli`
wird also nicht separat registriert — ein Datensatz, kein Array.

```ts
parts: { oli: { holds: 'blocks' } }
```

Ein Druck auf die Schaltfläche hüllt den Block, in dem der Caret steht (oder die von der Auswahl
erfassten Blöcke), in eine nummerierte Liste; ein erneuter Druck löst sie. Drücken Sie eine andere
Listen-Schaltfläche, wechselt sie zu dieser Sorte.

Am Zeilenanfang eine Zahl und einen Punkt zu tippen und Leertaste zu drücken (`1. `) erzielt
dasselbe Ergebnis. **Jede Zahl wird als Beginn anerkannt, aber bis zu neun Stellen** (`1234567890. `
feuert nicht), und folgt dem Punkt noch etwas wie in `1.2 `, feuert es ebenfalls nicht. Die Zeile
muss nicht leer sein — gemessen wird nur der Zeilenanfang vor dem Caret, und es feuert nur auf der
ersten Zeile eines Absatzes.

- Ein- und Ausrücken mit `Tab`/`Shift+Tab`, eine Liste mit Enter auf einem leeren Eintrag zu
  beenden, und dass Rücktaste am Anfang eines Eintrags ihn mit dem vorigen verschmilzt — all das ist
  gleich wie bei der [Aufzählungsliste](./bullet-list).
- Die Nummer geht nicht in den gespeicherten Wert ein — sie zeichnet `<ol>`, fügen Sie also einen
  Eintrag ein oder löschen Sie einen, nummeriert der Browser von selbst neu durch.
- Auch die Verschachtelung ist echtes Markup und bleibt so im gespeicherten Wert stehen. Weil ein
  Eintrag Blöcke hält, trägt der Text eine Schicht Absatz, und eine verschachtelte Liste steht in
  einem Wrapper-Absatz.
- Attribute wie `start` und `type` überleben nicht. Deshalb zählt auch eine mit `start="5"`
  hereinkommende Liste wieder ab 1.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>