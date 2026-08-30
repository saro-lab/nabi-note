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
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Platzieren Sie gemeinsame Token auf einem gemeinsamen übergeordneten Element, damit der Editor und seine veröffentlichte Ansicht dieselbe visuelle Sprache beibehalten.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

Highlight- und Textfarb-Token verwenden `--nabi-hl-<name>` und `--nabi-tc-<name>`. Das Ändern von `--nabi-hl-yellow` ändert beispielsweise die Anzeigefarbe gespeicherter `yellow`-Highlights, ohne die Dokumentdaten zu ändern.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Dunkelmodus

Der Hellmodus ist standardmäßig aktiv. Fügen Sie `.dark` zu `html` oder `body` hinzu oder setzen Sie `data-nabi-theme="dark"` auf einem bestimmten Editor oder veröffentlichten Körper.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Verwenden Sie `data-nabi-theme="light"`, um sich vom `.dark` eines übergeordneten Elements abzumelden. Ihre Anwendung steuert das Umschalten des Themas; das Paket folgt nicht automatisch `prefers-color-scheme`.

```css
.dark .brand-note {
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
  --nabi-font: "Source Serif 4", Georgia, serif;
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
