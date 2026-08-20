---
title: CDN দিয়ে ব্যবহার
description: CDN উদাহরণ
---

# CDN দিয়ে ব্যবহার

<CdnDemo />

---

## এইমাত্র কী করা হলো

না পড়লেও উপরের ফাইলটা চলে। কিছু বদলাতে চাইলে তবেই দেখুন।

### দুটো ট্যাগই ইনস্টল

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

প্যাকেজ যা যা এক্সপোর্ট করে **সবকিছুই** একটিমাত্র গ্লোবাল `NabiNote`-এ ঝোলানো
থাকে। **স্টাইলশিট নিজে হাতে জুড়তে হয়** — mount CSS ইনজেক্ট করে না, তাই
`<link>` বাদ পড়লে সম্পাদক খালি গায়ে দেখাবে।

### কাঠামো

```html
<div id="app" class="nabi">                    <!-- রং·কোণা·ফন্ট যেখানে বাস করে সেই রুট -->
  <div id="chrome" class="nabi-toolbar">        <!-- টুলবার আর কনটেক্সট সারি একসঙ্গে জোড়া -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- প্রিভিউ·ফুলস্ক্রিন (ডান প্রান্তে) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- ক্যারেট যা ধরে আছে তার উপর নির্ভর করে নিজে থেকেই ভরে যায় -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

`id` যেকোনো নাম দিয়ে দিলেই চলে — mount-এ যা পাঠানো হয় তা **এলিমেন্ট**, নাম
নয়। চারটি ক্লাস (`nabi`·`nabi-toolbar`·`nabi-toolbar-row`·`nabi-content`)
স্টাইলশিট ধরে রাখার হাতল বলে সেগুলো যেমন আছে তেমনই থাকুক। প্রিভিউ·ফুলস্ক্রিন
লাগবে না এমন হলে `<span id="tools">` আর `mountViewTools` লাইনটাও একসঙ্গে
মুছে দিলেই হয় — **টুলবারের ভিতরে রাখবেন না।** সেই জায়গাটা ডান দিকে ভাসিয়ে
রাখার জন্য, বোতামের মাঝে ঢুকলে সারিটা এলোমেলো হয়ে যায়।

### wing বাছাই

`defaultWings`-এ ঊনত্রিশটি ডিফল্ট wing থাকা একটি তালিকা। উপরের ফাইলে
কেবল আপলোড বাদ দেওয়া হয়েছে। যা দরকার শুধু সেটুকুই বাছতে চাইলে নাম ধরে
লিখলেই হয়।

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

প্রতিটি wing আলাদা করে দেখা যায় [{{ t('menu_wing') }}](../wing/inline/bold)-এ।

### মান বের করা

| | |
|---|---|
| `nabi.getHtml()` | সংরক্ষণ·প্রকাশের HTML |
| `nabi.getJson()` | নাবিট্রি (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | আবার বসানো |
| `nabi.onChange(fn)` | মান বদলালেই |
| `N.renderStoredHtml(json, registry)` | সংরক্ষিত রূপ সম্পাদক ছাড়াই HTML-এ (নিচে [দেখার পক্ষ](#দেখার-পক্ষ)) |

---

## ঠিকানা

সংস্করণ আটকে রাখতে চাইলে ঠিকানায় সংস্করণ নম্বর জোড়া হয়। unpkg-ও একই ফাইল দেয়।

**সংস্করণ না লেখা ঠিকানা (`/npm/nabi-note`) ব্যবহার করবেন না** — jsDelivr
সেই জায়গাটা অনেকক্ষণ ক্যাশ করে রাখে বলে বান্ডেল আর স্টাইলশিট ভিন্ন
সংস্করণে মিশে যেতে পারে।

| | ঠিকানা |
|---|---|
| **বান্ডেল (সর্বশেষ)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **বান্ডেল (আটকানো)** | <code>{{ CDN_BUNDLE }}</code> |
| **স্টাইলশিট (সর্বশেষ)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **স্টাইলশিট (আটকানো)** | <code>{{ CDN_SHEET }}</code> |
| **বান্ডেল** (unpkg) | `https://unpkg.com/nabi-note` |

বান্ডেল npm প্যাকেজের ভিতরেই থাকে বলে **CDN-এর জন্য আলাদা কোনো প্রকাশনা
নেই।**

---

## দেখার পক্ষ

সংরক্ষিত HTML **কেবল দেখানোর পাতা** সম্পাদক দাঁড় করায় না। একই স্টাইলশিট
জুড়ে `.nabi-content`-এর ভিতরে মান বসালেই সম্পাদকে যেমন দেখাত ঠিক তেমনই
বেরোয়।

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- getHtml() দিয়ে সংরক্ষণ করা মান -->
</div>
```

একটিমাত্র স্টাইলশিট ফাইলে **সব wing-এর CSS-ই আছে** — কোন wing নিবন্ধিত
তা ফাইলটির জানার উপায় নেই বলে সবটাই বহন করে।

HTML নয়, **নাবিট্রি (JSON) হিসেবে সংরক্ষণ করা থাকলে** সম্পাদক দাঁড় না করিয়েই
সেই জায়গায় আঁকা যায়। যা লাগে তা সংরক্ষিত রূপ আর নিবন্ধিত wing তালিকা — দুটোই।

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['মন্তব্যের একটা লাইন'] }]   // সার্ভার থেকে পাওয়া নাবিট্রি
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

নাবিট্রি না হলে `null` দেয়, আর পার হওয়া মান সম্পাদক যা দেয় (`getHtml()`) তার সঙ্গে
একটা অক্ষরও আলাদা নয় — XSS ছাঁকা পড়ার জায়গাও একই। এই দরজা DOM ব্যবহার করে না বলে
সার্ভারেও (Node.js) সেভাবেই চলে, তাই **HTML সার্ভারে আগেভাগে বানিয়ে পাঠানোর পথ**
একই দরজা দিয়ে খোলে ([{{ t('menu_intro_ssr') }}](./ssr#শুধু-সংরক্ষিত-রূপ-আঁকার-জায়গা-সম্পাদক-দাঁড়-করাই-না) দেখুন)।

---

## পরের নথি

- [{{ t('menu_intro_usage') }}](./usage) — npm দিয়ে জোড়ার পথ, জোড়া লাগানো·ইনপুট·আউটপুট পুরোটা
- [{{ t('menu_wing_custom') }}](../wing/custom) — না-থাকা ফরম্যাট নিজেই বানানো

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// সংস্করণ নম্বর হাতে লেখা হয় না — nabi-npm-এর package.json থেকেই সরাসরি পড়া হয়
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
