---
title: Styles personnalisés
description: Comment personnaliser les couleurs, les polices, les espacements et les autres styles de NABI NOTE avec des variables CSS.
---

# Styles personnalisés

**C'est l'application hôte qui charge la feuille de style elle-même** — avec un bundler, `import 'nabi-note/nabi.css'` ; via un CDN, une balise `<link>`. Ensuite, il suffit de redéfinir les seules variables CSS dont vous avez besoin pour changer tout le thème de l'éditeur de façon cohérente.

Chaque composant d'interface de NABI NOTE est **stylé uniquement avec des variables CSS `--nabi-*`, sans aucune couleur écrite en dur**, donc redéfinir les variables suffit à adapter votre image de marque.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

Pour savoir pourquoi le sélecteur de classe est répété trois fois, voir la section [Guide de spécificité CSS](#guide-de-specificite-css) plus bas.

::: tip Le HTML enregistré ne contient aucun style en ligne
Le HTML produit par l'éditeur (`getHtml()`) **ne contient aucun attribut `style` en ligne.** Le balisage ne porte que la structure sémantique et des attributs (comme `data-nabi-align="center"`), tandis que la feuille de style gère la présentation visuelle. C'est pourquoi, pour afficher du HTML enregistré sur une page externe, il faut le placer **à l'intérieur d'un conteneur `.nabi-content` avec `nabi.css` appliqué** pour obtenir le même rendu que dans l'éditeur.

Voir [Dessiner un HTML enregistré ailleurs](#dessiner-un-html-enregistre-ailleurs) plus bas pour les détails.
:::

::: tip Les thèmes clair et sombre sont déjà intégrés
L'hôte n'a besoin de définir aucune variable supplémentaire pour le thème par défaut. La feuille de style du cœur inclut déjà les valeurs claires par défaut, un thème `.dark` et un thème `.light` explicite.
:::

## Jetons de couleur et de thème

| Jeton | Signification | Valeur par défaut (clair) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | Fond de base · fond au survol/léger | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | Texte de base · texte secondaire atténué · texte sur la couleur d'accent | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | Bordure/séparateur · couleur d'accent principale (focus/actif) | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | Couleur de danger/alerte · texte sur cette couleur | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | Ombre des menus déroulants · fond assombri des modales/aperçus | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | Arrondi des coins (par défaut · petit · minimal) | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | Arrondi des coins des popups/modales en couche | `.25rem` |
| `--nabi-z-sticky` | z-index de l'en-tête collant | `20` |
| `--nabi-grid-cell` | Taille de cellule des grilles, comme celle d'insertion de tableau | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | Les six couleurs de surlignage | couleurs translucides |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | Les cinq couleurs de texte | couleurs vives |

Les variables du tableau ci-dessus sont des jetons que la feuille du cœur (`nabi.css`) **déclare directement.** Elles sont liées non seulement à `.nabi` mais à trois sélecteurs — `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))` — pour permettre un rendu autonome.

## Jetons seulement référencés (peuvent être déclarés sur :root)

Les variables ci-dessous sont des jetons que le cœur **ne déclare pas lui-même, mais référence seulement** sous la forme `var(--jeton, repli)`. Si l'hôte ne fournit pas de valeur, le repli indiqué s'applique. N'étant pas déclarés au niveau du cœur, **vous pouvez les déclarer sur `:root` pour les appliquer globalement.**

| Jeton | Signification | Repli par défaut |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | La police pour l'éditeur et chaque variante de la wing Police | polices système |
| `--nabi-cursive-adjust` | Le ratio `font-size-adjust` de la police cursive | `0.4` |
| `--nabi-sticky-top` | Le décalage supérieur de la barre d'outils collante (à régler sur la hauteur d'un en-tête fixe du site, s'il y en a un) | `0px` |
| `--nabi-preview-width` | La largeur par défaut de la carte d'aperçu | `720px` |
| `--nabi-placeholder` | Le texte d'exemple affiché dans un éditeur vide | aucun |
| `--nabi-placeholder-color` | La couleur de ce texte d'exemple (sans valeur, une couleur de repli propre au thème s'applique) | `--nabi-placeholder-color-fallback` |
| `--nabi-content-min-height` | La hauteur minimale d'une surface d'édition vide (s'applique uniquement à la surface d'édition `.nabi-editing`) | `12.5rem` |
| `--nabi-touch-font-size` | La taille de texte des champs de formulaire (`.nabi-input`) sur les appareils tactiles (`pointer: coarse` ou largeur ≤ 40rem) — évite le zoom automatique de Safari sur iOS | `16px` |

`--nabi-typeface-base` n'est pas seulement référencé — **c'est le cœur qui le déclare directement** (il référence `--nabi-font` par défaut). Pour changer la police par défaut, redéfinissez `--nabi-font`.

`--nabi-keyboard-top` et `--nabi-keyboard-bottom` sont des variables internes que **`mountSticky()` mesure et écrit dynamiquement** à partir de la hauteur du clavier mobile.

`--nabi-bar-height` est de même une variable interne que **`mountSticky()` mesure et écrit** à partir de la hauteur réelle de la barre d'outils. Elle est utilisée comme `scroll-margin-block-start` sur les éléments `.nabi-content > *` pour qu'ils ne se retrouvent pas cachés sous la barre d'outils lors du défilement.

## Redéfinir des styles fixes sans variable

Les trois propriétés ci-dessous sont définies par des règles CSS fixes plutôt que par des variables — pour les changer, redéfinissez directement le sélecteur de classe.

**Les quatre tailles de texte** (en `em`, relatives à la taille du parent) :

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**La taille de la lettrine** :

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**Les couleurs des jetons de code** :

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

---

## Conventions d'unités

La plupart des dimensions de l'interface — taille des boutons, espacements, hauteur de la barre d'outils, etc. — sont définies en `rem` et **évoluent donc proportionnellement à la taille de police de la racine (`html`).** Si une personne agrandit la taille de police par défaut dans son navigateur ou son système, l'interface de l'éditeur s'agrandit naturellement avec elle.

---

## Guide de spécificité CSS

Pour redéfinir une variable de couleur de thème déclarée par le cœur, nous recommandons de **superposer trois classes** afin d'augmenter la priorité du style de façon fiable.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: #7c3aed;
}
```

- La règle claire par défaut `:is(.nabi, …)` a une spécificité de **(0, 1, 0)**.
- La règle du mode sombre `:where(html, body).dark :is(.nabi, …)` a une spécificité de **(0, 2, 0)**.
- Superposer trois classes comme dans `.nabi.nabi.nabi` donne donc une spécificité de **(0, 3, 0)**, qui l'emporte toujours, quel que soit l'ordre de chargement du CSS.

La modale d'aperçu est montée comme enfant direct de `body` : vous devez donc aussi préciser le sélecteur `.nabi-scrim.nabi-scrim.nabi-scrim` pour que la même couleur de thème s'y applique.
Les jetons seulement référencés, que le cœur ne déclare pas — comme les jetons de police —, s'appliquent correctement dès une seule déclaration sur `:root`.

---

## Thème clair / sombre

Le thème sombre s'applique quand l'élément `html` ou `body` porte la classe `dark`, et le thème clair quand il porte la classe `light`. Sans classe, le thème clair par défaut s'applique, et si les deux classes sont présentes, la classe explicite `light` l'emporte.

```html
<html class="dark"><!-- ou <body class="dark"> --></html>
```

Changer de thème ne demande que de basculer la classe — il n'y a pas d'API JavaScript séparée à appeler. Dans vos propres styles, utiliser des variables `--nabi-*` fait que leurs couleurs suivent automatiquement les changements de thème.

---

## Façons de charger la feuille de style

**1. Importer le fichier CSS complet** (le moyen le plus courant et recommandé)

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. Injecter dynamiquement seulement le style des wings enregistrées**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// appeler drop() retire du DOM les styles injectés
```

