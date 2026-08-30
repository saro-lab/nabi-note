---
title: Hervorhebung
description: Wende eine erlaubte Hervorhebungsfarbe hinter dem ausgewählten Text an.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Hervorhebung

Wende eine Hervorhebungsfarbe hinter dem ausgewählten Text an. Gespeicherte Daten enthalten nur erlaubte Farbnamen statt beliebiger CSS-Farbwerte, sodass die Dokumentdaten und der visuelle Stil getrennt bleiben.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Wenn `values` weggelassen wird, ist die Standardpalette `yellow`, `green`, `cyan`, `pink`, `purple` und `orange`. Wenn Sie die Liste einschränken, werden nicht registrierte Farben nicht beibehalten, selbst wenn ein bestehendes Dokument geladen wird.

## CSS-Stile

Das Dokument speichert nur Farbnamen. Ändere die Farben des Editors und der veröffentlichten Ansicht über CSS-Variablen.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Das gleichzeitige Ändern mehrerer Farben ermöglicht es dir, die Farbnamen des Dokuments beizubehalten und nur die Produktstimmung anzupassen.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
