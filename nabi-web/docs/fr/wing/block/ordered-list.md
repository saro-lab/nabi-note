---
title: Liste numérotée
---

# Liste numérotée

## Description

`orderedListWing` (nom `ol`, raccourci `N`) est propriétaire de `<ol>`. L'élément vient avec elle
par `parts`, donc `oli` n'est jamais enregistré à part — et `parts` est une record, pas un tableau.

```ts
parts: { oli: { holds: 'blocks' } }
```

Appuyez sur le bouton et le bloc où se trouve le caret (ou tous les blocs couverts par la
sélection) s'enveloppe en liste numérotée ; appuyez de nouveau et l'enveloppe tombe. Appuyez sur un
autre bouton de liste et elle change de sorte.

Taper des chiffres et un point au début d'une ligne puis une espace (`1. `) donne le même
résultat. **N'importe quel nombre est accepté comme début, jusqu'à neuf chiffres**
(`1234567890. ` ne se déclenche pas), et tout ce qui suit le point après l'arrête — `1.2 ` n'est
pas une liste. La ligne n'a pas besoin d'être vide : tout ce qui est mesuré, c'est le préfixe de la
ligne devant le caret, et cela ne se déclenche que sur la première ligne d'un paragraphe.

- Indenter et désindenter avec `Tab` / `Shift+Tab`, terminer la liste par Entrée sur un élément
  vide, et Retour arrière au début d'un élément qui le fusionne avec celui du dessus fonctionnent
  exactement comme dans [Liste à puces](./bullet-list).
- Les numéros ne sont pas dans la valeur enregistrée — c'est `<ol>` qui les dessine, donc le
  navigateur les recompte tout seul quand vous insérez ou supprimez un élément.
- L'imbrication aussi est du vrai balisage et survit telle quelle dans la valeur enregistrée.
  Comme l'élément porte des blocs, le texte porte un paragraphe et une liste imbriquée se tient à
  l'intérieur d'un paragraphe enveloppe.
- Les attributs comme `start` et `type` ne survivent pas, donc une liste arrivée avec `start="5"`
  recompte à partir de 1.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
