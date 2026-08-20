---
title: Italique
---

# Italique

## Description

`italicWing` est propriétaire (par `claim`) de `<i>`. À utiliser pour un mot étranger, une
citation, ou tout texte au ton différent.

- À l'entrée, elle accepte à la fois `<i>` et `<em>` ; à la sortie, elle les rassemble en un seul
  `<i>`. Aucun attribut ne survit.
- Le raccourci du mode indice (Shift deux fois) est `I` — capté par la touche physique
  (`KeyI`), donc il fonctionne aussi sur un clavier AZERTY. L'accélérateur est `Ctrl`/`⌘`+`I`
  (`mod+i`).
- L'appuyer avec du texte sélectionné est un bascule.
- Laissez-la non enregistrée et `<i>` perd son enveloppe et retombe en texte brut.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
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
