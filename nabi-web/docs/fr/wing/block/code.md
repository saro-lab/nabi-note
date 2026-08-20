---
title: Code
---

# Code

## Description

`codeWing` (nom `code`) est propriétaire du bloc de code (`<pre>`) et c'est une **constante** —
elle ne s'appelle pas avec des parenthèses.

C'est un container déclaré `holds: 'inline'`, et son `repair` aplatit en texte brut tout ce qui y
entre — aucune marque et aucune autre wing ne survit à l'intérieur. Ce n'est pas un champ à part
dans le contrat, c'est la wing qui remet elle-même son intérieur en ordre.

Tapez ` ``` ` sur une ligne vide et appuyez sur espace ou sur Entrée, et cela devient un bloc de
code — écrivez un langage à la suite, comme dans ` ```ts `, et le langage est capté aussi.
`Tab` / `Shift+Tab` indentent et désindentent des lignes (toutes ensemble, si plusieurs sont
sélectionnées). Entrée reprend l'indentation de la ligne au-dessus.

La ligne contextuelle n'apparaît que tant que le caret est à l'intérieur du code — un champ de
saisie pour taper le langage soi-même, un bouton « aucun langage » qui ne montre que quand un
langage est fixé, et un bouton par langage couramment utilisé.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Cette liste n'est qu'un **raccourci** — ce n'est pas la liste des langages que connaît le cœur.
Un langage absent de cette liste se tape directement dans le champ, et la valeur passe telle
quelle jusqu'au surligneur.

## La coloration se branche sur la wing

`highlight` est un crochet qui **renvoie des sortes, pas des couleurs** — sa forme est
`(source, langage) => {text, type?}[]`, et `type` est fixé à l'une des quatorze de
`CODE_TOKEN_TYPES` : `keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`,
`operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta`.

Les couleurs sont fixées directement par la feuille du cœur, via des sélecteurs
`[data-nabi-token="…"]`, et **seules cinq d'entre elles sont colorées** (`comment`, `string`,
`keyword`, `number`, `literal`). Les autres reçoivent l'attribut mais aucune règle de couleur,
donc elles sortent dans la couleur du corps du texte. Les valeurs sont des couleurs fixes plutôt
que des variables CSS, donc redéfinissez vous-même le sélecteur pour une autre palette ou une
variante sombre.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Les grammaires elles-mêmes ne sont pas dans le paquet — vous apportez les vôtres, comme Prism,
highlight.js ou Shiki.

Le côté qui colore se pose **sur la wing**, pas dans un mount séparé. Bâtissez un `attach` avec
`makeCodeAttach` et échangez-le sur la wing code, et `mountSurface` le branche avec l'`attach` de
chaque autre wing enregistrée. La démo de ce site est un exemple de Shiki branché ainsi
(`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// La wing est une constante — seul ce qui s'attache est échangé
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

Passez aussi `version` et cela redessine **quand le document est inchangé mais que le côté
coloration a changé.** C'est le cas d'un surligneur qui va chercher les grammaires de façon
asynchrone (Shiki le fait, la première fois qu'il rencontre un langage) : la grammaire arrive
mais le document n'a pas changé, donc `onChange` ne se déclenche jamais, et sans ceci il faudrait
taper un caractère de plus pour voir les couleurs arriver.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// quand la grammaire arrive en retard — augmentez le nombre et ça redessine
grammarAge += 1
```

La valeur enregistrée suit la convention extérieure — `<pre data-nabi-lang="ts"><code
class="language-ts">`, les couleurs sortant comme des attributs `data-nabi-token` (pas comme un
`style` en ligne).

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
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
