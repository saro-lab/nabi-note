---
title: अक्षर आकार
description: अनुमत चरणों के भीतर अक्षर का आकार बदलता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# अक्षर आकार

चुने हुए पाठ के आकार का चरण बदलता है। दायरा चुना हो तो उसी पर लागू होता है; केवल caret हो तो मौजूदा अनुच्छेद के पाठ का आकार बदलता है। सहेजे गए data में `px` जैसे मनमाने मान नहीं, केवल अनुमत चरण रहते हैं।

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values` न देने पर `xs`, `sm`, `lg`, `xl` चरण उपयोग होते हैं। सूची छोटी करने पर पुराने दस्तावेज़ के अन्य चरण भी load होते समय हट जाते हैं।

## CSS शैलियाँ

आकार को `.nabi-content [data-nabi-size="xs"]` जैसे सहेजे गए चरण selector से बदल सकते हैं। दस्तावेज़ में न होने वाला मनमाना चरण न बनाएँ; CSS को registered `values` के भीतर ही समायोजित करें।

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

चरणों के बीच आकार का अंतर समान रखने से लेखक ने संपादक में जो अर्थ चुना था, वह प्रकाशित पृष्ठ पर भी बना रहता है।
