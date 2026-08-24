---
title: Initiale
---

# Initiale

## Beschreibung

`dropCapWing` ist ein Absatzattribut-Wing, der den ersten Buchstaben eines Absatzes als große
Zierbuchstabe darstellt (`data-nabi-dropcap="1"`).

- Es funktioniert als einzelner Ein/Aus-Schalter.
- Die Größe des ersten Buchstabens ist über eine `::first-letter`-Regel im Kern-Stylesheet fest
  vorgegeben (`font-size: 5.9em; line-height: .83`).
- Teilen Sie den Absatz beim Tippen mit der Eingabetaste, wird das Initialen-Attribut nicht auf
  beide Hälften verdoppelt — es bleibt allein beim ursprünglichen ersten Buchstaben.

Um die Größe anzupassen, überschreiben Sie die folgende Regel:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
