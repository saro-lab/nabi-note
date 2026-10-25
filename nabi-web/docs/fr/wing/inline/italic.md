---
title: Italique
description: Mettre en italique le texte sélectionné.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Italique

Met le texte sélectionné en italique. Cela permet de distinguer légèrement du corps du texte les titres d’œuvres ou les mots étrangers. Cliquez à nouveau sur une plage déjà en italique pour retirer ce format.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
