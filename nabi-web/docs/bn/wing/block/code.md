---
title: কোড
---

# কোড

## বিবরণ

`codeWing` (নাম `code`) কোড ব্লকের (`<pre>`) মালিক এমন একটি **কনস্ট্যান্ট** —
বন্ধনী দিয়ে ডাকা হয় না।

`holds: 'inline'` ধরনের একটি বাক্স, আর ভিতরটা `repair` সাধারণ লেখা হিসেবে
ধরে রাখে — মার্ক বা অন্য কোনো wing সেখানে ঢুকতে পারে না। এমন কোনো আলাদা ঘর
চুক্তিতে নেই, বরং wing নিজেই নিজের ভিতরটা গুছিয়ে রাখে।

খালি লাইনে ` ``` ` লিখে স্পেস বা Enter চাপলে সেটি কোড ব্লক হয়ে যায় —
` ```ts `-এর মতো পরে ভাষার নাম জুড়ে দিলে সেই ভাষাটিও সঙ্গে ধরা পড়ে।
`Tab`/`Shift+Tab` দিয়ে লাইন ভিতরে ও বাইরে সরানো যায় (একাধিক লাইন নির্বাচন
করলে একসঙ্গে)। Enter আগের লাইনের ইনডেন্ট ধরে রাখে।

ক্যারেট কোডের ভিতরে থাকলে তবেই কনটেক্সট সারি ওঠে — ভাষা সরাসরি লেখার একটি
ইনপুট ঘর, "ভাষা নেই", আর প্রায়ই ব্যবহৃত ভাষাগুলোর ঘর।

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

এই তালিকাটি নিছক **সংক্ষিপ্ত পথ** — কোর যেসব ভাষা চেনে তার তালিকা নয়। এখানে
নেই এমন ভাষা প্রথম ঘরে সরাসরি লিখে দিলেই হয়, আর সেই মানটি হাইলাইটারের কাছে
যেমন আছে তেমনই চলে যায়।

## রং বসানো wing-এই গোঁজা হয়

`highlight` হলো **রং নয়, ধরন ফিরিয়ে দেওয়ার একটি হুক** — এর চেহারা
`(source, language) => {text, type?}[]`, আর `type` কেবল `keyword`·`string`·
`number`·`comment`·`function`·`class`·`variable`·`operator`·`punctuation`·
`tag`·`attribute`·`literal`·`regexp`·`meta` — এই চোদ্দটির একটি হতে পারে,
এটি নির্দিষ্ট করে বাঁধা (`CODE_TOKEN_TYPES`)।

রং ঠিক করে কোরের স্টাইলশিট, `[data-nabi-token="…"]` সিলেক্টর দিয়ে সরাসরি —
**কেবল পাঁচটিরই রং আছে** (`comment`·`string`·`keyword`·`number`·`literal`)।
বাকি ধরনগুলোতে চিহ্ন বসে ঠিকই, কিন্তু রঙের নিয়ম নেই বলে মূল লেখার রঙেই থেকে
যায়। মানটি CSS ভেরিয়েবল নয়, বাঁধা রং বলে, অন্য রং বা ডার্ক থিম চাইলে সেই
সিলেক্টর নিজেই ওভাররাইড করতে হয়।

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

সিনট্যাক্সের অভিধানটি নিজে প্যাকেজে নেই — Prism·highlight.js·Shiki-র মতো
কিছু আপনাকেই জুড়ে দিতে হবে।

রং বসানোর কাজ **wing-এই গোঁজা হয়** — আলাদা করে mount করতে হয় না।
`makeCodeAttach` দিয়ে `attach` বানিয়ে কোড wing-এ বদলে দিলে, `mountSurface`
সেটি জুড়ে দেয়। এই সাইটের ডেমোতে Shiki ঠিক এভাবেই জোড়া
(`.vitepress/src/highlight.ts`)।

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// wing একটি কনস্ট্যান্ট — শুধু জোড়ার কাজটুকুই (`attach`) বদলানো হয়
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

`version` একসঙ্গে দিলে **নথি একই আছে অথচ রং বসানোর দিকটা বদলে গেছে** এমন
সময়ে আবার রং বসায়। যে হাইলাইটার সিনট্যাক্স অ্যাসিনক্রোনাসভাবে নিয়ে আসে
(Shiki কোনো ভাষার সঙ্গে প্রথমবার দেখা হলে তা-ই করে) সেটিই এই ক্ষেত্র —
সিনট্যাক্স এসে পৌঁছালেও নথি বদলায়নি বলে `onChange` বাজে না, আর এটি না
থাকলে যেকোনো একটি অক্ষর বাড়তি লিখে দিলে তবেই রং বসে।

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// সিনট্যাক্স দেরিতে পৌঁছালে — সংখ্যা বাড়ালেই আবার রং বসে
grammarAge += 1
```

সংরক্ষিত মান বাইরের প্রচলিত রীতিই মেনে চলে —
`<pre data-nabi-lang="ts"><code class="language-ts">`, আর রং বেরোয়
`data-nabi-token` অ্যাট্রিবিউট হিসেবে (ইনলাইন `style` নয়)।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
