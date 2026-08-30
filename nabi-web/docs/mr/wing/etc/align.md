---
title: संरेखन
description: paragraphs आणि object blocks चे आडवे संरेखन बदला.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# संरेखन

सध्याचा paragraph किंवा निवडलेल्या range मधील paragraphs डावीकडे, मध्यभागी किंवा उजवीकडे align करा. images, videos आणि tables सारख्या paragraph मधील objects त्यांना wrap करणाऱ्या paragraph द्वारे align होतात.

alignment हे text formatting म्हणून नव्हे तर paragraph attribute म्हणून साठवले जाते. indentation तेथे अर्थपूर्ण असल्याने code blocks संरेखनातून वगळले जातात.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
