---
title: Code
---

# Code

## Beschreibung

`codeWing` (id `code`) besitzt den Codeblock (`<pre>`). Er ist eine **Konstante** — es gibt nichts
aufzurufen und keine Optionen zu übergeben. Er ist ein Container mit `holds: 'inline'`, und sein
`repair` glättet alles, was darin landet, zurück zu reinem Text, sodass kein Mark und kein anderer
Flügel darin überlebt.

Tippen Sie ` ``` ` auf einer leeren Zeile und drücken Sie Leertaste oder Enter, wird es ein
Codeblock — schreiben Sie eine Sprache dahinter, wie in ` ```ts `, wird auch die Sprache erfasst.
`Tab` / `Shift+Tab` rücken Zeilen ein und aus (alle auf einmal, wenn mehrere ausgewählt sind). Enter
übernimmt die Einrückung der Zeile darüber.

Die Kontextzeile erscheint nur, während der Caret im Code steht — eine Eingabe, um die Sprache selbst
zu tippen, eine „Keine Sprache"-Schaltfläche, die nur erscheint, wenn eine Sprache gesetzt ist, und
je eine Schaltfläche pro häufig genutzter Sprache.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Diese Liste ist nur eine **Abkürzung** — sie ist nicht die Liste der Sprachen, die der Kern kennt.
Eine Sprache, die dort nicht steht, tippen Sie von Hand in die Eingabe, und der Wert geht direkt an
den Highlighter weiter.

## Einfärben steckt am Flügel

`highlight` ist ein Hook, der **Arten zurückgibt, keine Farben** — seine Gestalt ist `(source,
language) => {text, type?}[]`, und `type` ist auf eine von `keyword`, `string`, `number`, `comment`,
`function`, `class`, `variable`, `operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`,
`meta` festgelegt — die vierzehn von `CODE_TOKEN_TYPES`.

Die Farben legt das Kern-Stylesheet direkt über `[data-nabi-token="…"]`-Selektoren fest, und **nur
fünf davon bekommen eine Farbe** (`comment`, `string`, `keyword`, `number`, `literal`). Der Rest
bekommt das Attribut, aber keine Farbregel, kommt also in der Textfarbe des Fließtexts heraus. Die
Werte sind feste Farben statt CSS-Variablen, überschreiben Sie den Selektor also selbst für eine
andere Palette oder eine dunkle Variante.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Die Grammatiken selbst sind nicht im Paket enthalten — Sie bringen Ihre eigenen mit, etwa Prism,
highlight.js oder Shiki.

Die färbende Seite steckt **am Flügel**, nicht in einem separaten Mount. Bauen Sie ein `attach` mit
`makeCodeAttach` und tauschen Sie es am Code-Flügel ein, und `mountSurface` verdrahtet es zusammen
mit dem `attach` jedes anderen registrierten Flügels. Die Demo dieser Website ist ein Beispiel, wie
Shiki so angeschlossen ist (`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// Der Flügel ist eine Konstante — nur die anhängende Arbeit wird ausgetauscht
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

Übergeben Sie zusätzlich `version`, malt es neu, **wenn das Dokument unverändert ist, aber sich die
färbende Seite geändert hat**. Das ist der Fall bei einem Highlighter, der Grammatiken asynchron
abruft (Shiki tut das beim ersten Treffen einer Sprache): Die Grammatik kommt an, aber das Dokument
hat sich nicht geändert, also feuert `onChange` nie, und ohne dies müssten Sie ein weiteres Zeichen
tippen, um die Farben hereinkommen zu sehen.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// wenn die Grammatik spät ankommt — die Zahl hochsetzen, und es malt neu
grammarAge += 1
```

Der gespeicherte Wert folgt der Konvention von außen — `<pre data-nabi-lang="ts"><code
class="language-ts">`, wobei die Farben als `data-nabi-token`-Attribute hinausgehen (nicht als
Inline-`style`).

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
