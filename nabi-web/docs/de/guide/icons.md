---
title: "Icon-Themes"
description: "CSS-Variablen ersetzen Icons für Wings, Vorschau, Vollbild, Panels, Vergleiche und Tabellensortierung. SVG, WebP und PNG lassen sich mischen; nicht angegebene Icons verwenden die Standarddateien."
---

# Icon-Themes

CSS-Variablen ersetzen Icons für Wings, Vorschau, Vollbild, Panels, Vergleiche und Tabellensortierung. SVG, WebP und PNG lassen sich mischen; nicht angegebene Icons verwenden die Standarddateien.

## Dateien festlegen

Laden Sie das CSS und setzen Sie eine Theme-Klasse am Editor oder einem gemeinsamen Elternelement. Farben, Transparenz und Seitenverhältnis der Bilder bleiben erhalten.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

Verwenden Sie wurzelrelative Pfade wie `/icons/...` oder vollständige HTTPS-URLs. Relative Pfade werden nicht garantiert neben der Theme-Datei aufgelöst. Kopieren Sie beim eigenen CSS-Hosting dieselbe Version von `dist/icons/` neben `nabi.css`. Bei einem Ladefehler bleibt das Icon leer; Buttonname, Tooltip und Aktion bleiben verfügbar.

## Weitere Icons finden

Stellen Sie dem Wert von `data-nabi-icon` das Präfix `--nabi-icon-` voran. So verwendet `diff-close` die Variable `--nabi-icon-diff-close`. Die <a href="/llms/icons.md" target="_blank" rel="noopener">Icon-Spezifikation</a> beschreibt Schlüssel für Kontext, Menüs, Speichern, Verlauf und weitere Bereiche sowie die Kodierung von Sonderzeichen.

## Dunkelmodus und Panels

Änderungen an Theme-Klassen oder CSS-Variablen aktualisieren Icons ohne erneutes Mounten. Standardicons folgen dem hellen/dunklen Theme. Eigene Dateien erben `currentColor` nicht; definieren Sie bei Bedarf dunkle Varianten wie oben. Unter `body` geöffnete Panels folgen ebenfalls dem Icon-Theme und den Klassen-/Stiländerungen des ursprünglichen Editors. Setzen Sie Variablen am Editor oder einem gemeinsamen Elternteil, nicht nur innerhalb der Toolbar.

## Standardbuttons anzeigen

`showPreview` und `showFullscreen` sind standardmäßig `true`. Mit `false` entfallen der jeweilige Button, sein Fokusziel und seine Ereignisse. Sind beide `false`, entfällt auch der leere Werkzeugbereich.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Übergeben Sie SSR und Mount dieselben Anzeigeoptionen. Rufen Sie zum Ändern `tools.unmount()` auf und mounten Sie mit neuen Optionen. Werden beide Buttons nicht benötigt, können Mount und SSR-Markup der Werkzeuge weiterhin ganz entfallen. Direkte Aufrufe von `openPreview()` und `setFullscreen()` bleiben möglich.
