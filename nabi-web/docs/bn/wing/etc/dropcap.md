---
title: ড্রপ ক্যাপ
description: মূল লেখার শুরুতে বড় প্রথম অক্ষর দিন।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ড্রপ ক্যাপ

অনুচ্ছেদের প্রথম অক্ষর বড় করে রাখুন এবং পরের লাইনগুলোকে তার পাশে প্রবাহিত হতে দিন। এটি অনুচ্ছেদ-স্তরের formatting, তাই নির্বাচিত শব্দের শুধু একটি অংশে লাগে না।

প্রকাশিত ও সম্পাদনা দৃশ্য একই আকার রাখে। সম্পাদনার সময় caret ও delete অবস্থান সরে না যাওয়ার জন্য প্রথম অক্ষরকে আসল element-এ মোড়ানো হয়; সেই element সংরক্ষিত নথির content-এ থাকে না।

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS শৈলী

প্রকাশিত ও সম্পাদনা দৃশ্য প্রথম অক্ষরের জন্য আলাদা selector ব্যবহার করে। প্রকাশিত দৃশ্য `[data-nabi-dropcap="1"]::first-letter`, আর সম্পাদনা দৃশ্য আসল element `[data-nabi-dropcap-letter]` ব্যবহার করে। রঙ, font বা আকারের মতো দৃশ্যমান মান বদলালে দুই selector একসঙ্গে লিখুন, যাতে দুটি output একই দেখায়।

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

আকার ও line height বদলালে একই মান দুই selector-এ দিন।

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

drop cap প্রথম অক্ষরের চারপাশে line flow হিসাব করে; তাই শুধু এক দিক বদলালে বা মান খুব বড় করলে WYSIWYG আকার নষ্ট হতে পারে। তবু editor-এ নতুন `::first-letter` নিয়ম দেবেন না। editor-এ কেবল বিদ্যমান `[data-nabi-dropcap-letter]` সাজান।
