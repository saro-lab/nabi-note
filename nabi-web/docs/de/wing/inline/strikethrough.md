---
title: Durchgestrichen
description: Markierten Text durchstreichen.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Durchgestrichen

Zieht eine Linie durch die Mitte des ausgewählten Textes. So bleiben geänderte Formulierungen oder nicht mehr gültige Inhalte sichtbar, ohne sie zu löschen. Erneutes Anwenden auf denselben Bereich entfernt die Formatierung.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
