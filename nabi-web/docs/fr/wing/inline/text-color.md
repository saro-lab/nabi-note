---
title: Couleur du texte
description: Appliquez un nom de couleur autorisé au texte sélectionné.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Couleur du texte

Appliquez un nom de couleur au texte sélectionné. La valeur stockée n'est pas une chaîne de couleur CSS ; il s'agit d'un nom autorisé, et la couleur réelle est définie par la variable CSS `--nabi-tc-<name>`. Cela permet au même document de rester lisible dans les thèmes clair et sombre.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Si `values` est omis, la palette par défaut est `green`, `coral`, `violet`, `amber` et `blue`. Si vous réduisez la liste, d'autres couleurs sont rejetées par les commandes et lors du chargement des documents.

## Styles CSS

Le document stocke uniquement des noms de couleur. Définissez les couleurs réelles de l'éditeur et de la vue publiée avec des variables CSS.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Vérifiez le contraste avec la couleur de fond. Dans un thème sombre, le même nom de couleur peut recevoir une valeur différente.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
