---
title: Italique
---

# Italique

## Description

`italicWing` est le wing de marque en ligne qui gère la mise en italique (`<i>`). Il sert à distinguer le ton d'un texte — emphase, mot étranger, etc.

- À l'entrée, il reconnaît aussi bien `<i>` que `<em>` ; à la sortie, il produit toujours la balise standard `<i>`.
- Prend en charge le mode indice (Shift deux fois, puis `I`) et le raccourci `Ctrl`/`⌘`+`I`.
- Appliqué avec du texte sélectionné, il fonctionne comme un bascule.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
