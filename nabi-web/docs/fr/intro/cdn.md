---
title: Depuis un CDN
description: Exemple CDN
---

# Depuis un CDN

<CdnDemo />

---

## Ce que vous venez de faire

Le fichier ci-dessus tourne sans que vous ayez à lire quoi que ce soit ici. Ne venez ici que
pour le modifier.

### Deux balises suffisent à l'installation

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

**Tout** ce que le paquet exporte est accroché à l'unique global `NabiNote`. **C'est vous qui
accrochez la feuille de style** — les mount n'injectent aucun CSS, donc oubliez le `<link>` et
l'éditeur se retrouve nu.

### Le squelette

```html
<div id="app" class="nabi">                    <!-- la racine où vivent couleurs, coins et polices -->
  <div id="chrome" class="nabi-toolbar">        <!-- la barre d'outils et la ligne contextuelle collent comme un seul bloc -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- aperçu et plein écran (tout à droite) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- se remplit toute seule selon ce que pointe le caret -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

Les `id` peuvent porter n'importe quel nom — ce que vous donnez à un mount, c'est l'**élément**,
pas le nom. Laissez les quatre classes (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`,
`nabi-content`) telles quelles : ce sont les poignées que saisit la feuille de style. Si vous ne
comptez pas utiliser l'aperçu ni le plein écran, supprimez ensemble le `<span id="tools">` et la
ligne `mountViewTools`. Le conteneur peut être passé où vous voulez — `mountViewTools` dresse
lui-même sa propre boîte qui flotte à droite, donc même en lui passant la barre d'outils telle
quelle, la rangée de boutons ne se dérange pas.

### Choisir les wings

Choisir les wings tient en une ligne de builder. Le fichier ci-dessus part des vingt-neuf wings
standard, retire l'upload et restreint la police à deux choix.

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` part de toutes les wings officielles. **Sans cet appel, la liste est vide** — seul ce
  qui passe par `use()` est chargé.
- `use('nom', options?)` ajoute une wing. Appelé sur une wing déjà présente, il ne fait qu'ajouter
  des options — c'est le cas de `use('tf', { values: [...] })` ci-dessus. Si la wing a besoin
  d'une autre wing pour tenir debout (l'upload a besoin d'une image ou d'un lien), celle-ci est
  tirée avec elle en silence.
- `drop('nom')` retire une wing de la liste. Essayer de retirer une wing sur laquelle une autre
  s'appuie lève une exception à cet endroit même, en indiquant ce qu'il faut retirer avec elle.
- Le nom est la clé courte inscrite dans la valeur enregistrée — `b` (gras), `tf` (police),
  `upload`, par exemple. La liste complète s'obtient avec `console.log(N.wingNames())`.
- **Un appel incorrect lève une exception à la ligne même de l'appel.** Une faute de frappe dans
  le nom, une clé d'option inconnue, une valeur hors liste — tout cela déclenche l'exception, et
  le message porte de quoi corriger : `use('bod')` répond « vouliez-vous dire 'b' (gras) ? ». Il
  n'existe aucun endroit où l'erreur passe en silence.

`createNabiWith` accepte le builder tel quel, donc `build()` n'a pas besoin d'être appelé — il ne
sort un tableau que là où un tableau est attendu. Pour ne choisir que quelques wings, le tableau
reste la réponse.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Une wing que vous avez faite vous-même s'ajoute comme un objet — par exemple
`N.wings().all().use(customWing)`. Le `w` de cette wing doit commencer par `ex` (`exNote`) — s'il
recoupe un nom officiel à venir dans la valeur enregistrée, un document déjà enregistré se
relirait avec un autre sens. La façon d'en fabriquer une est dans
[{{ t('menu_wing_custom') }}](../wing/custom).

Les wings une par une se trouvent dans [{{ t('menu_wing') }}](../wing/inline/bold).

### On pose une question, on prévient

Le fichier ci-dessus branche `alert`/`confirm` du navigateur par `ask` — une question du genre
« il y a déjà un texte en cours, ouvrir quand même ? » y est envoyée. Sans ce branchement, la
réponse à la question est « non », et un mot qui n'attend pas de réponse est affiché sous la barre
d'outils par la boîte toast que le cœur tient déjà — rien à brancher pour une alerte comme une
erreur de téléversement. Les détails sont dans [{{ t('menu_intro_usage') }}](./usage).

### Faire sortir la valeur

| | |
|---|---|
| `nabi.getHtml()` | le HTML à enregistrer et publier |
| `nabi.getJson()` | le nabi-tree (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | la remettre en place |
| `nabi.onChange(fn)` | à chaque changement de valeur |
| `N.renderStoredHtml(json, registry)` | la valeur enregistrée en HTML sans éditeur (voir [Côté lecture](#côté-lecture) ci-dessous) |

---

## Adresses

Pour figer une version, accrochez son numéro à l'adresse. unpkg sert le même fichier.

**N'utilisez pas l'adresse sans numéro de version (`/npm/nabi-note`)** — jsDelivr met cet
emplacement en cache longtemps, et le bundle et la feuille de style peuvent finir mélangés entre
deux versions différentes.

| | Adresse |
|---|---|
| **bundle (dernière)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **bundle (figée)** | <code>{{ CDN_BUNDLE }}</code> |
| **feuille (dernière)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **feuille (figée)** | <code>{{ CDN_SHEET }}</code> |
| **bundle** (unpkg) | `https://unpkg.com/nabi-note` |

