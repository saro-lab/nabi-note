---
title: ড্রপ ক্যাপ
---

# ড্রপ ক্যাপ

## বিবরণ

`dropCapWing` হলো একটি একক-মান অনুচ্ছেদ-অ্যাট্রিবিউট, যা অনুচ্ছেদে
`data-nabi-dropcap="1"` বসায়। নতুন কোনো ব্লক তৈরি করে না, বরং আগে থেকে থাকা
অনুচ্ছেদে কেবল চিহ্নটুকু বসায়।

- মান একটিই — চালু/বন্ধ। বোতামে আবার চাপলে অ্যাট্রিবিউট খসে যায়।
- **কতগুলো লাইন জুড়ে থাকবে তা ঠিক করার কোনো অপশন বা ভেরিয়েবল নেই।** কোরের
  স্টাইলশিটের `::first-letter` নিয়মটিই আকার বেঁধে দেয় —
  `font-size: 5.9em; line-height: .83`। অক্ষরটি সত্যিই কতটা জায়গা নেবে তা
  ঠিক করে সেই অনুচ্ছেদের লাইন-উচ্চতা।
- এটি কেবল প্রথম অক্ষরেই বসে বলে Enter এই অ্যাট্রিবিউটকে মার্কের মতোই ধরে —
  অনুচ্ছেদ দুই ভাগ হলে দুই দিকে নকল না হয়ে সেই অক্ষরকেই অনুসরণ করে।

আকার বদলাতে চাইলে সেই নিয়মটাই ওভাররাইড করতে হয়।

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
