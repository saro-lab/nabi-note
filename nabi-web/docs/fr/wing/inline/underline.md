---
title: Soulignement
description: Souligner le texte sélectionné.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Soulignement

Souligne le texte sélectionné. L'appliquer à nouveau sur la même plage supprime le formatage, et la marque est conservée dans les documents enregistrés.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
