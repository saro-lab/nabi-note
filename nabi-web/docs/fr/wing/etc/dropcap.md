---
title: Lettrine
---

# Lettrine

## Description

`dropCapWing` est un wing d'attribut de paragraphe qui affiche la première lettre d'un
paragraphe comme une grande lettre décorative (`data-nabi-dropcap="1"`).

- Il fonctionne comme un simple interrupteur marche/arrêt.
- La taille de la première lettre est fixée par une règle `::first-letter` de la feuille de
  style du cœur (`font-size: 5.9em; line-height: .83`).
- Si vous scindez le paragraphe avec Entrée pendant la saisie, l'attribut de lettrine n'est pas
  dupliqué dans les deux moitiés — il reste attaché à la lettre d'origine.

Pour personnaliser la taille, redéfinissez la règle ci-dessous :

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
