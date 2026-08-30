---
title: Italique
description: Mettre en italique le texte sélectionné.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Italique

Met en italique le texte sélectionné. L'appliquer à nouveau sur la même plage supprime le formatage, et la marque est conservée dans les documents sauvegardés.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
