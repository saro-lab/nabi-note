---
title: الاستخدام الأساسي
description: أنشئ محرر NABI NOTE في المتصفح ثم احفظ مستنداته واستعدها.
---

# الاستخدام الأساسي

يشرح هذا الدليل محررًا يعمل بالعرض من جهة العميل (CSR) في المتصفح: اختيار wings، وتركيب المحرر وواجهته، ثم حفظ JSON ‏NABI TREE واستعادته.

## التثبيت وإضافة البنية الأساسية

```bash
npm install nabi-note
```

حمّل ورقة الأنماط نفسها للمحرر والمحتوى المنشور. لا تضف `contenteditable` بنفسك؛ تتولى `mountSurface()` إدارته.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## تركيب المحرر

تختار `allBasic()` ‏wings الرسمية التي تعمل بلا ربط خاص بالتطبيق. أضف wings المتصلة بالخدمة، مثل الرفع أو تخزين الملفات أو مقارنة المستندات، وفق أدلتها المنفصلة.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'ar',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'ar',
  placeholder: 'اكتب شيئًا.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ar',
})
```

تتحكم `locale` في نص شريط الأدوات والمساعدة؛ مرّر القيمة نفسها إلى كل UI mount. لا يظهر `placeholder` إلا في محرر فارغ. تستقبل `onError` الأخطاء المعزولة من الأوامر وcallbacks. تحدد `undoLimit` عدد خطوات التراجع، وافتراضيها 200. وتحدد `typingMergeMs` مدة دمج الكتابة المتتابعة في خطوة تراجع واحدة؛ اجعلها `0` لإبقاء كل إدخال مستقلًا.

الفاصل الافتراضي بين ضغطتي Enter المتتاليتين للخروج من حاوية كتل هو 180ms. يبقى الفاصل للضغط المزدوج على Esc وShift هو 350ms. تحديد `doubleEnterMs` صراحةً في `mountSurface()` يغيّر فاصل Esc المزدوج أيضًا، وليس Enter فقط.

يحتاج كل محرر إلى جذري محتوى وشريط أدوات مستقلين لا يتداخلان. وإذا كانت الصفحة تضم عدة محررات، فمرّر لكل شريط سطح محرره عبر `surface` حتى لا يتقاطع التركيز والاختصارات.

## إعداد شريط الأدوات

يجمع الشريط الافتراضي العناوين وتنسيق النص والمحاذاة والقوائم والإدراج وأدوات المستند بهذا الترتيب، مع فواصل رأسية بين المجموعات. على سطح المكتب تظهر الأدوات كلها في عدة صفوف؛ وعلى الجوال تظهر الأدوات السريعة وزر جميع الأدوات في صف واحد. تظهر خصائص الجداول والصور والمناطق العائمة أسفلها، ويمكن استخدامها مع أدوات النص.

استخدم `groups` لتغيير ترتيب المجموعات و`quick` لترتيب أدوات الجوال السريعة. مثلًا، يمكن لمحرر يدرج الصور كثيرًا نقل مجموعة `media` إلى البداية.

```ts
import { TOOLBAR_GROUPS, mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ar',
  groups: ['media', ...TOOLBAR_GROUPS.filter((group) => group !== 'media')],
  quick: ['b', 'i', 'tc', 'img'],
})
```

تلتزم الأدوات السريعة بالترتيب المحدد بلا فواصل. داخل كل مجموعة يُتبع ترتيب تسجيل الأجنحة. عند التصيير المسبق للشريط عبر SSR، مرّر ترتيب المجموعات نفسه إلى الخادم والمتصفح. تشرح [سمات CSS](./style#حد-التبديل-إلى-وضع-الجوال) التخطيط حسب عرض الشاشة.

اربط `mountHints()` لاختيار الأدوات بلوحة المفاتيح بالضغط على Shift مرتين. ينقل Tab بين المجموعات، وتنقل الأسهم بين أيقونات المجموعة نفسها. يستخدم سطح المكتب وملء الشاشة الشريط الظاهر، بينما يستخدم الجوال لوحة جميع الأدوات.

تتذكر لوحات الصور وحقول URL ومنتقيات الملفات موضع التحديد عند فتحها. إذا حرّكت المؤشر فقط، يتم الإدراج في الموضع الأصلي؛ وإذا عدّلت المستند أو استبدلته، يُلغى الإدخال مع إشعار. حتى إذا أعاد التراجع المحتوى نفسه، لا يُعاد استخدام التحديد القديم.

## اختيار wings

استخدم `use()` و`drop()` للإبقاء على الميزات المطلوبة فقط. توثّق صفحة كل wing الخيارات التي تقبلها.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'ar' })
```

للحصول على bundle أصغر، مرّر مصفوفة لا تحتوي إلا wings اللازمة مثل `boldWing` و`imageWing`. تفشل الأسماء المجهولة والخيارات غير الصالحة والاعتماديات الناقصة فور إنشاء المحرر.

## الحفظ والتحميل

احفظ ناتج `getJson()` كـJSON ‏NABI TREE عندما سيُحرر المستند مرة أخرى. أما `getHtml()` فهو لناتج النشر. لا تحفظ أبدًا ناتج المحرر الداخلي `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('تعذرت قراءة المستند المحفوظ.')

const publishedHtml = nabi.getHtml()
```

استخدم `setHtml()` لاستيراد HTML خارجي. يوفّر محرر المتصفح HTML parser بالفعل، فلا يحتاج إلى خيار parser. تعيد `setJson()` و`setHtml()` القيمة `false` للإدخال غير الفارغ وغير الصالح، وتتركان المستند الحالي من دون تغيير.

```ts
nabi.setHtml('<p>مستند مستورد</p>')
```

يُعد JSON وHTML مدخلين غير موثوقين. يقرأهما NABI NOTE عبر wings المسجلة وقواعدها المسموح بها، لكن ذلك لا يحل محل صلاحيات الرفع وسياسة أمان خدمتك.

## API الشائعة

| المهمة | API |
| --- | --- |
| إنشاء محرر | `createNabiWith`, `wings` |
| تركيب السطح وشريط الأدوات | `mountSurface`, `mountToolbar` |
| الحفظ والاستعادة | `getJson`, `setJson`, `getHtml`, `setHtml` |
| مراقبة التغييرات | `nabi.onChange(listener)` |
| التراجع والإعادة | `nabi.undo()`, `nabi.redo()` |
| عرض HTML على الخادم | `renderStoredHtml` من `nabi-note/ssr` |
| إضافة سلوك صفحة النشر | `attachViewer` من `nabi-note/viewer` |
| مقارنة المستندات | `diffDocs` من `nabi-note/diff` |

راجع أولًا تعريفات الحزمة المثبتة لمعرفة الأنواع الدقيقة وجميع الوسائط. ويمكن لأدوات الأتمتة استخدام [مرجع API الإنجليزي](https://nabi.saro.me/llms/api-reference.md) أيضًا.

## تفكيك mounts

فك التركيب بعكس ترتيب الإنشاء. لا تغيّر `innerHTML` لجذر التحرير مباشرة؛ غيّر المستند عبر API عامة مثل `setJson()` أو `setHtml()` أو `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
