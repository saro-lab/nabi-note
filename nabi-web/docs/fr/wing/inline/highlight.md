---
title: Surbrillance
description: Appliquez une couleur de surbrillance autorisée derrière le texte sélectionné.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Surbrillance

Appliquez une couleur de surbrillance derrière le texte sélectionné. Les données stockées conservent uniquement les noms de couleurs autorisés au lieu de valeurs CSS arbitraires, afin que les données du document et le style visuel restent séparés.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Si `values` est omis, la palette par défaut est `yellow`, `green`, `cyan`, `pink`, `purple` et `orange`. Si vous réduisez la liste, les couleurs non enregistrées ne sont pas conservées même lors du chargement d'un document existant.

## Styles CSS

Le document stocke uniquement des noms de couleurs. Modifiez les couleurs de l'éditeur et de la vue publiée via des variables CSS.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

La modification simultanée de plusieurs couleurs permet de conserver les noms de couleurs du document tout en adaptant uniquement l'humeur du produit.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
