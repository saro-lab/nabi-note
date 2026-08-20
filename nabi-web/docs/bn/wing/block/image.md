---
title: ছবি
---

# ছবি

## বিবরণ

`imageWing` (নাম `img`) ছবির (`<img>`) মালিক। `hr`·`youtube`-এর মতো এটিও
**ভিতরে কিছু ধরে না এমন বস্তু**। বোতাম চাপলে একটি ঠিকানা-ইনপুট প্যানেল ওঠে।

**ঠিকানা এক্সটেনশন দিয়ে নয়, স্কিম দিয়ে বাছাই করা হয়।** `http:`·`https:` আর
আপেক্ষিক পথই কেবল পার পায়, `//example.com/a.png`-এর মতো প্রোটোকল-আপেক্ষিক
ঠিকানা প্রত্যাখ্যাত হয়। `.png`-এ শেষ হচ্ছে কি না তা **কেউ দেখে না** — এক্সটেনশন
ছাড়াই ছবি দেয় এমন ঠিকানা সাধারণ ব্যাপার বলে।

ক্যারেট ছবির ভিতরে ঢোকে না, তাই ছবিতে ক্লিক করলে গোটা ছবিটিই নির্বাচিত হয় আর
কনটেক্সট সারি ওঠে।

| ধরন | ঘর |
|---|---|
| প্রস্থ | `30` থেকে `100` পর্যন্ত দশ করে আটটি ধাপ (ডিফল্ট `60`) — স্কেল, আর এখনকার মান একসঙ্গে দেখায় |
| দেখুন | কেবল ছবিটিকেই বড় করে — নথিতে কোনো বদল আনে না |

**কনটেক্সট সারিতে এই দুটোই আছে।** বাঁয়ে·মাঝে·ডানে সারিবদ্ধ করার ঘর এখানে নেই —
ছবির জায়গা ছবি নয়, **তাকে ধরে রাখা র‍্যাপার অনুচ্ছেদ** বহন করে, তাই টুলবারের
সারিবদ্ধতা বোতামই সেই কাজ করে।

**নতুন বসানো ছবি মাঝে থাকে** — `insertLump` র‍্যাপার অনুচ্ছেদে সারিবদ্ধতা `c`
পরিয়ে দাঁড় করায় বলে।

বেরোনোর সময় প্রস্থ ছবির গায়ে, সারিবদ্ধতা তাকে ঘিরে থাকা অনুচ্ছেদের গায়ে বসে।

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

সারিবদ্ধতার মান `l`·`c`·`r`। ইনলাইন `style` বেরোয় না — আসল চেহারা আঁকে
`nabi.css` বসানো `.nabi-content`-এর ভিতরে সেই অ্যাট্রিবিউট পড়া স্টাইলশিট।

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

`allowLocalUrls` চালু করলে `blob:`·`data:image/...` ঠিকানাও অনুমোদিত হয় —
সার্ভার ছাড়া ফাইল আগেভাগে দেখানোর ডেমো আর আপলোড দৃশ্যকল্পেই কেবল এটি চালু
করুন। ডিফল্টে এটি বন্ধ।

ছবি ভেঙে গেলে (ঠিকানা মরে গেলে, মেয়াদ ফুরিয়ে গেলে বা blob হারিয়ে গেলে) একটি
প্লেসহোল্ডার নিজে থেকেই ওঠে — wing নিজেই `attach` দিয়ে এই কাজ ধরে রাখে, আর
`mountSurface` নিবন্ধিত wing-এর `attach` একসঙ্গেই জুড়ে দেয়। **আলাদা করে mount
করার কিছু নেই।** এই চিহ্ন কেবল পর্দার জন্য, সংরক্ষিত মানে এটি কখনোই থাকে না।

`allowLocalUrls` দুই জায়গায় চালু করা যায় — গোটা সম্পাদকে
(`createNabiWith(wings, { allowLocalUrls: true })`) অথবা কেবল ছবি
wing-এই (`makeImageWing({ allowLocalUrls: true })`)।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

আপলোড করে পাওয়া ফাইল (`blob:` ঠিকানা) যেমন আছে তেমনই খোলা রাখতে হলে:

```ts
makeImageWing({ allowLocalUrls: true })
```

## ডেমো

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
