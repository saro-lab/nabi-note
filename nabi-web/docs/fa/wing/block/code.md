---
title: کد
description: کد چندخطی را همراه با زبانِ استفاده‌شده برای برجسته‌سازی نحوی ذخیره کنید.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# کد

کد چندخطی را جدا از متن عادی بدنه وارد کنید. در پاراگراف خالی سه backtick بنویسید و Space یا Enter را بزنید، یا از نوارابزار به بلوک کد بروید. اگر پس از backtickها نام زبان مانند `ts` را بیفزایید، آن نام نیز ذخیره می‌شود.

نام زبان شناسه‌ای برای برجسته‌سازی نحوی است و نام‌های بیرون از فهرست ثبت‌شده را نیز می‌توان دستی نوشت. چون محتوای کد و تورفتگی آن باید حفظ شود، بلوک‌های کد هم‌ترازی پاراگراف را نمی‌پذیرند.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## اتصال برجسته‌ساز کد

ثبت بلوک کد از رنگ‌آمیزی پیش‌فرض درون ویرایشگر استفاده می‌کند. برای رنگ‌آمیزی کد در نمای منتشرشده نیز، `nabi-note/viewer` را متصل کنید. viewer، `pre > code` را می‌یابد و مقدار `data-nabi-lang` عنصر والد را به‌عنوان نام زبان می‌خواند. اگر آن مقدار نباشد، classِ `language-...` روی عنصر `code` را بررسی می‌کند.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'en',
})

// After replacing the published HTML
viewer.refresh()

// When closing the screen
viewer.unmount()
```

اگر برجسته‌ساز جداگانه‌ای نباشد یا آن برجسته‌ساز نتواند زبان را پردازش کند، tokenizer داخلیِ بدون وابستگی به‌جای آن رنگ‌آمیزی می‌کند. spanهای token که برجسته‌ساز وارد می‌کند فقط روی صفحه هستند و به JSON ذخیره‌شده یا HTML اصلیِ منتشرشده بازنویسی نمی‌شوند. `refresh()` و `unmount()` آن spanها را برمی‌دارند و از کد اصلی کنونی دوباره متصل می‌شوند.

### شیوهٔ اتصال Shiki در وب‌سایت NABI

وب‌سایت NABI برجسته‌ساز را پویا بارگیری می‌کند تا Shiki وارد صفحهٔ نخست یا بستهٔ SSR نشود. `loadCodeHighlighting()` در `nabi-web/docs/.vitepress/src/highlight.ts` هستهٔ Shiki را می‌سازد، سپس فقط زمانی که واقعاً به کد آن زبان نیاز است grammar زبان را می‌گیرد. نمونهٔ زیر همین اتصال را در نمای منتشرشده به‌کار می‌برد.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'en',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// When closing the screen
stop?.()
viewer.unmount()
```

هنگام نخستین ظهور یک زبان، دریافت grammar آغاز می‌شود. تا آن زمان بلوک با tokenizer داخلی یا به‌صورت متن ساده نشان داده می‌شود. پس از رسیدن grammar، `onGrammarLoaded()`، `viewer.refresh()` را فرا می‌خواند و بلوک را دوباره رنگ‌آمیزی می‌کند. به این ترتیب فقط زبان‌های لازم دریافت می‌شوند و grammarی که دیر رسیده است بدون ناوبری دوبارهٔ صفحه اعمال می‌شود.

بخش ویرایشگر از همان تابع `highlight` استفاده می‌کند. دموی وب‌سایت NABI فقط `attach` پیش‌فرض `codeWing` را با `makeCodeAttach({ highlight, version })` جایگزین می‌کند. `version` با رسیدن هر grammar تغییر می‌کند و نشانه‌ای برای رنگ‌آمیزی دوبارهٔ کدی است که پیش‌تر رسم شده است. یک سرویس مستقل می‌تواند ابتدا اتصال نمای منتشرشده را پیاده کند و تنها اگر رنگ‌آمیزی Shiki هنگام ویرایش هم لازم بود، این روش را بیفزاید.

## سبک‌های CSS

بلوک‌های کد را با `.nabi-content pre` و کد را با `.nabi-content pre > code` سبک‌دهی کنید. `white-space` را تغییر ندهید، زیرا بر شکست خط کد و ویرایش اثر می‌گذارد. رنگ tokenها را می‌توان با selectorهای `[data-nabi-token]` تغییر داد.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
