---
title: কোড
description: একাধিক লাইনের কোড ও syntax highlighting-এর ভাষার তথ্য ধারণ করে।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# কোড

সাধারণ মূল লেখা থেকে আলাদা করে একাধিক লাইনের কোড দিন। খালি অনুচ্ছেদে তিনটি backtick লিখে Space বা Enter চাপুন, অথবা টুলবার থেকে বদলান। backtick-এর পরে `ts`-এর মতো ভাষার নাম দিলে সেই নামও সংরক্ষিত হয়।

ভাষার নাম syntax highlighting-এ ব্যবহৃত শনাক্তকারী; নিবন্ধিত তালিকার বাইরের নামও নিজে লেখা যায়। কোডের বিষয়বস্তু ও indentation অক্ষত রাখতে কোড block-এ অনুচ্ছেদ সারিবদ্ধকরণ প্রয়োগ হয় না।

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## কোড হাইলাইটার সংযোগ

কোড block নিবন্ধন করলে সম্পাদকে মৌলিক রং করা ব্যবহৃত হয়। প্রকাশিত পর্দাতেও রং করতে `nabi-note/viewer` সংযোগ করুন। viewer `pre > code` খুঁজে parent-এর `data-nabi-lang` মানকে ভাষার নাম হিসেবে পড়ে। সেটি না থাকলে `code` element-এর `language-...` class দেখে।

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'bn',
})

// প্রকাশিত HTML বদলানোর পরে
viewer.refresh()

// পর্দা বন্ধের সময়
viewer.unmount()
```

আলাদা হাইলাইটার না থাকলে, বা সেটি ভাষাটি সামলাতে না পারলে নির্ভরতাবিহীন অন্তর্নির্মিত tokenizer রং দেয়। হাইলাইটার বসানো token span কেবল পর্দায় থাকে; সংরক্ষিত JSON বা মূল প্রকাশিত HTML-এ থাকে না। `refresh()` ও `unmount()` এই span মুছে বর্তমান মূল কোডের সঙ্গে আবার সংযোগ করে।

### NABI ওয়েবসাইটে Shiki সংযোগের পদ্ধতি

NABI ওয়েবসাইট প্রথম পর্দা ও SSR bundle থেকে Shiki বাদ রাখতে হাইলাইটারটি গতিশীলভাবে আনে। `nabi-web/docs/.vitepress/src/highlight.ts`-এর `loadCodeHighlighting()` Shiki core তৈরি করে এবং বাস্তবে কোড ভাষা দরকার হলেই শুধু তার ব্যাকরণ আনে। নিচে প্রকাশিত পর্দায় ব্যবহৃত একই সংযোগ-পদ্ধতি আছে।

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'bn',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// পর্দা বন্ধের সময়
stop?.()
viewer.unmount()
```

প্রথমবার কোনো ভাষা পেলে ব্যাকরণ ডাউনলোড শুরু হয়; ততক্ষণ অন্তর্নির্মিত tokenizer বা সাধারণ লেখা দেখা যায়। ব্যাকরণ এলে `onGrammarLoaded()` `viewer.refresh()` ডেকে আবার রং করে। ফলে প্রয়োজনীয় ভাষাই নামানো হয় এবং দেরিতে আসা ব্যাকরণও পরের পর্দা পরিবর্তন ছাড়া কার্যকর হয়।

সম্পাদক দিকেও একই `highlight` function ব্যবহৃত হয়। NABI ওয়েবসাইটের ডেমো মৌলিক `codeWing`-এর `attach`-কেই `makeCodeAttach({ highlight, version })` দিয়ে বদলায়। `version` প্রতিবার একটি ব্যাকরণ এলে বদলায়; এতে আগে আঁকা কোডও আবার রং হয়। স্বতন্ত্র service আগে প্রকাশিত পর্দার সংযোগই বাস্তবায়ন করতে পারে, সম্পাদনার সময়েও Shiki রং জরুরি হলে পরে এই পদ্ধতি যোগ করুন।

## CSS শৈলী

কোড block `.nabi-content pre` এবং কোড `.nabi-content pre > code` দিয়ে সাজান। `white-space` বদলাবেন না; এটি কোডের line break ও সম্পাদনায় প্রভাব ফেলে। `[data-nabi-token]` selector দিয়ে token-এর রং বদলানো যায়।

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
