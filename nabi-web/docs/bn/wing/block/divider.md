---
title: বিভাজক রেখা
description: নথির প্রবাহ আলাদা করতে একটি আড়াআড়ি রেখা সন্নিবেশ করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# বিভাজক রেখা

নথির প্রবাহ আলাদা করা আড়াআড়ি রেখা। খালি অনুচ্ছেদে তিন বা বেশি hyphen লিখে Enter চাপুন, অথবা টুলবার থেকে সন্নিবেশ করুন।

বিভাজক অক্ষরবিহীন স্বতন্ত্র block, তাই এতে শিরোনাম বা রঙের মতো বিন্যাস রাখা যায় না। শুধু আগের ও পরের অনুচ্ছেদ আলাদা করতেই ব্যবহার করুন।

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
