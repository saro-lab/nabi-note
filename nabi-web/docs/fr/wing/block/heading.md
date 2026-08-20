---
title: Titre
---

# Titre

## Description

Une seule `headingWing` (id `h`) porte les six niveaux. Un titre n'est pas un nœud à part mais
**un attribut du paragraphe** — la valeur enregistrée est `{"w":"p","a":{"h":2}}`, et elle
devient `<h2>` à la sortie.

Comme c'est le paragraphe lui-même qui devient le titre, les autres attributs de paragraphe comme
l'alignement ou la lettrine s'appliquent en même temps (`<h2 data-nabi-align="c">`).

## Un seul bouton dans la barre d'outils, le niveau dans la ligne contextuelle

**Il n'y a qu'un seul bouton dans la barre d'outils, `H`.** L'appuyer dans un paragraphe donne un
titre de niveau 1 ; le caret dans un titre, les champs `Titre` et `H1`–`H6` apparaissent sur la
ligne contextuelle — le niveau en cours se voit sur le champ enfoncé, et appuyer sur un autre
champ vous déplace à ce niveau. Appuyer sur `Titre` vous ramène à un paragraphe.

Tapez autant de `#` que le niveau (`##` pour le niveau 2) sur une ligne vide, puis une espace, et
cela devient automatiquement un titre de ce niveau — le `#` et l'espace tapés sont retirés.

## Exemple d'utilisation

Le sélecteur de niveau est dessiné par `mountContextToolbar`.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

On peut aussi l'appliquer directement par une commande.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // vers un titre de niveau 2
nabi.applyCommand('setHeading', { value: 2 })  // le même niveau de nouveau — retour au paragraphe
```

Appliquée sur une sélection de plusieurs paragraphes, elle s'applique à **tous les paragraphes**
que touche la sélection. Les blocs qui prennent la place d'un paragraphe, comme un tableau ou une
liste, sont ignorés — un titre est un attribut d'un paragraphe de texte.

## Démo

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
