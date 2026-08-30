---
title: Schriftgröße
description: Ändern Sie die Textgröße innerhalb der zulässigen Schritte.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Schriftgröße

Ändern Sie den ausgewählten Text in einen Schritt. Wenn ein Bereich ausgewählt ist, gilt der Schritt für diesen Bereich; wenn nur ein Cursor vorhanden ist, wird die Textgröße des aktuellen Absatzes geändert. Gespeicherte Daten enthalten nur zulässige Schritte, keine beliebigen Werte wie `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Wenn `values` weggelassen wird, werden die Schritte `xs`, `sm`, `lg` und `xl` verwendet. Wenn Sie die Liste eingrenzen, werden andere Schritte, die bereits in älteren Dokumenten vorhanden sind, beim Laden entfernt.

## CSS-Stile

Sie können Größen über gespeicherte-Schritt-Selektoren wie `.nabi-content [data-nabi-size="xs"]` ändern. Erfinden Sie keine beliebigen Schritte, die nicht im Dokument enthalten sind; passen Sie CSS nur innerhalb registrierter `values` an.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Das Beibehalten des Größenunterschieds zwischen den Schritten bewahrt die Bedeutung, die der Autor im Editor gewählt hat, wenn das Dokument veröffentlicht wird.
