---
title: लिंक
description: सुरक्षित वेब पत्ते जोडा आणि upload केलेली attachments दाखवा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# लिंक

मजकूर निवडा आणि त्याला address जोडा. मजकूर न निवडता address घातल्यास address स्वतः link text म्हणून घातला जातो. `http://` किंवा `https://` address टाइप करून Space किंवा Enter दाबल्यास तोही link बनतो.

links फक्त `http:`, `https:` आणि `.` किंवा `/` ने सुरू होणारे त्याच site चे paths साठवतात. `javascript:` किंवा `//example.com` सारखे स्पष्ट origin नसलेले addresses नाकारले जातात. upload ने तयार झालेल्या attachment links मध्ये file informationही असते आणि त्या सामान्य link सारख्या हाताने बनवता येत नाहीत.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS शैली

सामान्य links ला `.nabi-content a` ने आणि attachment links ला स्वतंत्रपणे `.nabi-content a[data-nabi-file]` ने style करा.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

attachment link चे `::before` आणि `::after` icon व file extension दाखवतात, म्हणून त्यांचा `content` सहसा बदलू किंवा काढू नये.
