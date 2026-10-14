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
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

عيّن فئة السمة نفسها لـ `.nabi` في المحرر و`.nabi-content` في العرض المنشور لتطبيق المتغيرات نفسها عليهما. حمّل CSS الخدمة بعد CSS الحزمة، وحدد السمة الحالية عبر `data-nabi-theme`.

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

يستخدم التمييز ولون النص `--nabi-hl-<name>` و`--nabi-tc-<name>` على الترتيب. تستخدم خلفيات الخلايا `--nabi-cell-<name>` مع `yellow` و`green` و`cyan` و`pink` و`purple` و`orange`. تغيّر المتغيرات اللون المعروض فقط، لا اسم اللون المخزن.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

تعرض السمة الافتراضية خلفيات الخلايا بألوان خفيفة. يحتفظ الوضع الداكن بأسماء الألوان، لكنه يستخدم ألوانًا منفصلة أكثر سطوعًا وأقل تشبعًا ليسهل تمييزها على الخلفية الداكنة. تسمح هذه الألوان شبه الشفافة بظهور الخلفية؛ عند تخصيصها، تحقق من تباين النص على خلفية الصفحة الفعلية. لتجاوز متغيرات اللون الافتراضية، طبّق فئة السمة على عنصر المحرر أو المحتوى المنشور نفسه كما في المثال، لا على أي عنصر أب خارجي.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## حد التبديل إلى وضع الجوال

يتحول الشريط الافتراضي `layout: 'compact'` إلى صف جوال واحد عندما يقل عرض الشاشة عن `36rem`. عند `36rem` بالضبط يحتفظ بتخطيط سطح المكتب. على سطح المكتب تلتف جميع الأدوات إلى صفوف حتى لو كان المحرر ضيقًا. تلتف خصائص الكائنات أسفلها أيضًا، ويشغل الصفان مساحة فوق النص. يعرض ملء الشاشة جميع الأدوات مهما كان العرض.

على الجوال تبقى الأدوات السريعة وزر جميع الأدوات وأزرار المعاينة/ملء الشاشة المرتبطة في الشريط الرئيسي، وتظل متاحة عند ظهور أدوات الخصائص. تستخدم لوحة جميع الأدوات ترتيب المجموعات والفواصل نفسه على سطح المكتب. يعرض `layout: 'wrap'` دائمًا جميع الأدوات مع التفاف الصفوف.

تفتح لوحات الجوال في المساحة المتاحة حول الشريط وأدوات الخصائص. منتقي حجم الجدول استثناء: يفتح في الوسط فوق خلفية شبه شفافة بشبكة 5×5 سهلة اللمس. لا ينتظر إغلاق لوحة المفاتيح؛ اختيار الحجم يدرج جدولًا واحدًا ثم يغلق المنتقي.

عيّن `--nabi-mobile-breakpoint` على `:root` أو عنصر سلف أو `.nabi` منفرد لتغيير الحد. استخدم طول CSS غير سالب مثل `rem` أو `px` أو `calc()`. تُطبّق تغييرات قيمة CSS أو حجم خط الجذر أو عرض الشاشة تلقائيًا على اللوحات المفتوحة أيضًا. تحتفظ لوحات الإدخال المنقولة تحت `body` بحد محررها الأصلي.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

للمناطق العائمة حد مستقل للتحول إلى عمود واحد: يعتمد على عرض حاوية النص، لا الشاشة، عندما يقل عن `36rem`. وتستخدم الطباعة التخطيط نفسه.

## الوضع الداكن

الوضع الفاتح هو الافتراضي. أضف `.dark` إلى `html` أو `body`، أو ضع `data-nabi-theme="dark"` على محرر أو محتوى منشور محدد.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

استخدم `data-nabi-theme="light"` للخروج من `.dark` في عنصر أب. يتحكم تطبيقك في تبديل السمة، ولا تتبع الحزمة `prefers-color-scheme` تلقائيًا.

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

## نسّق المحتوى المنشور أيضًا

يحتاج HTML المنشور إلى `.nabi-content` وCSS نفسها. تُعرض الجداول وكتل الشفرة والصور وقوائم التحقق والحروف الاستهلالية بلا JavaScript. لا تضف `nabi-note/viewer` إلا لسلوك مثل فرز الجداول أو تلوين الشفرة.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
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
