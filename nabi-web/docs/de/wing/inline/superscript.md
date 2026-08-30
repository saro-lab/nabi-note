---
title: Hochgestellt
description: Den markierten Text über die Grundlinie heben.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Hochgestellt

Hebt den markierten Text über die Grundlinie, für Exponenten und Referenzmarkierungen. Durch erneutes Anwenden wird das Formatierung entfernt.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
