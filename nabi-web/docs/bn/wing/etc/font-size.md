---
title: ফন্টের আকার
description: অনুমোদিত ধাপের মধ্যে text size বদলান।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ফন্টের আকার

নির্বাচিত text-কে একটি size step-এ বদলান। পরিসর নির্বাচিত হলে ধাপটি সেই পরিসরে লাগে; শুধু caret থাকলে বর্তমান অনুচ্ছেদের text size বদলায়। সংরক্ষিত data-তে `px`-এর মতো ইচ্ছামতো মান নয়, কেবল অনুমোদিত ধাপ থাকে।

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values` না দিলে `xs`, `sm`, `lg`, ও `xl` ধাপ ব্যবহৃত হয়। তালিকা ছোট করলে পুরনো নথিতে থাকা অন্য ধাপগুলো লোডের সময় মুছে যায়।

## CSS শৈলী

`.nabi-content [data-nabi-size="xs"]`-এর মতো সংরক্ষিত-step selector দিয়ে আকার বদলাতে পারেন। নথিতে নেই এমন ইচ্ছামতো ধাপ বানাবেন না; কেবল নিবন্ধিত `values`-এর মধ্যে CSS ঠিক করুন।

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

ধাপগুলোর আকারের পার্থক্য একরকম রাখলে নথি প্রকাশের সময় লেখকের এডিটরে বেছে নেওয়া অর্থ বজায় থাকে।
