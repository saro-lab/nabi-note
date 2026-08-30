---
title: Code
description: Stockez du code sur plusieurs lignes avec la langue utilisée pour la coloration syntaxique.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Code

Insérez du code sur plusieurs lignes séparément du texte ordinaire du corps. Tapez trois accents graves dans un paragraphe vide et appuyez sur Espace ou Entrée, ou passez à un bloc de code depuis la barre d'outils. Si vous ajoutez un nom de langue après les accents graves, comme `ts`, ce nom est également enregistré.

Le nom de la langue est un identifiant utilisé pour la coloration syntaxique, et des noms en dehors de la liste enregistrée peuvent également être tapés manuellement. Étant donné que le contenu du code et l'indentation doivent être préservés, les blocs de code n'acceptent pas l'alignement des paragraphes.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Connecter un colorateur syntaxique

L'enregistrement du bloc de code utilise la coloration par défaut dans l'éditeur. Pour colorer le code également dans la vue publiée, connectez `nabi-note/viewer`. Le visualiseur trouve `pre > code` et lit la valeur `data-nabi-lang` de l'élément parent comme nom de langue. Si cette valeur est manquante, il vérifie la classe `language-...` sur l'élément `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'fr',
})

// After replacing the published HTML
viewer.refresh()

// When closing the screen
viewer.unmount()
```

S'il n'y a pas de colorateur séparé, ou si ce colorateur ne peut pas gérer la langue, le tokenizeur intégré sans dépendance le colore à la place. Les spans de tokens insérés par le colorateur existent uniquement à l'écran et ne sont pas réécrites dans le JSON sauvegardé ni dans le HTML publié original. `refresh()` et `unmount()` suppriment ces spans et reconnectent depuis le code original actuel.

### Comment le site NABI connecte Shiki

Le site NABI charge le colorateur dynamiquement afin que Shiki n'entre pas dans l'écran initial ni dans le bundle SSR. `loadCodeHighlighting()` dans `nabi-web/docs/.vitepress/src/highlight.ts` crée le noyau de Shiki, puis récupère une grammaire de langue uniquement lorsque du code dans cette langue est réellement nécessaire. L'exemple ci-dessous utilise la même connexion dans la vue publiée.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'fr',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// When closing the screen
stop?.()
viewer.unmount()
```

Lorsqu'une langue apparaît pour la première fois, le téléchargement de la grammaire commence. Jusqu'alors, le bloc est affiché avec le tokenizeur intégré ou comme texte brut. Une fois la grammaire arrivée, `onGrammarLoaded()` appelle `viewer.refresh()` et colore à nouveau le bloc. Ainsi, seules les langues nécessaires sont téléchargées, et une grammaire qui arrive en retard est appliquée sans autre navigation de page.

Le côté éditeur utilise la même fonction `highlight`. La démo du site NABI remplace uniquement l'`attach` par défaut de `codeWing` avec `makeCodeAttach({ highlight, version })`. `version` change chaque fois qu'une grammaire arrive et agit comme un signal pour repeindre le code qui a déjà été dessiné. Un service autonome peut implémenter la connexion de la vue publiée en premier, puis ajouter cette approche uniquement si la coloration Shiki est également nécessaire pendant l'édition.

## Styles CSS

Stylisez les blocs de code avec `.nabi-content pre`, et le code avec `.nabi-content pre > code`. Ne modifiez pas `white-space`, car il affecte les sauts de ligne du code et l'édition. Les couleurs des tokens peuvent être modifiées avec les sélecteurs `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
