---
title: Grundlegende Verwendung
description: Über npm installieren, ein einziges Nabi-Objekt aufstellen und Dokumente über vier Eingänge und drei Ausgänge bewegen.
---

# Grundlegende Verwendung

Der npm-Weg. Für den Weg mit einem einzigen `<script>` siehe [{{ t('menu_intro_cdn') }}](./cdn).

```sh
npm i nabi-note
```

---

## Die Stücke zusammenfügen

Der Host baut die Plätze und heftet die Mounts einen nach dem anderen an. Unten steht die minimale
Anordnung, und jedes Beispiel auf den Flügel-Seiten ist genau dieses Gerüst mit ein oder zwei
eingesteckten Flügeln.

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'de' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'de' })
mountSticky({ root: app, surface })

// Jedes Mal, wenn sich der Wert ändert — hier hängen Sie Ihren eigenen Code ein
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Der Host baut die Plätze, und **der Kern weiß, wie diese Plätze aussehen müssen** — ein Mount heftet
`.nabi-toolbar-row`, `.nabi-context` und `.nabi-editing` selbst an seinen eigenen Kasten und stellt
auch seinen eigenen Werkzeugkasten selbst auf. Das heißt, der Host muss das Layout nie ausrechnen,
und deshalb trägt das Markup oben nur drei Klassen.

- **`class="nabi"`** — die Farbtoken und die Stylesheets leben nur darin. Es ist auch der Kasten, den
  Vollbild als Ganzes anpinnt, deshalb müssen Werkzeugleiste und Schreibbereich **zusammen** darin
  stecken.
- **`class="nabi-toolbar"`** — bindet Werkzeugleisten-Zeile und Kontextzeile zu einem Klotz, damit
  sie gemeinsam **sticky** werden. Werden sie getrennt angeheftet, schiebt sich der Text nach unten,
  wenn die Kontextzeile erscheint, und der Bildschirm springt.
- **`class="nabi-content" contenteditable`** — der Schreibbereich selbst.

Hat die Website eine feste Kopfzeile, schieben Sie den Editor um so viel mit `--nabi-sticky-top`
herunter; heften Sie `mountSticky()` an, misst der Kern, wie weit eine mobile Tastatur den Bildschirm
hochgeschoben hat, und gibt es zurück.

**Das Stylesheet hängt der Host ein.** Mit einem Bundler genügt `import 'nabi-note/nabi.css'`, und
wollen Sie nur das, was die registrierten Flügel tragen, rufen Sie
`injectSheets(document, collectSheets(registry))`. **Für eine Seite, die das Dokument auf dem
Server vorab zeichnet und herunterschickt, nehmen Sie die Datei-Variante** — die Injektion greift
erst, nachdem das JavaScript des Editors angekommen ist, und in der Zwischenzeit würde das Dokument
einmal nackt gezeichnet.