Un même contenu de feuille de style n'est jamais injecté deux fois — il est géré comme une seule balise.
Dans un environnement de rendu côté serveur (SSR), il est préférable de charger le fichier CSS statique plutôt que de l'injecter, pour éviter un flash de contenu non stylé (FOUC) avant l'exécution du JS côté client.

---

## Classes CSS et éléments d'interface personnalisables

| Sélecteur | Ce que c'est | Créé par |
|---|---|---|
| `.nabi` | Le conteneur de premier niveau qui enveloppe tout l'éditeur (barre d'outils + zone d'édition) | l'hôte |
| `.nabi-content[contenteditable]` | La zone d'édition proprement dite | l'hôte |
| `.nabi-toolbar` | Le conteneur d'en-tête collant qui enveloppe la barre d'outils et la barre contextuelle | l'hôte |
| `.nabi-toolbar-row` | La ligne de boutons de la barre d'outils principale | `mountToolbar()` |
| `.nabi-context` | Le conteneur de la barre d'outils contextuelle dynamique | `mountContextToolbar()` |
| `.nabi-tools` | L'enveloppe des boutons aperçu et plein écran | `mountViewTools()` |
| `.nabi-hints [data-hint]` | Le badge de raccourci affiché après un double appui rapide sur Shift | `mountHints()` |
| `[data-nabi-tip]` | L'infobulle d'un bouton (dessinée avec `::after` en CSS) | composants du cœur |
| `.nabi-content.nabi-dropping` | La zone d'édition pendant qu'un fichier y est glissé | `mountUpload()` |

