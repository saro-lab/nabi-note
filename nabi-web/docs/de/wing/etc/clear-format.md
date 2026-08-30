---
title: Formatierung löschen
description: Entfernt die Textformatierung und die Absatzformatierung aus der Auswahl.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Formatierung löschen

Entfernt die Textformatierung aus dem ausgewählten Bereich auf einmal. Zu den registrierten Standardmarkierungen wie Fettdruck, Farbe und Schriftart sowie zu den Absatzattributen wie Überschrift, Ausrichtung und Initialbuchstabe gehören diese ebenfalls. Ein schnaches zweimaliges Drücken der Esc-Taste führt dieselbe Aktion aus.

Es wandelt Dokumentstrukturen wie Listen, Tabellen, Zitate oder Bilder nicht in reinen Text um. Die äußere Ausrichtung von Bildern und Videos sowie die durch Uploads erstellten Anhangslinks bleiben unverändert.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Die Formatierungsflügel, die Sie löschen möchten, müssen ebenfalls ausgewählt sein, da sonst ihre Formatierung nicht entfernt werden kann.
