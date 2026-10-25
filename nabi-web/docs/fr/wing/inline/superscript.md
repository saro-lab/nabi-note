---
title: Exposant
description: Élever le texte sélectionné au-dessus de la ligne de base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Exposant

Affiche le texte sélectionné en plus petit au-dessus de la ligne de base. Ce format sert aux exposants ou aux appels de note et ne s’applique qu’à la plage sélectionnée.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
