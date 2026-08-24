---
title: Link
---

# Link

## Description

`linkWing` (id `a`) is the inline mark wing that handles hyperlinks (`<a href>`).

Click the toolbar button and a popup for entering the link URL appears. Only a safe URL starting with `http:` or `https:` can be entered — a malicious script URL such as `javascript:` is filtered out automatically under the XSS security policy.

The link popup takes both the **link URL** and the **display text** together. Leave the text field empty and the URL itself becomes the display text.

## Editing a link from the context toolbar

With the caret already inside an existing link, the dynamic context toolbar shows inline text fields for editing it right away:

| Field | Description |
|---|---|
| Link address (`href`) | Changes only the link's target URL (the display text is kept as is) |
| Display name | Changes only the text shown in the body (the URL is kept as is) |

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
