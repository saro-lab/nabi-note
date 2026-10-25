---
title: Altı çizili
description: Seçili metnin altını çizin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Altı çizili

Seçili metnin altını çizer. Bağlantıya benzeyebilir, ancak yalnızca metin biçimidir; adres veya gezinme davranışı eklemez.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
