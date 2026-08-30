---
title: Kapitälchen
description: Beginnen Sie den Fließtext mit einem großen Anfangsbuchstaben.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kapitälchen

Platzieren Sie den ersten Buchstaben eines Absatzes in einer größeren Größe und lassen Sie die folgenden Zeilen daran vorbeifließen. Dies ist eine Formatierung auf Absatzebene, daher wird sie nicht nur auf einen Teil eines ausgewählten Wortes angewendet.

Die veröffentlichte Ansicht und die Bearbeitungsansicht behalten dieselbe Form bei. Während der Bearbeitung ist der erste Buchstabe in ein echtes Element eingebettet, sodass Cursor- und Löschpositionen nicht verrutschen; dieses Element ist nicht im gespeicherten Dokumentinhalt enthalten.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS-Stile

Die veröffentlichte Ansicht und die Bearbeitungsansicht verwenden unterschiedliche Selektoren für den ersten Buchstaben. Die veröffentlichte Ansicht verwendet `[data-nabi-dropcap="1"]::first-letter`, während die Bearbeitungsansicht das echte Element `[data-nabi-dropcap-letter]` verwendet. Wenn Sie sichtbare Werte wie Farbe, Schriftart oder Größe ändern, schreiben Sie beide Selektoren zusammen, damit Bearbeitung und veröffentlichter Output gleich aussehen.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Wenn Sie Größe und Zeilenhöhe ändern, wenden Sie dieselben Werte auf beide Selektoren an.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Kapitälchen berechnen den Zeilenfluss um den ersten Buchstaben herum, sodass das Ändern nur einer Seite oder das Zuweisen zu großer Werte die WYSIWYG-Form zerstören kann. Vermeiden Sie dennoch, dem Editor eine neue `::first-letter`-Regel hinzuzufügen. Stylen Sie im Editor nur das vorhandene `[data-nabi-dropcap-letter]`.
