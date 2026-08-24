---
title: Einführung
description: NABI NOTE ist ein quelloffener WYSIWYG-Editor, der im Browser läuft.
---

# Was ist NABI NOTE?

NABI NOTE ist ein **quelloffener WYSIWYG-Editor**, der im Browser läuft.


## Der Nabi-Baum

Verarbeitet man HTML direkt, stößt man auf ein Problem: serverseitig (Node.js und Ähnliches) gibt
es kein DOM, mit dem sich arbeiten ließe. NABI NOTE verwaltet das Dokument deshalb als reines
JavaScript-Baumobjekt namens **Nabi-Baum**, das sich in beide Richtungen — zu JSON und zu HTML —
serialisieren lässt. Beim Übergang zwischen Nabi-Baum und HTML werden zudem böswillige Inhalte,
die XSS auslösen könnten, automatisch entfernt.

> Jeder von NABI NOTE offiziell unterstützte Standard-Flügel übernimmt den XSS-Schutz. Schreiben
> oder binden Sie jedoch einen `benutzerdefinierten Flügel (ein Drittanbieter-Plugin)` ein, prüfen
> Sie bei dessen eigenem Autor, ob er dasselbe tut.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## Unterstützung für DOM-loses SSR (Server-Side Rendering)

Einen in einer Datenbank oder anderswo gespeicherten Nabi-Baum können Sie **unverändert auf dem
Server (Node.js und Ähnliches) einlesen** und daraus das an den Client gesendete HTML zusammensetzen.
Eine DOM-API braucht nur die **Eingabe** aus einem externen HTML-String (`setHtml()`) und die
`mount*`-Funktionen, die den Editor auf den Bildschirm rendern.

Ein Bildschirm, der ein Dokument nur lesend anzeigt, braucht überhaupt keinen aufgebauten Editor —
rufen Sie die einzige Rendering-Funktion (`renderStoredHtml`) auf. Sie nimmt den gespeicherten
Nabi-Baum und die `registry` (die Liste der registrierten Flügel) als Argumente und liefert einen
sicheren HTML-String zurück.

**Verwenden Sie im Server-Umfeld den Einstiegspunkt `nabi-note/ssr`** — ein schlankes Modul, das
nur die für das Rendern nötige Kernlogik enthält, sodass Code für die Editier-Oberfläche (`surface`)
oder UI-Werkzeuge (`ui`) niemals im Server-Bundle landet.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// Die Flügelliste einmal beim Serverstart aufbauen und bei jeder weiteren Anfrage wiederverwenden.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['Ein Kommentar'] }]   // ein Nabi-Baum, aus der Datenbank gelesen
renderStoredHtml(saved, registry)
// '<p>Ein Kommentar</p>'
```

**Alles, was kein gültiger Nabi-Baum ist, erhält `null` zurück** — die Validierungsregel ist
identisch mit der von `setJson()`. Ein Wert, der die Validierung besteht, **stimmt exakt** mit dem
Ergebnis von `getHtml()`, aufgerufen auf einer Editor-Instanz, überein — er durchläuft dieselbe
Normalisierungs-und-Zusammenbau-Pipeline, weshalb die XSS-Filterung auch an derselben Stelle
angewendet wird.

Um den eigenen Editier-Bildschirm des Editors auf dem Server vorzurendern (SSR), verwenden Sie die
Funktion `renderStoredEditorHtml`. Sie erzeugt HTML, dem bei jedem Knoten ein `data-key`-Attribut
hinzugefügt wurde.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">Ein Kommentar</p>'
```

Dieselben gespeicherten Daten erzeugen immer denselben `data-key`. Sie können also das auf dem
Server gerenderte HTML herunterschicken und im Browser mit
`mountSurface({ nabi, registry, root, hydrate: true })` hydrieren — der Editor übernimmt, ohne den
Bildschirm neu zu zeichnen. **Genau so läuft auch die Homepage-Demo dieser Website.** Das Dokument
auf dem ersten Bildschirm wurde vom Server vorgerendert, und auf dem Client aktiviert sich der
Editor direkt über diesem DOM.

