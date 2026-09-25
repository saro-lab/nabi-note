---
title: "আইকন থিম"
description: "CSS ভেরিয়েবল দিয়ে উইং, প্রিভিউ, পূর্ণ পর্দা, প্যানেল, তুলনা ও টেবিল সাজানোর আইকন বদলান। SVG, WebP ও PNG একসঙ্গে ব্যবহার করা যায়; নির্দিষ্ট না করা আইকন ডিফল্ট ফাইল ব্যবহার করে।"
---

# আইকন থিম

CSS ভেরিয়েবল দিয়ে উইং, প্রিভিউ, পূর্ণ পর্দা, প্যানেল, তুলনা ও টেবিল সাজানোর আইকন বদলান। SVG, WebP ও PNG একসঙ্গে ব্যবহার করা যায়; নির্দিষ্ট না করা আইকন ডিফল্ট ফাইল ব্যবহার করে।

## ফাইল নির্ধারণ

CSS লোড করে এডিটর বা সাধারণ প্যারেন্টে থিম ক্লাস দিন। ছবির আসল রং, স্বচ্ছতা ও অনুপাত বজায় থাকে।

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

`/icons/...`-এর মতো রুট থেকে শুরু হওয়া পথ বা সম্পূর্ণ HTTPS URL ব্যবহার করুন। আপেক্ষিক পথ থিম ফাইলের পাশ থেকে নির্ধারিত হবে, এমন নিশ্চয়তা নেই। CSS নিজে হোস্ট করলে একই সংস্করণের `dist/icons/`-ও `nabi.css`-এর পাশে কপি করুন। ছবি লোড না হলে আইকন ফাঁকা থাকে, তবে বাটনের নাম, টুলটিপ ও কাজ চালু থাকে।

## অন্য আইকন খোঁজা

আইকন উপাদানের `data-nabi-icon` মানের আগে `--nabi-icon-` বসালে CSS ভেরিয়েবল পাওয়া যায়। যেমন `diff-close` ব্যবহার করে `--nabi-icon-diff-close`। কনটেক্সট, মেনু, সংরক্ষণ, ইতিহাস ও অন্যান্য কী-এর নিয়ম এবং বিশেষ অক্ষরের এনকোডিং জানতে <a href="/llms/icons.md" target="_blank" rel="noopener">আইকন চুক্তি</a> দেখুন।

## ডার্ক মোড ও প্যানেল

থিম ক্লাস বা CSS ভেরিয়েবল বদলালে আবার mount না করেই আইকন বদলে যায়। ডিফল্ট আইকন হালকা/গাঢ় থিম অনুসরণ করে। নিজস্ব ফাইল `currentColor` পায় না; দরকার হলে ওপরের মতো গাঢ় থিমের ফাইল দিন। `body`-এর নিচে খোলা প্যানেলও মূল এডিটরের আইকন থিম ও ক্লাস/স্টাইল পরিবর্তন অনুসরণ করে। ভেরিয়েবল এডিটর বা সাধারণ প্যারেন্টে রাখুন, শুধু টুলবারের ভেতরে নয়।

## ডিফল্ট বাটন দেখানো

`showPreview` ও `showFullscreen` দুটির ডিফল্টই `true`। `false` করলে সংশ্লিষ্ট বাটন, তার ফোকাস লক্ষ্য ও ইভেন্ট বাদ যায়। দুটিই `false` হলে ফাঁকা টুল অঞ্চলও তৈরি হয় না।

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSR ও mount-এ একই প্রদর্শন বিকল্প দিন। কনফিগারেশন বদলাতে `tools.unmount()` ডেকে নতুন বিকল্প দিয়ে mount করুন। কোনো বাটনই না লাগলে টুল mount ও SSR মার্কআপ সম্পূর্ণ বাদ দেওয়ার আগের পদ্ধতিও আছে। `openPreview()` ও `setFullscreen()` সরাসরি কল করা যায়।
