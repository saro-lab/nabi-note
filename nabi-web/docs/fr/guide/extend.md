---
title: Wings personnalisées
description: Le contrat et la séquence d'implémentation pour ajouter une fonctionnalité de document durable.
---

# Wings personnalisées

Une wing personnalisée est plus qu'un bouton de barre d'outils. C'est une extension déclarative qui garde ensemble une structure de document enregistrée, des commandes, la conversion HTML et Markdown, des règles d'importation et le comportement d'affichage. La registry la valide avant même qu'un éditeur n'existe, empêchant ainsi les structures invalides d'entrer dans les documents.

## Commencer par la factory la plus étroite

La plupart des formats ne nécessitent pas une déclaration complète. Utilisez `simpleMark()` pour une marque inline sans valeur, `valueMark()` pour une marque avec un ensemble limité de valeurs, `boxObject()` pour un bloc sans enfants et `listFamily()` pour une liste.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Construire plusieurs types de wing

Chaque exemple ci-dessous a une forme enregistrée différente. Enregistrez-en une d'abord et inspectez `getJson()` et `getHtml()`. Ajoutez des commandes et des boutons seulement après que la structure fonctionne.

### 1. Marque inline sans valeur : emphase

Utilisez `simpleMark()` lorsqu'une fonctionnalité ne fait qu'envelopper du texte. Cela enregistre `exStrong` et le rend sous forme de `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Avec `clearable: true`, Effacer la mise en forme supprime aussi cette marque. Avant d'ajouter un bouton, appliquez-la avec `nabi.applyCommand()` ou une autre commande personnalisée. Le même sélecteur `.nabi-content strong` stylise à la fois l'éditeur et le contenu publié.

### 2. Marque inline avec une valeur : ton de statut

Utilisez `valueMark()` pour une couleur, une taille ou un état choisi dans un ensemble autorisé. La valeur est enregistrée dans `a.v`; les valeurs hors liste sont supprimées pendant `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Sa forme enregistrée est `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. Le CSS cible la valeur enregistrée, donc il modifie aussi le contenu publié. Ne supprimez pas à la légère des valeurs d'une liste existante : les documents enregistrés auparavant pourraient les perdre à la lecture.

### 3. Bloc sans enfants : séparateur

Utilisez `boxObject()` pour un objet autonome sans enfants, par exemple une image, une vidéo ou un séparateur.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Pour un objet avec des valeurs comme une URL ou une largeur, déclarez la validation dans `attrs` et placez les valeurs requises dans `requires`. Rejetez une valeur impossible à vérifier avec `null`, plutôt que de la remplacer silencieusement par une valeur par défaut.

### 4. Bloc avec plusieurs paragraphes : encadré

Pour un bloc qui contient du contenu de document, déclarez un `container`. `holds: 'blocks'` permet des enfants de type paragraphe, liste et objet-bloc.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Cette déclaration seule ne crée pas de moyen d'englober les paragraphes sélectionnés. Ajoutez une commande pure dans `commands` et un `button` qui l'appelle avant d'exposer la fonctionnalité dans l'interface de l'éditeur.

### 5. Une paire liste/élément associée

Utilisez `listFamily()` lorsqu'une liste et son élément doivent toujours apparaître ensemble.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` répare un bloc à l'intérieur de la liste en l'enveloppant dans un élément. Ajoutez `itemDecl` et `repairItem` pour une valeur au niveau de l'élément, comme un état coché.

### Enregistrer dans une sélection ordonnée

