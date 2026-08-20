---
title: Lettrine
---

# Lettrine

## Description

`dropCapWing` est un attribut de paragraphe à valeur unique qui pose `data-nabi-dropcap="1"` sur
un paragraphe. Elle ne crée aucun nouveau bloc ; elle ne fait que poser une marque sur un
paragraphe déjà existant.

- La valeur n'est qu'allumée/éteinte — appuyer de nouveau sur le bouton retire l'attribut.
- **Il n'existe aucune option ni aucune variable pour fixer combien de lignes elle englobe.** Une
  seule règle `::first-letter` de la feuille du cœur fixe la taille —
  `font-size: 5.9em; line-height: .83`. Le nombre de lignes que la lettre couvre réellement
  découle de l'interligne de ce paragraphe.
- Comme sa portée se limite à la seule première lettre, Entrée traite cet attribut comme une
  marque — fendre le paragraphe ne le duplique pas dans les deux moitiés, il suit cette lettre.

Pour changer la taille, redéfinissez cette règle.

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
