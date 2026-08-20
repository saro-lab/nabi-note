---
title: Séparateur
---

# Séparateur

## Description

`dividerWing` (nom `hr`) est propriétaire d'un unique `<hr>`. C'est **`place: 'void'`** — un bloc
sans intérieur, donc il n'y a nulle part où le caret puisse entrer. Appuyez sur Retour arrière ou
Suppr juste avant ou juste après un séparateur et ce bloc disparaît d'un bloc ; le sélectionner
par une plage donne le même résultat.

Appuyez sur le bouton et le séparateur se dresse **en portant son propre paragraphe enveloppe.**
Aucun paragraphe vide supplémentaire ne l'accompagne — le caret se pose sur ce paragraphe
enveloppe, juste après le séparateur.

L'endroit où il atterrit dépend de si le paragraphe où était le caret contenait du texte.

| Où était le caret | Résultat |
|---|---|
| un paragraphe avec du texte | il se tient **après** ce paragraphe |
| un paragraphe vide | il **prend la place de ce paragraphe** — aucune ligne vide ne reste derrière |

Quand il prend la place d'un paragraphe vide, l'alignement que portait ce paragraphe survit.

Écrire trois tirets ou plus (`---`) au début d'une ligne et appuyer sur Entrée donne le même
résultat — cette transformation automatique **se déclenche à Entrée**.

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
