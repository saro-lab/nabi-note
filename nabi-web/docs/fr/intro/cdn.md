---
title: Utilisation via CDN
description: Explique comment utiliser NABI NOTE avec de simples balises HTML, sans outil de build.
---

# Utilisation via CDN

<CdnDemo />

---

## Configuration de base et fonctionnement

L'exemple de démonstration ci-dessus fonctionne avec un seul fichier HTML, sans bundler ni outil de build.

### Intégration en deux balises HTML

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

Tous les modules exportés par le paquet sont accrochés à l'objet global `NabiNote` (ou son alias `N`). **La feuille de style CSS doit être liée à la main** — les fonctions de montage n'injectent pas le CSS automatiquement ; oublier la balise `<link>` laisse l'éditeur sans style.

### Structure HTML

```html
<div id="app" class="nabi">                    <!-- la racine où vivent le thème de couleur, le rayon des coins et la police -->
  <div id="chrome" class="nabi-toolbar">        <!-- en-tête fixe qui enveloppe la barre d'outils et la barre contextuelle -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- boutons d'aperçu et de plein écran (alignés à droite) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- barre contextuelle qui apparaît dynamiquement selon la position du curseur -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

L'`id` de chaque élément peut être choisi librement. Aux fonctions de montage, on passe l'élément DOM réel, pas l'id sous forme de chaîne.
Les quatre classes (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`) sont des classes obligatoires utilisées par la feuille de style — laissez-les telles quelles. Si l'aperçu et le plein écran ne sont pas nécessaires, l'élément `<span id="tools">` et l'appel à `mountViewTools` peuvent être omis. `mountViewTools` construit automatiquement sa propre zone de boutons à l'intérieur du conteneur reçu.

### Choix des wings

La configuration des wings s'écrit facilement en chaînant les appels du builder. L'exemple ci-dessus part des 26 wings de base qui fonctionnent sans câblage côté hôte, y ajoute l'enregistrement et l'ouverture, puis limite le choix de police à deux valeurs.

```js
var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })
```

- `all()` active toutes les wings officielles. Sans cet appel, aucune wing de base n'est incluse — seules celles déclarées via `use()` sont enregistrées.
- `allBasic()` sélectionne, parmi les wings officielles, **les 26 qui fonctionnent sans câblage supplémentaire côté application hôte.** L'envoi de fichiers, l'enregistrement et l'ouverture en sont exclus car ils nécessitent une configuration que l'hôte doit fournir (un point de terminaison serveur, un espace de stockage de fichiers, etc.) — c'est pourquoi l'exemple ci-dessus les rajoute explicitement via `use()`.
- `use('nom', options?)` ajoute une wing donnée. Appelé sur une wing déjà enregistrée, il ne fait que mettre à jour ses options (par exemple `use('tf', { values: [...] })`). Si une wing dépend d'une autre (l'envoi de fichiers a besoin de la wing image ou lien), celle-ci est enregistrée automatiquement avec elle.
- `drop('nom')` retire une wing de la liste. Essayer de retirer une wing dont dépend une autre lève une exception et indique les wings associées à retirer en même temps.
- Le nom d'une wing est la clé courte et unique (`w`) enregistrée dans le nabi-tree (par exemple `b` pour gras, `tf` pour la police, `upload`, etc.). La liste complète s'obtient avec `console.log(N.wingNames())`.
- **Un nom ou une option invalide déclenche immédiatement une erreur.** Une faute de frappe, une clé d'option non prise en charge ou une valeur hors plage déclenchent un message d'erreur qui indique comment corriger.

`createNabiWith` accepte directement l'instance du builder en argument, sans besoin d'appeler `build()`. Les wings peuvent aussi être passées directement sous forme de tableau.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Une wing personnalisée que vous avez créée se transmet sous forme d'objet (`N.wings().all().use(customWing)`). Il est recommandé de préfixer l'identifiant `w` de vos wings personnalisées par `ex` (par exemple `exNote`) afin d'éviter toute collision avec les identifiants officiels. Pour savoir comment en écrire une, consultez [{{ t('menu_wing_custom') }}](../wing/custom).

La spécification détaillée de chaque wing est disponible dans le menu [{{ t('menu_wing') }}](../wing/inline/bold).

### Intégration des boîtes de dialogue et des notifications

L'exemple ci-dessus relie, via l'option `ask`, les `alert` et `confirm` natifs du navigateur. On peut ainsi afficher un message de confirmation comme « Une saisie est en cours. Voulez-vous continuer ? » dans une fenêtre popup du navigateur.

Sans `ask`, la réponse par défaut d'une confirmation est l'annulation (`false`), et les simples messages d'information s'affichent automatiquement via le toast intégré au cœur, sous la barre d'outils. Pour plus de détails, voir [{{ t('menu_intro_usage') }}](./usage).

