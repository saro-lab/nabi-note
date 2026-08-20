---
title: Liste à puces
---

# Liste à puces

## Description

`bulletListWing` (nom `ul`, raccourci `L`) est propriétaire de `<ul>`. L'élément vient avec elle
par `parts`, donc `li` n'est jamais enregistré à part — et `parts` est une record, pas un tableau.

```ts
parts: { li: { holds: 'blocks' } }
```

Appuyez sur le bouton et le bloc où se trouve le caret (ou tous les blocs couverts par la
sélection) s'enveloppe en liste ; appuyez de nouveau et l'enveloppe tombe, le tout revenant au
paragraphe. Appuyez sur un autre bouton de liste et elle change de sorte.

Taper un tiret au début d'une ligne puis une espace (`- `) donne le même résultat. **La ligne n'a
pas besoin d'être vide** — tout ce qui est mesuré, c'est le préfixe de la ligne devant le caret,
donc `- du texte` se déclenche à l'espace et le texte reste à l'intérieur du nouvel élément. Cela
ne se déclenche que sur la **première ligne** d'un paragraphe.

- `Tab` indente d'un cran, en sous-élément du frère juste au-dessus. Le premier élément n'a rien
  sous quoi aller, donc rien ne se passe — à l'intérieur d'une liste, `Tab` n'insère jamais
  d'espaces.
- `Shift+Tab` désindente vers le frère suivant du parent — désindenter au niveau le plus haut fait
  sortir de la liste et donne un paragraphe. Si la sélection couvre plusieurs éléments, tous ceux
  qu'elle couvre bougent ensemble.
- **Entrée sur un élément vide désindente.** Au niveau le plus haut, la liste se termine là et le
  caret se pose dans un nouveau paragraphe en dessous. C'est ainsi qu'on termine une liste.
- **Retour arrière tout au début d'un élément le fusionne avec l'élément du dessus.** S'il n'y a
  pas d'élément au-dessus à fusionner, cela retombe sur la désindentation. Suppr tout à la fin fait
  l'inverse, en tirant l'élément suivant vers le haut.
- L'intérieur d'un élément est un bloc, donc il porte un paragraphe. Les marques (le gras, par
  exemple) et les autres wings en ligne s'emploient tels quels à l'intérieur de ce paragraphe.
- Les attributs que portait la balise, comme `type`, ne survivent pas. Ce qui entre dans la liste
  sans être un élément n'est pas jeté — cela s'enveloppe dans un élément.
- La Liste de tâches partage sa balise (`<ul>`) mais c'est une wing différente — elles se
  distinguent par un attribut de marque (`data-nabi-list="task"` signifie Liste de tâches).

## L'imbrication est du vrai balisage

La structure survit telle quelle dans la valeur enregistrée. Mais **comme un élément porte des
blocs et non du texte**, le texte porte un paragraphe et une liste imbriquée se tient à
l'intérieur d'un paragraphe enveloppe.

```html
<li><p>un</p><div data-nabi-p><ul><li><p>deux</p></li></ul></div></li>
```

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` suit automatiquement par `parts` : ne le mettez pas vous-même dans le tableau.

## Démo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
