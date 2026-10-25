---
title: Tiefstellung
description: Hebt den ausgewählten Text unter die Grundlinie.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tiefstellung

Zeigt den ausgewählten Text kleiner unterhalb der Grundlinie an. Das eignet sich für Schreibweisen mit tiefgestellten Zeichen, etwa die chemische Formel `H₂O`. Die Formatierung fügt keine Formelberechnung hinzu, sondern dient dazu, die Schreibweise zu erhalten.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
