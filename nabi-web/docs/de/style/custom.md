---
title: Eigene Stile
description: Farben und Formen ändern Sie, indem Sie CSS-Variablen überschreiben.
---

# Eigene Stile

**Der Host hängt das Stylesheet ein** — mit einem Bundler eine Zeile `import 'nabi-note/nabi.css'`,
über ein CDN ein `<link>`. Danach genügt es, Variablen zu überschreiben.

Die Komponentenregeln enthalten **kein einziges Farbliteral.** Alles wird über `--nabi-*`-Variablen
gezeichnet, überschreiben Sie also die Variablen, folgt der Rest von selbst.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

Warum die Klasse dreimal gestapelt ist, steht unten in [Der Spezifität aus dem
Weg](#der-spezifitat-aus-dem-weg).

::: tip Die große Voraussetzung dieser Seite — ein gespeicherter Wert steht nicht für sich allein
Das ausgehende HTML (`getHtml()`) enthält **kein einziges Zeichen von Inline-`style`.** Der
gespeicherte Wert sagt über Attribute nur, *was* etwas ist (`data-nabi-align="center"`), und dieses
Stylesheet sagt, wie es aussieht. Wenn also die lesende Seite gespeichertes HTML zeichnet, muss es
in einem `.nabi-content` mit diesem Stylesheet stecken, um wie im Editor auszusehen — siehe
[Gespeichertes HTML anderswo zeichnen](#gespeichertes-html-anderswo-zeichnen) unten.
:::

::: tip Dunkel und Hell sind schon eingebaut
Es gibt **kein** Token, das der Host für ein Theme überschreiben muss. Das Kern-Stylesheet bringt
alle drei mit — die hellen Standardwerte, die `.dark`-Neudefinition und eine explizite
`.light`-Neudefinition. Innerhalb des Editors überschreibt auch diese Website nichts außer vier
Schrift-Token.
:::

## Farb- und Form-Token

| Token | Bedeutung | Standard (hell) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | Hintergrund · leicht gedrückte Fläche | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | Text · gedämpfter Text · Text auf der Akzentfarbe | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | Linien · Akzentfarbe | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | Gefahr · Text darauf | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | Kastenschatten · Vorschau-Hintergrund | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | Ecken | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | Ecken einer Schicht (Panel, Vorschau, Lightbox) | `.25rem` |
| `--nabi-z-sticky` | Schichtnummer der sticky Zeile | `20` |
| `--nabi-grid-cell` | Zellgröße des Tabellengrößen-Rasters | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | die sechs Hervorhebungsfarben | halbtransparente Farben |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | die fünf Textfarben | kräftige Farben |

Diese Tabelle enthält nur, was das Kern-Stylesheet (`nabi.css`) **selbst deklariert**. Die
Deklaration sitzt an drei Stellen, nicht nur bei `.nabi` —
`:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`. Das Vorschau-Overlay ist ein Kind von
`body`, sodass Vererbung von `.nabi` es nie erreicht, und ein allein außerhalb eines Editors
stehendes `.nabi-content` muss die Token ebenfalls direkt bekommen.

Dieselbe Liste ist dreimal ausgeschrieben (helle Standardwerte, `.dark`, explizites `.light`). **Die
überschreibende Seite muss nicht alle drei ansehen** — schlagen Sie die Spezifität einmal, und der
geschriebene Wert gilt in allen drei Fällen. Wollen Sie in Dunkel aber einen anderen Wert, müssen Sie
die Bedingung `.dark` selbst anhängen.

## Token, die nur referenziert, nie deklariert werden

Die Variablen unten sind solche, die der Kern **referenziert, ohne sie zu deklarieren**. Geben Sie
ihnen keinen Wert, gilt der Fallback in Klammern. Da es keine Stelle gibt, an der sie deklariert
sind, **funktioniert das Schreiben auf `:root` wie es ist** — dort trennen sie sich von den Farb- und
Form-Token oben (die sind auf `.nabi` deklariert, wo Vererbung nicht gewinnen kann).

| Token | Bedeutung | Fallback |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | die Schriften, die tatsächlich an die vier Sorten des Schriftart-Flügels gebunden sind | Systemschriften |
| `--nabi-cursive-adjust` | das `font-size-adjust` der Schreibschrift. Eine Handschrift-Schriftart hat eine niedrige x-Höhe und wirkt bei gleichem px kleiner, und dieser Wert misst sie anhand der x-Höhe neu | `0.4` |
| `--nabi-sticky-top` | wie weit unten die sticky Zeile sitzt. Hat die Website eine feste Kopfzeile, deren Höhe | `0px` |
| `--nabi-preview-width` | die Breite der Vorschau-Karte. **`openPreview` misst beim Öffnen die Editier-Oberfläche und schreibt diese Breite direkt auf die Karte**, sodass ein von außen gesetzter Wert von diesem Inline-Wert geschlagen wird | `720px` |

`--nabi-typeface-base` gehört nicht zu dieser Sorte — **der Kern deklariert es** (unangetastet folgt
es `--nabi-font`). Der Schriftart-Flügel hat keine Option dafür, überschreiben Sie also dieses Token,
um es zu ändern.

`--nabi-keyboard-top` und `--nabi-keyboard-bottom` stehen an derselben Stelle, aber **der Kern
schreibt sie** — `mountSticky()` misst, wie weit eine mobile Tastatur den Bildschirm hochgeschoben
hat, und schreibt es hierher, und die sticky Zeile sowie Vollbild lesen diesen Wert. Das sind keine
von Hand zu schreibenden Werte.

## Wo es kein Token gibt — die Regel überschreiben

Die drei unten haben **keine Variable**. Der Kern hat den Wert fest in eine Regel gegossen, ändern
Sie ihn also, indem Sie den Selektor überschreiben.

**Die vier Textgrößen** — in `em`, sie folgen also der Größe des Elternelements.

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**Die Größe der Initiale** — keine Zeilenanzahl, die umschlossen wird, nur eine Buchstabengröße. Wie
viele Zeilen sie tatsächlich abdeckt, entscheidet die Zeilenhöhe dieses Absatzes.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**Code-Token-Farben** — das Stylesheet des Code-Flügels schreibt Farben direkt auf
`[data-nabi-token]`. **Fünf** Sorten bekommen derzeit eine Farbe.

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

Der `type`, den ein Highlighter beantwortet, ist eine freie Zeichenkette — jeder Name außerhalb
dieser fünf wird ohne Farbe gezeichnet, fügen Sie also für die Sorten, die Sie wollen, eine Regel
derselben Gestalt hinzu. Für andere Farben in Dunkel hängen Sie die Bedingung `.dark` selbst an — der
Kern liefert für diese fünf keine dunkle Variante.

Die Fortschrittsanimation des Upload-Flügels (`--nabi-per`, `--nabi-t`, `--nabi-span`,
`--nabi-clear`, `--nabi-blur-max`) ist **intern für diesen Flügel** — die Namen beginnen zwar mit
`--nabi-`, sind aber keine Stelle, die für den Host zum Überschreiben geöffnet ist.

---

## Äußere Maße sind `rem`

Die äußeren Maße — Schaltflächen, Abstände, Werkzeugleisten-Chips und der Rest — sind größtenteils in
`rem`, wachsen also **mit der Schriftgröße der Wurzel (`html`).** Vergrößert der Nutzer den Text im
Browser oder Betriebssystem, wächst der Rahmen des Editors mit. Um die Größe zu ändern, ändern Sie
die `font-size` der Wurzel. Eine Umrandung (`border`) ist eine *Linie* und keine Größe, deshalb bleibt
sie an manchen Stellen in `px`.

---

## Der Spezifität aus dem Weg

Um ein Farb- oder Form-Token zu überschreiben, stapeln Sie **drei Klassen**.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--mein-akzent);
}
```

Durchgezählt sieht das so aus. Die helle Standardregel `:is(.nabi, …)` ist **(0,1,0)**, da `:is()`
das höchste seiner Argumente nimmt; die dunkle Regel `:where(html, body).dark :is(.nabi, …)` ist
**(0,2,0)**, da `:where()` null zählt und `.dark` sowie `:is()` je eine Klasse sind. Also **steht**
`.nabi.nabi` mit Dunkel nur **unentschieden** — und bei Unentschieden gewinnt die später geladene
Regel, und das Kern-Stylesheet kann durchaus nach dem des Hosts geladen werden. Stapeln Sie drei, um
auf (0,3,0) zu kommen, dann hängt nichts von der Ladereihenfolge ab.

Das Vorschau-Overlay steht außerhalb von `.nabi` (als Kind von `body`), sein Selektor muss also
mitgeschrieben werden, damit es dieselbe Farbe bekommt.

**Ein Token, das der Kern nicht deklariert, etwa eine Schrift, braucht dieses Ringen nicht** — es
gibt keine Stelle, an der es deklariert ist, sodass Vererbung allein es erreicht und eine Zeile
`:root` genügt.

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## Hell und Dunkel

Eine Klasse `dark` auf **entweder** `html` oder `body` bedeutet dunkel, `light` bedeutet hell. Ohne
Klasse ist Hell der Standard, und mit beiden gewinnt das explizite `light` (die `.light`-Regeln sind
nach den `.dark`-Regeln geladen).

```html
<html class="dark"><!-- oder <body class="dark"> --></html>
```

Schalten Sie die Klasse um, reagiert das CSS. Es gibt keine API dafür. Was ein Theme austauscht, sind
allein die Farbvariablen; die Komponentenregeln bleiben, wie sie sind — selbst geschriebene Stile
folgen ebenfalls Dunkel, solange sie nur `--nabi-*`-Variablen verwenden.

---

## Zwei Wege, das Stylesheet einzuhängen

**① Eine Datei** — der häufigste Weg. Das CSS jedes Flügels ist darin.

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② Nur das Registrierte injizieren** — für den Fall, dass Sie nur die Stylesheets der tatsächlich
eingeschalteten Flügel wollen.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// rufen Sie drop() auf, wird nur entfernt, was dieser Aufruf eingefügt hat
```

