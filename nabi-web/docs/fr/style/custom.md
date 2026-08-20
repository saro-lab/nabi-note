---
title: Styles personnalisés
description: Les couleurs et les formes se changent en redéfinissant des variables CSS.
---

# Styles personnalisés

**C'est l'hôte qui accroche la feuille de style** — avec un bundler, une ligne
`import 'nabi-note/nabi.css'` ; avec un CDN, une ligne `<link>`. Après quoi il ne reste plus qu'à
redéfinir des variables.

Les règles des composants **ne contiennent pas une seule couleur littérale.** Tout est dessiné
avec des variables `--nabi-*` : redéfinissez la variable et le reste suit.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

La raison pour laquelle la classe est répétée trois fois se trouve plus bas, dans
[Ne pas buter sur la spécificité](#ne-pas-buter-sur-la-specificite).

::: tip Le grand présupposé de ce document — la valeur enregistrée ne tient pas debout toute seule
Le HTML qui sort (`getHtml()`) **ne contient pas un seul `style` en ligne.** La valeur
enregistrée ne dit par ses attributs que ce que la chose est (`data-nabi-align="center"`) ; à quoi
elle ressemble, c'est cette feuille qui le dit. Voilà pourquoi, même du côté qui lit le HTML
enregistré, il faut se trouver **à l'intérieur d'un `.nabi-content` où cette feuille est posée**
pour obtenir la même allure que dans l'éditeur — voyez plus bas
[Dessiner un HTML enregistré hors de l'éditeur](#dessiner-un-html-enregistre-hors-de-l-editeur).
:::

::: tip Les modes clair et sombre sont déjà là
Il n'y a **aucun** jeton que l'hôte doive redéfinir pour le thème. La feuille du cœur amène les
trois d'un coup : les valeurs claires par défaut, la redéfinition `.dark` et la redéfinition
explicite `.light`. Ce site lui-même, à l'intérieur de l'éditeur, ne redéfinit rien d'autre que
quatre jetons de police.
:::

## Jetons de couleur et de forme

| Jeton | Sens | Valeur par défaut (clair) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | Le fond · une surface légèrement enfoncée | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | Le texte · le texte estompé · le texte sur l'accent | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | Les traits · la couleur d'accent | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | Le danger · le texte sur le danger | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | L'ombre des boîtes · le fond de l'aperçu | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | Les coins | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | Le coin des couches (panneau, aperçu, lightbox) | `.25rem` |
| `--nabi-z-sticky` | La couche de la ligne collée | `20` |
| `--nabi-grid-cell` | La taille d'une case dans la grille de dimension du tableau | `1.125rem` |
| `--nabi-hl-yellow` · `green` · `cyan` · `pink` · `purple` · `orange` | Les six couleurs du surligneur | Couleurs translucides |
| `--nabi-tc-green` · `coral` · `violet` · `amber` · `blue` | Les cinq couleurs du texte | Couleurs soutenues |

Ce tableau ne recense que ce que la feuille du cœur (`nabi.css`) **déclare elle-même**. Les
déclarations ne se font pas au seul `.nabi` mais à trois endroits —
`:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`. C'est que la surimpression
d'aperçu est un enfant de `body` et que l'héritage depuis `.nabi` ne l'atteint pas, et qu'un
`.nabi-content` dressé seul hors de l'éditeur doit lui aussi recevoir les jetons directement.

La même liste est écrite en trois exemplaires (valeurs claires par défaut · `.dark` · `.light`
explicite). **Celui qui redéfinit n'a pas besoin de les voir tous les trois** — s'il l'emporte en
spécificité, une valeur redéfinie une seule fois s'applique aux trois cas. En revanche, si vous
voulez une valeur différente en mode sombre, c'est à vous d'ajouter la condition `.dark`.

## Jetons seulement référencés, jamais déclarés

Voici les variables que le cœur **référence sans les déclarer**. Si l'hôte ne donne pas de valeur,
c'est la valeur de repli entre parenthèses qui se dresse. Comme il n'existe aucun endroit de
déclaration, **elles fonctionnent même écrites sur `:root`** — c'est là que passe la ligne de
partage avec les jetons de couleur et de forme ci-dessus (ceux-là sont déclarés sur `.nabi`, où
l'héritage ne peut pas l'emporter).

| Jeton | Sens | Repli |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | La police réellement branchée sur chacune des quatre familles de la wing Police | Police système |
| `--nabi-cursive-adjust` | Le `font-size-adjust` de la cursive. Les visages manuscrits ont une hauteur d'x basse et paraissent plus petits à px égal ; cette valeur les remesure à partir de la hauteur d'x | `0.4` |
| `--nabi-sticky-top` | De combien la ligne collée s'assoit plus bas. La hauteur de votre bandeau fixe, si le site en a un | `0px` |
| `--nabi-preview-width` | La largeur de la carte d'aperçu. **`openPreview` mesure la largeur de la zone d'édition à l'ouverture et l'écrit directement sur la carte**, donc même redéfinie par l'hôte, cette valeur en ligne l'emporte | `720px` |

`--nabi-typeface-base` n'appartient pas à ce groupe — **c'est le cœur qui le déclare** (il suit
`--nabi-font` par défaut). La wing Police n'a pas d'option pour fixer cette valeur : pour la
changer, redéfinissez ce jeton.

`--nabi-keyboard-top` · `--nabi-keyboard-bottom` se tiennent au même endroit, mais **c'est le
cœur qui les écrit** — `mountSticky()` mesure ce que le clavier mobile a poussé hors de l'écran et
l'inscrit ici, puis la ligne collée et le plein écran lisent cette valeur. Ce n'est pas une valeur
à écrire à la main.

## Là où il n'y a pas de jeton — on redéfinit la règle

Les trois suivants **n'ont pas de variable.** Le cœur a fixé la valeur dans la règle elle-même ;
pour la changer, redéfinissez ce sélecteur.

**Les quatre paliers de taille de texte** — en `em`, ils suivent donc la taille du parent.

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**La taille de la lettrine** — ce n'est pas une valeur qui fixe le nombre de lignes englobées,
mais une seule taille de texte. Le nombre de lignes réellement couvertes, c'est l'interligne de ce
paragraphe qui le décide.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**Les couleurs des jetons de code** — la feuille de la wing code écrit directement une couleur sur
`[data-nabi-token]`. Les couleurs sont posées aujourd'hui sur **cinq** catégories.

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

Le `type` que répond le surligneur est un texte libre — un nom hors des cinq ci-dessus se dessine
sans couleur, donc pour ajouter une catégorie, l'hôte n'a qu'à ajouter une règle de même forme.
Pour une couleur différente en mode sombre, ajoutez vous-même la condition `.dark` — le cœur ne
fournit aucune variante sombre pour ces cinq-là.

L'animation de progression de la wing upload (`--nabi-per` · `--nabi-t` · `--nabi-span` ·
`--nabi-clear` · `--nabi-blur-max`) est **à usage interne de la wing** — son nom commence bien par
`--nabi-`, mais ce n'est pas un endroit ouvert à la redéfinition par l'hôte.

---

## Les dimensions extérieures sont en `rem`

Les dimensions extérieures — boutons, marges, puces de la barre d'outils — sont pour la plupart en
`rem` et **grandissent donc avec la taille de police de la racine (`html`).** Si la personne
agrandit le texte dans son navigateur ou son OS, le cadre de l'éditeur grandit avec. Pour changer
l'échelle, changez le `font-size` de la racine. Un trait (`border`) est un **trait** et non une
dimension : certains endroits restent donc en `px`.

---

## Ne pas buter sur la spécificité

Pour redéfinir un jeton de couleur ou de forme, superposez **trois classes**.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--ma-couleur-accent);
}
```

Le compte est le suivant. La règle des valeurs claires par défaut `:is(.nabi, …)` vaut **(0,1,0)**,
puisque `:is()` prend la plus haute de ses arguments ; la règle sombre
`:where(html, body).dark :is(.nabi, …)` vaut **(0,2,0)**, puisque `:where()` compte pour 0 et que
`.dark` et `:is()` valent une classe chacun. Avec `.nabi.nabi`, vous faites donc **match nul** avec
le sombre — et en cas de match nul, c'est la feuille chargée en dernier qui l'emporte, or la
feuille du cœur peut très bien être chargée après celle de l'hôte. Il faut superposer trois
classes pour monter à (0,3,0) et cesser de dépendre de l'ordre.

La surimpression d'aperçu se dresse hors de `.nabi` (c'est un enfant de `body`) : pour obtenir la
même couleur, il faut écrire son sélecteur à elle en même temps.

**Les jetons que le cœur ne déclare pas, comme les polices, n'imposent pas ce bras de fer** —
n'ayant aucun endroit de déclaration, ils s'atteignent par le seul héritage : une ligne sur
`:root` suffit.

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## Clair et sombre

Si la classe `dark` se trouve sur `html` **ou** sur `body`, c'est le mode sombre ; avec `light`,
c'est le mode clair. Sans classe, le clair est la valeur par défaut, et si les deux sont là, le
`light` explicite l'emporte (la règle `.light` est chargée après la règle `.dark`).

```html
<html class="dark"><!-- ou <body class="dark"> --></html>
```

Basculez la classe et le CSS réagit. Il n'y a aucune API à appeler. Ce que le thème remplace, ce
sont uniquement les variables de couleur ; les règles des composants ne bougent pas — un style que
vous avez écrit vous-même suit le mode sombre du moment qu'il n'emploie que des variables
`--nabi-*`.

---

## Les deux façons d'accrocher la feuille

**① Un seul fichier** — la voie la plus courante. Il porte le CSS de chaque wing.

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② N'injecter que ce qui est enregistré** — quand vous ne voulez que la feuille des wings
réellement activées.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// appeler drop() ne retire que ce que cet appel a posé
```

