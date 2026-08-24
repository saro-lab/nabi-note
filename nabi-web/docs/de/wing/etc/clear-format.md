---
title: Formatierung löschen
---

# Formatierung löschen

## Beschreibung

`clearFormatWing` ist ein Werkzeug-Flügel (`place: 'tool'`), der angewendete Formatierung entfernt und den Text auf reinen Text zurücksetzt.

- **Was entfernt wird**: 11 Inline-Marks (`b`, `i`, `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) und 3 Absatzattribute (`h` Überschrift, `a` Ausrichtung, `dc` Initiale).
- **Bei ausgewähltem Bereich** werden alle Inline-Marks und Absatzattribute innerhalb dieses Bereichs auf einmal entfernt.
- **Bei nur einem Caret** wird Schicht für Schicht abgetragen, beginnend beim innersten Mark an der Caret-Position — sobald kein Mark mehr übrig ist, werden die Absatzattribute zurückgesetzt.
- **Anhang-Links (`data-nabi-file`) sind geschützt** — anders als ein gewöhnlicher Weblink wird ein Datei-Anhang-Link vom Entfernen ausgenommen, sodass die Dateiinformation erhalten bleibt.
- **Die Ausrichtung des Wrapper-Absatzes eines Blockobjekts** (Bild, Tabelle usw.) **bleibt erhalten.**

## Zwei Tipps auf <kbd>Esc</kbd>

Neben der Werkzeugleisten-Schaltfläche löst **zweimaliges Tippen von <kbd>Esc</kbd> innerhalb von 350ms** den Befehl zum Formatierung-Löschen sofort aus.

- Ob mit Textauswahl oder nur mit Caret — es entfernt die Formatierung stufenweise, genau wie ein Druck auf die Werkzeugleisten-Schaltfläche.
- <kbd>Esc</kbd> wird mit der niedrigsten Priorität behandelt — selbst wenn der erste Tipp eine Mark-Flucht vorgemerkt hat, löst der zweite Tipp trotzdem korrekt das Formatierung-Löschen aus.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
