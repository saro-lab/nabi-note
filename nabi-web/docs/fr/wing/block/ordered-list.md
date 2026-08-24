---
title: Liste numérotée
---

# Liste numérotée

## Description

`orderedListWing` (nom `ol`, raccourci `N`) gère la liste numérotée (`<ol>`). L'élément de liste (`<li>`) est intégré via l'attribut `parts` et n'a pas besoin d'être enregistré séparément.

```ts
parts: { oli: { holds: 'blocks' } }
```

Un clic sur le bouton transforme en liste numérotée le bloc où se trouve le caret (ou tous les blocs couverts par la sélection) ; un nouveau clic restaure le paragraphe ordinaire. Cliquer sur un autre bouton de liste change immédiatement de type de liste.

Taper `1. ` (un chiffre, un point, une espace) au début d'un paragraphe convertit également celui-ci automatiquement en liste numérotée. Le nombre de départ est libre et reconnu jusqu'à neuf chiffres.

### Raccourcis et comportement d'édition

- Indenter/désindenter avec `Tab`/`Shift+Tab`, terminer la liste avec `Entrée` sur un élément vide, et fusionner avec l'élément précédent via `Retour arrière` au début d'un élément fonctionnent exactement comme pour la [liste à puces](./bullet-list).
- Le numéro de chaque élément est rendu dynamiquement par le navigateur via la balise HTML `<ol>` — insérer ou supprimer un élément au milieu recalcule donc automatiquement la numérotation.
- Les structures de listes imbriquées sont rendues de façon sûre grâce à un paragraphe enveloppe (`<div data-nabi-p>`).

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
