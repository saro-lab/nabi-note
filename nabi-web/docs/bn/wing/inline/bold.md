---
title: গাঢ়
---

# গাঢ়

## বিবরণ

`boldWing` হলো `<b>`-এর মালিক (claim)। লেখা নির্বাচন করে টুলবারের **B** চাপলে,
কিংবা হিন্ট মোডে (Shift দুবার দ্রুত চেপে তারপর `B`) প্রয়োগ করলে সেই অংশটি গাঢ় হয়।

- ভিতরে আসার সময় `<b>` আর `<strong>` দুটোই স্বীকৃত, কিন্তু বেরোনোর সময় সব সময়
  একটিমাত্র `<b>` হয়ে বেরোয়। কোনো অ্যাট্রিবিউট টিকিয়ে রাখা হয় না — `class`·`style`·`data-*`
  ঝরে যায়, কেবল ট্যাগটুকু থাকে।
- হিন্ট মোডের শর্টকাট `B`, অ্যাক্সিলারেটর `Ctrl`/`⌘`+`B` (`mod+b`)।
- লেখা নির্বাচিত অবস্থায় চাপলে এটি টগল (`toggleMark`) — পুরোটা আগে থেকেই গাঢ় হলে
  খুলে যায়, নয়তো প্রয়োগ হয়। এই wing নিজস্ব কমান্ড রাখে না — বাটনের `action:
  { kind: 'mark' }` থাকায় সরাসরি কোরের `toggleMark`-এ যায়।
- নিবন্ধন না করলে `<b>`-এর খোলস খসে গিয়ে সাধারণ লেখায় নেমে আসে (নিবন্ধিত নয় এমন
  প্রতিটি ট্যাগেরই এই দশা — এটি nabi-র সর্বজনীন নিয়ম)।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
