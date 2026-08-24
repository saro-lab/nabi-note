---
title: Fabriquer sa propre wing
description: Un guide pour écrire le contrat d'interface Wing de NABI NOTE, afin de créer de nouvelles mises en forme et fonctionnalités personnalisées.
---

# Fabriquer sa propre wing

Une wing est **un seul objet JavaScript pur.** Il n'y a aucune classe à étendre ni aucune cérémonie
d'enregistrement de framework — la mettre dans le tableau donné à `createNabiWith`
l'enregistre immédiatement.

Toute wing officielle fournie avec NABI NOTE — gras, tableaux, envoi de fichier, toutes — est
écrite selon exactement la même interface `Wing`. Une wing que vous écrivez vous-même tourne
**exactement dans les mêmes conditions** qu'une wing d'origine.

---

## L'exemple de wing le plus simple

Une wing de marque en ligne qui prend en charge la balise clavier `<kbd>`.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // l'identifiant unique de cette wing (la clé stockée dans le nabi-tree)
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // fonction de sortie HTML
  }),
  // détecte les balises <kbd> dans le HTML entrant et les convertit en nœud nabi-tree
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Désormais la balise `<kbd>` est conservée dans l'éditeur — elle survit au collage depuis le
presse-papiers, à `setHtml()`, ainsi qu'à l'enregistrement et au rechargement.

```
enregistrée      <p>Raccourci : <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   balise <kbd> conservée
non enregistrée  <p>Raccourci : <kbd>Ctrl</kbd></p>                →   <p>Raccourci : Ctrl</p> (converti en texte brut)
```

`toHtml` est la fonction de sérialisation qui exporte un nœud du nabi-tree en HTML, et `claim`
est la règle de désérialisation qui relit du HTML externe pour en faire un nœud du nabi-tree.
Sans `claim`, la sortie HTML fonctionne toujours, mais après enregistrement puis rechargement,
la balise est convertie en texte brut.

Utilisez `simpleMark()` pour une marque sans attribut, `valueMark()` pour une marque qui porte
une valeur, `boxObject()` pour un bloc autonome, et `listFamily()` pour une structure de liste —
ces aides réduisent toutes le code répétitif.

---

## Modules de wings et fonctions fabriques

**La plupart des wings fournies sont des constantes prédéfinies et immuables** (`boldWing`,
`headingWing`, etc.). Seules les wings qui ont besoin d'options de configuration
supplémentaires sont proposées sous forme de fonctions fabriques.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Pour changer uniquement le comportement d'une wing fournie précise (un surligneur syntaxique,
par exemple), étalez l'objet wing existant avec l'opérateur de décomposition et ne redéfinissez
que les champs voulus.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Ordre d'enregistrement et validation

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**L'ordre des wings dans le tableau est la priorité de balayage du HTML.** Lors de l'analyse de
HTML externe (`claim`), les wings sont vérifiées dans leur ordre d'enregistrement, et la
première wing qui revendique la propriété traite cette balise. Une balise qu'aucune wing ne
revendique se voit dépouillée de sa balise — seul le texte intérieur est conservé.

Le placement des boutons de la barre d'outils obéit **d'abord à l'ordre du groupe
(`button.group`)** ; ce n'est qu'au sein d'un même groupe que l'ordre d'enregistrement des
wings décide du placement.

### Validation et gestion des exceptions (validation stricte)

`createNabiWith` ne diffère pas une erreur d'exécution lorsqu'une wing enregistrée enfreint le
contrat — il **lève immédiatement une exception, au moment de l'initialisation.**

| Ce qui est vérifié | Exemple de violation |
|---|---|
| Utilisation d'un identifiant réservé | `w: 'p'`, `w: 'br'` |
| Enregistrement en double d'un identifiant (`w`) | Passer deux fois la même `boldWing` |
| Fonction de rendu manquante | `place: 'mark'` sans `toHtml` défini |
| Non-respect de la convention de nommage des commandes | Ne pas suivre verbe+nom en camelCase (ex. `insertTable`) |
| Wing dépendante requise manquante | Wing image/lien absente alors que la wing d'envoi la requiert via `requiresAnyOf` |

