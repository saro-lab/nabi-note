---
title: Titre
description: Transformez un paragraphe en titre et choisissez son niveau.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Titre

Transformez un paragraphe en titre et choisissez son niveau. Activez le titre dans la barre d'outils et choisissez H1 à H6, ou tapez `#` à `######` suivi d'un espace dans un paragraphe vide.

Un titre n'est pas un type de bloc séparé. Il est stocké sous forme d'attribut sur un paragraphe. Appuyer à nouveau sur le titre le ramène à un paragraphe normal, vous permettant ainsi de modifier uniquement le niveau tout en conservant la structure du corps intacte.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
