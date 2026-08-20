---
title: جلی
---

# جلی

## تفصیل

`boldWing` `<b>` کی مالک (claim) ہے۔ متن منتخب کر کے ٹول بار کا **B** دبائیں
یا hint mode (Shift دو بار دبا کر پھر `B`) سے لگائیں تو وہ حصہ جلی ہو جاتا ہے۔

- اندر آتے وقت `<b>` اور `<strong>` دونوں قبول کرتی ہے، اور باہر جاتے وقت
  ہمیشہ صرف `<b>` نکلتا ہے۔ کوئی خاصیت نہیں بچاتی — `class`·`style`·`data-*`
  سب گر جاتے ہیں اور صرف ٹیگ رہتا ہے۔
- hint mode کا شارٹ کٹ `B` ہے، اور accelerator `Ctrl`/`⌘`+`B` (`mod+b`) ہے۔
- متن منتخب کر کے دبائیں تو toggle (`toggleMark`) کا کام کرتی ہے — پورا حصہ
  پہلے سے جلی ہو تو اتار دیتی ہے، ورنہ لگا دیتی ہے۔ یہ wing اپنا کوئی command
  نہیں رکھتی — بٹن کا `action: { kind: 'mark' }` ہونے سے سیدھا کور کے
  `toggleMark` پر جاتا ہے۔
- رجسٹر نہ کریں تو `<b>` کا خول اتر جاتا ہے اور سادہ متن رہ جاتا ہے (رجسٹر نہ
  ہونے والا ہر ٹیگ اسی طرح ہوتا ہے — یہ nabi کا مجموعی قاعدہ ہے)۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
