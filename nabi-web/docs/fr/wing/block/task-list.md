---
title: Liste de tâches
description: Une liste qui stocke l'état d'achèvement avec le document.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Liste de tâches

Une liste avec un état d'achèvement. Tapez `[ ]` ou `[x]` suivi d'un espace dans un paragraphe vide, ou créez-en un depuis la barre d'outils, puis cliquez sur la case à cocher pour changer son état.

L'état coché est stocké avec chaque élément du document. Lorsqu'un élément est divisé, l'état coché suit l'élément qui conserve le texte plutôt que l'élément vide avant lui, donc diviser une tâche terminée ne change pas l'état de manière inattendue.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
