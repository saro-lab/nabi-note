---
title: Alignement
---

# Alignement

## Description

La `alignWing` (id `align`) est une wing d'attribut de paragraphe qui gère l'alignement du texte — gauche, centre, droite — pour les paragraphes et les blocs.

- Elle pose l'attribut `data-nabi-align` sur le bloc (`<p data-nabi-align="center">`).
- **Elle s'applique non seulement aux paragraphes mais aussi aux titres (`h1`–`h6`)** (`<h2 data-nabi-align="c">`).
- Une seule valeur d'alignement tient à la fois. Cliquez de nouveau sur un bouton déjà actif et l'attribut se retire, l'alignement par défaut revient.
- Coupez un paragraphe en deux avec Entrée et les deux moitiés gardent le même alignement.
- **Cette wing gère aussi l'alignement des objets-blocs** comme les images, tableaux et vidéos YouTube. Un objet-bloc vit dans le paragraphe enveloppe (`<div data-nabi-p>`) qui le contient, donc les boutons d'alignement de la barre d'outils contrôlent, via cette enveloppe, si l'objet est à gauche, à droite ou au centre.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
