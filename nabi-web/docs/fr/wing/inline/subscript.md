---
title: Indice
description: Placer le texte sélectionné en dessous de la ligne de base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Indice

Placer le texte sélectionné en dessous de la ligne de base, pour les formules chimiques et les indices. L'appliquer à nouveau supprime le formatage.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
