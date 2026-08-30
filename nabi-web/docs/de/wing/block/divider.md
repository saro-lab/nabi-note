---
title: Trennlinie
description: Fügt eine horizontale Linie ein, die den Dokumentfluss trennt.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Trennlinie

Eine horizontale Linie, die den Fluss des Dokuments trennt. Geben Sie drei oder mehr Bindestriche in einen leeren Absatz ein und drücken Sie die Eingabetaste, oder fügen Sie eine über die Symbolleiste ein.

Eine Trennlinie ist ein unabhängiger Block ohne Text, daher übernimmt sie keine Formatierungen wie Überschriften oder Farben. Verwenden Sie sie nur, um die Absätze vor und nach ihr zu trennen.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
