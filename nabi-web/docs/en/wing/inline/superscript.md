---
title: Superscript
---

# Superscript

## Description

`superscriptWing` is the owner (claim) of `<sup>`. Use it for the exponent on a
unit or for a footnote number.

- The only tag it accepts is `<sup>`. No attribute survives.
- There is no hint-mode shortcut and no accelerator (it is one of the wings that
  grows no badge, like Upload file). Its toolbar group is `script`, where it stands
  beside Subscript — and by registration order this one comes first.
- Pressing it with text selected is a toggle.
- Its appearance comes from the sheet the wing carries as `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**That sheet is one shared set, held jointly with Subscript.** Both wings carry the
identical text, so registering both still puts it into the document **once**
(`collectSheets` drops sheets it has already seen). The saved value (HTML) keeps
only the `<sup>` tag; the style itself never rides along.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
