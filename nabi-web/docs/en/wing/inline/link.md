---
title: Link
---

# Link

## Description

`linkWing` (id `a`) owns `<a href>`. It is a **constant** — there is nothing to
call and no options to pass. Press the button and an address layer opens near the
caret; only an address starting with `http` or `https` turns the confirm button on
— that whitelist check *is* the XSS defense (a scheme like `javascript:` never
gets through at all). An `href` that fails validation is not stored, and in that
case the text goes out plain, with no `<a>` tag around it.

The layer has two fields — the address and the text to show. Leave the text field
empty and the address becomes the text; with only a caret and no selection, the
whole link mark the caret sits in is the target (the same rule as Highlight and
Text color).

## An existing link is edited from the context row

When the caret stands inside a link, **two text fields** appear on the context row
— not a button that opens the layer, but input fields that stand in the row itself
(`kind: 'text'`). They come up filled with the current values, and press Enter or
click elsewhere to commit. If a value is unchanged, nothing happens.

| Field | What it does |
|---|---|
| Address | Changes the address only. The text to show stays as it is. |
| Display name | Changes the shown text only. The address and the attachment marker stay as they are. |

**An attachment (a file link) gets no address field** — that address was decided
by the upload, not a value to fix by hand. The name field comes up the same way
for an ordinary link and for an attachment. An empty name is refused — making a
link with no name is not renaming, it is deleting.

## Atomic on the screen

An attachment behaves as one thing. Click it and the whole span is aimed rather
than the caret landing inside it; press Backspace or Delete beside it and the
whole link goes. Editing it is the context row's job, not the caret's. This is
carried by the wing's own `attach`, which `mountSurface` wires up — there is
nothing extra to mount.

## The attachment marker

A link that arrived through an upload carries a `data-nabi-file` marker (its value
is the extension) — that marker is what makes the sheet draw a clip box instead of
an underline. Change the name or change the address and the marker follows along.
Even clearing formatting leaves an attachment alone — strip the shell off and the
attachment becomes dead plain text.

::: warning Outgoing links are always strict
An editor-wide `allowLocalUrls` reaches images and embeds, **not links.** On the
way out a link's `href` is checked against `http`/`https` (and plain relative
paths) with no exception, so a `blob:` or `data:` address never survives into the
saved HTML — it falls back to plain text. An attachment held at a `blob:` address
is a preview that lives only as long as the page does; give it a real address
before saving.
:::

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
