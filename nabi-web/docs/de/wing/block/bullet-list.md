---
title: Aufzählungsliste
---

# Aufzählungsliste

## Beschreibung

`bulletListWing` (Name `ul`, Kürzel `L`) besitzt `<ul>`. Der Eintrag kommt über `parts` mit, `li`
wird also nicht separat registriert — ein Datensatz, kein Array.

```ts
parts: { li: { holds: 'blocks' } }
```

Ein Druck auf die Schaltfläche hüllt den Block, in dem der Caret steht (oder die von der Auswahl
erfassten Blöcke), in eine Liste; ein erneuter Druck löst sie, und der Text kehrt zum Absatz zurück.
Drücken Sie eine andere Listen-Schaltfläche, wechselt sie zu dieser Sorte.

Am Zeilenanfang einen Bindestrich zu tippen und Leertaste zu drücken (`- `) erzielt dasselbe
Ergebnis. **Die Zeile muss nicht leer sein** — gemessen wird nur der Zeilenanfang vor dem Caret,
also feuert es auch bei `- Text danach`, wenn Sie die Leertaste drücken, und der Text danach bleibt
im Eintrag erhalten. Es feuert allerdings nur auf der **ersten Zeile** eines Absatzes.

- `Tab` rückt eine Stufe unter den unmittelbar vorangehenden Geschwistereintrag ein. Beim ersten
  Eintrag gibt es keinen Platz zum Einrücken, also geschieht nichts — innerhalb einer Liste fügt
  `Tab` kein Leerzeichen ein.
- `Shift+Tab` rückt zum nächsten Geschwister des Elternteils aus — rücken Sie auf oberster Ebene
  aus, verlässt der Text die Liste und wird zum Absatz. Haben Sie über mehrere Einträge hinweg
  ausgewählt, bewegen sich alle erfassten Einträge gemeinsam.
- **Enter auf einem leeren Eintrag rückt aus** — war er auf oberster Ebene, endet die Liste dort,
  und der Caret steht im neuen Absatz darunter. Das ist der Weg, eine Liste zu beenden.
- **Rücktaste ganz am Anfang eines Eintrags verschmilzt ihn mit dem vorigen Eintrag.** Gibt es
  keinen vorigen Eintrag zum Verschmelzen, fällt es auf Ausrücken zurück. Entf am Ende eines
  Eintrags zieht umgekehrt den nächsten Eintrag heran.
- Das Innere eines Eintrags ist ein Block, ein Absatz steckt also eine Schicht darin. Marks (Fett
  und andere) und weitere Inline-Flügel lassen sich darin unverändert verwenden.
- Attribute wie `type`, die das Tag mitbrachte, überleben nicht. Kommt etwas, das kein Eintrag ist,
  in die Liste hinein, wird es nicht verworfen, sondern in einen Eintrag eingehüllt.
- Die Checkliste teilt sich mit dieser das Tag (`<ul>`), ist aber ein anderer Flügel — sie scheiden
  sich am Kennzeichen-Attribut (steht `data-nabi-list="task"` da, ist es eine Checkliste).

## Verschachtelung ist echtes Markup

Die Struktur bleibt genau so im gespeicherten Wert stehen. Weil ein **Eintrag aber Blöcke statt Text
hält**, trägt der Text eine Schicht Absatz, und eine verschachtelte Liste steht in einem
Wrapper-Absatz.

```html
<li><p>a</p><div data-nabi-p><ul><li><p>b</p></li></ul></div></li>
```

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` kommt über `parts` automatisch mit und wird daher nicht selbst ins Array geschrieben.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
