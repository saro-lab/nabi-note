---
title: টাইপফেস
---

# টাইপফেস

## বিবরণ

`typefaceWing` (নাম `tf`) একটি **ইনলাইন মান-মার্ক।** আগে থেকে প্রস্তুত
কনস্ট্যান্ট বলে অ্যারেতে বসিয়ে দিলেই হয়, দেওয়ার মতো কোনো অপশন নেই।
বেরোনোর সময় `<span data-nabi-typeface="serif">` হয়ে আঁকা হয়।

মান চারটি — `sans`·`serif`·`mono`·`cursive` (`TYPEFACES`)।

- **একটাও ফন্টের নাম নিজে ধরে রাখে না।** যা বাছা হয় তা **ধরন**, আসলে
  কোন ফন্ট বেরোবে তা ঠিক করে হোস্ট `--nabi-font`·`--nabi-font-serif`·
  `--nabi-font-mono`·`--nabi-font-cursive` — এই চার টোকেনে যা বসিয়েছে
  তা-ই।
- চারটি ধরনই **একটিমাত্র wing** ধরে রাখে। বাছার জায়গা কনটেক্সট সারির
  চারটি ঘর (`select`), আর ঢোকার পথ হিসেবে একটিমাত্র টুলবার বোতাম আছে।
  বোতাম চাপলে `serif` বসে।
- **কিছুই বসানো নেই এমন লেখা `--nabi-typeface-base` পরে থাকে।** এই
  টোকেনই সম্পাদকের গোটা পটভূমির ফন্ট, আর না ছুঁলে `--nabi-font` অনুসরণ
  করে। "ডিফল্ট" বাছার আলাদা কোনো ঘর নেই — বসানো ধরনটাই **আবার বাছলে
  খুলে গিয়ে** সেই জায়গায় ফিরে আসে।
- বাছার ঘরগুলো **নিজেদের নির্দেশিত রূপেই** আঁকা হয়। সেরিফ ঘর সেরিফে,
  মনোস্পেস ঘর মনোস্পেসে লেখা বলে নাম না জানলেও কী বাছা হচ্ছে তা দেখা
  যায়।
- **কেবল ক্যারেট থাকলে সেই গোটা অনুচ্ছেদে** বসে। একটি অক্ষরও নেই এমন
  অনুচ্ছেদে সংরক্ষিত থেকে যায়, পরে যা টাইপ করা হবে তা-ই সেই টাইপফেস
  নিয়ে বেরোবে।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

হোস্ট বসানো ফন্ট একটি CSS ঘরই। একটি ধরনে একাধিক ফন্ট পরপর সাজিয়ে রাখলে
ব্রাউজার প্রতিটি অক্ষরের জন্য সামনে থেকে খুঁজে সেই অক্ষর ধরা প্রথম
ফন্ট দিয়ে আঁকে, তাই যে ভাষাতেই লেখা হোক সেই ধরনের রূপ বজায় থাকে।

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans Bengali', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif Bengali', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Baloo Da 2', cursive;
}
```

## ডেমো

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
