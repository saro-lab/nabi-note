---
title: پیکربندی SSR
description: سندهای ذخیره‌شدهٔ NABI TREE را با ایمنی در سرور به HTML تبدیل کنید و ویرایشگر را در مرورگر hydrate کنید.
---

# پیکربندی SSR

در سرور فقط `nabi-note/ssr` را import کنید، نه surfaceها یا UI مرورگر را. این ماژول JSON ذخیره‌شدهٔ NABI TREE را اعتبارسنجی می‌کند و آن را به HTML منتشرشده یا HTML ویرایشگرِ قابل hydrate تبدیل می‌کند.

## تبدیل HTML منتشرشده

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` ورودی JSON خود را اعتبارسنجی و یکدست می‌کند، سپس HTML منتشرشده را برمی‌گرداند. `null` یعنی registry کنونی نمی‌تواند آن ورودی را بخواند. CSS بسته و `.nabi-content` را در صفحهٔ منتشرشده بگنجانید.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

`attachViewer()` را از `nabi-note/viewer` در مرورگر فقط برای مرتب‌سازی تعاملی جدول یا برجسته‌سازی کد بیفزایید. محتوای منتشرشدهٔ ساده فقط به CSS نیاز دارد.

## hydrate کردن نشانه‌گذاری ازپیش‌رندرشدهٔ ویرایشگر

برای نمایش ویرایشگر از نخستین paint، آن را در سرور با `renderStoredEditorHtml()` رندر کنید و `hydrate: true` را به surface مرورگر بدهید.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

سرور و مرورگر باید از همان سند، declarationهای wing با همان ترتیب و گزینه‌های مؤثر بر HTML استفاده کنند. خروجی سرور را بی‌تغییر به‌عنوان فرزند مستقیم ریشهٔ محتوا وارد کنید و `contenteditable` را از پیش روی آن ریشه نگذارید. اگر ساختار متفاوت باشد، surface HTML ویرایشگر تازه را رندر می‌کند.

## نوارابزار را نیز از پیش رندر کنید

`renderToolbarHtml()` و `renderViewToolsHtml()` می‌توانند کنترل‌های نوارابزار را در سرور از پیش رندر کنند. mount کردن در مرورگر، هنگامی که registry، locale و ترتیب گروه‌ها یکسان باشند، این کنترل‌ها را متصل می‌کند. DOM دلخواه میزبان درون ریشهٔ نوارابزار پشتیبانی نمی‌شود.

در SSR از APIهای مرورگر مانند `injectSheets()` استفاده نکنید. به فایل ساخته‌شدهٔ `nabi-note/nabi.css` پیوند دهید یا آن را در بستهٔ CSS خود بگنجانید.
