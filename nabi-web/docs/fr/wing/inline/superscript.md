---
title: Exposant
description: Élever le texte sélectionné au-dessus de la ligne de base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Exposant

Élève le texte sélectionné au-dessus de la ligne de base, pour les exposants et les marqueurs de référence. L'appliquer à nouveau supprime le formatage.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
