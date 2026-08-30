---
title: YouTube
description: Intégrer une vidéo YouTube dans le document et ajuster sa largeur.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Accepte une URL ou un ID de vidéo YouTube et le transforme en bloc intégré. Le document ne stocke que l'ID de la vidéo (11 caractères) et la largeur, et non l'URL complète ; une nouvelle vidéo commence centrée à 70 % de la largeur.

La largeur est choisie parmi des valeurs fixes, et l'alignement est stocké sur le paragraphe qui entoure la vidéo. Dans l'éditeur, le premier clic sélectionne la vidéo ; une fois sélectionnée, un nouveau clic peut la lire. Pour modifier l'adresse, supprimez la vidéo et insérez-en une nouvelle.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## Styles CSS

Utilisez `.nabi-content iframe` pour modifier la bordure ou les coins de la vidéo. Ne modifiez pas la largeur stockée ni l'alignement.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

Le package utilise `aspect-ratio`, la largeur et les marges d'alignement pour maintenir la taille correcte de la vidéo ; ne les écrasez pas.
