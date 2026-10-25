---
title: সাবস্ক্রিপ্ট
description: নির্বাচিত লেখাকে baseline-এর নিচে নামান।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# সাবস্ক্রিপ্ট

নির্বাচিত লেখাকে ভিত্তিরেখার নিচে ছোট আকারে দেখায়। রাসায়নিক সংকেত `H₂O`-এর মতো নিচের সূচক দরকার এমন লেখার জন্য উপযোগী। এই বিন্যাস সূত্রের গণনা যোগ করে না; লেখার রূপটি অক্ষুণ্ণ রাখতে ব্যবহার করুন।

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
