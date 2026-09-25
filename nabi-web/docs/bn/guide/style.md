---
title: CSS থিম
description: CSS চলক দিয়ে সম্পাদক ও প্রকাশিত পর্দার রং, ফন্ট, আকার এবং অন্ধকার মোড ঠিক করুন।
---

# CSS থিম

NABI NOTE সম্পাদক ও প্রকাশিত পর্দায় একই CSS প্রয়োগ করে। package CSS একবার আনার পর service container-এ শুধু প্রয়োজনীয় CSS চলক ওভাররাইড করাই সবচেয়ে নিরাপদ পদ্ধতি।

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

সম্পাদক ও প্রকাশিত পর্দার সাধারণ parent-এ একই token রাখলে দুই পর্দার আবহ এক থাকে।

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## প্রায়ই বদলানো চলক

| কাজ | চলক |
| --- | --- |
| লেখা ও পটভূমি | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| রেখা ও জোরের রং | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| কোণ ও ছায়া | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| মৌলিক ফন্ট | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| সম্পাদনা এলাকা | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| স্থির টুলবার ও প্রাকদর্শন | `--nabi-sticky-top`, `--nabi-preview-width` |
| স্পর্শ পরিবেশ | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| মোবাইল মোডে যাওয়ার প্রস্থ | `--nabi-mobile-breakpoint` |

হাইলাইটার ও লেখার রং যথাক্রমে `--nabi-hl-<name>`, `--nabi-tc-<name>` দিয়ে বদলান। উদাহরণ হিসেবে `--nabi-hl-yellow` বদলালে নথিতে সংরক্ষিত `yellow` হাইলাইটার মানের পর্দার রংই শুধু বদলায়।

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## মোবাইল মোডের সীমা

টুলবার, প্রসঙ্গ সারি বা ভিউপোর্টের প্রস্থ `36rem`-এর কম হলে মোবাইল মোড চালু হয়। ঠিক `36rem` হলে স্বাভাবিক বিন্যাস বজায় থাকে। মোবাইল মোডে টুলবার ও প্রসঙ্গ সারি অনুভূমিকভাবে স্ক্রল হয়, প্যানেল মাঝখানে থাকে এবং টেবিল বাছাইয়ের গ্রিড স্পর্শের উপযোগী 5×5 ঘরে নেমে আসে।

সীমা বদলাতে `:root`, কোনো পূর্বসূরি উপাদান বা আলাদা `.nabi`-তে `--nabi-mobile-breakpoint` সেট করুন। `rem`, `px` বা `calc()`-এর মতো অঋণাত্মক CSS দৈর্ঘ্য ব্যবহার করুন। CSS মান, রুট ফন্টের আকার, কনটেইনার বা ভিউপোর্টের প্রস্থ বদলালে খোলা প্যানেলও স্বয়ংক্রিয়ভাবে আপডেট হয়। `body`-এর নিচে সরানো ইনপুট প্যানেল মূল এডিটরের সীমা ব্যবহার করতে থাকে।

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

স্পর্শভিত্তিক ডিভাইসে এই সীমার চেয়ে বেশি প্রস্থেও বড় নিয়ন্ত্রণ বজায় থাকে।

## অন্ধকার মোড

মূল অবস্থা আলোকিত মোড। পৃষ্ঠার `html` বা `body`-তে `.dark` দিন, অথবা নির্দিষ্ট সম্পাদক ও প্রকাশিত পর্দায় `data-nabi-theme="dark"` দিলে অন্ধকার মোড কার্যকর হয়।

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

উপরের `.dark`-এর প্রভাব বন্ধ করতে `data-nabi-theme="light"` ব্যবহার করুন। থিম বদল service পরিচালনা করে; package নিজে থেকে `prefers-color-scheme` অনুসরণ করে না।

```css
.dark .brand-note {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## প্রকাশিত পর্দাতেও CSS প্রয়োগ করুন

প্রকাশিত HTML-এ `.nabi-content`-এর একই CSS দরকার। JavaScript ছাড়াও সারণি, কোড, ছবি, checklist, dropcap-এর চেহারা কার্যকর হয়। সারণি সারিবদ্ধকরণ বা কোড রং করার মতো আচরণ দরকার হলেই `nabi-note/viewer` যোগ করুন।

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

মূল লেখার প্রস্থ ও line height-এর মতো package-এর মালিকানার বাইরে থাকা বিন্যাস service class-এ ঠিক করুন।

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## সম্পাদনা পর্দায় যা বদলাবেন না

সম্পাদনাধীন `[data-key]` node-এর `display` বা `white-space` বদলাবেন না। সম্পাদনা লেখার ভেতরে pseudo-element বসানো, বা ছবি·সংযুক্তির মতো object wrapper-এর pointer আচরণ আটকে রাখাও এড়িয়ে চলুন। এমন পরিবর্তনে caret-এর অবস্থান ও DOM-এর নথির অবস্থান অমিল হতে পারে।

dropcap প্রকাশিত পর্দায় `::first-letter` দিয়ে দেখা গেলেও সম্পাদনা পর্দায় প্রকৃত `[data-nabi-dropcap-letter]` element ব্যবহৃত হয়। `.nabi-editing`-এর ভেতরে `::first-letter` যোগ করবেন না বা এই element বদলাবেন না।
