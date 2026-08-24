---
title: Téléversement de fichiers
---

# Téléversement de fichiers

## Description

Le téléversement de fichiers repose sur l'intégration de trois modules :

1. **`uploadWing`** : ajoute à la barre d'outils un bouton pour joindre un fichier. Le résultat téléversé est inséré dans le document comme un nœud image ou lien de fichier, donc **`imageWing` ou `linkWing` doit être enregistré à ses côtés**. Si aucun des deux n'est présent, une exception est levée à l'initialisation.
2. **`mountUpload({ … })`** : reçoit les fichiers arrivant par glisser-déposer, collage depuis le presse-papiers ou sélection dans la barre d'outils, et les transmet à la fonction `uploader` de l'hôte.
3. **`mountUploadView({ … })`** : affiche à l'écran l'interface de substitut pour la progression du téléversement.

::: warning Règle de traitement d'un collage vers le téléversement de fichier
Si les données du presse-papiers **contiennent du texte ou du HTML** (`text/html` ou `text/plain`), le collage suit le pipeline normal de texte/Markdown au lieu du téléversement. Le pipeline de téléversement n'est appelé que lorsque le collage du presse-papiers ne contient que des données de fichier. (Un fichier déposé par glisser-déposer passe toujours par le pipeline de téléversement.)
:::

La fonction `uploader` a la signature `(task) => Promise<{ uri: string } | null>`. Elle renvoie un objet `{ uri }` en cas de réussite du téléversement vers le serveur, et `null` en cas d'échec. Le callback `task.onProgress(0–100)` permet de signaler la progression, et `task.signal` permet de gérer l'annulation.

Options de limite d'extension et de taille de fichier : `extensions`, `maxFileSize`, `maxTotalSize` (aucune limite si omises). Les fichiers invalides sont transmis au callback `onReject`.

## Ce que le document affiche après le téléversement

- **Les fichiers image** sont insérés comme un objet bloc `<img>` de `imageWing`.
- **Les autres pièces jointes** sont insérées comme un lien de téléchargement de `linkWing` (`<a data-nabi-file="pdf" href="...">`). Le texte affiché de la pièce jointe est généré selon la locale comme « Pièce jointe », et peut être librement modifié en plaçant le curseur dans le lien et en utilisant la barre contextuelle.

## Exemple d'utilisation

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La wing de téléversement a besoin de la wing image ou lien enregistrée à ses côtés
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// Monter la vue d'interface de progression du téléversement
const view = mountUploadView({ nabi, surface, locale: 'fr' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'fr',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  maxFileSize: 10 * 1024 * 1024,   // 10 Mo
  uploader: async (task) => {
    // Implémentez ici la logique réelle de téléversement vers votre serveur backend
    // const uri = await myUploadApi(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi,
  registry,
  surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  onFiles: (files) => upload.take(files),
})
```

## Démo

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
