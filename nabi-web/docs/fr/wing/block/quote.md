---
title: Citation
---

# Citation

## Description

`quoteWing` (id `quote`) gère le bloc de citation (`<blockquote>`). Il a `place: 'container'` et
`holds: 'blocks'`, donc en plus de simples paragraphes, il peut aussi contenir d'autres éléments
de bloc, comme un tableau ou une image.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["texte cité"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Cliquez sur le bouton de la barre d'outils et les blocs de la sélection s'enveloppent en citation.
Si la sélection est déjà une citation, le même bouton la déballe.

Tapez `>` suivi d'une espace au début d'un paragraphe, et il se transforme automatiquement en
citation.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
