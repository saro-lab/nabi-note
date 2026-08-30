---
title: ছবি
description: ছবির URL ঢোকান এবং প্রস্থ ও সারিবদ্ধতা ঠিক করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ছবি

ছবির URL ঢোকান এবং প্রস্থ ও সারিবদ্ধতা ঠিক করুন। ডিফল্টে ঠিকানা `http:`, `https:` বা একই সাইটের path-এ সীমিত থাকে, আর নতুন ছবি ৬০% প্রস্থে কেন্দ্রে শুরু হয়।

প্রস্থ কেবল নির্দিষ্ট ধাপে সংরক্ষিত হয় এবং ছবিকে ঘিরে থাকা অনুচ্ছেদে সারিবদ্ধতা থাকে। `blob:` বা `data:image/...` preview ব্যবহার করতে image wing এবং editor assembly উভয় জায়গায় local URL স্পষ্টভাবে অনুমতি দিন। SVG data URL অনুমোদিত নয়।

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

এই wing নথিতে ঠিকানা ঢোকায়; ফাইল আপলোড করে না। সার্ভারে ফাইল পাঠাতে [upload wing](/bn/wing/etc/upload) যুক্ত করুন।

## CSS শৈলী

`.nabi-content img` দিয়ে ছবি সাজান। সংরক্ষিত প্রস্থ ও সারিবদ্ধতা অক্ষত রেখে কেবল সীমানা বা ছায়ার মতো দৃশ্যমান বিষয় বদলান।

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

`max-inline-size`, `block-size`, প্রস্থ ও সারিবদ্ধতার ডিফল্ট নিয়ম রাখুন। ছবির আকার নথিতে সংরক্ষিত, তাই স্থির CSS প্রস্থ চাপিয়ে দিলে লেখকের বাছা প্রস্থের সঙ্গে দ্বন্দ্ব হতে পারে।
