---
title: Tiefgestellt
---

# Tiefgestellt

## Beschreibung

`subscriptWing` ist ein Inline-Mark-Flügel, der die Formatierung als tiefgestellt (`<sub>`)
übernimmt. Nützlich für chemische Formeln, Fußnotenzahlen und Ähnliches.

- Erkennt beim Import das Tag `<sub>` und gibt beim Export dasselbe Tag wieder aus.
- Sitzt in der Werkzeugleisten-Gruppe `script`, direkt neben Hochgestellt.
- Bei ausgewähltem Text wirkt ein Druck auf die Taste als Umschalter.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
