---
title: Durchgestrichen
---

# Durchgestrichen

## Beschreibung

`strikeWing` ist der Besitzer (claim) von `<s>`. Verwenden Sie ihn für einen Wert, der gestrichen
wurde, aber es wert ist, stehen zu bleiben.

- Auf dem Weg hinein akzeptiert er alle drei — `<s>`, `<strike>` und `<del>`; auf dem Weg hinaus ist
  es immer `<s>`. Kein einziges Attribut überlebt — nicht einmal der Zeitstempel auf
  `<del datetime="…">`.
- Das Hinweismodus-Kürzel ist `S`. **Es gibt keinen Beschleuniger** — anders als Fett, Kursiv und
  Unterstrichen in derselben Gruppe `emphasis` ist keine `Strg`/`⌘`-Kombination daran gebunden.
- Ihn mit ausgewähltem Text zu drücken ist ein Umschalter.
- Bleibt der Flügel unregistriert, wird `<s>` seine Hülle abgestreift und fällt zu reinem Text herab.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
