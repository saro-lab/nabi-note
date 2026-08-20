---
title: Fett
---

# Fett

## Beschreibung

`boldWing` ist der Eigentümer (claim) von `<b>`. Wählen Sie Text aus und drücken Sie
in der Werkzeugleiste **B** oder greifen Sie im Hinweismodus (zweimal Shift
hintereinander, dann `B`) zu — der Bereich wird fett.

- Beim Einlesen werden `<b>` und `<strong>` gleichermaßen anerkannt, beim
  Hinausgehen steht immer nur `<b>`. Kein einziges Attribut überlebt —
  `class`, `style` und `data-*` fallen weg, nur das Tag bleibt.
- Das Hinweismodus-Kürzel ist `B`, der Beschleuniger ist `Strg`/`⌘`+`B` (`mod+b`).
- Wird die Taste bei ausgewähltem Text gedrückt, ist es ein Umschalter
  (`toggleMark`) — ist bereits alles fett, wird es abgenommen, sonst gesetzt. Der
  Flügel deklariert kein eigenes Command: Seine Schaltfläche ist `action: { kind:
  'mark' }`, was direkt zum `toggleMark` des Kerns geht.
- Ohne Registrierung wird `<b>` entkleidet und fällt zu reinem Text herab (so
  ergeht es jedem nicht registrierten Tag — das ist die Regel in ganz nabi).

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
