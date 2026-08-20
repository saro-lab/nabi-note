---
title: Alignement
---

# Alignement

## Description

**Une seule** `alignWing` (id `align`) porte les trois valeurs gauche, centre et droite. C'est
une constante côté barre d'outils — pas une fabrique `align()` qui les rassemble, il y a un
bouton séparé par valeur. Elle pose l'attribut `data-nabi-align` sur le bloc.

- C'est un **attribut de bloc** : la balise reste intacte et seul l'attribut s'ajoute, comme dans
  `<p data-nabi-align="center">` — le paragraphe lui-même ne change pas.
- **Elle s'applique aux paragraphes et aux titres.** `<h2 data-nabi-align="c">` fonctionne aussi
  — un titre est aussi une ligne de texte ordinaire. Parmi les quatre attributs de paragraphe,
  seul l'alignement fait cela ; la taille de texte, la police et la lettrine restent réservées au
  paragraphe.
- Une seule valeur se tient à la fois — appuyez sur centre alors que gauche est actif et la
  valeur gauche tombe tandis que centre se pose. Appuyez de nouveau sur la valeur déjà active et
  l'attribut se retire entièrement (retour à l'alignement par défaut).
- **Entrée transmet l'alignement aux deux moitiés telles quelles.** Fendez un paragraphe et les
  deux ressortent portant le même alignement — contrairement au titre (`h`), qui tombe du côté
  qui se retrouve vide, et à la lettrine (`dc`), qui ne suit qu'un seul côté, l'alignement n'a
  aucune exception de ce genre.
- Les trois sont **trois boutons d'une seule wing** (`buttons`) — on ne peut pas les activer et
  désactiver séparément, on ne met que la seule `alignWing` dans le tableau des wings.
- **Cette wing porte aussi la place des tableaux, images et vidéos YouTube.** Un bloc vit dans
  son propre paragraphe enveloppe, et c'est ce paragraphe qui porte l'alignement, donc « une
  image centrée » est précisément « une image à l'intérieur d'un paragraphe centré ». C'est
  pourquoi la ligne contextuelle d'une image ou d'un tableau n'a jamais de champ d'alignement, et
  pourquoi seul l'alignement ne se cache jamais dans la barre d'outils même quand le caret est
  sur un bloc.

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
