---
title: Citation
---

# Citation

## Description

`quoteWing` (nom `quote`) est propriétaire de la boîte de citation (`<blockquote>`). Elle est
`place: 'container'` avec `holds: 'blocks'` — des blocs vivent à l'intérieur. Comme tout autre
bloc, la citation elle-même se tient au niveau supérieur en portant un paragraphe enveloppe.

**Elle ne fixe aucun `allows`.** L'intérieur d'une citation suit les mêmes règles que le niveau
supérieur, donc un tableau ou une image peuvent eux aussi s'y tenir, portant leur propre
paragraphe enveloppe — collez ou chargez un HTML de cette forme et il survit tel quel.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["texte"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Ce qui *n'entre pas* à l'intérieur, ce sont **les boutons d'insertion.** Tout ce qui se pose par
`insertLump` — images, tableaux, séparateurs — prend toujours sa place au **niveau supérieur**,
donc avec le caret à l'intérieur d'une citation, le nouveau bloc atterrit *après* la citation, pas
dedans. Pour en mettre un dedans, collez-le.

Appuyez sur le bouton et tous les blocs de niveau supérieur couverts par la sélection s'enveloppent
en citation. Elle ne se déballe que quand **tous** les blocs couverts sont déjà des citations — une
portion mêlée est enveloppée une fois de plus, en bloc.

Tapez `>` au début d'une ligne puis une espace et cette ligne devient une citation — cette
transformation automatique **se déclenche à l'espace** (pas à Entrée), puisqu'on continue
d'écrire sur la même ligne.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
