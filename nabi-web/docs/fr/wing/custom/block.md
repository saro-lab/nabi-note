---
title: Fabriquer des blocs et des attributs de paragraphe
description: void, container, attr — bâtir ce qui prend une place. Un bloc vit toujours dans un paragraphe enveloppe.
---

# Fabriquer des blocs et des attributs de paragraphe

Ce qui prend une place se répartit en trois sortes.

| `place` | Quoi | Exemple |
|---|---|---|
| `'void'` | **Un bloc sans intérieur.** Le caret ne peut pas y entrer | séparateur, image, YouTube |
| `'container'` | **Un bloc avec du texte à l'intérieur** | citation, bloc dépliant, tableau, liste, code |
| `'attr'` | Une valeur posée sur le paragraphe lui-même. N'érige aucun nœud | titre, alignement, lettrine |

---

## Un bloc vit dans un paragraphe enveloppe

Le document est **un tableau de blocs**, et la seule chose qui puisse se tenir au niveau
supérieur est un paragraphe (`p`). Un bloc ne se tient jamais directement au niveau supérieur —
il porte **un paragraphe qui ne contient que lui** et se tient dans celui-ci.

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

Ce paragraphe est le **paragraphe enveloppe**, et il se dessine à l'écran en
`<div data-nabi-p>`.

Il y a deux raisons à cela. Il y a toujours une place où le caret peut se tenir avant et après le
bloc (parce qu'un paragraphe s'y trouve toujours), et **le bloc reçoit tel quel les attributs de
paragraphe comme l'alignement** — une « image centrée » est précisément « une image à l'intérieur
d'un paragraphe centré ».

---