### Modales et popups

| Sélecteur | Ce que c'est | Créé par |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > `.nabi-content.nabi-preview-body` | La modale d'aperçu du document | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | Le popup lightbox d'image | `openLightbox()` |
| `.nabi-scrim` > `.nabi-card.nabi-choose` | Le popup de choix du format de collage | `openChoosePanel()` |
| `.nabi-scrim` > `.nabi-card.nabi-save` | Le popup d'enregistrement (saisie du nom et choix du format) | `openSavePanel()` |
| `.nabi.is-fullscreen` | La classe qui active le mode plein écran de l'éditeur | `setFullscreen()` |

---

## Dessiner un HTML enregistré ailleurs

La chaîne HTML extraite avec `getHtml()` ne contient que du balisage sémantique et des attributs `data-nabi-*`, sans aucun `style` en ligne.
Pour la dessiner sur une page externe avec la même allure que dans l'éditeur, enveloppez le contenu dans une classe `.nabi-content` et chargez `nabi.css`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">

<div class="nabi-content">
  <!-- contenu HTML enregistré via nabi.getHtml() -->
</div>
```

Même sans l'envelopper dans `.nabi`, les jetons de thème et de police s'appliquent directement à `.nabi-content`, ce qui permet de reproduire exactement le style vu dans l'éditeur.

### Activer le tri de tableaux en lecture seule

Pour activer le tri des colonnes de tableau sur une page HTML publiée, accrochez la fonction `attachTableSort`.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'fr' })
```

Elle repère les tableaux portant l'attribut `data-nabi-sortable` et ajoute des boutons de tri dans les cellules d'en-tête. Appeler la fonction `detach()` retournée retire les boutons ajoutés au DOM et rétablit l'ordre original des lignes.

::: warning Ne pas appliquer attachTableSort à un DOM en cours d'édition
`attachTableSort()` manipule directement la structure du DOM. L'appliquer à une zone d'éditeur encore en cours d'édition peut figer durablement l'interface des boutons de tri dans le corps du document. Utilisez-la uniquement sur un écran de visionnage en lecture seule.
:::

---

## Suite

- [{{ t('menu_wing_custom') }}](../wing/custom) — construire soi-même une wing de mise en forme personnalisée
- [{{ t('menu_intro_index') }}](../intro) — introduction à NABI NOTE et à son architecture

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
