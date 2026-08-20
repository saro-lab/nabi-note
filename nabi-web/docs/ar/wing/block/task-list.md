---
title: قائمة المهام
---

# قائمة المهام

## الوصف

`taskListWing` (اسمه `tl`، اختصاره `K`) يتقاسم الوسم (`<ul>`) مع القائمة النقطية
لكنه تطبيق منفصل — عند الخروج تدل العلامة `data-nabi-list="task"` على أنها
قائمة مهام، وتدل `data-nabi-checked` على كل عنصر بحالة تأشيره.

يُجلَب العنصر عبر `parts` — وهو سجل لا مصفوفة.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

في القيمة المحفوظة التأشير هو `ck` وقيمته `1` وحده — الحالة المطفأة ليست `0`
بل **غياب الخانة كليًّا.** في HTML الخارج تُفكَّك إلى
`data-nabi-checked="true"`/`"false"`.

الضغط على الزر يلفّ الكتلة التي يقف فيها المؤشر (أو الكتل التي يطالها التحديد)
بقائمة مهام. كتابة `[ ] ` أو `[x] ` (بلا فرق بين حالتي الحرف) في أول السطر
تعطي النتيجة نفسها، ويبدأ العنصر مؤشَّرًا أو غير مؤشَّر تبعًا لما كُتب. لا حاجة
لأن يكون السطر فارغًا، ويعمل هذا فقط في أول سطر من الفقرة.

مربع التأشير ليس `<input>` بل علامة مرسومة بـCSS — لأن وضع input حقيقي داخل
`contenteditable` يشوّش المؤشر. الخانة المؤشَّرة علامة ✕ بيضاء فوق بلاطة بلون
التمييز، ويصبح ذلك السطر باهتًا ويُرسَم عليه خط أفقي.

**مكان التبديل هو الخانة نفسها** — يجب الضغط على الشريط الضيق (بعرض حرف تقريبًا)
في أول العنصر ليتغير، أما الضغط على جهة النص فينقل المؤشر فقط. في الكتابة من
اليمين إلى اليسار يقف ذلك الشريط في الجهة المقابلة. يحمل الجناح هذا العمل عبر
`attach` **فلا حاجة لتركيب أي شيء بمفرده.**

الإزاحة داخلًا وخارجًا بـ`Tab`/`Shift+Tab`، وإنهاء القائمة بـEnter في عنصر
فارغ، كلاهما كما في [القائمة النقطية](./bullet-list).

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
