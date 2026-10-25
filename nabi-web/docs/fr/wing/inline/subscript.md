---
title: Indice
description: Placer le texte sélectionné en dessous de la ligne de base.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Indice

Affiche le texte sélectionné en plus petit sous la ligne de base. Ce format convient aux notations nécessitant un indice, comme la formule chimique `H₂O`. Il n’ajoute pas de calcul de formules : utilisez-le pour préserver la notation elle-même.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
