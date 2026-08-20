---
title: Trennlinie
---

# Trennlinie

## Beschreibung

`dividerWing` (Name `hr`) besitzt ein einziges `<hr>`. **`place: 'void'`** — ein Klotz ohne
Inneres, der Caret hat also keinen Platz, um hineinzugelangen. Drücken Sie unmittelbar vor oder
hinter der Trennlinie Rücktaste oder Entf, verschwindet dieser eine Block als Ganzes, und eine
Bereichsauswahl führt zum selben Ergebnis.

Ein Druck auf die Schaltfläche stellt die Trennlinie **mit ihrem eigenen Wrapper-Absatz** auf. Es
entsteht dabei kein zusätzlicher leerer Absatz — der Caret setzt sich auf diesen Wrapper-Absatz,
direkt hinter die Trennlinie.

Wo sie landet, entscheidet sich daran, ob der Absatz, in dem der Caret stand, Text enthielt.

| Wo der Caret stand | Ergebnis |
|---|---|
| Absatz mit Text | steht **hinter** diesem Absatz |
| leerer Absatz | **übernimmt** diesen Absatz — keine leere Zeile bleibt zurück |

Übernimmt sie einen leeren Absatz, überlebt dessen Ausrichtung unverändert.

Schreiben Sie in einer leeren Zeile nur drei oder mehr Bindestriche (`---`) und drücken Enter, ist
das Ergebnis dasselbe — bei dieser automatischen Umwandlung ist **Enter der Auslöser**.

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
