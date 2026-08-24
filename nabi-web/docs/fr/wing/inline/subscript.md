---
title: Indice
---

# Indice

## Description

`subscriptWing` est une wing de marque en ligne qui gère la mise en forme en indice
(`<sub>`). Utile pour les formules chimiques, les numéros de note, etc.

- Reconnaît la balise `<sub>` à l'entrée, et la restitue telle quelle à la sortie.
- Se trouve dans le groupe `script` de la barre d'outils, juste à côté de l'exposant.
- Avec du texte sélectionné, appuyer sur le bouton fait basculer la marque.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
