---
title: আন্ডারলাইন
---

# আন্ডারলাইন

## বিবরণ

`underlineWing` হলো `<u>`-এর মালিক (claim)।

- স্বীকৃত ট্যাগ একটিই — `<u>`। বেরোনোর সময়ও সব সময় `<u>` এবং কোনো অ্যাট্রিবিউট
  টিকিয়ে রাখা হয় না। **`<ins>` গ্রহণ করা হয় না** — খোলস খসে গিয়ে শুধু লেখা থাকে।
  গাঢ় (`<b>`·`<strong>`) বা কাটাকাটি (`<s>`·`<strike>`·`<del>`)-র মতো জোড়া নিয়ে
  গ্রহণ করা মার্ক এটি নয়।
- হিন্ট মোডের শর্টকাট `U`, অ্যাক্সিলারেটর `Ctrl`/`⌘`+`U` (`mod+u`)।
- লেখা নির্বাচিত অবস্থায় চাপলে এটি টগল।
- আন্ডারলাইন আর লিঙ্ক পর্দায় দেখতে এক রকম হয়ে যেতে পারে, তবু এরা আলাদা wing-এর
  (`a`) মালিকানাধীন আলাদা মার্ক — একই লেখায় দুটোই একসঙ্গে বসতে পারে।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
