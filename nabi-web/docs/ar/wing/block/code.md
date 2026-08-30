---
title: شفرة
description: يحفظ شفرة متعددة الأسطر ومعلومات اللغة اللازمة لتلوين الصياغة.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# شفرة

يضع الشفرة متعددة الأسطر منفصلة عن النص العادي. في فقرة فارغة، اكتب ثلاث علامات backtick ثم اضغط Space أو Enter، أو حوّلها من شريط الأدوات. وإذا كتبت اسم لغة مثل `ts` بعد العلامات، يُحفظ الاسم أيضًا.

اسم اللغة معرّف يُستخدم لتلوين الصياغة، ويمكن إدخال اسم غير موجود في القائمة المسجلة يدويًا. ولا تطبّق كتلة الشفرة محاذاة الفقرة لأن محتوى الشفرة ومسافاتها البادئة يجب أن يبقيا كما هما.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## ربط ملوّن الشفرة

بعد تسجيل كتلة الشفرة، يستخدم المحرر تلوينًا أساسيًا. وللتلوين في صفحة النشر أيضًا، صِل `nabi-note/viewer`. يبحث viewer عن `pre > code` ويقرأ قيمة `data-nabi-lang` في العنصر الأب كاسم للغة. وإن لم توجد، يفحص فئة `language-...` في عنصر `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'ar',
})

// بعد تغيير HTML المنشور
viewer.refresh()

// عند إغلاق الشاشة
viewer.unmount()
```

إذا لم يوجد ملوّن منفصل أو لم يدعم اللغة، يتولى ملوّن tokens المضمّن الخالي من الاعتماديات المهمة. توجد عناصر span التي يضيفها الملوّن على الشاشة فقط، ولا تُحفظ في JSON أو أصل HTML المنشور. يزيل `refresh()` و`unmount()` هذه العناصر ويعيدان الربط بالشفرة الأصلية الحالية.

### طريقة ربط Shiki في موقع NABI

يحمّل موقع NABI الملوّن ديناميكيًا حتى لا يضم Shiki إلى الشاشة الأولى أو SSR bundle. تنشئ `loadCodeHighlighting()` في `nabi-web/docs/.vitepress/src/highlight.ts` ‏Shiki core، ولا تجلب قواعد لغة إلا عند الحاجة إليها فعلًا. وهذه هي طريقة الربط نفسها في صفحة النشر.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'ar',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// عند إغلاق الشاشة
stop?.()
viewer.unmount()
```

عند ظهور لغة لأول مرة يبدأ تنزيل قواعدها، وخلال ذلك تُعرض بملوّن tokens المضمّن أو كنص عادي. عند وصول القواعد تستدعي `onGrammarLoaded()` ‏`viewer.refresh()` لإعادة التلوين. وهكذا لا تُنزّل إلا اللغات المطلوبة، وتُطبّق القواعد المتأخرة من دون الانتقال إلى شاشة أخرى.

يستخدم المحرر دالة `highlight` نفسها. في عرض موقع NABI، يُستبدل `attach` في `codeWing` الأساسية فقط بـ`makeCodeAttach({ highlight, version })`. تتغير `version` عند وصول كل قواعد، فتشير إلى ضرورة إعادة تلوين الشفرة المعروضة. يكفي للخدمة المستقلة ربط صفحة النشر أولًا، ثم إضافة هذه الطريقة عندما يكون تلوين Shiki ضروريًا أثناء التحرير.

## أنماط CSS

نسّق كتلة الشفرة عبر `.nabi-content pre` والشفرة عبر `.nabi-content pre > code`. لا تغيّر `white-space` لأنه يؤثر في التفاف الأسطر والتحرير. ويمكن تغيير ألوان tokens بمحدد `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
