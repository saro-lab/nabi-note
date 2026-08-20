---
title: Kursiv
---

# Kursiv

## Beschreibung

`italicWing` ist der Eigentümer (claim) von `<i>`. Es dient Textstellen, die eine
andere Faser haben — fremde Wörter oder Zitate.

- Beim Einlesen werden `<i>` und `<em>` gleichermaßen anerkannt, beim Hinausgehen
  fließt alles in ein einziges `<i>` zusammen. Kein einziges Attribut überlebt.
- Die Tastenkombination im Hinweismodus (zweimal Shift hintereinander) ist `I` —
  sie wird über die physische Taste (`KeyI`) gefasst und greift damit auch auf
  einer koreanischen Tastaturbelegung.
Der Beschleuniger ist `Strg`/`⌘`+`I` (`mod+i`).
- Wird die Taste bei ausgewähltem Text gedrückt, ist es ein Umschalter.
- Ohne Registrierung wird `<i>` entkleidet und fällt zu reinem Text herab.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
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
