---
title: کوڈ
---

# کوڈ

## تفصیل

`codeWing` (نام `code`) کوڈ بلاک (`<pre>`) کی مالک **کانسٹنٹ** ہے — قوس لگا کر
نہیں بلایا جاتا۔

یہ `holds: 'inline'` والا ظرف ہے، اور اندر کو `repair` سادہ متن پر جما دیتا ہے
— مارک یا کوئی اور wing اندر مداخلت نہیں کر سکتی۔ یہ معاہدے میں الگ خانہ نہیں،
بلکہ wing خود اپنا اندر سنوارتی ہے۔

خالی سطر پر ` ``` ` لکھ کر space یا Enter دبائیں تو کوڈ بلاک بن جاتا ہے —
` ```ts ` جیسے زبان جوڑ کر لکھیں تو وہ زبان بھی ساتھ پکڑی جاتی ہے۔ `Tab`/
`Shift+Tab` سے سطر اندر باہر کی جاتی ہے (کئی سطریں چنیں تو ایک ساتھ)۔ Enter
پچھلی سطر کا اندر کرنا وراثت میں لے لیتا ہے۔

کیریٹ کوڈ کے اندر ہو تب ہی سیاق سطر نکلتی ہے — زبان خود لکھنے کا ان پٹ خانہ،
"زبان نہیں"، اور عام استعمال ہونے والی زبانوں کے خانے۔

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

یہ فہرست صرف **مختصر راستہ** ہے — کور کی جانی ہوئی زبانوں کی فہرست نہیں۔ جو
یہاں نہیں وہ پہلے خانے میں خود لکھ دیں، وہی قدر سیدھی highlighter کو دی جاتی
ہے۔

## رنگ کاری wing میں جوڑی جاتی ہے

`highlight` **رنگ نہیں بلکہ قسم واپس دینے والا hook ہے** — شکل `(source, لغت) =>
{text, type?}[]` ہے، اور `type` چودہ میں سے ایک پر بند ہے: `keyword`·`string`·
`number`·`comment`·`function`·`class`·`variable`·`operator`·`punctuation`·
`tag`·`attribute`·`literal`·`regexp`·`meta` (`CODE_TOKEN_TYPES`)۔

رنگ کور کی سٹائل شیٹ خود `[data-nabi-token="…"]` selector سے طے کرتی ہے —
**صرف پانچ کا رنگ ہے** (`comment`·`string`·`keyword`·`number`·`literal`)۔
باقی قسموں پر صرف نشان لگتا ہے، رنگ کا قاعدہ نہیں، اس لیے وہ متن کے بنیادی
رنگ میں ہی نکلتی ہیں۔ قدر CSS متغیر نہیں بلکہ جما ہوا رنگ ہے، اس لیے دوسرا رنگ
یا گہرا انداز چاہیے تو وہ selector خود اوپر لکھیں۔

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

گرامر کی لغت خود پیکج میں نہیں ہے — Prism، highlight.js یا Shiki جیسی چیز خود
جوڑنا ہوگی۔

رنگ کرنے والا **wing میں جوڑا جاتا ہے** — الگ سے mount نہیں ہوتا۔
`makeCodeAttach` سے `attach` بنا کر کوڈ کی wing میں بدل دیں تو `mountSurface`
اسے خود لگا دیتا ہے۔ اس سائٹ کا ڈیمو اسی طرح Shiki جوڑنے کی مثال ہے
(`.vitepress/src/highlight.ts`)۔

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// wing کانسٹنٹ ہے — صرف attach کا کام بدلا جاتا ہے
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

`version` ساتھ دیں تو **دستاویز ویسی ہی رہے مگر رنگ کرنے والا بدل جائے** تب
دوبارہ رنگا جاتا ہے۔ گرامر کو async لانے والا highlighter (Shiki کسی زبان کو
پہلی بار ملنے پر یہی کرتا ہے) اسی صورت میں آتا ہے — گرامر پہنچنے پر دستاویز
نہیں بدلی، اس لیے `onChange` نہیں چلتا، اور یہ نہ ہو تو رنگ آنے کے لیے کوئی
اضافی حرف ٹائپ کرنا پڑے گا۔

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// گرامر دیر سے پہنچے تو — نمبر بڑھانے سے دوبارہ رنگا جاتا ہے
grammarAge += 1
```

محفوظ قدر باہر کے رواج کی پیروی کرتی ہے —
`<pre data-nabi-lang="ts"><code class="language-ts">`، اور رنگ
`data-nabi-token` خاصیت سے نکلتا ہے (inline `style` سے نہیں)۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
