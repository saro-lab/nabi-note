---
title: Bloc dépliant
---

# Bloc dépliant

## Description

`detailsWing` (nom `details`, raccourci `D`) est propriétaire de la boîte dépliante (`<details>` +
`<summary>`). La ligne de résumé vient avec elle par `parts`, donc elle n'est jamais enregistrée à
part — et `parts` est une record, pas un tableau.

```ts
parts: { summary: { holds: 'inline' } }
```

Appuyez sur le bouton et les blocs couverts par la sélection s'enveloppent dans une nouvelle boîte
dépliante, avec une ligne de résumé vide en tête. Appuyez sur Entrée dans la ligne de résumé et
vous descendez dans le contenu (le résumé lui-même ne se fend jamais).

**L'éditeur la dessine exactement comme elle sera enregistrée.** Une boîte enregistrée fermée est
fermée dans l'éditeur aussi, et le triangle la déplie et la replie sur place — cet appui est ce qui
change la valeur enregistrée (`o`). Si vous la repliez pendant que le caret est à l'intérieur, le
caret est déplacé hors de la boîte.

::: tip Il n'y a pas de ligne contextuelle
Il y avait autrefois deux boutons, **enregistrer ouvert** et **enregistrer fermé**. À l'époque où
l'écran d'édition dessinait toujours la boîte ouverte, c'était le seul moyen de dire dans quel état
elle serait enregistrée. Maintenant l'écran dessine la valeur enregistrée et le triangle la change,
donc ces boutons répétaient la même chose deux fois, et ont été retirés.
:::

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
