---
title: Formatierung löschen
---

# Formatierung löschen

## Beschreibung

`clearFormatWing` ist eine **fertige Konstante**. Legen Sie ihn in das Array, und Sie sind fertig —
es gibt keine Optionen zu übergeben.

Da er `place: 'tool'` ist, errichtet er keinen eigenen Knoten im Dokument. Ein Command
(`clearFormat`) und eine Werkzeugleisten-Schaltfläche sind alles davon.

- **Die Liste, die er entfernt, ist im Kern festgenagelt.** Elf Inline-Marks (`b`, `i`, `u`, `s`,
  `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) und drei Absatzattribute (`h` Überschrift, `a`
  Ausrichtung, `dc` Initiale). Der Host hat keine Liste zu pflegen, und Marks aus selbst
  geschriebenen Flügeln werden **hier nicht entfernt**.
- **Wählen Sie einen Bereich aus und drücken Sie**, kommen die Marks in dieser Strecke zusammen mit
  den Attributen jedes berührten Absatzes auf einmal ab.
- **Mit nur einem Caret schält es Schicht für Schicht ab** — beginnend beim **innersten Mark** am
  Caret, über die Strecke, die dieser Mark läuft. Ist kein Mark mehr abzunehmen, gehen dann die
  Absatzattribute.
- **Anhang-Links werden nie entfernt** — ein Link (`a`), der ein `file`-Attribut trägt, ist überall
  unantastbar, weil das Abstreifen der Hülle den Anhang zu einer toten Zeile reinen Textes machen
  würde.
- **Ausrichtung überlebt auf einem Absatz, der einen Klotz hält.** Auf einem Wrapper-Absatz um ein
  Bild oder eine Tabelle wird allein die Ausrichtung (`a`) nicht entfernt — Formatierung zu löschen
  soll das Bild nicht zurück nach links schicken.
- Gibt es nichts abzustreifen, antwortet das Command mit `null`, sodass sich kein Rückgängig-Punkt
  anhäuft.

## <kbd>Esc</kbd> zweimal

Neben der Werkzeugleisten-Schaltfläche gibt es **einen Weg durch die Tastatur** — zweimal
hintereinander <kbd>Esc</kbd> tippen. Weder ein einbuchstabiger Hinweis noch ein
`⌘`-Beschleuniger konnte diese Geste halten, also ging sie zu der Doppel-Tap-Erklärung
(`doubleKeys`).

- **Sie tut genau, was das Drücken der Schaltfläche tut.** Mit einer Auswahl diese Strecke; **mit
  nur einem Caret** eine Schicht an dieser Stelle — das Command weiß bereits, was zu streichen ist,
  so dass die Tastaturseite nicht auf dem Zustand des Caret abzweigt.
- **Es lädt auf den zweiten Tap genau.** Vier Taps sind immer noch ein Laden, und wenn mehr als 350ms
  zwischen zwei Taps vergeht, startet die Zählung neu. Wiederholungen vom Halten der Taste
  (`repeat`) und Taps während IME-Komposition werden nicht gezählt.
- **Seine Priorität ist die niedrigste.** Es nimmt seinen Platz nur, nachdem jede andere Arbeit
  <kbd>Esc</kbd> hatte (Auflösung einer Armierung, Flucht aus einer Marke) vorbei ist — drücken Sie
  <kbd>Esc</kbd> in der Mitte einer Glyphenbürste und der erste Tap richtet die Mark-Flucht aus, und
  der zweite trägt immer noch zur Formatierung löschen bei.
- **Es gibt nur fünf Plätze, an denen es nicht funktioniert** — ein offenes Panel, ein Scrim, ein
  Vollbild, die Hinweisabzeichen und eine Upload-Sperre.
- Der Schaltflächentooltip sagt es — **"Formatierung löschen (Esc Esc)"**, das gleiche Muster wie
  die Shift-Abzeichen.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
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
