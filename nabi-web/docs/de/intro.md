---
title: Einführung
description: NABI NOTE ist ein quelloffener WYSIWYG-Editor, der im Browser läuft.
---

# Was ist NABI NOTE?

NABI NOTE ist ein **quelloffener WYSIWYG-Editor**, der im Browser läuft.


## Der Nabi-Baum

Verarbeitet man HTML direkt, lässt sich das auf einem Server ohne DOM nicht durchführen. Deshalb
wird das Dokument als JavaScript-Objekt namens **Nabi-Baum** gehalten und in beide Richtungen —
JSON und HTML — serialisiert. Beim Übergang zwischen Nabi-Baum und HTML werden zudem XSS-Elemente
entfernt.

> Alle von NABI NOTE mitgelieferten Flügel filtern XSS. Bei einem `benutzerdefinierten Flügel
> (externes Plugin)` müssen Sie beim jeweiligen Entwickler nachfragen, ob er das ebenfalls tut.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Unterstützung für DOM-loses SSR (serverseitig)

Einen gespeicherten Nabi-Baum können Sie **auf dem Server (Node.js) unverändert einlesen** und
daraus das zu sendende HTML zusammensetzen. Ein DOM brauchen nur die **Eingabe** (`setHtml()`) und
die `mount*`-Aufrufe, die sich an den Bildschirm heften.

Ein Ort, der nur anzeigt, kommt ohne einen aufgebauten Editor aus — ein einziger Aufruf genügt. Er
nimmt zwei Dinge entgegen, den gespeicherten Wert und die `registry` (die Liste der registrierten
Flügel), und antwortet mit einer HTML-Zeichenkette.

**Auf dem Server binden Sie `nabi-note/ssr` ein** — dieser Einstiegspunkt trägt nur das zum
Zeichnen Nötige, Editier-Oberfläche und Bildschirmwerkzeuge sind darin überhaupt nicht enthalten.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// Die Flügelliste bauen Sie nur einmal auf, wenn der Server startet — beliebig viele gespeicherte Werte teilen sich diese eine.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['Ein Kommentar'] }]   // Nabi-Baum, aus der Datenbank gelesen
renderStoredHtml(saved, registry)
// '<p>Ein Kommentar</p>'
```

**Ist es kein Nabi-Baum, antwortet die Funktion mit `null`** — die Ablehnungsregel ist dieselbe wie
bei `setJson()`. Ein bestandener Wert unterscheidet sich **um kein einziges Zeichen** von dem
`getHtml()`, das der Editor liefert. Beide durchlaufen denselben Weg (Normalisierung →
Zusammenbau), weshalb auch die Stelle, an der XSS herausgefiltert wird, exakt dieselbe ist.

Um den Editor bereits auf dem Server vorab zu zeichnen, nutzen Sie den passenden Gegenpart — das
Einzige, was hinzukommt, ist `data-key`.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">Ein Kommentar</p>'
```

Derselbe gespeicherte Wert erhält immer denselben `data-key`. Senden Sie dieses HTML unverändert
hinunter, und übernimmt es der Browser mit `mountSurface({ nabi, registry, root, hydrate: true })`,
wird der Bildschirm nicht neu gezeichnet. **Genau so läuft die Startseiten-Demo dieser Website** —
das Dokument des ersten Bildschirms ist vom Server gezeichnet, und der Editor erwacht darauf.

### Drei Einstiegspunkte

| Einstiegspunkt | Was er enthält | Wann |
|---|---|---|
| `nabi-note` | den ganzen Editor — Zusammenbau, Oberfläche, Bildschirmwerkzeuge | dort, wo **geschrieben** wird |
| `nabi-note/ssr` | nur das Zeichnen eines gespeicherten Werts zu HTML | auf dem Server, oder auf einer nur lesenden Seite |
| `nabi-note/viewer` | Verhalten der Leseseite (Tabellensortierung, Code-Einfärbung) | dort, wo veröffentlichtes HTML **angezeigt** wird |

`nabi-note/ssr` **rührt keine einzige Datei** von Editier-Oberfläche (`surface`) oder
Bildschirmwerkzeugen (`ui`) an — ein Netz durchkämmt den Quellcode und erzwingt das. Deshalb gibt
es keinen Weg, wie sich DOM-Code in das Server-Bündel mischen könnte.

## Formatierung ist durchweg ein Flügel

Die Einheit, die andere Editoren „Plugin" nennen, heißt hier **Flügel (wing)**. Was der Kern
unmittelbar kennt, sind der Absatz (`p`), die Zeile (`br`) und reiner Text; Überschrift, Liste,
Tabelle und Fett sind allesamt Flügel.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>fett</b> <i>kursiv</i></p>')
bare.getHtml()
// '<p>fett kursiv</p>'                    — kein Flügel deklariert, also wird alles zu reinem Text.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>fett</b> <i>kursiv</i></p>')
bold.getHtml()
// '<p><b>fett</b> kursiv</p>'              — nur boldWing ist deklariert, also überlebt nur boldWing und der Rest wird zu reinem Text.
```

Nicht als Flügel registriertes Markup wird **zu reinem Text.** Deshalb fällt nicht deklariertes
HTML heraus, und jeder von NABI offiziell mitgelieferte Flügel entfernt bösartige Skripte.


## Schnittstelle

Das Dokument lässt sich nur über `applyCommand()` ändern.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Fett
nabi.applyCommand('setHeading', { value: 2 })   // H2
nabi.undo()
nabi.redo()
```
Ein Command **antwortet mit einem `boolean`**, ob er erfolgreich war. Ändert sich nichts, antwortet
er mit `false` und hinterlässt weder einen Eintrag in der Historie noch eine Änderung.


