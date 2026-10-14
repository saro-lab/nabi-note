---
title: Details
description: Fassen Sie eine Zusammenfassung und einen Textkörper zusammen und speichern Sie, ob er geöffnet beginnt.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Details

Gruppieren Sie eine kurze Zusammenfassung und einen Textkörper in einem Block. Wenn Sie ihn über die Symbolleiste erstellen, geben Sie zuerst die Zusammenfassung ein und fahren Sie fort, Inhalte darunter zu schreiben.

Der mit dem Dreieck festgelegte Öffnungszustand wird im Dokument gespeichert und bestimmt den Anfangszustand der veröffentlichten Ansicht. Auch beim Bearbeiten lässt sich der Block durch Klicken auf das Dreieck öffnen und schließen.

Innerhalb einer Tabellenzelle oder eines anderen Blocks wird nur der betreffende Details-Block geöffnet oder geschlossen. Befindet sich der Cursor oder die Auswahl im gerade geschlossenen Inhalt, wird er beziehungsweise sie nach außen versetzt; eine Auswahl an anderer Stelle bleibt erhalten.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS-Stile

Stilieren Sie den Details-Block mit `.nabi-content details` und den Titel mit `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

Das Attribut `open` ist der vom Autor gespeicherte Anfangszustand. CSS kann diesen Zustand stilisieren, aber es ist besser, den Zustand selbst nicht zu erzwingen.