`ask` inclut aussi la fonction `choose`, qui permet de sélectionner une option parmi plusieurs. Cela dit, **le popup de choix de format lors du collage depuis le presse-papiers fonctionne par défaut, sans configuration particulière.** Dès que `mountToolbar` est monté, le cœur y connecte automatiquement sa propre UI de popup — sur une page qui utilise la barre d'outils, ce popup de choix apparaît donc sans implémentation supplémentaire. Ne passez `ask.choose` que si vous souhaitez le remplacer par votre propre UI modale.

### Méthodes d'entrée et de sortie

| Méthode | Description |
|---|---|
| `nabi.getHtml()` | Renvoie le HTML à enregistrer et à publier |
| `nabi.getJson()` | Renvoie les données du nabi-tree (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | Remplace le contenu par de nouvelles données |
| `nabi.onChange(fn)` | Enregistre un écouteur d'événement de changement |
| `N.renderStoredHtml(json, registry)` | Convertit un nabi-tree en HTML sans éditeur (voir [Lecteur en lecture seule](#lecteur-en-lecture-seule-viewer) ci-dessous) |

---

## Adresses de distribution CDN

Pour figer une version précise, indiquez le numéro de version dans l'URL du CDN. jsDelivr et unpkg sont tous deux pris en charge.

Une URL sans version explicite (`/npm/nabi-note`) peut, à cause du cache du CDN, mélanger des versions différentes entre le script et la feuille de style — il est donc recommandé de préciser une version ou d'utiliser le tag `@latest`.

| Type | Adresse |
|---|---|
| **Script du bundle (dernière version)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Script du bundle (version figée)** | <code>{{ CDN_BUNDLE }}</code> |
| **Feuille de style (dernière version)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Feuille de style (version figée)** | <code>{{ CDN_SHEET }}</code> |
| **Script du bundle (unpkg)** | `https://unpkg.com/nabi-note` |

Le bundle du CDN correspond exactement au résultat de build `dist/` du paquet publié sur npm.

---

## Lecteur en lecture seule (Viewer)

Pour une page qui **affiche simplement** un document HTML enregistré, il n'est pas nécessaire de créer une instance d'éditeur. En liant la même feuille de style et en rendant le HTML dans un conteneur `.nabi-content`, le résultat apparaît exactement comme dans l'éditeur.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- chaîne HTML enregistrée avec nabi.getHtml() -->
</div>
```

Si le document a été **enregistré sous forme de nabi-tree (JSON)**, vous pouvez appeler la fonction de rendu pour produire le HTML en JavaScript pur. Elle prend en argument les données JSON enregistrées et la liste des wings enregistrées (`registry`).

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['une ligne de commentaire'] }]   // nabi-tree chargé depuis le serveur
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Si la valeur n'est pas un nabi-tree valide, la fonction renvoie `null`. Le résultat du rendu est absolument identique à celui de `getHtml()` sur une instance d'éditeur — les mêmes règles de filtrage XSS s'appliquent, et comme cela ne dépend pas du DOM, cela fonctionne de la même façon sur un serveur (Node.js, etc.) (voir [{{ t('menu_intro_ssr') }}](./ssr)).

Dans un environnement serveur qui utilise le paquet npm, utilisez le module léger **`nabi-note/ssr`** plutôt que le bundle global. Il ne contient que la logique nécessaire au rendu, si bien que la zone d'édition et le code d'interface ne sont pas inclus dans le bundle serveur.

La feuille de style CSS **contient les styles de toutes les wings.**

La mise en forme de base s'exprime entièrement en CSS, mais **le tri des tableaux et la coloration syntaxique du code nécessitent du JavaScript côté client.** Si vous avez besoin du tri des lignes au clic sur l'en-tête de colonne, ou de la tokenisation et de la coloration du code, vous pouvez brancher un runtime de lecture léger.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'fr' })
</script>
```

- Sans brancher le viewer, le document s'affiche normalement (seuls le tri des tableaux et la coloration du code sont désactivés — la lecture du contenu n'est pas affectée).
- Le tri des tableaux ne fonctionne que sur les tableaux dont le tri a été activé dans l'éditeur (portant l'attribut `data-nabi-sortable`).
- La coloration syntaxique du code repose par défaut sur un tokenizer intégré, sans dépendance externe. Pour utiliser un surligneur externe comme Shiki, passez-le via l'option `{ locale: 'fr', highlight }`.
- Le bundle global `NabiNote` ne contient pas ce point d'entrée du viewer — pour optimiser la taille du bundle sur les pages en lecture seule, il est fourni séparément sous forme du module `nabi-note/viewer`.

---

## Documents suivants

- [{{ t('menu_intro_usage') }}](./usage) — installation du paquet npm et usage détaillé de l'éditeur
- [{{ t('menu_wing_custom') }}](../wing/custom) — créer soi-même une nouvelle wing de mise en forme personnalisée

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// Le numéro de version référence dynamiquement la version du paquet
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
