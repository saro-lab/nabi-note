---
title: کدنویسی وایب با AI
description: با تکیه بر API عمومی کنونی و مرزهای مستندات، به عامل‌های کدنویسی کمک کنید NABI NOTE را دقیق به‌کار ببرند.
---

# کدنویسی وایب با AI

NABI NOTE برای ابزارهای AI و خودکارسازی، [`llms.txt`](/llms.txt) را فراهم می‌کند. به‌جای آن‌که از عامل بخواهید کل کتابخانه را حدس بزند، از آن فهرست آغاز کنید و بگذارید فقط سندهای لازم برای کار را بخواند.

## prompt آغازین

framework و قابلیت‌های مورد نیاز را پر کنید.

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

اگر عامل نمی‌تواند URLها را باز کند، `llms.txt` و سندهای پیوندشدهٔ مرتبط را در گفتگو بگنجانید.

## فقط به چیزهای لازم ارجاع دهید

`llms.txt` یک فهرست فشرده است. دادن تنها صفحه‌های مرتبط به عامل معمولاً سودمندتر از فرستادن یک‌جای همهٔ سندها است.

- پیکربندی npm: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- پیکربندی CDN: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- انتخاب wing: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- JSON و HTML ذخیره‌شده و رویدادهای تغییر: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- مرزهای وارد کردن HTML، paste و بارگذاری: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- wingهای سفارشی و رندر سرور: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md)، [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- viewer، diff، سبک‌ها و حروف آغازین بزرگ: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md)، [`styling.md`](https://nabi.saro.me/llms/styling.md)
- importها و typeهای دقیق: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## نیازمندی‌های محصول را بگنجانید

عامل نمی‌تواند تنها از صفحهٔ ویرایش، ذخیره‌سازی، سیاست امنیتی یا رفتار بارگذاری را نتیجه بگیرد. framework واقعی، wingهای شامل و مستثنا، ذخیره شدن یا نشدن JSON و HTML، قرارداد درخواست و پاسخ endpoint بارگذاری، محدودیت‌های فایل و نیاز یا عدم نیاز صفحه‌های منتشرشده به SSR، رفتار viewer یا diff را مشخص کنید.

برای هر چیزی که هنوز تصمیم نگرفته‌اید، از عامل بخواهید پیش از اجرای انتخاب، گزینه‌ها و اثرشان را توضیح دهد.

## نتیجه را بازبینی کنید

کد تولیدشده را مانند هر کد دیگری بازبینی کنید. به‌ویژه بررسی کنید که:

- `nabi-note/nabi.css` را برای ویرایش و محتوای منتشرشده بارگیری می‌کند؛
- برای wingهای انتخاب‌شده و هر mount از `registry` یکسان استفاده می‌کند؛
- `getJson()` را ذخیره می‌کند، نه `getEditorHtml()` را؛
- مستقیماً در `innerHTML` عنصر `.nabi-content` در حال ویرایش نمی‌نویسد؛
- هنگام بسته‌شدن صفحه هر mount را unmount می‌کند؛
- نوع MIME، اندازه، مجوز و محل ذخیره را در سرور بارگذاری اعتبارسنجی می‌کند؛
- در سرور و مرورگر از ترتیب wing و گزینه‌های مؤثر بر HTML یکسان استفاده می‌کند؛
- نام exportهای واقعی را با type checking، آزمون‌ها و build تأیید می‌کند.

رفتار IME و caret و مسیرهای ذخیره و بارگذاری، حتی اگر صفحه یک‌بار درست به‌نظر برسد، به بررسی واقعی نیاز دارند. ورودی composition در موبایل و بازیابی سند ذخیره‌شده را نیز بیازمایید.

## نسخهٔ نصب‌شده را ترجیح دهید

وقتی پروژه از پیش `nabi-note` را نصب کرده است، exportهای `package.json` و declarationهای type آن از وب‌سایتی که برای انتشار دیگری ساخته شده مرتبط‌ترند. از عامل بخواهید پیش از نوشتن کد تفاوت نسخه را بررسی کند.
