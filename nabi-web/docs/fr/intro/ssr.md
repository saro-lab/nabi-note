---
title: Prise en charge du SSR
description: Pré-rendez la valeur enregistrée côté serveur, et reprenez la main côté client avec hydrate.
---

# Prise en charge du SSR

## Rendre seulement la valeur enregistrée — sans monter d'éditeur

Un endroit qui **ne fait qu'afficher**, comme une liste de commentaires, n'a pas besoin d'éditeur.
Dessiner le document ne demande qu'une seule chose, la liste des wings enregistrées (`registry`),
et il existe une porte à part qui ne reçoit que cela.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// une fois, au démarrage du serveur — partagé quel que soit le nombre de valeurs enregistrées
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['une ligne de commentaire'] }]   // nabi-tree lu depuis la base

renderStoredHtml(saved, registry)        // '<p>une ligne de commentaire</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">une ligne de commentaire</p>'
```

**`nabi-note/ssr` est le point d'entrée qui ne porte que ce qu'il faut pour dessiner.** Il ne
touche aucun fichier de la surface d'édition (`surface`) ni des outils d'écran (`ui`) — un filet
l'impose — donc aucun code DOM ne se glisse dans le paquet serveur. La même porte existe aussi
dans `nabi-note` : une page qui charge déjà l'éditeur peut simplement s'en servir directement.

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | le HTML à enregistrer et publier — la même valeur que `getHtml()` |
| `renderStoredEditorHtml(json, registry, options?)` | le HTML de l'éditeur — la même valeur que `getEditorHtml()` (porte `data-key`) |

- **Aucune des deux n'utilise le DOM** — elles tournent telles quelles côté serveur.
- **Si ce n'est pas un nabi-tree, la réponse est `null`** — la règle de rejet est celle de
  `setJson()` (le document entier doit être un tableau). Elles ne lèvent jamais d'exception.
- **Ne diffère pas d'un seul caractère de ce que rend l'éditeur.** Comme elles traversent la même
  étape (normalisation puis assemblage), le filtrage du XSS s'y fait au même endroit — le côté
  affichage n'est jamais moins nettoyé.
- `options` n'a qu'un seul champ, `{ allowLocalUrls }` — le même sens que cette option de
  `createNabiWith`.

**La même valeur enregistrée obtient toujours le même `data-key`.** Le serveur peut donc
pré-rendre l'éditeur avec `renderStoredEditorHtml` et l'envoyer, et le navigateur reprend la main
avec `hydrate` sans redessiner l'écran.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

En cas de décalage, l'écran se redessine sur place à cet endroit — il suffit que le serveur et le
client partagent la même liste de wings.

::: tip La page d'accueil de ce site est cet échantillon même
Le document de la démo d'accueil est **pré-rendu au moment du build avec `renderStoredEditorHtml`**
et planté dans la page, et l'éditeur se réveille par-dessus avec `hydrate`. Le texte se lit donc
déjà avant même que le code de l'éditeur n'arrive — il n'y a pas de moment où une case vide se
remplit soudainement.
:::

---

## La barre d'outils aussi peut être pré-rendue

La rangée de boutons **ne regarde jamais le document.** Elle ne dépend que de la liste des wings
enregistrées, des mots et de l'ordre des groupes, donc ce qu'elle produit est **une constante** —
on l'appelle une fois au démarrage du serveur et on garde ce texte. Rien à rappeler à chaque
requête.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'fr' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Envoyez ce texte tel quel dans le conteneur de la barre d'outils, et côté navigateur `mountToolbar`
dessine avec **la même fonction.** Si la même rangée est déjà debout, **elle n'est pas redessinée,
seul le câblage se pose.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Portez aussi `class="nabi-toolbar-row"` sur le conteneur
Cette classe doit être présente **dès le tout premier dessin** quand vous envoyez une rangée
pré-rendue. Le cœur la pose lui-même au montage si elle manque, mais alors les marges de part et
d'autre s'ajoutent à ce moment-là et **la rangée de boutons se décale une fois sur le côté.** Si
l'hôte l'a déjà écrite, le cœur n'y touche pas (il ne retire que ce qu'il a lui-même posé).

```html
<div class="nabi-toolbar-row">rangée déjà pré-rendue</div>
```
:::

- **Un décalage ne casse rien** — si la rangée debout diffère de la liste de wings actuelle, elle
  est redessinée sur place. Seule la valeur pré-rendue est perdue, l'écran reste toujours juste.
- **La rangée pré-rendue est dans l'état « rien n'est enfoncé, rien n'est caché ».** L'enfoncement
  (`aria-pressed`) et le masquage dépendent du caret, que le serveur ne connaît pas. Si des
  boutons se cachent selon le caret, quelques-uns peuvent disparaître après le montage et la
  rangée se replier de nouveau.
- **Ne l'employez que là où vous montez un éditeur.** Une page qui ne fait que lire n'a pas de
  barre d'outils et n'a donc aucune raison de recevoir ce texte.

**Les deux boutons aperçu et plein écran suivent la même voie.** Ce ne sont pas des wings mais des
pièces du voile, donc ils n'entrent pas dans le texte de la barre d'outils ci-dessus — ils se
dessinent à part, dans le conteneur où `mountViewTools` se dresse.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'fr' })
// '<span class="nabi-tools">…</span>'
```

::: tip La page d'accueil de ce site est cet échantillon même
La barre d'outils de la démo d'accueil est **pré-rendue au moment du build avec
`renderToolbarHtml` et `renderViewToolsHtml`** et plantée dans la page, et `mountToolbar` /
`mountViewTools` reconnaissent cette rangée et ne posent que le câblage. Il n'y a donc pas de
moment où trente-cinq icônes se remplissent après coup.
:::

---

## Documents suivants

- [{{ t('menu_intro_usage') }}](./usage) — la voie par npm, assemblage, entrée et sortie
- [{{ t('menu_intro_cdn') }}](./cdn) — un seul `<script>`, sans outil de build

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
