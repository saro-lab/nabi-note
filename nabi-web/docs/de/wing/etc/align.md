---
title: Ausrichtung
---

# Ausrichtung

## Beschreibung

`alignWing` (id `align`) ist ein Absatzattribut-Flügel, der die Textausrichtung — links, mittig, rechts — für Absätze und Blockelemente verwaltet.

- Er setzt das Attribut `data-nabi-align` auf den Block (`<p data-nabi-align="center">`).
- **Er greift nicht nur auf Absätze, sondern auch auf Überschriften (`h1`–`h6`)** (`<h2 data-nabi-align="c">`).
- Nur ein Ausrichtungswert steht zur Zeit. Klicken Sie erneut auf eine bereits aktive Schaltfläche, fällt das Attribut ab, und die Standardausrichtung kehrt zurück.
- Teilen Sie einen Absatz mit Enter, behalten beide Hälften dieselbe Ausrichtung.
- **Dieser Flügel übernimmt auch die Ausrichtung von Blockobjekten** wie Bildern, Tabellen und YouTube-Einbettungen. Ein Blockobjekt sitzt in dem Wrapper-Absatz (`<div data-nabi-p>`), der es umgibt — die Ausrichtungsschaltflächen der Werkzeugleiste steuern also über diesen Wrapper, ob das Objekt links, rechts oder mittig sitzt.

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
