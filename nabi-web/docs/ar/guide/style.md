---
title: سمات CSS
description: اضبط الألوان والخطوط والأحجام والوضع الداكن للمحرر والمحتوى المنشور بمتغيرات CSS.
---

# سمات CSS

يستخدم NABI NOTE ملف CSS نفسه للتحرير والنشر. حمّل ورقة أنماط الحزمة مرة واحدة، ثم استبدل المتغيرات التي تحتاجها فقط في حاوية الخدمة.

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

ضع القيم المشتركة على عنصر أب مشترك حتى يحتفظ المحرر وصفحة النشر باللغة البصرية نفسها.

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

## المتغيرات الشائعة

| الغرض | المتغيرات |
| --- | --- |
| النص والخلفية | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| الحدود واللون البارز | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| الزوايا والظلال | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| عائلات الخطوط | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| سطح التحرير | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| شريط الأدوات الثابت والمعاينة | `--nabi-sticky-top`, `--nabi-preview-width` |
| عناصر اللمس | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| عرض التبديل إلى وضع الجوال | `--nabi-mobile-breakpoint` |

تستخدم قيم التمييز ولون النص `--nabi-hl-<name>` و`--nabi-tc-<name>`. مثلًا، يغيّر `--nabi-hl-yellow` لون عرض التمييز `yellow` المحفوظ من دون تغيير بيانات المستند.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## حد التبديل إلى وضع الجوال

يبدأ وضع الجوال عندما يكون عرض شريط الأدوات أو شريط السياق أو نافذة العرض أقل من `36rem`. عند `36rem` بالضبط يبقى التخطيط العادي. في وضع الجوال، يمكن تمرير شريطي الأدوات والسياق أفقيًا، وتظهر اللوحات في الوسط، وتتقلص شبكة اختيار الجدول إلى 5×5 خلايا مناسبة للمس.

اضبط `--nabi-mobile-breakpoint` على `:root` أو عنصر سلف أو عنصر `.nabi` منفرد. استخدم طول CSS غير سالب مثل `rem` أو `px` أو `calc()`. تتحدث اللوحات المفتوحة تلقائيًا عند تغيير قيمة CSS أو حجم خط الجذر أو عرض الحاوية أو نافذة العرض. وتحتفظ لوحات الإدخال المنقولة إلى داخل `body` بحد المحرر الأصلي.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

تحتفظ أجهزة اللمس بعناصر تحكم أكبر حتى فوق هذا الحد.

## الوضع الداكن

الوضع الفاتح هو الافتراضي. أضف `.dark` إلى `html` أو `body`، أو ضع `data-nabi-theme="dark"` على محرر أو محتوى منشور محدد.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

استخدم `data-nabi-theme="light"` للخروج من `.dark` في عنصر أب. يتحكم تطبيقك في تبديل السمة، ولا تتبع الحزمة `prefers-color-scheme` تلقائيًا.

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

## نسّق المحتوى المنشور أيضًا

يحتاج HTML المنشور إلى `.nabi-content` وCSS نفسها. تُعرض الجداول وكتل الشفرة والصور وقوائم التحقق والحروف الاستهلالية بلا JavaScript. لا تضف `nabi-note/viewer` إلا لسلوك مثل فرز الجداول أو تلوين الشفرة.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Naskh Arabic", serif;
  --nabi-bg: transparent;
}
```

ضع التخطيط الذي لا تديره الحزمة، مثل عرض النص وارتفاع السطر، على فئة خدمتك.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## لا تغيّر بنية التحرير

لا تغيّر `display` أو `white-space` لعقد `[data-key]` أثناء التحرير، ولا تضف pseudo-elements داخل النص القابل للتحرير، ولا تعطل سلوك المؤشر على أغلفة العناصر. قد تكسر هذه القواعد هندسة المؤشر وربط المستند.

تستخدم الحروف الاستهلالية المنشورة `::first-letter`، بينما يستخدم سطح التحرير عنصرًا فعليًا `[data-nabi-dropcap-letter]`. لا تضف قاعدة `::first-letter` أخرى داخل `.nabi-editing` ولا تستبدل ذلك العنصر.
