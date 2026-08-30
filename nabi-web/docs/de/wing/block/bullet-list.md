---
title: Aufzählungsliste
description: Listen Sie mehrere Elemente ohne Nummerierung auf.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Aufzählungsliste

Eine Aufzählungsliste stellt mehrere Elemente ohne Reihenfolge dar. Geben Sie `-` gefolgt von einem Leerzeichen in einem leeren Absatz ein oder wechseln Sie dazu über die Symbolleiste. Ausgewählte Absätze können auch gleichzeitig zu einer Liste gruppiert werden.

Innerhalb einer Liste rückt Tab eine Ebene ein und Shift+Tab eine Ebene aus. Enter erstellt das nächste Element, und das erneute Drücken von Enter bei einem leeren Element beendet die Liste.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
