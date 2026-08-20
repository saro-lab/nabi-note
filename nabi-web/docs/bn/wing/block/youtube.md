---
title: YouTube
---

# YouTube

## বিবরণ

`youtubeWing` (নাম `youtube`, কোনো শর্টকাট নেই) YouTube এম্বেডের (`<iframe>`)
মালিক। `hr`·`img`-এর মতো এটিও **ভিতরে কিছু ধরে না এমন বস্তু** (`place:
'void'`)। বোতাম চাপলে একটি ঠিকানা-ইনপুট প্যানেল ওঠে, আর
`watch?v=`·`youtu.be/`·`/embed/`·`/shorts/`·`/v/`·`/live/` ধাঁচের YouTube
ঠিকানাই কেবল পার পায় (`www.`·`m.`·`music.` উপসর্গ আর `youtube-nocookie.com`
সমেত) — বিচারটি স্ট্রিং-এর ভিতরে খোঁজা নয়, `URL()` পার্সিং দিয়ে হয়, তাই
`youtube.com.evil.test`-এর মতো ঠিকানা ধরা পড়ে না।

আসা ঠিকানাটিকে যেমন আছে তেমন বিশ্বাস না করে তার ভিতর থেকে কেবল **11 অক্ষরের**
ভিডিও id তুলে নেওয়া হয়। সংরক্ষিত মানে ঠিকানা থাকে না — যা থাকে তা কেবল
`{"w":"youtube","a":{"v":"<id>","w":"70"}}`, আর বেরোনোর সময়
`https://www.youtube-nocookie.com/embed/<id>` এই এক চেহারাতেই নতুন করে গড়া হয়।

`hr`-এর মতো একই কারণে ক্যারেট এর ভিতরে ঢোকে না, আর ঠিক আগে বা পরে দাঁড়িয়ে
Backspace·Delete চাপলে এটি গোটাই মুছে যায়। YouTube নয় এমন এম্বেড ভিতরে
আসার সময় **গোটাই বাদ দেওয়া হয়** — অচেনা নথি আমাদের নথির ভিতরে দাঁড় করানো হয় না।

## কনটেক্সট সারি

ভিডিওতে ক্লিক করলে দুটো ঘর ওঠে।

| ধরন | ঘর |
|---|---|
| প্রস্থ | `50` `60` `70` `80` `90` `100` — ছয়টি ধাপ (ডিফল্ট `70`), স্কেল আর এখনকার মান একসঙ্গে দেখায় |
| ঠিকানা | এখনকার ভিডিওর id বসানো একটি ইনপুট প্যানেল |

**বাঁয়ে · মাঝে · ডানে সারিবদ্ধ করার ঘর এখানে নেই।** ভিডিওর জায়গা ভিডিও নয়,
**তাকে ধরে রাখা র‍্যাপার অনুচ্ছেদ** বহন করে, তাই টুলবারের সারিবদ্ধতা বোতামই
সেই কাজ করে। নতুন বসানো ভিডিও র‍্যাপার অনুচ্ছেদে মাঝে-সারিবদ্ধ (`c`) পরে
দাঁড়ায়।

তাই বেরোনোর সময় প্রস্থ ভিডিওর গায়ে, সারিবদ্ধতা তাকে ঘিরে থাকা অনুচ্ছেদের গায়ে
বসে।

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

ইনলাইন `style` বেরোয় না। হোস্ট নিজের UI থেকে বসাতে চাইলে কমান্ড সরাসরি ডাকে —
`applyCommand('insertYoutube', { v: ঠিকানা, w: '80' })`, শুধু প্রস্থ বদলাতে
চাইলে `applyCommand('setYoutubeWidth', { w: '80' })`। তালিকার বাইরের প্রস্থ
প্রত্যাখ্যান করা হয়।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
