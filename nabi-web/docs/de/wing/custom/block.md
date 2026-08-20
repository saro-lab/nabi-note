---
title: Blöcke und Absatzattribute bauen
description: void, container, attr — die Dinge bauen, die einen Platz einnehmen. Ein Klotz lebt immer innerhalb eines Wrapper-Absatzes.
---

# Blöcke und Absatzattribute bauen

Dinge, die einen Platz einnehmen, kommen in drei Sorten.

| `place` | Was | Beispiel |
|---|---|---|
| `'void'` | **Ein Klotz ohne Inneres.** Der Caret kann nicht hinein | Trennlinie, Bild, YouTube |
| `'container'` | **Ein Klotz mit Text darin** | Zitat, Klappbox, Tabelle, Liste, Code |
| `'attr'` | Ein Wert, der auf den Absatz selbst gelegt wird. Er errichtet keinen Knoten | Überschrift, Ausrichtung, Initiale |

---

## Ein Klotz lebt innerhalb eines Wrapper-Absatzes

Das Dokument ist **ein Array von Blöcken**, und das Einzige, was auf oberster Ebene stehen darf, ist
ein Absatz (`p`). Ein Klotz steht nie direkt auf oberster Ebene — er trägt **einen Absatz, der nichts
als sich selbst hält**, und steht darin.

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

Dieser Absatz ist der **Wrapper-Absatz** und wird auf dem Bildschirm als `<div data-nabi-p>`
gezeichnet.

Dafür gibt es zwei Gründe. Es gibt immer einen Platz, an dem der Caret vor und nach dem Klotz stehen
kann (weil immer ein Absatz da ist), und **der Klotz übernimmt Absatzattribute wie Ausrichtung
unverändert** — ein „zentriertes Bild" ist genau „ein Bild innerhalb eines zentrierten Absatzes".

---

