---
title: چیک لسٹ
---

# چیک لسٹ

## تفصیل

`taskListWing` (نام `tl`، شارٹ کٹ `K`) بلٹ فہرست کے ساتھ ٹیگ (`<ul>`) بانٹتی
ہے مگر الگ implementation ہے — باہر جاتے وقت `data-nabi-list="task"` سے چیک
لسٹ ہونا، اور ہر item پر `data-nabi-checked` سے چیک ہونے کی حالت لکھی جاتی ہے۔

item کو `parts` سے ساتھ لایا جاتا ہے — یہ صف نہیں بلکہ record ہے۔

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

محفوظ قدر میں چیک `ck` ہے اور اس کی قدر صرف `1` ہے — بند حالت `0` نہیں بلکہ
**خانہ سرے سے موجود ہی نہ ہونا** ہے۔ باہر جانے والے HTML میں یہ
`data-nabi-checked="true"`/`"false"` کے طور پر کھلتا ہے۔

بٹن دبانے سے کیریٹ جس بلاک میں ہے (یا انتخاب میں آنے والے بلاکس) کو چیک لسٹ میں
لپیٹ دیتا ہے۔ سطر کے شروع میں `[ ] ` یا `[x] ` (بڑا چھوٹا حرف بے فرق) لکھنے سے
بھی وہی نتیجہ ملتا ہے، اور کیا لکھا گیا اس کے مطابق item چیک شدہ یا غیر چیک شدہ
شروع ہوتا ہے۔ سطر کا خالی ہونا ضروری نہیں، اور یہ صرف پیراگراف کی پہلی سطر پر
پکڑا جاتا ہے۔

چیک باکس `<input>` نہیں بلکہ CSS سے کھینچا گیا نشان ہے — کیونکہ `contenteditable`
کے اندر اصلی input رکھنے سے کیریٹ الجھ جاتا ہے۔ چیک شدہ خانہ اہم رنگ کی ٹائل پر
سفید ✕ ہے، اور اس سطر کا رنگ مدھم ہو کر اس پر افقی لکیر کھینچی جاتی ہے۔

**آن آف کرنے کی جگہ خود خانہ ہے** — item کے شروع میں تنگ پٹی (تقریباً ایک حرف
جتنی) دبانے سے بدلتا ہے، متن کی طرف دبانے سے صرف کیریٹ جاتا ہے۔ دائیں سے بائیں
لکھی جانے والی زبان میں وہ پٹی مخالف طرف کھڑی ہوتی ہے۔ یہ کام wing خود `attach`
سے تھامتی ہے، اس لیے **الگ سے کوئی mount نہیں چاہیے۔**

`Tab`/`Shift+Tab` سے اندر باہر کرنا، اور خالی item پر Enter سے فہرست ختم کرنا،
دونوں [بلٹ فہرست](./bullet-list) جیسے ہی ہیں۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
