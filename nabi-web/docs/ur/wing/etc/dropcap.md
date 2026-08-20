---
title: ڈراپ کیپ
---

# ڈراپ کیپ

## تفصیل

`dropCapWing` ایک ہی قدر والی بلاک کی خاصیت ہے جو پیراگراف پر
`data-nabi-dropcap="1"` لگاتی ہے۔ نیا بلاک نہیں بناتی، صرف پہلے سے موجود
پیراگراف پر نشان رکھتی ہے۔

- قدر صرف آن/آف ہے — بٹن دوبارہ دبانے سے خاصیت اتر جاتی ہے۔
- **کتنی سطریں گھیرے گا اس کا کوئی آپشن یا متغیر نہیں۔** کور کی سٹائل شیٹ کا
  `::first-letter` والا صرف ایک قاعدہ سائز طے کرتا ہے —
  `font-size: 5.9em; line-height: .83`۔ حرف حقیقت میں کتنی سطریں ڈھکے گا یہ
  اس پیراگراف کی line height طے کرتی ہے۔
- چونکہ یہ صرف پہلے حرف کو چھوتی ہے، Enter اسے mark کی طرح برتتا ہے — پیراگراف
  دو حصوں میں بٹے تو یہ دونوں میں نقل نہیں ہوتا بلکہ اسی حرف کے ساتھ جاتا ہے۔

سائز بدلنا ہو تو وہ قاعدہ خود اوپر لکھیں۔

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
