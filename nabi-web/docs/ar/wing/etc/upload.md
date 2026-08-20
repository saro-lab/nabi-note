---
title: رفع الملفات
---

# رفع الملفات

## الوصف

الرفع ينقسم إلى ثلاث قطع — تسجيل الجناح وحده لا يُحدث شيئًا.

1. **`uploadWing`** — يضيف زر اختيار ملف إلى شريط الأدوات. هذا الجناح نفسه لا
   يصنع `img` ولا `a` — الملف المرفوع يُلتزَم به عبر جناح الصورة أو جناح الرابط
   الذي يرسمه، فيجب **تسجيل `imageWing` أو `linkWing` معه** ليبقى الناتج في
   المستند. بدون أي منهما **تُرمى الاستثناء في لحظة التسجيل نفسها** (لا تنفجر
   لاحقًا).
2. **`mountUpload({ … })`** — الجهة التي تستقبل الملف فعليًّا وتشغّل `uploader`.
   السحب والإفلات، واللصق، واختيار الملف كلها تصب هنا. **بدون هذا الـmount يبقى
   الزر قائمًا لكن لا يحدث شيء.**
3. **`mountUploadView({ … })`** — الجهة التي تقيم شاهد التقدم على الشاشة. الرفع
   يعمل بدونه أيضًا، لكن الشاشة لا تقول شيئًا أثناء الرفع.

شكل `uploader` هو `(task) => Promise<{ uri } | null>` — **إجابة بعنوان تعني
نجاحًا، و`null` يعني فشلًا** فيُزال شاهد التقدم. يُخبَر بالتقدم عبر
`task.onProgress(0~100)`، ويتوقف إذا أُلغي `task.signal`.

القيود ثلاثة: `extensions` و`maxFileSize` و`maxTotalSize`، وكلها اختيارية (صفر
أو حذفها يعني بلا حد). الملفات المرفوضة تصل عبر `onReject`.

## ما يبقى بعد الرفع

الصورة تُلتزَم ككتلة من `imageWing`، وبقية الملفات كرابط مرفق من `linkWing`.

- **اسم المرفق ليس اسم الملف بل تسمية i18n** — بالعربية مثلًا "مرفق". فاسم
  الملف طويل غالبًا على أن يبقى في المستند، والأهم أنه يجب أن يمكن تغييره. يُغيَّر
  الاسم بوضع المؤشر على ذلك الرابط من [خانة الاسم في الشريط السياقي](../inline/link).
- **الامتداد يبقى كشارة** — `data-nabi-file="pdf"`. تُستخرج هذه القيمة من اسم
  الملف الحقيقي، وترسمها صحيفة الأنماط كشارة. تغيير الاسم لا يغيّر الشارة.
- العنوان الذي لا يقبله الرابط (كـ `blob:` دون تفعيل `allowLocalUrls`) يُخفَّض
  إلى اسم ملف نصي بحت — لا يُلتَف حول القائمة البيضاء.

## ما يظهر أثناء الرفع

أثناء الرفع يقف في ذلك المكان صندوق مؤقت — موجود في DOM المحرر فقط وليس في
شجرة نابي، فلا يبقى منه حرف واحد في القيمة المحفوظة.

- **الصورة** تظهر معاينتها فورًا من الملف المختار، وتغطيها شبكة. تُزال خانة
  خانة بمقدار التقدم حتى تتضح كاملة. ترتيب إزالة الخانات يختلط لكل ملف، فلا
  يتكرر النمط نفسه عند رفع عدة صور معًا.
- **الملف غير الصورة** يحصل على صندوق بلا شبكة يحمل 📎 وتسمية "مرفق"، ويظهر
  الامتداد كشارة بأحرف كبيرة (`PDF` مثلًا). الصورة التي تعذّرت معاينتها تسقط هنا
  أيضًا.
- التقدم يُحمَل على الصندوق عبر `data-nabi-per` وترسمه صحيفة الأنماط. يقف على
  كل صندوق أثناء الرفع زر إلغاء (×)، ويُقفَل التحرير أثناء دوران الدفعة.

## مثال الاستخدام

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// الرفع يحتاج جناحي الصورة والرابط ليبقي نتيجته — بدونهما استثناء هنا مباشرة
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// الجهة التي تقيم شاهد التقدم — تُبنى أولًا ثم توصَل بما يلي
const view = mountUploadView({ nabi, surface, locale: 'ar' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'ar',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // ضع هنا الكود الذي يرفع فعليًّا إلى الخادم. عنوان يعني نجاحًا، و null فشلًا
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // إلى هنا تصل الملفات التي يختارها زر شريط الأدوات
  onFiles: (files) => upload.take(files),
})
```

## عرض توضيحي

لا يوجد في هذا الموقع خادم حقيقي للرفع، فهو يكتفي بإعادة عنوان `blob:` بُني عبر
`URL.createObjectURL()` كتمثيل شكلي. تبقى النتيجة داخل هذه الصفحة فقط.

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
