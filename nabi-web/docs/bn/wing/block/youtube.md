---
title: YouTube
description: নথিতে YouTube ভিডিও এমবেড করুন এবং এর প্রস্থ ঠিক করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

YouTube ভিডিওর URL বা ভিডিও ID গ্রহণ করে সেটিকে এমবেড ব্লকে বদলায়। নথিতে পুরো URL নয়, কেবল ১১ অক্ষরের ভিডিও ID ও প্রস্থ সংরক্ষিত হয়; নতুন ভিডিও শুরু হয় কেন্দ্রে ৭০% প্রস্থে।

প্রস্থ নির্দিষ্ট ধাপে বেছে নেওয়া হয় এবং ভিডিওকে ঘিরে থাকা অনুচ্ছেদে সারিবদ্ধতা সংরক্ষিত থাকে। এডিটরে প্রথম ক্লিক ভিডিও নির্বাচন করে; নির্বাচিত হওয়ার পর আবার ক্লিক করলে চালানো যায়। ঠিকানা বদলাতে ভিডিওটি মুছে নতুনটি ঢোকান।

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS শৈলী

ভিডিওর সীমানা বা কোণ বদলাতে `.nabi-content iframe` ব্যবহার করুন। সংরক্ষিত প্রস্থ বা সারিবদ্ধতা বদলাবেন না।

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

সঠিক আকার ধরে রাখতে প্যাকেজ `aspect-ratio`, প্রস্থ ও সারিবদ্ধতার margin ব্যবহার করে; তাই এগুলো override করবেন না।
