---
title: Gras
---

# Gras

## Description

`boldWing` est la wing inline qui gère la mise en gras (`<b>`). Sélectionnez du
texte et appuyez sur **B** dans la barre d'outils, passez par le mode indice
(Shift deux fois, puis `B`), ou utilisez le raccourci (`Ctrl`/`⌘`+`B`).

- À l'entrée, `<b>` et `<strong>` sont tous deux reconnus ; à la sortie, c'est
  toujours la balise standard `<b>`.
- Avec du texte sélectionné, c'est un bascule — si la sélection est déjà en gras,
  elle est retirée, sinon elle est appliquée.
- Sans sélection, avec seulement le curseur, le raccourci réserve la mise en gras
  pour le prochain texte saisi.
- Si la wing n'est pas enregistrée, la balise `<b>` est automatiquement retirée
  et seul le texte brut est conservé.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
