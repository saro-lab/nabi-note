---
title: Soulignement
description: Souligner le texte sélectionné.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Soulignement

Souligne le texte sélectionné. Il peut ressembler à un lien, mais il s’agit uniquement d’un format de texte, sans adresse ni action de navigation.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
