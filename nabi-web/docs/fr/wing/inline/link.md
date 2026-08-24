---
title: Lien
---

# Lien

## Description

`linkWing` (id `a`) est la wing de marque en ligne qui traite les hyperliens (`<a href>`).

Cliquez sur le bouton de la barre d'outils et une fenêtre pour saisir l'URL du lien apparaît. Seule une URL sûre commençant par `http:` ou `https:` peut être saisie — une URL de script malveillante comme `javascript:` est automatiquement filtrée par la politique de sécurité XSS.

La fenêtre du lien prend à la fois l'**URL du lien** et le **texte affiché**. Laissez le champ de texte vide et l'URL elle-même devient le texte affiché.

## Modifier un lien depuis la ligne contextuelle

Quand le caret se trouve déjà à l'intérieur d'un lien existant, la ligne contextuelle dynamique affiche des champs de texte en ligne pour le modifier immédiatement :

| Champ | Description |
|---|---|
| Adresse du lien (`href`) | Change uniquement l'URL cible du lien (le texte affiché est conservé) |
| Nom affiché | Change uniquement le texte affiché dans le corps (l'URL est conservée) |

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
