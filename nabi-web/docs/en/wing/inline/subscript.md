---
title: Subscript
---

# Subscript

## Description

`subscriptWing` is the owner (claim) of `<sub>`. Use it for a chemical formula or
a number that sits below the line.

- The only tag it accepts is `<sub>`. No attribute survives.
- There is no hint-mode shortcut and no accelerator. Its toolbar group is `script`,
  where it stands beside Superscript (which comes first, by registration order).
- Pressing it with text selected is a toggle.
- Its appearance comes from the sheet the wing carries as `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**That sheet is one shared set, held jointly with Superscript.** Both wings carry
the identical text, so registering both still puts it into the document **once**
(`collectSheets` drops sheets it has already seen). The saved value (HTML) keeps
only the `<sub>` tag; the style itself never rides along.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
