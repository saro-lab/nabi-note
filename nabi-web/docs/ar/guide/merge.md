---
title: الدمج
description: اجمع إصدار بداية التحرير وإصدارك والإصدار المحفوظ خلال ذلك، ثم حرر التعارضات المتبقية لحلها.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# الدمج

إذا حُفظت تغييرات أخرى أثناء تحريرك، اجمع الطرفين اعتمادًا على إصدار البداية. تُطبّق جميع التغييرات القابلة للدمج تلقائيًا منذ البداية؛ تبقى المتداخلة فقط كتعارضات. هذا عرض مستقل من `nabi-note/merge` وليس جناحًا.

| اليسار | الوسط | اليمين |
| --- | --- | --- |
| إصدار بداية التحرير | مستندك الحالي بعد الدمج التلقائي | الإصدار المحفوظ أثناء تحريرك |
| للقراءة فقط | قابل للتحرير مباشرة | للقراءة فقط |

يمكنك في الوسط تحرير النص والتنسيق والجداول والقوائم والصور كالمحرر العادي. تحدد الأجنحة الممررة الميزات المتاحة. علامات التعارض وحالة الحل لا تختلط بالمحتوى المحفوظ.

## مثال يُدمج بالكامل تلقائيًا

غيّرت وقت الاجتماع إلى **11 صباحًا** وغيّر شخص آخر المكان إلى **غرفة الاجتماعات في الطابق الثالث**. التغييران في فقرتين مختلفتين، لذا يظهران معًا في النتيجة الوسطى.

لا توجد تعارضات متبقية، فيمكنك الضغط على **تأكيد** فورًا أو تحسين النص الأوسط أولًا. المستند النهائي أدناه هو النتيجة الفعلية التي تلقاها callback التأكيد.

<MergeDemo />

## مثال يُدمج جزئيًا تلقائيًا

هذه المرة غيّرت الوقت إلى **11 صباحًا** والآخر إلى **2 ظهرًا**. تعديل الفقرة نفسها بشكل مختلف يُبقي الوقت متعارضًا. تغييرك للمسؤولين إلى **جيمين وسويون** وتغيير المكان إلى **غرفة الاجتماعات في الطابق الثالث** يُطبّقان تلقائيًا.

حلّ التعارض بإحدى الطرق التالية:

- يسارًا **&gt;&gt;**: اعتماد المحتوى المقابل من إصدار البداية.
- يمينًا **&lt;&lt;**: اعتماد المحتوى المقابل من الإصدار المحفوظ حديثًا.
- **الحل بالمحتوى الحالي**: الاحتفاظ بالوسط أو تحريره ثم وضع علامة الحل.

غيّر جملة الوقت في الوسط واضغط **الحل بالمحتوى الحالي**. لا يتاح التأكيد إلا بعد حل جميع التعارضات.

<MergeDemo partial />

إعادة تحرير منطقة محلولة تحافظ على حالتها. التراجع عن الحل يتراجع عن الحالة أيضًا، والإعادة تستعيدها. حذف النص أو تحريره وحده لا يحل تعارضًا مفتوحًا تلقائيًا.

## قواعد الدمج التلقائي والتعارض

تُقارن التغييرات من مستند البداية إلى مستندك ومن البداية نفسها إلى الإصدار الجديد. تغييرات طرف واحد والتغييرات المتطابقة في الطرفين تُطبّق تلقائيًا، وكذلك تغييرات الفقرات أو الأسطر المختلفة.

مثل دمج النصوص في Git، يُحكم على التداخل بحسب الفقرات والأسطر. حتى تغيير كلمات مختلفة في السطر نفسه يبقى تعارضًا. إدراج محتوى مختلف في الموضع نفسه أو تحرير محتوى حذفه الطرف الآخر يتطلب قرارًا أيضًا.

إذا غيّر الطرفان كتلة ذات بنية كجدول أو قائمة أو منطقة عائمة بشكل مختلف، تتعارض البنية كلها. لا تُخلط الخلايا أو عناصر القوائم عشوائيًا؛ اختر المحتوى أو حرر الوسط. الحركات والتحريرات المتداخلة التي لا يُعرف موضعها بأمان لا تُطبّق تلقائيًا أيضًا.

## ربط عرض دمج مستقل

مرّر NABI TREE JSON محفوظًا أو سلاسل HTML إلى `base` و`local` و`incoming`. استخدم أجنحة المحرر الأصلي وخياراته نفسها. ينشئ `mountMerge()` المحرر الأوسط وشريطه والمصدرين وأدوات التعارض وزر التأكيد.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'ar',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

يتلقى `onConfirm` JSON وHTML للنشر وrevision التحرير و`incomingVersion` للنتيجة الحالية المحلولة بالكامل. إرجاع `false` لا يُكمل التأكيد. أثناء انتظار Promise يُمنع التحرير واختيار التعارض والتأكيد المتكرر. إزالة العرض تُلغي `signal` للنتيجة. يجب إنهاء تركيب الأحرف الكورية عبر IME قبل التأكيد.

اربط إجراءات الخدمة كاختيار الصور أو رفع الملفات كما في المحرر العادي. يستقبل `toolbarOptions` اللوحات وإجراءات المضيف، و`surfaceOptions` خيارات سطح التحرير.

يعيد `incomingVersion` قيمة الخدمة دون تغيير. على الخدمة مقارنتها بأحدث إصدار للخادم عند الحفظ. إذا حُفظ إصدار آخر أثناء الدمج، اجلب أحدث مستند وابدأ دمجًا جديدًا بدل استبداله بنتيجة قديمة.

يمكن أيضًا قراءة الحالة أو طلب التأكيد من خارج العرض.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

اقرأ النتيجة عبر `merge.nabi.getJson()` و`merge.nabi.getHtml()`. لا تحفظ DOM التحرير أو `getEditorHtml()`. لتطبيق محتوى سابق محدد فقط بين إصدارين، استخدم الدمج بالنقر في [المقارنة](./compare).

## التأكيد بعد انتهاء الرفع

اربط جناح `upload` و`mountUpload()` لزر الملف واللصق والسحب والإفلات. يرسل `sendUpload` الملفات إلى الخادم ويعيد `{ uri }`. انظر [رفع الملفات](../wing/etc/upload) لمثال كامل للاتصال وعرض التقدم.

استخدم `merge.session.hold()` لتعليق التأكيد واختيار التعارض أثناء أعمال غير متزامنة كالرفع لم تنعكس بعد في المستند. استدعِ الدالة المعادة عند الإكمال أو الإلغاء أو إزالة العرض. حرر التعليق **بعد الإدراج في المستند** وليس بمجرد الرفع للخادم، حتى لا يغيب الملف عن النتيجة النهائية.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'ar',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'ar',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` هو DOM التحرير الأوسط؛ `merge.surface` و`merge.toolbar` مركّبان بالفعل. لا تنشئ سطحًا أو شريطًا آخر في الموضع نفسه. أزل أولًا أدوات الرفع والتقدم الإضافية ثم استدعِ `merge.unmount()`.
