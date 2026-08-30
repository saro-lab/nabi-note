---
title: استفادهٔ پایه
description: یک ویرایشگر NABI NOTE در مرورگر بسازید، سپس سندهای آن را ذخیره و بازیابی کنید.
---

# استفادهٔ پایه

این راهنما ویرایشگر رندرشده در سمت کاربر (CSR) در مرورگر را پوشش می‌دهد: wingها را انتخاب کنید، ویرایشگر و UI آن را mount کنید، سپس JSON ‏NABI TREE را ذخیره و بازیابی کنید.

## نصب و افزودن نشانه‌گذاری پایه

```bash
npm install nabi-note
```

برای ویرایشگر و محتوای منتشرشده stylesheet یکسانی را بارگیری کنید. خودتان `contenteditable` را اضافه نکنید؛ مالک آن `mountSurface()` است.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## mount کردن یک ویرایشگر

`allBasic()` wingهای رسمیِ قابل استفاده بدون اتصال ویژهٔ برنامه را انتخاب می‌کند. wingهای متصل به سرویس مانند بارگذاری، ذخیره‌سازی فایل یا مقایسهٔ سند را مطابق راهنمای اختصاصی هرکدام بیفزایید.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'en',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'en',
  placeholder: 'Write something.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
})
```

`locale` متن نوارابزار و راهنما را کنترل می‌کند؛ همان مقدار را به هر UI mount بدهید. `placeholder` تنها برای ویرایشگر خالی نمایش داده می‌شود. `onError` خطاهای جداشده از commandها و callbackها را می‌گیرد. `undoLimit` تعداد ورودی‌های undo است (پیش‌فرض ۲۰۰). `typingMergeMs` فاصله‌ای است که نوشتن‌های پیاپی را در یک گام undo ادغام می‌کند؛ برای جدا نگه‌داشتن هر درج، آن را `0` بگذارید.

هر ویرایشگر به ریشه‌های محتوا و نوارابزارِ مجزای خود نیاز دارد. در صفحه‌ای با چند ویرایشگر، از راه `surface` به هر نوارابزار surface ویرایشگر خود را بدهید تا focus و میانبرها با هم تداخل نکنند.

## انتخاب wingها

از `use()` و `drop()` برای نگه‌داشتن تنها قابلیت‌های لازم استفاده کنید. صفحهٔ هر wing گزینه‌های قابل‌پذیرش آن را مستند می‌کند.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

برای بسته‌ای کوچک‌تر، فقط wingهای مورد نیاز مانند `boldWing` و `imageWing` را به‌صورت آرایه بدهید. نام‌های ناشناخته، گزینه‌های نامعتبر و وابستگی‌های غایب، هنگام ساخت ویرایشگر فوراً خطا می‌دهند.

## ذخیره و بارگذاری

وقتی سند دوباره ویرایش خواهد شد، خروجی `getJson()` را به‌صورت JSON ‏NABI TREE ذخیره کنید. `getHtml()` برای خروجی منتشرشده است. هرگز نتیجهٔ مخصوص ویرایشگرِ `getEditorHtml()` را ذخیره نکنید.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

برای وارد کردن HTML بیرونی از `setHtml()` استفاده کنید. ویرایشگر مرورگر parser HTML خود را دارد، پس گزینهٔ parser لازم نیست. `setJson()` و `setHtml()` برای ورودی نامعتبرِ غیرخالی `false` برمی‌گردانند و سند کنونی را دست‌نخورده می‌گذارند.

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON و HTML هر دو ورودی غیرقابل‌اعتمادند. NABI NOTE آن‌ها را از راه wingهای ثبت‌شده و قواعد مجازشان می‌خواند، اما این جایگزین مجوز بارگذاری یا سیاست امنیتی سرویس شما نیست.

## APIهای رایج

| کار | API |
| --- | --- |
| ساخت ویرایشگر | `createNabiWith`, `wings` |
| mount کردن surface و نوارابزار | `mountSurface`, `mountToolbar` |
| ذخیره و بازیابی | `getJson`, `setJson`, `getHtml`, `setHtml` |
| مشاهدهٔ تغییرها | `nabi.onChange(listener)` |
| undo و redo | `nabi.undo()`, `nabi.redo()` |
| رندر HTML در سرور | `renderStoredHtml` از `nabi-note/ssr` |
| افزودن رفتار صفحهٔ منتشرشده | `attachViewer` از `nabi-note/viewer` |
| مقایسهٔ سندها | `diffDocs` از `nabi-note/diff` |

برای typeهای دقیق و هر argument، ابتدا declarationهای بستهٔ نصب‌شده را بررسی کنید. ابزارهای خودکار نیز می‌توانند از [مرجع API انگلیسی](https://nabi.saro.me/llms/api-reference.md) استفاده کنند.

## آزادسازی mountها

به‌ترتیب معکوس ساخت unmount کنید. `innerHTML` ریشهٔ ویرایش را مستقیماً تغییر ندهید؛ سندها را از راه APIهای عمومی مانند `setJson()`، `setHtml()` یا `applyCommand()` تغییر دهید.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
