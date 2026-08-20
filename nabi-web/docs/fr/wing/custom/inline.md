---
title: Écrire une marque en ligne
description: place 'mark' — une mise en forme posée sur des caractères. Vous écrivez ensemble le chemin de sortie (toHtml) et le chemin d'entrée (claim).
---

# Écrire une marque en ligne

`place: 'mark'` est **une mise en forme posée sur des caractères**. Elle ne prend aucune place à
elle, ne casse pas le flux du texte, et les marques peuvent se superposer — le gras, l'italique et
le surlignage sont tous de cette sorte.

---

## Une marque avec tout rempli

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { fr: 'Touche' },
      shortcut: 'K',
      action: { kind: 'mark' },        // le cœur fait basculer tout seul — pas de commande nécessaire
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Ce que `simpleMark` remplit pour vous, ce sont deux choses : `place: 'mark'` et
`escapeKeys: ['Escape']`. Tout le reste passe sans y toucher.

---

## Les deux directions s'écrivent séparément

| | Direction | Sans elle |
|---|---|---|
| `toHtml` | document → HTML | **L'enregistrement meurt.** Une wing qui érige un nœud doit avoir un moyen de le dessiner |
| `claim` | HTML → document | Elle se dessine, mais **ne peut pas être relue.** Enregistrez puis rechargez et l'enveloppe est retirée |

Les six marques de base (`b`, `i`, `u`, `s`, `sub`, `sup`) et les quatre marques de valeur (`hl`,
`tc`, `fs`, `tf`) sont des balises que **le cœur connaît déjà.** C'est pourquoi `boldWing` ne
porte ni `toHtml` ni `claim`. Un nom que vous inventez est inconnu du cœur, donc vous écrivez les
deux.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| Argument | Ce que c'est |
|---|---|
| `node` | Le nœud tel qu'il est. Les attributs sortent de `node.a?.['clé']` |
| `children()` | Le texte dessiné de l'intérieur. **Ça dessine quand c'est appelé**, donc laissez-le sans appel et l'intérieur ne sort jamais |
| `ctx` | Les outils pour bâtir en sécurité |

Ce que `ctx` vous donne :

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | Bâtit un seul morceau. Les valeurs sont échappées pour vous |
| `ctx.escape(text)` | N'échappe que le texte |
| `ctx.url(raw)` · `ctx.src(raw)` | Filtre une adresse. Une adresse à laquelle on ne peut pas faire confiance est **`null`** |
| `ctx.keys` | Si ce rendu est celui de **l'éditeur** (`getEditorHtml()`) |

::: warning Ne concaténez jamais la chaîne vous-même
Écrire `` `<kbd>${node.a?.['t']}</kbd>` `` fait que le texte dans le document devient du
balisage tel quel. Passez toujours par `ctx.element` ou `ctx.escape`.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — l'élément exactement comme il est arrivé |
| `inner(block)` | Lit l'intérieur. Pour une marque, `false` (une place pour des caractères), pour un bloc, `true` |
| Réponse | Un tableau de nœuds, ou **`null`** (pas à moi → à la wing suivante) |

Les wings sont interrogées dans l'ordre du tableau et **la première à lever la main** l'obtient.

Il y a deux endroits où répondre `null` — quand ce n'est pas ma balise, et **quand c'est ma
balise mais que la valeur est hors liste.** Répondre `inner(false)` dans le second cas ne retire
que l'enveloppe et garde le texte vivant.

---

## Une marque qui porte une valeur

Pour une marque qui **choisit une valeur dans une liste fixe**, comme une couleur ou une taille,
utilisez `valueMark`.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // le champ d'attribut où vit la valeur
    values: [...LEVELS],             // rien en dehors de ceci n'est accepté
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // hors liste — on ne garde que le texte
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

Deux choses que `valueMark` pose pour vous :

- **`currentValue`** — la valeur là où le caret se trouve maintenant. La barre d'outils et la
  ligne contextuelle peignent quel emplacement est actif d'après cette réponse.
- **`repair`** — revérifie la valeur à la porte du JSON. Hors liste ou absente, elle répond
  `null` et **retire le nœud, enveloppe comprise.** Une valeur enregistrée modifiée à la main est
  attrapée ici même.

::: tip Une commande qui change la valeur
Il n'existe pas encore d'auxiliaire public pour la commande « fixe-la à cette valeur » d'une
marque de valeur. L'`action: { kind: 'mark' }` qui bascule depuis un simple bouton de barre
d'outils fonctionne comme montré, et quand vous avez besoin de choisir une valeur, tournez-vous
vers les quatre marques de valeur d'origine (surlignage, couleur de texte, taille de police,
police) ou étalez leurs déclarations.
:::

---

## `escapeKeys` — sortir d'une marque

Avec le caret à la fin d'une marque, seule la personne sait si le prochain caractère appartient
à l'intérieur ou à l'extérieur. `escapeKeys` est cette porte.

```ts
escapeKeys: ['Escape']    // la valeur par défaut pour simpleMark et valueMark
```

**Le caret ne bouge pas.** Appuyer sur cette touche arme « le prochain caractère tapé sort de
cette marque ». Tapez un caractère et l'armement est dépensé et disparu.

```
<kbd>Ctrl</kbd>(caret)  →  Échap  →  frappe de « + »  →  <kbd>Ctrl</kbd>+
```

Plusieurs wings peuvent réclamer la même touche — l'armement ne prend effet que tant que le caret
est réellement à l'intérieur de cette marque, donc parmi les marques superposées à cet endroit,
seules celles qui correspondent sortent ensemble. <kbd>Échap</kbd> sert aussi à **annuler** un
armement déjà en place.

---

## Les marques ne peuvent pas posséder de touches

Écrivez `onKey` et **ça n'atteint jamais une marque.** Une position de caret est
`{ path, offset }`, et la fin de `path` est **le porteur qui contient les caractères** — une
marque est un nœud en ligne à l'intérieur de ce porteur, donc elle n'apparaît jamais du tout sur
le chemin. Le cœur remonte ce chemin pour décider qui possède une touche, donc il ne rencontre
jamais de marque.

La raison est le chevauchement. Appuyez sur <kbd>Entrée</kbd> à l'intérieur d'un lien à
l'intérieur d'un italique à l'intérieur d'un gras, et il n'y a aucun moyen de dire lequel des
trois la possède. La seule porte qu'une marque a sur les touches est `escapeKeys`.

---

## Documents suivants

- [Blocs et attributs de paragraphe](../custom/block) — ce qui prend une place
- [Touches, transformations automatiques, collage](../custom/input) — `onKey` et `inputRules`
- [Interface et actions](../custom/ui) — le bouton de barre d'outils et la ligne contextuelle

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
