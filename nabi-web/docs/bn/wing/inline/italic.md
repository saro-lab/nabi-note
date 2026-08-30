---
title: ইটালিক
description: নির্বাচিত লেখা ইটালিক করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ইটালিক

নির্বাচিত লেখা ইটালিক করে। একই পরিসরে আবার প্রয়োগ করলে ফরম্যাটিং সরিয়ে যায়, এবং mark সংরক্ষিত ডকুমেন্টে থাকে।

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
