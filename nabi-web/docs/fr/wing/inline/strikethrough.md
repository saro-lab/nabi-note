---
title: Barré
---

# Barré

## Description

`strikeWing` est propriétaire (par `claim`) de `<s>`. Utilisez-la pour une valeur qui a été
barrée mais qu'il vaut la peine de laisser en place.

- À l'entrée, elle accepte les trois `<s>`, `<strike>` et `<del>` ; à la sortie, c'est toujours
  `<s>`. Aucun attribut ne survit — pas même l'horodatage de `<del datetime="…">`.
- Le raccourci en mode indice est `S`. **Il n'y a pas d'accélérateur** — contrairement au gras, à
  l'italique et au souligné du même groupe `emphasis`, aucune combinaison `Ctrl`/`⌘` ne lui est
  liée.
- L'appuyer avec du texte sélectionné est un bascule.
- Laissez la wing non enregistrée et `<s>` perd son enveloppe et retombe en texte brut.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>