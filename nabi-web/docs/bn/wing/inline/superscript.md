---
title: সুপারস্ক্রিপ্ট
description: নির্বাচিত লেখাকে baseline-এর ওপরে তুলুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# সুপারস্ক্রিপ্ট

নির্বাচিত লেখাকে ভিত্তিরেখার ওপরে ছোট আকারে দেখায়। ঘাত বা পাদটীকার চিহ্নের জন্য ব্যবহার করা যায় এবং শুধু নির্বাচিত অংশে প্রযোজ্য হয়।

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
