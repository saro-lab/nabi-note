---
title: Ausrichtung
---

# Ausrichtung

## Beschreibung

**Ein einziger** `alignWing` (id `align`) trägt alle drei — links, mittig und rechts. Er ist eine
Konstante, keine `align()`-Fabrik, und setzt eine Schaltfläche pro Wert auf die Werkzeugleiste. Was
er schreibt, ist das Absatzattribut `a`, das als `data-nabi-align` hinausgeht.

- Es ist ein **Absatzattribut**: Das Tag bleibt unangetastet, und nur das Attribut wird hinzugefügt,
  wie in `<p data-nabi-align="c">` — die Werte sind `l`, `c` und `r`.
- **Es greift auf Absätze und Überschriften.** `<h2 data-nabi-align="c">` funktioniert ebenfalls,
  weil eine Überschrift eine Textzeile wie jede andere ist — eine Überschrift selbst ist nur ein
  weiteres Attribut (`h`) auf demselben Absatz, sodass die beiden nebeneinanderstehen.
- Nur ein Wert steht zur Zeit. Drücken Sie „mittig" auf einem linksbündigen Absatz, fällt der Wert
  „links" ab, während „mittig" landet. Drücken Sie den bereits gesetzten Wert erneut, geht das
  Attribut vollständig ab, zurück zur Standardausrichtung.
- **Enter reicht die Ausrichtung an beide Hälften weiter.** Spalten Sie einen Absatz, kommen beide
  mit derselben Ausrichtung heraus — anders als die Überschrift (`h`), die aus der leer gebliebenen
  Hälfte fällt, und die Initiale (`dc`), die nur einer Seite folgt. Ausrichtung hat keine solche
  Ausnahme.
- Die drei sind **drei Schaltflächen an einem Flügel** (`buttons`) — sie können nicht getrennt an-
  und ausgeschaltet werden. Legen Sie den einzelnen `alignWing` in das Flügel-Array.
- **Es ist das eine Absatzattribut, das auf einem Wrapper-Absatz bestehen bleibt.** Jedes andere
  Absatzattribut versteckt seine Schaltfläche, wenn der Caret auf einem Absatz steht, der einen
  Klotz hält; Ausrichtung nicht, weil die Ausrichtung eines Klotzes vom Wrapper-Absatz getragen wird
  statt vom Klotz selbst. Ein zentriertes Bild *ist* ein Bild innerhalb eines zentrierten Absatzes.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
