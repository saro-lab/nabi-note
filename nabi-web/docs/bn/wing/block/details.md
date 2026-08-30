---
title: বিস্তারিত
description: সারসংক্ষেপ ও মূল অংশ একত্র করুন, এবং শুরুতে খোলা থাকবে কি না সংরক্ষণ করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# বিস্তারিত

সংক্ষিপ্ত সারাংশ ও মূল অংশকে একটি ব্লকে রাখুন। টুলবার থেকে এটি তৈরি করলে আগে সারাংশ লেখেন, তারপর নিচে মূল লেখা চালিয়ে যান।

ত্রিভুজ দিয়ে ঠিক করা খোলা অবস্থা নথিতে সংরক্ষিত হয় এবং প্রকাশিত দৃশ্যের প্রাথমিক অবস্থা হয়। সম্পাদনার সময় বদলানোর সুবিধার জন্য মূল অংশ খোলা থাকে, তবে সংরক্ষিত অবস্থার মান বজায় থাকে।

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS শৈলী

`.nabi-content details` দিয়ে বিস্তারিত ব্লক এবং `.nabi-content details > summary` দিয়ে শিরোনাম সাজান।

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` attribute হলো লেখকের সংরক্ষিত প্রাথমিক খোলা অবস্থা। CSS দিয়ে এই অবস্থা সাজানো যায়, কিন্তু অবস্থাটিকেই জোর করে বদলানো ভালো নয়।
