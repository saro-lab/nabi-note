---
title: Souligné
---

# Souligné

## Description

`underlineWing` est propriétaire (par `claim`) de `<u>`.

- Reconnaît `<u>` en entrée, et ressort toujours en `<u>` standard.
- Prend en charge le mode indice (appuyer deux fois sur Shift, puis `U`) et l'accélérateur
  (`Ctrl`/`⌘`+`U`).
- L'exécuter avec du texte sélectionné agit comme un bascule.
- Le souligné et le lien (`<a>`) peuvent se ressembler à l'écran, mais ce sont des wings
  indépendants — le même texte peut porter à la fois un soulignement et un lien.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
