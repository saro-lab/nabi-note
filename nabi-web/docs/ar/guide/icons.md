---
title: "سمات الأيقونات"
description: "تستبدل متغيرات CSS أيقونات الأجنحة والمعاينة وملء الشاشة واللوحات والمقارنة وفرز الجداول. يمكن مزج SVG وWebP وPNG؛ وتستخدم الأيقونات غير المحددة الملفات الافتراضية."
---

# سمات الأيقونات

تستبدل متغيرات CSS أيقونات الأجنحة والمعاينة وملء الشاشة واللوحات والمقارنة وفرز الجداول. يمكن مزج SVG وWebP وPNG؛ وتستخدم الأيقونات غير المحددة الملفات الافتراضية.

## اختيار الملفات

حمّل CSS وأضف فئة السمة إلى المحرر أو عنصر أب مشترك. تحتفظ الصور بألوانها وشفافيتها ونسب أبعادها الأصلية.

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

استخدم مسارات من الجذر مثل `/icons/...` أو عناوين HTTPS كاملة. لا يُضمن حل المسارات النسبية بجوار ملف السمة. عند استضافة CSS بنفسك، انسخ الإصدار نفسه من `dist/icons/` بجوار `nabi.css`. إذا تعذر تحميل الصورة، تبقى الأيقونة فارغة، لكن اسم الزر وتلميحه ووظيفته تظل متاحة.

## العثور على أيقونات أخرى

أضف `--nabi-icon-` قبل قيمة `data-nabi-icon` لعنصر الأيقونة للحصول على متغير CSS. مثلًا، يستخدم `diff-close` المتغير `--nabi-icon-diff-close`. راجع <a href="/llms/icons.md" target="_blank" rel="noopener">عقد الأيقونات</a> لقواعد مفاتيح السياق والقوائم والحفظ والسجل وغيرها، بما فيها ترميز المحارف الخاصة.

## الوضع الداكن واللوحات

يؤدي تغيير فئة السمة أو متغير CSS إلى تحديث الأيقونات دون mount جديد. تتبع الأيقونات الافتراضية السمة الفاتحة أو الداكنة. لا ترث الملفات المخصصة `currentColor`؛ عيّن نسخًا داكنة كما في المثال عند الحاجة. وتتبع اللوحات المفتوحة تحت `body` سمة أيقونات المحرر المصدر وتغييرات فئاته وأنماطه. ضع المتغيرات على المحرر أو أب مشترك، لا داخل شريط الأدوات فقط.

## إظهار الأزرار الافتراضية

القيمة الافتراضية لكل من `showPreview` و`showFullscreen` هي `true`. تؤدي `false` إلى إزالة الزر المعني وهدف تركيزه وأحداثه. وإذا كان كلاهما `false`، فلن تُنشأ منطقة أدوات فارغة.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

مرّر خيارات العرض نفسها إلى SSR وmount. لتغيير الإعداد، استدعِ `tools.unmount()` ثم نفّذ mount بخيارات جديدة. إذا لم تحتج إلى الزرين، فلا يزال بإمكانك حذف mount الأدوات وترميز SSR بالكامل. وتظل الاستدعاءات المباشرة لـ`openPreview()` و`setFullscreen()` متاحة.