### Paket-Einstiegspunkte

| Einstiegspunkt | Was er enthält | Wann |
|---|---|---|
| `nabi-note` | der komplette Editor (Dokumentmodell, Editierbereich, Toolbar und UI-Werkzeuge) | ein Bildschirm zum **Schreiben/Bearbeiten** eines Dokuments |
| `nabi-note/ssr` | ein schlankes, reines SSR-Modul, das einen Nabi-Baum zu HTML rendert | eine Serverumgebung oder eine nur lesende Seite |
| `nabi-note/viewer` | Nur-Lese-Verhalten (Tabellenspalten sortieren, Code einfärben usw.) | ein Bildschirm zum **Anzeigen** veröffentlichten HTML |

`nabi-note/ssr` **referenziert nie** die Editier-Oberfläche (`surface`) oder UI-Werkzeuge (`ui`).
Ein Architektur-Unit-Test verifiziert das streng, sodass kein Risiko besteht, dass
DOM-abhängiger Code ins Server-Bundle rutscht.

## Jede Formatierung ist ein Flügel (Wing)

Was andere Editoren „Plugin" nennen, heißt bei NABI NOTE **Flügel (Wing)**. Der Editor-Kern
behandelt direkt nur den einfachen Absatz (`p`), den Zeilenumbruch (`br`) und reinen Text — jede
Formatierung und Erweiterung, von Überschriften und Listen bis zu Tabellen und Fettdruck, wird als
eigenständiger Flügel bereitgestellt.

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

Nicht als Flügel registriertes Markup wird **automatisch in reinen Text umgewandelt.** So wird
jedes nicht deklarierte HTML-Element sicher entfernt, und jeder von NABI NOTE offiziell
unterstützte Flügel filtert bösartige Skripte gründlich heraus.


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

Die Struktur unten zeigt nicht die Reihenfolge, in der Daten ausgeführt werden — sie zeigt die
**vierzehn Schichten (Layer)**, die im Verzeichnis `src/` angeordnet sind. Das Kernprinzip: **eine
untere Schicht referenziert nie eine obere.** Deshalb hängen die unteren Schichten (`schema`,
`doc`, `html` usw.) überhaupt nicht vom DOM ab und laufen unverändert auch in einer Serverumgebung
(Node.js).

```
src/
├── style/     der Kernstil — das CSS, das Editier-Bildschirm und Leseseite gemeinsam nutzen
├── locale/    Sprache
├── code/      ein reiner Tokenizer, den Editier-Bildschirm und Leseseite gemeinsam nutzen
├── schema/    die Gestalt des Nabi-Baums und die cocoon-Definition
├── doc/       Einfügen · Löschen · Teilen · Bereich — ohne DOM
├── caret/     Position, Auswahl und Grenzen des Cursors
├── html/      Nabi-Baum ↔ HTML
├── io/        die Türen rein und heraus — Einfüge-Kandidaten, Speicherung, Öffnung, Markdown
├── editor/    die Instanz mit der Command-Schnittstelle
├── wing/      Prüfung des Wing-Vertrags bei der Registrierung
├── wings/     die offiziellen Flügel (bold · italic … table · upload)
├── surface/   passt den Caret, IME und Eingabe auf den Baum an
├── ui/        die UI-Schicht
├── viewer/    nur zum Lesen
├── index.ts   der Kern-Einstiegspunkt — `nabi-note`
└── ssr.ts     der SSR-Einstiegspunkt — `nabi-note/ssr` (rührt nicht eine einzige Datei von surface oder ui an)
```

**Die Reihenfolge der Zeilen ist die Reihenfolge der Schichten** — nicht alphabetisch sondern
**von unten nach oben.** `style` ist der Boden und `viewer` ist die Spitze.

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
| **IO-Filter** | die Erweiterungsstelle, die Einfügen (die Eingangstür) und Speicherung und Öffnung (die Ausgangstür) als ein Set behandelt. Sie sitzt **außerhalb des Flügel-Vertrags**, deshalb setzt sie keinen Knoten ihrem Selbst im Dokument auf |

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
</script>
