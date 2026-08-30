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
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

مشترک tokens کو ایک مشترک والد پر رکھیں تاکہ ایڈیٹر اور اس کا شائع شدہ منظر ایک ہی بصری زبان برقرار رکھیں۔

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

نمایاں اور متن رنگ tokens، `--nabi-hl-<name>` اور `--nabi-tc-<name>` استعمال کرتے ہیں۔ مثلاً `--nabi-hl-yellow` بدلنے سے دستاویز کا ڈیٹا بدلے بغیر محفوظ شدہ `yellow` نمایاں کا دکھائی دینے والا رنگ بدل جاتا ہے۔

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## ڈارک موڈ

لائٹ موڈ طے شدہ ہے۔ `html` یا `body` میں `.dark` شامل کریں، یا کسی خاص ایڈیٹر یا شائع شدہ body پر `data-nabi-theme="dark"` مقرر کریں۔

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

والد کے `.dark` سے باہر آنے کے لیے `data-nabi-theme="light"` استعمال کریں۔ آپ کی ایپلیکیشن تھیم تبدیل کرنا کنٹرول کرتی ہے؛ پیکیج خودکار طور پر `prefers-color-scheme` کی پیروی نہیں کرتا۔

```css
.dark .brand-note {
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
  --nabi-font: "Source Serif 4", Georgia, serif;
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
