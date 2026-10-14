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
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

کلاس پوستهٔ یکسانی به `.nabi` ویرایشگر و `.nabi-content` نمای منتشرشده بدهید تا متغیرهای یکسان اعمال شوند. CSS سرویس را بعد از CSS بسته بارگذاری و پوستهٔ فعلی را با `data-nabi-theme` مشخص کنید.

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

هایلایت و رنگ متن به‌ترتیب از `--nabi-hl-<name>` و `--nabi-tc-<name>` استفاده می‌کنند. پس‌زمینهٔ سلول با `--nabi-cell-<name>` از `yellow`، `green`، `cyan`، `pink`، `purple` و `orange` پشتیبانی می‌کند. متغیرها فقط رنگ نمایش‌داده‌شده را تغییر می‌دهند، نه نام ذخیره‌شده را.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

پوستهٔ پیش‌فرض پس‌زمینهٔ سلول‌ها را با رنگ ملایم نشان می‌دهد. حالت تیره نام‌ها را حفظ می‌کند، اما رنگ‌های جداگانهٔ روشن‌تر و کم‌اشباع‌تر به کار می‌برد تا روی زمینهٔ تیره قابل‌تشخیص باشند. این رنگ‌های نیمه‌شفاف زمینه را نشان می‌دهند؛ هنگام شخصی‌سازی، کنتراست متن را روی پس‌زمینهٔ واقعی صفحه بررسی کنید. برای بازنویسی متغیرهای رنگ پیش‌فرض، کلاس پوسته را مانند مثال روی خود عنصر ویرایشگر یا محتوای منتشرشده قرار دهید، نه یک والد بیرونی دلخواه.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## آستانهٔ حالت موبایل

نوار پیش‌فرض `layout: 'compact'` در عرض صفحهٔ کمتر از `36rem` به یک ردیف موبایل تبدیل می‌شود. دقیقاً `36rem` چیدمان دسکتاپ را حفظ می‌کند. در دسکتاپ حتی با ویرایشگر باریک، همهٔ ابزارها به ردیف بعد می‌روند. ویژگی‌های شیء نیز در پایین به چند ردیف می‌روند؛ هر دو ردیف بالای متن فضا می‌گیرند. تمام‌صفحه همهٔ ابزارها را فارغ از عرض باز می‌کند.

در موبایل ابزارهای سریع، دکمهٔ همهٔ ابزارها و دکمه‌های متصل پیش‌نمایش/تمام‌صفحه در نوار اصلی می‌مانند و هنگام نمایش ابزارهای ویژگی نیز قابل استفاده‌اند. پالت همهٔ ابزارها همان ترتیب گروه و جداکننده‌های دسکتاپ را دارد. `layout: 'wrap'` همیشه همهٔ ابزارها را با شکستن ردیف نمایش می‌دهد.

پنل‌های موبایل در فضای موجود اطراف نوار و ابزارهای ویژگی باز می‌شوند. انتخابگر اندازهٔ جدول استثناست: در مرکز روی زمینهٔ نیمه‌شفاف با شبکهٔ 5×5 مناسب لمس باز می‌شود. منتظر بسته‌شدن صفحه‌کلید نمی‌ماند؛ انتخاب اندازه یک جدول درج می‌کند و انتخابگر را می‌بندد.

برای تغییر آستانه، `--nabi-mobile-breakpoint` را روی `:root`، یک نیا یا `.nabi` مشخص بگذارید. از طول CSS نامنفی مانند `rem`، `px` یا `calc()` استفاده کنید. تغییر مقدار CSS، اندازهٔ قلم ریشه یا عرض صفحه، پنل‌های باز را نیز خودکار به‌روز می‌کند. پنل ورودی منتقل‌شده زیر `body` آستانهٔ ویرایشگر اصلی را حفظ می‌کند.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

ناحیه‌های شناور آستانهٔ جداگانه‌ای برای تک‌ستونی‌شدن دارند. عرض ظرف متن، نه صفحه، اگر کمتر از `36rem` باشد یک ستون نمایش داده می‌شود؛ چاپ نیز همین چیدمان را دارد.

## حالت تیره

حالت روشن پیش‌فرض است. `.dark` را به `html` یا `body` بیفزایید، یا `data-nabi-theme="dark"` را روی ویرایشگر یا بدنهٔ منتشرشدهٔ مشخصی قرار دهید.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

برای خارج شدن از `.dark` والد از `data-nabi-theme="light"` استفاده کنید. برنامهٔ شما تغییر پوسته را کنترل می‌کند؛ بسته به‌طور خودکار از `prefers-color-scheme` پیروی نمی‌کند.

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

## محتوای منتشرشده را هم سبک‌دهی کنید

HTML منتشرشده نیز به `.nabi-content` و همان CSS نیاز دارد. جدول‌ها، بلوک‌های کد، تصویرها، فهرست‌های تیک‌دار و حروف آغازین بزرگ بدون JavaScript رندر می‌شوند. `nabi-note/viewer` را فقط برای رفتارهایی مانند مرتب‌سازی جدول یا برجسته‌سازی کد بیفزایید.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
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
