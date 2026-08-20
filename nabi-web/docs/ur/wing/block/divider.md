---
title: تقسیم لکیر
---

# تقسیم لکیر

## تفصیل

`dividerWing` (نام `hr`) صرف ایک `<hr>` کی مالک ہے۔ **`place: 'void'`** —
بغیر اندرونی مواد کا جسم ہے، اس لیے کیریٹ کے اندر جانے کی جگہ نہیں۔ تقسیم لکیر
کے بالکل آگے یا پیچھے Backspace·Delete دبائیں تو وہ پورا بلاک غائب ہو جاتا ہے،
اور حد منتخب کر کے مٹائیں تو بھی وہی نتیجہ ملتا ہے۔

بٹن دبانے سے تقسیم لکیر **اپنا wrapper پیراگراف پہن کر** کھڑی ہوتی ہے۔ اس کے
ساتھ ایک خالی پیراگراف نہیں بنتا — کیریٹ اسی wrapper پیراگراف پر، تقسیم لکیر
کے بالکل پیچھے آ کر بیٹھتا ہے۔

کھڑے ہونے کی جگہ اس سے طے ہوتی ہے کہ کیریٹ جس پیراگراف میں تھا اس میں متن ہے
یا نہیں۔

| کیریٹ جہاں تھا | نتیجہ |
|---|---|
| متن والا پیراگراف | اس پیراگراف کے **بعد** کھڑی ہوتی ہے |
| خالی پیراگراف | اس پیراگراف کی **جگہ لے لیتی ہے** — کوئی خالی سطر پیچھے نہیں رہتی |

خالی پیراگراف کی جگہ لیتے وقت اس پیراگراف کی سیدھ ویسی ہی رہتی ہے۔

سطر کے شروع میں تین یا زیادہ hyphen (`---`) لکھ کر Enter دبائیں تو بھی وہی
نتیجہ ملتا ہے — اس خودکار تبدیلی کا **trigger Enter ہے**۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
