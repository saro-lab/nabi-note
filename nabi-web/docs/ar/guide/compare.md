---
title: المقارنة
description: قارن مستندين جنبًا إلى جنب وطبّق المحتوى السابق المحدد على المستند الحالي.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# المقارنة

اعرض مستندين محفوظين جنبًا إلى جنب لرؤية التغييرات. يمكن فتح المقارنة دون محرر؛ اربط callback لتطبيق المحتوى السابق المحدد على المستند الحالي.

## تطبيق محتوى سابق محدد

تكون المقارنة المستقلة للقراءة فقط افتراضيًا، ولا تعرض أزرار التطبيق **&gt;&gt;**. اربط دالة `onMerge` لإظهار هذه الأزرار.

المستند السابق يسارًا والحالي يمينًا. اضغط **&gt;&gt;** بجانب التغيير لتطبيق المحتوى السابق للفقرة أو مجموعة الأسطر المعنية. الاختيار ليس حرفًا حرفًا. يمكنك أيضًا استعادة محتوى محذوف أو إزالة محتوى أُضيف إلى المستند الحالي.

المثال أدناه للقراءة فقط. تحقّق من تغيّر موعد اللقاء والأغراض المطلوب إحضارها. يعيد **البدء من جديد** المثال الأصلي.

<CompareDemo />

## مقارنة مستقلة

استورد من `nabi-note/diff`. مرّر NABI TREE JSON محفوظًا أو سلاسل HTML إلى `before` و`after`. أنشئ registry بالأجنحة نفسها المستخدمة في المحرر الأصلي لقراءة الجداول والقوائم والصور وسائر المحتوى وعرضها كاملة.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ar',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

تظهر افتراضيًا التغييرات وسياقها فقط. يفتح زر الطي المستندين كاملين، وينقلك السابق/التالي بين التغييرات. عند عدم وجود تغييرات يظهر المحتوى كاملًا. حذف `onMerge` يجعل المقارنة للقراءة فقط.

## ربط الدمج بالنقر عبر callback

يرسل النقر نتيجة مقترحة إلى `onMerge`. ربط callback وحده لا يحفظ المستند تلقائيًا. يجب أن تقبل الخدمة الاقتراح وتستدعي `update()` لتحديث المقارنة أيضًا.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ar',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` هو NABI TREE JSON يطبّق التغيير المحدد فقط. `before` و`after` هما المستندان لحظة النقر؛ يحدد `changeId` التغيير و`revision` حالة المقارنة. مرّر `revision` وسيطًا ثالثًا إلى `update()`؛ إذا تغيرت المقارنة بالفعل يعيد `false` دون تطبيق الاقتراح.

تُمنع النقرات المتكررة أثناء انتظار callback غير المتزامن. تحديث المستندات أو إزالة العرض يُلغي `signal`. عند الحفظ إلى الخادم، تحقق من الإشارة وإصدار المستند على الخادم حتى لا تستبدل مستندًا جديدًا بنتيجة قديمة.

## فتح المقارنة من المحرر

اربط جناح `diff` و`mountDiffWing()` لفتح المقارنة من شريط الأدوات. المرجع هو آخر مستند تم تحميله. التحرير العادي والتراجع لا يغيران المرجع.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'ar',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

القيمة الافتراضية لـ `merge` هي `true`، لذا يمكن تطبيق المحتوى السابق المختار على المحرر. يمكن التراجع عن العملية ويبقى المستند المرجعي. إذا تغير المحرر الأصلي أثناء فتح العرض، تُعاد المقارنة. استخدم `merge: false` لجعل المقارنة للقراءة فقط.

استدعِ `toolbar.unmount()` و`comparison.unmount()` عند إزالة العرض. لتضمين إصدار بداية التحرير ودمج تغييرات الطرفين تلقائيًا، استخدم [الدمج](./merge).
