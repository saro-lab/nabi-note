---
title: Téléversement de fichiers
---

# Téléversement de fichiers

## Description

Le téléversement se répartit en trois morceaux — enregistrer seulement la wing ne fait rien.

1. **`uploadWing`** — pose le bouton de sélection de fichier sur la barre d'outils. La wing
   elle-même ne crée ni `img` ni `a` : un fichier téléversé est commis comme ce que dessine la
   wing image ou la wing lien, donc **vous devez enregistrer `imageWing` ou `linkWing` à ses
   côtés** pour que le résultat atterrisse dans le document. Sans l'une ou l'autre, **cela lève
   une exception exactement là où vous l'enregistrez** (jamais plus tard).
2. **`mountUpload({ … })`** — le côté qui reçoit réellement les fichiers et exécute `uploader`.
   Les dépôts, les collages et le bouton de sélection affluent tous ici. **Omettez ce mount et le
   bouton est là, mais rien ne se passe.**
3. **`mountUploadView({ … })`** — le côté qui dresse les substituts de progression à l'écran. Le
   téléversement fonctionne quand même sans lui, mais l'écran ne dit rien pendant qu'il tourne.

`uploader` a la forme `(task) => Promise<{ uri } | null>` — **une URI signifie le succès, `null`
signifie l'échec** et le substitut est retiré. Signalez la progression avec
`task.onProgress(0–100)`, et arrêtez-vous quand `task.signal` s'interrompt.

Les limites sont `extensions`, `maxFileSize` et `maxTotalSize`, toutes optionnelles (0 ou omis
signifie aucune limite). Les fichiers filtrés arrivent à `onReject`.

## Ce qui reste après le téléversement

Les images sont commises comme des blocs `imageWing`, tout le reste comme des liens de pièce
jointe `linkWing`.

- **Une pièce jointe est nommée par une étiquette localisée, pas par le nom du fichier** — «
  Pièce jointe » en français. Les noms de fichier sont généralement trop longs pour rester dans
  un document, et surtout le nom doit pouvoir être modifié. Posez le caret dans le lien et
  changez-le dans [le champ de nom de la ligne contextuelle](../inline/link).
- **L'extension reste comme une marque** — `data-nabi-file="pdf"`. Cette valeur est tirée du vrai
  nom du fichier et la feuille la dessine comme un badge, donc renommer le lien ne la perd pas.
- Une URI que la wing lien refuserait (une adresse `blob:` arrivant sans `allowLocalUrls` activé,
  par exemple) est rétrogradée au simple nom de fichier — la liste blanche n'est jamais
  contournée.

## Ce que vous voyez pendant le téléversement

Une boîte provisoire se tient à la place pendant qu'un fichier se téléverse. Elle ne vit que dans
le DOM de l'éditeur, jamais dans l'arbre nabi, donc pas un seul caractère n'en atteint la valeur
enregistrée.

- **Les images** montrent un aperçu bâti à partir du fichier choisi, avec une grille posée
  dessus. Les cases se dégagent une par une à mesure que la progression grimpe, jusqu'à ce que
  l'image soit nette. L'ordre dans lequel les cases se dégagent est mélangé par fichier, donc
  téléverser plusieurs images à la fois ne répète jamais le même motif.
- **Les fichiers qui ne sont pas des images** reçoivent une boîte sans grille — un trombone 📎 et
  une étiquette « Pièce jointe » — avec l'extension à côté comme un badge en majuscules (`PDF`,
  etc.). Une image dont l'aperçu ne peut pas être dessiné tombe ici aussi.
- La progression voyage sur la boîte via `data-nabi-per` et la feuille la dessine. Chaque boîte
  porte un bouton d'annulation (×) pendant le téléversement, et l'édition est verrouillée tant
  que le lot tourne.

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

// Le téléversement a besoin des wings image et lien pour laisser un résultat derrière lui — sans elles, ça lève une exception ici même
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// Le côté qui dresse les substituts de progression — bâtissez-le d'abord et branchez-le ci-dessous
const view = mountUploadView({ nabi, surface, locale: 'fr' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'fr',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // Mettez ici le code qui téléverse réellement vers votre serveur. Une URI signifie le succès, null signifie l'échec
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // Là où affluent les fichiers choisis par le bouton de fichier de la barre d'outils
  onFiles: (files) => upload.take(files),
})
```

## Démo

Ce site n'a aucun serveur où téléverser, donc il fait seulement semblant — en rendant l'URL
`blob:` que `URL.createObjectURL()` a fabriquée. Le résultat ne vit que dans cette page et nulle
part ailleurs.

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
