---
title: Interface et actions
description: Les boutons de barre d'outils (button), la ligne contextuelle (context), les feuilles de style (styles) — les trois endroits où une wing se présente devant une personne.
---

# Interface et actions

Il y a trois endroits où une wing se présente devant une personne.

| Champ | Où |
|---|---|
| `button` · `buttons` | la **barre d'outils** en haut — l'endroit toujours visible |
| `context` | la **ligne contextuelle** — l'endroit qui n'apparaît que pour ce que touche le caret |
| `styles` | le **CSS** que porte cette wing |

---

## Les boutons de la barre d'outils

```ts
button: {
  group: 'emphasis',                   // dans quel groupe il se tient — requis
  svg: '<path d="…"/>',                // l'intérieur sur une grille 16×16. Sans cela, il se tient en texte
  label: { fr: 'Gras' },
  shortcut: 'B',                       // cette lettre en mode indice
  accelerator: 'mod+b',                // la combinaison Ctrl/⌘
  action: { kind: 'mark' },
}
```

Pour plusieurs boutons, écrivez un tableau dans `buttons` — c'est ainsi qu'une seule wing
d'alignement se dresse à gauche, au centre et à droite. Alors `name` les distingue et `value` dit
quelle valeur chacun représente.

### `group` — le groupe décide de l'ordre

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**Cet ordre est fixé.** Où que vous mettiez une wing dans le tableau, son bouton se tient à la
place de son groupe. L'ordre d'enregistrement ne range les choses qu'**à l'intérieur** d'un
groupe. Utilisez un nom hors de cette liste et un nouveau groupe apparaît tout à la fin.

Quand un groupe se vide entièrement (tous ses boutons cachés), ce groupe disparaît de l'écran —
aucun séparateur vide ne reste derrière.

### `action` — ce qui se passe quand on appuie

| `kind` | Ce que ça fait | Ce qui va avec |
|---|---|---|
| `'mark'` | va au bascule de marque du cœur. **Vous n'avez pas besoin d'écrire de commande** | — |
| `'command'` | exécute une commande | `command` · `args?` |
| `'menu'` | ouvre une liste de valeurs en panneau | `command` · `argKey` · `values` |
| `'grid'` | ouvre une grille lignes×colonnes (insérer un tableau) | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | lève des champs de saisie et transmet ce qui revient à la commande | `command` · `fields` |
| `'file'` | ouvre le sélecteur de fichier | `accept?` · `multiple?` |
| `'host'` | transmet à l'hôte (`onHost` de `mountToolbar`) | — |

Omettez `action` et appuyer sur le bouton ne fait rien du tout.

### `shortcut` et `accelerator`

| | Forme | Règle |
|---|---|---|
| `shortcut` | `'B'` | **une seule lettre latine majuscule ou un chiffre** |
| `accelerator` | `'mod+b'` | `mod+` suivi d'**une seule lettre minuscule** |

Les deux **tuent l'enregistrement si deux wings entrent en collision.** Aucune des deux ne cesse
tranquillement de fonctionner plus tard.

Écrivez un `accelerated` séparé et l'accélérateur fait quelque chose de différent — le bouton
ouvre un panneau tandis que <kbd>Ctrl</kbd>+touche applique la valeur par défaut directement, par
exemple.

---

## Comment un bouton a l'air enfoncé

Il n'y a qu'une seule base pour peindre un bouton « actif en ce moment ».

| `place` | Ce qu'il lit |
|---|---|
| `'mark'` | cette marque est-elle au caret |
| `'attr'` | le `currentValue` du paragraphe où se tient le caret |
| `'container'` · `'void'` | le caret est-il à l'intérieur ou sur ce bloc |
| `'tool'` | **toujours éteint** |

Une wing à plusieurs valeurs (alignement, titres) écrit un `value` sur chaque bouton, et seul le
bouton qui correspond à ce qu'a répondu le `currentValue` de la wing est peint.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` répond une chaîne** — même une valeur numérique repasse par `String()`.
`undefined` signifie « ce nœud ne porte aucune valeur qui soit la mienne ».

---

## Les boutons se cachent tout seuls là où ils ne peuvent pas se tenir

| `place` | Quand il se cache |
|---|---|
| `'mark'` | dans un endroit où seul du texte vit (à l'intérieur d'une boîte de code, par exemple), quand il possède cet endroit |
| `'attr'` | quand le caret est sur un paragraphe enveloppe qui porte un bloc. **L'alignement (`a`) est la seule exception** |
| `'void'` · `'container'` | dans un endroit où seul du texte vit, ou quand l'`allows` du conteneur actuel ne l'accepte pas |
| `'tool'` | ne se cache jamais |

L'alignement est l'exception pour la raison vue plus tôt — l'alignement d'un bloc n'est pas porté
par le bloc mais par le paragraphe enveloppe autour de lui. Il faut pouvoir appuyer sur « centrer »
en se tenant sur une image.

