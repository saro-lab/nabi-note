---
title: Configuration du rendu côté serveur (SSR)
description: Affichez en toute sécurité des documents NABI TREE stockés au format HTML sur un serveur et hydratez un éditeur dans le navigateur.
---

# Configuration du rendu côté serveur (SSR)

Sur le serveur, importez uniquement `nabi-note/ssr`, pas les surfaces ou l'interface utilisateur destinées au navigateur. Il valide le JSON NABI TREE stocké et le convertit en HTML publié ou en HTML d'éditeur hydratable.

## Rendu du HTML publié

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` valide et normalise son entrée JSON, puis renvoie le HTML publié. `null` signifie que le registre actuel ne peut pas lire cette entrée. Incluez le CSS du package et `.nabi-content` sur la page publiée.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Ajoutez `attachViewer()` depuis `nabi-note/viewer` uniquement dans le navigateur pour le tri interactif des tableaux ou la coloration syntaxique du code. Le contenu publié simple nécessite uniquement le CSS.

## Hydrater le balisage de l'éditeur pré-rendu

Pour afficher un éditeur dès le premier rendu, générez-le avec `renderStoredEditorHtml()` sur le serveur et passez `hydrate: true` à la surface du navigateur.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Le serveur et le navigateur doivent utiliser le même document, les déclarations de wing dans le même ordre, et les options qui affectent le HTML. Insérez la sortie du serveur sans modification en tant qu'enfants directs de la racine de contenu, et ne définissez pas au préalable `contenteditable` sur cette racine. Si la structure diffère, la surface génère un nouveau HTML d'éditeur.

## Pré-rendre également la barre d'outils

`renderToolbarHtml()` et `renderViewToolsHtml()` peuvent pré-rendre les contrôles de la barre d'outils sur le serveur. Le montage dans le navigateur relie ces contrôles lorsque le registre, la locale et l'ordre des groupes correspondent. Les DOM hôte arbitraires à l'intérieur d'une racine de barre d'outils ne sont pas pris en charge.

N'utilisez pas les API du navigateur telles que `injectSheets()` pendant le rendu côté serveur (SSR). Liez le fichier construit `nabi-note/nabi.css` ou incluez-le dans votre bundle CSS.
