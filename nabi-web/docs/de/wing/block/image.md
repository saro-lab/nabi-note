---
title: Bild
description: Fügen Sie eine Bild-URL ein und passen Sie Breite und Ausrichtung an.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Bild

Fügen Sie eine Bild-URL ein und passen Sie deren Breite und Ausrichtung an. Standardmäßig sind Adressen auf `http:`, `https:` oder Pfade derselben Site beschränkt, und ein neues Bild beginnt zentriert mit einer Breite von 60 %.

Die Breite wird nur in festen Schritten gespeichert, und die Ausrichtung wird im Absatz gespeichert, der das Bild umgibt. Um `blob:`- oder `data:image/...`-Vorschauen zu verwenden, müssen lokale URLs sowohl im Bild-Wing als auch in der Editor-Baugruppe explizit erlaubt werden. SVG-Daten-URLs sind nicht erlaubt.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Dieser Wing fügt eine Adresse in das Dokument ein; er lädt keine Dateien hoch. Um Dateien an einen Server zu senden, verbinden Sie den [Upload-Wing](/de/wing/etc/upload).

## CSS-Stile

Stilieren Sie Bilder mit `.nabi-content img`. Bewahren Sie die gespeicherte Breite und Ausrichtung bei und ändern Sie nur visuelle Details wie Rahmen oder Schatten.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Bewahren Sie die Standardregeln für `max-inline-size`, `block-size`, Breite und Ausrichtung bei. Die Bildgröße wird im Dokument gespeichert, sodass das Erzwingen einer festen CSS-Breite mit der vom Autor gewählten Breite in Konflikt stehen kann.
