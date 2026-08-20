---
title: صورة
---

# صورة

## الوصف

`imageWing` (اسمه `img`) يملك الصورة (`<img>`). وهي كتلة لا تحمل جوفًا مثل
`hr` و`youtube`. الضغط على الزر يفتح لوحة إدخال عنوان.

**يُفحَص العنوان بمخطط الوصول لا بالامتداد.** يمر منه `http:` و`https:` والمسار
النسبي فقط، ويُرفَض العنوان النسبي إلى البروتوكول مثل `//example.com/a.png`.
أما هل ينتهي بـ`.png` **فلا يُنظَر إليه إطلاقًا** — لأن العناوين التي تُخرج
صورة بلا امتداد شائعة.

لا يدخل المؤشر داخل الصورة، فالنقر عليها يحدّدها بأسرها ويُظهر الشريط السياقي.

| الفئة | الحقول |
|---|---|
| العرض | ثماني خانات من `30` إلى `100` بفارق عشرة (الافتراضي `60`) — وهو مقياس تظهر معه القيمة الحالية |
| معاينة | صورة واحدة مكبَّرة — ولا تغيّر المستند |

**هذان الحقلان فقط في الشريط السياقي.** لا توجد هنا خانات يسار ووسط ويمين —
موضع الصورة لا تحمله الصورة نفسها بل **الفقرة الحاضنة لها**، وزر المحاذاة في
شريط الأدوات هو من يتولى ذلك.

**الصورة المُدرَجة حديثًا في الوسط** — لأن `insertLump` يُلبِس الفقرة الحاضنة
محاذاة `c` عند إقامتها.

عند الخروج يُلصَق العرض بالصورة والمحاذاة بالفقرة التي تحتضنها.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

قيم المحاذاة هي `l`·`c`·`r`. لا يخرج `style` سطري — الشكل الفعلي ترسمه صحيفة
أنماط تقرأ تلك الخاصية داخل `.nabi-content` الموصولة بـ`nabi.css`.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

تشغيل `allowLocalUrls` يسمح بعناوين `blob:` و`data:image/...` أيضًا — لا يُشغَّل
إلا في سيناريوهات العرض التجريبي والرفع التي تُظهر الملف معاينةً بلا خادم.
وهو مطفأ افتراضيًّا.

حين تنكسر الصورة (مات العنوان أو انتهت صلاحيته أو اختفى الـblob) يظهر عنصر
نائب من تلقاء نفسه — يحمل الجناح هذا العمل عبر `attach`، و`mountSurface` يربط
`attach` الخاص بكل جناح مسجَّل تلقائيًّا. **لا حاجة لتركيب أي شيء بمفرده.** هذه
العلامة للشاشة وحدها ولا تبقى في القيمة المحفوظة أبدًا.

يمكن تشغيل `allowLocalUrls` من مكانين — للمحرر كله
(`createNabiWith(wings, { allowLocalUrls: true })`)، أو لجناح الصورة وحده
(`makeImageWing({ allowLocalUrls: true })`).

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

لإبقاء ملف وارد من الرفع (بعنوان `blob:`) مفتوحًا كما هو:

```ts
makeImageWing({ allowLocalUrls: true })
```

## عرض توضيحي

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
