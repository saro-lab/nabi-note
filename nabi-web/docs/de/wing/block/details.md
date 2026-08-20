---
title: Klappbox
---

# Klappbox

## Beschreibung

`detailsWing` (Name `details`, Kürzel `D`) besitzt die Klappbox (`<details>` + `<summary>`). Die
Zusammenfassungszeile kommt über `parts` mit, wird also nicht separat registriert — ein Datensatz,
kein Array.

```ts
parts: { summary: { holds: 'inline' } }
```

Ein Druck auf die Schaltfläche hüllt die vom Caret erfassten Blöcke in eine neue Klappbox, und eine
leere Zusammenfassungszeile steht ganz vorn. Drücken Sie in der Zusammenfassungszeile Enter, gelangen
Sie in den Inhalt hinab (die Zusammenfassungszeile selbst wird nicht gespalten).

**Der Editor zeichnet genau die Gestalt, die gespeichert wird.** Ein zugeklappt gespeicherter Kasten
ist auch im Editor zugeklappt, und ein Druck auf das Dreieck klappt ihn an Ort und Stelle auf und zu
— dieser Druck ändert genau den gespeicherten Wert (`o`). Stand der Caret beim Zuklappen im Inneren,
tritt er aus dem Kasten heraus.

::: tip Keine Kontextzeile
Früher gab es zwei Schaltflächen — **Aufgeklappt gespeichert** und **Zugeklappt gespeichert**. In
den Zeiten, als der Bildschirm immer aufgeklappt zeichnete, war das der einzige Weg zu sagen, in
welcher Form gespeichert wird. Jetzt zeichnet der Bildschirm genau den gespeicherten Wert, und das
Dreieck ändert ihn, sodass dies dasselbe zweimal gesagt hätte und entfernt wurde.
:::

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
