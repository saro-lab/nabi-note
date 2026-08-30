---
title: Überschrift
description: Verwandeln Sie einen Absatz in eine Überschrift und wählen Sie deren Ebene.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Überschrift

Verwandeln Sie einen Absatz in eine Überschrift und wählen Sie deren Ebene. Aktivieren Sie die Überschrift in der Symbolleiste und wählen Sie H1 bis H6 oder geben Sie `#` bis `######` gefolgt von einem Leerzeichen in einem leeren Absatz ein.

Eine Überschrift ist kein separater Blocktyp. Sie wird als Attribut eines Absatzes gespeichert. Wenn Sie erneut auf die Überschrift klicken, wird sie wieder zu einem normalen Absatz, sodass Sie nur die Ebene ändern können, während die Struktur des Textkörpers intakt bleibt.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
