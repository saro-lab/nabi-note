---
title: Hochgestellt
description: Den markierten Text über die Grundlinie heben.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Hochgestellt

Zeigt den ausgewählten Text kleiner oberhalb der Grundlinie an. Das eignet sich für Exponenten oder Fußnotenzeichen und gilt nur für den ausgewählten Bereich.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
