---
title: বোল্ড
description: নির্বাচিত লেখা বোল্ড করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# বোল্ড

নির্বাচিত লেখা বোল্ড করে। একই পরিসরে আবার প্রয়োগ করলে ফরম্যাটিং সরিয়ে যায়। সংরক্ষিত ডকুমেন্টে mark লেখার সঙ্গে থাকে।

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
