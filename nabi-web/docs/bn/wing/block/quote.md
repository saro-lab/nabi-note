---
title: উদ্ধৃতি
description: উদ্ধৃত লেখা একত্র করুন বা একাধিক অনুচ্ছেদের প্রসঙ্গ আলাদা করুন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# উদ্ধৃতি

উদ্ধৃত লেখা একত্র করুন বা একাধিক অনুচ্ছেদের প্রসঙ্গ আলাদা করুন। খালি অনুচ্ছেদে `>` লিখে Space চাপুন, অথবা টুলবার থেকে নির্বাচিত অনুচ্ছেদগুলোকে উদ্ধৃতিতে বদলান।

উদ্ধৃতির মধ্যে সাধারণ অনুচ্ছেদের পাশাপাশি তালিকা ও ছবির মতো ব্লকও থাকতে পারে। একই পরিসর আবার বদলালে সেটি মোড়ক খুলে বাইরের অনুচ্ছেদে ফিরে যায়।

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS শৈলী

সীমানা ও ফাঁক বদলে `.nabi-content blockquote` দিয়ে উদ্ধৃতি সাজান।

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote`-এর ভেতরের অনুচ্ছেদ কাঠামো বজায় রাখুন এবং শুধু বাইরের ফাঁক, সীমানা ও রঙের মতো উপস্থাপনা বদলান।
