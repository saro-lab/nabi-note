---
title: Lien
description : Connecter des adresses web sûres et afficher les pièces jointes téléchargées.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lien

Sélectionnez du texte et attachez-y une adresse. Si vous saisissez une adresse sans avoir sélectionné de texte, l'adresse elle-même est insérée comme texte du lien. La saisie d'une adresse `http://` ou `https:` suivie de la touche Espace ou Entrée la transforme également en un lien.

Les liens ne stockent que les chemins `http:`, `https:` et ceux du même site commençant par `.` ou `/`. Les adresses dont l'origine ne peut pas être clairement identifiée, telles que `javascript:` ou `//example.com`, sont rejetées. Les liens de pièces jointes créés par des téléchargements stockent également des informations sur le fichier et ne peuvent pas être créés manuellement comme les liens ordinaires.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

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
