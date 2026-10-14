---
title: CSS-Themes
description: Konfigurieren Sie Farben, Schriftarten, Größen und den Dunkelmodus für Editoren und veröffentlichte Inhalte mit CSS-Variablen.
---

# CSS-Themes

NABI NOTE verwendet dasselbe CSS zum Bearbeiten und für veröffentlichte Inhalte. Laden Sie das Paket-Stylesheet einmal und überschreiben Sie nur die Variablen, die Sie benötigen, auf einem Dienstcontainer.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Weise `.nabi` des Editors und `.nabi-content` der veröffentlichten Ansicht dieselbe Theme-Klasse zu, um auf beide dieselben Variablen anzuwenden. Lade das Service-CSS nach dem Paket-CSS und lege das aktuelle Theme mit `data-nabi-theme` fest.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Häufige Variablen

| Zweck | Variablen |
| --- | --- |
| Text und Hintergrund | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Ränder und Akzente | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Ecken und Schatten | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Schriftfamilien | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Bearbeitungsoberfläche | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Feststehende Symbolleiste und Vorschau | `--nabi-sticky-top`, `--nabi-preview-width` |
| Touch-Steuerung | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Umschaltbreite für den Mobilmodus | `--nabi-mobile-breakpoint` |

Hervorhebung und Textfarbe verwenden `--nabi-hl-<name>` bzw. `--nabi-tc-<name>`. Zellhintergründe verwenden `--nabi-cell-<name>` mit `yellow`, `green`, `cyan`, `pink`, `purple` und `orange`. Die Variablen ändern nur die angezeigte Farbe, nicht den gespeicherten Farbnamen.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

Das Standard-Theme zeigt Zellhintergründe in blassen Farben. Der Dunkelmodus behält die Farbnamen, verwendet jedoch eigene hellere, weniger gesättigte Farben, damit sie auf dunklen Flächen gut unterscheidbar bleiben. Diese halbtransparenten Farben lassen den Hintergrund durchscheinen; prüfe bei Anpassungen den Textkontrast auf dem tatsächlichen Seitenhintergrund. Die Theme-Klasse muss wie oben am eigentlichen Editor- bzw. Veröffentlichungselement statt an einem beliebigen äußeren Elternknoten stehen, damit sie dessen Standardfarbvariablen überschreibt.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Umschaltbreite für den Mobilmodus

Die Standard-Toolbar mit `layout: 'compact'` wechselt bei einer Bildschirmbreite unter `36rem` zur einzeiligen Mobilansicht. Genau `36rem` behält das Desktoplayout. Auf dem Desktop werden alle Werkzeuge umgebrochen, auch wenn der Editor selbst schmal ist. Objekteigenschaften umbrechen darunter; beide Zeilen belegen Platz oberhalb des Inhalts. Im Vollbild werden unabhängig von der Bildschirmbreite alle Werkzeuge aufgeklappt.

Mobil bleiben Schnellwerkzeuge, die Schaltfläche für alle Werkzeuge sowie verbundene Vorschau-/Vollbildschaltflächen in der Haupt-Toolbar. Sie bleiben nutzbar, wenn Eigenschaftswerkzeuge erscheinen. Die Werkzeugpalette übernimmt Gruppenreihenfolge und Trennlinien des Desktops. `layout: 'wrap'` zeigt immer alle Werkzeuge mit Zeilenumbruch.

Mobile Panels öffnen sich im verfügbaren Platz rund um Toolbar und Eigenschaftswerkzeuge. Die Tabellengrößenauswahl ist eine Ausnahme: Sie öffnet sich mittig vor einem halbtransparenten Hintergrund mit einem gut berührbaren 5×5-Raster. Sie wartet nicht auf das Schließen der Tastatur; die Größenwahl fügt eine Tabelle ein und schließt die Auswahl.

Setze `--nabi-mobile-breakpoint` auf `:root`, einem Vorfahren oder einer einzelnen `.nabi`, um die Grenze zu ändern. Verwende eine nichtnegative CSS-Länge wie `rem`, `px` oder `calc()`. Änderungen am CSS-Wert, an der Root-Schriftgröße oder der Bildschirmbreite aktualisieren auch offene Panels automatisch. Unter `body` verschobene Eingabepanels behalten die Grenze ihres ursprünglichen Editors.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Für die einspaltige Darstellung von Float-Bereichen gilt eine separate Grenze: Entscheidend ist eine Breite des Inhaltscontainers unter `36rem`, nicht die Bildschirmbreite. Beim Drucken wird dasselbe Layout verwendet.

## Dunkelmodus

Der Hellmodus ist standardmäßig aktiv. Fügen Sie `.dark` zu `html` oder `body` hinzu oder setzen Sie `data-nabi-theme="dark"` auf einem bestimmten Editor oder veröffentlichten Körper.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Verwenden Sie `data-nabi-theme="light"`, um sich vom `.dark` eines übergeordneten Elements abzumelden. Ihre Anwendung steuert das Umschalten des Themas; das Paket folgt nicht automatisch `prefers-color-scheme`.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Veröffentlichte Inhalte ebenfalls stylen

Veröffentlichtes HTML benötigt ebenfalls `.nabi-content` und dasselbe CSS. Tabellen, Codeblöcke, Bilder, Checklisten und Kapitälchen werden ohne JavaScript gerendert. Fügen Sie `nabi-note/viewer` nur für Verhalten wie das Sortieren von Tabellen oder das Hervorheben von Code hinzu.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

Legen Sie Layouts fest, die nicht zum Paket gehören, wie z. B. Körperbreite und Zeilenhöhe, auf Ihrer Dienstklasse.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Bearbeitungsstruktur nicht verändern

Ändern Sie nicht `display` oder `white-space` auf bearbeitenden `[data-key]`-Knoten, fügen Sie Pseudo-Elemente innerhalb von bearbarem Text ein oder deaktivieren Sie das Zeiger-Verhalten auf Objekt-Umhüllungen. Diese Regeln können die Caret-Geometrie und die Dokumentzuordnung beschädigen.

Veröffentlichte Kapitälchen verwenden `::first-letter`, während eine Bearbeitungsoberfläche ein echtes `[data-nabi-dropcap-letter]`-Element verwendet. Fügen Sie keine weitere `::first-letter`-Regel innerhalb von `.nabi-editing` hinzu oder ersetzen Sie dieses Element.