## Die Schichten des Codes

**Das heißt nicht, dass Werte in dieser Reihenfolge fließen.** Es ist die
**Abhängigkeitsrichtung**, von unten nach oben gestapelt, und die Regel ist eine einzige — **eine
untere Schicht kennt die obere nie.** Deshalb rühren die unteren Schichten (`schema` · `doc` ·
`html`) kein DOM an, und genau deshalb laufen sie unverändert auf dem Server. Der Weg, auf dem
Werte hinein- und herausgehen, ist das Nabi-Baum-Bild oben.

<LayerStack
  :layers="layers"
  caption=""
/>

Diese Richtung ist keine schriftlich niedergelegte Abmachung, sondern **ein Netz erzwingt sie
maschinell** — entsteht auch nur ein einziger Import, der die Schichtordnung verletzt, schlägt an
der Stelle ein Test an.


## Begriffe

| Wort | Bedeutung |
|---|---|
| **Mark (mark)** | eine Formatierung über Zeichen, z. B. `<b>` · `<i>` · `<a>` |
| **Block (block)** | z. B. Absatz · Überschrift · Liste · Tabelle · Bild |
| **Absatzattribut (paragraph attribute)** | eine Eigenschaft des Absatzes, z. B. Ausrichtung · Initiale |
| **Wrapper-Absatz** | ein Absatz, der ein Einzelabsatz-Objekt wie Tabelle, Liste oder Bild umhüllt |
| **Besitz (claim)** | die Entscheidung, welchem Flügel ein Stück Markup gehört |
| **Teile (parts)** | eine Funktion innerhalb eines Flügels, z. B. Zeile/Zelle einer Tabelle, Zusammenfassungszeile einer Klappbox |

### Editier-Bildschirm

| Wort | Bedeutung |
|---|---|
| **Caret (caret)** | der Auswahlcursor innerhalb des Editors |
| **Kontextzeile (context row)** | die Werkzeugleiste, die den vom Caret aktuell ausgewählten Zustand steuert, z. B. Zeilen-/Spaltenbefehle der Tabelle, das Sprachfeld des Codes, Adress-/Namensfelder des Links, H1–H6 der Überschrift |

### Kern

| Wort | Bedeutung |
|---|---|
| **cocoon** | der Normalisierungsschritt des Nabi-Baums. Er läuft **nach jedem Command**, sodass kein Command ein Dokument hinterlassen kann, das die Regeln bricht |
| **attach** | der Hook, den ein Flügel erklärt, wenn er den Bildschirm anfassen muss, z. B. das Ziehen einer Tabellenzelle, das Einfärben von Code, das Umschalten einer Aufgabe. `mountSurface` heftet die der registrierten Flügel mit an |
| **Automatische Umwandlung (input rule)** | eine Umwandlung, die allein durch Tippen geschieht, z. B. Bindestrich und Leerzeichen werden zur Liste, `#` und Leerzeichen zur Überschrift |


## Weiterführende Seiten

- [{{ t('menu_intro_usage') }}](./intro/usage) — Zusammenbau, Eingabe und Ausgabe im Ganzen
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — ohne Build-Werkzeug, mit einem einzigen `<script>`
- [{{ t('menu_wing_custom') }}](./wing/custom) — eine fehlende Formatierung selbst bauen

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: 'direkte Eingabe · Einfügen · Laden', kind: 'in' },
  { label: 'setHtml() · setJson()', note: 'Eingabe per Funktion', kind: 'gate' },
];

const hubCore = { label: 'Nabi-Baum', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'HTML für den Editor', kind: 'out' },
];

const layers = [
  { name: 'locale', what: 'Sprache' },
  { name: 'code', what: 'ein reiner Tokenizer, den Editier-Bildschirm und Leseseite gemeinsam nutzen' },
  { name: 'schema', what: 'die Gestalt des Nabi-Baums und die cocoon-Definition' },
  { name: 'doc', what: 'Einfügen · Löschen · Teilen · Bereich — ohne DOM' },
  { name: 'caret', what: 'Position, Auswahl und Grenzen des Cursors' },
  { name: 'html', what: 'Nabi-Baum ↔ HTML' },
  { name: 'editor', what: 'die Instanz mit der Command-Schnittstelle' },
  { name: 'wing', what: 'Prüfung des Wing-Vertrags bei der Registrierung' },
  { name: 'wings', what: 'die offiziellen Flügel (bold, italic ... table, upload...)' },
  { name: 'surface', what: 'passt Caret, IME und Eingabe auf den Baum an' },
  { name: 'ui', what: 'UI-Schicht' },
  { name: 'viewer', what: 'nur zum Lesen' },
]
</script>
