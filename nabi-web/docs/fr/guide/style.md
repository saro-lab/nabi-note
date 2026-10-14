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
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Attribuez la même classe de thème au `.nabi` de l'éditeur et au `.nabi-content` de la vue publiée pour leur appliquer les mêmes variables. Chargez votre CSS après celui du paquet et indiquez le thème courant avec `data-nabi-theme`.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
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
| Largeur de passage au mode mobile | `--nabi-mobile-breakpoint` |

Le surlignage et la couleur du texte utilisent respectivement `--nabi-hl-<name>` et `--nabi-tc-<name>`. Les fonds de cellule utilisent `--nabi-cell-<name>`, avec `yellow`, `green`, `cyan`, `pink`, `purple` et `orange`. Ces variables changent uniquement la couleur affichée, pas son nom enregistré.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

Le thème par défaut utilise des fonds de cellule pâles. Le mode sombre conserve les noms, mais emploie des couleurs distinctes, plus claires et moins saturées, pour mieux les distinguer sur un fond sombre. Ces couleurs translucides laissent voir le fond ; si vous les personnalisez, vérifiez le contraste du texte sur le fond réel de la page. Pour remplacer les variables de couleur par défaut, appliquez la classe de thème à l'élément réel de l'éditeur ou du contenu publié, comme ci-dessus, plutôt qu'à un parent extérieur quelconque.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Seuil du mode mobile

La barre par défaut `layout: 'compact'` passe sur une ligne mobile lorsque l'écran mesure moins de `36rem`. À exactement `36rem`, la disposition de bureau reste active. Sur ordinateur, tous les outils reviennent à la ligne même si l'éditeur est étroit. Les propriétés d'objet reviennent aussi à la ligne dessous ; les deux rangées occupent de la place au-dessus du texte. Le plein écran déploie tous les outils quelle que soit la largeur.

Sur mobile, les outils rapides, le bouton de tous les outils et les boutons d'aperçu/plein écran connectés restent dans la barre principale. Ils restent utilisables lorsque les propriétés apparaissent. La palette de tous les outils conserve l'ordre des groupes et les séparateurs du bureau. `layout: 'wrap'` affiche toujours tous les outils avec retour à la ligne.

Les panneaux mobiles s'ouvrent dans l'espace disponible autour de la barre et des propriétés. Le sélecteur de dimensions de tableau fait exception : il s'ouvre au centre sur un fond translucide, avec une grille tactile de 5×5. Il n'attend pas la fermeture du clavier ; choisir une taille insère un tableau puis ferme le sélecteur.

Définissez `--nabi-mobile-breakpoint` sur `:root`, un ancêtre ou un `.nabi` particulier pour changer le seuil. Utilisez une longueur CSS positive ou nulle, telle que `rem`, `px` ou `calc()`. Les changements de valeur CSS, de taille de police racine ou de largeur d'écran actualisent automatiquement les panneaux ouverts. Les panneaux de saisie déplacés sous `body` conservent le seuil de leur éditeur d'origine.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Les zones flottantes ont un seuil distinct pour passer sur une colonne. Elles s'empilent quand le conteneur du texte, et non l'écran, mesure moins de `36rem`. L'impression utilise la même disposition.

## Mode sombre

Le mode clair est le défaut. Ajoutez `.dark` à `html` ou `body`, ou définissez `data-nabi-theme="dark"` sur un éditeur spécifique ou un corps publié.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Utilisez `data-nabi-theme="light"` pour vous soustraire au `.dark` d'un ancêtre. Votre application contrôle le changement de thème ; le package ne suit pas automatiquement `prefers-color-scheme`.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
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
  --nabi-font: "Noto Serif KR", serif;
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
