---
title: Ausrichtung
description: Ändert die horizontale Ausrichtung für Absätze und Objektblöcke.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ausrichtung

Richte den aktuellen Absatz oder die Absätze im ausgewählten Bereich links, zentriert oder rechts aus. Objekte, die in einem Absatz enthalten sind, wie Bilder, Videos und Tabellen, werden über den sie umgebenden Absatz ausgerichtet.

Die Ausrichtung wird als Absatzattribut gespeichert, nicht als Textformatierung. Codeblöcke sind von der Ausrichtung ausgeschlossen, da die Einrückung dort eine Bedeutung hat.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
