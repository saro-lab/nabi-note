---
title: மேற்குறி
description: அடிக்குறிப்பு மற்றும் அடுக்கு போல எழுத்தை அடிக்கோட்டுக்கு மேலே சிறியதாகக் காட்டவும்.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# மேற்குறி

தேர்ந்தெடுத்த எழுத்தை அடிக்கோட்டுக்கு மேலே சிறியதாகக் காட்டுகிறது. அடுக்கு அல்லது அடிக்குறிப்புக் குறியீட்டுக்குப் பயன்படுத்தலாம்; தேர்ந்தெடுத்த வரம்பில் மட்டுமே பொருந்தும்.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