La feuille d'un même texte n'entre **qu'une seule fois** — la clé de déduplication étant le
**contenu** de la feuille, ouvrir plusieurs éditeurs dans un même document ne l'empile pas, et
mélanger des instances aux compositions de wings différentes se rassemble en une seule union.

:::: tip Deux différences entre les deux — ce qui est porté, et quand ça s'attache
**Ce qui est porté.** Le fichier ne peut pas savoir quelles wings vous avez enregistrées, il porte
donc **toutes** leurs feuilles. L'injection regarde le `registry` et ne porte que **celles
enregistrées**. Une page qui se contente d'afficher du HTML enregistré n'a pas d'éditeur, donc pas
de `registry` non plus — elle utilise le fichier.

**Quand ça s'attache.** Un fichier arrive en `<link>` dans l'en-tête et **bloque le rendu** tant
qu'il charge. L'injection ne s'attache qu'**une fois le JavaScript de l'éditeur arrivé**. Une page
dont le document est pré-rendu côté serveur puis envoyé doit donc prendre la voie du fichier — par
l'injection, le document envoyé par le serveur se peindrait d'abord nu, puis serait restylé et
réagencé une fois la feuille arrivée.
::::

La feuille d'une wing enregistrée entre **après** la feuille du cœur, donc à priorité égale,
c'est la wing qui l'emporte.

