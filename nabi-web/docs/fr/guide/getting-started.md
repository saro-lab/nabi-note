---
title: Utilisation de base
description: Créez un éditeur NABI NOTE basé sur le navigateur, puis sauvegardez et restaurez ses documents.
---

# Utilisation de base

Ce guide couvre un éditeur rendu côté client (CSR) dans le navigateur : choisissez les wings, montez l'éditeur et son interface utilisateur, puis sauvegardez et restaurez le JSON NABI TREE.

## Installer et ajouter la structure de base

```bash
npm install nabi-note
```

Chargez la même feuille de style pour l'éditeur et le contenu publié. Ne ajoutez pas `contenteditable` vous-même ; `mountSurface()` en est responsable.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Monter un éditeur

`allBasic()` sélectionne les wings officielles qui fonctionnent sans câblage spécifique à l'application. Ajoutez des wings connectées au service, comme l'upload, le stockage de fichiers ou la comparaison de documents, comme décrit dans leurs guides respectifs.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'fr',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'fr',
  placeholder: 'Write something.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'fr',
})
```

`locale` contrôle la barre d'outils et le texte d'aide ; transmettez la même valeur à chaque montage de l'interface utilisateur. `placeholder` est affiché uniquement pour un éditeur vide. `onError` reçoit les échecs isolés des commandes et des rappels. `undoLimit` est le nombre d'entrées d'annulation (200 par défaut). `typingMergeMs` est l'intervalle qui fusionne les frappes consécutives en une seule étape d'annulation ; définissez-le sur `0` pour garder chaque insertion séparée.

Chaque éditeur a besoin de ses propres racines de contenu et de barre d'outils non chevauchantes. Sur une page avec plusieurs éditeurs, donnez à chaque barre d'outils sa propre surface d'éditeur via `surface` afin que le focus et les raccourcis ne se croisent pas.

## Choisir des wings

Utilisez `use()` et `drop()` pour ne conserver que les fonctionnalités dont vous avez besoin. Chaque page de wing documente les options qu'elle accepte.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'fr' })
```

Pour un bundle plus petit, transmettez uniquement les wings requis, tels que `boldWing` et `imageWing`, sous forme de tableau. Les noms inconnus, les options invalides et les dépendances manquantes échouent immédiatement lors de la création de l'éditeur.

## Sauvegarder et charger

Sauvegardez la sortie de `getJson()` en tant que JSON NABI TREE lorsqu'un document sera à nouveau édité. `getHtml()` est destiné à la publication. Ne stockez jamais le résultat spécifique à l'éditeur de `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

Utilisez `setHtml()` pour importer du HTML externe. L'éditeur de navigateur fournit déjà son analyseur HTML, donc aucune option d'analyseur n'est nécessaire. `setJson()` et `setHtml()` retournent `false` pour une entrée non vide invalide et laissent le document actuel intact.

```ts
nabi.setHtml('<p>Imported document</p>')
```

Le JSON et le HTML sont tous deux des entrées non fiables. NABI NOTE les lit via les wings enregistrées et leurs règles autorisées, mais cela ne remplace pas l'autorisation d'upload ni la politique de sécurité de votre service.

## API courantes

| Tâche | API |
| --- | --- |
| Créer un éditeur | `createNabiWith`, `wings` |
| Monter la surface et la barre d'outils | `mountSurface`, `mountToolbar` |
| Sauvegarder et restaurer | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Observer les changements | `nabi.onChange(listener)` |
| Annuler et rétablir | `nabi.undo()`, `nabi.redo()` |
| Rendre du HTML sur un serveur | `renderStoredHtml` depuis `nabi-note/ssr` |
| Ajouter le comportement de page publiée | `attachViewer` depuis `nabi-note/viewer` |
| Comparer des documents | `diffDocs` depuis `nabi-note/diff` |

Pour les types exacts et chaque argument, consultez d'abord les déclarations du package installé. Les outils d'automatisation peuvent également utiliser la [référence de l'API en anglais](https://nabi.saro.me/llms/api-reference.md).

## Détruire les montages

Démontez dans l'ordre inverse de la création. Ne modifiez pas directement `innerHTML` de la racine d'édition ; modifiez les documents via des API publiques telles que `setJson()`, `setHtml()` ou `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
