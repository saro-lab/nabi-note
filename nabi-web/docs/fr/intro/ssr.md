---
title: Prise en charge du SSR
description: Pré-rendez les documents enregistrés côté serveur, puis reprenez l'éditeur et la barre d'outils instantanément côté client avec l'hydratation.
---

# Prise en charge du SSR (rendu côté serveur)

## Rendre les documents enregistrés (écrans en lecture seule)

Un écran qui ne fait qu'**afficher** un document — une liste de commentaires ou une page d'article — n'a pas besoin d'instance d'éditeur. Pour rendre un document en HTML, seule la liste des wings enregistrées (`registry`) est nécessaire, d'où une fonction de rendu réservée au serveur.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// À créer une fois au démarrage du serveur, puis à réutiliser pour toutes les requêtes.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['une ligne de commentaire'] }]   // nabi-tree lu depuis la base

renderStoredHtml(saved, registry)        // '<p>une ligne de commentaire</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">une ligne de commentaire</p>'
```

**`nabi-note/ssr` est un point d'entrée léger qui ne contient que la logique de rendu.** Il ne référence jamais la surface d'édition (`surface`) ni les outils d'écran (`ui`), et des tests unitaires d'architecture garantissent qu'aucun code DOM ne se glisse dans le paquet serveur. Si votre environnement charge déjà le paquet complet de l'éditeur, les mêmes fonctions sont aussi disponibles depuis le paquet `nabi-note`.

| Fonction | Description |
|---|---|
| `renderStoredHtml(json, registry, options?)` | le HTML à enregistrer et publier — la même valeur que `getHtml()` de l'éditeur |
| `renderStoredEditorHtml(json, registry, options?)` | le HTML pour initialiser l'éditeur — la même valeur que `getEditorHtml()` (porte `data-key`) |

- **N'utilise aucune API DOM.** S'exécute directement dans un environnement serveur comme Node.js.
- **Renvoie `null` si ce n'est pas un nabi-tree valide.** Les règles de validation sont celles de `setJson()`. Une entrée invalide ne lève jamais d'exception — la fonction renvoie `null` et journalise la cause via `console.error`.
- **Ne diffère en rien de ce que produit l'instance de l'éditeur.** Les deux passent par le même pipeline de normalisation puis d'assemblage, donc le filtrage XSS s'applique de façon identique.
- Le paramètre `options` accepte `{ allowLocalUrls?: boolean }` — le même rôle que l'option de même nom sur `createNabiWith`.

**Les mêmes données de nabi-tree produisent toujours le même `data-key`.** Vous pouvez donc pré-rendre le HTML initial de l'éditeur côté serveur avec `renderStoredEditorHtml`, l'envoyer au client, puis le monter avec l'option `hydrate: true` — l'éditeur s'active instantanément, sans nouveau rendu ni scintillement.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Même si le rendu serveur et le rendu client venaient à différer, le client revient automatiquement à un rendu normal — il suffit donc que le serveur et le client partagent la même liste de wings (`registry`).

::: tip La page d'accueil de ce site fonctionne exactement ainsi, par hydratation SSR
Le document de la démo d'accueil est **pré-rendu au moment du build avec `renderStoredEditorHtml`** puis intégré au HTML ; une fois le script client chargé, `hydrate` réveille l'éditeur par-dessus. Le texte est donc visible immédiatement, avant même le chargement du JS — aucun décalage de mise en page (CLS).
:::

---

## Pré-rendre la barre d'outils

La disposition des boutons de la barre d'outils **ne dépend jamais du contenu du document.** Elle ne se construit qu'à partir de la liste des wings enregistrées, de la langue d'affichage (locale) et de l'ordre des groupes — le résultat est donc déterministe. Rendez-la une fois au démarrage du serveur, mettez-la en cache, et réutilisez-la pour toutes les requêtes.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'fr' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Intégrez cette chaîne HTML dans le conteneur de la barre d'outils et envoyez-la au client — `mountToolbar` reconnaît côté navigateur le balisage déjà présent et **se contente de brancher les écouteurs d'événements, sans redessiner.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Portez vous-même `class="nabi-toolbar-row"` sur le conteneur
Si vous livrez une barre d'outils pré-rendue, la rangée doit porter `class="nabi-toolbar-row"` dès le premier affichage. Si elle manque, la classe n'est ajoutée qu'au moment du montage — et le padding qui l'accompagne apparaît alors, ce qui **décale visiblement la rangée de boutons.**
:::

- **Sûr même en cas de structure différente.** Si le HTML livré diffère de la liste de wings actuelle, le client le redessine immédiatement — rien ne reste cassé.
- **Une barre d'outils pré-rendue démarre dans son état par défaut** (rien d'enfoncé, rien de caché). L'état enfoncé (`aria-pressed`) et la visibilité contextuelle dépendent de la position du curseur, et se synchronisent automatiquement une fois le client monté.
- **N'utilisez ceci que sur les écrans contenant un éditeur.** Une page purement en lecture n'a pas besoin de barre d'outils.

**Les boutons d'aperçu et de plein écran se pré-rendent de la même façon.** Comme ce sont des composants d'outils de vue et non des wings, rendez-les séparément avec `renderViewToolsHtml`.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'fr' })
// '<span class="nabi-tools">…</span>'
```

::: tip La barre d'outils de la démo d'accueil est elle aussi pré-rendue
La barre d'outils de la démo d'accueil est **pré-rendue au moment du build avec `renderToolbarHtml` et `renderViewToolsHtml`**, et `mountToolbar`/`mountViewTools` reconnaissent cette rangée et se contentent de brancher les événements. C'est pourquoi vous ne voyez jamais des dizaines d'icônes apparaître avec retard.
:::

---

## Documents suivants

- [{{ t('menu_intro_usage') }}](./usage) — installation via npm et guide complet d'utilisation de l'éditeur
- [{{ t('menu_intro_cdn') }}](./cdn) — avec un seul tag `<script>`, sans outil de build

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
