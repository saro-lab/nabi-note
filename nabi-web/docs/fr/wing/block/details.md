---
title: Détails
description: Regroupez un résumé et un corps, et stockez s'il commence ouvert.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Détails

Regroupez un court résumé et un corps en un seul bloc. Lorsque vous le créez depuis la barre d'outils, vous saisissez d'abord le résumé, puis continuez à écrire le contenu en dessous.

L'état ouvert défini avec le triangle est stocké dans le document et devient l'état initial dans la vue publiée. Pendant l'édition, le corps reste ouvert afin qu'il puisse être modifié, mais la valeur d'état stockée est conservée.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## Styles CSS

Stylisez le bloc de détails avec `.nabi-content details`, et le titre avec `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

L'attribut `open` est l'état initial ouvert enregistré par l'auteur. Le CSS peut styliser cet état, mais il vaut mieux ne pas forcer l'état lui-même.
