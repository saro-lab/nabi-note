---
title: Police
---

# Police

## Description

`typefaceWing` (nom `tf`) est une **marque de valeur en ligne**. C'est une constante toute
faite — déposez-la dans le tableau et c'est terminé, sans aucune option à transmettre. À la
sortie, elle se dessine en `<span data-nabi-typeface="serif">`.

Les valeurs sont les quatre de `TYPEFACES` — `sans`, `serif`, `mono`, `cursive`.

- **Elle ne porte aucun nom de police.** Ce que vous choisissez est une **famille générique**, et
  quelle police apparaît réellement est décidé par les valeurs que l'hôte pose sur les quatre
  jetons `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono` et `--nabi-font-cursive`.
- **Une seule wing** porte les quatre valeurs. L'endroit où choisir est un `select` de quatre
  champs sur la ligne contextuelle, et un seul bouton de barre d'outils est le chemin d'entrée —
  l'appuyer applique `serif`.
- **Un texte sans rien d'appliqué porte `--nabi-typeface-base`.** Ce jeton est la police de fond
  de tout l'éditeur, et laissé tranquille il suit `--nabi-font`. Il n'y a pas de champ séparé
  pour « par défaut » — **choisir de nouveau la famille déjà active la retire**, ramenant à ce
  fond.
- **Les champs se dessinent dans le visage qu'ils nomment.** Le champ serif est écrit en serif,
  le champ à chasse fixe en chasse fixe, donc vous voyez ce que vous choisissez sans en connaître
  les noms.
- **Avec seulement un caret, elle s'applique à tout le paragraphe.** Dans un paragraphe sans
  aucun texte, elle est armée à la place, et le prochain caractère tapé sort dans ce visage.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Les polices que pose l'hôte tiennent en un seul endroit du CSS. Empilez plusieurs polices sur une
même famille et le navigateur parcourt la liste caractère par caractère, dessinant chacun avec la
première police qui le possède — donc quelle que soit la langue tapée, la famille garde son
allure.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## Démo

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