## Bâtir un bloc sans intérieur

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { fr: 'Étoile' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` pose le paragraphe enveloppe pour vous.

```
<div data-nabi-p><hr data-nabi-star/></div>
```

Appelez-la sur un paragraphe vide et elle **prend la place de ce paragraphe** — vous ne vous
retrouvez pas avec une ligne vide à chaque insertion. Et tout alignement que ce paragraphe portait
déjà survit intact.

Ce que `boxObject` remplit pour vous, c'est `place: 'void'` et **les vérificateurs
d'attributs**.

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // les valeurs hors liste sont écartées
  requires: ['c'],                                                 // sans elle, ce bloc ne se tient pas
  toHtml: /* … */,
})
```

Un attribut que vous n'avez pas listé dans `attrs` est **un champ inconnu et il est écarté en
bloc.** Il n'existe aucune place où une valeur hors contrat pourrait se glisser dans la valeur
enregistrée.

---

## Bâtir un bloc avec un intérieur

`place: 'container'` doit toujours porter `holds` à ses côtés — l'omettre tue l'enregistrement.

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // des paragraphes vivent à l'intérieur ('inline' ne serait que des caractères)
  allows: ['p'],                    // ce qui peut entrer ici
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { fr: 'Note' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` est un **bascule**. Il enveloppe dans ce conteneur les blocs de niveau supérieur
couverts par la sélection, et s'ils sont déjà tous enveloppés, il déplie l'intérieur à leur place.

```
avant            [p"première ligne", p"seconde"]
après             [p[ note[ p"première ligne", p"seconde" ] ]]
appuyé à nouveau  [p"première ligne", p"seconde"]
```

### `holds`

| | Ce qui vit à l'intérieur | Exemple |
|---|---|---|
| `'blocks'` | Des paragraphes et d'autres blocs | citation, bloc dépliant, une cellule de tableau |
| `'inline'` | Seulement des caractères et des marques | un résumé de bloc dépliant, le code |

### `allows`

Écrivez-le et **rien d'autre ne peut entrer.** Le cœur pose son propre nettoyeur, donc que ce
soit par collage ou depuis une valeur enregistrée, tout ce qui est hors liste perd son enveloppe
et son texte se dépose dans un paragraphe.

Omettez-le et tout est permis. Mettez un nom inconnu dans `allows` et ça **meurt exactement là où
vous l'enregistrez.**

---

## `parts` — structure interne sans bouton

Une structure qui **ne peut pas se tenir seule et n'a pas de bouton de barre d'outils** — les
lignes et cellules d'un tableau, le résumé d'un bloc dépliant — se déclare comme une part.

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // un attribut dont la seule valeur est 1 — s'il est ouvert
  parts: { summary: { holds: 'inline' } },            // la ligne de résumé
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // chaque part doit avoir un assembleur
  repair: repairDetails,
}
```

Quatre règles.

- **Seuls les containers** ont des parts. Les écrire sur un autre `place` tue l'enregistrement.
- Chaque part doit avoir un `partHtml`. Sans lui, l'enregistrement meurt.
- Le nom d'une part ne peut pas entrer en collision avec un nom de wing ou le nom d'une autre
  part.
- Si une part a besoin d'être remise en ordre, écrivez-le sous le nom de la part dans
  `partRepair`.

`StructureDecl` prend trois choses — `holds`, `singleParagraph` et `boolAttrs`.

### `singleParagraph`

L'intérieur est **fixé à un seul paragraphe**. C'est ce qu'est une cellule de tableau — appuyer
sur <kbd>Entrée</kbd> à l'intérieur d'une cellule ne fend pas le paragraphe en deux, et supprimer
une sélection qui s'étend sur deux cellules ne les fusionne pas. C'est ce seul champ qui garde la
grille intacte.

### `boolAttrs`

Un attribut dont la seule valeur est `1` — le `o` (ouvert) d'un bloc dépliant, le `ck` (coché)
d'une liste de tâches, le `dc` (lettrine) d'un paragraphe. L'état éteint n'est pas `0` mais
**l'absence complète du champ**.

---

## `repair` — la dernière porte à l'entrée de la valeur enregistrée

`repair` remet ce nœud en ordre une fois, **juste avant que le JSON ne devienne un document**.

```ts
repair: (node) => {
  if (!estValide(node)) return null    // null — ce nœud est retiré, enveloppe comprise
  return noeudRemisEnOrdre              // le renvoyer inchangé ne pose pas de problème (le même objet veut dire que rien n'a changé)
}
```

Une valeur enregistrée modifiée à la main, un document venu d'une autre version, un JSON fabriqué
par quelqu'un d'autre — tout cela passe par cette porte. Seul ce qui la franchit devient un
document, ce qui fait de ceci **le seul endroit où une wing peut se porter garante de la forme de
son propre nœud.**

Écrivez `allows` et `repair` ensemble, et le nettoyage d'`allows` tourne **en premier**, son
résultat étant transmis à `repair`.

---

## `requiresAnyOf` — une wing qui a besoin d'un partenaire pour se tenir

```ts
requiresAnyOf: ['img', 'a']
```

Si aucune de celles-ci n'est enregistrée à ses côtés, elle **meurt exactement là où vous
l'enregistrez.** La wing upload utilise ceci — ce qu'elle téléverse doit être érigé comme une
image ou un lien, et sans l'un ou l'autre elle peut téléverser puis ne rien faire du tout.

---

## Les attributs de paragraphe (`place: 'attr'`)

Un attribut de paragraphe n'érige aucun nœud. Il ne fait que poser une valeur sur le `a` du
paragraphe.

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["Un titre 2 centré"] }
```

::: warning Les champs sont fixés à trois
`attrKey` doit être l'un de **`h` (titre) · `a` (alignement) · `dc` (lettrine)**, et tout autre
nom tue l'enregistrement. Dans cette version, **aucun nouvel attribut de paragraphe ne peut être
créé** — les champs d'attribut d'un paragraphe sont fermés aux trois que le cœur connaît.

Pour la même raison, ces trois-là sont déjà pris par `headingWing`, `alignWing` et
`dropCapWing`, ce qui ne laisse pratiquement aucune place pour écrire une nouvelle wing
`place: 'attr'`. Si vous voulez poser une valeur sur chaque paragraphe, envelopper dans un
container est pour l'instant la voie à suivre.
:::

Il y a deux champs pour gérer la valeur.

| | |
|---|---|
| `attrValues` | La liste des valeurs qu'il accepte (pour un titre, `[1,2,3,4,5,6]`) |
| `currentValue` | La valeur que porte ce paragraphe en ce moment. La barre d'outils et la ligne contextuelle peignent l'emplacement enfoncé d'après cette réponse |

---

## Les auxiliaires de document publics

Cette version distribue quatre auxiliaires d'édition.

| | Ce qu'il fait |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | Érige un bloc, paragraphe enveloppe compris |
| `removeLump(doc, topIndex, env)` | Retire d'un coup un paragraphe enveloppe de niveau supérieur |
| `toggleWrap(doc, sel, containerW, env)` | Enveloppe dans un container les blocs couverts, ou les déplie |
| `topNodeAt(doc, path)` | Le nœud de niveau supérieur auquel ce chemin appartient |

Les quatre répondent avec `{ doc, caret }`, donc vous convertissez une fois vers la forme qu'une
commande doit répondre.

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip Si vous avez besoin d'une édition plus fine que ceci
Les auxiliaires internes qui coupent et joignent caractère par caractère (poser une marque,
écrire un attribut de paragraphe, etc.) ne sont pas encore une API publique. En attendant, vous
pouvez reconstruire vous-même le tableau `doc` et répondre avec — le document que vous répondez
est retoilé une fois de plus par `cocoon`, donc un document qui brise les règles ne survit jamais
tel quel.
:::

---

## Documents suivants

- [Touches, transformations automatiques, collage](../custom/input) — `onKey` · `inputRules` · `attach`
- [Interface et actions](../custom/ui) — le bouton de barre d'outils et la ligne contextuelle

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