**Diese Angabe legt auch die Schreibrichtung fest.** Geben Sie Arabisch (`ar`) oder Urdu (`ur`) an,
erhält die Wurzel dieses Mounts `dir="rtl"` und steht von rechts nach links — auch wenn die Seite
über `<html dir>` gar nichts dazu sagt. **Lassen Sie `locale` weg, wird nichts angefasst**: die
Übersteuerung eines Hosts, der die Richtung selbst in der Hand hat, findet nicht statt. Welche
Sprache welche Richtung hat, beantwortet `localeDirection(code)`.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // Schreibbereich wird RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // die Werkzeugleiste spiegelt sich mit
```

Die Anzeigesprache wird pro Mount mit `locale` festgelegt — der Text des Dokuments bleibt, wie er
ist, nur die Namen auf Werkzeugleiste und Kontextzeile wechseln. **Der Host muss die Locale nur
einmal deklarieren** — packen Sie sie wie im Beispiel oben in ein gemeinsames Objekt (`shared`) und
reichen Sie es an die Mounts weiter; sobald die Werkzeugleiste aufsteht, hängt sie ihre `locale`
auch an den Kern (`nabi.$bindLocale`), sodass auch das, was der Kern selbst sagt (etwa toast), in
derselben Sprache herauskommt. Für einen Platz ohne Werkzeugleiste geben Sie sie über die
`locale`-Option von `createNabiWith`. Um eine Auswahl zu zeichnen, verwenden Sie `LOCALES` (die
Liste der Codes), das das Paket exportiert.

| Stück | Erforderlich | Was es tut |
|---|---|---|
| `createNabiWith(wings, options?)` | ja | liefert `{ nabi, registry }`. Braucht kein DOM |
| `mountSurface({ nabi, registry, root })` | ja | passt Caret, IME und Eingabe wieder auf den Nabi-Baum. Heftet auch das `attach` jedes registrierten Flügels an |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | nein | die Haupt-Werkzeugleiste. Ohne sie können Sie noch immer direkt über `applyCommand()` bearbeiten |
| `mountContextToolbar({ nabi, registry, root, surface? })` | nein | die caret-abhängige Kontextzeile (Tabellenzeilen und -spalten, Code-Sprache, Adresse und Name eines Links und so weiter) |
| `mountHints({ toolbar, context?, root, surface? })` | nein | die Kürzel-Abzeichen, die bei doppeltem Tippen von Shift erscheinen |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | nein | die beiden Schaltflächen Vorschau und Vollbild. `root` ist der `.nabi`-Kasten, den Vollbild anpinnt, `onBody` ist der Hook, der der Vorschau die Leseseiten-Laufzeit anheftet (unten) |
| `mountSticky({ root, surface })` | nein | gibt so viel zurück, wie eine mobile Tastatur die sticky Werkzeugleiste hochgeschoben hat |
| `mountPickedMark({ nabi, surface })` | nein | die Markierung für ein gewähltes Bild oder Video (der Browser zeichnet sie nicht) |
| `mountFile({ nabi, store, name? })` | bei save und open | Speichern und Öffnen einer `.nabi`-Datei |
| `mountLocalHistory({ nabi, storage })` | bei localHistory | ein Datensatz, der in festen Abständen im Browser abgelegt wird. Auch mit `storage` als `null` (etwa unter `file://`) wird er aufgestellt — nur so kann er per toast sagen, warum die Schaltfläche nicht geht |
| `mountUpload({ … })` + `mountUploadView({ … })` | bei upload | Uploads aus Drop, Einfügen oder Dateiauswahl laufen lassen und anzeigen |

**Bilder, Checkboxen, das Ziehen von Tabellenzellen und das Einfärben von Code haben nichts separat
zu mounten** — die Flügel tragen das alles in `attach`, und `mountSurface` heftet es mit ihnen
zusammen an. Nur beim Einfärben von Code will jemand eingesteckt werden, der das Färben übernimmt
(`makeCodeAttach`, siehe [{{ t('menu_wing_code') }}](../wing/block/code)).

### Der Vorschau die Leseseiten-Laufzeit anheften

