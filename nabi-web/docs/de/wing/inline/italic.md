---
title: Kursiv
description: Markierten Text kursiv formatieren.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kursiv

Stellt den ausgewählten Text kursiv dar. Damit lassen sich etwa Werktitel oder fremdsprachige Wörter dezent vom Fließtext abheben. Erneutes Klicken in einem bereits kursiven Bereich entfernt die Formatierung.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
