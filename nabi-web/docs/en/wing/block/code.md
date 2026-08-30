---
title: Code
description: Store multi-line code together with the language used for syntax highlighting.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Code

Insert multi-line code separately from ordinary body text. Type three backticks in an empty paragraph and press Space or Enter, or switch to a code block from the toolbar. If you add a language name after the backticks, such as `ts`, that name is stored as well.

The language name is an identifier used for syntax highlighting, and names outside the registered list can also be typed manually. Because code content and indentation must be preserved, code blocks do not accept paragraph alignment.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Connecting a Code Highlighter

Registering the code block uses the default coloring inside the editor. To color code in the published view as well, connect `nabi-note/viewer`. The viewer finds `pre > code` and reads the parent element's `data-nabi-lang` value as the language name. If that value is missing, it checks the `language-...` class on the `code` element.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'en',
})

// After replacing the published HTML
viewer.refresh()

// When closing the screen
viewer.unmount()
```

If there is no separate highlighter, or if that highlighter cannot handle the language, the dependency-free built-in tokenizer colors it instead. Token spans inserted by the highlighter exist only on screen and are not written back to the saved JSON or original published HTML. `refresh()` and `unmount()` remove those spans and reconnect from the current original code.

### How the NABI Website Connects Shiki

The NABI website loads the highlighter dynamically so Shiki does not enter the first screen or SSR bundle. `loadCodeHighlighting()` in `nabi-web/docs/.vitepress/src/highlight.ts` creates Shiki core, then fetches a language grammar only when code in that language is actually needed. The example below uses the same connection in the published view.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'en',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// When closing the screen
stop?.()
viewer.unmount()
```

When a language appears for the first time, the grammar download starts. Until then, the block is shown with the built-in tokenizer or as plain text. Once the grammar arrives, `onGrammarLoaded()` calls `viewer.refresh()` and colors the block again. That way only needed languages are downloaded, and a grammar that arrives late is applied without another page navigation.

The editor side uses the same `highlight` function. The NABI website demo replaces only the default `codeWing` `attach` with `makeCodeAttach({ highlight, version })`. `version` changes whenever a grammar arrives, and acts as a signal to repaint code that has already been drawn. A standalone service can implement the published-view connection first, then add this approach only if Shiki coloring is also needed while editing.

## CSS Styles

Style code blocks with `.nabi-content pre`, and code with `.nabi-content pre > code`. Do not change `white-space`, because it affects code line breaks and editing. Token colors can be changed with `[data-nabi-token]` selectors.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
