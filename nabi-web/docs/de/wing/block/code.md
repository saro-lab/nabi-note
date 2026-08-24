---
title: Code
---

# Code

## Beschreibung

`codeWing` (ID `code`) ist ein konstantes Wing-Objekt, das den Codeblock (`<pre><code>`) verwaltet.

Es ist ein Container mit `holds: 'inline'`, und sein Text wird in der `repair`-Phase auf reinen Text normalisiert, sodass kein anderes Inline-Mark und kein anderer Block darin verschachtelt werden kann.

Tippen Sie ` ``` ` auf einer leeren Zeile und drücken Sie Leertaste oder Enter, wird daraus ein Codeblock (schreiben Sie eine Sprache dahinter, wie in ` ```ts `, wird die Sprache automatisch übernommen). `Tab` und `Shift+Tab` rücken Codezeilen ein und aus, auch gesammelt bei mehreren ausgewählten Zeilen. Beim Drücken von Enter wird die Einrückungstiefe der vorigen Zeile automatisch übernommen.

Solange der Caret innerhalb eines Codeblocks steht, ist die dynamische Kontext-Toolbar aktiv und bietet ein Eingabefeld zum direkten Eintippen der Sprache, eine Schaltfläche „Keine Sprache" sowie Schnellzugriff-Schaltflächen für häufig genutzte Sprachen:

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Auch eine Sprache, die nicht in dieser Liste steht, lässt sich direkt in das Eingabefeld eintippen — der eingegebene Wert wird unverändert an den Syntax-Highlighter weitergegeben.

## Syntax-Highlighting wird am Flügel angeschlossen

`highlight` ist eine Hook-Funktion, die Quellcode und Sprache entgegennimmt und ein Array von Tokens zurückgibt: `(source, lang) => { text: string, type?: string }[]`.

Der `type` eines Tokens gibt einen der 14 Standard-Tokentypen aus `CODE_TOKEN_TYPES` zurück (`keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`, `operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta`).

Das Kern-Stylesheet vergibt über den Selektor `[data-nabi-token="…"]` Theme-Farben an fünf Standard-Tokentypen (`comment`, `string`, `keyword`, `number`, `literal`). Für Dark Mode oder eigene Farben überschreiben Sie einfach diesen CSS-Selektor.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Um einen externen Highlighter wie Shiki oder Prism anzubinden, bauen Sie mit `makeCodeAttach` den `attach`-Hook.

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

Lädt Ihr Highlighter — wie Shiki — Grammatik-Bundles asynchron, übergeben Sie die Option `version`, um den Editorbildschirm neu einzufärben, sobald das Laden der Grammatik abgeschlossen ist:

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight: myHighlighter, version: () => grammarAge }),
}

// wenn das asynchrone Laden der Sprachgrammatik abgeschlossen ist
grammarAge += 1
```

Die gespeicherte HTML-Struktur folgt dem Standardformat: `<pre data-nabi-lang="ts"><code class="language-ts">`. Jedes Token wird sicher mit dem Attribut `data-nabi-token` ausgezeichnet.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
