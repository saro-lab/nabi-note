---
title: Bullet list
---

# Bullet list

## Description

`bulletListWing` (name `ul`, shortcut `L`) owns `<ul>`. The item comes along
through `parts`, so `li` is never registered separately — and `parts` is a record,
not an array.

```ts
parts: { li: { holds: 'blocks' } }
```

Press the button and the block the caret sits in (or every block the selection
covers) is wrapped into a list; press it again and the wrapping comes off and you
are back to paragraphs. Press another list button and it changes into that kind.

Typing a hyphen at the start of a line and then a space (`- `) gets the same
result. **The line does not have to be empty** — all that is measured is the line
prefix in front of the caret, so `- some text` fires on the space and the text
stays inside the new item. It only fires on the **first line** of a paragraph.

- `Tab` indents one step, under the sibling item directly above. The first item has
  nothing to go under, so nothing happens — inside a list `Tab` never inserts
  spaces.
- `Shift+Tab` outdents to the parent's next sibling — outdent at the top level and
  it leaves the list and becomes a paragraph. With a selection spanning several
  items, every item it covers moves together.
- **Enter on an empty item outdents it** — at the top level the list ends there and
  the caret stands in a new paragraph below it. That is how you end a list.
- **Backspace at the very start of an item joins it into the item above.** With no
  item above to join, it falls back to outdenting. Delete at the very end does the
  mirror image, pulling the next item up.
- An item holds blocks, so there is a paragraph inside it. Marks (bold and the
  rest) and other inline wings work inside that paragraph as usual.
- Attributes the tag was carrying, such as `type`, do not survive. Anything that is
  not an item found inside a list is not thrown away — it gets wrapped into one.
- Checklist shares the tag (`<ul>`) but is a different wing — they are told apart
  by a marker attribute (`data-nabi-list="task"` means checklist).

## Nesting is real markup

The structure survives into the saved value as it stands. Because **an item holds
blocks rather than text**, though, the text wears a paragraph and a nested list
stands inside a wrapper paragraph.

```html
<li><p>a</p><div data-nabi-p><ul><li><p>b</p></li></ul></div></li>
```

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` follows automatically through `parts`, so it never goes into the array by hand.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
