---
title: Kursiv
---

# Kursiv

## Beschreibung

`italicWing` ist das Inline-Mark-Wing, das die Kursivformatierung (`<i>`) verarbeitet. Damit lässt sich der Ton von Text abheben — Betonung, ein Fremdwort und Ähnliches.

- Beim Einlesen werden sowohl `<i>` als auch `<em>` erkannt; bei der Ausgabe wird immer das Standard-Tag `<i>` erzeugt.
- Unterstützt den Hinweismodus (Shift zweimal, dann `I`) und die Tastenkombination `Strg`/`⌘`+`I`.
- Bei ausgewähltem Text wirkt es als Umschalter.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
