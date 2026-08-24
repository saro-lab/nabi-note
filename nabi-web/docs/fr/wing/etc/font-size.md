---
title: Taille de texte
---

# Taille de texte

## Description

`fontSizeWing` (identifiant `fs`) est une wing de marque en ligne basée sur une valeur, qui ajuste la taille de police d'une portion de texte (`<span data-nabi-size="lg">`).

Elle prend en charge quatre paliers — `xs`, `sm`, `lg`, `xl` — et la taille par défaut n'est autre que l'absence de l'attribut, pas une cinquième valeur.

- Cliquer sur le bouton de la barre d'outils principale applique **`lg` (Grand)** par défaut.
- Quand le curseur se trouve à l'intérieur d'une marque de taille, la barre d'outils contextuelle dynamique affiche un curseur (`range`) permettant de choisir facilement entre Par défaut, Très petit, Petit, Grand et Très grand. Ramener le curseur sur Par défaut retire la marque.
- Choisir une taille avec seulement le curseur — sans texte sélectionné — applique la mise en forme à tout le paragraphe.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
