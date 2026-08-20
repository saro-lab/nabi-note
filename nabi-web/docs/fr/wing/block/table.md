---
title: Tableau
---

# Tableau

## Description

`tableWings` (nom `table`, raccourci `T`) est propriétaire de la structure `table > tr > td`.

Les lignes (`tr`) et les cellules (`td`) ne s'enregistrent jamais à part — la wing table les
amène avec elle par `parts`, donc retirer le tableau retire aussi les lignes et les cellules.

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

Le `singleParagraph` de la cellule est ce qui protège la grille — appuyer sur <kbd>Entrée</kbd>
à l'intérieur d'une cellule ne fend pas le paragraphe en deux, et supprimer une sélection qui
s'étend sur deux cellules ne les fusionne pas en une seule.

Appuyer sur le bouton n'est pas un bascule : une grille de dimension lignes × colonnes (jusqu'à
8×8) apparaît, un tableau de la taille choisie entre à la place du caret, et le caret se déplace
vers la première cellule.

Les commandes n'apparaissent sur la ligne contextuelle que lorsque le caret est à l'intérieur
d'un tableau.

| Groupe | Champs |
|---|---|
| Ligne | ajouter une ligne au-dessus · ajouter une ligne en dessous · supprimer la ligne |
| Colonne | ajouter une colonne à gauche · ajouter une colonne à droite · supprimer la colonne |
| Fusion | fusionner (un seul bascule) |
| En-tête | faire de cette ligne un en-tête · faire de cette colonne un en-tête (elles deviennent des `<th>`) |
| Tri | activer/désactiver le tri (ordonner les colonnes côté lecture) |
| Suppression | supprimer le tableau |

**La fusion est un seul bascule**, pas un bouton par direction. Sélectionnez plusieurs cellules et
appuyez : elles deviennent une seule ; posez le caret dans une cellule fusionnée et appuyez de
nouveau pour défaire la fusion.

**Il n'y a ici aucun champ pour placer la boîte du tableau à gauche, au centre ou à droite.**
L'emplacement d'un tableau est porté par le paragraphe enveloppe qui le tient, pas par le tableau
lui-même, donc ce sont les boutons d'alignement de la barre d'outils principale qui font ce
travail.

::: warning La marque de tri et les cellules fusionnées
Le tri n'est **qu'une marque**. L'éditeur la pose sans problème sur un tableau fusionné, et
fusionner ne retire pas une marque déjà posée.

C'est le côté lecture qui refuse — `attachTableSort` ne s'attache pas du tout à un tableau qui a
des cellules fusionnées visibles, parce que des lignes fusionnées sont liées entre elles et les
réordonner casserait la grille. Sur un tableau fusionné, la marque reste donc là sans que rien ne
se passe.
:::

## Le contenu décide de la largeur

Un tableau n'a pas de réglage de largeur. Il ne s'élargit **qu'à la mesure de son contenu**, et
quand il devient plus large que l'espace qu'il a, il **défile latéralement** sur place — la page
n'est jamais poussée. Il n'y a pas non plus de `<div>` enveloppe. Ce qui entre dans la valeur
enregistrée est un unique `<table>`, et les seuls attributs qu'il porte sont l'alignement
(`data-nabi-align`) et la marque de tri.

## Se déplacer et sélectionner

`Tab` / `Shift+Tab` déplacent entre les cellules (en bout de tableau, ils restent sur place).
Comme une cellule est fixée à un seul paragraphe, Entrée ne fend pas la cellule — elle **change de
ligne à l'intérieur de cette cellule**, puisque la fendre reviendrait à inventer un bloc que la
grille ne peut pas contenir. Les flèches se déplacent le long de la grille plutôt que le long de
l'écran.

Vous pouvez glisser la souris sur plusieurs cellules pour les sélectionner. Cette sélection par
glisser est elle aussi tenue par la wing elle-même à travers `attach`, donc **il n'y a rien de
plus à monter** — `mountSurface` la branche pour vous.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
