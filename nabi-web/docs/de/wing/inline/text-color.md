---
title: Textfarbe
description: Wende einen erlaubten Farbnamen auf den ausgewählten Text an.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Textfarbe

Wende einen Farbnamen auf den ausgewählten Text an. Der gespeicherte Wert ist keine CSS-Farbangabe; es handelt sich um einen erlaubten Namen, und die tatsächliche Farbe wird durch die CSS-Variable `--nabi-tc-<name>` definiert. Das ermöglicht es, dass dasselbe Dokument sowohl im hellen als auch im dunklen Theme lesbar bleibt.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Wenn `values` weggelassen wird, ist die Standardpalette `green`, `coral`, `violet`, `amber` und `blue`. Wenn Sie die Liste reduzieren, werden andere Farben von Befehlen und beim Laden von Dokumenten abgelehnt.

## CSS-Stile

Das Dokument speichert nur Farbnamen. Setzen Sie die tatsächlichen Farben für den Editor und die veröffentlichte Ansicht mit CSS-Variablen.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Prüfe den Kontrast zusammen mit der Hintergrundfarbe. In einem dunklen Theme kann derselbe Farbname einen anderen Wert erhalten.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
