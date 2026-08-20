---
title: Tabelle
---

# Tabelle

## Beschreibung

`tableWings` (Name `table`, Kürzel `T`) besitzt die Struktur `table > tr > td`.

Zeilen (`tr`) und Zellen (`td`) werden nie separat registriert — der Tabellen-Flügel bringt sie über
`parts` mit, nehmen Sie also die Tabelle heraus, gehen Zeilen und Zellen mit ihr.

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

Dass die Zelle `singleParagraph` ist, schützt das Raster — drücken Sie <kbd>Enter</kbd> innerhalb
einer Zelle, spaltet sich der Absatz nicht in zwei, und löschen Sie eine Auswahl, die sich über zwei
Zellen erstreckt, verschmelzen sie nicht zu einer.

Ein Druck auf die Schaltfläche ist kein Umschalter: Es erscheint ein Größenraster aus Zeilen ×
Spalten (bis zu 8×8), eine Tabelle der gewählten Größe kommt an die Caret-Stelle, und der Caret
wandert in die erste Zelle.

Commands erscheinen in der Kontextzeile nur, während der Caret in einer Tabelle steht.

| Gruppe | Felder |
|---|---|
| Zeile | Zeile oben einfügen · Zeile unten einfügen · Zeile löschen |
| Spalte | Spalte links einfügen · Spalte rechts einfügen · Spalte löschen |
| Verbinden | Verbinden (ein einziger Umschalter) |
| Kopfzeile | diese Zeile zur Kopfzeile machen · diese Spalte zur Kopfzeile machen (werden zu `<th>`) |
| Sortierung | Sortierung ein-/ausschalten (Spalten auf der Leseseite ordnen) |
| Löschen | Tabelle löschen |

**Verbinden ist ein einziger Umschalter**, keine Schaltfläche pro Richtung. Wählen Sie mehrere Zellen
aus und drücken Sie ihn, werden sie eins; setzen Sie den Caret in eine verbundene Zelle und drücken
Sie erneut, löst sich die Verbindung.

**Ein Feld, um den Tabellenkasten links, mittig oder rechts zu setzen, gibt es hier nicht.** Der
Platz einer Tabelle wird vom umhüllenden Wrapper-Absatz getragen, der sie hält, nicht von der Tabelle
selbst, deshalb erledigen das die Ausrichtungs-Schaltflächen der Haupt-Werkzeugleiste.

::: warning Das Sortier-Kennzeichen und verbundene Zellen
Sortierung ist **nur ein Kennzeichen**. Der Editor setzt es anstandslos auch auf eine Tabelle mit
verbundenen Zellen, und Verbinden entfernt ein bereits gesetztes Kennzeichen nicht.

Die Leseseite ist es, die sich weigert — `attachTableSort` heftet sich überhaupt nicht an eine
Tabelle mit sichtbaren verbundenen Zellen, weil verbundene Zeilen aneinandergebunden sind und ein
Neuordnen das Raster brechen würde. Auf einer verbundenen Tabelle sitzt das Kennzeichen also da, und
nichts geschieht.
:::

## Der Inhalt entscheidet über die Breite

Eine Tabelle hat keine Breiteneinstellung. Sie wächst **nur so breit wie ihr Inhalt**, und wird sie
breiter als der ihr zur Verfügung stehende Platz, **scrollt sie an Ort und Stelle seitwärts** — die
Seite wird nie hinausgeschoben. Es gibt auch kein umhüllendes `<div>`. Was in den gespeicherten Wert
eingeht, ist eine einzelne `<table>`, und die einzigen Attribute darauf sind die Ausrichtung
(`data-nabi-align`) und das Sortier-Kennzeichen.

## Bewegen und Auswählen

`Tab` / `Shift+Tab` bewegen zwischen Zellen (am Ende der Tabelle bleiben sie stehen). Weil eine Zelle
auf einen einzigen Absatz festgelegt ist, spaltet Enter die Zelle nicht — es **bricht die Zeile
innerhalb dieser Zelle um**, da ein Spalten bedeuten würde, einen Block zu erfinden, den das Raster
nicht fassen kann. Die Pfeiltasten bewegen sich entlang des Rasters, nicht entlang des Bildschirms.

Sie können mit der Maus über mehrere Zellen ziehen, um sie auszuwählen. Auch diese Zieh-Auswahl hält
der Flügel selbst über `attach`, sodass **nichts zusätzlich zu mounten ist** — `mountSurface`
verdrahtet sie für Sie.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
