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

সম্পাদকের `.nabi` ও প্রকাশিত দৃশ্যের `.nabi-content`-এ একই থিম ক্লাস দিলে একই চলক প্রয়োগ হয়। প্যাকেজ CSS-এর পরে সেবার CSS লোড করুন এবং বর্তমান থিম `data-nabi-theme` দিয়ে নির্ধারণ করুন।

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
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

হাইলাইট ও লেখার রঙ যথাক্রমে `--nabi-hl-<name>` ও `--nabi-tc-<name>` ব্যবহার করে। সেলের পটভূমিতে `--nabi-cell-<name>` দিয়ে `yellow`, `green`, `cyan`, `pink`, `purple`, `orange` ব্যবহার করা যায়। চলক শুধু দেখানো রঙ বদলায়, সংরক্ষিত নাম নয়।

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

ডিফল্ট থিমে সেলের পটভূমি হালকা রঙের। অন্ধকার মোড একই নাম রেখে আলাদা, উজ্জ্বলতর ও কম সম্পৃক্ত রঙ ব্যবহার করে, যাতে গাঢ় পটভূমিতে পার্থক্য বোঝা যায়। আধা-স্বচ্ছ এই রঙে পেছনের পটভূমি দেখা যায়; বদলালে আসল পাতার পটভূমিতে লেখার কনট্রাস্ট দেখুন। ডিফল্ট রঙের চলক ওভাররাইড করতে ওপরের উদাহরণের মতো প্রকৃত সম্পাদক বা প্রকাশিত বিষয়বস্তুর উপাদানে থিম ক্লাস দিন, যেকোনো বাইরের প্যারেন্টে নয়।

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## মোবাইল মোডের সীমা

ডিফল্ট `layout: 'compact'` টুলবার পর্দার প্রস্থ `36rem`-এর কম হলে মোবাইলের এক সারিতে বদলায়। ঠিক `36rem` হলে ডেস্কটপ বিন্যাস থাকে। ডেস্কটপে সম্পাদক সরু হলেও সব সরঞ্জাম পরের সারিতে ভাঙে। অবজেক্টের বৈশিষ্ট্যের সরঞ্জামও নিচে ভাঙে; দুই সারিই লেখার ওপরে জায়গা নেয়। পূর্ণপর্দায় প্রস্থ যাই হোক সব সরঞ্জাম খোলে।

মোবাইলে দ্রুত সরঞ্জাম, সব সরঞ্জামের বোতাম এবং যুক্ত প্রিভিউ/পূর্ণপর্দার বোতাম মূল টুলবারে থাকে। বৈশিষ্ট্যের সরঞ্জাম এলেও এগুলো একসঙ্গে ব্যবহার করা যায়। সব সরঞ্জামের প্যালেটে ডেস্কটপের গুচ্ছক্রম ও বিভাজক থাকে। `layout: 'wrap'` সব সময় সব সরঞ্জাম সারি ভেঙে দেখায়।

মোবাইল প্যানেল টুলবার ও বৈশিষ্ট্যের সরঞ্জামের আশপাশের খালি জায়গায় খোলে। টেবিলের আকার বাছাইকারী ব্যতিক্রম: আধা-স্বচ্ছ পটভূমির মাঝে স্পর্শবান্ধব 5×5 গ্রিডে খোলে। কিবোর্ড বন্ধ হওয়ার অপেক্ষা করে না; আকার বাছলে একটি টেবিল ঢুকিয়ে বন্ধ হয়।

সীমা বদলাতে `--nabi-mobile-breakpoint`-কে `:root`, পূর্বপুরুষ উপাদান বা আলাদা `.nabi`-এ দিন। `rem`, `px`, `calc()`-এর মতো অঋণাত্মক CSS দৈর্ঘ্য ব্যবহার করুন। CSS মান, রুট ফন্টের আকার বা পর্দার প্রস্থ বদলালে খোলা প্যানেলও স্বয়ংক্রিয়ভাবে বদলায়। `body`-র নিচে সরানো ইনপুট প্যানেল মূল সম্পাদকের সীমা মানে।

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

ভাসমান এলাকার এক কলামে যাওয়ার সীমা আলাদা। পর্দা নয়, লেখার কন্টেইনারের প্রস্থ `36rem`-এর কম হলে এক কলামে দেখায়; মুদ্রণেও একই বিন্যাস ব্যবহার হয়।

## অন্ধকার মোড

মূল অবস্থা আলোকিত মোড। পৃষ্ঠার `html` বা `body`-তে `.dark` দিন, অথবা নির্দিষ্ট সম্পাদক ও প্রকাশিত পর্দায় `data-nabi-theme="dark"` দিলে অন্ধকার মোড কার্যকর হয়।

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

উপরের `.dark`-এর প্রভাব বন্ধ করতে `data-nabi-theme="light"` ব্যবহার করুন। থিম বদল service পরিচালনা করে; package নিজে থেকে `prefers-color-scheme` অনুসরণ করে না।

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
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