## Einen Klotz ohne Inneres bauen

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { de: 'Stern' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` setzt den Wrapper-Absatz für Sie auf.

```
<div data-nabi-p><hr data-nabi-star/></div>
```

Rufen Sie es auf einem leeren Absatz auf, **übernimmt es diesen Absatz** — Sie bleiben nicht bei
jedem Einfügen mit einer leeren Zeile zurück. Und jede Ausrichtung, die dieser Absatz bereits trug,
überlebt unangetastet.

Was `boxObject` für Sie ausfüllt, ist `place: 'void'` und **die Attribut-Prüfer**.

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // Werte außerhalb der Liste fallen weg
  requires: ['c'],                                                 // ohne dieses steht der Klotz nicht
  toHtml: /* … */,
})
```

Ein Attribut, das Sie nicht in `attrs` aufgeführt haben, ist **ein unbekanntes Feld und fällt
vollständig weg.** Es gibt keine Stelle, an der sich ein Wert außerhalb des Vertrags in den
gespeicherten Wert einschleichen könnte.

---

## Einen Klotz mit Innerem bauen

`place: 'container'` muss immer `holds` daneben tragen — lassen Sie es weg, stirbt die
Registrierung.

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // Absätze leben darin ('inline' bedeutet nur Zeichen)
  allows: ['p'],                    // was hier hereinkommen darf
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { de: 'Notiz' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` ist ein **Umschalter**. Er umhüllt die Blöcke auf oberster Ebene, die die Auswahl
umspannt, mit diesem Container, und sind sie bereits alle umhüllt, legt er das Innere an Ort und
Stelle wieder aus.

```
vorher            [p"erste Zeile", p"zweite"]
nachher           [p[ note[ p"erste Zeile", p"zweite" ] ]]
erneut gedrückt   [p"erste Zeile", p"zweite"]
```

### `holds`

| | Was darin lebt | Beispiel |
|---|---|---|
| `'blocks'` | Absätze und andere Klötze | Zitat, Klappbox, eine Tabellenzelle |
| `'inline'` | Nur Zeichen und Marks | eine Klappbox-Zusammenfassung, Code |

### `allows`

Schreiben Sie es, **darf nichts anderes hereinkommen.** Der Kern legt einen eigenen Aufräumer auf,
sodass, ob es per Einfügen oder aus einem gespeicherten Wert kommt, alles außerhalb der Liste seine
Hülle abgestreift bekommt und sein Text sich als Absatz niederlässt.

Lassen Sie es weg, ist alles erlaubt. Setzen Sie einen unbekannten Namen in `allows`, **stirbt es
genau an der Stelle der Registrierung.**

---

## `parts` — schaltflächenlose innere Struktur

Struktur, die **nicht allein stehen kann und keine Werkzeugleisten-Schaltfläche hat** — Zeilen und
Zellen einer Tabelle, eine Klappbox-Zusammenfassung — wird als Teil (part) deklariert.

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // ein Attribut, dessen einziger Wert 1 ist — ob sie offen ist
  parts: { summary: { holds: 'inline' } },            // die Zusammenfassungszeile
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // jeder Teil braucht einen Baukasten
  repair: repairDetails,
}
```

Es gibt vier Regeln.

- **Nur Container** haben Teile. Schreiben Sie sie auf ein anderes `place`, stirbt die
  Registrierung.
- Jeder Teil muss ein `partHtml` haben. Ohne es stirbt die Registrierung.
- Der Name eines Teils darf nicht mit einem Flügelnamen oder dem Namen eines anderen Teils
  kollidieren.
- Braucht ein Teil Glättung, schreiben Sie es unter dem Namen des Teils in `partRepair`.

`StructureDecl` nimmt drei Dinge — `holds`, `singleParagraph` und `boolAttrs`.

### `singleParagraph`

Das Innere ist **auf einen Absatz festgelegt**. Das ist, was eine Tabellenzelle ausmacht — drücken
Sie <kbd>Enter</kbd> innerhalb einer Zelle, spaltet sich der Absatz nicht in zwei, und das Löschen
einer über zwei Zellen reichenden Auswahl verschmilzt die Zellen nicht miteinander. Dieses eine Feld
ist es, das das Raster intakt hält.

### `boolAttrs`

Ein Attribut, dessen einziger Wert `1` ist — das `o` (offen) der Klappbox, das `ck` (abgehakt) einer
Aufgabenliste, das `dc` (Initiale) eines Absatzes. Der Aus-Zustand ist nicht `0`, sondern **dass das
Feld überhaupt nicht da ist**.

---

## `repair` — die letzte Tür am Eingang des gespeicherten Werts

`repair` glättet diesen Knoten einmal, **genau bevor JSON zu einem Dokument wird**.

```ts
repair: (node) => {
  if (!isValid(node)) return null    // null — dieser Knoten wird samt Hülle entfernt
  return geglaetteterKnoten          // ihn unverändert zurückzugeben ist in Ordnung (dasselbe Objekt bedeutet, nichts hat sich geändert)
}
```

Ein von Hand bearbeiteter gespeicherter Wert, ein Dokument aus einem anderen Build, von jemand
anderem gebautes JSON — all das geht durch diese Tür. Nur was hier durchkommt, wird zu einem
Dokument, was dies zu **der einen Stelle macht, an der ein Flügel für die Gestalt seines eigenen
Knotens bürgen kann.**

Schreiben Sie `allows` und `repair` zusammen, läuft die `allows`-Glättung **zuerst**, und ihr
Ergebnis wird an `repair` weitergereicht.

---

## `requiresAnyOf` — ein Flügel, der einen Partner zum Stehen braucht

```ts
requiresAnyOf: ['img', 'a']
```

Ist keiner davon daneben registriert, **stirbt es genau an der Stelle der Registrierung.** Der
Upload-Flügel nutzt dies — was er hochlädt, muss als Bild oder Link errichtet werden, und ist keines
von beiden da, kann er hochladen und danach nichts weiter tun.

---

## Absatzattribute (`place: 'attr'`)

Ein Absatzattribut errichtet keinen Knoten. Es legt nur einen Wert auf das `a` des Absatzes.

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["Eine zentrierte Überschrift 2"] }
```

::: warning Die Felder sind auf drei festgenagelt
`attrKey` muss eines von **`h` (Überschrift) · `a` (Ausrichtung) · `dc` (Initiale)** sein, jeder
andere Name bringt die Registrierung zum Absturz. In diesem Build **kann kein neues Absatzattribut
angelegt werden** — die Attributfelder eines Absatzes sind auf die drei geschlossen, die der Kern
kennt.

Aus demselben Grund sind diese drei bereits von `headingWing`, `alignWing` und `dropCapWing`
belegt, was faktisch keinen Raum lässt, einen neuen `place: 'attr'`-Flügel zu schreiben. Wollen Sie
einen Wert auf jeden Absatz legen, ist das Umhüllen mit einem Container vorerst der Weg.
:::

Es gibt zwei Felder, um den Wert zu handhaben.

| | |
|---|---|
| `attrValues` | Die Liste der Werte, die es annimmt (für eine Überschrift `[1,2,3,4,5,6]`) |
| `currentValue` | Der Wert, den dieser Absatz jetzt trägt. Werkzeugleiste und Kontextzeile bemalen den gedrückten Platz anhand dieser Antwort |

---

## Die öffentlichen Dokument-Helfer

Dieser Build gibt vier Bearbeitungs-Helfer heraus.

| | Was es tut |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | Errichtet einen Klotz, Wrapper-Absatz und alles |
| `removeLump(doc, topIndex, env)` | Nimmt einen Wrapper-Absatz auf oberster Ebene als Ganzes weg |
| `toggleWrap(doc, sel, containerW, env)` | Umhüllt die umspannten Blöcke mit einem Container oder legt sie wieder aus |
| `topNodeAt(doc, path)` | Der Knoten auf oberster Ebene, zu dem dieser Pfad gehört |

Alle vier antworten mit `{ doc, caret }`, Sie wandeln also einmal in die Gestalt um, mit der ein
Command antwortet.

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip Brauchen Sie feinere Bearbeitung als diese
Die inneren Helfer, die Zeichen für Zeichen schneiden und verbinden (einen Mark auflegen, ein
Absatzattribut schreiben und so weiter), sind noch keine öffentliche API. Bis dahin dürfen Sie das
`doc`-Array selbst neu bauen und damit antworten — das Dokument, mit dem Sie antworten, wird noch
einmal von `cocoon` geglättet, sodass ein Dokument, das die Regeln bricht, nie so überlebt.
:::

---

## Weiterführende Seiten

- [Tasten, automatische Umwandlung, Einfügen](../custom/input) — `onKey` · `inputRules` · `attach`
- [UI und Verhalten](../custom/ui) — die Werkzeugleisten-Schaltfläche und die Kontextzeile

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
