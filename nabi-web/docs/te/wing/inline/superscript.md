---
title: సూపర్‌స్క్రిప్ట్
description: ఎంచుకున్న టెక్స్ట్‌ను baseline పైకి ఎత్తండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# సూపర్‌స్క్రిప్ట్

ఎంచుకున్న వచనాన్ని ఆధార రేఖ ఎగువన చిన్న పరిమాణంలో చూపిస్తుంది. ఘాతాంకాలు లేదా పాదసూచిక గుర్తుల కోసం ఉపయోగించవచ్చు. ఇది ఎంచుకున్న భాగానికి మాత్రమే వర్తిస్తుంది.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
