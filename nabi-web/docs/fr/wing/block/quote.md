---
title: Citation
description: Regroupez du texte cité ou séparez le contexte sur plusieurs paragraphes.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Citation

Regroupez du texte cité ou séparez le contexte sur plusieurs paragraphes. Tapez `>` suivi d'un Espace dans un paragraphe vide, ou basculez les paragraphes sélectionnés en citation depuis la barre d'outils.

Une citation peut contenir des paragraphes ordinaires ainsi que des blocs tels que des listes et des images. Le fait de basculer à nouveau la même plage la décompresse pour la remettre dans les paragraphes extérieurs.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Styles CSS

Stylisez les citations avec `.nabi-content blockquote` en modifiant les bordures et l'espacement.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Conservez la structure des paragraphes à l'intérieur de `blockquote`, et modifiez uniquement la présentation telle que l'espacement extérieur, les bordures et la couleur.
