---
title: Barré
description: Barrez le texte sélectionné.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Barré

Trace une ligne au milieu du texte sélectionné. Cela permet de garder visibles des formulations modifiées ou des informations devenues obsolètes sans les supprimer. Une nouvelle application à la même plage retire ce format.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
