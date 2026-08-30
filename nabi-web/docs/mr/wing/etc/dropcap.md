---
title: मोठे पहिले अक्षर
description: body text मोठ्या पहिल्या अक्षराने सुरू करा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# मोठे पहिले अक्षर

paragraph चे पहिले अक्षर मोठ्या आकारात ठेवा आणि पुढील lines त्याच्या बाजूने वाहू द्या. हे paragraph-level formatting आहे, म्हणून निवडलेल्या शब्दाच्या फक्त एका भागाला ते लागू होत नाही.

प्रकाशित आणि editing दृश्य एकच आकार ठेवतात. editing करताना caret व delete positions सरकू नयेत म्हणून पहिले अक्षर खऱ्या element मध्ये wrap केले जाते; तो element साठवलेल्या document content मध्ये नसतो.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS शैली

प्रकाशित आणि editing दृश्य पहिले अक्षरासाठी वेगवेगळे selectors वापरतात. प्रकाशित दृश्य `[data-nabi-dropcap="1"]::first-letter` वापरते, तर editing दृश्य खरा `[data-nabi-dropcap-letter]` element वापरते. color, font किंवा size सारखी दृश्य values बदलताना editing व प्रकाशित output सारखे दिसण्यासाठी दोन्ही selectors एकत्र लिहा.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

size आणि line height बदलल्यास दोन्ही selectors ला तीच values लागू करा.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

drop caps पहिले अक्षराभोवतीचा line flow मोजतात; म्हणून फक्त एक बाजू बदलणे किंवा values खूप मोठ्या करणे WYSIWYG shape बिघडवू शकते. तरी editor मध्ये नवा `::first-letter` rule जोडू नका. editor मध्ये फक्त विद्यमान `[data-nabi-dropcap-letter]` ला style करा.
