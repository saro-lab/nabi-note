---
title: wingهای سفارشی
description: قرارداد و ترتیب پیاده‌سازی برای افزودن یک قابلیت پایدار به سند.
---

# wingهای سفارشی

wing سفارشی فراتر از یک دکمهٔ نوارابزار است. این یک extension اعلانی است که ساختار سند ذخیره‌شده، commandها، تبدیل HTML و Markdown، قواعد import و رفتار view را کنار هم نگه می‌دارد. registry آن را پیش از ساخت ویرایشگر اعتبارسنجی می‌کند و مانع ورود ساختارهای نامعتبر به سندها می‌شود.

## با محدودترین factory آغاز کنید

بیشتر قالب‌بندی‌ها به declaration کامل نیاز ندارند. برای نشان inline بدون مقدار از `simpleMark()`، برای نشان با مجموعه‌مقدار محدود از `valueMark()`، برای بلوک بی‌فرزند از `boxObject()` و برای فهرست از `listFamily()` استفاده کنید.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## چند نوع wing بسازید

هر نمونهٔ زیر شکل ذخیره‌شدهٔ متفاوتی دارد. ابتدا یکی را ثبت کنید و `getJson()` و `getHtml()` را بررسی کنید. command و دکمه را فقط پس از درست کار کردن ساختار بیفزایید.

### ۱. نشان inline بدون مقدار: تأکید

وقتی قابلیت فقط متن را می‌پوشاند از `simpleMark()` استفاده کنید. این `exStrong` را ذخیره و آن را به‌شکل `<strong>` رندر می‌کند.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

با `clearable: true`، پاک‌کردن قالب‌بندی این نشان را هم برمی‌دارد. پیش از افزودن دکمه، آن را با `nabi.applyCommand()` یا command سفارشی دیگری اعمال کنید. selector یکسان `.nabi-content strong` ویرایشگر و محتوای منتشرشده را سبک‌دهی می‌کند.

### ۲. نشان inline دارای مقدار: رنگ وضعیت

برای رنگ، اندازه یا وضعیت انتخاب‌شده از مجموعهٔ مجاز، از `valueMark()` استفاده کنید. مقدار در `a.v` ذخیره می‌شود؛ مقدارهای بیرون از فهرست هنگام `repair()` حذف می‌شوند.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

شکل ذخیره‌شدهٔ آن `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }` است. CSS مقدار ذخیره‌شده را هدف می‌گیرد، پس محتوای منتشرشده را هم تغییر می‌دهد. مقدارها را بی‌دلیل از فهرست موجود حذف نکنید: سندهای از پیش ذخیره‌شده ممکن است هنگام خواندن آن‌ها را از دست بدهند.

### ۳. بلوک بی‌فرزند: جداکننده

برای شیء مستقل بدون فرزند، مانند تصویر، ویدیو یا جداکننده، از `boxObject()` استفاده کنید.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

برای شیئی با مقدارهایی مانند URL یا عرض، اعتبارسنجی را در `attrs` اعلام و مقدارهای لازم را در `requires` قرار دهید. به‌جای جایگزین‌کردن بی‌صدای پیش‌فرض، مقدار تأییدناپذیر را با `null` رد کنید.

### ۴. بلوک دارای چند پاراگراف: callout

برای بلوکی که محتوای سند را نگه می‌دارد، یک `container` اعلام کنید. `holds: 'blocks'` فرزندهای پاراگراف، فهرست و object-block را مجاز می‌کند.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

این declaration به‌تنهایی راهی برای پوشاندن پاراگراف‌های انتخاب‌شده نمی‌سازد. پیش از نمایش قابلیت در UI ویرایشگر، یک command خالص در `commands` و یک `button` که آن را فرا می‌خواند اضافه کنید.

### ۵. جفت فهرست و موردِ همسان

هرجا فهرست و مورد آن باید همیشه با هم باشند از `listFamily()` استفاده کنید.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` با پوشاندن بلوک در یک مورد، بلوک درون فهرست را repair می‌کند. برای مقدار در سطح مورد مانند وضعیت تیک‌خورده، `itemDecl` و `repairItem` را بیفزایید.

### در یک انتخاب مرتب ثبت کنید

در سرور همان declarationها را با همان ترتیبِ مرورگر به‌کار ببرید.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

## نام‌ها و ساختار سند را تعریف کنید

نام‌هایی که وارد سند می‌شوند باید با `ex[A-Z0-9]...` مطابقت داشته باشند. نامی مانند `exCallout` مانع از آن می‌شود که wing رسمی آینده معنای محتوای ذخیره‌شده را تغییر دهد.

`place` شکل ذخیره‌شده را تعیین می‌کند: `mark` محتوای inline را می‌پوشاند، `void` بلوک بی‌فرزند است، `container` فرزندها را نگه می‌دارد، `attr` ویژگی‌های پاراگراف را تغییر می‌دهد و `tool` هیچ node سندی نمی‌سازد. `container` به `holds: 'blocks' | 'inline'` و `toHtml()` نیاز دارد.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`، `boolAttrs`، `allows`، `requiresAnyOf` و `parts` محدودیت‌های ساختاری را اعلام می‌کنند. declarationِ `parts` برای هر part به `partHtml` نیز نیاز دارد. برای محدود کردن wing انتخاب‌کنندهٔ مقدار از `attrKey` و `attrValues` استفاده کنید.

## همهٔ گزینه‌های declaration

