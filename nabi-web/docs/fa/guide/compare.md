---
title: مقایسه
description: دو سند را کنار هم مقایسه کنید و محتوای قبلی انتخاب‌شده را در سند فعلی اعمال کنید.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# مقایسه

دو سند ذخیره‌شده را کنار هم ببینید تا تغییرات مشخص شوند. نما بدون ویرایشگر هم باز می‌شود؛ با اتصال callback می‌توان محتوای قبلی انتخاب‌شده را در سند فعلی اعمال کرد.

## اعمال محتوای قبلی انتخاب‌شده

سند قبلی سمت چپ و سند فعلی سمت راست است. **&gt;&gt;** کنار تغییر، محتوای قبلی آن بند یا گروه خط را اعمال می‌کند. انتخاب حرف‌به‌حرف نیست. بازیابی محتوای حذف‌شده یا برداشتن محتوای تازه‌افزوده نیز ممکن است.

فقط زمان جلسه یا وسایل لازم را برگردانید. **سند فعلی به‌روزشده با callback** را باز کنید تا نتیجه را ببینید. **شروع دوباره** نمونهٔ اصلی را برمی‌گرداند.

<CompareDemo />

## نمای مقایسهٔ مستقل

از `nabi-note/diff` وارد کنید. NABI TREE JSON ذخیره‌شده یا رشتهٔ HTML را در `before` و `after` بدهید. registry را با همان wingهای ویرایشگر سازندهٔ سند بسازید تا جدول، فهرست، تصویر و دیگر محتوا کامل خوانده و نمایش داده شوند.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'fa',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

پیش‌فرض فقط تغییرات و متن اطراف را نشان می‌دهد. دکمهٔ جمع‌کردن متن کامل را باز می‌کند؛ قبلی/بعدی بین تغییرات می‌روند. بدون تغییر، کل سند نمایش داده می‌شود. بدون `onMerge` نما فقط خواندنی است.

## اتصال ادغام کلیکی با callback

کلیک نتیجهٔ پیشنهادی را به `onMerge` می‌دهد. اتصال callback به‌تنهایی سند را خودکار ذخیره نمی‌کند. سرویس باید پیشنهاد را بپذیرد و `update()` را فراخوانی کند تا مقایسه هم تغییر کند.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'fa',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result`، NABI TREE JSON با تنها تغییر انتخاب‌شده است. `before` و `after` اسناد لحظهٔ کلیک‌اند؛ `changeId` تغییر و `revision` وضعیت مقایسه را مشخص می‌کند. این `revision` را آرگومان سوم `update()` بدهید: اگر مقایسه تغییر کرده باشد، `false` برمی‌گرداند و پیشنهاد را اعمال نمی‌کند.

هنگام انتظار callback ناهمگام، کلیک تکراری مسدود است. جایگزینی اسناد یا برچیدن نما `signal` را لغو می‌کند. هنگام ذخیره در سرور، هم سیگنال و هم نسخهٔ سند سرور را بررسی کنید تا نتیجهٔ قدیمی روی سند جدید نوشته نشود.

## بازکردن مقایسه از ویرایشگر

wing `diff` و `mountDiffWing()` را وصل کنید تا مقایسه از نوار ابزار باز شود. مبنا آخرین سند بارگذاری‌شده است. ویرایش عادی و واگرد مبنا را تغییر نمی‌دهند.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'fa',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

با `merge: true` محتوای قبلی انتخاب‌شده در ویرایشگر اعمال می‌شود. این کار واگردپذیر است و مبنا حفظ می‌شود. تغییر ویرایشگر اصلی هنگام بازبودن نما، مقایسه را دوباره محاسبه می‌کند. حذف `merge` حالت فقط‌خواندنی را حفظ می‌کند.

هنگام برداشتن نما `toolbar.unmount()` و `comparison.unmount()` را فراخوانی کنید. برای واردکردن نسخهٔ شروع ویرایش و ترکیب خودکار دو طرف، از [ادغام](./merge) استفاده کنید.
