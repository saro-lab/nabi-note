---
title: সংখ্যাযুক্ত তালিকা
---

# সংখ্যাযুক্ত তালিকা

## বিবরণ

`orderedListWing` (নাম `ol`, শর্টকাট `N`) `<ol>`-এর মালিক। আইটেম `parts`-এর
মাধ্যমে সঙ্গেই আসে বলে `oli` আলাদা করে নিবন্ধন করতে হয় না — এটি অ্যারে নয়,
একটি রেকর্ড।

```ts
parts: { oli: { holds: 'blocks' } }
```

বোতাম চাপলে ক্যারেট যে ব্লকে আছে (বা নির্বাচনের আওতায় পড়া ব্লকগুলো) সেটিকে
সংখ্যাযুক্ত তালিকায় মুড়ে দেয়, আর আবার চাপলে খুলে যায়। অন্য তালিকা বোতাম চাপলে
সেই ধারায় পাল্টে যায়।

লাইনের শুরুতে একটি সংখ্যা আর একটি বিন্দু লিখে স্পেস চাপলেও (`1. `) একই ফল।
**শুরু হিসেবে যেকোনো সংখ্যা গ্রাহ্য, তবে অঙ্কের সংখ্যা নয়টির বেশি নয়**
(`1234567890. ` ধরা পড়ে না), আর বিন্দুর পরে আরও কিছু জুড়ে থাকলে (`1.2 `-এর মতো)
ধরা পড়ে না। খালি লাইন থাকার দরকার নেই — যা মাপা হয় তা শুধু ক্যারেটের আগের
লাইন-শুরুটুকু, আর এটি ধরা পড়ে কেবল অনুচ্ছেদের প্রথম লাইনে।

- `Tab`/`Shift+Tab` দিয়ে ভিতরে-বাইরে সরানো, খালি আইটেমে Enter দিয়ে তালিকা
  শেষ করা, আইটেমের শুরুতে Backspace দিয়ে আগের আইটেমের সঙ্গে মেশানো — সবই
  [বুলেট তালিকা](./bullet-list)-র মতোই।
- সংখ্যা সংরক্ষিত মানে ঢোকে না — `<ol>` নিজেই সেটি আঁকে বলে আইটেম গুঁজলে বা
  মুছলে ব্রাউজার নিজেই আবার গুনে বসায়।
- নেস্টিংও সত্যিকারের মার্কআপ হিসেবে সংরক্ষিত মানে তেমনই থেকে যায়। আইটেম ব্লক
  ধরে রাখে বলে লেখা একটি অনুচ্ছেদ পরে, আর নেস্ট করা তালিকা একটি র‍্যাপার
  অনুচ্ছেদের ভিতরে বসে।
- `start`·`type`-এর মতো অ্যাট্রিবিউট টিকে থাকে না। তাই `start="5"` নিয়ে ঢোকা
  তালিকাও ১ থেকে নতুন করে গোনে।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