Ein Stylesheet mit demselben Text geht **einmal** hinein — der Schlüssel, auf den gefaltet wird, ist
der **Inhalt** des Stylesheets, sodass mehrere Editoren in einem Dokument nie stapeln und
unterschiedliche Flügelmengen sich zu einer einzigen Vereinigung zusammenfinden.

:::: tip Zwei Unterschiede zwischen den beiden — was geladen wird, und wann es greift
**Was geladen wird.** Eine Datei kann nicht wissen, welche Flügel Sie registriert haben, trägt also
**alle**. Injektion liest die `registry` und trägt **nur, was Sie registriert haben**. Eine Seite,
die gespeichertes HTML nur anzeigt, hat keinen Editor und daher keine `registry`, nimmt also den
Dateiweg.

**Wann es greift.** Eine Datei kommt als `<link>` im Kopf herein und **blockiert das Rendern**, bis
sie geladen ist. Injektion greift erst, **nachdem das JavaScript des Editors angekommen ist**. Eine
Seite, deren Dokument bereits auf dem Server vorab gezeichnet und heruntergeschickt wird, sollte
deshalb den Dateiweg nehmen — bei Injektion würde das vom Server gesendete Dokument erst nackt
gezeichnet und danach neu gestylt und umbrochen, sobald das Stylesheet eintrifft.
::::

