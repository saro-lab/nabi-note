---
title: Nummerierte Liste
---

# Nummerierte Liste

## Beschreibung

`orderedListWing` (Name `ol`, Kürzel `N`) verarbeitet die nummerierte Liste (`<ol>`). Der Listeneintrag (`<li>`) ist über das `parts`-Attribut eingebaut und muss nicht separat registriert werden.

```ts
parts: { oli: { holds: 'blocks' } }
```

Ein Klick auf die Schaltfläche verwandelt den Block, in dem der Caret steht (oder alle von der Auswahl erfassten Blöcke), in eine nummerierte Liste; ein erneuter Klick stellt den gewöhnlichen Absatz wieder her. Ein Klick auf eine andere Listen-Schaltfläche wechselt sofort zu jener Listenart.

Tippen Sie am Anfang eines Absatzes `1. ` (Ziffer, Punkt, Leerzeichen), wird ebenfalls automatisch in eine nummerierte Liste umgewandelt. Die Startzahl ist frei wählbar und wird bis zu neun Stellen erkannt.

### Tastenkürzel und Editierverhalten

- Ein-/Ausrücken mit `Tab`/`Shift+Tab`, das Beenden der Liste mit `Enter` auf einem leeren Eintrag und das Verschmelzen mit dem vorigen Eintrag durch `Backspace` am Anfang eines Eintrags funktionieren genau wie bei der [Aufzählungsliste](./bullet-list).
- Die Nummer jedes Eintrags wird vom HTML-Tag `<ol>` dynamisch im Browser gerendert — wird also mitten in der Liste ein Eintrag eingefügt oder gelöscht, zählt sich die Nummerierung automatisch neu.
- Verschachtelte Listenstrukturen werden sicher über einen Wrapper-Absatz (`<div data-nabi-p>`) verschachtelt gerendert.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
