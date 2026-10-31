---
title: Lien
description : Connecter des adresses web sûres et afficher les pièces jointes téléchargées.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lien

Sélectionnez du texte et attachez-y une adresse. Si vous saisissez une adresse sans avoir sélectionné de texte, l'adresse elle-même est insérée comme texte du lien. La saisie d'une adresse `http://` ou `https://` suivie de la touche Espace ou Entrée la transforme également en un lien.

Les liens ne stockent que les chemins `http:`, `https:` et ceux du même site commençant par `.` ou `/`. Les adresses dont l'origine ne peut pas être clairement identifiée, telles que `javascript:` ou `//example.com`, sont rejetées. Les liens de pièces jointes créés par des téléversements stockent également des informations sur le fichier et ne peuvent pas être créés manuellement comme les liens ordinaires.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Coller des URL

Si l’ensemble du contenu collé, sans les espaces qui l’entourent, est une URL `http://` ou `https://` valide, il est immédiatement inséré comme lien. Les URL dans des phrases, les textes contenant plusieurs URL et les chemins relatifs conservent le comportement de collage existant. Dans les blocs de code et les éditeurs sans wing de lien, le contenu reste du texte. Les données internes valides du presse-papiers copiées depuis l’éditeur sont prioritaires pour préserver leur mise en forme d’origine.

Utilisez le callback `onPasteUrl` de `mountSurface()` pour choisir le texte affiché du lien.

| Argument | Valeur |
| --- | --- |
| `url` | L’URL complète sans les espaces qui l’entourent |
| `isSameOrigin` | Indique si le protocole, l’hôte et le port de l’URL correspondent à l’origine du document contenant l’éditeur |
| `path` | Le chemin commençant par `/`, avec la requête et le fragment. Exemple : `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

Une chaîne renvoyée qui ne contient pas uniquement des espaces devient le texte affiché. Si le callback est absent, renvoie une valeur vide ou qui n’est pas une chaîne, ou échoue, l’URL collée reste le texte affiché. Les chaînes renvoyées ne sont jamais interprétées comme du HTML et ne modifient pas l’adresse du lien.

Le callback accepte aussi les fonctions `async` et les promesses. Le lien URL est inséré immédiatement pendant l’attente de la réponse ; un résultat valide reçu ensuite ne change que le texte affiché de ce lien. Un résultat tardif est ignoré si le lien a été modifié ou supprimé, si un nouveau document a été chargé ou si la surface a été démontée.

## Styles CSS

Stylisez les liens ordinaires avec `.nabi-content a`, et les liens de pièces jointes séparément avec `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Les parties `::before` et `::after` des liens de pièces jointes sont utilisées pour afficher l'icône du fichier et l'extension, il est donc généralement préférable de ne pas remplacer ni supprimer leur `content`.
