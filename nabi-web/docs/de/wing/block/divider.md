---
title: Trennlinie
---

# Trennlinie

## Beschreibung

`dividerWing` (Name `hr`) verwaltet die horizontale Trennlinie (`<hr>`). Sie ist ein **`place: 'void'`**-Objekt ohne Platz für Text im Inneren; drücken Sie unmittelbar vor oder hinter der Trennlinie Rücktaste oder Entf, verschwindet der gesamte Trennlinien-Block.

Ein Klick auf die Schaltfläche fügt die Trennlinie **eingehüllt in einen eigenen Wrapper-Absatz (`<div data-nabi-p>`)** ein. Der Caret landet direkt hinter der Trennlinie.

Wo sie eingefügt wird, richtet sich nach dem Zustand des Absatzes, in dem der Caret gerade steht:

| Caret-Position | Einfügeverhalten |
|---|---|
| Absatz mit Text | Neue Trennlinie wird **hinter** diesem Absatz eingefügt |
| Leerer Absatz | Dieser leere Absatz wird **durch die Trennlinie ersetzt** (kein überflüssiger Leerraum) |

Wird ein leerer Absatz ersetzt, bleibt dessen Textausrichtung erhalten.

Tippen Sie in einer leeren Zeile drei oder mehr Bindestriche und drücken Sie Enter (`---` + Enter), wird daraus automatisch eine Trennlinie.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
