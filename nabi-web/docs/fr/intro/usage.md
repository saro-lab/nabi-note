---
title: Utilisation de base
description: Installez par npm, dressez un unique objet nabi, et échangez le document par quatre entrées et trois sorties.
---

# Utilisation de base

Voici la voie qui passe par npm. La voie d'une seule ligne de `<script>` se trouve dans
[{{ t('menu_intro_cdn') }}](./cdn).

```sh
npm i nabi-note
```

---

## On assemble les pièces

C'est l'hôte qui bâtit les emplacements et raccorde les mount un par un. Voici la composition
minimale, et les exemples que vous croiserez dans chaque page d'aile ne sont que ce squelette
augmenté d'une wing ou deux.

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'fr' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'fr' })
mountSticky({ root: app, surface })

// À chaque changement de valeur — accrochez votre code ici
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

C'est l'hôte qui bâtit les emplacements, mais **c'est le cœur qui sait à quoi ils ressemblent** —
chaque mount pose lui-même `.nabi-toolbar-row`, `.nabi-context` et `.nabi-editing` sur sa propre
boîte, et dresse aussi lui-même sa boîte à outils. Autrement dit, l'hôte n'a aucune mise en page à
écrire, et c'est pourquoi le balisage ci-dessus ne porte que trois classes.

- **`class="nabi"`** — les jetons de couleur et les styles ne vivent qu'à l'intérieur. C'est aussi
  la boîte que le plein écran fixe d'un bloc, donc la barre d'outils et la zone d'édition doivent
  s'y trouver **ensemble**.
- **`class="nabi-toolbar"`** — noue la ligne de la barre d'outils et la ligne contextuelle en un
  seul bloc pour qu'elles restent **collées (sticky)** ensemble. Les coller séparément fait
  bondir le texte quand la ligne contextuelle apparaît, et l'écran tremble.
- **`class="nabi-content" contenteditable`** — la zone d'édition elle-même.

Si le site a un bandeau fixe, descendez l'éditeur d'autant avec `--nabi-sticky-top` ; et si vous
ajoutez `mountSticky()`, le cœur mesure ce qu'un clavier mobile a poussé hors de l'écran et le
redonne.

**C'est l'hôte qui accroche la feuille de styles.** Avec un bundler, `import 'nabi-note/nabi.css'`
suffit ; pour n'embarquer que ce que portent les wings enregistrées, appelez
`injectSheets(document, collectSheets(registry))`. **Pour une page dont le document est pré-rendu
côté serveur, préférez la voie du fichier** — l'injection ne s'attache qu'une fois le JavaScript de
l'éditeur arrivé, et entre-temps le document se dessine une fois nu.