Écrivez `allows` et **la barre d'outils suit toute seule.** Le bouton de tableau qui disparaît à
l'intérieur d'une boîte de code n'est pas une règle écrite à part ; elle découle de ce seul champ.

---

## La ligne contextuelle

La ligne qui n'apparaît que pour ce que le caret touche en ce moment. Cliquez sur une image et le
contrôle de taille est là ; posez le caret dans un lien et la boîte d'adresse est là.

```ts
context: {
  title: { fr: 'Note' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { fr: 'Ton' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // l'emplacement d'attribut où lire la valeur actuelle
      values: [
        { value: 'info', label: { fr: 'Info' } },
        { value: 'warn', label: { fr: 'Avertissement' } },
      ],
    },
  ],
}
```

### Quand elle apparaît

**Tout ce que le caret touche** ouvre sa propre ligne.

- les conteneurs sur le chemin du caret (le plus intérieur d'abord, le plus extérieur en dernier)
- le bloc visé (une image sélectionnée alors qu'on est sur son paragraphe enveloppe, par exemple)
- les **marques** au caret — contrairement aux boutons de la barre d'outils, les marques ont bien
  une ligne contextuelle
- une wing d'**attribut de paragraphe** dont le paragraphe du caret porte la valeur

Posez le caret dans un lien à l'intérieur d'un tableau et la ligne du lien et la ligne du tableau
apparaissent ensemble.

### Les sept sortes de `ContextControl`

| `kind` | Quoi | Ce qui va avec |
|---|---|---|
| `'button'` | un appui, une commande | `command` · `args?` |
| `'toggle'` | deux états, allumé et éteint | `command` · `token` |
| `'select'` | un parmi une liste | `command` · `argKey` · `values` · `attr?` |
| `'range'` | glisser sur une échelle (redimensionner) | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | un seul champ de texte (une adresse de lien) | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | plusieurs champs en panneau | `command` · `fields` |
| `'lightbox'` | voir en grand | `src` · `alt?` |

Les sept partagent `name` (requis) · `label?` · `svg?` · `tip?` · `visible?`.

`visible: (node) => boolean` est la porte pour **cacher un contrôle au sein d'une même wing** —
ne montrer « défusionner » que sur des cellules déjà fusionnées, par exemple.

Écrivez `attr` et la valeur actuelle est lue directement dans cet emplacement d'attribut pour la
peindre. `'toggle'` utilise `token` pour comparer à la chaîne que `currentValue` a répondue.

---

## `styles` — le CSS que porte une wing

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

Quatre règles.

- **Confinez tout sous `.nabi-content`.** Ça ne doit jamais déborder sur le reste de la page
  hôte.
- **Écrivez les tailles de texte en `rem` ou en `em`.**
- **Distinguez le sombre uniquement par la classe `.dark`.** Le faire par une media query ferait
  passer l'éditeur seul en sombre sur un hôte qui a choisi le clair.
- **Mesurez large et étroit par une container query.** L'étalon est la largeur de l'endroit où se
  trouve l'éditeur, pas la largeur de l'écran.

Si vous ne voulez que ce que vous avez enregistré, rassemblez et injectez les feuilles vous-même.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

Une feuille au même texte n'est chargée **qu'une fois** — plusieurs wings peuvent partager le
même CSS et une seule copie atterrit dans le document. La réponse est une fonction de démontage,
et elle ne retire que **ce que cet appel a nouvellement ajouté**.

---

## S'adresser à la personne

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` accepte un `boolean` ou une `Promise<boolean>` — branchez le `confirm` du navigateur
lui-même, ou levez votre propre panneau et répondez plus tard.

::: warning Sans elle, la réponse est toujours « non »
Ne fournissez aucun `ask` et une valeur par défaut silencieuse entre en jeu. `message` ne va nulle
part et `confirm` répond `false`. Le raisonnement est qu'**un « demander puis supprimer » qui ne
fonctionne tranquillement pas** vaut mieux que le voir arriver tranquillement. Le « vraiment
supprimer ceci ? » de l'historique local passe par cette porte.
:::

::: tip Les commandes ne peuvent pas demander
Une commande est une fonction pure ; elle ne connaît ni l'écran ni le temps. Demandez en dehors de
la commande et appelez la commande **une fois la réponse obtenue**. À l'intérieur d'une wing,
l'endroit pour cela est `attach`, où vous l'atteignez par `host.nabi.$ask`.
:::

---

## Documents suivants

- [Écrire une marque en ligne](../custom/inline) · [Blocs et attributs de paragraphe](../custom/block) ·
  [Touches, transformations automatiques, collage](../custom/input)
- [Thème et variables CSS](../../style/custom) — les noms de variables qu'attendent les feuilles

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