---

## Commandes — des fonctions pures

Toute opération qui modifie le document passe par une fonction commande. Une commande se
comporte comme une **fonction pure, qui ne dépend ni de l'API DOM ni du rendu écran.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // valider le type de l'argument externe
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

| Paramètre | Description |
|---|---|
| `doc` | Le tableau du document nabi-tree actuel (traité comme immuable — renvoie un nouveau document plutôt que de le modifier directement) |
| `sel` | L'état actuel du curseur et de la sélection (`{ anchor, focus }`) |
| `args` | L'objet d'arguments transmis par un bouton de la barre d'outils ou l'interface |
| `env` | La connaissance du schéma et le contexte d'environnement |

Une commande renvoie soit l'objet modifié `{ doc, selection }`, soit **`null`**. **Si le
document ne change pas, elle doit impérativement renvoyer `null`.** Quand `null` est renvoyé,
`applyCommand` renvoie `false` et aucune entrée d'historique d'annulation superflue n'est créée.
Le document renvoyé passe par le moteur `cocoon` (normalisation), ce qui garantit l'intégrité
du schéma.

L'hôte appelle la commande par son nom.

```ts
nabi.applyCommand('insertStamp', { text: 'OK' })   // renvoie un booléen
```

---

## L'interface `Wing` en détail

L'interface `Wing` comporte 31 propriétés au total, dont **2 sont requises** (`w`, `place`).

### 1. Identité et structure de base

| Propriété | Description |
|---|---|
| `w` | Identifiant unique de la wing (requis ; mots réservés `p`, `br` exclus) |
| `place` | Type de la wing (requis : `'mark'` mise en forme en ligne, `'void'` bloc vide, `'container'` bloc conteneur, `'attr'` attribut de paragraphe, `'tool'` outil non stocké dans le document) |
| `basic` | Si la wing fonctionne prête à l'emploi, sans câblage backend/hôte supplémentaire (`boolean`, `false` par défaut). Utilisé comme critère de filtrage lors de l'appel à `wings().allBasic()` |
| `holds` | Le type d'enfant qu'un conteneur autorise en son sein (`'blocks'` ou `'inline'`) |
| `singleParagraph` | Si l'intérieur est fixé à un seul paragraphe (par ex. une cellule de tableau) |
| `boolAttrs` | Noms des attributs booléens dont la seule valeur est `1` |
| `allows` | Liste des noms de wings enfants autorisés à l'intérieur du conteneur (toutes sont autorisées si non précisé) |
| `noAlign` | Si l'alignement du texte du paragraphe enveloppe est bloqué (`boolean`, blocs uniquement). Sert par exemple à empêcher l'alignement de casser la balise `pre` dans les blocs de code |
| `requiresAnyOf` | Liste des wings dépendantes devant être enregistrées en même temps (au moins l'une d'elles est requise) |
| `parts` | Définition des sous-composants qui appartiennent à la wing (lignes/cellules d'un tableau, résumé d'un bloc dépliant, etc.) |

### 2. Attributs et gestion d'état

| Propriété | Description |
|---|---|
| `attrKey` · `attrValues` | La clé d'attribut qu'utilise une wing d'attribut de paragraphe, et la liste de ses valeurs autorisées |
| `currentValue` | Fonction qui renvoie la valeur de l'attribut à la position actuelle du curseur (pour afficher l'état actif d'un bouton de la barre d'outils) |

### 3. Sérialisation et entrées/sorties

