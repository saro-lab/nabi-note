---
title: ফরম্যাটিং মোছা
---

# ফরম্যাটিং মোছা

## বিবরণ

`clearFormatWing` একটি **আগে থেকে প্রস্তুত কনস্ট্যান্ট।** অ্যারেতে বসিয়ে
দিলেই হয় — দেওয়ার মতো কোনো অপশন নেই।

`place: 'tool'` বলে নথিতে নিজের কোনো নোড বসায় না। একটিমাত্র কমান্ড
(`clearFormat`) আর একটিমাত্র টুলবার বোতামই সব।

- **যা যা সরানো হয় তার তালিকা কোরে বাঁধা।** এগারোটি ইনলাইন মার্ক
  (`b`·`i`·`u`·`s`·`sub`·`sup`·`hl`·`tc`·`fs`·`tf`·`a`) আর তিনটি অনুচ্ছেদ-
  অ্যাট্রিবিউট (`h` শিরোনাম · `a` সারিবদ্ধতা · `dc` ড্রপ ক্যাপ)। হোস্টকে
  এই তালিকা সামলাতে হয় না, আর নিজে বানানো wing-এর মার্ক **এখানে সরে না।**
- **পরিসর ধরে চাপলে** সেই অংশের মার্ক আর আওতায় পড়া অনুচ্ছেদগুলোর
  অ্যাট্রিবিউট একবারেই খুলে যায়।
- **কেবল ক্যারেট থাকলে একটি একটি স্তর করে** খোলে — ক্যারেট যেখানে আছে
  সেখান থেকে **সবচেয়ে ভিতরের মার্ক** থেকে শুরু করে, সেই মার্ক যতটা জুড়ে
  আছে ততটাই। খোলার মতো মার্ক না থাকলে তখন অনুচ্ছেদ-অ্যাট্রিবিউট সরানো
  হয়।
- **সংযুক্তি লিঙ্ক খোলে না** — `file` অ্যাট্রিবিউট লাগানো লিঙ্ক (`a`)
  কোথাও অলঙ্ঘনীয়। খোলস খসালে সংযুক্তি নিষ্প্রাণ সাধারণ লেখা হয়ে যেত বলে।
- **বস্তু ধরে রাখা অনুচ্ছেদের সারিবদ্ধতা থেকে যায়।** ছবি·টেবিল ধরে রাখা
  র‍্যাপার অনুচ্ছেদে কেবল সারিবদ্ধতাই (`a`) সরে না — ফরম্যাট মুছতে গিয়ে
  ছবি বাঁয়ে ছিটকে যাওয়া এভাবেই আটকানো হয়।
- খোলার মতো কিছু না থাকলে কমান্ড `null` ফিরিয়ে দেয়। undo-এর জায়গা জমে
  না।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
