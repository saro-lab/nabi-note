---
title: Effacer la mise en forme
---

# Effacer la mise en forme

## Description

`clearFormatWing` est une **constante toute faite**. Déposez-la dans le tableau et c'est
terminé — il n'y a aucune option à transmettre.

Étant `place: 'tool'`, elle ne dresse aucun nœud à elle dans le document. Une seule commande
(`clearFormat`) et un seul bouton de barre d'outils, c'est tout.

- **La liste qu'elle retire est fixée dans le cœur.** Onze marques en ligne (`b`, `i`, `u`, `s`,
  `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) et trois attributs de paragraphe (`h` titre, `a`
  alignement, `dc` lettrine). L'hôte n'a aucune liste à tenir, et les marques des wings que vous
  avez écrites vous-même **ne sont pas retirées ici**.
- **Sélectionnez une plage et appuyez** et les marques de cette étendue, ainsi que les attributs
  de tous les paragraphes qu'elle touche, s'enlèvent d'un coup.
- **Avec seulement un caret, elle pèle une couche à la fois** — en commençant par la **marque la
  plus intérieure** au caret, sur toute l'étendue que couvre cette marque. Quand il ne reste plus
  de marque à retirer, c'est alors que les attributs de paragraphe partent.
- **Les liens de pièce jointe ne sont jamais retirés** — un lien (`a`) portant un attribut `file`
  est intouchable partout, parce que retirer son enveloppe laisserait la pièce jointe en une
  ligne morte de texte brut.
- **L'alignement survit sur un paragraphe qui porte un bloc.** Sur un paragraphe enveloppe autour
  d'une image ou d'un tableau, l'alignement (`a`) seul n'est pas retiré — effacer la mise en forme
  ne doit pas renvoyer l'image voler vers la gauche.
- Quand il n'y a rien à retirer, la commande répond `null`, donc aucun point d'annulation ne
  s'empile.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
