---
title: Sortierte Liste
description: Verwandeln Sie sortierte Elemente in eine nummerierte Liste.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Sortierte Liste

Verwandeln Sie Elemente, bei denen die Reihenfolge wichtig ist, in eine nummerierte Liste. Geben Sie eine Zahl und einen Punkt ein, z. B. `1.`, gefolgt von einem Leerzeichen in einem leeren Absatz oder wechseln Sie ausgewählte Absätze über die Symbolleiste.

Die angezeigten Zahlen werden aus der Position der Elemente berechnet, sodass sie automatisch fortgesetzt werden, wenn Sie Elemente hinzufügen oder einrücken. Das Speichern einer benutzerdefinierten Startnummer und das Zählen ab dieser Zahl wird nicht unterstützt.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
