---
title: সাবস্ক্রিপ্ট
---

# সাবস্ক্রিপ্ট

## বিবরণ

`subscriptWing` হলো `<sub>`-এর মালিক (claim)। রাসায়নিক সংকেতে বা নিচে নামিয়ে
লেখা সংখ্যায় এটি ব্যবহার করা হয়।

- স্বীকৃত ট্যাগ একটিই — `<sub>`। কোনো অ্যাট্রিবিউট টিকিয়ে রাখা হয় না।
- হিন্ট মোডে এর কোনো শর্টকাট নেই।
- লেখা নির্বাচিত অবস্থায় চাপলে এটি টগল।
- চেহারা আসে এই wing নিজে যে স্টাইলশিট বহন করে তা থেকে (`Wing.styles`)।

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**এই স্টাইলশিটটি সুপারস্ক্রিপ্টের সাথে ভাগ করে নেওয়া একটি সেট।** দুটো wing একই লেখা
বহন করে বলে, দুটোই নিবন্ধন করলেও নথিতে **একবারই** যুক্ত হয় (`collectSheets` একই
লেখার স্টাইলশিট ছেঁকে বাদ দেয়)। সংরক্ষিত মানে (HTML) শুধু `<sub>` ট্যাগটুকু থাকে,
স্টাইল নিজে সেখানে যায় না।

## ব্যবহারের উদাহরণ

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ডেমো

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
