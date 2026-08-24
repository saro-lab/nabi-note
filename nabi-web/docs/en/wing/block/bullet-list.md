---
title: Bullet list
---

# Bullet list

## Description

`bulletListWing` (id `ul`, shortcut `L`) handles unordered lists (`<ul>`). List items (`<li>`) are embedded via the `parts` attribute, so there's no need to register `li` separately.

```ts
parts: { li: { holds: 'blocks' } }
```

Click the toolbar button and the block the caret is in (or every selected block) turns into a bullet list; click it again to restore plain paragraphs. Pressing another list button (numbered, checklist, etc.) switches straight to that list type.

Typing `- ` (a hyphen and a space) at the start of a paragraph also converts it into a list automatically. Since it checks the character pattern right before the caret, typing the space after `- text` still converts correctly, and whatever you'd already written stays as the list item's content (this only fires on a paragraph's first line, though).

### Shortcuts and editing behavior

- <kbd>Tab</kbd>: indents the current item one level, nesting it under the item directly above. On the first item there's no parent to nest under, so nothing happens — and inside a list, <kbd>Tab</kbd> never inserts a space character.
- <kbd>Shift</kbd>+<kbd>Tab</kbd>: outdents the current item one level. Outdenting a top-level item takes it out of the list and turns it into a plain paragraph. With several items selected, the whole selection moves together.
- **Pressing <kbd>Enter</kbd> on an empty item**: outdents it. If it was an empty top-level item, the list ends there and a new paragraph appears below.
- **Pressing <kbd>Backspace</kbd> at the very start of an item**: merges its content onto the end of the previous item. If there's no previous item to merge into, it outdents instead. Conversely, pressing <kbd>Delete</kbd> at the very end of an item pulls the next item up onto the current line.
- Since an item (`li`) is a block container, it holds a paragraph (`p`), and any inline formatting — bold, italics, and the rest — is free to use inside it.
- Non-standard attributes on the tag are stripped during normalization, and anything other than an `li` found inside a list is automatically wrapped into an `li` item to correct it.
- Task checklists share the same `<ul>` tag, but the two wings are told apart by whether the `data-nabi-list="task"` attribute is present.

## Markup and nesting structure

The Nabi tree's nested structure is carried straight into the HTML. Because a list item (`li`) holds blocks rather than text, the text inside an item is wrapped in a `<p>` paragraph, and a nested sub-list is placed safely inside a wrapper paragraph (`<div data-nabi-p>`).

```html
<li><p>Parent item</p><div data-nabi-p><ul><li><p>Child item</p></li></ul></div></li>
```

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Builds the registry and the nabi instance from the registered list of wings.
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` is registered automatically through `parts`, so it's never passed into the array directly.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
