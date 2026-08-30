---
title: formatting काढा
description: निवडीतील text formatting आणि paragraph formatting काढा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# formatting काढा

निवडलेल्या range मधील text formatting एकाच वेळी काढा. bold, color आणि typeface सारखे नोंदवलेले default marks तसेच heading, alignment आणि drop cap सारखे paragraph attributes यांत येतात. Esc पटकन दोनदा दाबल्यावर तीच क्रिया होते.

हे lists, tables, quotes किंवा images सारख्या document structures चे plain text मध्ये रूपांतर करत नाही. images व videos चे बाहेरील alignment आणि uploads ने तयार केलेल्या attachment links जशाच्या तशा राहतात.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

काढायचे formatting wings देखील निवडलेले असले पाहिजेत; अन्यथा त्यांचे formatting काढता येत नाही.
