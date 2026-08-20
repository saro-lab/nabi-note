---
title: স্ট্রাইকথ্রু
---

# স্ট্রাইকথ্রু

## বিবরণ

`strikeWing` হলো `<s>`-এর মালিক (claim)। মুছে ফেলা হয়েছে অথচ চোখের সামনে
রেখে দিতে চান — এমন মানের জন্য এটি ব্যবহার করা হয়।

- ভিতরে আসার সময় `<s>`·`<strike>`·`<del>` তিনটিই স্বীকৃত, বেরোনোর সময় সব সময়
  `<s>`। কোনো অ্যাট্রিবিউট টিকিয়ে রাখা হয় না — `<del datetime="…">`-এর
  সময়টুকুও থাকে না।
- হিন্ট মোডের শর্টকাট `S`। **অ্যাক্সিলারেটর নেই** — একই `emphasis` দলের
  গাঢ়·তির্যক·আন্ডারলাইনের মতো `Ctrl`/`⌘` জোড়া এর সঙ্গে বাঁধা নেই।
- লেখা নির্বাচিত অবস্থায় চাপলে এটি টগল।
- নিবন্ধন না করলে `<s>`-এর খোলস খসে গিয়ে সাধারণ লেখায় নেমে আসে।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