Die Stylesheets der registrierten Flügel gehen **nach** dem Kern-Stylesheet hinein, bei gleicher
Priorität gewinnt also der Flügel.

---

## Was Sie ansteuern können

Was eine Variable nicht kann, zielt auf die tatsächlich existierenden Klassen.

| Selektor | Was | Wer hängt es an |
|---|---|---|
| `.nabi` | die Hülle, die den gesamten Editor umschließt (Chrome + Schreibbereich). Die Farb- und Form-Token hängen hier | der Host |
| `.nabi-content[contenteditable]` | der Schreibbereich selbst | der Host |
| `.nabi-toolbar` | der Platz, der Werkzeugleisten-Zeile und Kontextzeile umschließt. Diese Klasse *ist* „bleibt oben kleben" | der Host |
| `.nabi-toolbar-row` | der Behälter, in dem die Werkzeugleiste sitzt | `mountToolbar()` |
| `.nabi-context` | der Behälter, in dem die Kontextzeile sitzt | `mountContextToolbar()` |
| `.nabi-tools` | der Platz für die Schaltflächen Vorschau und Vollbild — der Kern lässt ihn nach rechts oben schweben | `mountViewTools()` |
| `.nabi-tool` | diese beiden Schaltflächen selbst | `mountViewTools()` |
| `.tb-group` | eine Gruppe von Werkzeugleisten-Schaltflächen | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | die Gruppen, Schaltflächen, Farbmuster und Textfelder der Kontextzeile | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | der Kasten, der sich unter einer Schaltfläche öffnet, etwa das Tabellengrößen-Raster | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | die Adress-Eingabeschicht, die beim Einfügen von etwas Neuem erscheint | `mountToolbar()` |
| `.nabi-hints [data-hint]` | die Kürzel-Abzeichen von doppeltem Tippen von Shift — das Abzeichen ist `::before`, das Namensschild `::after`, sodass beide gemeinsam erscheinen | `mountHints()` |
| `[data-nabi-tip]` | das Tooltip — allein mit CSS `::after` gezeichnet | der Kern durchweg |
| `.nabi-content.nabi-dropping` | der Schreibbereich, während eine Datei darüber gezogen wird. Der Hinweistext reitet auf dem Attribut `data-nabi-drop` | `mountUpload()` |

