---
title: Unterstrichen
---

# Unterstrichen

## Beschreibung

`underlineWing` ist der Eigentümer (claim) von `<u>`.

- Erkennt `<u>` bei der Eingabe und gibt bei der Ausgabe stets Standard-`<u>` zurück.
- Unterstützt den Hinweismodus (Shift zweimal drücken, dann `U`) sowie den Beschleuniger
  (`Strg`/`⌘`+`U`).
- Bei ausgewähltem Text wirkt der Aufruf als Umschalter.
- Unterstreichung und Link (`<a>`) können auf dem Bildschirm ähnlich aussehen, sind aber
  unabhängige Flügel — derselbe Text kann Unterstreichung und Link gleichzeitig tragen.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
