---
title: ادغام
description: نسخهٔ شروع ویرایش، نسخهٔ خودتان و نسخهٔ ذخیره‌شده در این فاصله را ترکیب و تعارض‌های باقی‌مانده را ویرایش و حل کنید.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# ادغام

اگر هنگام ویرایش شما تغییرات دیگری ذخیره شد، دو طرف را بر پایهٔ نسخهٔ شروع ترکیب کنید. هر تغییر قابل ادغام خودکار از ابتدا اعمال می‌شود؛ فقط تغییرات هم‌پوشان تعارض می‌مانند. این نمای مستقل `nabi-note/merge` است، نه wing.

| چپ | وسط | راست |
| --- | --- | --- |
| نسخهٔ شروع ویرایش | سند فعلی شما پس از ادغام خودکار | نسخهٔ ذخیره‌شده هنگام ویرایش شما |
| فقط خواندنی | قابل ویرایش مستقیم | فقط خواندنی |

در وسط، متن، قالب‌بندی، جدول، فهرست و تصویر را مانند ویرایشگر معمولی تغییر دهید. wingهای داده‌شده قابلیت‌ها را تعیین می‌کنند. نشانه‌ها و وضعیت حل تعارض وارد محتوای ذخیره‌شده نمی‌شوند.

## نمونهٔ کاملاً خودکار

شما زمان جلسه را به **۱۱ صبح** و فرد دیگری مکان را به **اتاق جلسهٔ طبقهٔ سوم** تغییر داده‌اید. چون بندها متفاوت‌اند، هر دو تغییر در نتیجهٔ وسط هستند.

بدون تعارض باقی‌مانده می‌توانید فوراً **تأیید** کنید یا ابتدا متن وسط را بهبود دهید. سند نهایی پایین همان نتیجهٔ واقعی دریافت‌شده توسط callback تأیید است.

<MergeDemo />

## نمونهٔ نیمه‌خودکار

این بار شما زمان را **۱۱ صبح** و دیگری **۲ بعدازظهر** کرده‌اید. تغییر متفاوت یک بند، زمان را در تعارض نگه می‌دارد. تغییر مسئولان به **جیمین و سویون** و مکان به **اتاق جلسهٔ طبقهٔ سوم** خودکار اعمال می‌شوند.

تعارض را با یکی از این روش‌ها حل کنید:

- چپ **&gt;&gt;**: محتوای مربوط از نسخهٔ شروع را بپذیرید.
- راست **&lt;&lt;**: محتوای مربوط از نسخهٔ تازه‌ذخیره‌شده را بپذیرید.
- **حل با محتوای فعلی**: وسط را نگه دارید یا ویرایش کنید و حل‌شده علامت بزنید.

جملهٔ زمان وسط را تغییر دهید و **حل با محتوای فعلی** را بزنید. تنها پس از حل همهٔ تعارض‌ها می‌توان تأیید کرد.

<MergeDemo partial />

ویرایش مجدد ناحیهٔ حل‌شده وضعیتش را حفظ می‌کند. واگرد حل، وضعیت را هم برمی‌گرداند؛ انجام دوباره آن را بازمی‌گرداند. حذف یا ویرایش متن به‌تنهایی تعارض باز را خودکار حل نمی‌کند.

## قواعد ادغام خودکار و تعارض

تغییرات از سند شروع به سند شما و از همان شروع به نسخهٔ جدید مقایسه می‌شوند. تغییرات یک‌طرفه و یکسان در دو طرف خودکار اعمال می‌شوند؛ تغییرات بندها یا خط‌های جدا نیز ترکیب می‌شوند.

مانند ادغام متن Git، هم‌پوشانی بر پایهٔ بند و خط سنجیده می‌شود. حتی تغییر واژه‌های متفاوت یک خط تعارض می‌ماند. درج متفاوت در یک محل یا ویرایش محتوای حذف‌شده توسط طرف دیگر هم تصمیم می‌خواهد.

اگر دو طرف بلوک ساختاری مانند جدول، فهرست یا ناحیهٔ شناور را متفاوت تغییر دهند، کل ساختار تعارض می‌شود. سلول‌ها و موارد فهرست خودسرانه مخلوط نمی‌شوند؛ محتوا را انتخاب یا وسط را ویرایش کنید. جابه‌جایی و ویرایش هم‌پوشان با مکان نامطمئن هم خودکار اعمال نمی‌شوند.

## اتصال نمای ادغام مستقل

NABI TREE JSON ذخیره‌شده یا رشتهٔ HTML را به `base`، `local` و `incoming` بدهید. از wingها و گزینه‌های ویرایشگر اصلی استفاده کنید. `mountMerge()` ویرایشگر وسط، نوار ابزار، دو منبع، ابزار تعارض و دکمهٔ تأیید را می‌سازد.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'fa',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm`، JSON، HTML انتشار، revision ویرایش و `incomingVersion` نتیجهٔ فعلی کاملاً حل‌شده را می‌گیرد. بازگرداندن `false` تأیید را تمام نمی‌کند. هنگام انتظار Promise، ویرایش، انتخاب تعارض و تأیید تکراری مسدودند. برچیدن نما `signal` نتیجه را لغو می‌کند. ترکیب نویسهٔ کره‌ای با IME باید پیش از تأیید تمام شود.

کارهای سرویس مانند انتخاب تصویر یا بارگذاری را مانند ویرایشگر معمولی وصل کنید. `toolbarOptions` پنل‌ها و کارهای میزبان، و `surfaceOptions` گزینه‌های سطح ویرایش را می‌گیرند.

`incomingVersion` مقدار سرویس را بدون تغییر برمی‌گرداند. سرویس باید هنگام ذخیره آن را با تازه‌ترین نسخهٔ سرور مقایسه کند. اگر هنگام ادغام نسخهٔ دیگری ذخیره شد، تازه‌ترین سند را بگیرید و ادغام تازه‌ای شروع کنید؛ نتیجهٔ قدیمی را روی آن ننویسید.

از بیرون نما نیز می‌توان وضعیت را خواند یا تأیید را فراخوانی کرد.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

نتیجه را با `merge.nabi.getJson()` و `merge.nabi.getHtml()` بخوانید. DOM ویرایش یا `getEditorHtml()` را ذخیره نکنید. برای اعمال تنها محتوای قبلی انتخاب‌شده بین دو نسخه، ادغام کلیکی [مقایسه](./compare) را به کار ببرید.

## تأیید پس از پایان بارگذاری

wing `upload` و `mountUpload()` را برای دکمهٔ فایل، چسباندن و کشیدن‌ورهانیدن وصل کنید. `sendUpload` فایل را به سرور می‌فرستد و `{ uri }` برمی‌گرداند. نمونهٔ کامل اتصال و نمایش پیشرفت در [بارگذاری فایل](../wing/etc/upload) است.

با `merge.session.hold()` تأیید و انتخاب تعارض را هنگام کار ناهمگام مانند بارگذاری که هنوز وارد سند نشده متوقف کنید. تابع برگشتی را هنگام پایان، لغو یا برچیدن فراخوانی کنید. توقف را **پس از درج در سند** بردارید، نه بلافاصله پس از بارگذاری سرور، تا فایل از نتیجهٔ نهایی جا نماند.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'fa',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'fa',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` همان DOM وسط است؛ `merge.surface` و `merge.toolbar` قبلاً نصب شده‌اند. سطح یا نوار دیگری در همان جا نسازید. نخست mountهای اضافی بارگذاری و پیشرفت را بردارید و در پایان `merge.unmount()` را فراخوانی کنید.
