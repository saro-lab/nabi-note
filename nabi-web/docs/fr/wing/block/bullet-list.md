---
title: Liste à puces
---

# Liste à puces

## Description

`bulletListWing` (identifiant `ul`, raccourci `L`) gère les listes non ordonnées (`<ul>`). L'élément de liste (`<li>`) est intégré via l'attribut `parts`, il n'est donc pas nécessaire d'enregistrer `li` séparément.

```ts
parts: { li: { holds: 'blocks' } }
```

Cliquer sur le bouton de la barre d'outils transforme le bloc où se trouve le curseur (ou tous les blocs sélectionnés) en liste à puces ; cliquer à nouveau restaure des paragraphes normaux. Cliquer sur un autre bouton de liste (numérotée, liste de tâches, etc.) fait passer immédiatement à ce type de liste.

Taper `- ` (un tiret suivi d'une espace) au début d'un paragraphe le convertit également en liste automatiquement. Comme seul le motif de caractères juste avant le curseur est vérifié, taper l'espace après `- texte` déclenche quand même la conversion, et le texte déjà écrit reste comme contenu de l'élément de liste (cela ne fonctionne toutefois que sur la première ligne d'un paragraphe).

### Raccourcis et comportement d'édition

- <kbd>Tab</kbd> : indente l'élément actuel d'un niveau, l'imbriquant sous l'élément juste au-dessus. Sur le premier élément, il n'y a pas de parent sous lequel s'imbriquer, donc rien ne se passe — et à l'intérieur d'une liste, <kbd>Tab</kbd> n'insère jamais d'espace.
- <kbd>Shift</kbd>+<kbd>Tab</kbd> : désindente l'élément actuel d'un niveau. Désindenter un élément de premier niveau le fait sortir de la liste et le transforme en paragraphe normal. Si plusieurs éléments sont sélectionnés, toute la sélection se déplace ensemble.
- **<kbd>Entrée</kbd> sur un élément vide** : le désindente. S'il s'agissait d'un élément vide de premier niveau, la liste se termine là et un nouveau paragraphe apparaît en dessous.
- **<kbd>Retour arrière</kbd> tout au début d'un élément** : fusionne son contenu à la fin de l'élément précédent. S'il n'y a pas d'élément précédent avec lequel fusionner, l'élément est désindenté à la place. À l'inverse, <kbd>Suppr</kbd> tout à la fin d'un élément ramène l'élément suivant sur la ligne actuelle.
- Comme un élément (`li`) est un conteneur de blocs, il contient un paragraphe (`p`), et toute mise en forme en ligne — gras, italique, etc. — peut y être utilisée librement.
- Les attributs non standard de la balise sont supprimés lors de la normalisation, et tout ce qui n'est pas un `li` trouvé à l'intérieur d'une liste est automatiquement enveloppé dans un élément `li` pour corriger la structure.
- La liste de tâches partage la même balise `<ul>`, mais les deux wings se distinguent par la présence ou non de l'attribut `data-nabi-list="task"`.

## Balisage et structure d'imbrication

La structure imbriquée de l'arbre Nabi est reportée directement dans le HTML. Comme un élément de liste (`li`) contient des blocs plutôt que du texte, le texte à l'intérieur d'un élément est enveloppé dans un paragraphe `<p>`, et une sous-liste imbriquée est placée en sécurité à l'intérieur d'un paragraphe enveloppe (`<div data-nabi-p>`).

```html
<li><p>Élément parent</p><div data-nabi-p><ul><li><p>Élément enfant</p></li></ul></div></li>
```

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Construit le registry et l'instance nabi à partir de la liste des wings enregistrées.
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` est enregistré automatiquement via `parts`, il n'est donc jamais transmis directement dans le tableau.

## Démo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
