---
title: "پوستهٔ آیکون‌ها"
description: "با متغیرهای CSS آیکون‌های بال‌ها، پیش‌نمایش، تمام‌صفحه، پنل‌ها، مقایسه و مرتب‌سازی جدول را عوض کنید. SVG، WebP و PNG را می‌توان ترکیب کرد؛ آیکون‌های مشخص‌نشده از فایل پیش‌فرض استفاده می‌کنند."
---

# پوستهٔ آیکون‌ها

با متغیرهای CSS آیکون‌های بال‌ها، پیش‌نمایش، تمام‌صفحه، پنل‌ها، مقایسه و مرتب‌سازی جدول را عوض کنید. SVG، WebP و PNG را می‌توان ترکیب کرد؛ آیکون‌های مشخص‌نشده از فایل پیش‌فرض استفاده می‌کنند.

## انتخاب فایل‌ها

CSS را بارگذاری کنید و کلاس پوسته را روی ویرایشگر یا والد مشترک قرار دهید. رنگ‌ها، شفافیت و نسبت ابعاد اصلی تصاویر حفظ می‌شوند.

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

از مسیر ریشه مانند `/icons/...` یا نشانی کامل HTTPS استفاده کنید. تضمینی نیست که مسیر نسبی از کنار فایل پوسته محاسبه شود. برای میزبانی CSS، همان نسخهٔ `dist/icons/` را کنار `nabi.css` کپی کنید. اگر تصویر بارگذاری نشود، آیکون خالی می‌ماند، اما نام، راهنما و عملکرد دکمه حفظ می‌شود.

## پیدا کردن آیکون‌های دیگر

با افزودن `--nabi-icon-` به ابتدای مقدار `data-nabi-icon` عنصر، نام متغیر CSS به دست می‌آید. مثلاً `diff-close` از `--nabi-icon-diff-close` استفاده می‌کند. قواعد کلیدهای زمینه، منو، ذخیره، تاریخچه و موارد دیگر و رمزگذاری نویسه‌های خاص در <a href="/llms/icons.md" target="_blank" rel="noopener">قرارداد آیکون‌ها</a> آمده است.

## حالت تیره و پنل‌ها

تغییر کلاس پوسته یا متغیر CSS آیکون‌ها را بدون mount مجدد به‌روز می‌کند. آیکون‌های پیش‌فرض از پوستهٔ روشن/تیره پیروی می‌کنند. فایل‌های سفارشی `currentColor` را به ارث نمی‌برند؛ در صورت نیاز مانند مثال بالا نسخهٔ تیره تعیین کنید. پنل‌های زیر `body` نیز از پوستهٔ آیکون و تغییرات کلاس/سبک ویرایشگر مبدأ پیروی می‌کنند. متغیرها را روی ویرایشگر یا والد مشترک بگذارید، نه فقط داخل نوار ابزار.

## نمایش دکمه‌های پیش‌فرض

مقدار پیش‌فرض `showPreview` و `showFullscreen` هر دو `true` است. مقدار `false` دکمهٔ مربوط، هدف فوکوس و رویدادهایش را حذف می‌کند. اگر هر دو `false` باشند، ناحیهٔ ابزار خالی هم ساخته نمی‌شود.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

گزینه‌های نمایش یکسان را به SSR و mount بدهید. برای تغییر تنظیمات، `tools.unmount()` را فراخوانی و با گزینه‌های جدید mount کنید. اگر هیچ‌کدام از دکمه‌ها لازم نیست، همچنان می‌توان mount ابزار و نشانه‌گذاری SSR را کاملاً حذف کرد. فراخوانی مستقیم `openPreview()` و `setFullscreen()` همچنان ممکن است.
