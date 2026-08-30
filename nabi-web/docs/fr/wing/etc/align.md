---
title: Alignement
description: Modifie l'alignement horizontal des paragraphes et des blocs d'objets.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Alignement

Alignez le paragraphe actuel, ou les paragraphes de la plage sélectionnée, à gauche, au centre ou à droite. Les objets contenus dans un paragraphe, tels que les images, les vidéos et les tableaux, sont alignés via le paragraphe qui les englobe.

L'alignement est stocké en tant qu'attribut de paragraphe, et non comme un formatage de texte. Les blocs de code sont exclus de l'alignement car l'indentation y a elle-même une signification.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