Utilisez les mêmes déclarations dans le même ordre sur le serveur que dans le navigateur.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'fr' })
```

## Définir les noms et la structure du document

Les noms qui entrent dans un document doivent correspondre à `ex[A-Z0-9]...`. Un nom comme `exCallout` empêche une future wing officielle de changer la signification du contenu enregistré.

`place` détermine la forme enregistrée : `mark` enveloppe le contenu inline, `void` est un bloc sans enfants, `container` contient des enfants, `attr` modifie les attributs de paragraphe et `tool` ne crée aucun nœud de document. Un `container` a besoin de `holds: 'blocks' | 'inline'` et de `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` et `parts` déclarent des contraintes structurelles. Une déclaration `parts` a aussi besoin de `partHtml` pour chaque partie. Utilisez `attrKey` et `attrValues` pour contraindre une wing qui sélectionne une valeur.

## Chaque option de déclaration

Déclarez uniquement ce dont la wing a besoin. Une factory fournit déjà certains champs pour vous.

| Zone | Options | But |
| --- | --- | --- |
| Base | `w`, `place`, `basic`, `styles` | Nom, type structurel, appartenance au catalogue de base, CSS par défaut |
| Structure | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Type d'enfant, comportement Entrée, attributs autorisés, attributs booléens |
| Structure | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Parties internes, enfants autorisés, exclusion d'alignement, dépendance de wing |
| Valeurs | `attrKey`, `attrValues`, `currentValue` | Clé et liste de la valeur enregistrée, détection de la valeur actuelle |
| Commandes et saisie | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Commandes, gestion des touches, comportement Échap/double touche, règles d'autoformatage |
| Comportement de surface | `attach` | Comportement DOM et nettoyage pour une surface |
| Conversion | `toHtml`, `partHtml`, `toMd`, `partMd` | Sortie HTML et Markdown |
| Importation et réparation | `claim`, `ioFilter`, `repair`, `partRepair` | Importation HTML, gestion des fichiers, validation JSON et réparation |
| UI | `button`, `buttons`, `context` | Déclarations d'interface utilisateur de barre d'outils et de contexte |
| Effacer le formatage | `clearable` | Si Effacer le formatage le supprime |

`w` et `place` sont toujours requis. Les wings qui produisent des nœuds, comme `mark`, `void` et `container`, nécessitent aussi `toHtml()`. Un conteneur a besoin de `holds`; chaque partie déclarée a besoin de son `partHtml` correspondant.

## Garder HTML, Markdown et JSON ensemble

`toHtml()` rend un nœud enregistré en HTML, tandis que `toMd()` exporte du Markdown. Sans générateur Markdown, le HTML généré est conservé afin que l'information ne soit pas perdue. Utilisez `claim()` pour reconnaître uniquement votre propre élément HTML et des attributs validés lors de l'importation.

`repair()` s'exécute lorsque le JSON est chargé, puis à nouveau après les commandes. Retournez un nœud corrigé pour un attribut invalide, ou `null` pour un nœud qui ne peut pas être conservé. Construisez le HTML avec `ctx.element()`, `ctx.escape()` et `ctx.url()`; ne concaténez jamais de balises, d'attributs ou d'URL en contournant ces vérifications.

## Garder les commandes séparées du comportement d'affichage

Une commande est une fonction pure du document et de la sélection qui retourne le document suivant et une sélection à l'intérieur. Elle ne lit ni ne modifie jamais le DOM, et retourne `null` lorsqu'elle ne peut pas effectuer un changement valide. Nommez les commandes en lower camel case en commençant par un verbe, comme `insertNote`.

Placez les comportements purement DOM, comme la sélection par glissement dans un tableau, dans `attach(host)`. Enregistrez immédiatement le nettoyage de chaque listener ou attribut modifié avec `host.onDispose()`, afin qu'une configuration échouée soit quand même nettoyée. Ne modifiez pas le DOM du texte en composition ni le mapping de sélection de la surface.

Déclarez les contrôles de barre d'outils et de contexte avec `button`, `buttons` et `context`; dupliquer leurs règles de commande dans l'interface de l'application peut faire diverger l'interface et le modèle de document.

## Styles CSS

Placez le CSS de base requis par une wing dans `styles`. Les styles des wings intégrées sont déjà inclus dans `nabi-note/nabi.css`. Un navigateur qui assemble les styles de la registry sélectionnée peut utiliser `collectSheets()` et `injectSheets()`; en SSR, liez plutôt le fichier CSS.

Utilisez les mêmes classes et attributs data pour l'édition et le contenu publié, mais ne modifiez pas la structure `[data-key]` de l'édition, `display` ni `white-space`. Le CSS doit modifier uniquement l'apparence, pas le mapping du caret.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Ciblez uniquement les classes ou attributs de données créés par `toHtml()`. Gardez les modifications spécifiques au service plus étroites, par exemple `.article-body .ex-callout`.

## Vérifier l'ensemble du contrat

Vérifiez qu'un document JSON enregistré se recharge avec la même structure et le même HTML. Testez que la registry rejette les noms invalides, les commandes en double, les builders manquants et les dépendances non satisfaites. Couvrez l'importation HTML invalide et les entrées de `repair()`, la gestion de sélection dans les commandes, la sortie SSR et une vue publiée stylisée.

Pour les types complets et les arguments des factories, consultez les déclarations installées et la [référence API en anglais](https://nabi.saro.me/llms/api-reference.md).
