---
title: Unterstreichung
description: Ausgewählten Text unterstreichen.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Unterstreichung

Unterstreicht den ausgewählten Text. Das kann wie ein Link aussehen, ist aber reine Textformatierung und fügt weder eine Adresse noch eine Navigation hinzu.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
