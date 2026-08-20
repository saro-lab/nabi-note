---
title: Fabriquer sa propre wing
description: Si une mise en forme manque, fabriquez une wing — remplissez un seul contrat et le cœur fait le reste.
---

# Fabriquer sa propre wing

Une wing est **un seul objet**. Il n'y a aucune classe à étendre ni aucune cérémonie
d'enregistrement — la mettre dans le tableau donné à `createNabiWith`, c'est déjà
l'enregistrement.

Le gras, les tableaux et l'upload sont bâtis en remplissant exactement les mêmes champs que ceux
listés ici. Une wing que vous écrivez vous-même tourne dans **exactement les mêmes conditions**
qu'une wing d'origine — il n'existe aucun raccourci réservé au cœur.

---

## La plus petite wing

Une marque en ligne qui connaît `<kbd>`.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // le nom de cette wing — c'est le `w` de la valeur enregistrée
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // le chemin de sortie
  }),
  // se déclare propriétaire de `<kbd>` dans le HTML entrant
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Maintenant `<kbd>` reste dans le document. Il survit au collage, à `setHtml()`, à
l'enregistrement et au rechargement.

```
enregistrée      <p>Appuyez : <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   inchangé
non enregistrée  <p>Appuyez : <kbd>Ctrl</kbd></p>                →   <p>Appuyez : Ctrl</p>
```

**Les deux champs regardent dans des directions opposées.** `toHtml` est le chemin de sortie et
`claim` le chemin d'entrée. Oubliez `claim` et cela se dessine très bien mais **ne peut pas être
relu** — l'enveloppe se retire au moment même où vous enregistrez puis rechargez.

`simpleMark` est un raccourci pour les marques sans attribut. Pour une marque qui porte une
valeur, il y a `valueMark` ; pour un bloc, `boxObject` ; pour une famille de liste, `listFamily` —
et au-delà de cela, vous écrivez l'objet `Wing` à la main.

---

## Les wings sont des constantes

**La plupart des wings sont déjà des constantes toutes faites** — `boldWing` et `headingWing`
vont directement dans le tableau. Seules les deux qui ont besoin d'options ont une fonction
fabrique.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Pour ne changer que « la partie qui s'attache », étalez la constante — vous changez un champ
plutôt que de bâtir une nouvelle wing, ce qui est le plus simple des deux.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Enregistrement et ordre

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**L'ordre du tableau est l'ordre de balayage.** Pour décider qui possède un morceau de balisage
(`claim`), le cœur interroge dans cet ordre et la première wing qui répond l'obtient. Si
personne ne la réclame, l'enveloppe est retirée.

Dans la barre d'outils, c'est le **groupe (`button.group`) qui vient en premier**. L'ordre des
groupes est fixé, et cet ordre du tableau ne décide que l'ordre d'affichage *à l'intérieur* d'un
groupe.

### Ça meurt exactement là où on l'enregistre

`createNabiWith` **lève immédiatement une exception** sur une wing qui rompt le contrat. Ça
n'explose jamais plus tard.

| Ce qui est attrapé | Exemple |
|---|---|
| Un mot réservé utilisé comme nom | `w: 'p'` · `w: 'br'` |
| Le même nom enregistré deux fois | `boldWing` deux fois |
| Une wing qui érige un nœud sans `toHtml` | `place: 'mark'` sans moyen de le dessiner |
| Un nom de commande qui rompt la règle | il doit être en camelCase verbe+objet (`insertTable`) |
| Un partenaire requis manquant | upload a besoin de `img` ou `a` à ses côtés (`requiresAnyOf`) |

---

## Les commandes sont des fonctions pures

