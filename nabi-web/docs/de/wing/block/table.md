---
title: Tabelle
description: Erstellen Sie Zeilen und Spalten, bearbeiten Sie Zellen und unterstützen Sie die Sortierung von Spalten.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tabelle

Wählen Sie in der Symbolleiste Zeilen und Spalten aus, um eine Tabelle zu erstellen. Innerhalb einer Zelle wird der Inhalt mit Zeilenumbrüchen fortgesetzt, anstatt mehrere Absätze zu verwenden, und Tab sowie Shift+Tab bewegen zur nächsten oder vorherigen Zelle.

Das Hinzufügen und Löschen von Zeilen oder Spalten, das Zusammenführen von Zellen und das Umschalten von Kopfzeilenzellen erfolgen um die ausgewählten Zellen herum. Um die Spaltensortierung in der veröffentlichten Ansicht nach dem Speichern einer Tabelle als sortierbar zu verwenden, verbinden Sie `attachViewer()` aus `nabi-note/viewer`. Tabellen mit zusammengeführten Zellen werden nicht sortiert.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS-Stile

Stilisiere die Tabelle mit `.nabi-content table` und die Zellen mit `.nabi-content :is(th, td)`. Ändere nicht die Zellstruktur oder den vom Viewer eingefügten Sortierknopf.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Wenn der Viewer verbunden ist, behalten Sie die Schaltfläche `.nabi-sort` bei. Wenn Sie die Zellposition oder den rechten Innenabstand zwangsweise überschreiben, kann dies den Sortierknopf überlappen.