| Propriété | Description |
|---|---|
| `toHtml` · `partHtml` | Fonction de sérialisation qui convertit un nœud du nabi-tree en HTML |
| `toMd` | Fonction de sérialisation qui convertit un nœud du nabi-tree en Markdown (facultatif — retombe sur `toHtml` si non défini) |
| `partMd` | Fonction de sérialisation Markdown pour les sous-composants (`parts`) |
| `ioFilter` | Filtre d'entrée/sortie de fichier et de presse-papiers que la wing apporte elle-même |
| `claim` | Fonction qui décide de la propriété d'un balisage HTML entrant et le convertit en nœud du nabi-tree |
| `repair` · `partRepair` | Fonction qui valide et corrige l'intégrité d'un nœud au chargement JSON (renvoyer `null` retire le nœud) |

### 4. Entrée et contrôle des événements

| Propriété | Description |
|---|---|
| `commands` | La table des fonctions commandes fournies par la wing |
| `onKey` | Gestionnaire qui intercepte la saisie clavier tant que le curseur se trouve dans le nœud de cette wing |
| `escapeKeys` | Liste des touches qui déclenchent la sortie de cette mise en forme au prochain caractère saisi |
| `doubleKeys` | Association de commandes à exécuter lorsqu'une touche est appuyée deux fois en moins de 350ms (`{ nom de touche : nom de commande }`, ex. Échap Échap → effacer la mise en forme) |
| `inputRules` | Règles de conversion de mise en forme déclenchées automatiquement selon le motif de frappe |
| `attach` | Point d'ancrage pour lier ou contrôler directement des écouteurs d'événements sur un élément DOM (glisser une cellule de tableau, coloration syntaxique du code, etc.) |

### 5. Interface et style

| Propriété | Description |
|---|---|
| `button` · `buttons` | Définition du ou des boutons rendus dans la barre d'outils supérieure |
| `context` | Définition de la barre d'outils contextuelle qui apparaît selon la position du curseur |
| `styles` | Chaîne de feuille de style CSS que la wing apporte avec elle |

---

## Extension par filtres IO

**Un filtre IO (IoFilter) est un point d'extension qui traite le collage depuis le
presse-papiers ainsi que les formats d'enregistrement et d'ouverture de fichier, sans créer
directement de nœud de document.**

| Champ | Description |
|---|---|
| `id` · `label` | Identifiant unique du filtre et libellé affiché dans l'interface (un identifiant en double lève une exception) |
| `paste` | Fonction qui analyse les données du presse-papiers (`PasteData`) et renvoie des candidats de collage |
| `save` | Objet de configuration d'enregistrement (`{ extension, write, lossy?, mime? }`) |
| `read` | Fonction qui reçoit un nom de fichier et un texte et les analyse en nabi-tree (renvoie `null` si aucune correspondance) |

Les trois méthodes d'un filtre IO sont toutes facultatives. L'enregistrement se fait via les
options de montage (`mountSurface`, `mountFile`), via `createNabiWith({ ioFilters })`, ou via
la propriété `ioFilter` de la wing elle-même — le premier filtre enregistré est prioritaire.

---

## Règle de nommage de l'identifiant (`w`)

`w` est **la chaîne d'identifiant qui se répète, stockée sur chaque nœud du nabi-tree.** Pour
minimiser la taille de sérialisation, il est préférable d'utiliser une chaîne courte (comme
`b`, `hl`, `tf` pour les wings officielles).
Pour éviter toute collision avec une wing officielle, il est recommandé qu'une wing
personnalisée utilise le préfixe `ex` (par ex. `exNote`, `exStamp`).

::: warning Attention en cas de changement d'identifiant
Comme le champ `w` d'une valeur enregistrée correspond directement à l'identifiant, le
renommer peut rendre les documents déjà enregistrés illisibles au chargement. Si une migration
est nécessaire, écrivez la fonction `claim` pour qu'elle prenne aussi en charge l'ancien
identifiant.
:::

---

## Documents suivants

- [Fabriquer une marque en ligne](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Fabriquer un bloc et un attribut de paragraphe](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Touches, conversion automatique, collage](./custom/input) — `onKey` · `inputRules` · `attach`
- [Interface et interaction](./custom/ui) — `button` · `context` · `styles`, et connexion des boîtes de dialogue utilisateur

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
