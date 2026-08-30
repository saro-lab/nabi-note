---
title: স্ট্রাইকথ্রু
description: নির্বাচিত লেখার ওপর কাটারেখা দিন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# স্ট্রাইকথ্রু

নির্বাচিত লেখার ওপর কাটারেখা দেয়। একই পরিসরে আবার প্রয়োগ করলে ফরম্যাটিং সরিয়ে যায়, এবং mark সংরক্ষিত ডকুমেন্টে থাকে।

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
