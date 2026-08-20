---
title: Checkliste
---

# Checkliste

## Beschreibung

`taskListWing` (Name `tl`, Kürzel `K`) teilt sich das Tag (`<ul>`) mit der Aufzählungsliste, ist
aber eine eigenständige Implementierung — auf dem Weg hinaus sagt `data-nabi-list="task"`, dass dies
eine Checkliste ist, und `data-nabi-checked` an jedem Eintrag trägt dessen Abhak-Zustand.

Der Eintrag kommt über `parts` mit — ein Datensatz, kein Array.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

Im gespeicherten Wert ist das Häkchen `ck`, und sein einziger Wert ist `1` — „aus" ist nicht `0`,
sondern **dass der Schlüssel überhaupt fehlt**. Auf dem Weg hinaus entfaltet sich das zu
`data-nabi-checked="true"` / `"false"`.

Drücken Sie die Schaltfläche, wird der Block, in dem der Caret steht (oder jeder Block, den die
Auswahl abdeckt), in eine Checkliste eingehüllt. Das Tippen von `[ ] ` oder `[x] ` (Groß-/Kleinschreibung
egal) am Zeilenanfang erzielt dasselbe Ergebnis, und welches der beiden Sie getippt haben, entscheidet,
ob der Eintrag abgehakt startet. Die Zeile muss nicht leer sein, und es feuert nur auf der ersten Zeile
eines Absatzes.

Die Checkbox ist kein `<input>`, sondern ein in CSS gezeichnetes Kennzeichen — ein echtes Input
innerhalb von `contenteditable` würde den Caret verheddern. Eine abgehakte Box ist ein weißes ✕ auf
einer Kachel in der Akzentfarbe, und ihre Zeile wird gedämpft mit Durchstreichung.

**Die Stelle, die sie umschaltet, ist die Box selbst** — Sie müssen das schmale Band am Anfang des
Eintrags drücken (etwa ein Zeichen breit); drücken Sie den Text, bekommen Sie nur den Caret. In
rechts-nach-links geschriebenem Text steht dieses Band auf der anderen Seite. Dies trägt der Flügel
in seinem eigenen `attach`, sodass **nichts zusätzlich zu mounten ist.**

Einrücken und Ausrücken mit `Tab` / `Shift+Tab`, und die Liste mit Enter auf einem leeren Eintrag zu
beenden, funktionieren wie bei der [Aufzählungsliste](./bullet-list).

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
