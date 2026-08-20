---
title: উদ্ধৃতি
---

# উদ্ধৃতি

## বিবরণ

`quoteWing` (নাম `quote`) উদ্ধৃতি বাক্সের (`<blockquote>`) মালিক। `place:
'container'` আর `holds: 'blocks'` — ভিতরে ব্লক থাকে। অন্য বস্তুর মতোই উদ্ধৃতি
নিজেও একটি র‍্যাপার অনুচ্ছেদ পরে সর্বোচ্চ স্তরে দাঁড়ায়।

**`allows` বসানো হয় না।** উদ্ধৃতির ভিতরটা সর্বোচ্চ স্তরের মতোই নিয়ম মানে, তাই
টেবিল বা ছবিও র‍্যাপার অনুচ্ছেদ পরে তার ভিতরে দাঁড়াতে পারে — এমন HTML পেস্ট
করলে বা লোড করলে তা অবিকৃত থাকে।

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["লেখা"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

তবে **বসানোর বোতাম উদ্ধৃতির ভিতরে ঢোকে না।** ছবি·টেবিল·ডিভাইডারের মতো যা
`insertLump` দিয়ে দাঁড়ায়, তারা সব সময় **সর্বোচ্চ স্তরে** জায়গা নেয়, তাই ক্যারেট
উদ্ধৃতির ভিতরে থাকলেও নতুন বস্তু উদ্ধৃতির **পরে** বসে। উদ্ধৃতির ভিতরে বসাতে
হলে পেস্ট করেই বসাতে হয়।

বোতাম চাপলে নির্বাচনের আওতায় পড়া সর্বোচ্চ-স্তরের ব্লক সবগুলোকে উদ্ধৃতিতে মুড়ে
দেয়। আওতায় পড়া সব ব্লক **আগে থেকেই উদ্ধৃতি** হলে তবেই খুলে যায় — মিশ্রিত হলে
পুরোটা আরেকবার মুড়ে দেয়।

লাইনের শুরুতে শুধু `>` লিখে স্পেস চাপলেও সেই লাইন উদ্ধৃতি হয়ে যায় — এই স্বয়ংক্রিয়
রূপান্তরের **ট্রিগার স্পেস** (Enter নয়)। কারণ এটি একই লাইনে চালিয়ে লেখার মতো।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
