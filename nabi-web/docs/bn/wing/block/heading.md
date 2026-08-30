---
title: শিরোনাম
description: অনুচ্ছেদকে শিরোনামে বদলান এবং স্তর ঠিক করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# শিরোনাম

অনুচ্ছেদকে শিরোনামে বদলান এবং স্তরও ঠিক করুন। টুলবারে শিরোনাম চালু করে H1 থেকে H6 বাছুন, অথবা খালি অনুচ্ছেদে `#` থেকে `######`-এর পরে Space লিখুন।

শিরোনাম আলাদা block ধরন নয়, অনুচ্ছেদে সংরক্ষিত একটি attribute। শিরোনামে আবার চাপলে সাধারণ অনুচ্ছেদে ফিরে আসে, তাই মূল লেখার কাঠামো রেখে শুধু স্তর বদলানো যায়।

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
