---
title: Détails
description: Regroupez un résumé et un corps, et stockez s'il commence ouvert.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Détails

Regroupez un court résumé et un corps en un seul bloc. Lorsque vous le créez depuis la barre d'outils, vous saisissez d'abord le résumé, puis continuez à écrire le contenu en dessous.

L'état d'ouverture défini avec le triangle est enregistré dans le document et devient l'état initial de la vue publiée. Pendant l'édition aussi, vous pouvez cliquer sur le triangle pour ouvrir et fermer le bloc.

Dans une cellule ou un autre bloc, seul le bloc dépliable concerné s'ouvre ou se ferme. Si le curseur ou la sélection se trouve dans le contenu en cours de fermeture, il est déplacé à l'extérieur ; une sélection située ailleurs est conservée.

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
