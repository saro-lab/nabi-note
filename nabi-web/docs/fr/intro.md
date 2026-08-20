---
title: Introduction
description: NABI NOTE est un éditeur WYSIWYG open source qui fonctionne dans le navigateur.
---

# Qu'est-ce que NABI NOTE ?

NABI NOTE est un **éditeur WYSIWYG open source** qui fonctionne dans le navigateur.


## Le nabi-tree

Traiter le document directement en HTML pose un problème : côté serveur, sans DOM, ce traitement
devient impossible. NABI NOTE représente donc le document par un objet JavaScript appelé
**nabi-tree**, sérialisable dans les deux sens vers JSON et vers HTML. Au passage entre nabi-tree
et HTML, les éléments propices au XSS sont aussi retirés.

> Toutes les wings officiellement fournies par nabi-note filtrent le XSS, mais pour une **wing
> personnalisée (plugin externe)**, vérifiez ce point directement auprès de son auteur.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Prise en charge du SSR sans DOM (côté serveur)

Un nabi-tree déjà enregistré peut être **lu tel quel côté serveur (Node.js)** pour assembler le
HTML à envoyer. Le DOM n'est nécessaire que pour l'**entrée** (`setHtml()`) et pour les `mount*`
qui s'attachent à l'écran.

Là où l'on ne fait qu'afficher, une seule porte suffit, sans même monter un éditeur. Elle reçoit
deux choses — la valeur enregistrée et le `registry` (la liste des wings enregistrées) — et répond
avec une chaîne HTML.

**Côté serveur, on importe `nabi-note/ssr`** — ce point d'entrée ne porte que ce qu'il faut pour
dessiner, la surface d'édition et les outils d'écran n'y sont pas du tout chargés.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// La liste des wings ne se construit qu'une fois, au démarrage du serveur — elle est partagée par toutes les valeurs enregistrées.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['une ligne de commentaire'] }]   // nabi-tree lu depuis la base
renderStoredHtml(saved, registry)
// '<p>une ligne de commentaire</p>'
```

**Si la valeur n'est pas un nabi-tree, la réponse est `null`** — la règle de rejet est la même que
pour `setJson()`. Une valeur qui passe ne diffère pas d'un seul caractère du `getHtml()` que
rendrait l'éditeur : elle traverse la même étape (normalisation puis assemblage), donc le filtrage
du XSS s'y fait exactement au même endroit.

Pour pré-rendre l'éditeur lui-même côté serveur, utilisez la porte jumelle — la seule chose
ajoutée est `data-key`.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">une ligne de commentaire</p>'
```

La même valeur enregistrée obtient toujours le même `data-key` : envoyez ce HTML tel quel, puis
reprenez-le côté navigateur avec `mountSurface({ nabi, registry, root, hydrate: true })` — l'écran
n'est pas redessiné. **La démo de la page d'accueil de ce site fonctionne exactement ainsi** : le
document du premier affichage est celui que le serveur a dessiné, et l'éditeur se réveille
par-dessus.

### Trois points d'entrée

| Ce qu'on importe | Ce qu'il contient | Quand |
|---|---|---|
| `nabi-note` | L'éditeur en entier — assemblage, surface, outils d'écran | Là où l'on **écrit** |
| `nabi-note/ssr` | Seulement de quoi dessiner la valeur enregistrée en HTML | Le serveur, ou une page qui ne fait que lire |
| `nabi-note/viewer` | Le comportement côté lecture (tri de tableau, coloration du code) | Là où l'on **affiche** du HTML publié |

`nabi-note/ssr` ne touche **aucun fichier** de la surface d'édition (`surface`) ni des outils
d'écran (`ui`) — un filet parcourt la source et impose cette règle. Aucun code DOM ne peut donc se
glisser dans le paquet serveur.

## Toute mise en forme est une wing

L'unité que les autres éditeurs appellent « plugin » s'appelle ici une **wing**. Ce que le cœur
connaît directement, ce sont le paragraphe (`p`), la ligne (`br`) et le texte brut ; les titres,
les listes, les tableaux et le gras sont tous des wings.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>gras</b> <i>italique</i></p>')
bare.getHtml()
// '<p>gras italique</p>'                   — aucune wing déclarée, tout retombe en texte brut.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>gras</b> <i>italique</i></p>')
bold.getHtml()
// '<p><b>gras</b> italique</p>'            — seule boldWing est déclarée, donc seul le gras survit et le reste retombe en texte brut.
```

Le balisage non enregistré comme wing est converti en texte brut. Le HTML non déclaré est donc
écarté, et toutes les wings officiellement prises en charge par nabi retirent les scripts
malveillants.


## Interface

Le document ne peut être modifié que par `applyCommand()`.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Gras
nabi.applyCommand('setHeading', { value: 2 })   // H2
nabi.undo()
nabi.redo()
```
Une commande **répond par un `boolean`** qui dit si elle a réussi. Si rien ne change, elle répond
`false` sans laisser d'entrée dans l'historique ni modifier le document.


