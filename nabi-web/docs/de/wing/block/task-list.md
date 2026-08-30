---
title: Aufgabenliste
description: Eine Liste, die den Abschlussstatus mit dem Dokument speichert.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Aufgabenliste

Eine Liste mit Abschlussstatus. Geben Sie `[ ]` oder `[x]` gefolgt von einem Leerzeichen in einem leeren Absatz ein, oder erstellen Sie einen über die Symbolleiste, und klicken Sie dann auf das Kontrollkästchen, um seinen Status zu ändern.

Der geprüfte Zustand wird mit jedem Element im Dokument gespeichert. Wenn ein Element geteilt wird, folgt der geprüfte Zustand dem Element, das den Text behält, nicht dem leeren Element davor, sodass das Teilen einer abgeschlossenen Aufgabe den Status nicht unerwartet umkehrt.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
