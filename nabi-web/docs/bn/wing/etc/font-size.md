---
title: লেখার আকার
---

# লেখার আকার

## বিবরণ

`fontSizeWing` (নাম `fs`) একটি **ইনলাইন মান-মার্ক।** লেখার উপরে বসানো
ফরম্যাট, অনুচ্ছেদ-অ্যাট্রিবিউট নয়। বেরোনোর সময় `<span data-nabi-size="lg">`
হয়ে আঁকা হয়।

মান চারটি — `xs`·`sm`·`lg`·`xl`, আর ডিফল্ট আকার পঞ্চম কোনো মান নয়, বরং
**অ্যাট্রিবিউটটাই আদৌ না থাকা।**

- টাইপফেসের (`tf`) সঙ্গে জোড়া — একটি wing-ই সব মান ধরে রাখে, বাছার
  জায়গা কনটেক্সট সারি। তবে টাইপফেস চারটি ঘর সাজিয়ে রাখে, আকার একটি স্কেল
  ব্যবহার করে।
- **কনটেক্সট সারিতে এটি একটি স্কেল (`range`)।** আকার একটি ক্রমযুক্ত মান
  (ছোট → বড়) বলে ঘর সাজানোর বদলে একটিমাত্র হাতল দিয়ে টানা হয়। এখন
  বসানো মান হাতলের জায়গা দেখায়, আর লেবেলে সেই মানের নাম একসঙ্গে ওঠে।
- **স্কেলের একদম শুরুর ঘরটিই "ডিফল্ট"।** মাঝে না বসে শুরুতে বসার কারণ
  তালিকা ছোট থেকে বড় ক্রমে, আর তার আগেই "কিছুই বসানো নেই"-এর জায়গা।
  এই ঘরে সরালে `base`-এর মতো কোনো মান বসে না, বরং **মার্কই খুলে যায়।**
- **ঘরের লেবেল লোকেলভেদে বদলায়** — বাংলায় "ডিফল্ট · খুবই ছোট · ছোট ·
  বড় · খুবই বড়"।
- টুলবার বোতাম চাপলে **`lg` (বড়)** বসে। স্কেল ছোট থেকে শুরু বলে এমনিতে
  ছাড়লে প্রথম ঘর `xs` বসত, কিন্তু আকার বোতাম চেপে লেখা ছোট হয়ে যাক এমন
  কেউ চায় না বলে।
- **কেবল ক্যারেট থাকলে সেই গোটা অনুচ্ছেদে** বসে। আকার একটি শব্দ মাত্র
  বড় করা কম হয় বলে, পরিসর না ধরলে অনুচ্ছেদকেই লক্ষ্য করে (হাইলাইট·লেখার
  রং এর উল্টো — এখনকার মার্কের অংশটুকুই কেবল লক্ষ্য করে)।
- একটি অক্ষরও নেই এমন অনুচ্ছেদে চাপলে **সংরক্ষিত** থেকে যায় — পরে যা
  টাইপ করা হবে তা-ই সেই আকার নিয়ে বেরোবে।
- একই মান আবার বসালে খুলে যায়।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
