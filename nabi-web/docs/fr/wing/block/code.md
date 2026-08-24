---
title: Code
---

# Code

## Description

`codeWing` (id `code`) est un objet wing constant qui gère le bloc de code (`<pre><code>`).

C'est un container `holds: 'inline'`, et son texte est normalisé en texte brut pendant l'étape `repair`, si bien qu'aucune autre marque ni aucune autre wing ne peut s'y imbriquer.

Tapez ` ``` ` sur une ligne vide et appuyez sur espace ou sur Entrée, et cela devient un bloc de code (ajoutez un identifiant de langage à la suite, comme dans ` ```ts `, et ce langage est repris automatiquement). `Tab` et `Shift+Tab` indentent et désindentent les lignes de code, y compris en bloc lorsque plusieurs lignes sont sélectionnées. Appuyer sur Entrée reprend automatiquement la profondeur d'indentation de la ligne précédente.

Tant que le caret est à l'intérieur d'un bloc de code, la barre d'outils contextuelle dynamique s'active et propose un champ pour taper le langage directement, un bouton « Aucun langage » et des boutons de raccourci pour les langages les plus courants :

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Un langage absent de cette liste peut aussi être tapé directement dans le champ de saisie ; la valeur saisie est transmise telle quelle au surligneur syntaxique.

## La coloration se branche sur la wing

`highlight` est une fonction crochet qui reçoit le code source et le langage et renvoie un tableau de jetons : `(source, lang) => { text: string, type?: string }[]`.

Le `type` d'un jeton renvoie l'un des 14 types de jetons standards définis dans `CODE_TOKEN_TYPES` (`keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`, `operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta`).

La feuille de style du cœur attribue des couleurs de thème à cinq types de jetons par défaut (`comment`, `string`, `keyword`, `number`, `literal`) via le sélecteur `[data-nabi-token="…"]`. Pour appliquer un mode sombre ou des couleurs personnalisées, il suffit de redéfinir ce sélecteur CSS.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Pour brancher un surligneur externe comme Shiki ou Prism, utilisez `makeCodeAttach` pour construire le crochet `attach`.

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

Si, comme Shiki, votre surligneur charge ses paquets de grammaire de façon asynchrone, passez l'option `version` pour redessiner l'écran de l'éditeur une fois le chargement de la grammaire terminé :

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight: myHighlighter, version: () => grammarAge }),
}

// une fois le chargement asynchrone de la grammaire du langage terminé
grammarAge += 1
```

La structure HTML enregistrée suit le format standard : `<pre data-nabi-lang="ts"><code class="language-ts">`. Chaque jeton est balisé de façon sûre avec l'attribut `data-nabi-token`.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
