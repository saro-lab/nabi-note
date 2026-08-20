---
title: Gras
---

# Gras

## Description

`boldWing` est propriétaire (par `claim`) de `<b>`. Sélectionnez du texte et appuyez sur le
**B** de la barre d'outils, ou passez par le mode indice (Shift deux fois puis `B`), et cette
portée devient grasse.

- À l'entrée, elle accepte à la fois `<b>` et `<strong>` ; à la sortie, c'est toujours un seul
  `<b>`. Aucun attribut ne survit — `class`, `style`, `data-*` tombent et seule la balise reste.
- Le raccourci en mode indice est `B`, l'accélérateur est `Ctrl`/`⌘`+`B` (`mod+b`).
- L'appuyer avec du texte sélectionné est un bascule (`toggleMark`) — si tout est déjà en gras,
  cela le retire, sinon cela l'applique. Cette wing ne pose aucune commande à elle — le bouton
  utilise `action: { kind: 'mark' }`, qui va directement au `toggleMark` du cœur.
- Laissez-la non enregistrée et `<b>` perd son enveloppe et retombe en texte brut (c'est ce qui
  arrive à toute balise non enregistrée — une règle valable pour tout nabi).

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
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
