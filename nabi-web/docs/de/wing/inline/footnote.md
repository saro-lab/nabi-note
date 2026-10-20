---
title: "Fußnote"
description: "Verknüpfen Sie ergänzende Erklärungen mit Nummern im Text und einer Liste am Dokumentende."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Fußnote

Verknüpfen Sie ergänzende Erklärungen mit Nummern im Text und einer Liste am Dokumentende.

Geben Sie über die Fußnotenschaltfläche der Werkzeugleiste Text ein, um eine Fußnote an der Cursorposition einzufügen. Bei einer Textauswahl wird sie am Ende eingefügt, ohne den ausgewählten Text zu ersetzen. Nummern werden nicht gespeichert, sondern automatisch nach der Dokumentreihenfolge vergeben.

Klicken Sie auf eine Nummer im Text, um den Inhalt in der Eigenschaftszeile zu bearbeiten. Verwenden Sie das Löschwerkzeug oder drücken Sie neben der Fußnote zweimal Backspace oder Delete, um sie zunächst auszuwählen und dann zu löschen. Die Liste darunter ist schreibgeschützt und verschwindet, wenn keine Fußnoten vorhanden sind.

In der Vorschau und auf veröffentlichten Seiten mit eingebundenem Viewer lässt sich der Inhalt durch Zeigen, Klicken oder Tippen auf eine Nummer lesen. Der Inhalt besteht aus einer Zeile Klartext und erscheint in serifenloser Schrift mit dem 0,875-Fachen der Grundschriftgröße des Textes. HTML wird wörtlich angezeigt.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
