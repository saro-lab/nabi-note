---
title: সুপারস্ক্রিপ্ট
description: নির্বাচিত লেখাকে baseline-এর ওপরে তুলুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# সুপারস্ক্রিপ্ট

ঘাত ও রেফারেন্স চিহ্নের জন্য নির্বাচিত লেখাকে baseline-এর ওপরে তোলে। আবার প্রয়োগ করলে ফরম্যাটিং সরিয়ে যায়।

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
