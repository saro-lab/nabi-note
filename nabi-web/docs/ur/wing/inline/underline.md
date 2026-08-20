---
title: انڈرلائن
---

# انڈرلائن

## تفصیل

`underlineWing` `<u>` کی مالک (claim) ہے۔

- صرف `<u>` ٹیگ قبول کرتی ہے۔ باہر جاتے وقت بھی ہمیشہ `<u>` ہے اور کوئی خاصیت
  نہیں بچاتی۔ **`<ins>` قبول نہیں کرتی** — اس کا خول اتر جاتا ہے اور صرف حروف
  رہ جاتے ہیں۔ یہ جلی (`<b>`·`<strong>`) یا کاٹی ہوئی لکیر (`<s>`·`<strike>`·
  `<del>`) جیسا جوڑا قبول کرنے والا mark نہیں ہے۔
- hint mode کا شارٹ کٹ `U` ہے، اور accelerator `Ctrl`/`⌘`+`U` (`mod+u`) ہے۔
- متن منتخب کر کے دبائیں تو toggle کا کام کرتی ہے۔
- رجسٹر نہ کریں تو `<u>` کا خول اتر جاتا ہے اور سادہ متن رہ جاتا ہے۔
- انڈرلائن اور لنک سکرین پر شکل میں مل سکتے ہیں مگر یہ دونوں الگ mark ہیں جن
  کی مالک الگ الگ wing (لنک کی `a`) ہے — ایک ہی متن پر دونوں لگ سکتے ہیں۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
