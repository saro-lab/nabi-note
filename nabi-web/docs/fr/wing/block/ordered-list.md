---
title: Liste ordonnée
description: Transformez les éléments ordonnés en une liste numérotée.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Liste ordonnée

Transformez les éléments dont l'ordre est important en une liste numérotée. Saisissez un chiffre suivi d'un point, comme `1.`, puis appuyez sur Espace dans un paragraphe vide, ou basculez depuis la barre d'outils pour convertir les paragraphes sélectionnés.

Les chiffres affichés sont calculés à partir de la position des éléments, donc ils continuent automatiquement lorsque vous ajoutez ou indentez des éléments. La sauvegarde d'un numéro de départ personnalisé et le comptage à partir de ce nombre ne sont pas fournis.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
