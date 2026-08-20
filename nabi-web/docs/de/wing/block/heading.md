---
title: Überschrift
---

# Überschrift

## Beschreibung

**Ein einziger** `headingWing` (id `h`) trägt alle sechs Stufen. Eine Überschrift ist kein eigener
Knoten, sondern **ein Attribut des Absatzes** — der gespeicherte Wert ist `{"w":"p","a":{"h":2}}`,
und auf dem Weg hinaus wird daraus `<h2>`.

Weil der Absatz selbst zur Überschrift wird, greifen andere Absatzattribute wie Ausrichtung und
Initiale gleichzeitig mit (`<h2 data-nabi-align="c">`).

## Eine Schaltfläche in der Werkzeugleiste, die Stufe in der Kontextzeile

**In der Werkzeugleiste gibt es nur eine einzige Schaltfläche, `H`.** Drücken Sie sie in einem
Absatz, entsteht Überschrift 1; steht der Caret in einer Überschrift, erscheinen in der Kontextzeile
die Felder `Überschrift` und `H1`–`H6` — welche Stufe gerade gilt, ist am gedrückten Feld zu sehen,
und ein Druck auf ein anderes Feld wechselt zu dieser Stufe. Drücken Sie `Überschrift`, kehren Sie
zum Absatz zurück.

Tippen Sie in einer leeren Zeile so viele `#`, wie die Stufe zählt (`##` für Stufe 2), und drücken
Leertaste, entsteht automatisch eine Überschrift dieser Stufe — die getippten `#` und das Leerzeichen
selbst werden gelöscht.

## Anwendungsbeispiel

Die Stufenauswahl zeichnet `mountContextToolbar`.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Sie können sie auch direkt über einen Command setzen.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // zu Überschrift Stufe 2
nabi.applyCommand('setHeading', { value: 2 })  // dieselbe Stufe erneut — zurück zum Absatz
```

Wenden Sie es auf eine Auswahl mehrerer Absätze an, greift es auf **jeden Absatz**, den die Auswahl
berührt. Klötze, die den Platz eines Absatzes einnehmen, wie Tabelle und Liste, werden übersprungen —
eine Überschrift ist ein Attribut eines Textabsatzes.

## Demo

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
