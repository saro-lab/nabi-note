---
title: Zitat
---

# Zitat

## Beschreibung

`quoteWing` (Name `quote`) übernimmt den Zitatblock (`<blockquote>`). Er hat `place: 'container'`
und `holds: 'blocks'`, sodass er neben einfachen Absätzen auch andere Blockelemente wie eine
Tabelle oder ein Bild aufnehmen kann.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["Zitattext"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Klicken Sie die Werkzeugleisten-Schaltfläche, und die Blöcke der Auswahl werden in ein Zitat
gehüllt. Ist die Auswahl bereits ein Zitat, hebt dieselbe Schaltfläche es wieder auf.

Tippen Sie am Anfang eines Absatzes `>` gefolgt von einem Leerzeichen, wird er automatisch zum
Zitat.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
