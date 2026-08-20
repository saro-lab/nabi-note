---
title: Zitat
---

# Zitat

## Beschreibung

`quoteWing` (Name `quote`) besitzt den Zitatkasten (`<blockquote>`). Er ist `place: 'container'` und
`holds: 'blocks'` — Blöcke leben darin. Wie jeder andere Klotz trägt auch das Zitat selbst einen
Wrapper-Absatz und steht auf oberster Ebene.

**Es setzt kein `allows`.** Das Innere eines Zitats folgt denselben Regeln wie die oberste Ebene,
eine Tabelle oder ein Bild kann also ebenfalls einen Wrapper-Absatz tragen und darin stehen — fügen
Sie solches HTML per Einfügen oder Laden ein, überlebt es unverändert.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["Text"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Allerdings **kommen Einfüge-Schaltflächen nicht in das Zitat hinein.** Dinge, die über `insertLump`
stehen, wie Bild, Tabelle oder Trennlinie, setzen sich immer auf die **oberste Ebene**, ein neuer
Klotz landet also **hinter** dem Zitat, selbst wenn der Caret darin steht. Um etwas in ein Zitat
hineinzubekommen, fügen Sie es per Einfügen ein.

Ein Druck auf die Schaltfläche hüllt alle von der Auswahl erfassten Blöcke auf oberster Ebene in ein
Zitat. Es löst sich nur, wenn das Erfasste **bereits vollständig ein Zitat** ist — ist es gemischt,
wird es noch einmal als Ganzes eingehüllt.

Steht am Zeilenanfang nur `>` und Sie drücken die Leertaste, wird diese Zeile zum Zitat — bei dieser
automatischen Umwandlung ist **die Leertaste der Auslöser** (nicht Enter), weil Sie in derselben
Zeile weiterschreiben.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
