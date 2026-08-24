---
title: Klappbox
---

# Klappbox

## Beschreibung

`detailsWing` (Name `details`, Kürzel `D`) besitzt die Klappbox (`<details>` + `<summary>`). Die
Zusammenfassungszeile kommt über das `parts`-Attribut mit, muss also nicht separat registriert werden.

```ts
parts: { summary: { holds: 'inline' } }
```

Ein Druck auf die Schaltfläche hüllt die vom Caret erfassten Blöcke in eine neue Klappbox, und eine
leere Zusammenfassungszeile steht ganz vorn. Drücken Sie in der Zusammenfassungszeile Enter, gelangen
Sie in den Inhalt hinab (ein Zeilenumbruch innerhalb der Zusammenfassungszeile spaltet sie nie).

**Der Bildschirm zeichnet genau die Gestalt, die tatsächlich gespeichert ist.** Ein zugeklappt
gespeicherter Block (`open` nicht gesetzt) lädt auch im Editor zugeklappt, und ein Klick auf das
Pfeilsymbol links klappt ihn jederzeit auf oder zu (dieser Klick ändert sofort das `o`-Attribut des
Nabi-Baums). Stand der Caret beim Zuklappen im Inneren des Blocks, wandert er sicher nach außen.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
