---
title: Tableau
description: Créez des lignes et des colonnes, modifiez les cellules et prenez en charge le tri par colonne.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tableau

Choisissez des lignes et des colonnes dans la barre d'outils pour créer un tableau. À l'intérieur d'une cellule, le contenu continue avec des sauts de ligne au lieu de plusieurs paragraphes, et les touches Tab et Maj+Tab permettent de passer à la cellule suivante ou précédente.

L'ajout et la suppression de lignes ou de colonnes, la fusion de cellules et la bascule des en-têtes de colonne s'effectuent autour des cellules sélectionnées. Pour utiliser le tri par colonne dans la vue publiée après avoir enregistré un tableau comme triable, connectez `attachViewer()` depuis `nabi-note/viewer`. Les tableaux avec des cellules fusionnées ne sont pas triés.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## Styles CSS

Stylez le tableau avec `.nabi-content table`, et les cellules avec `.nabi-content :is(th, td)`. Ne modifiez pas la structure des cellules ni le bouton de tri inséré par le visualiseur.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Si le visualiseur est connecté, conservez le bouton `.nabi-sort`. Si vous forcez la substitution de `position` ou du rembourrage droit des cellules, cela peut chevaucher le bouton de tri.
