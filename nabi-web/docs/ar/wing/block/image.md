---
title: صورة
description: يضيف عنوان صورة ويضبط العرض والمحاذاة.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# صورة

يضيف عنوان صورة ويضبط عرضها ومحاذاتها. لا يُسمح افتراضيًا إلا بعناوين `http:` و`https:` ومسارات الموقع نفسه، وتبدأ الصورة الجديدة بمحاذاة وسط وعرض 60%.

يُحفظ العرض ضمن درجات محددة، وتُحفظ المحاذاة في الفقرة التي تحتوي الصورة. لاستخدام معاينات `blob:` أو `data:image/...`، اسمح بالعناوين المحلية صراحة في image wing وفي تجميع المحرر. ولا تُقبل عناوين بيانات SVG.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

تضع هذه wing العنوان في المستند ولا تنقل الملف. لإرسال الملف إلى الخادم، صِل [wing الرفع](/ar/wing/etc/upload).

## ربط أداة اختيار الصور

استخدم `panels.img` مع `mountToolbar()` لاستبدال نافذة إدخال URL الافتراضية لزر الصورة بأداة اختيار الصور في خدمتك. المفاتيح هي أسماء خانات شريط الأدوات؛ وتحتفظ الأدوات غير المحددة بنوافذها الافتراضية.

يفتح `mode: 'modal'` نافذة فوق خلفية شبه شفافة تغطي الصفحة بالكامل. يفتح `mode: 'inline'` قرب زر الأداة على الكمبيوتر، ويملأ الشاشة على الهاتف. يحدد عرض منطقة العرض و`--nabi-mobile-breakpoint` وضع الهاتف؛ وإذا تم تجاوز هذا الحد أثناء فتح لوحة `inline`، تُغلق اللوحة.

يوفر الوضعان عنصر `root` فارغًا فقط، دون عنوان أو حقول إدخال أو أزرار. أضف HTML أو واجهتك داخل `render`، واربط زر الإغلاق بـ`close()` واختيار الصورة بـ`insertImage(url, 'pointer')`. تحتفظ الإعدادات الحالية بصيغة الدالة (`img: renderer`) بطريقة عرضها.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker` دالة تنفذها في خدمتك. تنشئ واجهتك تزامنيًا داخل `root` الممرر وتعيد دالة للتنظيف. اربط `signal` بالعمليات غير المتزامنة مثل جلب قائمة الصور أو رفع الملفات، ومرر URL الصورة المختارة إلى `onSelect`. لا تنقل هذه الواجهة الملفات، وتظل قواعد السماح بعناوين الصور الحالية سارية.

يكافئ `insertImage(src, by?)` الاستدعاء `run('insertImage', { src }, by)`، بما في ذلك القيمة المعادة وقواعد استعادة التحديد. عند حذف `by`، تُستخدم `'keyboard'`. لا تعرّف `render` كدالة `async`.

عند إغلاق النافذة أو إزالة شريط الأدوات، يُلغى `signal` وتُستدعى دالة التنظيف. يغلق `run()` النافذة ويطبق الأمر مرة واحدة على التحديد المحفوظ عند فتحها. إذا كانت النافذة مغلقة بالفعل أو تغير محتوى المستند منذ فتحها، يعيد `false` دون تنفيذ الأمر.

## أنماط CSS

نسّق الصورة عبر `.nabi-content img`. أبقِ العرض والمحاذاة المحفوظين، وغيّر الشكل فقط مثل الحدود أو الظل.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

أبقِ القواعد الأساسية لـ`max-inline-size` و`block-size` والعرض والمحاذاة. حجم الصورة محفوظ في المستند، وفرضه في CSS قد يتعارض مع اختيار الكاتب.