**La langue décide aussi de la direction du texte.** Donnez l'arabe (`ar`) ou l'ourdou (`ur`) et le
`dir="rtl"` se pose à la racine de ce mount, qui se tient alors de droite à gauche — même si la
page ne dit rien du tout via `<html dir>`. **Sans `locale`, rien ne bouge** : on ne recouvre pas la
direction qu'un hôte tient déjà lui-même en main. `localeDirection(code)` répond quelle direction
va avec quelle langue.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // la zone d'édition passe en RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // la barre d'outils aussi, comme un miroir
```

La langue d'affichage se décide par mount avec `locale` — le texte du document ne bouge pas,
seuls changent les noms de la barre d'outils et de la ligne contextuelle. **L'hôte ne déclare la
locale qu'une seule fois** — en la rangeant dans un objet partagé (`shared`) comme dans l'exemple
ci-dessus et en le transmettant à chaque mount, la barre d'outils pose aussi sa `locale` sur le
cœur en se dressant (`nabi.$bindLocale`), si bien que ce que dit le cœur (les toasts, par exemple)
sort dans la même langue. Un endroit sans barre d'outils la donne par l'option `locale` de
`createNabiWith`. Pour dessiner un sélecteur, servez-vous de `LOCALES` (la liste des codes)
exportée par le paquet.

### Le texte d'invite d'un éditeur vide

Un éditeur sans rien dedans dresse, sur sa première ligne, un texte d'invite en grisé. Il
disparaît dès qu'un seul caractère entre, et revient dès que tout est effacé de nouveau. **Il
s'affiche sans rien faire de plus** — le texte vient du dictionnaire du cœur et suit donc la
langue de ce mount. C'est **la direction du texte** qui décide de sa place (à gauche en LTR, à
droite en RTL) — même si la ligne elle-même est centrée ou alignée à droite, le texte d'invite ne
la suit pas.

```ts
mountSurface({ nabi, registry, root: surface, placeholder: 'Laissez une note ici' })
mountSurface({ nabi, registry, root: surface, placeholder: 'Première ligne\nDeuxième ligne' })   // plusieurs lignes
mountSurface({ nabi, registry, root: surface, placeholder: '' })   // sans texte d'invite
```

Un retour à la ligne (`\n`) devient une vraie ligne. La zone d'édition se dresse par défaut à
`12.5rem` de haut ; si vous en avez besoin de plus, soulevez-la avec `--nabi-content-min-height`.
Cette valeur ne s'applique **qu'à la surface d'édition** — sur un document publié ou en aperçu,
c'est le texte lui-même qui y définit la hauteur.

**Le texte d'invite est une couche de son propre droit.** Il s'est dressé sur le `::before` de la
racine d'édition, si bien qu'il est **inchangé par la mise en forme du document** — que la première
ligne soit un titre, centrée ou portant une lettrine. Seule la direction du texte décide de sa
place.

Le texte entre par `--nabi-placeholder`, à la racine de la zone d'édition, et c'est la feuille de
style qui le dessine. Pour changer sa couleur ou son allure, réécrivez cette règle.

```css
.nabi-content.nabi-editing:has(> :is(p, h1, h2, h3, h4, h5, h6):only-child > br:only-child)::before {
  color: #999;
}
```

Pour ne changer que la couleur, vous n'avez même pas besoin de réécrire la règle en entier —
`--nabi-placeholder-color` suffit.

| Pièce | Obligatoire | Ce qu'elle fait |
|---|---|---|
| `createNabiWith(wings, options?)` | oui | renvoie `{ nabi, registry }`. N'a pas besoin du DOM |
| `mountSurface({ nabi, registry, root })` | oui | réaccorde le caret, l'IME et la saisie au nabi-tree. Attache aussi l'`attach` de chaque wing enregistrée |
| `mountToolbar({ nabi, registry, root, surface?, locale?, file? })` | non | la barre d'outils principale. Sans elle, on édite quand même directement par `applyCommand()`. Branchez la réponse de `mountFile()` sur `file` et **la plate-forme d'enregistrement se dresse sans câblage** — le bouton d'enregistrement et <kbd>⌘</kbd><kbd>S</kbd> l'ouvrent. Laissez-le dehors et le geste vient à l'hôte par `onHost('save')`, comme avant. `surface` est aussi **le sol où vivent les accélérateurs** (voir [Où se font entendre les accélérateurs](#où-se-font-entendre-les-accélérateurs)) |
| `mountContextToolbar({ nabi, registry, root, surface? })` | non | la ligne contextuelle propre à la position du caret (lignes et colonnes du tableau, langage du code, adresse et nom du lien, etc.) |
| `mountHints({ toolbar, context?, root, surface? })` | non | les badges de raccourcis qui apparaissent après deux appuis rapides sur Shift |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | non | les deux boutons aperçu et plein écran. `root` est la boîte `.nabi` que le plein écran fixera, `onBody` est le crochet qui branche le runtime de lecture dans le corps de l'aperçu (ci-dessous) |
| `mountSticky({ root, surface, chrome?, nabi? })` | non | redonne ce qu'un clavier mobile a poussé hors de l'écran de la barre d'outils collée. Donnez `nabi` et **après une édition il repousse le caret pour qu'il sorte de sous la barre d'outils de lui-même** — laissez-le dehors et il marche comme avant, seulement quand l'hôte appelle `aim()` (voir [Clavier mobile et barre d'outils collée](#clavier-mobile-et-barre-doutils-collée)) |
| `mountPickedMark({ nabi, surface })` | non | le repère d'une image ou d'une vidéo choisie (le navigateur ne le dessine pas) |
| `mountFile({ nabi, store, registry, parse?, name? })` | avec save et open | enregistre en **trois** formats — `.nabi` · `.nhtml` · `.md` — et ouvre **quatre**, ces trois-là plus un `.html` ordinaire de dehors. **`registry` est obligatoire** — la liste des formats et l'assemblage du md et du HTML viennent tous d'elle. `parse` est la porte qui lit le HTML ; en navigateur on peut la laisser dehors et `parseNodes` prend sa place, mais en endroit sans tête (serveur, tests) il faut la passer pour que `.nhtml` et `.html` s'ouvrent. La `FileMount` qu'elle répond est **la manière canonique d'enregistrer et d'ouvrir sans wings** (`file.save()` · `file.saveAs(id, name)` · `file.formats()` · `await file.open()`) |
| `mountLocalHistory({ nabi, storage })` | avec localHistory | un enregistrement dans le navigateur à intervalle fixe |
| `mountUpload({ … })` + `mountUploadView({ … })` | avec upload | le déroulement du téléversement au dépôt, au collage et au choix de fichier, et son affichage |

**Les images, les cases à cocher, le glisser de cellules de tableau et la coloration du code
n'ont rien à monter séparément** — tout cela, les wings le tiennent dans `attach` et
`mountSurface` l'attache avec elles. Seule la coloration du code demande qu'on branche quelqu'un
pour colorer (`makeCodeAttach`, voir [{{ t('menu_block_code') }}](../wing/block/code)).

Pour remplacer une wing, démontez toutes ces pièces (`unmount()`) et refaites-les — le balisage
que tenait la wing ôtée retombe en texte brut sur place. La démo de ce site fonctionne
exactement ainsi : éteignez puis rallumez une puce de wing et tout l'assemblage se refait.

Les variables CSS, à commencer par les couleurs et les formes, se trouvent dans
[{{ t('menu_style_custom') }}](../style/custom).

### Où se font entendre les accélérateurs

Un seul endroit écoute les accélérateurs comme <kbd>⌘</kbd><kbd>S</kbd>, et c'est la barre d'outils.
Jusqu'où porte son oreille se décide par `mountToolbar({ surface })` — **seule une touche levée
à l'intérieur de cette surface ou des lignes de la barre d'outils** appartient à cet éditeur.

- **Avec deux éditeurs sur une page, vous devez passer `surface`.** Sans elle, la barre d'outils
  retombe à écouter le document entier, et alors <kbd>⌘</kbd><kbd>S</kbd> frappée dans l'éditeur du
  bas enregistre le texte de celui du haut. Même une touche frappée dans un champ de saisie qu'a
  bâti l'hôte se laisse prendre.
- **Si vous n'enregistrez aucune wing, la touche n'existe pas du tout.** L'enregistrement et
  l'ouverture vivent dans le cœur (`mountFile`), mais le bouton et l'accélérateur appartiennent à
  la wing — donc un éditeur bâti avec `wings().allBasic()` seul n'a pas de <kbd>⌘</kbd><kbd>S</kbd>
  ni de <kbd>⌘</kbd><kbd>O</kbd>. Le seul chemin de retour est `.use('save').use('open')`.
- **Quand il n'y a nulle part où accoster, la touche ne se laisse pas prendre.** Dans un montage
  où le bouton d'enregistrement n'accote à rien (ni `file` ni `onHost` branchée à la barre
  d'outils), la touche s'en va au navigateur comme la sienne. Nous ne prenons pas un raccourci
  pour un travail que nous ne faisons pas — le prendre en silence et le lecteur croit que son
  navigateur s'est cassé.

Pour enregistrer et ouvrir sans wings, servez-vous du bras que `mountFile` répond — en un éditeur
sans bouton ni accélérateur, c'est l'hôte qui appelle `file.save()` et `file.open()` lui-même.

### Clavier mobile et barre d'outils collée

`mountSticky` fait plus sur mobile maintenant — il regarde le clavier monter et descendre, et
ramène le caret **sous la barre d'outils et au-dessus du clavier**. Trois choses que l'hôte doit
savoir.

- **Il ne bouge que tant que l'éditeur a le foyer.** Avec le foyer ailleurs il ne fait pas un seul
  pas — la page ne doit pas bondir quand l'hôte pousse une valeur par `setHtml()`.
- **Tant qu'une main fait glisser l'écran il ne se déplace pas d'un seul pixel.** Il reste verrouillé
  250 ms après un glissement : enlever l'écran d'une main qui glisse, c'est justement ce que c'est
  que secouer.
- **Seule une change à l'échelle du clavier ouvre la porte.** Un bandeau d'adresse qui s'écrase
  (quelques dizaines de pixels) ne meut rien ; la porte ne s'ouvre que passé
  `max(120px, 15 % de la hauteur de la fenêtre)`.

La frappe ne pousse **que le strict nécessaire** — pousser l'écran jusqu'à la barre sur chaque
caractère serait inutilisable. Au moment où le clavier se lève, cependant, elle aligne la vue pour
que **la barre d'outils s'assoie en haut de la fenêtre**, et une fois que la fenêtre s'y est
réglée elle l'aligne une fois de plus.

`--nabi-bar-height` est la valeur sur laquelle ce pas s'appuie — `mountSticky` écrit la **hauteur
mesurée** du chrome auquel il s'attache sur la racine `.nabi`, et la feuille de `.nabi-content > *`
ajoute cette valeur au `scroll-margin-block-start`. **Ce n'est pas une valeur que l'hôte doive
fixer, mais l'explication de pourquoi le caret ne s'y endort jamais sous la barre d'outils** —
sans le mount, une estimation de `3.5rem` se dresse à la place, et elle tombe loin en dessous quand
la barre s'enroule sur deux lignes ou que la ligne contextuelle se dresse.

::: warning Ne pas bloquer le zoom avec la méta viewport
Safari sur iOS agrandit la page entière quand le foyer tombe sur un champ de saisie dont le texte
fait moins de 16px. Le cœur y stoppe en **faisant le texte plus gros** — `--nabi-touch-font-size`
(`16px` par défaut). Nous n'avons **pas** emprunté l'autre voie de bloquer le zoom lui-même avec
`user-scalable=no` ou `maximum-scale=1` : celle-là enlève au lecteur le droit d'agrandir. Si l'hôte
écrit cette méta sur sa propre page, l'étage que le cœur a posé devient sans sens — ne l'écrivez
donc pas.
:::

### On branche le runtime de lecture dans l'aperçu

L'aperçu n'est que le HTML statique sorti tel quel de `getHtml()`, donc ce que fait le
JavaScript **côté lecture** — trier un tableau, colorer du code — ne s'attache pas tout seul.
`attachViewer` de `nabi-note/viewer` branche tout cela d'une seule porte, et dans l'aperçu c'est
le crochet `onBody` qui l'accroche — changez ainsi la ligne `mountViewTools` de la composition
minimale ci-dessus.

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'fr',
  onBody: (body) => attachViewer(body, { locale: 'fr' }),
})
```

