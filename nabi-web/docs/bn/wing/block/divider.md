---
title: ডিভাইডার
---

# ডিভাইডার

## বিবরণ

`dividerWing` (নাম `hr`) একটি `<hr>`-এর মালিক। **`place: 'void'`** — ভিতরে
কিছু ধরে না এমন বস্তু বলে ক্যারেট তার ভিতরে ঢোকার জায়গা নেই। ডিভাইডারের ঠিক
আগে বা পরে দাঁড়িয়ে Backspace·Delete চাপলে সেই ব্লকটি গোটাই মুছে যায়, আর
নির্বাচন করে রেখেও একই ফল।

বোতাম চাপলে ডিভাইডার **নিজের র‍্যাপার অনুচ্ছেদ পরেই** দাঁড়ায়। সঙ্গে একটি খালি
অনুচ্ছেদ তৈরি হয় না — ক্যারেট সেই র‍্যাপার অনুচ্ছেদের উপরে, ডিভাইডারের ঠিক
পরে বসে।

কোথায় দাঁড়াবে তা ঠিক হয় ক্যারেট থাকা অনুচ্ছেদে লেখা আছে কি না তার উপর।

| ক্যারেট যেখানে ছিল | ফল |
|---|---|
| লেখাসহ অনুচ্ছেদ | সেই অনুচ্ছেদের **পরে** দাঁড়ায় |
| খালি অনুচ্ছেদ | সেই অনুচ্ছেদটিকে **বদলে নেয়** — খালি লাইন একটাও থেকে যায় না |

খালি অনুচ্ছেদ বদলে নেওয়ার সময় সেই অনুচ্ছেদে যে সারিবদ্ধতা ছিল তা টিকে থাকে।

লাইনের শুরুতে তিন বা তার বেশি হাইফেন (`---`) লিখে Enter চাপলেও একই ফল — এই
স্বয়ংক্রিয় রূপান্তরের **ট্রিগার Enter**।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
