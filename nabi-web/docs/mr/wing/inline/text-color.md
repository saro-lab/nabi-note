---
title: मजकूर रंग
description: निवडलेल्या मजकुराला परवानगी असलेले रंग नाव द्या.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# मजकूर रंग

निवडलेल्या मजकुराला परवानगी असलेले रंग नाव द्या. साठवलेले मूल्य CSS color string नसते; ते परवानगीचे नाव असते आणि खरा रंग CSS variable `--nabi-tc-<name>` ठरवतो. त्यामुळे तेच document light व dark themes मध्ये वाचनीय राहते.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

`values` वगळल्यास `green`, `coral`, `violet`, `amber` आणि `blue` हे default palette असते. सूची कमी केल्यास इतर रंग command ने आणि document लोड करताना नाकारले जातात.

## CSS शैली

document फक्त रंगनाव साठवते. editor आणि प्रकाशित दृश्याचे खरे रंग CSS variables ने ठरवा.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

पार्श्वभूमी रंगासह contrast तपासा. dark theme मध्ये त्याच रंगनावाला वेगळे मूल्य देता येते.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
