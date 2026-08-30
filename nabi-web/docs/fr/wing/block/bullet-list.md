---
title: Liste à puces
description: Listez plusieurs éléments sans les numéroter.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Liste à puces

Une liste à puces présente plusieurs éléments sans ordre. Tapez `-` suivi d'un espace dans un paragraphe vide, ou basculez vers ce format depuis la barre d'outils. Les paragraphes sélectionnés peuvent également être regroupés en une liste en une seule fois.

À l'intérieur d'une liste, Tab indente d'un niveau et Shift+Tab désindente. Entrée crée l'élément suivant, et appuyer à nouveau sur Entrée depuis un élément vide termine la liste.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
