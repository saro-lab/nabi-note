---
title: সারিবদ্ধতা
description: অনুচ্ছেদ ও object block-এর অনুভূমিক সারিবদ্ধতা বদলান।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# সারিবদ্ধতা

বর্তমান অনুচ্ছেদ, বা নির্বাচিত পরিসরের অনুচ্ছেদগুলোকে বামে, কেন্দ্রে বা ডানে সারিবদ্ধ করুন। ছবি, ভিডিও ও সারণির মতো অনুচ্ছেদের ভেতরে থাকা object ওই মোড়ক অনুচ্ছেদের মাধ্যমেই সারিবদ্ধ হয়।

সারিবদ্ধতা text formatting হিসেবে নয়, অনুচ্ছেদের attribute হিসেবে সংরক্ষিত হয়। code block সারিবদ্ধতার বাইরে, কারণ সেখানে indentation নিজেই অর্থবহ।

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
