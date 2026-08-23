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

## <kbd>Échap</kbd> deux fois

En plus du bouton de barre d'outils il y a **une seule route par le clavier** — taper
<kbd>Échap</kbd> deux fois d'affilée. Ni une indication d'une seule lettre ni un accélérateur
`⌘` ne pouvait tenir ce geste, si bien qu'il est allé à la déclaration de double-tap
(`doubleKeys`).

- **Il fait exactement ce que fait appuyer sur le bouton.** Avec une plage sélectionnée, cette
  étendue ; **avec seulement un caret**, une couche à cette place — la commande sait déjà ce qu'il
  faut retirer, si bien que le côté touche ne se branche pas sur l'état du caret.
- **Il se déclenche au deuxième tap, exactement.** Quatre taps sont toujours un seul déclenchement,
  et si plus de 350ms s'écoulent entre deux taps le compte recommence. Les répétitions depuis tenir
  la touche enfoncée (`repeat`) et les taps pendant la composition IME ne sont pas comptés.
- **Sa priorité est la plus basse.** Elle prend son tour seulement une fois tous les autres travaux
  qu'<kbd>Échap</kbd> avait (défaire un armement, s'échapper d'une marque) passés — appuyez sur
  <kbd>Échap</kbd> au milieu d'un surlignage et le premier tap arme la sortie de marque, et le
  deuxième porte toujours jusqu'à effacer la mise en forme.
- **Il y a seulement cinq endroits où il ne marche pas** — une plate-forme ouverte, une surimpression,
  le plein écran, les badges d'indication, et un verrouillage d'envoi.
- Le bouton le dit dans son étiquette — **« Effacer la mise en forme (Échap Échap) »**, le même
  motif que les badges Maj.

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