Die Vorschau ist statisches HTML, in das `getHtml()` unverändert eingesetzt wird — Dinge, die **auf
der Leseseite JavaScript erledigt**, etwa Tabellensortierung oder Code-Einfärbung, heften sich also
nicht von selbst an. `attachViewer` aus `nabi-note/viewer` legt das alles über einen einzigen
Aufruf, und in der Vorschau ist der `onBody`-Hook die Stelle, an der Sie es anheften — ändern Sie
die `mountViewTools`-Zeile der minimalen Anordnung oben so:

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'de',
  onBody: (body) => attachViewer(body, { locale: 'de' }),
})
```

`onBody` wird gerufen, sobald der Vorschau-Textkörper steht, und die als Antwort gegebene
Trennfunktion wird gerufen, sobald die Überlagerung wieder abgenommen wird. Heften Sie **dieselbe
eine Zeile** (`attachViewer`) auch an die veröffentlichte Seite — die Vorschau soll der
veröffentlichten Seite gleichen, und genau darin liegt der Sinn dieses Hooks: denselben Zugang an
beide zu hängen. Näheres steht unter
[{{ t('menu_intro_cdn') }} ▸ Leseseite](./cdn#die-lesende-seite).

Die Code-Einfärbung beantwortet standardmäßig der eingebaute Tokenizer (null Abhängigkeiten). Ein
Host, der einen Highlighter wie Shiki einsetzt, reicht denselben Hook als
`attachViewer(body, { locale, highlight })` weiter — stimmt das mit dem überein, was Sie
`makeCodeAttach({ highlight })` übergeben haben, laufen Editor-Bildschirm und Leseseite nie in
unterschiedlichen Farben auseinander.

Um Flügel auszutauschen, nehmen Sie all diese Stücke ab (`unmount()`) und bauen sie neu — das
Markup, das der entfernte Flügel hielt, fällt an Ort und Stelle zu reinem Text herab. Die Demos
dieser Website arbeiten genau so: einen Flügel-Chip umschalten, und der gesamte Zusammenbau wird neu
gebaut.

Die CSS-Variablen, Farben und Formen eingeschlossen, stehen unter
[{{ t('menu_style_custom') }}](../style/custom).

---

## Die drei Wege hinaus

```ts
nabi.getHtml()        // das HTML, das Sie speichern und veröffentlichen
nabi.getJson()        // der Nabi-Baum (JSON)
nabi.getEditorHtml()  // das HTML des Editor-Bildschirms, so wie es jetzt ist (trägt data-key)
```

**Speichern Sie eine der ersten beiden.** `getEditorHtml()` trägt ein bildschirmeigenes Kennzeichen
(`data-key`), ist also nicht der Wert, den Sie exportieren — es ist der Platz für das serverseitige
Vorab-Rendern eines Editors (SSR).

Das ausgehende JSON sieht so aus. **Ein Dokument ist ein Array von Blöcken**, ohne umhüllenden
Wurzelknoten.

```json
[
  {"w":"p","a":{"h":2},"ch":["Titel"]},
  {"w":"p","ch":["Text ",{"w":"b","ch":["fett"]}," und ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["ein Link"]}]},
  {"w":"p","a":{"a":"c"},"ch":["zentriert"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["eins"]}]},
    {"w":"li","ch":[{"w":"p","ch":["zwei"]}]}]}]}
]
```

Vier Regeln lesen es, und das ist alles.

- **`w` ist die id des Flügels, der den Knoten zeichnet.** Nur zwei Wörter sind reserviert, `p`
  (Absatz) und `br` (Zeile); alles andere ist die id eines Flügels, den Sie registriert haben — `b`,
  `ul`, `li` und dergleichen. Eine Überschrift ist kein eigener Flügel, sondern **ein Attribut des
  Absatzes** (`{"w":"p","a":{"h":2}}`).
- **Eine Zeichenkette ist Text, ein Objekt ist ein Flügel.** Es gibt kein eigenes Feld, das die Sorte
  benennt.
- **`a` ist der Wert, den dieser Flügel trägt** — die Adresse eines Links, die Farbe einer
  Hervorhebung, die Stufe einer Überschrift. Fehlt, wenn es keinen gibt. Auch der Wert der
  Ausrichtung ist `a`, lebt aber **innerhalb** dieses Feldes, sodass die beiden nie verwechselt
  werden (`{"w":"p","a":{"a":"c"}}` — ein zentrierter Absatz).
- **Alles, was den Platz eines Absatzes einnimmt, etwa eine Tabelle, eine Liste oder ein Bild, wird
  von einer Schicht Absatz umhüllt** (sehen Sie sich das `ul` oben an). Dieser Absatz trägt die
  Ausrichtung, und er gibt dem Caret einen Platz, vor und nach dem Klotz zu stehen. In HTML geht er
  als `<div data-nabi-p>` hinaus — weil ein `<p>` nach der Grammatik keine Tabelle und keine Liste
  fassen kann.

Der intern laufende Baum trägt an jedem Knoten noch eines mehr, `_id` — **die interne Adresse, mit
der der Caret auf einen Knoten zeigt**. Die meisten Bearbeitungen vergeben sie neu, und sie wird auf
dem Weg hinaus entfernt (464 → 317 Byte für das Beispiel oben). Was hinausgeht, geben Sie genauso
wieder in `setJson()` hinein.

---

## Die vier Wege hinein

```ts
createNabiWith(wings, { doc })   // mit einem bereits fertigen Nabi-Baum starten
nabi.setJson(json)               // das ganze Dokument gegen einen Nabi-Baum austauschen
nabi.setHtml(html)               // das ganze Dokument gegen eine HTML-Zeichenkette austauschen
nabi.applyCommand('setHeading', { value: 2 })  // ein Bearbeitungs-Command (dasselbe Tor, das Flügel nutzen)
```

Alle vier **antworten mit einem `boolean`, ob es geklappt hat.** Sie werfen nicht, und bei Fehlschlag
lassen sie das Dokument unangetastet.

| Wo die Antwort `false` ist | |
|---|---|
| `setJson` | es hat nicht die Gestalt eines Nabi-Baums |
| `setHtml` | der Adapter `parseHtml` ist nicht eingesteckt (unten), oder die Bearbeitung ist gesperrt |
| `applyCommand` | es gibt kein solches Command, oder **es ändert sich nichts** |

Die letzte Zeile ist eine Regel für sich — **ändert sich nichts, bleibt es still.** Setzen Sie
`setHeading` auf einen Absatz, der schon eine Überschrift Stufe 2 ist, antwortet es `false` und
hinterlässt weder einen Rückgängig-Punkt noch ein Signal.

Das dritte Argument von `applyCommand` ist **die rufende Hand** — bei `applyCommand(name, args?,
by?)` ist `by` entweder `'keyboard'` oder `'pointer'` (Typ `CommandHand`), und bleibt es
unausgesprochen, gilt Tastatur. Es gibt genau eine Stelle, an der das einen Unterschied macht: Ein
Mark-Command an einer eingeklappten Caret-Stelle wird bei Tastatur vorgemerkt (es greift ab dem
nächsten Zeichen), bei Zeiger dagegen ohne Vormerkung mit `false` beantwortet, begleitet von einem
Toast „es gibt nichts, worauf das angewendet werden könnte". Bauen Sie eine eigene Oberfläche, die
Commands ruft, geben Sie am Klick-Handler `'pointer'` an.

### `setHtml` braucht einen Adapter

HTML zu lesen ist die Aufgabe des `DOMParser` des Browsers. Der Kern kennt kein DOM, deshalb stecken
Sie diesen Adapter dort ein, wo Sie den Editor deklarieren.

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` braucht keinen Adapter — Sie können gespeichertes JSON **direkt von einem Server
(Node.js)** hineingeben. Auch der Zusammenbau (`getHtml`) nutzt kein DOM, also steht der Weg offen,
JSON auf einem Server zu lesen und das daraus gebaute HTML hinauszusenden.

