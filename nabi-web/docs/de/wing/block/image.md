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

## Eine Bildauswahl einbinden

Mit `panels.img` in `mountToolbar()` ersetzen Sie den standardmäßigen URL-Dialog der Bildschaltfläche durch die Bildauswahl Ihres Dienstes. Die Schlüssel sind Namen von Toolbar-Slots; nicht angegebene Werkzeuge behalten ihre Standarddialoge.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: ({ root, signal, run }) =>
      mountMyImagePicker(root, {
        signal,
        onSelect: (url: string) => run('insertImage', { src: url }),
      }),
  },
})
```

`mountMyImagePicker` implementieren Sie in Ihrem Dienst. Die Funktion erstellt Ihre UI synchron im übergebenen `root` und gibt eine Aufräumfunktion zurück. Verbinden Sie `signal` mit asynchronen Vorgängen wie dem Laden einer Bilderliste oder einem Upload und übergeben Sie die ausgewählte Bild-URL an `onSelect`. Diese API überträgt keine Dateien; die bisherigen Regeln für Bild-URLs gelten weiterhin.

Beim Schließen des Panels oder Entfernen der Toolbar wird `signal` abgebrochen und die Aufräumfunktion aufgerufen. `run()` schließt das Panel und führt einen Befehl einmal an der beim Öffnen erfassten Auswahl aus. Ist das Panel bereits geschlossen oder wurde der Dokumentinhalt seit dem Öffnen geändert, gibt es `false` zurück, ohne den Befehl auszuführen.

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
