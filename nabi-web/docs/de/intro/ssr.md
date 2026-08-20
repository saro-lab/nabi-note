---
title: SSR-Unterstützung
description: Gespeicherte Werte serverseitig vorab zeichnen und Editor sowie Werkzeugleiste per hydrate übernehmen.
---

# SSR-Unterstützung

## Nur den gespeicherten Wert zeichnen — ohne einen Editor aufzustellen

Ein Ort, der nur anzeigt — etwa eine Kommentarliste — **braucht keinen Editor.** Um ein Dokument zu
zeichnen, ist einzig die Liste der registrierten Flügel (`registry`) nötig, und dafür gibt es einen
eigenen Zugang, der nur das entgegennimmt.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// einmal, wenn der Server startet — beliebig viele gespeicherte Werte teilen sich diese eine
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['Ein Kommentar'] }]   // Nabi-Baum, aus der Datenbank gelesen

renderStoredHtml(saved, registry)        // '<p>Ein Kommentar</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">Ein Kommentar</p>'
```

**`nabi-note/ssr` ist der Einstiegspunkt, der nur das zum Zeichnen Nötige trägt.** Er rührt keine
einzige Datei von Editier-Oberfläche (`surface`) oder Bildschirmwerkzeugen (`ui`) an (ein Netz
erzwingt das), sodass sich kein DOM-Code in das Server-Bündel mischt. Denselben Zugang gibt es auch
unter `nabi-note` — eine Seite, die den Editor ohnehin schon lädt, kann einfach den nehmen.

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | das HTML, das Sie speichern und veröffentlichen — derselbe Wert wie `getHtml()` |
| `renderStoredEditorHtml(json, registry, options?)` | das Editor-HTML — derselbe Wert wie `getEditorHtml()` (trägt `data-key`) |

- **Beide brauchen kein DOM** — sie laufen unverändert auf dem Server.
- **Ist es kein Nabi-Baum, ist die Antwort `null`** — die Ablehnungsregel ist dieselbe wie bei
  `setJson()` (das ganze Dokument muss ein Array sein). Sie werfen nicht.
- **Unterscheidet sich um kein einziges Zeichen von dem, was der Editor liefert.** Beide durchlaufen
  denselben Weg (Normalisierung → Zusammenbau), also ist auch die Stelle, an der XSS herausgefiltert
  wird, exakt dieselbe — die anzeigende Seite wird nie weniger gründlich gewaschen.
- `options` ist ein einziges Feld, `{ allowLocalUrls }` — dieselbe Bedeutung wie die gleichnamige
  Option von `createNabiWith`.

**Derselbe gespeicherte Wert erhält immer denselben `data-key`.** Zeichnet der Server den Editor
darum mit `renderStoredEditorHtml` vorab und übernimmt ihn der Browser mit `hydrate`, wird der
Bildschirm nicht neu gezeichnet.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Weichen sie voneinander ab, wird an Ort und Stelle neu gezeichnet — Server und Client müssen also
nur dieselbe Flügelliste teilen.

::: tip Genau so macht es diese Website mit ihrer eigenen Startseite
Das Dokument der Startseiten-Demo wird **beim Build mit `renderStoredEditorHtml` vorab gezeichnet**
und in die Seite eingebettet, und der Editor erwacht darauf mit `hydrate`. So lässt sich der Text
schon lesen, bevor der Editor-Code überhaupt angekommen ist — es gibt keine Phase, in der eine leere
Stelle plötzlich gefüllt wird.
:::

---

## Auch die Werkzeugleiste lässt sich vorab zeichnen

Die Reihe der Schaltflächen **sieht sich das Dokument nicht an.** Sie hängt nur von der Liste der
registrierten Flügel, den Bezeichnungen und der Gruppenreihenfolge ab, und deshalb ist der
ausgegebene Text eine **Konstante** — Sie rufen sie einmal, wenn der Server startet, und verwenden
diesen Text danach weiter. Es gibt nichts, das Sie bei jeder Anfrage erneut aufrufen müssten.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'de' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Schicken Sie diesen Text unverändert in den Werkzeugleisten-Kasten hinein, zeichnet ihn der Browser
mit **derselben Funktion**, die `mountToolbar` dafür verwendet. Steht bereits dieselbe Zeile,
**zeichnet es nicht neu, sondern verdrahtet nur.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Geben Sie dem Kasten von Anfang an `class="nabi-toolbar-row"` mit
Schicken Sie eine vorab gezeichnete Zeile hinaus, muss diese Klasse **von der allerersten Zeichnung
an** vorhanden sein. Fehlt sie, hängt der Kern sie beim Mounten selbst an — dann kommen die
seitlichen Abstände erst in diesem Moment hinzu, und **die Zeile der Schaltflächen rutscht einmal
seitlich.** Trägt der Host sie schon vorher ein, rührt der Kern sie nicht an (er entfernt nur das,
was er selbst angeheftet hat).

```html
<div class="nabi-toolbar-row">vorab gezeichnete Zeile</div>
```
:::

- **Ein Abweichen bricht nichts** — steht dort eine Zeile, die nicht mehr zur aktuellen Flügelliste
  passt, wird an Ort und Stelle neu gezeichnet. Verloren geht nur der vorab gezeichnete Wert, der
  Bildschirm ist immer korrekt.
- **Die vorab gezeichnete Zeile steht im Zustand „nichts gedrückt, nichts versteckt".** Ob gedrückt
  (`aria-pressed`) oder versteckt, entscheidet der Caret, und den kennt der Server nicht. Ist Ihre
  Konstellation so gebaut, dass Schaltflächen je nach Caret verschwinden, können nach dem Mounten
  einige davon verschwinden und die Zeile sich neu zusammenziehen.
- **Setzen Sie das nur dort ein, wo Sie einen Editor aufstellen.** Eine nur lesende Seite hat keine
  Werkzeugleiste, also gibt es keinen Grund, diesen Text entgegenzunehmen.

**Die beiden Schaltflächen Vorschau und Vollbild gehen denselben Weg.** Die beiden sind kein Flügel,
sondern Teile der Überlagerung, und stecken deshalb nicht im obigen Werkzeugleisten-Text — sie
werden separat gezeichnet und in den Kasten gesetzt, den `mountViewTools` aufstellt.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'de' })
// '<span class="nabi-tools">…</span>'
```

::: tip Genau so macht es diese Website mit ihrer eigenen Startseite
Die Werkzeugleiste der Startseiten-Demo wird **beim Build mit `renderToolbarHtml` und
`renderViewToolsHtml` vorab gezeichnet** und eingebettet, und `mountToolbar` sowie `mountViewTools`
erkennen diese Zeile und verdrahten nur. Es gibt also keine Phase, in der fünfunddreißig Icons erst
mit Verzögerung eintrudeln.
:::

---

## Weiterführende Seiten

- [{{ t('menu_intro_usage') }}](./usage) — der npm-Weg, Zusammenbau, Ein- und Ausgabe im Ganzen
- [{{ t('menu_intro_cdn') }}](./cdn) — ohne Build-Werkzeug, mit einem einzigen `<script>`

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
