---
title: Fett
---

# Fett

## Beschreibung

`boldWing` ist der Inline-Mark-Wing für Fettschrift (`<b>`). Wählen Sie Text aus und
drücken Sie **B** in der Werkzeugleiste, greifen Sie im Hinweismodus dazu (zweimal
Shift, dann `B`), oder nutzen Sie die Tastenkombination (`Strg`/`⌘`+`B`).

- Beim Einlesen werden `<b>` und `<strong>` gleichermaßen erkannt; bei der Ausgabe
  steht immer nur das Standard-Tag `<b>`.
- Mit ausgewähltem Text ist es ein Umschalter — ist die Auswahl bereits fett, wird
  es entfernt, sonst angewendet.
- Ohne Auswahl, nur mit dem Cursor, reserviert die Tastenkombination die
  Fettschrift für den nächsten eingegebenen Text.
- Ist der Wing nicht registriert, wird das `<b>`-Tag automatisch entfernt und nur
  der reine Text bleibt erhalten.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
