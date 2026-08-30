---
title: টাইপফেস
description: নির্বাচিত text বা অনুচ্ছেদে টাইপফেস family প্রয়োগ করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# টাইপফেস

নির্বাচিত text-এ একটি টাইপফেস family প্রয়োগ করুন। পরিসর নির্বাচিত হলে কেবল সেটিই বদলায়; শুধু caret থাকলে বর্তমান অনুচ্ছেদের লেখায় লাগে। প্রকৃত font file ও `font-family` মান service CSS-এ নির্ধারিত।

ডিফল্ট family হলো `sans`, `serif`, `mono`, ও `cursive`। বিশেষ করে বাংলা বা অন্য বহুভাষী content থাকা service-এ কোন family কোন font ব্যবহার করবে তা স্পষ্টভাবে ঠিক করাই ভালো।

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

`values` না দিলে সব default family ব্যবহৃত হয়। নথিতে কেবল `values`-এ থাকা মান অনুমোদিত।

## CSS শৈলী

নথি কেবল family-র নাম রাখে এবং CSS font file বেছে নেয়। editor ও প্রকাশিত দৃশ্যের জন্য একই container-এ variable বদলান।

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

web font ব্যবহার করলে আগে সেই font file লোড করুন। অনেক ভাষায় `cursive`-এর ভালো coverage থাকে না, তাই service যে প্রকৃত font ব্যবহার করবে সেটি বেছে নেওয়ার পরই দেওয়া ভালো।
