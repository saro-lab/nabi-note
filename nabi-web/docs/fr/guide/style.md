---
title: Thèmes CSS
description: Configurez les couleurs, les polices, la taille et le mode sombre pour les éditeurs et le contenu publié à l'aide de variables CSS.
---

# Thèmes CSS

NABI NOTE utilise le même CSS pour l'édition et le contenu publié. Chargez une fois la feuille de style du package, puis ne surchargez que les variables dont vous avez besoin sur un conteneur de service.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Placez les jetons partagés sur un ancêtre commun afin que l'éditeur et sa vue publiée conservent le même langage visuel.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Variables courantes

| Objectif | Variables |
| --- | --- |
| Texte et arrière-plan | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Bordures et accentuation | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Coins et ombres | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Familles de polices | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Surface d'édition | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Barre d'outils et aperçu épinglés | `--nabi-sticky-top`, `--nabi-preview-width` |
| Contrôles tactiles | `--nabi-touch-font-size`, `--nabi-touch-control-size` |

Les jetons de surlignage et de couleur de texte utilisent `--nabi-hl-<name>` et `--nabi-tc-<name>`. Par exemple, modifier `--nabi-hl-yellow` change la couleur d'affichage des surlignages `yellow` stockés sans modifier les données du document.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Mode sombre

Le mode clair est le défaut. Ajoutez `.dark` à `html` ou `body`, ou définissez `data-nabi-theme="dark"` sur un éditeur spécifique ou un corps publié.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Utilisez `data-nabi-theme="light"` pour vous soustraire au `.dark` d'un ancêtre. Votre application contrôle le changement de thème ; le package ne suit pas automatiquement `prefers-color-scheme`.

```css
.dark .brand-note {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Styliser également le contenu publié

Le HTML publié a également besoin de `.nabi-content` et du même CSS. Les tableaux, les blocs de code, les images, les listes à puces et les lettrines sont rendus sans JavaScript. Ajoutez `nabi-note/viewer` uniquement pour des comportements tels que le tri des tableaux ou la coloration syntaxique du code.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

Définissez sur votre classe de service les éléments de mise en page que le package ne gère pas, tels que la largeur du corps et la hauteur de ligne.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Ne pas modifier la structure d'édition

Ne modifiez pas `display` ou `white-space` sur les nœuds `[data-key]` d'édition, n'ajoutez pas d'éléments pseudo-à l'intérieur du texte éditable, ni ne désactivez le comportement du pointeur sur les enveloppes d'objets. Ces règles peuvent rompre la géométrie du curseur et la mappage du document.

Les lettrines publiées utilisent `::first-letter`, tandis qu'une surface d'édition utilise un véritable élément `[data-nabi-dropcap-letter]`. N'ajoutez pas une autre règle `::first-letter` à l'intérieur de `.nabi-editing` ni ne remplacez cet élément.
