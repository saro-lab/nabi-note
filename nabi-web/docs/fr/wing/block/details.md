---
title: Bloc dépliant
---

# Bloc dépliant

## Description

`detailsWing` (nom `details`, raccourci `D`) est propriétaire de la boîte dépliante (`<details>` +
`<summary>`). La ligne de résumé vient avec elle via l'attribut `parts`, donc elle n'a pas besoin
d'être enregistrée à part.

```ts
parts: { summary: { holds: 'inline' } }
```

Appuyez sur le bouton et les blocs couverts par la sélection s'enveloppent dans une nouvelle boîte
dépliante, avec une ligne de résumé vide en tête. Appuyez sur Entrée dans la ligne de résumé et
vous descendez dans le contenu (un saut de ligne à l'intérieur de la ligne de résumé ne la fend jamais).

**L'écran dessine exactement ce qui est réellement enregistré.** Une boîte enregistrée fermée
(`open` non défini) se charge fermée dans l'éditeur aussi, et un clic sur l'icône flèche à gauche
l'ouvre ou la referme à tout moment (ce clic change immédiatement l'attribut `o` de l'arbre nabi).
Si le caret était à l'intérieur du contenu au moment de fermer le bloc, il se déplace en sécurité
hors du bloc.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
