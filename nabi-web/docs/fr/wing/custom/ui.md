---
title: Interface et actions
description: Guide de rattachement des boutons de barre d'outils (button), de la ligne contextuelle (context), des feuilles de style (styles) et des dialogues avec la personne (ask).
---

# Interface et actions

Une wing propose son interface à trois endroits fixes : la **barre d'outils principale** (`button`/`buttons`), la **ligne contextuelle** (`context`) et le **CSS propre à la wing** (`styles`).

---

## Boutons de la barre d'outils (`button` / `buttons`)

```ts
button: {
  group: 'emphasis',                   // dans quel groupe il se tient — requis
  svg: '<path d="…"/>',                // chaîne du path SVG à l'intérieur d'un viewBox 16×16
  label: { fr: 'Gras' },
  shortcut: 'B',                       // cette lettre affichée en mode indice (Shift tapé deux fois)
  accelerator: 'mod+b',                // la combinaison Ctrl/⌘
  action: { kind: 'mark' },            // bascule d'une marque en ligne
}
```

Quand une wing propose plusieurs boutons, définissez-les dans un tableau `buttons` (par exemple, une wing d'alignement de texte proposant trois boutons gauche/centre/droite). Chaque bouton se distingue par `name`, et `value` indique la valeur que ce bouton représente.

### Ordre des groupes de boutons (`group`)

L'ordre d'affichage des groupes de la barre d'outils est fixé ainsi :

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

Où que vous déclariez une wing dans le tableau, son bouton se place automatiquement à la position de son groupe, et au sein d'un même groupe, seul l'ordre d'enregistrement des wings détermine le tri. Indiquer un nom de groupe absent de cette liste ajoute un nouveau groupe à la toute fin de la barre d'outils.

Quand tous les boutons d'un groupe donné sont masqués dans l'état actuel, ce groupe et son séparateur sont automatiquement masqués aussi.

### Types d'action de bouton (`action`)

| `kind` | Effet | Propriétés supplémentaires |
|---|---|---|
| `'mark'` | bascule une marque en ligne (fonctionne via la logique de base du cœur) | — |
| `'command'` | exécute la commande indiquée | `command`, `args?` |
| `'menu'` | affiche un menu déroulant de sélection de valeur | `command`, `argKey`, `values` |
| `'grid'` | affiche un sélecteur de grille lignes×colonnes pour insérer un tableau | `command`, `rowsKey`, `colsKey`, `max?` |
| `'prompt'` | lève une fenêtre de saisie et transmet la valeur saisie à la commande | `command`, `fields` |
| `'file'` | ouvre la boîte de dialogue de sélection de fichier | `accept?`, `multiple?` |
| `'host'` | est transmis au callback de l'hôte (`onHost` de `mountToolbar`) | — |

Un bouton sans `action` défini ne fait rien lorsqu'on clique dessus.

### Raccourcis (`shortcut` et `accelerator`)

| Champ | Forme | Règle |
|---|---|---|
| `shortcut` | `'B'` | **une seule lettre latine majuscule ou un chiffre** |
| `accelerator` | `'mod+b'` | préfixe `mod+` suivi d'**une seule lettre minuscule** |

Si deux wings différentes déclarent le même raccourci, une exception est levée immédiatement à l'initialisation.

L'option `accelerated` permet de faire exécuter une action différente uniquement lorsqu'on déclenche via le raccourci clavier (par exemple : un clic sur le bouton ouvre une fenêtre d'options, tandis que le raccourci applique directement la valeur par défaut).

::: warning Les raccourcis ne fonctionnent qu'à l'intérieur de la zone d'éditeur assignée
Les événements de raccourci ne détectent que les frappes survenant à l'intérieur de la zone d'édition transmise à `mountToolbar({ surface })`. Si plusieurs éditeurs existent sur une même page, l'option `surface` doit impérativement être précisée pour éviter les interférences entre les événements de touches.
:::

---

## Règle d'affichage de l'état actif (Pressed) des boutons

Le critère selon lequel un bouton de la barre d'outils s'affiche comme « actuellement actif (Pressed) » dépend du type de wing (`place`) :

| `place` | Critère de détermination de l'activation |
|---|---|
| `'mark'` | si cette marque en ligne est appliquée à la position actuelle du curseur |
| `'attr'` | si la valeur retournée par `currentValue` du nœud de paragraphe actuel correspond au `value` du bouton |
| `'container'` · `'void'` | si le curseur se trouve à l'intérieur ou sur ce bloc |
| `'tool'` | reste toujours inactif |

Pour une wing à plusieurs valeurs (titre, alignement, etc.), seul le bouton dont le `value` correspond à la chaîne retournée par la fonction `currentValue` est peint comme actif.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

---

## Règle de masquage automatique des boutons

Le cœur de l'éditeur désactive ou masque automatiquement les boutons de barre d'outils concernés lorsqu'une mise en forme ne peut pas être appliquée :

- Dans les **zones où la mise en forme est restreinte**, comme à l'intérieur d'un bloc de code, les marques en ligne et les autres boutons de création de bloc sont automatiquement masqués.
- Dans le paragraphe enveloppe d'un bloc (image, tableau, etc.), les attributs de paragraphe comme le titre sont masqués (l'alignement du texte (`a`) reste toutefois une exception, pour permettre l'alignement de l'objet).
- Les boutons d'une wing absente de la liste `allows` du conteneur parent sont automatiquement masqués.

---

## Ligne contextuelle dynamique (`context`)

Une barre d'outils auxiliaire qui propose des outils de réglage spécialisés pour l'élément situé au curseur actuel (par exemple : curseur de redimensionnement au clic sur une image, formulaire de saisie d'URL au clic sur un lien, boutons d'ajout de ligne/colonne quand le curseur est dans un tableau).

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
      attr: 't',                                    // clé d'attribut du nœud d'où lire la valeur actuelle
      values: [
        { value: 'info', label: { fr: 'Info' } },
        { value: 'warn', label: { fr: 'Avertissement' } },
      ],
    },
  ],
}
```

### Types de contrôles de la ligne contextuelle (`ContextControl`)

| `kind` | Forme du contrôle | Propriétés principales |
|---|---|---|
| `'button'` | simple clic sur un bouton | `command`, `args?` |
| `'toggle'` | interrupteur (ON/OFF) | `command`, `token` |
| `'select'` | menu déroulant de sélection | `command`, `argKey`, `values`, `attr?` |
| `'range'` | barre de curseur (ajustement de largeur, etc.) | `command`, `argKey`, `values`, `rest?`, `readout?` |
| `'text'` | champ de texte (URL de lien, etc.) | `command`, `argKey`, `initial?`, `placeholder?`, `validate?` |
| `'prompt'` | fenêtre de formulaire composite | `command`, `fields` |
| `'lightbox'` | fenêtre d'agrandissement d'image | `src`, `alt?` |

Tous les contrôles partagent en commun `name` (requis), `label?`, `svg?`, `tip?`, `visible?`. La fonction `visible(node)` permet de contrôler dynamiquement l'affichage d'un contrôle selon une condition donnée (par exemple, n'afficher le bouton « défusionner » que lorsque des cellules sont fusionnées).

---

## Styles propres à la wing (`styles`)

Une wing peut intégrer elle-même le CSS dont elle a besoin.

```ts
styles: `
  .nabi-content aside[data-nabi-note] {
    border-left: 3px solid var(--nabi-accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
`
```

Via `collectSheets(registry)` et `injectSheets(document, sheets)`, seuls les styles des wings enregistrées peuvent être injectés dynamiquement dans le document ; une même chaîne de style n'est jamais injectée en double.

---

## Rattachement des dialogues avec la personne (`ask`)

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

- `message` : affiche une simple notification (`(text: string) => void`)
- `confirm` : fenêtre de choix confirmer/annuler (`(text: string) => boolean | Promise<boolean>`)
- `choose` : fenêtre de choix à options multiples (`(question: string, options: ChooseOption[]) => number | Promise<number>`)

La structure `ChooseOption` est `{ label: string, icon?: string }`, et la valeur retournée est l'index base 0 de l'option choisie (`-1` en cas d'annulation).

::: warning Comportement par défaut sans handler ask
Si aucun handler `ask` n'est fourni, la valeur de retour par défaut de `confirm` est `false` (annulation), par sécurité.
Pour `choose`, sans handler, la première candidate (index `0`) est sélectionnée par défaut. L'interface de sélection de format au collage, par exemple, se rattache automatiquement à l'interface dédiée intégrée au cœur dès que `mountToolbar` est monté — dans un environnement courant, il n'est donc généralement pas nécessaire d'implémenter `choose` soi-même.
:::

---

## Documents suivants

- [Écrire une marque en ligne](../custom/inline) · [Créer des blocs et des attributs de paragraphe](../custom/block) · [Touches, transformations automatiques, collage](../custom/input)
- [Personnaliser le thème](../../style/custom) — guide des variables CSS et des thèmes

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
