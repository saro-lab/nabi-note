---
title: Famille de polices
description: Appliquer une famille de polices au texte sélectionné ou à un paragraphe.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Famille de polices

Appliquez une famille de polices au texte sélectionné. Si une plage est sélectionnée, seule cette plage change ; s'il n'y a qu'un curseur (caret), cela s'applique au texte du paragraphe actuel. Les fichiers de police réels et les valeurs `font-family` sont définis par le CSS du service.

Les familles par défaut sont `sans`, `serif`, `mono` et `cursive`. En particulier dans les services qui incluent du contenu coréen ou d'autres contenus multilingues, il est préférable de décider explicitement quelles polices chaque famille doit utiliser.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Si `values` est omis, toutes les familles par défaut sont utilisées. Seules les valeurs incluses dans `values` sont autorisées dans les documents.

## Styles CSS

Le document stocke uniquement le nom de la famille, et le CSS choisit les fichiers de police. Modifiez les variables sur le même conteneur pour l'éditeur et la vue publiée.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Si vous utilisez des polices web, chargez ces fichiers de police en premier. `cursive` manque souvent d'une bonne couverture pour de nombreuses langues, il est donc préférable de ne le fournir qu'après avoir choisi la police réelle que votre service utilisera.
