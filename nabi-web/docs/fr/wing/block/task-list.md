---
title: Liste de tâches
---

# Liste de tâches

## Description

`taskListWing` (nom `tl`, raccourci `K`) partage sa balise (`<ul>`) avec la Liste à puces mais en
est une implémentation distincte — à la sortie, `data-nabi-list="task"` dit qu'il s'agit d'une
Liste de tâches, et `data-nabi-checked` sur chaque élément porte l'état de coche.

L'élément vient avec elle par `parts` — une record, pas un tableau.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

Dans la valeur enregistrée, la coche s'appelle `ck` et n'a qu'une seule valeur, `1` — l'état
« décoché » n'est pas `0` mais **l'absence complète du champ**. À la sortie, cela se déplie en
`data-nabi-checked="true"` / `"false"`.

Appuyez sur le bouton et le bloc où se trouve le caret (ou tous les blocs couverts par la
sélection) s'enveloppe en Liste de tâches. Taper `[ ] ` ou `[x] ` (la casse est indifférente) au
début d'une ligne donne le même résultat, et selon ce que vous avez tapé, l'élément démarre
coché ou non. La ligne n'a pas besoin d'être vide, et cela ne se déclenche que sur la première
ligne d'un paragraphe.

La case n'est pas un `<input>` mais une marque dessinée en CSS — mettre un véritable input dans un
`contenteditable` emmêlerait le caret. Une case cochée est un ✕ blanc sur une tuile de couleur
d'accent, et sa ligne s'estompe avec un barré.

**L'endroit qui la fait basculer est la case elle-même** — il faut appuyer sur la bande étroite au
début de l'élément (à peu près la largeur d'un caractère) ; appuyer sur le texte ne fait que
placer le caret. Dans un texte écrit de droite à gauche, cette bande se trouve de l'autre côté.
Ceci est porté par l'`attach` propre à la wing, donc **il n'y a rien de plus à monter.**

Indenter et désindenter avec `Tab` / `Shift+Tab`, et terminer la liste par Entrée sur un élément
vide, fonctionnent comme dans [Liste à puces](./bullet-list).

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
