---
title: CDN سے استعمال کرنا
description: CDN مثال
---

# CDN سے استعمال کرنا

<CdnDemo />

---

## یہ سب کیا ہوا

اوپر دی گئی فائل بغیر کچھ پڑھے بھی چلتی ہے۔ صرف اسے بدلنا ہو تو ذیل دیکھیں۔

### دو ٹیگ ہی نصب کرنا ہیں

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

پیکج جو **کچھ بھی** ایکسپورٹ کرتا ہے وہ سب ایک عالمی (global) `NabiNote` پر ٹکا ہوتا
ہے۔ **سٹائل شیٹ آپ خود لگاتے ہیں** — mount CSS خود نہیں ڈالتا، اس لیے `<link>` بھول
گئے تو ایڈیٹر ننگا نظر آئے گا۔

### ڈھانچہ

```html
<div id="app" class="nabi">                    <!-- رنگ، کونے، فونٹ اسی جڑ میں رہتے ہیں -->
  <div id="chrome" class="nabi-toolbar">        <!-- ٹول بار اور سیاق سطر ایک ساتھ لگتے ہیں -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- پیش نظارہ، مکمل سکرین (آخری کنارے پر) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- کیریٹ جس چیز پر ہے اس کے حساب سے خود بھر جاتا ہے -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

`id` کوئی بھی نام ہو سکتا ہے — mount کو جو دیا جاتا ہے وہ **ایلیمنٹ** ہے، نام نہیں۔
چار کلاسیں (`nabi`، `nabi-toolbar`، `nabi-toolbar-row`، `nabi-content`) وہ ہینڈل
ہیں جن کو سٹائل شیٹ پکڑتی ہے، انہیں ویسے ہی رہنے دیں۔ اگر پیش نظارہ اور مکمل سکرین
نہیں چاہیے تو `<span id="tools">` اور `mountViewTools` والی سطر ساتھ ہٹا دیں —
**مگر اسے ٹول بار کے اندر نہ رکھیں۔** یہ جگہ دائیں طرف تیرنے کے لیے ہے، بٹنوں کے
درمیان آ جائے تو قطار بگڑ جاتی ہے۔

### wing چننا

`defaultWings` بنیادی انتیس wing کی فہرست ہے۔ اوپر والی فائل نے صرف اپ لوڈ ہٹایا
ہے۔ صرف جو چاہیے وہ چننا ہو تو نام سے لکھ دیں۔

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

ہر wing الگ سے [{{ t('menu_wing') }}](../wing/inline/bold) میں دیکھیں۔

### قدر نکالنا

| | |
|---|---|
| `nabi.getHtml()` | محفوظ کرنے اور شائع کرنے کے لیے HTML |
| `nabi.getJson()` | nabi-tree (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | دوبارہ ڈالنا |
| `nabi.onChange(fn)` | جب بھی قدر بدلے |
| `N.renderStoredHtml(json, registry)` | محفوظ شدہ دستاویز کو ایڈیٹر کے بغیر HTML میں بدلنا (نیچے [پڑھنے والی سکرین](#پڑھنے-والی-سکرین) دیکھیں) |

---

## پتہ (address)

ورژن کو مقفل رکھنے کے لیے پتے میں ورژن نمبر لگائیں۔ unpkg بھی وہی فائل دیتا ہے۔

**ورژن نمبر کے بغیر پتہ (`/npm/nabi-note`) استعمال نہ کریں** — jsDelivr اس جگہ کو
دیر تک cache کرتا ہے، اس لیے bundle اور سٹائل شیٹ دو مختلف ورژن کے مل سکتے ہیں۔

| | پتہ |
|---|---|
| **bundle (تازہ ترین)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **bundle (مقفل)** | <code>{{ CDN_BUNDLE }}</code> |
| **سٹائل شیٹ (تازہ ترین)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **سٹائل شیٹ (مقفل)** | <code>{{ CDN_SHEET }}</code> |
| **bundle** (unpkg) | `https://unpkg.com/nabi-note` |

bundle npm کے پیکج کے ساتھ ہی نکلتا ہے، اس لیے **CDN الگ سے شائع نہیں ہوتا۔**

---

## پڑھنے والی سکرین

جو صفحہ محفوظ HTML کو **صرف دکھاتا ہے** وہ ایڈیٹر نہیں کھڑا کرتا۔ وہی سٹائل شیٹ
لگا کر `.nabi-content` کے اندر قدر ڈال دیں تو ایڈیٹر میں جیسا دکھتا تھا ویسا ہی
دکھے گا۔

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- getHtml() سے محفوظ کی گئی قدر -->
</div>
```

ایک ہی سٹائل شیٹ فائل میں **تمام wing کا CSS شامل ہے** — فائل کو یہ نہیں معلوم کہ
کون سا wing رجسٹر کیا گیا ہے، اس لیے سب کچھ ساتھ لے جاتی ہے۔

HTML نہیں بلکہ **nabi tree (JSON) کے طور پر محفوظ کر رکھا ہو** تو ایڈیٹر کھڑا کیے بغیر
وہیں کھینچا جا سکتا ہے۔ درکار چیزیں دو ہیں — محفوظ شدہ دستاویز اور رجسٹر شدہ wing کی
فہرست۔

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['ایک تبصرہ سطر'] }]   // سرور سے ملی nabi tree
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

nabi tree نہ ہو تو `null` دیتا ہے، اور گزرنے والی قدر ایڈیٹر کی نکالی `getHtml()` سے ایک
حرف بھی مختلف نہیں ہوتی — XSS چھاننے کی جگہ بھی وہی ہے۔ یہ دروازہ DOM استعمال نہیں کرتا،
اس لیے سرور (Node.js) پر بھی جوں کا توں چلتا ہے، اور **HTML سرور پر پہلے سے بنا کر بھیجنے
کا راستہ** اسی دروازے سے کھلتا ہے
([{{ t('menu_intro_ssr') }}](./ssr#صرف-محفوظ-شدہ-دستاویز-دکھانے-کی-جگہ-ایڈیٹر-کھڑا-نہیں-کرتے) دیکھیں)۔

---

## اگلی دستاویزات

- [{{ t('menu_intro_usage') }}](./usage) — npm سے جوڑنے کا راستہ، تعمیر، ان پٹ اور آؤٹ پٹ سب کچھ
- [{{ t('menu_wing_custom') }}](../wing/custom) — جو فارمیٹنگ موجود نہیں اسے خود بنانا

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// ورژن نمبر ہاتھ سے نہیں لکھا جاتا — nabi-npm کے package.json سے سیدھا پڑھا جاتا ہے
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
