---
title: Indice
---

# Indice

## Description

`subscriptWing` est propriétaire (par `claim`) de `<sub>`. À utiliser pour une formule chimique
ou un numéro écrit en indice.

- La seule balise acceptée est `<sub>`. Aucun attribut ne survit.
- Il n'y a ni raccourci en mode indice ni accélérateur. Le groupe de la barre d'outils est
  `script`, où elle se tient à côté de l'exposant (dans l'ordre d'enregistrement, l'exposant
  vient en premier).
- L'appuyer avec du texte sélectionné est un bascule.
- L'allure vient de la feuille que cette wing porte via `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**Cette feuille est partagée avec l'exposant.** Les deux wings portent le même texte, donc même
enregistrées toutes les deux, il n'atterrit dans le document **qu'une seule fois**
(`collectSheets` retire les feuilles au même texte). Dans la valeur enregistrée (HTML), seule la
balise `<sub>` reste — le style lui-même n'est pas embarqué.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
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
