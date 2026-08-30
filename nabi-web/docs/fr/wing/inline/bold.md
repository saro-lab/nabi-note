---
title: Gras
description: Mettre le texte sélectionné en gras.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Gras

Met le texte sélectionné en gras. L'appliquer à nouveau sur la même plage supprime le formatage. La marque reste associée au texte dans les documents sauvegardés.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
