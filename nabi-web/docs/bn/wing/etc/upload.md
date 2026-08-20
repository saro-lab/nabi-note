---
title: ফাইল আপলোড
---

# ফাইল আপলোড

## বিবরণ

আপলোড তিন টুকরায় ভাগ করা — শুধু wing নিবন্ধন করলে কিছুই ঘটে না।

1. **`uploadWing`** — টুলবারে ফাইল বাছাইয়ের বোতাম বসায়। এই wing নিজে `img`
   বা `a` কিছুই বানায় না — আপলোড হওয়া ফাইল ছবি বা লিঙ্ক wing-এর আঁকা রূপেই
   কমিট হয়, তাই ফল নথিতে টিকে থাকতে হলে **`imageWing` বা `linkWing`
   অবশ্যই সঙ্গে নিবন্ধন করতে হবে**। দুটোর একটাও না থাকলে **নিবন্ধনের
   মুহূর্তেই ব্যতিক্রম ঘটে** (দেরিতে ফাটে না)।
2. **`mountUpload({ … })`** — আসলেই ফাইল গ্রহণ করে `uploader` চালানোর অংশ।
   ড্রপ·পেস্ট·ফাইল বাছাই — সবই এখানে এসে জড়ো হয়। **এই mount বাদ দিলে বোতাম
   থাকলেও কিছুই ঘটে না।**
3. **`mountUploadView({ … })`** — অগ্রগতির প্লেসহোল্ডার পর্দায় বসায়। এটি না
   থাকলেও আপলোড হয়, তবে আপলোড চলাকালীন পর্দা কিছুই বলে না।

`uploader`-এর চেহারা `(task) => Promise<{ uri } | null>` — **ঠিকানা ফেরত
দিলে সফল, `null` দিলে ব্যর্থ**, তখন প্লেসহোল্ডার সরে যায়। `task.onProgress
(0~100)` দিয়ে অগ্রগতি জানায়, আর `task.signal` বাতিল হলে থেমে যায়।

সীমা তিনটি — `extensions`·`maxFileSize`·`maxTotalSize`, সবই ঐচ্ছিক (0 বা
বাদ দিলে কোনো সীমা নেই)। বাদ পড়া ফাইল আসে `onReject`-এ।

## আপলোডের পরে যা থেকে যায়

ছবি `imageWing`-এর ব্লক হয়ে, বাকি ফাইল `linkWing`-এর সংযুক্তি লিঙ্ক হয়ে
কমিট হয়।

- **সংযুক্তির নাম ফাইলের নাম নয়, একটি i18n লেবেল** — বাংলায় "সংযুক্তি"।
  ফাইলের নাম সচরাচর নথিতে রাখার পক্ষে বড্ড লম্বা, আর সবচেয়ে বড় কথা এটি
  বদলানোর মতো হতে হয়। নাম বদলাতে হলে ক্যারেট সেই লিঙ্কে রেখে [কনটেক্সট
  সারির নামের ঘরে](../inline/link) বদলাতে হয়।
- **এক্সটেনশন একটি চিহ্ন হিসেবে থেকে যায়** — `data-nabi-file="pdf"`। এই মান
  আসল ফাইলের নাম থেকে তোলা, আর স্টাইলশিট সেটিকে ব্যাজ হিসেবে আঁকে। নাম
  বদলালেও চিহ্ন সঙ্গে যায়।
- লিঙ্ক গ্রহণ করে না এমন ঠিকানা (`allowLocalUrls` চালু না করে আসা `blob:`
  ইত্যাদি) সাধারণ ফাইলনামে নেমে আসে — হোয়াইটলিস্ট এড়ানো হয় না।

## আপলোড চলাকালীন যা দেখা যায়

আপলোড চলার সময় সেই জায়গায় একটি অস্থায়ী বাক্স বসে — এটি কেবল সম্পাদকের DOM-এ
থাকে, নাবিট্রিতে নেই, তাই সংরক্ষিত মানে এক অক্ষরও থাকে না।

- **ছবির** বেলায় বাছাই করা ফাইল দিয়ে বানানো প্রিভিউ সঙ্গে সঙ্গেই ওঠে, আর
  তার উপর একটি গ্রিড ঢেকে রাখে। অগ্রগতি অনুযায়ী ঘর একটা একটা করে সরে গিয়ে
  স্পষ্ট হয়। ঘর সরার ক্রম প্রতিটি ফাইলে মিশিয়ে দেওয়া থাকে, তাই একসঙ্গে
  একাধিক ছবি তুললে একই ছাঁচ বারবার দেখা যায় না।
- **ছবি নয় এমন ফাইল** গ্রিড ছাড়াই 📎 আর "সংযুক্তি" লেবেল বসানো একটি বাক্স
  পায়, আর এক্সটেনশন বড় হাতের ব্যাজ (`PDF` ইত্যাদি) হয়ে সঙ্গেই ফোটে। প্রিভিউ
  আঁকতে না পারা ছবিও এখানেই পড়ে।
- অগ্রগতি বাক্সে `data-nabi-per` হয়ে বসে, স্টাইলশিট তা এঁকে দেখায়। আপলোড
  চলাকালীন প্রতিটি বাক্সে একটি বাতিল (×) বোতাম দাঁড়ায়, আর ব্যাচ চলার সময়
  সম্পাদনা লক থাকে।

## ব্যবহারের উদাহরণ

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// আপলোডের ফল টিকিয়ে রাখতে ছবি·লিঙ্ক wing থাকতেই হয় — নইলে এখানেই ব্যতিক্রম ঘটে
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// অগ্রগতির প্লেসহোল্ডার বসানোর অংশ — আগে বানিয়ে রেখে নিচে জুড়ে দেওয়া হয়
const view = mountUploadView({ nabi, surface, locale: 'bn' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'bn',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // এখানে আসল সার্ভারে তোলার কোড বসান। ঠিকানা ফেরত দিলে সফল, null দিলে ব্যর্থ
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // টুলবারের ফাইল বাছাই বোতাম যে ফাইল বাছে তা এখানেই এসে পড়ে
  onFiles: (files) => upload.take(files),
})
```

## ডেমো

এই সাইটে তোলার মতো সার্ভার নেই বলে `URL.createObjectURL()` দিয়ে বানানো
`blob:` ঠিকানাই ফিরিয়ে দেওয়ার ভান করে। ফল কেবল এই পাতাতেই থেকে যায়।

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
