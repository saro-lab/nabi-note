---
title: Touches, transformations automatiques, collage
description: Interceptez les touches avec onKey, bâtissez une mise en forme à la seule frappe avec inputRules, et touchez l'écran avec attach.
---

# Touches, transformations automatiques, collage

Une wing a trois portes sur ce que fait la personne — **les touches** (`onKey`), **la frappe**
(`inputRules`), et **l'écran** (`attach`).

---

## Le chemin que parcourt une touche

Appuyez une fois sur <kbd>Entrée</kbd> et elle est proposée dans cet ordre. Qui la prend en
premier termine le trajet.

```
① Raccourcis de la barre d'outils   entendus partout (Ctrl+B, par exemple)
② Transformations automatiques      inputRules — Entrée et Espace seulement
③ L'onKey de la wing                au propriétaire de l'endroit où se trouve le caret
④ Viser un bloc                     retour arrière tout au début d'un paragraphe → sélectionne le bloc précédent en entier
⑤ Règles du cœur                    fendre les paragraphes, supprimer, déplacer le caret
⑥ Le navigateur                     seulement si personne au-dessus ne l'a prise
```

---

## `onKey` — intercepter une touche

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // pas mon affaire — je la rends au cœur
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // retour arrière tout au début du premier emplacement — déplie la note
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| Argument | Ce que c'est |
|---|---|
| `intent` | `{ key, dir? }` — quelle touche |
| `doc` · `sel` · `env` | les trois mêmes qu'une commande reçoit |
| `owner` | `{ path, node }` — **le nœud dont j'ai été choisi propriétaire** |

La réponse est le même `{ doc, selection }` qu'une commande renvoie, ou **`null`**. `null`
signifie « je ne la prends pas », donc le cœur continue — chaque fois que vos conditions ne sont
pas remplies, vous devez répondre `null`.

### Quelles touches arrivent

| `intent.key` | Quand |
|---|---|
| `'enter'` | <kbd>Entrée</kbd> **et** <kbd>Maj</kbd>+<kbd>Entrée</kbd>, les deux |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Maj</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | les deux suppressions |
| `'arrow'` | les flèches. La direction est `intent.dir` (`'left'` · `'right'` · `'up'` · `'down'`) |

Les touches de caractère n'arrivent jamais. Le navigateur tape les caractères et le cœur les
écrit.

### Il n'y a exactement qu'un seul propriétaire

Remontez le chemin du caret ; le premier nœud qui n'est pas un paragraphe, et la wing qui
possède ce nœud, en est le propriétaire.

```
caret au chemin [1, 0, 0]                     candidat propriétaire
  [1, 0, 0]  →  p        un paragraphe, donc ignoré
  [1, 0]     →  note     ← le propriétaire
  [1]        →  p (enveloppe)  jamais atteint
```

Donc **c'est le conteneur le plus intérieur qui gagne** — à l'intérieur d'une liste à l'intérieur
d'un tableau, <kbd>Tab</kbd> va à la liste. Une part (`parts`) peut aussi être propriétaire, et
dans ce cas `owner.node` est le nœud de la part tandis que l'`onKey` qui tourne appartient à la
wing qui l'a déclarée. C'est pourquoi la convention est de d'abord brancher sur `owner.node.w`
pour voir laquelle a été choisie.

---

## `inputRules` — bâtir une mise en forme à la seule frappe

C'est ce qui transforme `# ` en titre et `> ` en citation.

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| Champ | |
|---|---|
| `trigger` | `'space'` ou `'enter'` — mesuré au **moment** où cette touche est frappée |
| `pattern` | une expression régulière. `run` reçoit la correspondance |
| `run` | `{ name, args? }` — la commande à exécuter |
| `scope` | `'block'` (par défaut) ou `'word'` |

### `'block'` — remplacer le début d'une ligne

Elle regarde le **début de la ligne** devant le caret. En cas de correspondance, elle supprime ce
préfixe (et le caractère déclencheur) et exécute la commande.

Elle ne se déclenche que sur la **première ligne** d'un paragraphe. Sur une ligne atteinte par
<kbd>Maj</kbd>+<kbd>Entrée</kbd>, elle ne se déclenche pas — cela empêche une mise en forme de
surgir au milieu d'une prose déjà en train de s'écrire.

### `'word'` — poser une marque sur un seul mot

Elle regarde le **seul mot** devant le caret. En cas de correspondance, elle sélectionne ce mot,
exécute la commande, et replace le caret où il était. Aucun texte n'est supprimé — c'est la forme
pour les règles qui posent une marque.

---

## `attach` — toucher l'écran

Il arrive que le travail ne soit pas de modifier le document mais d'écouter **ce qui se passe à
l'écran** — sélectionner des cellules de tableau par glisser, colorer du code, cliquer sur le
triangle d'un bloc dépliant.

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // répondez avec une fonction de démontage
}
```

`host` vous donne trois choses.

| | |
|---|---|
| `host.root` | l'élément de la surface d'édition |
| `host.nabi` | l'éditeur. Modifier le document se fait **par des commandes** |
| `host.pathOfKey(id)` | transforme un `data-key` de l'écran en chemin dans le document |

`mountSurface` attache l'`attach` de chaque wing enregistrée en même temps que lui-même, et
appelle les fonctions de démontage que vous avez renvoyées quand il redescend.

::: tip Retrouver le document par `data-key`
L'assemblage de l'éditeur (`getEditorHtml()`) marque chaque nœud d'un `data-key`. Trouvez le
`[data-key]` le plus proche de l'élément cliqué et donnez-le à `host.pathOfKey()` pour obtenir la
place dans le document.
:::

---

## Le collage et le pipeline d'analyse HTML

Le collage, `setHtml()` et le chargement du HTML initial passent tous par le même pipeline
d'analyse et de normalisation.

```
collage        ─→ filtres IO ─→ fenêtre de choix du format (si deux candidats ou plus) ─┐
setHtml        ──────────────────────────────────────────────────────────────────────────┼→ analyse HTML → le claim des wings → correspondance de balises par défaut du cœur → repair → cocoon → arbre nabi
HTML initial   ──────────────────────────────────────────────────────────────────────────┘
```

- **`setHtml()` et le chargement du HTML initial ne passent pas par la fenêtre de choix** — ils
  vont directement au pipeline d'analyse.
- Lors d'un collage depuis le presse-papiers, la fenêtre de choix du format n'apparaît que s'il y
  a deux candidats ou plus ; l'analyse réelle (`claim`) n'a lieu qu'après que la personne a choisi
  un format.
- Une balise étrangère pour laquelle aucune wing ne définit `claim` est retirée en toute sécurité
  — seul le texte à l'intérieur est conservé.

---

## Documents suivants

- [Interface et actions](../custom/ui) — les boutons de barre d'outils et la ligne contextuelle
- [Brancher un filtre IO](../custom#brancher-un-filtre-io) — le point d'extension pour le collage, l'enregistrement et l'ouverture
- [Écrire une marque en ligne](../custom/inline) · [Blocs et attributs de paragraphe](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
