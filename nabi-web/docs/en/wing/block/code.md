---
title: Code
---

# Code

## Description

`codeWing` (id `code`) owns the code block (`<pre>`). It is a **constant** — there
is nothing to call and no options to pass. It is a container declared
`holds: 'inline'`, and its `repair` flattens whatever lands inside back to plain
text, so no mark and no other wing survives in there.

Type ` ``` ` on an empty line and press space or Enter and it becomes a code
block — write a language after it, as in ` ```ts `, and the language is picked up
too. `Tab` / `Shift+Tab` indent and outdent lines (all at once, if several are
selected). Enter carries over the indentation of the line above.

The context row appears only while the caret is inside the code — a prompt for
typing the language yourself, a "no language" button that shows only when a
language is set, and one button per commonly used language.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

That list is only a **shortcut** — it is not a list of the languages the core
knows. A language that is not there is typed into the prompt by hand, and the
value goes straight through to the highlighter.

## Highlighting plugs into the wing

`highlight` is a hook that **returns kinds, not colors** — its shape is
`(source, language) => {text, type?}[]`, and `type` is fixed to one of
`keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`,
`operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta` — the
fourteen of `CODE_TOKEN_TYPES`.

The colors are set by the core sheet directly, through `[data-nabi-token="…"]`
selectors, and **only five of them are colored** (`comment`, `string`, `keyword`,
`number`, `literal`). The rest get the attribute but no color rule, so they come
out in the body color. The values are fixed colors rather than CSS variables, so
override the selector yourself for a different palette or a dark variant.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

The grammars themselves are not in the package — you bring your own, such as
Prism, highlight.js or Shiki.

The painting side goes **on the wing**, not into a separate mount. Build an
`attach` with `makeCodeAttach` and swap it onto the code wing, and `mountSurface`
wires it up along with every other registered wing's `attach`. The demo on this
site is an example of Shiki hooked up that way (`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// The wing is a constant — only the attached work is swapped out
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

Pass `version` as well and it repaints **when the document is unchanged but the
painting side has changed**. That is the case for a highlighter that fetches
grammars asynchronously (Shiki does, the first time it meets a language): the
grammar arrives but the document did not change, so `onChange` never fires, and
without this you would have to type one more character to see the colors come in.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// when the grammar arrives late — bump the number and it repaints
grammarAge += 1
```

The saved value follows the convention outside — `<pre data-nabi-lang="ts"><code
class="language-ts">`, with the colors going out as `data-nabi-token` attributes
(not as inline `style`).

## Usage

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
