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

Dans une cellule, l'alignement s'applique au paragraphe interne ou à l'image à la position du curseur. Sélectionner plusieurs cellules par glissement l'applique à tous leurs paragraphes et images pouvant être alignés. Si la sélection contient des alignements différents, aucun bouton d'alignement n'apparaît sélectionné.

Pour aligner le tableau lui-même, cliquez sur **Sélectionner le tableau** dans ses outils contextuels ou placez le curseur avant ou après le tableau dans le paragraphe qui l'entoure, puis utilisez les boutons d'alignement de la barre principale. Modifiez le placement à gauche ou à droite d'une zone flottante dans ses outils contextuels plutôt qu'avec les boutons d'alignement.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Pour appliquer une commande à la sélection actuelle, utilisez `l` pour gauche, `c` pour centre et `r` pour droite.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