`onBody` est appelé quand le corps de l'aperçu se dresse, et la fonction de détachement qu'il
répond est appelée quand le voile se referme. Accrochez **cette même ligne** (`attachViewer`) sur
la page publiée aussi — l'aperçu doit correspondre à ce qui est publié, et c'est tout le sens de
ce crochet que d'y brancher la même porte des deux côtés. Les détails sont dans
[{{ t('menu_intro_cdn') }} ▸ Côté lecture](./cdn#côté-lecture).

La coloration du code répond par défaut avec le tokenizer embarqué (zéro dépendance). Un hôte qui
utilise un surligneur comme Shiki transmet le même crochet par `attachViewer(body, { locale,
highlight })` — avec le même highlighter que celui transmis à `makeCodeAttach({ highlight })`, les
couleurs de l'écran d'édition et de l'écran de lecture ne divergent pas.

---

## Les trois façons de sortir le document

```ts
nabi.getHtml()        // le HTML à enregistrer et publier
nabi.getJson()        // le nabi-tree (JSON)
nabi.getEditorHtml()  // le HTML de l'écran de l'éditeur tel qu'il est (porte data-key)
```

**La valeur à enregistrer est l'une des deux premières.** `getEditorHtml()` porte un repère
propre à l'écran (`data-key`), ce n'est donc pas la valeur à exporter — elle sert à
pré-rendre un éditeur côté serveur (SSR).

Le JSON qui sort a cette allure. **Le document est un tableau de blocs**, sans nœud racine qui
l'enveloppe.

```json
[
  {"w":"p","a":{"h":2},"ch":["Titre"]},
  {"w":"p","ch":["du texte ",{"w":"b","ch":["en gras"]}," et un ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["lien"]}]},
  {"w":"p","a":{"a":"c"},"ch":["centré"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["un"]}]},
    {"w":"li","ch":[{"w":"p","ch":["deux"]}]}]}]}
]
```

Quatre règles suffisent à le lire.

- **`w` est l'id de la wing qui dessine ce nœud.** Seuls deux mots sont réservés, `p`
  (paragraphe) et `br` (ligne) ; tout le reste est l'id d'une wing enregistrée — `b`, `ul`, `li`,
  par exemple. Un titre n'est pas une wing à part mais **un attribut du paragraphe**
  (`{"w":"p","a":{"h":2}}`).
- **Une chaîne, c'est du texte ; un objet, c'est une wing.** Il n'existe pas de champ séparé pour
  noter la sorte.
- **`a` est la valeur que porte cette wing** — l'adresse d'un lien, la couleur d'un surlignage, le
  niveau d'un titre. Absent s'il n'y en a pas. La valeur d'alignement s'appelle aussi `a`, mais
  comme elle vit **à l'intérieur** de ce champ, aucune confusion n'est possible
  (`{"w":"p","a":{"a":"c"}}` — un paragraphe centré).
- **Ce qui prend la place d'un paragraphe — tableau, liste, image — est enveloppé d'une seule
  couche de paragraphe** (voir le `ul` ci-dessus). C'est ce paragraphe qui porte l'alignement, et
  qui donne au caret un endroit où se tenir avant et après le bloc. En HTML, il sort en
  `<div data-nabi-p>` — parce qu'un `<p>` ne peut, par grammaire, contenir un tableau ou une
  liste.

L'arbre qui tourne à l'intérieur porte, sur chaque nœud, une chose de plus, `_id` — **l'adresse
interne par laquelle le caret désigne un nœud**. La plupart des éditions le renumérotent, et il
est retiré à la sortie (470 → 323 octets pour l'exemple ci-dessus). Ce qui sort peut revenir tel
quel dans `setJson()`.

---

## Les quatre façons d'entrer le document

```ts
createNabiWith(wings, { doc })   // démarrer sur un nabi-tree déjà fait
nabi.setJson(json)               // remplacer le document entier par un nabi-tree
nabi.setHtml(html)               // remplacer le document entier par une chaîne HTML
nabi.applyCommand('setHeading', { value: 2 })  // une commande d'édition (la porte qu'empruntent les wings)
```

Les quatre **répondent du succès ou de l'échec par un `boolean`.** Elles ne lèvent jamais
d'exception, et en cas d'échec laissent le document intact.

| Là où la réponse est `false` | |
|---|---|
| `setJson` | ce n'est pas la forme d'un nabi-tree (sauf les valeurs vides — voir plus bas) |
| `setHtml` | l'adaptateur `parseHtml` n'est pas branché (ci-dessous), ou l'édition est verrouillée (sauf les valeurs vides) |
| `applyCommand` | cette commande n'existe pas, ou **rien ne change** |

**Un document vide n'a qu'une seule forme — `[{"w":"p","ch":[]}]`.** Après un tout-sélectionner
puis supprimer, qui efface le texte entièrement, le titre ou l'alignement du premier bloc ne
survit pas. Vider une seule ligne parmi plusieurs est différent — comme l'intention est d'y
récrire, les attributs de ce paragraphe restent en place.

**Une valeur vide n'est pas une erreur de format, c'est un document vide.** Donner `null`,
`undefined`, une chaîne vide (même faite seulement d'espaces) ou un tableau vide n'est pas
rejeté — l'éditeur **s'installe sur un écran vide et répond `true`**, pour `setJson` comme pour
`setHtml` ; « vider » réussit donc toujours. Comme il n'y a rien à lire, `setHtml` n'a même pas
besoin de son adaptateur (ci-dessous) dans ce cas. Une valeur dont la forme est fausse reste
rejetée — vide et fausse sont deux choses différentes.

Cette dernière ligne est une règle à part entière — **quand rien ne change, c'est silencieux.**
Poser `setHeading` sur un paragraphe déjà titre de niveau 2 répond `false`, sans laisser ni point
d'annulation ni signal derrière soi.

Le troisième argument d'`applyCommand` est **la main qui appelle** — le `by` de
`applyCommand(name, args?, by?)` vaut `'keyboard' | 'pointer'` (le type `CommandHand`), et vaut
clavier si rien n'est précisé. Un seul endroit change selon ce choix : une commande de marque
posée sur un caret replié est mise en réserve si elle vient du clavier (elle s'applique à partir
du prochain caractère), mais répond `false` sans réserve si elle vient du pointeur, avec un toast
disant qu'il n'y a rien à appliquer. Si vous bâtissez votre propre interface pour appeler des
commandes, précisez `'pointer'` depuis la poignée du clic.

### `setHtml` a besoin d'un adaptateur

Lire du HTML est l'affaire du `DOMParser` du navigateur. Le cœur ne connaît pas le DOM, il faut
donc brancher cet adaptateur à la déclaration.

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` n'a besoin d'aucun adaptateur — vous pouvez donner tel quel, **depuis un serveur
(Node.js)**, le JSON que vous aviez enregistré. L'assemblage (`getHtml`) n'utilise pas non plus
le DOM, donc le chemin qui lit du JSON côté serveur pour en ressortir du HTML reste ouvert.

---

## Collage, enregistrement et ouverture

**Le collage lit un seul presse-papiers par plusieurs yeux** — `HTML`, `MARKDOWN`, `TEXT`, `NABI`.
Quand plus d'une porte de lecture existe, une petite plate-forme se dresse et en laisse choisir une ;
quand il n'en existe qu'une, elle ne demande rien. Un collage sans aucune lettre (fichiers seuls)
va à l'envoi.

**L'enregistrement porte trois formats** — `.nabi` pour l'original, `.nhtml` pour une page
autonome, `.md` pour la markdown qui tombe. **L'ouverture en reçoit quatre** — ces trois-là plus
un `.html` ordinaire de dehors. Pour que ces portes se dressent, `mountFile()` doit être branchée.

---

## Les alertes sortent en toast

Une erreur de téléversement, un avis de l'historique local, un mot comme « rien à appliquer » —
tout cela sort par **une seule voie, le toast.** Le cœur tient la boîte par défaut, vous n'avez
rien à brancher — une fois la barre d'outils dressée, il s'affiche à un endroit fixe sous elle
(cet endroit ne bouge pas même quand la ligne contextuelle apparaît puis disparaît).

- Trois niveaux existent — `'info' | 'warn' | 'error'`. Ce n'est pas le verdict de réussite ou
  d'échec, mais **le degré d'attention que doit y porter le lecteur.**
- Il se retire au bout d'une seconde par défaut (il s'estompe dès qu'il reste 0,5 seconde), et un
  clic le ferme aussi. Trois au maximum tiennent debout en même temps par défaut — au-delà, celui
  dont il reste le moins de temps part le premier.
- Le message peut porter des `\n`, et se dessine aussi bien en thème clair qu'en thème sombre.

Deux options ajustent le ton et une troisième change entièrement l'affichage, toutes dans
`createNabiWith`.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // durée de vie — 1000 ms par défaut. L'appelant peut aussi la fixer par appel
  toastMax: 5,     // plafond simultané — 3 par défaut
  // une page qui a déjà son propre système d'alertes ne change que l'affichage — la boîte par défaut du cœur ne se dessine jamais
  // toast: (level, message, ms) => user_callback(level, message),
})
```

C'est aussi la seule porte par laquelle une wing parle — `nabi.$toast(level, message, ms?)`. La
durée voyage avec le message, donc il n'y a pas besoin de rallonger la valeur par défaut entière
pour un seul message plus long.

---

## La façon dont l'éditeur s'adresse à la personne

Ouvrir un fichier a besoin d'une question du genre « il y a déjà un texte en cours. Ouvrir quand
même ? ». On branche cette boîte **une fois, à la déclaration**.

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | Forme |
|---|---|
| `message` | `(text: string) => void` — un seul message, sans réponse attendue |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — synchrone ou asynchrone, les deux acceptés |
| `choose` | `(question, options: ChooseOption[]) => number \| Promise<number>`, `ChooseOption` est `{label, icon?}`. **Si on ne le branche pas, la réponse vaut 0 (le haut).** La plate-forme de collage se dresse avec la barre d'outils si elle l'est, si bien qu'on n'a pas besoin de le brancher. |

**Le cœur ne se sert jamais tout seul de ceux du navigateur.** Une boîte grise ne doit pas
s'imposer sur une page qui a ses propres boîtes de dialogue, et un hôte plugin (IntelliJ, VS
Code) n'a même pas de `window.confirm`. Ces trois lignes sont à bâtir par l'hôte.

::: warning Sans réponse, la réponse est « non »
Une question à laquelle personne n'a répondu n'est pas un « oui » — elle veut dire ce que
signifient annuler, Échap ou fermer la fenêtre. L'endroit où atterrit cette réponse est « jeter
le texte en cours et ouvrir ? », donc l'absence de quelqu'un pour répondre ne doit pas mener à
jeter le texte. Sur un serveur (Node), cette valeur passe aussi tranquillement.
:::

**Cela appartient à un seul éditeur** — ce n'est pas global, donc deux éditeurs d'une même page
peuvent demander différemment. Les wings reçoivent la même chose (`nabi.$ask`) — cette histoire
est dans [{{ t('menu_wing_custom') }} ▸ Interface et actions](../wing/custom/ui).

---

## Le nom de cet éditeur et « a-t-il changé »

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <horodatage unix>-<nonce>, un par instance
nabi.isChanged() // le document a-t-il bougé depuis la dernière ligne de référence
```

`sessionId` est fabriqué une fois et ne change plus. L'horodatage dit quand cet éditeur s'est
dressé et se trie de lui-même, et le nonce départage deux éditeurs dressés à la même
milliseconde. C'est l'étiquette à accrocher à un brouillon, une ligne de journal ou une clé
d'enregistrement automatique.

**Trois choses retracent une nouvelle ligne de référence** pour `isChanged()` — donner un
document entier (`createNabiWith({ doc })`, `setJson()`, `setHtml()`), et annoncer qu'un
enregistrement a réussi.

```ts
nabi.$markSaved(savedDoc)   // une fois l'enregistrement réussi — donnez le document enregistré à cet instant-là
```

**Donnez l'arbre du moment où l'enregistrement a eu lieu** (pas l'arbre actuel). Le texte tapé
pendant un enregistrement lent doit rester « changé ». La wing de sauvegarde (`save`) appelle
ceci une fois le fichier réellement écrit. Enregistrer en `.nabi` fait passer `isChanged()` à
`false` — c'est l'original, donc le baseline se déplace. **Les sauvegardes en `.html` et `.md`
ne bougent pas le baseline** — ce sont des copies, et le document reste « changé ».

**Annuler jusqu'au point de départ redonne `false`** — le nabi-tree est immuable et se
renouvelle entièrement à chaque édition, donc on le sait sur place, sans parcourir ni hacher
pour savoir s'il s'agit du même document.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## Documents suivants

- [{{ t('menu_intro_ssr') }}](./ssr) — pré-rendre la valeur enregistrée et reprendre la main avec `hydrate`
- [{{ t('menu_intro_cdn') }}](./cdn) — un seul `<script>`, sans outil de build
- [{{ t('menu_wing_custom') }}](../wing/custom) — fabriquer soi-même une mise en forme absente

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
