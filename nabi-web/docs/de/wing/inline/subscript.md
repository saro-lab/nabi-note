---
title: Tiefstellung
description: Hebt den ausgewählten Text unter die Grundlinie.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tiefstellung

Hebt den ausgewählten Text unter die Grundlinie, für chemische Formeln und Indizes. Durch erneutes Anwenden wird das Formatierung entfernt.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
