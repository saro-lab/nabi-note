---
title: বুলেট তালিকা
description: একাধিক আইটেম ক্রম ছাড়াই সাজান।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# বুলেট তালিকা

একাধিক আইটেম ক্রম ছাড়াই সাজানোর তালিকা। খালি অনুচ্ছেদে `-`-এর পরে Space লিখুন, অথবা টুলবার থেকে বদলান। নির্বাচিত অনুচ্ছেদও একবারে তালিকায় বাঁধা যায়।

তালিকার ভেতরে Tab দিয়ে এক ধাপ ভেতরে নিন এবং Shift+Tab দিয়ে বাইরে আনুন। Enter পরের আইটেম বানায়; খালি আইটেমে আবার Enter চাপলে তালিকা শেষ হয়।

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