Tout chemin qui modifie le document passe par une seule commande. Une commande **ne connaît ni
le DOM ni l'écran.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // ça vient de l'extérieur, donc on vérifie — si ça ne colle pas, on ne fait rien
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { fr: 'Tampon' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'OK' } },
  },
}
```

| Argument | Ce que c'est |
|---|---|
| `doc` | Le document tel qu'il est (un tableau de blocs). **Ne le modifiez pas — répondez-en un nouveau** |
| `sel` | La sélection telle qu'elle est |
| `args` | Ce que le bouton ou la ligne contextuelle ont transmis. **Ça vient de l'extérieur, donc il faut le vérifier** |
| `env` | La connaissance des sortes — ce qui contient quoi, et ce qui est un bloc |

La réponse est `{ doc, selection }` ou **`null`**. **Répondez `null` quand rien ne change** —
alors `applyCommand` répond `false` et aucun point d'annulation ne s'empile. Le document que
vous répondez est retoilé une fois de plus par `cocoon`, donc aucune commande ne peut laisser
derrière elle un document qui brise les règles.

Celui qui appelle passe toujours par le nom.

```ts
nabi.applyCommand('insertStamp', { text: 'OK' })   // boolean
```

---

## Tous les champs que vous pouvez remplir

`Wing` a vingt-cinq champs et **seuls deux sont requis** (`w` et `place`).

### Ce que c'est

| Champ | Sens |
|---|---|
| `w` | Le nom de cette wing. Il devient le `w` de la valeur enregistrée. Les mots réservés (`p`, `br`) ne sont pas permis |
| `place` | `'mark'` sur des caractères · `'void'` un bloc sans intérieur · `'container'` un bloc avec du texte à l'intérieur · `'attr'` un attribut de paragraphe · `'tool'` un outil qui ne laisse aucune trace dans le document |
| `holds` | Comment il contient son intérieur — `'blocks'` ou `'inline'` |
| `singleParagraph` | L'intérieur est fixé à **un seul** paragraphe (une cellule de tableau) |
| `boolAttrs` | Noms des attributs booléens dont la seule valeur est `1` |
| `allows` | Les noms de wings permis à l'intérieur. Non précisé, tout est permis |
| `requiresAnyOf` | L'une de celles-ci doit être enregistrée à ses côtés |
| `parts` | Structure sans bouton amenée avec elle — les lignes et cellules d'un tableau, le résumé d'un bloc dépliant |

### Valeurs

| Champ | Sens |
|---|---|
| `attrKey` · `attrValues` | Le nom du champ où écrit un attribut de paragraphe, et les valeurs qu'il accepte |
| `currentValue` | Est-ce actif en ce moment — la barre d'outils et la ligne contextuelle peignent leur emplacement d'après cette réponse |

### Les chemins d'entrée et de sortie

| Champ | Sens |
|---|---|
| `toHtml` · `partHtml` | Le chemin de sortie |
| `claim` | Décide qui possède cette balise dans le HTML entrant |
| `repair` · `partRepair` | Remet ce nœud en ordre à la porte du JSON. Répondre `null` le retire, enveloppe comprise |

### Mains et touches

| Champ | Sens |
|---|---|
| `commands` | Les commandes que pose cette wing |
| `onKey` | Intercepte les touches en premier tant que le caret est à l'intérieur du nœud de cette wing |
| `escapeKeys` | Touches qui font sortir de cette marque le prochain caractère tapé |
| `inputRules` | Conversion automatique déclenchée par la seule frappe |
| `attach` | Pour quand il faut toucher à l'écran — le glisser d'une cellule de tableau, la coloration du code |

### L'allure

| Champ | Sens |
|---|---|
| `button` · `buttons` | Un bouton de barre d'outils, ou plusieurs |
| `context` | La déclaration de la ligne contextuelle |
| `styles` | Le CSS que porte cette wing |

---

## `w` — lui donner un nom

`w` est **une chaîne qui se répète sur chaque nœud de la valeur enregistrée**. Plus court vaut
mieux — c'est pourquoi les wings d'origine ont des noms aussi courts que `b`, `hl` et `tf`. Mais
une collision avec le nom de quelqu'un d'autre tue l'enregistrement, donc donnez à celle que vous
écrivez un nom assez long pour ne pas entrer en collision, même s'il est un peu plus long.

Il n'a pas besoin de correspondre au nom de la balise HTML — la balise de sortie est décidée par
`toHtml`.

::: warning Le renommer plus tard
Le `w` de la valeur enregistrée *est* ce nom, donc le renommer signifie que **les documents déjà
enregistrés ne peuvent plus être lus.** Si vous devez le faire, continuez à accepter l'ancien nom
via `claim` en parallèle pendant une période de transition.
:::

---

## Documents suivants

- [Marques en ligne](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Blocs et attributs de paragraphe](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Touches, transformations automatiques, collage](./custom/input) — `onKey` · `inputRules` · `attach`
- [Interface et actions](./custom/ui) — `button` · `context` · `styles`, et s'adresser à la personne

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