---

## Les prises où s'accrocher

Ce que les variables ne permettent pas, on le vise directement par les classes qui existent
réellement.

| Sélecteur | Quoi | Qui la pose |
|---|---|---|
| `.nabi` | L'enveloppe qui entoure tout l'éditeur (chrome + zone d'édition). C'est là que se posent les jetons de couleur et de forme | l'hôte |
| `.nabi-content[contenteditable]` | La zone d'édition elle-même | l'hôte |
| `.nabi-toolbar` | L'emplacement qui entoure la ligne de la barre d'outils et la ligne contextuelle. Cette classe signifie à elle seule « se colle en haut » | l'hôte |
| `.nabi-toolbar-row` | Le récipient où s'installe la barre d'outils | `mountToolbar()` |
| `.nabi-context` | Le récipient où s'installe la ligne contextuelle | `mountContextToolbar()` |
| `.nabi-tools` | La place des deux boutons aperçu et plein écran — le cœur la fait flotter en haut à droite | `mountViewTools()` |
| `.nabi-tool` | Ces deux boutons eux-mêmes | `mountViewTools()` |
| `.tb-group` | Un groupe de boutons de la barre d'outils | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | Les groupes, boutons, échantillons de couleur et champs de texte de la ligne contextuelle | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | La boîte qui s'ouvre sous un bouton, comme la grille de dimension du tableau | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | La couche de saisie d'adresse qui apparaît à l'insertion | `mountToolbar()` |
| `.nabi-hints [data-hint]` | Les badges de raccourcis qui apparaissent après deux appuis rapides sur Shift — le badge est un `::before` et l'étiquette un `::after`, si bien qu'on voit les deux ensemble | `mountHints()` |
| `[data-nabi-tip]` | L'étiquette (tooltip) — dessinée uniquement en CSS `::after` | un peu partout dans le cœur |
| `.nabi-content.nabi-dropping` | La zone d'édition pendant qu'on y traîne un fichier. Le texte d'invite voyage dans l'attribut `data-nabi-drop` | `mountUpload()` |

L'aperçu et le plein écran aussi, **c'est le cœur qui les bâtit.**

| Sélecteur | Quoi | Qui |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | La surimpression d'aperçu du document | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | La boîte qui montre une seule image en grand | `openImageLightbox()` |
| `.nabi.is-fullscreen` | Le plein écran — fixe la boîte `.nabi` à l'écran | `setFullscreen()` (le nom de classe est `FULLSCREEN_CLASS`) |

Si vous montez `mountViewTools()`, les deux boutons ouvrent et ferment tout cela d'eux-mêmes. Pour
ouvrir vous-même, appelez `openPreview({ nabi, editor })` ·
`openImageLightbox({ editor, src, alt?, locale })` · `setFullscreen(root, on)` ·
`isFullscreen(root)`.

::: tip La place des outils se dresse toute seule
`mountViewTools` fabrique lui-même la boîte `.nabi-tools` et la pose en tête du récipient qu'on lui
a donné. L'hôte n'a jamais à poser un `<span>` avant la barre d'outils — préparer la place à
l'avance ne fait que doubler la boîte.
:::

Vous pouvez aussi viser les marques propres à l'écran d'édition — `[data-nabi-token]` (la couleur
des jetons d'un bloc de code), `[data-nabi-lang]` (le langage d'un bloc de code), `[data-color]`
(surligneur et couleur du texte — distingués par la balise `<mark>` ou `<span>`),
`data-nabi-align` · `data-nabi-typeface` · `data-nabi-size` · `data-nabi-dropcap` (les attributs
de paragraphe). Pour le nom réel de ces marques, la référence est la constante `*_ATTR` du fichier
de chaque wing.

---

## Dessiner un HTML enregistré hors de l'éditeur

La valeur qui sort (`getHtml()`) est du HTML où subsistent les attributs `data-nabi-*`, et **pas un
seul `style` en ligne.** Autrement dit, l'allure revient entièrement à la feuille : dessinez sans
elle et vous obtenez du HTML nu, sans alignement, sans taille de texte, sans les traits du
tableau.

Pour dessiner avec la même allure que dans l'éditeur, enveloppez le tout dans `.nabi-content` —
cette classe reçoit les jetons de couleur et de forme directement, même sans être enveloppée par
`.nabi` (la règle `.nabi-content:where(:not(.nabi *))` de `nabi.css`).

```html
<div class="nabi-content">le HTML enregistré</div>
```

Accrochez la feuille comme on l'a vu dans « Les deux façons d'accrocher la feuille » — avec un
bundler, `import 'nabi-note/nabi.css'` ; sinon, un seul `<link>`. Même une page qui ne monte aucun
éditeur reçoit ses jetons de la feuille du cœur du moment qu'elle a un `.nabi-content`.

### Un comportement qui tourne côté lecture — le tri des tableaux

Aujourd'hui, **seul le tri des tableaux** sort sous forme de fonction réservée au côté lecture. Il
n'existe pas encore de système général permettant à une wing quelconque d'attacher son propre
comportement de lecture.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'fr' })
```

La fonction repère les tableaux portant `data-nabi-sortable` et pose un bouton de tri sur les
cellules d'en-tête. La fonction de détachement (`detach`) retire les boutons plantés et rétablit
l'ordre des lignes.

::: danger Ne l'attachez pas à l'élément en cours d'édition
`attachTableSort()` plante des boutons dans le DOM et change l'ordre des lignes. Si vous
enregistrez le DOM pendant qu'elle est attachée, tout cela se fige dans la valeur — côté lecture,
ne l'attachez qu'à une copie en lecture seule.
:::

---

## Documents suivants

- [{{ t('menu_wing_custom') }}](../wing/custom) — fabriquer soi-même une mise en forme absente
- [{{ t('menu_intro_index') }}](../intro) — les mots qu'emploie ce document

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
