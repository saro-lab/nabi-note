---
title: Séparateur
description: Insère une règle horizontale qui sépare le flux du document.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Séparateur

Une règle horizontale qui sépare le flux du document. Tapez trois tirets ou plus dans un paragraphe vide et appuyez sur Entrée, ou insérez-en un depuis la barre d'outils.

Un séparateur est un bloc indépendant sans texte, il ne conserve donc pas de formatage tel que les titres ou les couleurs. Utilisez-le uniquement pour séparer les paragraphes avant et après lui.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
