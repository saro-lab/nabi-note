---
title: Souligné
---

# Souligné

## Description

`underlineWing` est propriétaire (par `claim`) de `<u>`.

- La seule balise acceptée est `<u>`. À la sortie aussi, c'est toujours `<u>`, et aucun attribut
  ne survit. **`<ins>` n'est pas accepté** — son enveloppe est retirée et seul le texte reste. Ce
  n'est pas une marque qui accepte un partenaire, contrairement au gras (`<b>`/`<strong>`) ou au
  barré (`<s>`/`<strike>`/`<del>`).
- Le raccourci en mode indice est `U`, l'accélérateur est `Ctrl`/`⌘`+`U` (`mod+u`).
- L'appuyer avec du texte sélectionné est un bascule.
- Laissez-la non enregistrée et `<u>` perd son enveloppe et retombe en texte brut.
- Le souligné et le lien peuvent se ressembler à l'écran, mais ce sont des marques distinctes
  possédées par des wings différentes (`a`) — les deux peuvent se poser sur le même texte à la
  fois.

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
