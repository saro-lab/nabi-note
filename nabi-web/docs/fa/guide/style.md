---
title: پوسته‌های CSS
description: رنگ‌ها، قلم‌ها، اندازه‌ها و حالت تیرهٔ ویرایشگر و محتوای منتشرشده را با متغیرهای CSS پیکربندی کنید.
---

# پوسته‌های CSS

NABI NOTE از CSS یکسانی برای ویرایش و محتوای منتشرشده استفاده می‌کند. stylesheet بسته را یک‌بار بارگیری کنید، سپس فقط متغیرهای مورد نیاز را روی container سرویس بازنویسی کنید.

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

tokenهای مشترک را روی یک والد مشترک بگذارید تا ویرایشگر و نمای منتشرشدهٔ آن زبان بصری یکسانی داشته باشند.

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

## متغیرهای رایج

| کاربرد | متغیرها |
| --- | --- |
| متن و پس‌زمینه | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| کادر و رنگ تأکیدی | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| گوشه‌ها و سایه‌ها | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| خانواده‌های قلم | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| surface ویرایش | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| نوارابزار و پیش‌نمایش چسبان | `--nabi-sticky-top`, `--nabi-preview-width` |
| کنترل‌های لمسی | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| عرض تغییر به حالت موبایل | `--nabi-mobile-breakpoint` |

tokenهای برجسته‌سازی و رنگ متن از `--nabi-hl-<name>` و `--nabi-tc-<name>` استفاده می‌کنند. برای نمونه، تغییر `--nabi-hl-yellow` رنگ نمایشی برجسته‌سازی‌های ذخیره‌شدهٔ `yellow` را بدون تغییر دادهٔ سند عوض می‌کند.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## آستانهٔ حالت موبایل

وقتی عرض نوار ابزار، نوار زمینه یا نمای صفحه کمتر از `36rem` باشد، حالت موبایل فعال می‌شود. در عرض دقیقاً `36rem` چیدمان عادی حفظ می‌شود. در حالت موبایل، نوار ابزار و نوار زمینه به‌صورت افقی پیمایش می‌شوند، پنل‌ها در مرکز قرار می‌گیرند و شبکهٔ انتخاب جدول به 5×5 خانهٔ مناسب لمس کاهش می‌یابد.

برای تغییر آستانه، `--nabi-mobile-breakpoint` را روی `:root`، یک عنصر بالادست یا یک `.nabi` مشخص تنظیم کنید. از طول غیرمنفی CSS مانند `rem`، `px` یا `calc()` استفاده کنید. تغییر مقدار CSS، اندازهٔ قلم ریشه، عرض ظرف یا نمای صفحه، پنل‌های باز را هم خودکار به‌روز می‌کند. پنل‌های ورودی منتقل‌شده به زیر `body` همچنان از آستانهٔ ویرایشگر اصلی پیروی می‌کنند.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

در دستگاه‌های لمسی، کنترل‌های بزرگ‌تر در عرض‌های بالاتر از این آستانه هم حفظ می‌شوند.

## حالت تیره

حالت روشن پیش‌فرض است. `.dark` را به `html` یا `body` بیفزایید، یا `data-nabi-theme="dark"` را روی ویرایشگر یا بدنهٔ منتشرشدهٔ مشخصی قرار دهید.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

برای خارج شدن از `.dark` والد از `data-nabi-theme="light"` استفاده کنید. برنامهٔ شما تغییر پوسته را کنترل می‌کند؛ بسته به‌طور خودکار از `prefers-color-scheme` پیروی نمی‌کند.

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

## محتوای منتشرشده را هم سبک‌دهی کنید

HTML منتشرشده نیز به `.nabi-content` و همان CSS نیاز دارد. جدول‌ها، بلوک‌های کد، تصویرها، فهرست‌های تیک‌دار و حروف آغازین بزرگ بدون JavaScript رندر می‌شوند. `nabi-note/viewer` را فقط برای رفتارهایی مانند مرتب‌سازی جدول یا برجسته‌سازی کد بیفزایید.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

چیدمانی را که بسته مالک آن نیست، مانند عرض بدنه و ارتفاع خط، روی class سرویس خود تنظیم کنید.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## ساختار ویرایش را تغییر ندهید

`display` یا `white-space` را روی nodeهای `[data-key]` در حال ویرایش تغییر ندهید، pseudo-element درون متن قابل‌ویرایش نیفزایید و رفتار pointer را روی wrapperهای شیء غیرفعال نکنید. این قواعد می‌توانند هندسهٔ caret و نگاشت سند را مختل کنند.

حروف آغازین بزرگِ منتشرشده از `::first-letter` استفاده می‌کنند، درحالی‌که surface ویرایش از عنصر واقعی `[data-nabi-dropcap-letter]` استفاده می‌کند. قاعدهٔ `::first-letter` دیگری درون `.nabi-editing` نیفزایید و آن عنصر را جایگزین نکنید.
