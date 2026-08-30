---
title: Barré
description: Barrez le texte sélectionné.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Barré

Barre le texte sélectionné. L'appliquer à nouveau sur la même plage supprime le formatage, et la marque est conservée dans les documents enregistrés.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
