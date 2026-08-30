---
title: SSR-Einrichtung
description: Stellen Sie gespeicherte NABI TREE-Dokumente sicher als HTML auf einem Server dar und hydratisieren Sie einen Editor im Browser.
---

# SSR-Einrichtung

Importieren Sie auf dem Server nur `nabi-note/ssr`, keine Browser-Oberflächen oder UI. Es validiert gespeicherten NABI TREE-JSON und wandelt ihn in veröffentlichtes HTML oder hydratisierbares Editor-HTML um.

## Veröffentlichtes HTML rendern

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` validiert und normalisiert seine JSON-Eingabe und gibt dann veröffentlichtes HTML zurück. `null` bedeutet, dass das aktuelle Registry diese Eingabe nicht lesen kann. Fügen Sie das Paket-CSS und `.nabi-content` auf der veröffentlichten Seite hinzu.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Fügen Sie `attachViewer()` aus `nabi-note/viewer` nur im Browser für interaktives Tabellensortieren oder Code-Hervorhebung hinzu. Reiner veröffentlichter Inhalt benötigt nur CSS.

## Vorgefertigte Editor-Markup hydratisieren

Um einen Editor ab dem ersten Paint anzuzeigen, rendern Sie ihn mit `renderStoredEditorHtml()` auf dem Server und übergeben Sie `hydrate: true` an die Browser-Oberfläche.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Server und Browser müssen dasselbe Dokument verwenden, Wing-Deklarationen in derselben Reihenfolge und Optionen, die HTML beeinflussen. Fügen Sie die Serverausgabe unverändert als direkte Kindelemente des Inhaltswurzellements ein und setzen Sie `contenteditable` auf diesem Wurzelelement nicht vorab. Wenn die Struktur abweicht, rendert die Oberfläche frisches Editor-HTML.

## Die Symbolleiste ebenfalls vorsehen

`renderToolbarHtml()` und `renderViewToolsHtml()` können Steuerelemente der Symbolleiste auf dem Server vorsehen. Das Einbinden im Browser verdrahtet diese Steuerelemente, wenn Registry, Locale und Gruppenreihenfolge übereinstimmen. Beliebiges Host-DOM innerhalb eines Symbolleistenwurzelements wird nicht unterstützt.

Verwenden Sie während SSR keine Browser-APIs wie `injectSheets()`. Verknüpfen Sie die gebaute Datei `nabi-note/nabi.css` oder fügen Sie sie in Ihr CSS-Bundle ein.
