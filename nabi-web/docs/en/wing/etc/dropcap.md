---
title: Drop cap
---

# Drop cap

## Description

`dropCapWing` is a single-valued paragraph attribute that sets
`data-nabi-dropcap="1"` on a paragraph. It creates no new block; it only lays a
mark on a paragraph that already exists.

- It is a **boolean attribute**: the only value is `1`. "Off" is not `0` — it is
  the key being absent altogether. Press the button again and the attribute comes
  off.
- Because its reach is the first letter alone, Enter treats it like a mark: split
  the paragraph and it is not copied into both halves, it follows that letter.
  Split at the very start and the drop cap goes with the tail; split anywhere
  later and it stays with the head.
- There is no context row for it. One toolbar button already toggles it, and a
  second place saying the same thing would only be a way to say "off" twice.
- **There is no option, and no variable, for how many lines it wraps.** One
  `::first-letter` rule in the core sheet fixes the size — `font-size: 5.9em;
  line-height: .83`. How many lines the letter actually covers falls out of that
  paragraph's line height.

To change the size, override that rule:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```


## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
