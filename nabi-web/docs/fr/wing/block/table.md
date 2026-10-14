---
title: Tableau
description: Placez plusieurs paragraphes et blocs dans les cellules et modifiez les fonds, les fusions et les alignements.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tableau

Choisissez les lignes et les colonnes dans la barre d’outils pour créer un tableau. Les cellules peuvent contenir plusieurs paragraphes, des images, des listes, des citations, du code, des sections repliables et des vidéos. Placez le curseur dans une cellule pour modifier les lignes, les colonnes, les fusions, les en-têtes et les couleurs de fond avec les outils de propriétés situés en dessous.

Dans l’exemple ci-dessous, modifiez les paragraphes et les listes des cellules, puis faites glisser sur plusieurs cellules pour changer leur fond ensemble. Cliquez sur **Sélectionner le tableau** dans les outils de propriétés pour aligner le tableau lui-même depuis la barre d’outils principale.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Enregistrez également les ailes à utiliser dans les cellules. Pour un éditeur disposant de toutes les ailes de base, utilisez `wings().allBasic()`.

## Écrire dans les cellules

| Saisie | Comportement |
| --- | --- |
| Enter dans un paragraphe normal | Crée un nouveau paragraphe dans la même cellule. |
| Shift+Enter | Insère un saut de ligne dans le paragraphe ou l’élément de liste courant. |
| Tab / Shift+Tab dans un paragraphe normal | Passe à la cellule suivante / précédente. |
| Tab / Shift+Tab dans une liste ou du code | Utilise l’augmentation / la réduction du retrait du bloc. |

Dans les listes et le code, Enter suit les règles de saisie propres au bloc. Même lorsque le code ne peut plus être désindenté, Shift+Tab ne passe pas à la cellule précédente. Backspace ou Delete au début ou à la fin d’une cellule ne la fusionne pas avec une cellule voisine ni avec un paragraphe extérieur au tableau.

Le collage et l’insertion d’images ou de blocs restent dans la cellule où l’opération a commencé. L’insertion de blocs et le collage ne sont pas disponibles pour une sélection qui traverse les limites des cellules. Les tableaux et les [zones flottantes](./float) ne peuvent pas être imbriqués dans des cellules ; à l’importation ou au collage de telles structures, leur contenu est déballé dans l’ordre.

Les cellules normales peuvent contenir des titres, mais la mise en forme de titre ne s’applique pas aux cellules d’en-tête. Le passage en cellule d’en-tête transforme les titres internes en paragraphes normaux, tout en conservant le texte et les autres mises en forme.

## Couleurs de fond des cellules

La couleur de fond s’applique à une cellule ou à une plage rectangulaire sélectionnée par glissement. Même si seule une partie du texte est sélectionnée, le fond de toute la cellule qui le contient change. Les couleurs pâles s’adaptent aux thèmes clair et sombre. Si les cellules sélectionnées ont des couleurs différentes, aucune couleur unique n’est affichée comme sélectionnée.

Vous pouvez aussi changer la couleur par une commande tout en conservant la sélection de cellules actuelle.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Les valeurs autorisées sont `yellow`, `green`, `cyan`, `pink`, `purple` et `orange`. Pour rétablir le fond par défaut, choisissez **Par défaut** dans les outils de propriétés ou transmettez une chaîne vide.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

La suppression du contenu, la coupe et l’effacement de la mise en forme ne suppriment pas la couleur de fond. La fusion utilise la couleur de la cellule supérieure gauche ; la division donne la même couleur aux cellules nouvellement créées. Les nouvelles lignes et colonnes commencent avec le fond par défaut. Les changements de couleur de fond peuvent être annulés et rétablis.

## Aligner le contenu des cellules et le tableau

Lorsque le curseur est dans une cellule, l’alignement s’applique à ses paragraphes ou images. Si plusieurs cellules sont sélectionnées, il s’applique à tous leurs paragraphes et objets alignables, à l’exception du code. L’état des outils de titre, d’alignement et de lettrine suit également les paragraphes internes réellement sélectionnés. Des valeurs différentes parmi ces paragraphes ne sont pas affichées comme une valeur unique.

Pour aligner le tableau lui-même, cliquez sur **Sélectionner le tableau** dans les outils de propriétés, puis utilisez les boutons d’alignement de la barre principale. Le même alignement est disponible lorsque le curseur est placé avant ou après le paragraphe qui enveloppe le tableau et qu’une bordure pointillée apparaît. Cette bordure indique seulement la cible ; elle ne transforme pas le curseur en sélection du tableau entier.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

L’ajout et la suppression de lignes et de colonnes, la fusion et la division agissent sur les cellules sélectionnées. La fusion conserve les blocs de chaque cellule dans l’ordre des lignes. La division laisse le contenu dans la cellule d’origine et les autres cellules vides.

## Copier et enregistrer

Copier plusieurs cellules sélectionnées copie la plage rectangulaire visible jusqu’à la dernière cellule incluse. Le HTML et le format interne du presse-papiers conservent les cellules vides, les fusions, les blocs, la mise en forme du texte et les couleurs de fond. Le texte brut sépare les cellules par des tabulations et des sauts de ligne, tout en conservant les sauts de ligne entre blocs d’une cellule et les URL des images et vidéos. Couper vide uniquement le contenu des cellules sélectionnées et peut être annulé en une seule fois.

Lorsque le curseur est avant ou après un tableau et que la bordure pointillée apparaît, copier et couper concernent tout le paragraphe qui enveloppe le tableau. La coupe supprime le paragraphe et le tableau une fois l’écriture dans le presse-papiers réussie. Couper ou supprimer un tableau dans une zone flottante laisse la zone flottante extérieure en place.

L’enregistrement en JSON ou HTML conserve les blocs et les couleurs de fond des cellules. Les tableaux simples sont exportés en tableaux Markdown ; ceux qui contiennent plusieurs blocs ou des couleurs de fond restent en HTML pour préserver leur contenu. En HTML, le nom de la couleur est stocké dans l’attribut `data-nabi-cell-color` de `td` ou `th`. Les styles de couleur de fond arbitraires provenant d’un HTML externe ne sont pas importés comme couleurs de fond de cellule.

Pour trier les colonnes dans la vue publiée, enregistrez le tableau comme triable et connectez `attachViewer()` depuis `nabi-note/viewer`. Les tableaux avec des cellules fusionnées sont exclus du tri des colonnes.

## Styles CSS

Utilisez `.nabi-content table` pour les tableaux et `.nabi-content :is(th, td)` pour les cellules. Appliquez les bandes alternées et les fonds d’en-tête uniquement aux cellules sans couleur afin de ne pas remplacer les couleurs de fond définies.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Modifiez les couleurs de fond elles-mêmes avec les variables CSS portant le nom des couleurs, comme `--nabi-cell-yellow`. Chargez le CSS ci-dessous après celui du paquet et attribuez directement la classe `table-note` ainsi que la valeur `data-nabi-theme` du thème courant à l’élément `.nabi` de l’éditeur ou à l’élément `.nabi-content` de la vue publiée.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Si le viewer est connecté, conservez le bouton `.nabi-sort`. Forcer le remplacement de `position` ou du padding droit des cellules peut provoquer un chevauchement avec le bouton de tri.