---

## Benachrichtigungen kommen über toast heraus

Upload-Fehler, Hinweise des lokalen Verlaufs, ein kurzer Satz wie „es gibt nichts, worauf das
angewendet werden könnte" — das alles kommt über **einen einzigen Weg, toast,** heraus. Den
Standardkasten hält der Kern selbst bereit, Sie müssen also nichts einstecken — steht eine
Werkzeugleiste, erscheint er an einer festen Stelle etwas unterhalb davon (bewegt sich nicht, auch
wenn die Kontextzeile erscheint und wieder verschwindet).

- Es gibt drei Stufen — `'info' | 'warn' | 'error'`. Keine Stufe für Erfolg oder Misserfolg, sondern
  dafür, **wie angespannt der Leser sein sollte**.
- Standardmäßig wird nach einer Sekunde abgeräumt (die letzten 0,5 Sekunden verblasst er), und ein
  Klick schließt ihn ebenfalls. Gleichzeitig stehen standardmäßig bis zu drei — kommen mehr, räumt
  zuerst der mit der kürzesten Restzeit ab.
- Die Nachricht darf `\n` enthalten und wird sowohl im hellen als auch im dunklen Modus gezeichnet.

Zwei Optionen ändern das Verhalten, eine dritte tauscht die Anzeige als Ganzes aus — alle drei
stehen bei `createNabiWith`.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // Lebensdauer — Standard 1000ms. Der Aufrufer kann sie auch pro Aufruf mitgeben
  toastMax: 5,     // Obergrenze gleichzeitiger toasts — Standard 3
  // Eine Seite mit eigenem Benachrichtigungssystem tauscht nur die Anzeige — der Standardkasten des Kerns wird kein einziges Mal gezeichnet
  // toast: (level, message, ms) => user_callback(level, message),
})
```

Auch Flügel sprechen über diesen einen Zugang — `nabi.$toast(level, message, ms?)`. Die Zeit reist
mit der Nachricht mit, sodass Sie den globalen Standard nicht wegen eines einzigen langen Hinweises
hochsetzen müssen.

---

## Wie der Editor fragt

Eine Datei zu öffnen will eine Frage wie „Es gibt hier schon Geschriebenes. Trotzdem öffnen?". Diesen
Kasten stecken Sie **einmal ein, dort, wo Sie den Editor deklarieren**.

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | Gestalt |
|---|---|
| `message` | `(text: string) => void` — eine Nachricht, keine Antwort wird entgegengenommen |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — synchron oder asynchron, beides wird angenommen |

**Der Kern greift nie von sich aus zu dem des Browsers.** Ein grauer Kasten darf nicht in eine Seite
hineinplatzen, die ihre eigenen Dialoge hat, und ein Plugin-Host (IntelliJ, VS Code) hat überhaupt
kein `window.confirm`. Diese drei Zeilen zu bauen ist Sache des Hosts.

**Nur die eingesteckten Felder gewinnen** — Sie können auch nur `message` oder nur `confirm`
einstecken. Ein nicht eingestecktes `message` kommt über den obigen core-toast (`info`) heraus, und
die Antwort eines nicht eingesteckten `confirm` ist „nein".

::: warning Fehlt sie, ist die Antwort „nein"
Eine Frage, die niemand beantwortet hat, ist kein „ja" — sie bedeutet dasselbe wie Abbrechen,
Escape oder das Schließen des Fensters. Die Stelle, an der diese Antwort landet, ist „das
Geschriebene wegwerfen und öffnen?", also darf es, wenn niemand da ist zu fragen, nicht in Richtung
Wegwerfen gehen. Auch auf einem Server (Node) geht es mit diesem Wert still vorbei.
:::

**Sie gehört einem einzigen Editor** — nicht der Seite, sodass zwei Editoren auf einer Seite auf
zwei verschiedene Arten fragen können. Flügel bekommen dasselbe (`nabi.$ask`) — diese Geschichte
steht unter [{{ t('menu_wing_custom') }} ▸ UI und Verhalten](../wing/custom/ui).

---

## Der Name dieses Editors, und „hat es sich geändert"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <Unixzeit>-<Nonce>, eine je Instanz
nabi.isChanged() // hat sich das Dokument seit der letzten Baseline bewegt
```

