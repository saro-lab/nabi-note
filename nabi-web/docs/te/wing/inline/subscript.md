---
title: సబ్‌స్క్రిప్ట్
description: ఎంచుకున్న టెక్స్ట్‌ను baseline కిందకు దించండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# సబ్‌స్క్రిప్ట్

ఎంచుకున్న వచనాన్ని ఆధార రేఖ దిగువన చిన్న పరిమాణంలో చూపిస్తుంది. `H₂O` వంటి రసాయన సూత్రాల్లో కింది సూచిక అవసరమైన చోట ఇది సరిపోతుంది. ఈ ఆకృతి సూత్రాలను లెక్కించదు; వాటి రాత రూపాన్ని నిలుపుకోవడానికి ఉపయోగించండి.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
