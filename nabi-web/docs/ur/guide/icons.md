---
title: "آئیکن تھیم"
description: "CSS متغیرات سے وِنگ، پیش منظر، پوری اسکرین، پینل، تقابل اور جدول کی ترتیب کے آئیکن بدلیں۔ SVG، WebP اور PNG ملا کر استعمال ہو سکتے ہیں؛ غیر متعین آئیکن طے شدہ فائلیں استعمال کرتے ہیں۔"
---

# آئیکن تھیم

CSS متغیرات سے وِنگ، پیش منظر، پوری اسکرین، پینل، تقابل اور جدول کی ترتیب کے آئیکن بدلیں۔ SVG، WebP اور PNG ملا کر استعمال ہو سکتے ہیں؛ غیر متعین آئیکن طے شدہ فائلیں استعمال کرتے ہیں۔

## فائلیں منتخب کریں

CSS لوڈ کریں اور ایڈیٹر یا مشترک والد عنصر پر تھیم کلاس لگائیں۔ تصاویر کے اصل رنگ، شفافیت اور تناسب برقرار رہتے ہیں۔

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

`/icons/...` جیسے روٹ سے شروع ہونے والے راستے یا مکمل HTTPS URL استعمال کریں۔ نسبتی راستے کا تھیم فائل کے ساتھ حل ہونا یقینی نہیں۔ CSS خود ہوسٹ کرتے وقت اسی ورژن کا `dist/icons/` بھی `nabi.css` کے ساتھ نقل کریں۔ تصویر لوڈ نہ ہو تو آئیکن خالی رہتا ہے، مگر بٹن کا نام، ٹول ٹپ اور عمل دستیاب رہتے ہیں۔

## دوسرے آئیکن تلاش کریں

آئیکن عنصر کی `data-nabi-icon` قدر کے شروع میں `--nabi-icon-` لگانے سے CSS متغیر بنتا ہے۔ مثلاً `diff-close` کے لیے `--nabi-icon-diff-close` ہے۔ سیاق، مینو، محفوظ کرنے، تاریخ اور دیگر کلیدوں کے قواعد اور خاص حروف کی انکوڈنگ کے لیے <a href="/llms/icons.md" target="_blank" rel="noopener">آئیکن معاہدہ</a> دیکھیں۔

## ڈارک موڈ اور پینل

تھیم کلاس یا CSS متغیر بدلنے سے دوبارہ mount کیے بغیر آئیکن بدل جاتے ہیں۔ طے شدہ آئیکن روشن/تاریک تھیم کے مطابق ہوتے ہیں۔ اپنی فائلیں `currentColor` وراثت میں نہیں لیتیں؛ ضرورت ہو تو اوپر کی طرح تاریک متبادل دیں۔ `body` کے تحت کھلنے والے پینل بھی اصل ایڈیٹر کی آئیکن تھیم اور کلاس/اسٹائل تبدیلیوں کی پیروی کرتے ہیں۔ متغیرات ایڈیٹر یا مشترک والد پر رکھیں، صرف ٹول بار کے اندر نہیں۔

## طے شدہ بٹن دکھائیں

`showPreview` اور `showFullscreen` دونوں کی طے شدہ قدر `true` ہے۔ `false` متعلقہ بٹن، اس کے فوکس ہدف اور ایونٹس کو ہٹا دیتا ہے۔ دونوں `false` ہوں تو خالی ٹولز علاقہ بھی نہیں بنتا۔

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSR اور mount کو یکساں نمائش کے اختیارات دیں۔ ترتیب بدلنے کے لیے `tools.unmount()` کے بعد نئے اختیارات کے ساتھ mount کریں۔ دونوں بٹن درکار نہ ہوں تو ٹولز کا mount اور SSR مارک اپ شروع سے ہی چھوڑ سکتے ہیں۔ `openPreview()` اور `setFullscreen()` کی براہ راست کال دستیاب رہتی ہے۔
