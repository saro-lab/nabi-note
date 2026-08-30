---
title: সারণি
description: সারি ও কলাম তৈরি করুন, ঘর সম্পাদনা করুন এবং কলাম সাজানো সমর্থন করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# সারণি

সারণি তৈরি করতে টুলবার থেকে সারি ও কলাম বেছে নিন। ঘরের ভেতরে একাধিক অনুচ্ছেদের বদলে line break দিয়ে লেখা চলতে থাকে; Tab ও Shift+Tab পরের বা আগের ঘরে যায়।

সারি বা কলাম যোগা-মোছা, ঘর merge করা এবং header ঘর চালু বা বন্ধ করা নির্বাচিত ঘরগুলোর আশপাশে কাজ করে। সারণিকে sortable হিসেবে সংরক্ষণ করার পর প্রকাশিত দৃশ্যে কলাম সাজাতে `nabi-note/viewer` থেকে `attachViewer()` যুক্ত করুন। merge করা ঘরযুক্ত সারণি সাজানো হয় না।

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS শৈলী

`.nabi-content table` দিয়ে সারণি এবং `.nabi-content :is(th, td)` দিয়ে ঘর সাজান। viewer ঢোকানো ঘর কাঠামো বা sort বোতাম বদলাবেন না।

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

viewer যুক্ত থাকলে `.nabi-sort` বোতামটি রাখুন। ঘরের `position` বা ডান padding জোর করে override করলে sort বোতামের সঙ্গে ওভারল্যাপ হতে পারে।