Vorschau und Vollbild werden ebenfalls **vom Kern gebaut.**

| Selektor | Was | Wer |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | das Dokument-Vorschau-Overlay | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | der Kasten, der ein einzelnes Bild groß zeigt | `openImageLightbox()` |
| `.nabi.is-fullscreen` | Vollbild — pinnt den `.nabi`-Kasten auf den Bildschirm | `setFullscreen()` (der Klassenname ist `FULLSCREEN_CLASS`) |

Hängen Sie `mountViewTools()` an, öffnen und schließen die beiden Schaltflächen dies von selbst.
Wollen Sie es selbst öffnen, rufen Sie `openPreview({ nabi, editor })`,
`openImageLightbox({ editor, src, alt?, locale })`, `setFullscreen(root, on)` oder
`isFullscreen(root)` auf.

::: tip Der Werkzeug-Platz stellt sich selbst auf
`mountViewTools` **baut seinen eigenen Kasten** und setzt ihn an den Anfang des Behälters, den Sie
ihm übergeben. Der Host muss `<span>` nie vor der Werkzeugleiste platzieren — richten Sie den Platz
im Voraus ein, entstehen stattdessen zwei Kästen.
:::

Auch die Editor-Bildschirm-eigenen Kennzeichen lassen sich ansteuern — `[data-nabi-token]` (die
Token-Farben eines Codeblocks), `[data-nabi-lang]` (die Sprache eines Codeblocks), `[data-color]`
(Hervorhebung und Textfarbe — unterschieden durch die Tags `<mark>` und `<span>`), sowie
`data-nabi-align`, `data-nabi-typeface`, `data-nabi-size`, `data-nabi-dropcap` (Absatzattribute). Die
verbindlichen Namen dieser Kennzeichen sind die `*_ATTR`-Konstanten in der jeweiligen Flügel-Datei.

---

## Gespeichertes HTML anderswo zeichnen

Der ausgehende Wert (`getHtml()`) ist HTML mit verbliebenen `data-nabi-*`-Attributen, und **kein
einziges Zeichen von Inline-`style`.** Das heißt, das Aussehen ist ganz Sache des Stylesheets, und
ohne dieses zu zeichnen ergibt bloßes HTML ohne Ausrichtung, ohne Textgrößen und ohne Tabellenlinien.

Um es so zu zeichnen, wie es der Editor tat, umhüllen Sie es mit `.nabi-content` — diese Klasse
erhält die Farb- und Form-Token direkt, auch ohne ein umgebendes `.nabi` (die Regel
`.nabi-content:where(:not(.nabi *))` in `nabi.css`).

```html
<div class="nabi-content">Ihr gespeichertes HTML</div>
```

Für das Stylesheet selbst nehmen Sie Weg ① aus dem Abschnitt oben — eine Seite ohne Editor hat keine
`registry`, aus der gesammelt werden könnte.

### Verhalten auf der lesenden Seite — Tabellensortierung

Derzeit wird **allein die Tabellensortierung** als leseseitige Funktion ausgeliefert. Ein
allgemeines System, mit dem ein beliebiger Flügel sein eigenes leseseitiges Verhalten anhängen
könnte, gibt es noch nicht.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'de' })
```

Es findet Tabellen, die `data-nabi-sortable` tragen, und setzt Sortierschaltflächen in die
Kopfzellen. Die Freigabefunktion (`detach`) nimmt die gesetzten Schaltflächen und die geänderte
Zeilenreihenfolge zurück.

::: danger Nicht an ein bearbeitetes Element anhängen
`attachTableSort()` setzt Schaltflächen ins DOM und ändert die Zeilenreihenfolge. Speichern Sie das
DOM, während es angehängt ist, härtet das in den Wert ein — hängen Sie es auf der lesenden Seite nur
an eine schreibgeschützte Kopie an.
:::

---

## Weiterführende Seiten

- [{{ t('menu_wing_custom') }}](../wing/custom) — eine fehlende Formatierung selbst bauen
- [{{ t('menu_intro_index') }}](../intro) — die Wörter, die diese Dokumentation verwendet

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
