---
title: Couleur de texte
---

# Couleur de texte

## Description

`textColorWing` (nom `tc`) est propriétaire (par `claim`) de `<span data-color="...">`. De la
même sorte que le surlignage, c'est une marque en ligne à valeur : on ne l'allume pas et
l'éteint pas, on choisit une couleur.

- **Le bouton de la barre d'outils (raccourci `C`) applique le vert** — il envoie
  `{ c: 'green' }` à `setTextColor`. Ce n'est pas un bouton qui tourne sans argument.
- Ce bouton fait donc un **bascule sur le vert spécifiquement**. Il ne retire que si la portée
  sélectionnée est entièrement verte ; si une autre couleur est appliquée, il passe au vert.
- Quand le caret est à l'intérieur d'une marque de couleur de texte, cinq échantillons de couleur
  apparaissent sur la ligne contextuelle — les appuyer ne change que la couleur sur place (les
  marques ne s'empilent pas). Cette wing n'a pas de champ « effacer » séparé — appuyer de nouveau
  sur la même couleur la retire, et le reste est l'affaire de `clearFormatWing`.
- **Avec seulement un caret sélectionné, il y a deux cas.** À l'intérieur d'une marque, tout le
  texte que couvre cette marque est la cible ; hors d'une marque, cela reste **armé** et le
  prochain caractère tapé porte cette couleur.
- Seul le nom de la couleur reste dans la valeur enregistrée — quelque chose comme
  `data-color="green"`. Aucun `style` en ligne ne sort. La valeur de couleur vient du jeton du
  cœur `--nabi-tc-*`, et la feuille est partagée avec celle du surlignage.
- À l'entrée (`claim`), elle ne regarde que les balises `<span>` portant un attribut
  `data-color`. Un `<span>` sans `data-color` du tout n'est pas revendiqué par cette wing, perd
  son enveloppe et retombe en texte brut, et **si l'attribut existe mais que sa valeur est hors
  liste, l'enveloppe est retirée de la même façon et seul le texte reste.**
- Une valeur hors liste dans une valeur enregistrée modifiée à la main est elle aussi retirée,
  enveloppe comprise, par `repair`.
- C'est une marque distincte du surlignage, donc les deux peuvent se poser sur le même texte à la
  fois — c'est pourquoi la feuille du surlignage n'écrit pas `color`.

| Nom de couleur | Valeur enregistrée |
|---|---|
| Vert | `green` |
| Corail | `coral` |
| Violet | `violet` |
| Ambre | `amber` |
| Bleu | `blue` |

Ces cinq couleurs sont exportées sous `TEXT_COLORS` — pas des valeurs de couleur mais un
**tableau de noms** (`readonly string[]`).

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
