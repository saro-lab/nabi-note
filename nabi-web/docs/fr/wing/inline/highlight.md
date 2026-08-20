---
title: Surlignage
---

# Surlignage

## Description

`highlightWing` (nom `hl`) est propriétaire (par `claim`) de `<mark data-color="...">`. C'est
une marque en ligne à valeur, donc pas un bascule allumé/éteint mais un choix de couleur — de la
même façon que la couleur de texte.

- **Le bouton de la barre d'outils (raccourci `H`) applique le jaune** — il envoie
  `{ c: 'yellow' }` à `setHighlight`. Ce n'est pas un bouton qui tourne sans argument.
- Ce bouton fait donc un **bascule sur le jaune spécifiquement**. Il ne retire que si la portée
  sélectionnée est **entièrement jaune** — sur une portée entièrement verte, appuyer la fait
  passer au jaune au lieu de la retirer ; il faut appuyer une fois de plus pour la retirer.
- Quand le caret est à l'intérieur d'une marque de surlignage, six échantillons de couleur
  apparaissent sur la ligne contextuelle — les appuyer ne change que la couleur sur place. Cette
  wing n'a pas de champ « effacer » séparé. Appuyer de nouveau sur la même couleur la retire, et
  effacer la mise en forme est l'affaire de `clearFormatWing` (à enregistrer séparément).
- **Avec seulement un caret sélectionné, il y a deux cas.** Si le caret est déjà à l'intérieur
  d'une marque de surlignage, tout le texte que couvre cette marque devient la cible (pas besoin
  de resélectionner la portée). Hors d'une marque, comme il n'y a pas de texte sur lequel agir,
  cela reste **armé**, et le prochain caractère tapé sort dans cette couleur.
- Seul le nom de la couleur reste dans la valeur enregistrée — quelque chose comme
  `data-color="yellow"`. Aucun `style` en ligne ne sort. La couleur de fond réelle est dessinée
  par la feuille que cette wing porte via `styles` (partagée avec la couleur de texte), et la
  valeur de couleur elle-même vient des jetons du cœur `--nabi-hl-*` — l'hôte les redéfinit.
- **Une valeur hors liste ne se pose nulle part.** La commande ne tourne pas du tout, et dans le
  HTML entrant, un `<mark>` portant un `data-color` hors liste perd son enveloppe et **seul le
  texte reste.** Il en va de même pour un `<mark>` sans `data-color` du tout — la couleur *est*
  la valeur, donc un surlignage sans valeur n'a nulle part où se tenir.
- Une valeur enregistrée modifiée à la main suit la même règle — quand `repair` rencontre une
  valeur hors liste, il retire ce nœud, enveloppe comprise.

| Nom de couleur | Valeur enregistrée |
|---|---|
| Jaune | `yellow` |
| Vert | `green` |
| Cyan | `cyan` |
| Rose | `pink` |
| Violet | `purple` |
| Orange | `orange` |

Ces six couleurs sont exportées sous `HIGHLIGHT_COLORS` — pas des valeurs de couleur mais un
**tableau de noms** (`readonly string[]`). La valeur de couleur, c'est la feuille qui la porte.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
