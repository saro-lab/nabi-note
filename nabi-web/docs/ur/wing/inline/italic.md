---
title: ترچھا
---

# ترچھا

## تفصیل

`italicWing` `<i>` کی مالک (claim) ہے۔ اجنبی لفظ یا اقتباس جیسے مختلف انداز
والے متن پر استعمال ہوتی ہے۔

- اندر آتے وقت `<i>` اور `<em>` دونوں قبول کرتی ہے، اور باہر جاتے وقت
  `<i>` ایک میں جمع کر دیتی ہے۔ کوئی خاصیت نہیں بچاتی۔
- hint mode (Shift دو بار دبانا) کا شارٹ کٹ `I` ہے — یہ physical key
  (`KeyI`) سے پکڑا جاتا ہے، اس لیے غیر لاطینی کی بورڈ پر بھی کام کرتا ہے۔
  accelerator `Ctrl`/`⌘`+`I` (`mod+i`) ہے۔
- متن منتخب کر کے دبائیں تو toggle کا کام کرتی ہے۔
- رجسٹر نہ کریں تو `<i>` کا خول اتر جاتا ہے اور سادہ متن رہ جاتا ہے۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
