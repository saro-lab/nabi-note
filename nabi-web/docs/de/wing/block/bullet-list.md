---
title: Aufzählungsliste
---

# Aufzählungsliste

## Beschreibung

`bulletListWing` (Name `ul`, Kürzel `L`) kümmert sich um ungeordnete Listen (`<ul>`). Der Listeneintrag (`<li>`) ist über das `parts`-Attribut eingebettet, `li` muss also nicht separat registriert werden.

```ts
parts: { li: { holds: 'blocks' } }
```

Ein Klick auf die Symbolleisten-Schaltfläche verwandelt den Block, in dem der Cursor steht (oder alle ausgewählten Blöcke), in eine Aufzählungsliste; ein erneuter Klick stellt wieder normale Absätze her. Ein Klick auf eine andere Listen-Schaltfläche (Nummerierung, Checkliste usw.) wechselt sofort zu diesem Listentyp.

Tippen Sie am Anfang eines Absatzes `- ` (Bindestrich und Leerzeichen), wird er ebenfalls automatisch in eine Liste umgewandelt. Da nur das Zeichenmuster direkt vor dem Cursor geprüft wird, funktioniert die Umwandlung auch bei `- Text`, wenn Sie danach das Leerzeichen tippen — der bereits geschriebene Text bleibt als Inhalt des Listeneintrags erhalten (das greift allerdings nur in der ersten Zeile eines Absatzes).

### Tastenkürzel und Editierverhalten

- <kbd>Tab</kbd>: Rückt den aktuellen Eintrag eine Ebene ein und macht ihn zum Untereintrag des Eintrags direkt darüber. Beim ersten Eintrag gibt es keinen übergeordneten Eintrag, daher passiert nichts — und innerhalb einer Liste fügt <kbd>Tab</kbd> niemals ein Leerzeichen ein.
- <kbd>Shift</kbd>+<kbd>Tab</kbd>: Rückt den aktuellen Eintrag eine Ebene aus. Rückt man einen Eintrag der obersten Ebene aus, verlässt er die Liste und wird zu einem normalen Absatz. Sind mehrere Einträge ausgewählt, bewegt sich die gesamte Auswahl gemeinsam.
- **<kbd>Enter</kbd> auf einem leeren Eintrag**: rückt ihn aus. War es ein leerer Eintrag der obersten Ebene, endet die Liste dort, und darunter erscheint ein neuer Absatz.
- **<kbd>Backspace</kbd> ganz am Anfang eines Eintrags**: verschmilzt seinen Inhalt mit dem Ende des vorigen Eintrags. Gibt es keinen vorigen Eintrag zum Verschmelzen, wird stattdessen ausgerückt. Umgekehrt zieht <kbd>Delete</kbd> ganz am Ende eines Eintrags den nächsten Eintrag in die aktuelle Zeile.
- Da ein Eintrag (`li`) ein Block-Container ist, enthält er einen Absatz (`p`), und sämtliche Inline-Formatierung — fett, kursiv und so weiter — lässt sich darin frei verwenden.
- Nicht standardmäßige Attribute des Tags werden bei der Normalisierung entfernt, und alles außer `li`, das innerhalb einer Liste auftaucht, wird automatisch zur Korrektur in ein `li`-Element gehüllt.
- Die Aufgaben-Checkliste teilt sich dasselbe `<ul>`-Tag, die beiden Flügel werden aber daran unterschieden, ob das Attribut `data-nabi-list="task"` vorhanden ist.

## Markup und Verschachtelungsstruktur

Die verschachtelte Struktur des Nabi-Baums wird direkt ins HTML übertragen. Weil ein Listeneintrag (`li`) Blöcke statt Text enthält, wird der Text innerhalb eines Eintrags in einen `<p>`-Absatz gehüllt, und eine verschachtelte Unterliste wird sicher innerhalb eines Wrapper-Absatzes (`<div data-nabi-p>`) platziert.

```html
<li><p>Übergeordneter Eintrag</p><div data-nabi-p><ul><li><p>Untergeordneter Eintrag</p></li></ul></div></li>
```

## Verwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Baut registry und nabi-Instanz aus der Liste der registrierten Flügel.
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` wird automatisch über `parts` registriert und daher nie direkt ins Array übergeben.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
