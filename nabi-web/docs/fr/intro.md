---
title: Introduction
description: NABI NOTE est un éditeur WYSIWYG open source qui fonctionne dans le navigateur.
---

# Qu'est-ce que NABI NOTE ?

NABI NOTE est un **éditeur WYSIWYG open source** qui fonctionne dans le navigateur.


## Le nabi-tree

Traiter le document directement en HTML pose un problème : côté serveur (Node.js et assimilés),
sans DOM, ce traitement devient impossible. NABI NOTE représente donc le document par un objet
JavaScript pur appelé **nabi-tree**, sérialisable dans les deux sens vers JSON et vers HTML. Au
passage entre le nabi-tree et le HTML, tout contenu malveillant susceptible de déclencher une
faille XSS est aussi retiré automatiquement.

> Toute wing par défaut officiellement prise en charge par NABI NOTE assure elle-même la
> prévention XSS. En revanche, si vous écrivez ou intégrez une **wing personnalisée (un plugin
> tiers)**, vérifiez auprès de son propre auteur qu'elle fait de même.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Prise en charge du SSR sans DOM (rendu côté serveur)

Un nabi-tree enregistré en base ou ailleurs peut être **lu tel quel côté serveur (Node.js et
assimilés)** pour assembler le HTML envoyé au client. Seule une API DOM est nécessaire pour
l'**entrée** à partir d'une chaîne HTML externe (`setHtml()`) et pour les fonctions `mount*` qui
rendent l'éditeur à l'écran.

Un écran qui ne fait qu'afficher un document en lecture n'a besoin d'aucun éditeur monté — appelez
simplement la fonction de rendu unique (`renderStoredHtml`). Elle prend en arguments les données du
nabi-tree enregistré et le `registry` (la liste des wings enregistrées), et renvoie une chaîne HTML
sûre.

**En environnement serveur, utilisez le point d'entrée `nabi-note/ssr`** — un point d'entrée léger
qui ne porte que la logique nécessaire au rendu, si bien que le code de la surface d'édition
(`surface`) ou des outils d'interface (`ui`) ne se retrouve jamais dans le bundle serveur.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// Construisez la liste des wings une seule fois au démarrage du serveur, et réutilisez-la pour chaque requête.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['une ligne de commentaire'] }]   // un nabi-tree lu depuis la base
renderStoredHtml(saved, registry)
// '<p>une ligne de commentaire</p>'
```

**Tout ce qui n'est pas un nabi-tree valide reçoit `null` en retour** — la règle de validation est
identique à celle de `setJson()`. Une valeur qui passe la validation **correspond exactement** au
résultat de `getHtml()` appelé sur une instance d'éditeur, car elle traverse le même pipeline de
normalisation puis d'assemblage — le filtrage XSS s'applique donc lui aussi au même endroit.

Pour pré-rendre (SSR) l'écran d'édition de l'éditeur lui-même côté serveur, utilisez la fonction
`renderStoredEditorHtml`. Elle produit un HTML où un attribut `data-key` a été ajouté à chaque
nœud.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">une ligne de commentaire</p>'
```

Les mêmes données enregistrées produisent toujours le même `data-key`. Vous pouvez donc envoyer le
HTML rendu côté serveur puis, dans le navigateur, l'hydrater avec
`mountSurface({ nabi, registry, root, hydrate: true })` — l'éditeur prend le relais sans redessiner
l'écran. **La démo de la page d'accueil de ce site fonctionne exactement ainsi.** Le document
affiché au premier écran a été pré-rendu par le serveur, et côté client l'éditeur s'active
directement par-dessus ce DOM.

### Points d'entrée du paquet

| Point d'entrée | Ce qu'il contient | Quand |
|---|---|---|
| `nabi-note` | L'éditeur complet (le modèle de document, la surface d'édition, la barre d'outils et les outils d'interface) | Un écran pour **écrire/éditer** un document |
| `nabi-note/ssr` | Un module léger, réservé au SSR, qui rend un nabi-tree en HTML | Un environnement serveur ou une page en lecture seule |
| `nabi-note/viewer` | Comportement en lecture seule (tri des colonnes de tableau, coloration du code, etc.) | Un écran pour **afficher** du HTML publié |

`nabi-note/ssr` **ne référence jamais** la surface d'édition (`surface`) ni les outils d'interface
(`ui`). Un test unitaire au niveau de l'architecture le vérifie strictement, donc aucun code
dépendant du DOM ne risque de se glisser dans le bundle serveur.

## Toute mise en forme est une wing

Ce que d'autres éditeurs appellent un « plugin », NABI NOTE l'appelle une **wing**. Le cœur de
l'éditeur ne connaît directement que le paragraphe de base (`p`), le saut de ligne (`br`) et le
texte brut — chaque mise en forme et chaque extension, des titres et listes jusqu'aux tableaux et
au gras, est fournie sous la forme d'une wing indépendante.

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

Le balisage non enregistré comme wing est **automatiquement converti en texte brut.** Tout élément
HTML non déclaré est donc écarté en toute sécurité, et toute wing officiellement prise en charge
par NABI NOTE filtre soigneusement les scripts malveillants.


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

La structure ci-dessous ne représente pas l'ordre d'exécution des données — elle montre les
**quatorze couches (layers)** organisées dans le répertoire `src/`. Le principe central : **une
couche basse ne référence jamais une couche supérieure.** C'est pourquoi les couches basses
(`schema`, `doc`, `html`, etc.) ne dépendent pas du tout du DOM et tournent, elles aussi, sans
changement dans un environnement serveur (Node.js).

```
src/
├── style/     la feuille de base — le CSS que partagent l'écran d'édition et le texte publié
├── locale/    la langue
├── code/      le tokenizer pur partagé par l'écran d'édition et le côté lecture
├── schema/    la forme du nabi-tree et la définition de Cocoon
├── doc/       insérer · supprimer · scinder · plage — sans DOM
├── caret/     la position du curseur, la sélection, les bornes
├── html/      nabi-tree ↔ HTML
├── io/        les portes d'entrée et de sortie — candidates au collage, enregistrement, ouverture, markdown
├── editor/    l'instance porteuse de l'interface de commandes
├── wing/      le contrôle des wings au moment de l'enregistrement
├── wings/     les wings officielles (gras · italique … tableau · envoi)
├── surface/   accorde le caret, l'IME et la saisie à l'arbre
├── ui/        la couche UI
├── viewer/    lecture seule
├── index.ts   la porte d'entrée du cœur — `nabi-note`
└── ssr.ts     la porte d'entrée du SSR — `nabi-note/ssr` (elle ne touche aucun fichier de surface ou ui)
```

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
| **filtre IO (IO filter)** | l'extension qui traite le collage (la porte d'entrée) et l'enregistrement et l'ouverture (les portes de sortie) comme un ensemble. Elle se situe **en dehors du contrat de wing**, si bien qu'elle n'établit aucun nœud dans le document |

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

</script>
