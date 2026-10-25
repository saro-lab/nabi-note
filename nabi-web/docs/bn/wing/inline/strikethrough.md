---
title: স্ট্রাইকথ্রু
description: নির্বাচিত লেখার ওপর কাটারেখা দিন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# স্ট্রাইকথ্রু

নির্বাচিত লেখার মাঝখান দিয়ে একটি রেখা টানে। পরিবর্তিত বক্তব্য বা আর প্রযোজ্য নয় এমন তথ্য না মুছে দৃশ্যমান রাখতে এটি ব্যবহার করা যায়। একই অংশে আবার প্রয়োগ করলে বিন্যাসটি সরে যায়।

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
