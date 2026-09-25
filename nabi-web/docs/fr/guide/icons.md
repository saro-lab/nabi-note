---
title: "Thèmes d’icônes"
description: "Les variables CSS remplacent les icônes des wings, de l’aperçu, du plein écran, des panneaux, des différences et du tri des tableaux. Mélangez SVG, WebP et PNG ; les icônes non définies utilisent les fichiers par défaut."
---

# Thèmes d’icônes

Les variables CSS remplacent les icônes des wings, de l’aperçu, du plein écran, des panneaux, des différences et du tri des tableaux. Mélangez SVG, WebP et PNG ; les icônes non définies utilisent les fichiers par défaut.

## Choisir les fichiers

Chargez le CSS et ajoutez une classe de thème à l’éditeur ou à un parent commun. Les images conservent leurs couleurs, leur transparence et leurs proportions.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

Utilisez des chemins depuis la racine comme `/icons/...` ou des URL HTTPS complètes. Les chemins relatifs ne sont pas forcément résolus à côté du fichier de thème. Pour héberger le CSS vous-même, copiez la même version de `dist/icons/` à côté de `nabi.css`. Si une image échoue, l’icône reste vide, mais le nom, l’infobulle et l’action du bouton restent disponibles.

## Trouver d’autres icônes

Préfixez la valeur `data-nabi-icon` de l’élément par `--nabi-icon-` pour obtenir sa variable CSS. Ainsi, `diff-close` utilise `--nabi-icon-diff-close`. Le <a href="/llms/icons.md" target="_blank" rel="noopener">contrat des icônes</a> décrit les clés de contexte, menu, enregistrement, historique et autres, ainsi que l’encodage des caractères spéciaux.

## Mode sombre et panneaux

Modifier la classe de thème ou une variable CSS actualise les icônes sans nouveau mount. Les icônes par défaut suivent le thème clair/sombre. Les fichiers personnalisés n’héritent pas de `currentColor` ; prévoyez des variantes sombres comme ci-dessus si nécessaire. Les panneaux ouverts sous `body` suivent aussi le thème d’icônes et les changements de classe/style de l’éditeur source. Placez les variables sur l’éditeur ou un parent commun, pas seulement dans la barre d’outils.

## Afficher les boutons par défaut

`showPreview` et `showFullscreen` valent tous deux `true` par défaut. `false` supprime le bouton concerné, sa cible de focus et ses événements. Si les deux valent `false`, aucune zone d’outils vide n’est créée.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Passez les mêmes options d’affichage au SSR et au mount. Pour changer la configuration, appelez `tools.unmount()` puis montez avec de nouvelles options. Si aucun bouton n’est nécessaire, vous pouvez toujours omettre le mount et le balisage SSR des outils. Les appels directs à `openPreview()` et `setFullscreen()` restent disponibles.
