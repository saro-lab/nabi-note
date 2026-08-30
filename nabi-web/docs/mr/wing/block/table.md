---
title: तक्ता
description: rows आणि columns तयार करा, cells संपादित करा आणि column sorting समर्थित करा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# तक्ता

तक्ता तयार करण्यासाठी toolbar मधून rows आणि columns निवडा. cell मध्ये अनेक paragraphs ऐवजी line breaks ने content पुढे जाते, आणि Tab व Shift+Tab पुढील किंवा मागील cell मध्ये जातात.

rows किंवा columns जोडणे व काढणे, cells merge करणे आणि header cells toggle करणे निवडलेल्या cells भोवती कार्य करते. तक्ता sortable म्हणून जतन केल्यानंतर प्रकाशित दृश्यात column sorting वापरण्यासाठी `nabi-note/viewer` मधील `attachViewer()` जोडा. merged cells असलेले tables sort होत नाहीत.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS शैली

तक्त्याला `.nabi-content table` ने आणि cells ला `.nabi-content :is(th, td)` ने style करा. cell structure किंवा viewer ने घातलेले sort button बदलू नका.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

viewer जोडलेला असल्यास `.nabi-sort` button ठेवा. cell `position` किंवा right padding सक्तीने override केल्यास ते sort button वर येऊ शकते.