## Les couches du code

Cela ne veut pas dire que la valeur circule dans cet ordre. C'est la **direction des
dépendances**, empilée du bas vers le haut, et la règle est unique — **une couche basse ne connaît
jamais celle du dessus.** C'est pourquoi les couches basses (`schema` · `doc` · `html`) ne
touchent pas le DOM, et c'est aussi pour cela qu'elles tournent telles quelles côté serveur. Le
chemin qu'emprunte la valeur est le schéma du nabi-tree vu plus haut.

<LayerStack
  :layers="layers"
  caption=""
/>

Cette direction n'est pas une promesse écrite mais **un contrôle imposé par un filet** — dès
qu'un import franchit une couche à contre-sens, le test échoue à cet endroit précis.


## Vocabulaire

| Mot | Sens |
|---|-------------------------------------------------------|
| **marque (mark)** | mise en forme du texte, ex. `<b>` · `<i>` · `<a>` |
| **bloc (block)** | ex. paragraphe · titre · liste · tableau · image |
| **attribut de paragraphe (paragraph attribute)** | un attribut du paragraphe, ex. alignement · lettrine |
| **paragraphe enveloppe** | le paragraphe qui enveloppe un objet à paragraphe unique comme un tableau, une liste ou une image. |
| **revendication (claim)** | le verdict qui décide à quelle wing appartient un balisage. |
| **parts** | une fonctionnalité interne à la wing, ex. les lignes et cellules d'un tableau, la ligne de résumé d'un bloc dépliant |

### Écran d'édition

| Mot                           | Sens                                                                                                                        |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **caret**              | le curseur de sélection dans l'éditeur                                                                                                       |
| **ligne contextuelle (context row)** | la barre d'outils qui contrôle l'état actuellement sélectionné par le caret, ex. les commandes de ligne/colonne du tableau, le champ de langage du code, les champs adresse/texte du lien, les H1 à H6 du titre |

### Le cœur

| Mot | Sens                                                                                                                                                              |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **cocoon** | l'étape de normalisation du nabi-tree. Elle tourne **après chaque commande**, si bien qu'aucune commande ne peut laisser un document qui brise les règles                                                       |
| **attach** | le crochet qu'une wing déclare quand elle doit toucher à l'écran, ex. le glisser des cellules d'un tableau, la coloration du code, le bascule d'une case à cocher — tout cela en fait partie. `mountSurface` attache celui de chaque wing enregistrée |
| **transformation automatique (input rule)** | une conversion qui se déclenche à la seule frappe des caractères, ex. un tiret et une espace donnent une liste, un `#` et une espace donnent un titre                                                                  |


## Documents suivants

- [{{ t('menu_intro_usage') }}](./intro/usage) — l'assemblage, les entrées et les sorties en entier
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — un seul `<script>`, sans outil de build
- [{{ t('menu_wing_custom') }}](./wing/custom) — fabriquer soi-même une mise en forme absente

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: 'saisie directe · collage · chargement', kind: 'in' },
  { label: 'setHtml() · setJson()', note: 'entrée par fonction', kind: 'gate' },
];

const hubCore = { label: 'nabi-tree', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Sortie HTML', kind: 'out' },
  { label: 'getJson()', note: 'Sortie JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'HTML pour l\'éditeur', kind: 'out' },
];

const layers = [
  { name: 'locale', what: 'la langue' },
  { name: 'code', what: 'le tokenizer pur partagé par l\'écran d\'édition et le côté lecture' },
  { name: 'schema', what: 'la forme du nabi-tree et la définition de Cocoon' },
  { name: 'doc', what: 'insérer · supprimer · scinder · plage — sans DOM' },
  { name: 'caret', what: 'la position du curseur, la sélection, les bornes' },
  { name: 'html', what: 'nabi-tree ↔ HTML' },
  { name: 'editor', what: 'l\'instance porteuse de l\'interface de commandes' },
  { name: 'wing', what: 'le contrôle des Wings au moment de l\'enregistrement' },
  { name: 'wings', what: 'les wings officielles (bold, italic ... table, upload...)' },
  { name: 'surface', what: 'accorde le caret, l\'IME et la saisie à l\'arbre' },
  { name: 'ui', what: 'la couche UI' },
  { name: 'viewer', what: 'lecture seule' },
]
</script>
