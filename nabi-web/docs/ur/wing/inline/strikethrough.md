---
title: کاٹی ہوئی لکیر
---

# کاٹی ہوئی لکیر

## تفصیل

`strikeWing` `<s>` کی مالک (claim) ہے۔ مٹائی گئی مگر نظر آنے دی جانے والی قدر
کے لیے استعمال ہوتی ہے۔

- اندر آتے وقت `<s>`·`<strike>`·`<del>` تینوں قبول کرتی ہے، اور باہر جاتے وقت
  ہمیشہ `<s>` بنتی ہے۔ کوئی خاصیت نہیں بچاتی — `<del datetime="…">` کا وقت بھی
  نہیں رہتا۔
- hint mode کا شارٹ کٹ `S` ہے۔ **کوئی accelerator نہیں** — اسی `emphasis` گروہ
  کی جلی، ترچھا، انڈرلائن کے برعکس اس کے ساتھ `Ctrl`/`⌘` کا مجموعہ نہیں لگا۔
- متن منتخب کر کے دبائیں تو toggle کا کام کرتی ہے۔
- رجسٹر نہ کریں تو `<s>` کا خول اتر جاتا ہے اور سادہ متن رہ جاتا ہے۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
