---
title: তির্যক
---

# তির্যক

## বিবরণ

`italicWing` হলো `<i>`-এর মালিক (claim)। অচেনা শব্দ বা উদ্ধৃতির মতো যেসব লেখার ধরন
আলাদা, সেগুলোর জন্য এটি ব্যবহার করা হয়।

- ভিতরে আসার সময় `<i>` আর `<em>` দুটোই স্বীকৃত, বেরোনোর সময় সব একটিমাত্র `<i>`-তে
  মিলে যায়। কোনো অ্যাট্রিবিউট টিকিয়ে রাখা হয় না।
- হিন্ট মোডের (Shift দুবার দ্রুত) শর্টকাট `I` — ফিজিক্যাল কী (`KeyI`) ধরে কাজ করে,
  তাই যেকোনো কীবোর্ড লেআউটেও চলে। অ্যাক্সিলারেটর `Ctrl`/`⌘`+`I` (`mod+i`)।
- লেখা নির্বাচিত অবস্থায় চাপলে এটি টগল।
- নিবন্ধন না করলে `<i>`-এর খোলস খসে গিয়ে সাধারণ লেখায় নেমে আসে।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
