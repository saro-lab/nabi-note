---
title: বিস্তারিত
---

# বিস্তারিত

## বিবরণ

`detailsWing` (নাম `details`, শর্টকাট `D`) ভাঁজ করা বাক্সের (`<details>` +
`<summary>`) মালিক। সারাংশ-লাইন `parts` দিয়ে সঙ্গেই আসে বলে আলাদা করে
নিবন্ধন করতে হয় না — এটি অ্যারে নয়, একটি রেকর্ড।

```ts
parts: { summary: { holds: 'inline' } }
```

বোতাম চাপলে ক্যারেট যেসব ব্লক জুড়ে আছে সেগুলো নতুন ভাঁজ-বাক্সে মুড়ে যায়, আর
একটি খালি সারাংশ-লাইন একদম উপরে বসে। সারাংশ-লাইনে Enter চাপলে বিষয়বস্তুতে
নেমে যায় (সারাংশ-লাইন নিজে ভাঙে না)।

**সম্পাদক ঠিক যা সংরক্ষিত হবে তা-ই আঁকে।** ভাঁজ করা অবস্থায় সংরক্ষিত বাক্স
সম্পাদকেও ভাঁজ করা থাকে, আর ত্রিভুজে চাপলে সেই জায়গাতেই খোলে-বন্ধ হয় — সেই
চাপাই সংরক্ষিত মান (`o`) বদলে দেয়। বন্ধ করার সময় ক্যারেট ভিতরে থাকলে ক্যারেট
বাক্সের বাইরে চলে আসে।

::: tip কনটেক্সট সারি নেই
আগে **খোলা অবস্থায় সংরক্ষণ** আর **বন্ধ অবস্থায় সংরক্ষণ** নামে দুটো বোতাম ছিল।
পর্দা সব সময় খোলাই আঁকত এমন দিনে কোন অবস্থায় সংরক্ষিত হবে তা বলার পথ সেটিই
ছিল। এখন পর্দা সংরক্ষিত মান যেমন তেমনই আঁকে আর ত্রিভুজ সেটি বদলায়, তাই একই কথা
দুবার বলার জায়গা হয়ে যাওয়ায় সেগুলো তুলে নেওয়া হয়েছে।
:::

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
