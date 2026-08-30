---
title: إعداد SSR
description: عرض مستندات NABI TREE المحفوظة بأمان إلى HTML على الخادم ثم إحياء المحرر في المتصفح.
---

# إعداد SSR

على الخادم، استورد `nabi-note/ssr` فقط، لا واجهات المتصفح أو UI. فهو يتحقق من JSON ‏NABI TREE المحفوظ ويحوّله إلى HTML للنشر أو HTML محرر قابل للإحياء.

## عرض HTML المنشور

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('تعذرت قراءة المستند المحفوظ.')
```

يتحقق `renderStoredHtml()` من JSON المُدخل ويطبّعه ثم يعيد HTML المنشور. وتعني `null` أن registry الحالي لا يستطيع قراءة الإدخال. أضف CSS الحزمة و`.nabi-content` إلى صفحة النشر.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

أضف `attachViewer()` من `nabi-note/viewer` في المتصفح فقط لفرز الجداول التفاعلي أو تلوين الشفرة. المحتوى المنشور العادي يحتاج CSS فقط.

## إحياء بنية المحرر المعروضة مسبقًا

لإظهار المحرر من الرسم الأول، اعرضه على الخادم باستخدام `renderStoredEditorHtml()` ومرّر `hydrate: true` إلى واجهة المتصفح.

```ts
// الخادم
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// المتصفح
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

يجب أن يستخدم الخادم والمتصفح المستند نفسه وتعريفات wings بالترتيب نفسه والخيارات المؤثرة في HTML نفسها. أدرج ناتج الخادم من دون تعديل كأبناء مباشرين لجذر المحتوى، ولا تضبط `contenteditable` مسبقًا على الجذر. إذا اختلفت البنية، تعرض الواجهة HTML محرر جديدًا.

## عرض شريط الأدوات مسبقًا

يمكن لـ`renderToolbarHtml()` و`renderViewToolsHtml()` عرض عناصر شريط الأدوات مسبقًا على الخادم. يربطها mount في المتصفح عندما تتطابق registry وlocale وترتيب المجموعات. لا يُدعم DOM عشوائي للتطبيق داخل جذر شريط الأدوات.

لا تستخدم API متصفح مثل `injectSheets()` أثناء SSR. اربط ملف `nabi-note/nabi.css` المبني أو ضمّنه في CSS الخاص بك.
