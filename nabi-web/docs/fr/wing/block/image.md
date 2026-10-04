---
title: Image
description: Insérez une URL d'image et ajustez la largeur et l'alignement.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Image

Insérez une URL d'image et ajustez sa largeur et son alignement. Par défaut, les adresses sont limitées à `http:`, `https:` ou aux chemins du même site, et une nouvelle image commence centrée à 60 % de la largeur.

La largeur n'est stockée que par étapes fixes, et l'alignement est stocké sur le paragraphe qui englobe l'image. Pour utiliser les aperçus `blob:` ou `data:image/...`, autorisez explicitement les URL locales à la fois dans la wing d'image et dans l'assemblage de l'éditeur. Les URL de données SVG ne sont pas autorisées.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Cette wing insère une adresse dans le document ; elle ne téléverse pas de fichiers. Pour envoyer des fichiers à un serveur, connectez la [wing de téléversement](/fr/wing/etc/upload).

## Connecter un sélecteur d’images

Utilisez `panels.img` avec `mountToolbar()` pour remplacer la saisie d’URL par défaut du bouton image par le sélecteur d’images de votre service. Les clés sont les noms des emplacements de la barre d’outils ; les outils omis conservent leur fenêtre de saisie par défaut.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: ({ root, signal, run }) =>
      mountMyImagePicker(root, {
        signal,
        onSelect: (url: string) => run('insertImage', { src: url }),
      }),
  },
})
```

`mountMyImagePicker` est une fonction à implémenter dans votre service. Elle crée votre interface de façon synchrone dans le `root` fourni et renvoie une fonction de nettoyage. Reliez `signal` aux tâches asynchrones telles que le chargement d’une liste d’images ou le téléversement, puis transmettez l’URL de l’image choisie à `onSelect`. Cette API ne transfère pas de fichiers ; les règles existantes sur les URL d’images restent applicables.

Fermer le panneau ou démonter la barre d’outils interrompt `signal` et appelle la fonction de nettoyage. `run()` ferme le panneau et applique une commande une seule fois à la sélection enregistrée à son ouverture. Si le panneau est déjà fermé ou si le contenu du document a changé depuis son ouverture, il renvoie `false` sans exécuter la commande.

## Styles CSS

Stylisez les images avec `.nabi-content img`. Conservez la largeur et l'alignement stockés intacts, et modifiez uniquement les détails visuels tels que les bordures ou les ombres.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Conservez les règles par défaut pour `max-inline-size`, `block-size`, la largeur et l'alignement. La taille de l'image est stockée dans le document, donc forcer une largeur CSS fixe peut entrer en conflit avec la largeur choisie par l'auteur.