Le bundle voyage à l'intérieur même de la publication npm, donc **le CDN n'est pas une
publication à part.**

---

## Côté lecture

Une page qui ne fait que **montrer** un HTML enregistré ne monte aucun éditeur. Accrochez la même
feuille de style, posez la valeur dans un `.nabi-content`, et elle ressort exactement comme elle
avait l'air dans l'éditeur.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- la valeur enregistrée avec getHtml() -->
</div>
```

**Si vous avez enregistré un nabi-tree (JSON) plutôt que du HTML**, dessinez-le sur place sans
monter d'éditeur. Cette porte ne reçoit que deux choses, la valeur enregistrée et la liste des
wings enregistrées.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['une ligne de commentaire'] }]   // nabi-tree reçu du serveur
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Si ce n'est pas un nabi-tree, la réponse est `null`, et une valeur qui passe ne diffère pas d'un
seul caractère du `getHtml()` que rendrait l'éditeur — le filtrage du XSS s'y fait au même
endroit. Cette porte n'utilise pas le DOM, elle tourne donc telle quelle côté serveur (Node.js) :
la même porte ouvre le chemin qui fabrique le HTML à l'avance côté serveur avant de l'envoyer
(voir [{{ t('menu_intro_ssr') }}](./ssr#rendre-seulement-la-valeur-enregistrée-sans-monter-d-éditeur)).

Un serveur qui importe le paquet via npm utilise **`nabi-note/ssr`** plutôt que le bundle
global — ce point d'entrée ne porte que ce qu'il faut pour dessiner, la surface d'édition et les
outils d'écran n'y sont pas chargés.

Ce seul fichier de feuille de style porte **le CSS de chaque wing** — le fichier ne peut pas
savoir lesquelles vous avez enregistrées, il les embarque donc toutes.

Ce que vous voyez est entièrement pris en charge par la feuille de style, mais **le tri de tableau
et la coloration du code sont l'affaire du JavaScript côté lecture** — réordonner les lignes en
cliquant sur un en-tête de colonne, découper le texte du code pour y poser des couleurs, cela le
CSS ne le peut pas. Pour l'avoir, branchez le runtime de lecture par une seule porte.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'fr' })
</script>
```

- Sans ce branchement, le document reste parfaitement lisible — seul un tableau dont le tri est
  activé ne trie pas, et le code reste d'une seule couleur.
- Le tri de tableau ne s'attache qu'aux tableaux dont le tri a été activé dans l'éditeur (la marque
  `data-nabi-sortable` reste dessus).
- La coloration du code répond avec le tokenizer embarqué, sans dépendance nécessaire. Pour un
  surligneur comme Shiki, branchez-le par le crochet `{ locale: 'fr', highlight }` — ce poids
  reste à la charge de la page qui le branche.
- Le bundle global `NabiNote` ne porte pas cette porte — pour qu'une page de lecture ne charge pas
  l'éditeur en entier, `nabi-note/viewer` vit à part. Un hôte qui importe via npm branche la même
  porte dans l'aperçu aussi, comme dans
  [{{ t('menu_intro_usage') }}](./usage#on-branche-le-runtime-de-lecture-dans-l-aperçu).

---

## Documents suivants

- [{{ t('menu_intro_usage') }}](./usage) — la voie npm : l'assemblage, les entrées et les sorties en entier
- [{{ t('menu_wing_custom') }}](../wing/custom) — fabriquer soi-même une mise en forme absente

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// Le numéro de version n'est jamais écrit à la main — il est lu directement dans le package.json de nabi-npm
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
