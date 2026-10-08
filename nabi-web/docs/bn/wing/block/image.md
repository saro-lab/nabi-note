---
title: ছবি
description: ছবির URL ঢোকান এবং প্রস্থ ও সারিবদ্ধতা ঠিক করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ছবি

ছবির URL ঢোকান এবং প্রস্থ ও সারিবদ্ধতা ঠিক করুন। ডিফল্টে ঠিকানা `http:`, `https:` বা একই সাইটের path-এ সীমিত থাকে, আর নতুন ছবি ৬০% প্রস্থে কেন্দ্রে শুরু হয়।

প্রস্থ কেবল নির্দিষ্ট ধাপে সংরক্ষিত হয় এবং ছবিকে ঘিরে থাকা অনুচ্ছেদে সারিবদ্ধতা থাকে। `blob:` বা `data:image/...` preview ব্যবহার করতে image wing এবং editor assembly উভয় জায়গায় local URL স্পষ্টভাবে অনুমতি দিন। SVG data URL অনুমোদিত নয়।

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

এই wing নথিতে ঠিকানা ঢোকায়; ফাইল আপলোড করে না। সার্ভারে ফাইল পাঠাতে [upload wing](/bn/wing/etc/upload) যুক্ত করুন।

## ছবি বাছাইয়ের উইন্ডো যুক্ত করা

ছবির বোতামের ডিফল্ট URL ইনপুট উইন্ডোর বদলে আপনার সেবার ছবি বাছাইয়ের উইন্ডো ব্যবহার করতে `mountToolbar()`-এ `panels.img` দিন। কী হলো টুলবারের স্লটের নাম; যেসব টুল উল্লেখ করা হয়নি, সেগুলোর ডিফল্ট উইন্ডো অপরিবর্তিত থাকে।

`mode: 'modal'` পুরো পৃষ্ঠা ঢেকে রাখা অর্ধস্বচ্ছ পটভূমির ওপর একটি উইন্ডো খোলে। `mode: 'inline'` কম্পিউটারে টুলের বোতামের কাছে এবং মোবাইলে পুরো পর্দাজুড়ে খোলে। ভিউপোর্টের প্রস্থ ও `--nabi-mobile-breakpoint` দিয়ে মোবাইল দৃশ্য নির্ধারিত হয়; `inline` প্যানেল খোলা অবস্থায় এই সীমা অতিক্রম করলে প্যানেল বন্ধ হয়ে যায়।

উভয় মোড কেবল একটি খালি `root` দেয়; শিরোনাম, ইনপুট ঘর বা বোতাম তৈরি করে না। `render`-এ নিজের HTML বা UI যোগ করুন, বন্ধ করার বোতাম `close()`-এর সঙ্গে এবং ছবি বাছাই `insertImage(url, 'pointer')`-এর সঙ্গে যুক্ত করুন। বিদ্যমান ফাংশনভিত্তিক সেটিং (`img: renderer`) আগের প্রদর্শন পদ্ধতি বজায় রাখে।

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker` হলো আপনার সেবায় বাস্তবায়ন করার একটি ফাংশন। এটি দেওয়া `root`-এর ভেতরে সমলয়ভাবে আপনার UI তৈরি করে এবং পরিষ্কার করার একটি ফাংশন ফেরত দেয়। ছবির তালিকা আনা বা আপলোডের মতো অসমলয় কাজে `signal` যুক্ত করুন এবং বেছে নেওয়া ছবির URL `onSelect`-এ দিন। এই API ফাইল পাঠায় না; ছবির URL অনুমোদনের বিদ্যমান নিয়মই প্রযোজ্য থাকে।

`insertImage(src, by?)` হলো `run('insertImage', { src }, by)`-এর সমতুল্য; ফেরত দেওয়া মান ও নির্বাচন পুনরুদ্ধারের নিয়মও একই। `by` বাদ দিলে `'keyboard'` ব্যবহৃত হয়। `render`-কে `async` ফাংশন করবেন না।

উইন্ডো বন্ধ করলে বা টুলবার আনমাউন্ট করলে `signal` বাতিল হয় এবং পরিষ্কার করার ফাংশনটি চলে। `run()` উইন্ডো বন্ধ করে এবং খোলার সময় সংরক্ষিত নির্বাচনে একবার কমান্ড প্রয়োগ করে। উইন্ডো আগেই বন্ধ হয়ে গেলে বা খোলার পর নথির বিষয়বস্তু বদলে গেলে, কমান্ড না চালিয়ে `false` ফেরত দেয়।

## CSS শৈলী

`.nabi-content img` দিয়ে ছবি সাজান। সংরক্ষিত প্রস্থ ও সারিবদ্ধতা অক্ষত রেখে কেবল সীমানা বা ছায়ার মতো দৃশ্যমান বিষয় বদলান।

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

`max-inline-size`, `block-size`, প্রস্থ ও সারিবদ্ধতার ডিফল্ট নিয়ম রাখুন। ছবির আকার নথিতে সংরক্ষিত, তাই স্থির CSS প্রস্থ চাপিয়ে দিলে লেখকের বাছা প্রস্থের সঙ্গে দ্বন্দ্ব হতে পারে।
