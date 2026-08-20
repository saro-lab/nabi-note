---
title: শিরোনাম
---

# শিরোনাম

## বিবরণ

`headingWing` (id `h`) **একটাই** ছয়টি স্তর ধরে রাখে। শিরোনাম আলাদা নোড নয়,
বরং **অনুচ্ছেদের একটি অ্যাট্রিবিউট** — সংরক্ষিত মান
`{"w":"p","a":{"h":2}}`, আর বেরোনোর সময় `<h2>` হয়ে যায়।

অনুচ্ছেদই যেহেতু শিরোনাম হয়ে দাঁড়ায়, তাই সারিবদ্ধতা·ড্রপ ক্যাপের মতো অন্য
অনুচ্ছেদ-অ্যাট্রিবিউটও সঙ্গে বসতে পারে (`<h2 data-nabi-align="c">`)।

## টুলবারে একটাই, স্তর কনটেক্সট সারিতে

**টুলবারের বোতাম একটিই — `H`।** অনুচ্ছেদে দাঁড়িয়ে চাপলে সেটি শিরোনাম ১ হয়ে
যায়, আর ক্যারেট শিরোনামের ভিতরে থাকলে কনটেক্সট সারিতে `শিরোনাম`·`H1`~`H6`
ঘর ওঠে — এখন কোন স্তরে আছেন তা চাপা ঘর দেখেই বোঝা যায়, আর অন্য ঘর চাপলে সেই
স্তরে সরে যাওয়া হয়। `শিরোনাম` ঘরে চাপলে অনুচ্ছেদে ফিরে আসে।

খালি লাইনে স্তরের সংখ্যা অনুযায়ী `#` (২ স্তরের জন্য `##`) লিখে স্পেস চাপলে
সেটি স্বয়ংক্রিয়ভাবে সেই স্তরের শিরোনাম হয়ে যায় — লেখা `#` আর স্পেসটুকু
মুছে যায়।

## ব্যবহারের উদাহরণ

স্তর বাছার প্যানেল আঁকে `mountContextToolbar`।

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

কমান্ড দিয়েও সরাসরি বসানো যায়।

```ts
nabi.applyCommand('setHeading', { value: 2 })  // ২ স্তরের শিরোনামে
nabi.applyCommand('setHeading', { value: 2 })  // একই স্তরে আবার — অনুচ্ছেদে ফিরে আসে
```

একাধিক অনুচ্ছেদ ধরে বসালে **আওতায় পড়া সব অনুচ্ছেদেই** বসে। টেবিল·তালিকার
মতো অনুচ্ছেদের জায়গা নেওয়া বস্তু বাদ পড়ে যায় — শিরোনাম যেহেতু লেখা-অনুচ্ছেদের
অ্যাট্রিবিউট।

## ডেমো

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
