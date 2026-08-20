---
title: চেকলিস্ট
---

# চেকলিস্ট

## বিবরণ

`taskListWing` (নাম `tl`, শর্টকাট `K`) বুলেট তালিকার সঙ্গে ট্যাগ (`<ul>`)
ভাগাভাগি করলেও এটি আলাদা বাস্তবায়ন — বেরোনোর সময় `data-nabi-list="task"` দিয়ে
চেকলিস্ট বোঝানো হয়, আর প্রতিটি আইটেমে `data-nabi-checked` দিয়ে টিক-অবস্থা।

আইটেম `parts` দিয়ে সঙ্গেই আসে — এটি অ্যারে নয়, একটি রেকর্ড।

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

সংরক্ষিত মানে টিক হলো `ck`, আর মান একটিই — `1`। বন্ধ অবস্থা `0` নয় — **ঘরটাই
আদৌ থাকে না**। বেরোনো HTML-এ সেটি `data-nabi-checked="true"`/`"false"` হয়ে
খোলে।

বোতাম চাপলে ক্যারেট যে ব্লকে আছে (বা নির্বাচনের আওতায় পড়া ব্লকগুলো) সেটিকে
চেকলিস্টে মুড়ে দেয়। লাইনের শুরুতে `[ ] ` বা `[x] ` (বড়-ছোট হাতের হেরফেরে কিছু
যায় আসে না) লিখলেও ফল একই, আর কোনটি লিখেছেন তার উপর নির্ভর করে আইটেমটি শুরু
থেকেই টিক দেওয়া অবস্থায় শুরু হয়। খালি লাইন থাকার দরকার নেই, আর এটি ধরা পড়ে
কেবল অনুচ্ছেদের প্রথম লাইনে।

চেকবক্সটি `<input>` নয়, CSS দিয়ে আঁকা একটি চিহ্ন — `contenteditable`-এর ভিতরে
সত্যিকারের input রাখলে ক্যারেট জট পাকিয়ে যায় বলেই। চালু থাকা ঘর হলো জোরালো
রঙের টাইলের উপর সাদা ✕, আর সেই লাইনটি ফিকে হয়ে যায় এবং তার উপর দিয়ে একটি
আড়াআড়ি রেখা টানা হয়।

**চালু-বন্ধ করার জায়গা ঘরটিই** — আইটেমের শুরুর সরু ফালিতে (প্রায় এক অক্ষরের
মাপ) চাপলে তবেই বদলায়, লেখার দিকে চাপলে ক্যারেটই যায়। ডান থেকে বাঁয়ে লেখা
ভাষায় সেই ফালি উল্টো দিকে থাকে। এই কাজ wing নিজেই `attach` দিয়ে ধরে রাখে বলে
**আলাদা করে mount করার কিছু নেই।**

`Tab`/`Shift+Tab` দিয়ে ভিতরে-বাইরে সরানো, খালি আইটেমে Enter দিয়ে তালিকা শেষ
করা — সবই [বুলেট তালিকা](./bullet-list)-র মতোই।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
