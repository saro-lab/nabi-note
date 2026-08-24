---
title: Séparateur
---

# Séparateur

## Description

`dividerWing` (nom `hr`) gère le séparateur horizontal (`<hr>`). C'est un objet **`place: 'void'`**,
sans place pour du texte à l'intérieur ; appuyez sur Retour arrière ou Suppr juste avant ou juste
après le séparateur et tout le bloc disparaît d'un coup.

Cliquez sur le bouton et le séparateur s'insère **enveloppé dans son propre paragraphe wrapper
(`<div data-nabi-p>`)**. Le caret se retrouve juste après le séparateur.

L'endroit où il est inséré dépend de l'état du paragraphe où se trouve le caret :

| Position du caret | Comportement d'insertion |
|---|---|
| Paragraphe avec du texte | Le nouveau séparateur s'insère **après** ce paragraphe |
| Paragraphe vide | Ce paragraphe vide est **remplacé par le séparateur** (évite une ligne vide inutile) |

Quand un paragraphe vide est remplacé, son alignement de texte est conservé.

Tapez trois tirets ou plus sur une ligne vide puis appuyez sur Entrée (`---` + Entrée) : la
conversion en séparateur se fait automatiquement.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
