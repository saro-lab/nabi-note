---
title: Taille de texte
---

# Taille de texte

## Description

`fontSizeWing` (nom `fs`) est une **marque de valeur en ligne**. C'est une mise en forme posée sur
le texte, pas un attribut de paragraphe. À la sortie, elle se dessine en
`<span data-nabi-size="lg">`.

Il y a quatre valeurs — `xs`, `sm`, `lg`, `xl` — et la taille par défaut n'est pas une cinquième
valeur mais **l'absence de l'attribut**.

- Elle fait la paire avec la police (`tf`) — une seule wing porte toutes les valeurs, et
  l'endroit où choisir est la ligne contextuelle. La police, elle, dispose quatre champs, tandis
  que la taille utilise une seule échelle.
- **Le contrôle contextuel est une échelle (`range`).** La taille est une valeur ordonnée (petit
  → grand), donc au lieu de disposer des champs, elle donne une seule poignée à faire glisser. La
  valeur en vigueur se voit à la position de la poignée, et son nom voyage à côté sur
  l'étiquette.
- **Le premier emplacement de l'échelle est « Par défaut »** — le premier plutôt que le milieu,
  parce que la liste va du petit au grand, et la place avant elle est celle où « rien
  d'appliqué » appartient. Déplacer la poignée là n'écrit pas une valeur `base` ; cela **retire la
  marque**.
- **Les étiquettes des champs suivent la locale** — « Par défaut · Très petit · Petit · Grand ·
  Très grand » en français.
- Appuyer sur le bouton de la barre d'outils donne **`lg` (Grand)**. L'échelle va du petit au
  grand, donc la laisser telle quelle appliquerait le premier emplacement, `xs` — et personne
  n'appuie sur un bouton de taille en voulant rendre le texte plus petit.
- **Avec seulement un caret, elle s'applique à tout le paragraphe.** Il est rare de vouloir
  redimensionner un seul mot, donc sans plage sélectionnée, elle vise le paragraphe (le
  surlignage et la couleur du texte, à l'inverse, visent la portion de marque où l'on se tient).
- Appuyée dans un paragraphe sans aucun texte, elle est **armée** — le prochain caractère tapé
  sort à cette taille.
- Appliquer la même valeur de nouveau la retire.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>