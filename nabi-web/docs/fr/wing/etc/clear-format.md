---
title: Effacer la mise en forme
---

# Effacer la mise en forme

## Description

`clearFormatWing` est un wing outil (`place: 'tool'`) qui retire la mise en forme appliquée et remet le texte en texte brut.

- **Ce qu'il retire** : 11 marques en ligne (`b`, `i`, `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) et 3 attributs de paragraphe (`h` titre, `a` alignement, `dc` lettrine).
- **Avec une plage sélectionnée**, toutes les marques en ligne et tous les attributs de paragraphe de cette plage sont retirés en une fois.
- **Avec seulement un caret**, il pèle une couche à la fois, en commençant par la marque la plus intérieure au caret — une fois qu'il ne reste plus de marque, les attributs de paragraphe sont réinitialisés.
- **Les liens de pièce jointe (`data-nabi-file`) sont protégés** — contrairement à un lien web ordinaire, un lien de pièce jointe est exclu du nettoyage, donc l'information du fichier survit.
- **L'alignement du paragraphe enveloppe d'un objet bloc** (image, tableau, etc.) **est conservé.**

## Deux frappes sur <kbd>Échap</kbd>

En plus du bouton de la barre d'outils, **taper <kbd>Échap</kbd> deux fois en moins de 350ms** déclenche immédiatement la commande d'effacement de mise en forme.

- Qu'il y ait une sélection de texte ou seulement un caret, elle retire la mise en forme par étapes, exactement comme le ferait un appui sur le bouton de la barre d'outils.
- La priorité d'<kbd>Échap</kbd> est traitée comme la plus basse — même si la première frappe a armé une sortie de marque, la deuxième frappe déclenche quand même correctement l'effacement de mise en forme.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
