---
title: Eigene Stile
description: So passen Sie Farben, Schriften, Abstände und andere Stile von NABI NOTE mit CSS-Variablen an.
---

# Eigene Stile

**Der Host hängt das Stylesheet selbst ein** — in einem Bundler mit `import 'nabi-note/nabi.css'`, über ein CDN mit einem `<link>`-Tag. Danach genügt es, nur die benötigten CSS-Variablen zu überschreiben, um das gesamte Editor-Theme einheitlich zu ändern.

Jede UI-Komponente von NABI NOTE ist **ausschließlich über `--nabi-*`-CSS-Variablen gestylt, ohne ein einziges fest codiertes Farbliteral** — daher reicht das Überschreiben der Variablen, um das Branding anzupassen.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

Warum der Klassenselektor dreifach gestapelt ist, steht im Abschnitt [CSS-Spezifitätsleitfaden](#css-spezifitatsleitfaden) unten.

::: tip Gespeichertes HTML enthält keine Inline-Stile
Das vom Editor ausgegebene HTML (`getHtml()`) **enthält keine einzigen `style`-Attribute.** Das Markup trägt nur semantische Struktur und Attribute (etwa `data-nabi-align="center"`), während das Stylesheet die visuelle Darstellung übernimmt. Wenn Sie gespeichertes HTML also auf einer externen Seite rendern, muss es weiterhin **innerhalb eines `.nabi-content`-Containers mit angewendetem `nabi.css`** stehen, um wie im Editor auszusehen.

Näheres dazu im Abschnitt [Gespeichertes HTML anderswo rendern](#gespeichertes-html-anderswo-rendern) unten.
:::

::: tip Hell und Dunkel sind standardmäßig eingebaut
Der Host muss für das Standard-Theme keine zusätzlichen Variablen definieren. Das Kern-Stylesheet bringt bereits die hellen Standardwerte, ein `.dark`-Theme und ein explizites `.light`-Theme mit.
:::

## Farb- und Theme-Token

| Token | Bedeutung | Standard (hell) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | Grundhintergrund · Hover-/leichter Hintergrund | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | Grundtext · gedämpfter Nebentext · Text auf der Akzentfarbe | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | Rahmen/Trennlinie · Haupt-Akzentfarbe (Fokus/aktiv) | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | Gefahren-/Warnfarbe · Text auf der Gefahrenfarbe | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | Schatten von Dropdowns · abgedunkelter Hintergrund von Modal/Vorschau | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | Eckenradius (Standard · klein · minimal) | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | Eckenradius von Layer-Popups/-Modals | `.25rem` |
| `--nabi-z-sticky` | z-index der sticky Kopfzeile | `20` |
| `--nabi-grid-cell` | Zellgröße von Rastern, etwa dem Tabellen-Einfüge-Raster | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | Die sechs Textmarker-Farben | halbtransparente Farben |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | Die fünf Textfarben | kräftige Farben |

Die Variablen der obigen Tabelle sind Token, die das Kern-Stylesheet (`nabi.css`) **direkt deklariert.** Sie sind nicht nur an `.nabi`, sondern an drei Selektoren gebunden — `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))` —, um eigenständiges Rendern zu unterstützen.

## Nur referenzierte Token (können auf :root gesetzt werden)

Die Variablen unten sind Token, die der Kern **nicht selbst deklariert, sondern nur referenziert** — als `var(--token, Fallback)`. Setzt der Host keinen Wert, gilt der angegebene Fallback. Da sie nicht auf Kern-Ebene deklariert sind, **können Sie sie auf `:root` deklarieren, um sie global anzuwenden.**

| Token | Bedeutung | Standard-Fallback |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | Schriftfamilie für den Editor und jeden Zweig des Schriftart-Flügels | Systemschriften |
| `--nabi-cursive-adjust` | Das `font-size-adjust`-Verhältnis der Schreibschrift | `0.4` |
| `--nabi-sticky-top` | Oberer Abstand der sticky Toolbar (auf die Höhe eines fixen Seiten-Headers setzen, falls vorhanden) | `0px` |
| `--nabi-preview-width` | Standardbreite der Vorschaukarte | `720px` |
| `--nabi-placeholder` | Platzhaltertext im leeren Editor | keiner |
| `--nabi-placeholder-color` | Farbe dieses Platzhaltertexts (ohne Angabe gilt eine themenspezifische Ersatzfarbe) | `--nabi-placeholder-color-fallback` |
| `--nabi-content-min-height` | Mindesthöhe einer leeren Editierfläche (gilt nur für die Editierfläche `.nabi-editing`) | `12.5rem` |
| `--nabi-touch-font-size` | Schriftgröße von Formularfeldern (`.nabi-input`) auf Touch-Geräten (`pointer: coarse` oder Breite ≤ 40rem) — verhindert den Auto-Zoom von iOS Safari | `16px` |

`--nabi-typeface-base` ist nicht nur referenziert — **der Kern deklariert es direkt** (standardmäßig referenziert es `--nabi-font`). Um die Standardschrift zu ändern, überschreiben Sie `--nabi-font`.

`--nabi-keyboard-top` und `--nabi-keyboard-bottom` sind interne Variablen, die **`mountSticky()` anhand der Höhe der mobilen Tastatur dynamisch misst und schreibt.**

`--nabi-bar-height` ist ebenso eine interne Variable, die **`mountSticky()` anhand der tatsächlichen Toolbar-Höhe misst und schreibt.** Sie wird als `scroll-margin-block-start` auf `.nabi-content > *`-Elemente angewendet, damit diese beim Scrollen nicht unter der Toolbar verschwinden.

## Feste Stile ohne Variable überschreiben

Die drei folgenden Eigenschaften sind als feste CSS-Regeln statt als Variablen definiert — zum Ändern überschreiben Sie direkt den Klassenselektor.

**Die vier Textgrößen** (in `em`, relativ zur Größe des Elternelements):

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**Die Größe der Initiale**:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**Farben der Code-Token**:

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

---

## Maßeinheiten

Die meisten UI-Maße — Buttongröße, Abstände, Toolbar-Höhe und so weiter — sind in `rem` definiert und **skalieren daher proportional zur Schriftgröße der Wurzel (`html`).** Vergrößert eine Nutzerin oder ein Nutzer die Standardschriftgröße im Browser oder Betriebssystem, skaliert die Editor-UI von selbst mit.

---

## CSS-Spezifitätsleitfaden

Beim Überschreiben einer vom Kern deklarierten Theme-Farbvariable empfehlen wir, **drei Klassen zu stapeln**, um die Priorität des Stils zuverlässig zu erhöhen.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: #7c3aed;
}
```

- Die helle Standardregel `:is(.nabi, …)` hat die Spezifität **(0, 1, 0)**.
- Die Dunkelmodus-Regel `:where(html, body).dark :is(.nabi, …)` hat die Spezifität **(0, 2, 0)**.
- Das Stapeln von drei Klassen wie in `.nabi.nabi.nabi` ergibt daher eine Spezifität von **(0, 3, 0)**, die unabhängig von der CSS-Ladereihenfolge zuverlässig gewinnt.

Das Vorschau-Modal wird als direktes Kind von `body` eingehängt, daher müssen Sie auch den Selektor `.nabi-scrim.nabi-scrim.nabi-scrim` angeben, damit dieselbe Theme-Farbe dort ebenfalls greift.
Nur referenzierte Token, die der Kern nicht deklariert — etwa die Schrift-Token —, wirken bereits mit einer einzigen Deklaration auf `:root`.

---

## Hell-/Dunkel-Theme

Das Dunkel-Theme greift, wenn das `html`- oder `body`-Element die Klasse `dark` trägt, das Hell-Theme, wenn es die Klasse `light` trägt. Ohne Klasse gilt das helle Standard-Theme, und tragen beide Klassen, gewinnt das explizite `light`.

```html
<html class="dark"><!-- oder <body class="dark"> --></html>
```

Ein Theme-Wechsel bedeutet nur das Umschalten der Klasse — es gibt keine separate JavaScript-API dafür. Verwenden Sie in eigenen Stilen `--nabi-*`-Variablen, folgen deren Farben Theme-Wechseln automatisch mit.

---

## Wege, das Stylesheet einzuhängen

**1. Die gesamte CSS-Datei importieren** (der übliche, empfohlene Weg)

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. Nur die Stile der registrierten Flügel dynamisch injizieren**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// drop() entfernt die injizierten Stile wieder aus dem DOM
```

Identischer Stylesheet-Inhalt wird nie doppelt injiziert — er wird als ein einziges Tag verwaltet.
In einer SSR-Umgebung ist es besser, die statische CSS-Datei zu laden statt zu injizieren, um ein Aufblitzen ungestylten Inhalts (FOUC) vor der Ausführung des Client-JS zu vermeiden.

---

## Anpassbare CSS-Klassen und UI-Elemente

| Selektor | Was es ist | Erzeugt von |
|---|---|---|
| `.nabi` | Oberster Container, der den gesamten Editor umschließt (Toolbar + Editierfläche) | der Host |
| `.nabi-content[contenteditable]` | Die eigentliche Editierfläche | der Host |
| `.nabi-toolbar` | Sticky-Header-Container, der Toolbar und Kontextleiste umschließt | der Host |
| `.nabi-toolbar-row` | Die Buttonzeile der Haupt-Toolbar | `mountToolbar()` |
| `.nabi-context` | Der Container der dynamischen Kontext-Toolbar | `mountContextToolbar()` |
| `.nabi-tools` | Wrapper für die Vorschau- und Vollbild-Buttons | `mountViewTools()` |
| `.nabi-hints [data-hint]` | Das Kürzel-Abzeichen bei schnellem doppeltem Drücken von Shift | `mountHints()` |
| `[data-nabi-tip]` | Button-Tooltip (mit CSS `::after` gezeichnet) | Kern-Komponenten |
| `.nabi-content.nabi-dropping` | Die Editierfläche, während eine Datei darüber gezogen wird | `mountUpload()` |

### Modals und Popups

| Selektor | Was es ist | Erzeugt von |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > `.nabi-content.nabi-preview-body` | Das Dokument-Vorschau-Modal | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | Das Bild-Lightbox-Popup | `openLightbox()` |
| `.nabi-scrim` > `.nabi-card.nabi-choose` | Das Popup zur Auswahl des Einfügeformats | `openChoosePanel()` |
| `.nabi-scrim` > `.nabi-card.nabi-save` | Das Speichern-Popup (Dateinamen-Eingabe und Formatwahl) | `openSavePanel()` |
| `.nabi.is-fullscreen` | Die Klasse, die den Vollbildmodus des Editors aktiviert | `setFullscreen()` |

---

## Gespeichertes HTML anderswo rendern

Der mit `getHtml()` extrahierte HTML-String besteht nur aus semantischem Markup und `data-nabi-*`-Attributen, ohne Inline-`style`.
Um ihn auf einer externen Seite im gleichen Look wie im Editor zu rendern, umschließen Sie den Inhalt mit der Klasse `.nabi-content` und laden Sie `nabi.css`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">

<div class="nabi-content">
  <!-- der mit nabi.getHtml() gespeicherte HTML-Inhalt -->
</div>
```

Auch ohne Umschließung mit `.nabi` greifen Theme- und Schrift-Token direkt auf `.nabi-content`, sodass Sie genau den im Editor gesehenen Stil reproduzieren können.

### Schreibgeschützte Tabellensortierung aktivieren

Um die Spaltensortierung von Tabellen auf einer veröffentlichten HTML-Seite zu aktivieren, hängen Sie die Funktion `attachTableSort` ein.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'de' })
```

Sie erkennt Tabellen mit dem Attribut `data-nabi-sortable` und fügt Sortier-Buttons in die Spaltenköpfe ein. Der Aufruf der zurückgegebenen Funktion `detach()` entfernt die hinzugefügten DOM-Buttons und stellt die ursprüngliche Zeilenreihenfolge wieder her.

::: warning attachTableSort nicht auf ein bearbeitetes DOM anwenden
`attachTableSort()` manipuliert die DOM-Struktur direkt. Wenden Sie es auf eine noch bearbeitete Editorfläche an, kann die Sortier-Button-UI dauerhaft im Dokumentinhalt landen. Verwenden Sie es ausschließlich auf einem schreibgeschützten Viewer-Bildschirm.
:::

---

## Weiter

- [{{ t('menu_wing_custom') }}](../wing/custom) — einen eigenen Formatierungs-Flügel bauen
- [{{ t('menu_intro_index') }}](../intro) — Einführung in NABI NOTE und seine Architektur

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