`sessionId` wird einmal erzeugt und ändert sich nie. Die Zeit sagt, wann dieser Editor aufgestanden
ist, und sortiert sich von selbst, und die Nonce hält zwei Editoren auseinander, die in derselben
Millisekunde entstanden sind. Sie ist ein Namensschild für einen Entwurf, eine Log-Zeile oder einen
Autosave-Schlüssel.

**Drei Dinge ziehen eine frische Baseline** für `isChanged()` — ein ganzes Dokument hineinzugeben
(`createNabiWith({ doc })`, `setJson()`, `setHtml()`), und mitzuteilen, dass ein Speichern
durchgegangen ist.

```ts
nabi.$markSaved(savedDoc)   // nachdem ein Speichern gelungen ist — übergeben Sie das Dokument, das Sie da gespeichert haben
```

**Übergeben Sie den Baum von dem Moment, in dem gerade gespeichert wurde** (nicht den Baum, wie er
jetzt dasteht). Buchstaben, die während eines langsamen Speicherns getippt wurden, müssen weiterhin
„geändert" bleiben. Der Speicher-Flügel (`save`) ruft dies auf, sobald die Datei tatsächlich
geschrieben ist, sodass das Speichern nach `.nabi` `isChanged()` zu `false` macht.

**Rückgängig bis zum Ausgangspunkt, und es ist wieder `false`** — der Nabi-Baum ist unveränderlich
und wird bei jeder Bearbeitung als Ganzes ersetzt, deshalb ist dies an Ort und Stelle bekannt, ohne
zu durchlaufen oder zu hashen, um zu fragen, ob es dasselbe Dokument ist.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## Weiterführende Seiten

- [{{ t('menu_intro_ssr') }}](./ssr) — gespeicherte Werte serverseitig vorab zeichnen und per `hydrate` übernehmen
- [{{ t('menu_intro_cdn') }}](./cdn) — ohne Build-Werkzeug, mit einem einzigen `<script>`
- [{{ t('menu_wing_custom') }}](../wing/custom) — eine fehlende Formatierung selbst bauen

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
