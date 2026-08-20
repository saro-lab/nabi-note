---
title: Exposant
---

# Exposant

## Description

`superscriptWing` est propriétaire (par `claim`) de `<sup>`. À utiliser pour une puissance
d'unité ou un numéro de note de bas de page.

- La seule balise acceptée est `<sup>`. Aucun attribut ne survit.
- Il n'y a ni raccourci en mode indice ni accélérateur (l'une des wings, comme upload, qui n'a
  pas de badge). Le groupe de la barre d'outils est `script`, où elle se tient à côté de l'indice,
  mais dans l'ordre d'enregistrement, celle-ci vient en premier.
- L'appuyer avec du texte sélectionné est un bascule.
- L'allure vient de la feuille que cette wing porte via `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**Cette feuille est partagée avec l'indice.** Les deux wings portent le même texte, donc même
enregistrées toutes les deux, il n'atterrit dans le document **qu'une seule fois**
(`collectSheets` retire les feuilles au même texte). Dans la valeur enregistrée (HTML), seule la
balise `<sup>` reste — le style lui-même n'est pas embarqué.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
