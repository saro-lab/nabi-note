---
title: হাইলাইট
---

# হাইলাইট

## বিবরণ

`highlightWing` (নাম `hl`) হলো `<mark data-color="...">`-এর মালিক (claim)। এটি
মান-বহনকারী ইনলাইন মার্ক, তাই চালু-বন্ধের টগল নয়, রং বেছে নেওয়ার ধারা — লেখার
রঙের সঙ্গে একই ঘরানার।

- **টুলবারের বোতাম (শর্টকাট `H`) হলুদ প্রয়োগ করে** — `setHighlight`-কে
  `{ c: 'yellow' }` পাঠায়। কোনো আর্গুমেন্ট ছাড়া চলা বোতাম নয়।
- তাই এই বোতামের টগল **হলুদের প্রতি টগল**। নির্বাচিত পুরো অংশ **কেবল হলুদ হলেই**
  খুলে যায় — পুরোটা সবুজ হলে চাপলে খোলার বদলে হলুদে বদলে যায়, আবার একবার চাপলে
  তবেই খোলে।
- ক্যারেট হাইলাইট মার্কের ভিতরে থাকলে কনটেক্সট টুলবারে ছয়টি রঙের নমুনা (swatch)
  ওঠে — চাপলেই সেখানেই কেবল রংটুকু বদলায়। আলাদা কোনো "মুছুন" বোতাম এই wing-এর
  নিজের নেই। একই রঙে আবার চাপলে খুলে যায়, ফরম্যাটিং মোছার দায়িত্ব
  `clearFormatWing`-এর (তাকে আলাদা করে নিবন্ধন করতে হয়)।
- **কেবল ক্যারেট রেখে বাছলে দুই ধারা।** ক্যারেট আগে থেকেই হাইলাইট মার্কের ভিতরে
  থাকলে সেই মার্ক যা ঢেকে রেখেছে তার পুরোটাই লক্ষ্য হয়ে যায় (নতুন করে পরিসর
  নির্বাচনের দরকার নেই)। মার্কের বাইরে থাকলে বসানোর মতো লেখা নেই বলে তা
  **সংরক্ষিত (reserved)** থেকে যায় — পরে যা টাইপ করা হবে তা-ই সেই রং নিয়ে বেরোবে।
- সংরক্ষিত মানে কেবল রঙের নামটুকু থাকে — যেমন `data-color="yellow"`। ইনলাইন
  `style` বাইরে যায় না। আসল পটভূমির রং আসে এই wing নিজে যে স্টাইলশিট বহন করে
  (`styles`) তা থেকে (লেখার রঙের সঙ্গে একই সেট ভাগ করে নেয়), আর রঙের মানটুকু
  থাকে কোরের টোকেন `--nabi-hl-*`-এ — হোস্ট সেই টোকেন ওভাররাইড করে বদলাতে পারে।
- **তালিকার বাইরের মান কোথাও গৃহীত হয় না।** কমান্ড আদৌ চলে না, আর ভেতরে আসা HTML-এ
  তালিকায় নেই এমন `data-color` ধরা `<mark>`-এর খোলস খসে গিয়ে **কেবল লেখাটুকু**
  থেকে যায়। `data-color` আদৌ নেই এমন `<mark>`-এর বেলাতেও তা-ই — রংই যেহেতু মান,
  মানহীন হাইলাইটের কোনো জায়গা নেই।
- হাতে ঠিক করা সংরক্ষিত মানও একই নিয়ম মানে — `repair` তালিকার বাইরের মান পেলে সেই
  নোডকে খোলসসহ সরিয়ে দেয়।

| রঙের নাম | সংরক্ষিত মান |
|---|---|
| হলুদ | `yellow` |
| সবুজ | `green` |
| আকাশি | `cyan` |
| গোলাপি | `pink` |
| বেগুনি | `purple` |
| কমলা | `orange` |

এই ছয়টি `HIGHLIGHT_COLORS` হিসেবে রপ্তানি করা হয় — রঙের মান নয়, **নামের অ্যারে**
(`readonly string[]`)। রঙের মান ধরে রাখে স্টাইলশিট।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