فقط آنچه wing نیاز دارد اعلام کنید. factory از پیش بعضی fieldها را برای شما فراهم می‌کند.

| بخش | گزینه‌ها | کاربرد |
| --- | --- | --- |
| پایه | `w`, `place`, `basic`, `styles` | نام، نوع ساختاری، عضویت در کاتالوگ پایه، CSS پیش‌فرض |
| ساختار | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | نوع فرزند، رفتار Enter، ویژگی‌های مجاز، ویژگی‌های بولی |
| ساختار | `parts`, `allows`, `noAlign`, `requiresAnyOf` | partهای داخلی، فرزندهای مجاز، حذف هم‌ترازی، وابستگی wing |
| مقدارها | `attrKey`, `attrValues`, `currentValue` | کلید و فهرست مقدار ذخیره‌شده، تشخیص مقدار کنونی |
| command و ورودی | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | commandها، مدیریت کلید، رفتار Escape/کلید دوتایی، قواعد قالب‌بندی خودکار |
| رفتار surface | `attach` | رفتار DOM و پاک‌سازی یک surface |
| تبدیل | `toHtml`, `partHtml`, `toMd`, `partMd` | خروجی HTML و Markdown |
| import و repair | `claim`, `ioFilter`, `repair`, `partRepair` | واردکردن HTML، مدیریت فایل، اعتبارسنجی و repair JSON |
| UI | `button`, `buttons`, `context` | declarationهای UI نوارابزار و زمینه |
| پاک‌کردن قالب‌بندی | `clearable` | اینکه پاک‌کردن قالب‌بندی آن را بردارد یا نه |

`w` و `place` همیشه لازم‌اند. wingهای `mark`، `void` و `container` که node تولید می‌کنند به `toHtml()` هم نیاز دارند. container به `holds` نیاز دارد؛ هر part اعلام‌شده باید `partHtml` متناظر داشته باشد.

## HTML، Markdown و JSON را کنار هم نگه دارید

`toHtml()` node ذخیره‌شده را به HTML رندر می‌کند، درحالی‌که `toMd()` Markdown صادر می‌کند. بدون builder Markdown، HTML تولیدشده نگه داشته می‌شود تا اطلاعات از دست نرود. هنگام import از `claim()` استفاده کنید تا فقط عنصر HTML خود و ویژگی‌های اعتبارسنجی‌شده را بشناسید.

`repair()` هنگام بارگذاری JSON و دوباره پس از commandها اجرا می‌شود. برای ویژگی نامعتبر node اصلاح‌شده و برای nodeی که نمی‌توان نگه داشت `null` برگردانید. HTML را با `ctx.element()`، `ctx.escape()` و `ctx.url()` بسازید؛ هرگز tagها، ویژگی‌ها یا URLها را پیرامون این بررسی‌ها به هم نچسبانید.

## commandها را از رفتار view جدا نگه دارید

command تابعی خالص از سند و selection است که سند بعدی و selection درون آن را برمی‌گرداند. هرگز DOM را نمی‌خواند یا تغییر نمی‌دهد و وقتی نتواند تغییر معتبری بسازد `null` برمی‌گرداند. commandها را با lower camel case و فعل آغازین، مانند `insertNote`، نام‌گذاری کنید.

رفتار صرفاً DOM، مانند انتخاب کشیدنی جدول، را در `attach(host)` بگذارید. برای هر listener یا ویژگیِ تغییرکرده بی‌درنگ با `host.onDispose()` پاک‌سازی ثبت کنید تا پیکربندی ناموفق نیز پاک شود. DOM متن درحال‌نگارش یا نگاشت selection surface را تغییر ندهید.

کنترل‌های نوارابزار و زمینه را با `button`، `buttons` و `context` اعلام کنید؛ تکرار قواعد command آن‌ها در UI برنامه می‌تواند UI و مدل سند را از هم دور کند.

## سبک‌های CSS

CSS پایهٔ لازم wing را در `styles` بگذارید. سبک‌های wing داخلی از پیش در `nabi-note/nabi.css` هستند. مرورگری که سبک‌های registry انتخاب‌شده را گرد می‌آورد می‌تواند از `collectSheets()` و `injectSheets()` استفاده کند؛ SSR باید به‌جای آن به فایل CSS پیوند دهد.

برای ویرایش و محتوای منتشرشده classها و ویژگی‌های دادهٔ یکسان به‌کار ببرید، اما ساختار `[data-key]`، `display` یا `white-space` در حال ویرایش را تغییر ندهید. CSS باید فقط ظاهر را تغییر دهد، نه نگاشت caret را.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

فقط classها یا ویژگی‌های داده‌ای را هدف بگیرید که `toHtml()` می‌سازد. تغییرهای ویژهٔ سرویس را محدودتر نگه دارید، برای نمونه `.article-body .ex-callout`.

## همهٔ قرارداد را بررسی کنید

بررسی کنید که سند JSON ذخیره‌شده با همان ساختار و HTML دوباره بارگذاری می‌شود. بیازمایید registry نام‌های نامعتبر، commandهای تکراری، builderهای گم‌شده و وابستگی‌های برآورده‌نشده را رد می‌کند. import نامعتبر HTML و ورودی `repair()`، مدیریت selection command، خروجی SSR و نمای منتشرشدهٔ سبک‌دهی‌شده را پوشش دهید.

برای typeهای کامل و argumentهای factory، declarationهای نصب‌شده و [مرجع API انگلیسی](https://nabi.saro.me/llms/api-reference.md) را بررسی کنید.
