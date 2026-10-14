---
title: CSS تھیمز
description: CSS متغیرات کے ذریعے ایڈیٹرز اور شائع شدہ مواد کے لیے رنگ، فونٹس، حجم اور ڈارک موڈ مرتب کریں۔
---

# CSS تھیمز

NABI NOTE ترمیم اور شائع شدہ مواد کے لیے ایک ہی CSS استعمال کرتا ہے۔ پیکیج اسٹائل شیٹ ایک بار لوڈ کریں، پھر سروس کنٹینر پر صرف مطلوبہ متغیرات اووررائیڈ کریں۔

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

ایڈیٹر کے `.nabi` اور شائع شدہ منظر کے `.nabi-content` کو ایک ہی تھیم کلاس دیں تاکہ یکساں متغیرات لگیں۔ سروس کا CSS پیکیج CSS کے بعد لوڈ کریں اور موجودہ تھیم `data-nabi-theme` سے بتائیں۔

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## عام متغیرات

| مقصد | متغیرات |
| --- | --- |
| متن اور پس منظر | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| بارڈر اور نمایاں رنگ | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| کونے اور سائے | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| فونٹ خاندان | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| ترمیمی surface | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| چپکی ہوئی ٹول بار اور پیش نظارہ | `--nabi-sticky-top`, `--nabi-preview-width` |
| ٹچ controls | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| موبائل موڈ میں تبدیلی کی چوڑائی | `--nabi-mobile-breakpoint` |

ہائی لائٹ اور متن کے رنگ کے لیے بالترتیب `--nabi-hl-<name>` اور `--nabi-tc-<name>` ہیں۔ سیل کے پس منظر کے لیے `--nabi-cell-<name>`، `yellow`، `green`، `cyan`، `pink`، `purple`، `orange` کو قبول کرتا ہے۔ متغیر صرف نظر آنے والا رنگ بدلتے ہیں، محفوظ نام نہیں۔

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

طے شدہ تھیم سیل کا پس منظر ہلکے رنگوں میں دکھاتی ہے۔ ڈارک موڈ نام برقرار رکھ کر الگ، زیادہ روشن اور کم سیرشدہ رنگ استعمال کرتا ہے تاکہ گہرے پس منظر پر فرق واضح رہے۔ یہ نیم شفاف رنگ پیچھے کا پس منظر دکھاتے ہیں؛ اپنی رنگت لگاتے وقت اصل صفحے کے پس منظر پر متن کا تضاد دیکھیں۔ طے شدہ رنگ متغیرات بدلنے کے لیے تھیم کلاس اوپر کی مثال کے مطابق اصل ایڈیٹر یا شائع شدہ مواد کے عنصر پر لگائیں، کسی بھی بیرونی والد عنصر پر نہیں۔

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## موبائل موڈ کی حد

طے شدہ `layout: 'compact'` ٹول بار اسکرین کی چوڑائی `36rem` سے کم ہونے پر موبائل کی ایک قطار بنتی ہے۔ عین `36rem` پر ڈیسک ٹاپ ترتیب رہتی ہے۔ ڈیسک ٹاپ پر ایڈیٹر تنگ ہو تب بھی تمام ٹولز قطاروں میں لپٹتے ہیں۔ آبجیکٹ کی خصوصیات بھی نیچے لپٹتی ہیں؛ دونوں قطاریں متن کے اوپر جگہ لیتی ہیں۔ فل اسکرین میں چوڑائی سے قطع نظر تمام ٹولز پھیل جاتے ہیں۔

موبائل پر فوری ٹولز، تمام ٹولز کا بٹن اور جڑے ہوئے پیش نظارہ/فل اسکرین بٹن مرکزی ٹول بار میں رہتے ہیں۔ خصوصیتی ٹولز ظاہر ہونے پر بھی یہ دستیاب رہتے ہیں۔ تمام ٹولز کے پیلیٹ میں ڈیسک ٹاپ کی گروپ ترتیب اور جداکار ہوتے ہیں۔ `layout: 'wrap'` ہمیشہ تمام ٹولز کو قطاروں میں لپیٹ کر دکھاتا ہے۔

موبائل پینل ٹول بار اور خصوصیتی ٹولز کے گرد دستیاب جگہ میں کھلتے ہیں۔ جدول کے سائز کا انتخاب استثنا ہے: یہ نیم شفاف پس منظر کے بیچ، آسانی سے چھونے والی 5×5 گرڈ کے ساتھ کھلتا ہے۔ کی بورڈ بند ہونے کا انتظار نہیں کرتا؛ سائز چننے پر ایک جدول داخل کر کے بند ہو جاتا ہے۔

حد بدلنے کے لیے `--nabi-mobile-breakpoint` کو `:root`، کسی بالائی عنصر یا الگ `.nabi` پر دیں۔ `rem`، `px` یا `calc()` جیسی غیر منفی CSS لمبائی استعمال کریں۔ CSS قدر، بنیادی فونٹ سائز یا اسکرین کی چوڑائی بدلنے پر کھلے پینل بھی خودکار تازہ ہوتے ہیں۔ `body` کے نیچے منتقل ان پٹ پینل اصل ایڈیٹر کی حد برقرار رکھتے ہیں۔

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

فلوٹ علاقوں کے ایک کالم میں بدلنے کی حد الگ ہے۔ اسکرین نہیں بلکہ متن کا کنٹینر `36rem` سے کم چوڑا ہو تو ایک کالم آتا ہے؛ پرنٹ میں بھی یہی ترتیب استعمال ہوتی ہے۔

## ڈارک موڈ

لائٹ موڈ طے شدہ ہے۔ `html` یا `body` میں `.dark` شامل کریں، یا کسی خاص ایڈیٹر یا شائع شدہ body پر `data-nabi-theme="dark"` مقرر کریں۔

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

والد کے `.dark` سے باہر آنے کے لیے `data-nabi-theme="light"` استعمال کریں۔ آپ کی ایپلیکیشن تھیم تبدیل کرنا کنٹرول کرتی ہے؛ پیکیج خودکار طور پر `prefers-color-scheme` کی پیروی نہیں کرتا۔

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## شائع شدہ مواد کو بھی طرز دیں

شائع شدہ HTML کو بھی `.nabi-content` اور وہی CSS درکار ہے۔ جدول، کوڈ بلاک، تصاویر، چیک لسٹس اور ڈراپ کیپس JavaScript کے بغیر رینڈر ہوتے ہیں۔ `nabi-note/viewer` صرف جدول ترتیب یا کوڈ ہائی لائٹنگ جیسے رویے کے لیے شامل کریں۔

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

جس لے آؤٹ کا اختیار پیکیج کے پاس نہیں، جیسے body کی چوڑائی اور لائن کی اونچائی، اسے اپنی سروس کلاس پر مقرر کریں۔

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## ترمیمی ساخت نہ بدلیں

ترمیمی `[data-key]` nodes پر `display` یا `white-space` نہ بدلیں، قابلِ ترمیم متن کے اندر pseudo-elements شامل نہ کریں، اور آبجیکٹ wrappers پر pointer رویہ غیر فعال نہ کریں۔ یہ قواعد کرسر کی جیومیٹری اور دستاویز mapping کو خراب کر سکتے ہیں۔

شائع شدہ ڈراپ کیپس `::first-letter` استعمال کرتے ہیں، جبکہ ترمیمی surface ایک حقیقی `[data-nabi-dropcap-letter]` عنصر استعمال کرتا ہے۔ `.nabi-editing` کے اندر دوسرا `::first-letter` قاعدہ شامل نہ کریں اور نہ اس عنصر کو بدلیں۔
