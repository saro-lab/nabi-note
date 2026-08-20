---
title: YouTube
---

# YouTube

## Description

`youtubeWing` (name `youtube`, no shortcut) owns the YouTube embed (`<iframe>`). It
is a **lump that holds nothing** (`place: 'void'`), like `hr` and `img`. Press the
button and an address prompt appears; only YouTube addresses in the shapes
`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/v/` and `/live/` get through
(including the `www.`, `m.` and `music.` prefixes and `youtube-nocookie.com`) — the
judgment is made by parsing with `URL()`, not by looking for a substring, so an
address like `youtube.com.evil.test` is not caught by it.

The address that came in is never trusted as it stands: **only the 11-character
video id** is taken out and stored. The address itself is not kept — what remains is
`{"w":"youtube","a":{"v":"<id>","w":"70"}}`, and on the way out it is reassembled
into the single shape `https://www.youtube-nocookie.com/embed/<id>`.

For the same reason as `hr`, the caret does not go inside, and pressing Backspace or
Delete right before or right after it makes the whole thing disappear. An embed that
is not YouTube is **dropped entirely** on the way in — no unfamiliar document gets
stood up inside ours.

## The context row

Click a video and two fields appear.

| Group | Field |
|---|---|
| Width | six steps — `50` `60` `70` `80` `90` `100` (`70` by default) — a slider, with the value in force shown alongside |
| Address | a prompt, prefilled with the current video's id |

**There are no left / centre / right fields here.** A video's placement belongs to
the **wrapper paragraph** holding it rather than to the video, so the alignment
buttons on the main toolbar do that job. A newly inserted video stands in a wrapper
paragraph carrying centre alignment (`c`).

So on the way out the width lands on the video and the alignment on the paragraph
wrapping it.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

No inline `style` goes out. A host that wants to place one from its own UI calls the
commands directly — `applyCommand('insertYoutube', { v: address, w: '80' })`, or
`applyCommand('setYoutubeWidth', { w: '80' })` to change only the width. A width
outside the list is refused.

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
