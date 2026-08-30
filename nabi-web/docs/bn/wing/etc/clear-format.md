---
title: বিন্যাস মুছুন
description: নির্বাচন থেকে text ও paragraph formatting সরান।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# বিন্যাস মুছুন

নির্বাচিত পরিসরের text formatting একবারে সরান। bold, color ও typeface-এর মতো নিবন্ধিত default mark এবং heading, alignment ও drop cap-এর মতো paragraph attribute এতে অন্তর্ভুক্ত। দ্রুত দুবার Esc চাপলেও একই কাজ হয়।

তালিকা, সারণি, উদ্ধৃতি বা ছবির মতো নথির কাঠামোকে এটি plain text-এ বদলায় না। ছবি ও ভিডিওর বাইরের সারিবদ্ধতা এবং upload থেকে তৈরি attachment link যেমন আছে তেমনই থাকে।

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

যে formatting wing মুছতে চান সেগুলোকেও নির্বাচন করতে হবে; না হলে তাদের formatting সরানো যাবে না।
