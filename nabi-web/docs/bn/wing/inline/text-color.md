---
title: লেখার রং
---

# লেখার রং

## বিবরণ

`textColorWing` (নাম `tc`) হলো `<span data-color="...">`-এর মালিক (claim)।
হাইলাইটের সঙ্গে একই ঘরানার — মান-বহনকারী ইনলাইন মার্ক, তাই চালু-বন্ধ করা নয়, রং
বেছে নেওয়া।

- **টুলবারের বোতাম (শর্টকাট `C`) সবুজ প্রয়োগ করে** — `setTextColor`-কে
  `{ c: 'green' }` পাঠায়। কোনো আর্গুমেন্ট ছাড়া চলা বোতাম নয়।
- তাই এই বোতামের টগল **সবুজের প্রতি টগল**। নির্বাচিত পুরো অংশ কেবল সবুজ হলেই
  খুলে যায়, অন্য রং বসানো থাকলে সবুজে বদলে যায়।
- ক্যারেট লেখার রঙের মার্কের ভিতরে থাকলে কনটেক্সট টুলবারে পাঁচটি রঙের নমুনা
  (swatch) ওঠে — চাপলেই সেখানেই কেবল রংটুকু বদলায় (মার্ক একটির উপর আরেকটি জমে
  না)। আলাদা কোনো "মুছুন" বোতাম এই wing-এর নিজের নেই — একই রঙে আবার চাপলে খুলে
  যায়, বাকিটা `clearFormatWing`-এর দায়িত্ব।
- **কেবল ক্যারেট রেখে বাছলে দুই ধারা।** মার্কের ভিতরে থাকলে সেই মার্ক যা ঢেকে
  রেখেছে তার পুরোটাই লক্ষ্য, মার্কের বাইরে থাকলে **সংরক্ষিত (reserved)** থেকে যায়
  আর পরে যা টাইপ করা হবে তা-ই সেই রং নিয়ে বেরোবে।
- সংরক্ষিত মানে কেবল রঙের নামটুকু থাকে — যেমন `data-color="green"`। ইনলাইন
  `style` বাইরে যায় না। রঙের মান ধরে রাখে কোরের টোকেন `--nabi-tc-*`, আর স্টাইলশিট
  হাইলাইটের সঙ্গে একই সেট ভাগ করে নেয়।
- ভিতরে আসার সময় (`claim`) কেবল সেই `<span>`-ই দেখা হয় যার `data-color`
  অ্যাট্রিবিউট আছে। `data-color` আদৌ নেই এমন `<span>`-এর দাবি এই wing করে না,
  খোলস খসে গিয়ে সাধারণ লেখায় নেমে আসে, **আর অ্যাট্রিবিউট থাকলেও মান তালিকার বাইরে
  হলে তখনও খোলস খসে যায়, কেবল লেখাটুকু থাকে।**
- হাতে ঠিক করা সংরক্ষিত মানের তালিকার বাইরের মানও `repair` খোলসসহ সরিয়ে দেয়।
- হাইলাইট থেকে এটি আলাদা মার্ক বলে একই লেখায় দুটোই একসঙ্গে বসানো যায় — হাইলাইটের
  স্টাইলশিট `color` না লেখাই তার কারণ।

| রঙের নাম | সংরক্ষিত মান |
|---|---|
| সবুজ | `green` |
| প্রবাল | `coral` |
| বেগুনি | `violet` |
| অ্যাম্বার | `amber` |
| নীল | `blue` |

এই পাঁচটি `TEXT_COLORS` হিসেবে রপ্তানি করা হয় — রঙের মান নয়, **নামের অ্যারে**
(`readonly string[]`)।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
