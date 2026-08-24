---
title: Bild
---

# Bild

## Beschreibung

`imageWing` (Kennung `img`) besitzt das Bildelement (`<img>`). Wie `hr` und `youtube` ist es ein
Klotz vom Typ `place: 'void'` ohne Inhalt. Ein Klick auf die Werkzeugleisten-Schaltfläche öffnet
eine Eingabe für die Bildadresse.

**Die Adresse wird anhand ihres Schemas geprüft, nicht anhand der Dateiendung.** Nur `http:`,
`https:` und relative Pfade sind erlaubt — bösartige Schemata wie `javascript:` und
protokollrelative Adressen (`//example.com/a.png`) werden herausgefiltert. Eine dynamische
API-Adresse, die ein Bild ohne Dateiendung liefert, wird ganz normal unterstützt.

Der Caret kann nie in ein Bild hineingelangen — ein Klick darauf wählt also das ganze Bildobjekt
aus und ruft eine eigene Kontextzeile auf:

| Steuerelement | Beschreibung |
|---|---|
| Breite | ein Schieberegler, der die Breite von `30 %` bis `100 %` in 10-%-Schritten einstellt (Standard `60 %`) |
| Groß ansehen (Lightbox) | vergrößert das Bild in Originalgröße in einem modalen Popup |

Die Links-/Zentriert-/Rechts-Ausrichtung eines Bildes ist eine Eigenschaft des **Wrapper-Absatzes
(`<div data-nabi-p>`)**, der es hält — daher wird sie über die Ausrichtungs-Schaltflächen der
Haupt-Werkzeugleiste gesetzt.

Ein neu eingefügtes Bild wird standardmäßig zentriert (`data-nabi-align="c"`).

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Es wird als semantisches Attribut ohne Inline-`style` gespeichert — die tatsächliche Größe und
Ausrichtung zeichnet `nabi.css`.

### Lokale Adressen erlauben (`allowLocalUrls`)

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Setzen Sie `allowLocalUrls: true`, sind auch lokale Adressen im Format `blob:` und
`data:image/...` erlaubt — nützlich etwa für eine lokale Vorschau vor einem Datei-Upload
(Standard `false`).

Ist eine Bildadresse ungültig oder eine Blob-Adresse abgelaufen und das Laden schlägt fehl, zeigt
der `attach`-Hook des Flügels automatisch einen Platzhalter für das defekte Bild. Das
funktioniert ohne zusätzliche Mount-Einrichtung, und da es sich um eine reine Bildschirm-UI
handelt, hat es keinen Einfluss auf die gespeicherten Daten.

## Anwendung

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Um `blob:`-Adressen zu erlauben, verwenden Sie die Factory-Funktion:

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
