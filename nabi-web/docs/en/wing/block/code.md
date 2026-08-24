---
title: Code
---

# Code

## Description

`codeWing` (id `code`) is a constant wing object that handles the code block (`<pre><code>`).

It is a `holds: 'inline'` container, and inside it `repair` normalizes the text back to plain text, so no other inline mark or block can nest inside.

Type ` ``` ` on an empty line and press space or Enter and it becomes a code block — write a language after it, as in ` ```ts `, and that language is picked up automatically. `Tab` and `Shift+Tab` indent and outdent code lines, and this applies in bulk when several lines are selected. Pressing Enter automatically carries over the indentation depth of the previous line.

While the caret is inside a code block, the dynamic context toolbar activates, offering a field to type a language directly, a "No language" button, and shortcut buttons for commonly used languages:

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Even a language not in the list above can be typed directly into the input field, and the entered value is passed straight through to the syntax highlighter.

## Highlighting plugs into the wing

`highlight` is a hook function that takes the source code and language and returns an array of tokens: `(source, lang) => { text: string, type?: string }[]`.

A token's `type` returns one of the 14 standard token kinds defined in `CODE_TOKEN_TYPES` (`keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`, `operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta`).

The core stylesheet gives theme colors to five default token kinds (`comment`, `string`, `keyword`, `number`, `literal`) through the `[data-nabi-token="…"]` selector. To apply dark mode or custom colors, override that CSS selector.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

When wiring up an external highlighter such as Shiki or Prism, use `makeCodeAttach` to build the `attach` hook.

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

If, like Shiki, your highlighter loads grammar bundles asynchronously, pass the `version` option to re-highlight the editor once grammar loading finishes:

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight: myHighlighter, version: () => grammarAge }),
}

// once the async grammar load finishes
grammarAge += 1
```

The saved HTML structure follows the standard form: `<pre data-nabi-lang="ts"><code class="language-ts">`. Each token is safely marked up with a `data-nabi-token` attribute.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
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
