---
title: Einen eigenen Flügel bauen
description: Eine Anleitung zum Schreiben von NABI NOTEs Wing-Schnittstellenvertrag, um neue eigene Formatierungen und Funktionen zu bauen.
---

# Einen eigenen Flügel bauen

Ein Flügel ist **ein einziges, reines JavaScript-Objekt.** Es gibt keine Klassenvererbung und keine separate Registrierungszeremonie bei einem Framework — das Objekt in das Array zu legen, das Sie `createNabiWith` übergeben, registriert es sofort.

Jeder mitgelieferte offizielle Flügel — Fett, Tabellen, Datei-Upload, alle — ist nach genau derselben `Wing`-Schnittstelle geschrieben. Ein selbst geschriebener Flügel läuft **unter genau denselben Bedingungen** wie ein eingebauter.

---

## Das einfachste Flügel-Beispiel

Ein Inline-Mark-Flügel, der das `<kbd>`-Tastatur-Tag unterstützt.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // die eindeutige ID dieses Flügels (der Schlüssel im gespeicherten nabi-tree)
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // HTML-Ausgabefunktion
  }),
  // erkennt <kbd>-Tags im eingehenden HTML und wandelt sie in einen nabi-tree-Knoten um
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Jetzt bleibt das `<kbd>`-Tag im Editor erhalten — es überlebt Zwischenablage-Einfügen, `setHtml()` sowie Speichern und erneutes Laden.

```
registriert:       <p>Kurzbefehl: <kbd>Strg</kbd>+<kbd>S</kbd></p>   →   <kbd>-Tag bleibt erhalten
nicht registriert: <p>Kurzbefehl: <kbd>Strg</kbd></p>               →   <p>Kurzbefehl: Strg</p> (wird zu reinem Text)
```

`toHtml` ist die Serialisierungsfunktion, die einen nabi-tree-Knoten nach HTML exportiert, und `claim` ist die Deserialisierungsregel, die externes HTML wieder in einen nabi-tree-Knoten zurückliest. Fehlt `claim`, funktioniert die HTML-Ausgabe zwar, aber beim erneuten Laden nach dem Speichern wird das Tag zu reinem Text.

Für ein Mark ohne Attribute nutzen Sie `simpleMark()`, für ein Mark mit einem Attributwert `valueMark()`, für ein eigenständiges Blockobjekt `boxObject()` und für eine Listenstruktur `listFamily()` — alle reduzieren Boilerplate.

---

## Flügel-Module und Fabrikfunktionen

**Die meisten mitgelieferten Flügel sind vordefinierte, unveränderliche Konstanten** (`boldWing`, `headingWing` usw.). Nur die Flügel, die zusätzliche Konfigurationsoptionen benötigen, werden als Fabrikfunktionen angeboten.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Wenn Sie nur das Verhalten eines bestimmten mitgelieferten Flügels ändern möchten (z. B. einen Syntax-Highlighter), können Sie das vorhandene Flügel-Objekt mit dem Spread-Operator erweitern und nur einzelne Eigenschaften überschreiben.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Registrierungsreihenfolge und Validierung

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**Die Reihenfolge der Flügel im Array ist die HTML-Scan-Priorität.** Beim Parsen externen HTMLs (`claim`) werden die Flügel in Registrierungsreihenfolge geprüft, und der Flügel, der als Erster die Eigentümerschaft beansprucht, verarbeitet dieses Tag. Ein Tag, das kein Flügel übernimmt, wird von seinem Tag befreit — nur der innere Text bleibt erhalten.

Die Platzierung der Werkzeugleisten-Schaltflächen richtet sich **zuerst nach der Gruppenreihenfolge (`button.group`)**; nur innerhalb derselben Gruppe entscheidet die Registrierungsreihenfolge der Flügel.

### Validierung und Ausnahmebehandlung (Strict Validation)

`createNabiWith` verzögert bei einem Flügel, der den Vertrag verletzt, keinen Laufzeitfehler — es **wirft sofort bei der Initialisierung eine Ausnahme.**

| Prüfpunkt | Verstoßbeispiel |
|---|---|
| Verwendung eines reservierten Bezeichners | `w: 'p'`, `w: 'br'` |
| Doppelte Registrierung eines Bezeichners (`w`) | Denselben `boldWing` doppelt übergeben |
| Fehlende Renderfunktion | `place: 'mark'` ohne definiertes `toHtml` |
| Verstoß gegen die Befehls-Namenskonvention | Verstoß gegen Verb+Nomen-camelCase (z. B. `insertTable`) |
| Fehlender erforderlicher abhängiger Flügel | Fehlender Bild-/Link-Flügel, der beim Upload-Flügel per `requiresAnyOf` verlangt wird |

---

## Commands — reine Funktionen

Jede Operation, die das Dokument ändert, läuft über eine Command-Funktion. Ein Command verhält sich als **reine Funktion, die weder von der DOM-API noch vom Bildschirm-Rendering abhängt.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // Typ des externen Arguments prüfen
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { de: 'Stempel' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'OK' } },
  },
}
```

| Parameter | Beschreibung |
|---|---|
| `doc` | Das aktuelle nabi-tree-Dokumentarray (wird als unveränderlich behandelt — gibt ein neues Dokument zurück, statt es direkt zu ändern) |
| `sel` | Der aktuelle Caret- und Auswahlzustand (`{ anchor, focus }`) |
| `args` | Das von einer Werkzeugleisten-Schaltfläche oder der UI übergebene Argumentobjekt |
| `env` | Schema-Wissen und Umgebungskontext |

Ein Command gibt entweder das geänderte `{ doc, selection }`-Objekt oder **`null`** zurück. **Wenn sich am Dokument nichts ändert, muss `null` zurückgegeben werden.** Bei `null` gibt `applyCommand` `false` zurück, und es entsteht kein unnötiger Undo-Eintrag. Das zurückgegebene Dokument läuft durch die `cocoon`-Engine (Normalisierung), sodass die Schema-Integrität garantiert ist.

Der Host ruft den Command über seinen Namen auf.

```ts
nabi.applyCommand('insertStamp', { text: 'OK' })   // gibt boolean zurück
```

---

## Die `Wing`-Schnittstelle im Detail

Die `Wing`-Schnittstelle besteht aus insgesamt 31 Eigenschaften, von denen **2 erforderlich sind** (`w`, `place`).

### 1. Grundlegende Identität und Struktur

| Eigenschaft | Beschreibung |
|---|---|
| `w` | Eindeutiger Bezeichner des Flügels (erforderlich; reservierte Wörter `p`, `br` ausgeschlossen) |
| `place` | Typ des Flügels (erforderlich: `'mark'` Inline-Formatierung, `'void'` leerer Block, `'container'` Container-Block, `'attr'` Absatzattribut, `'tool'` Werkzeug, das nicht im Dokument gespeichert wird) |
| `basic` | Ob der Flügel ohne zusätzliche Backend-/Host-Verdrahtung von Haus aus funktioniert (`boolean`, Standard `false`). Wird als Filterkriterium herangezogen, wenn `wings().allBasic()` aufgerufen wird |
| `holds` | Erlaubter Kindtyp innerhalb eines Containers (`'blocks'` oder `'inline'`) |
| `singleParagraph` | Ob das Innere auf einen einzigen Absatz festgelegt ist (z. B. eine Tabellenzelle) |
| `boolAttrs` | Namen boolescher Attribute, deren einziger Wert `1` ist |
| `allows` | Liste der innerhalb des Containers erlaubten Kind-Flügel-Namen (ohne Angabe sind alle erlaubt) |
| `noAlign` | Ob die Textausrichtung des Wrapper-Absatzes blockiert wird (`boolean`, nur für Blockobjekte). Verhindert z. B. bei Codeblöcken, dass die `pre`-Tag-Ausrichtung kaputtgeht |
| `requiresAnyOf` | Liste abhängiger Flügel, die mitregistriert sein müssen (mindestens einer davon ist Pflicht) |
| `parts` | Definition der dem Flügel untergeordneten Unterkomponenten (Zeilen/Spalten einer Tabelle, die Zusammenfassung eines Klappblocks usw.) |

### 2. Eigenschaften und Zustandsverwaltung

| Eigenschaft | Beschreibung |
|---|---|
| `attrKey` · `attrValues` | Der von einem Absatzattribut-Flügel verwendete Attributschlüssel und die Liste erlaubter Werte |
| `currentValue` | Funktion, die den Attributwert an der aktuellen Caret-Position zurückgibt (für den aktiven Zustand der Werkzeugleisten-Schaltfläche) |

### 3. Serialisierung und Ein-/Ausgabe

| Eigenschaft | Beschreibung |
|---|---|
| `toHtml` · `partHtml` | Serialisierungsfunktion, die den nabi-tree in HTML umwandelt |
| `toMd` | Serialisierungsfunktion, die den nabi-tree in Markdown umwandelt (optional — ohne Definition wird stattdessen `toHtml` verwendet) |
| `partMd` | Markdown-Serialisierungsfunktion für Unterkomponenten (`parts`) |
| `ioFilter` | Vom Flügel selbst mitgebrachter Datei-Ein-/Ausgabe- und Zwischenablage-Filter |
| `claim` | Funktion, die die Eigentümerschaft für eingehendes HTML-Markup entscheidet und es in den nabi-tree umwandelt |
| `repair` · `partRepair` | Funktion, die beim JSON-Laden die Gültigkeit eines Knotens prüft und korrigiert (bei Rückgabe von `null` wird der Knoten entfernt) |

### 4. Eingabe- und Ereignissteuerung

| Eigenschaft | Beschreibung |
|---|---|
| `commands` | Die vom Flügel bereitgestellte Map von Command-Funktionen |
| `onKey` | Handler, der Tastatureingaben abfängt, während der Caret innerhalb dieses Flügels steht |
| `escapeKeys` | Liste der Tasten, die bewirken, dass die nächste Texteingabe diese Mark-Formatierung verlässt |
| `doubleKeys` | Zuordnung von auszuführenden Commands, wenn eine Taste innerhalb von 350ms zweimal gedrückt wird (`{ Tastenname: Commandname }`, z. B. Esc Esc → Formatierung entfernen) |
| `inputRules` | Formatierungsregeln, die automatisch anhand des Tippmusters ausgelöst werden |
| `attach` | Hook zum direkten Binden oder Steuern von Event-Listenern an ein DOM-Element (Tabellen-Drag, Code-Hervorhebung usw.) |

### 5. UI und Stil

| Eigenschaft | Beschreibung |
|---|---|
| `button` · `buttons` | Definition der in der oberen Werkzeugleiste gerenderten Schaltfläche(n) |
| `context` | Definition der Kontext-Werkzeugleiste, die je nach Caret-Position erscheint |
| `styles` | CSS-Stylesheet-String, den der Flügel mitbringt |

---

## IO-Filter-Erweiterung

**Ein IO-Filter (IoFilter) erzeugt keine Dokumentknoten direkt, sondern ist ein Erweiterungspunkt, der das Einfügen aus der Zwischenablage sowie Datei-Speicher-/Öffnen-Formate verarbeitet.**

| Feld | Beschreibung |
|---|---|
| `id` · `label` | Eindeutiger Bezeichner des Filters und in der UI angezeigtes Label (bei doppeltem Bezeichner wird eine Ausnahme geworfen) |
| `paste` | Funktion, die Zwischenablagedaten (`PasteData`) analysiert und Einfüge-Kandidaten zurückgibt |
| `save` | Speicherkonfigurationsobjekt (`{ extension, write, lossy?, mime? }`) |
| `read` | Funktion, die Dateiname und Text erhält und in den nabi-tree parst (bei keiner Übereinstimmung `null`) |

Alle drei Methoden des IO-Filters sind optional. Die Registrierung erfolgt über Mount-Optionen (`mountSurface`, `mountFile`), `createNabiWith({ ioFilters })` oder die `ioFilter`-Eigenschaft des Flügels selbst — der zuerst registrierte Filter hat Vorrang.

---

## Benennungsregel für den Bezeichner (`w`)

`w` ist **die Bezeichner-Zeichenkette, die im nabi-tree bei jedem Knoten wiederholt gespeichert wird.** Um die Serialisierungsgröße zu minimieren, empfiehlt sich ein kurzer String (z. B. `b`, `hl`, `tf` bei den offiziellen Flügeln).
Um Kollisionen mit offiziellen Flügeln zu vermeiden, wird für eigene Flügel das Präfix `ex` empfohlen (z. B. `exNote`, `exStamp`).

::: warning Vorsicht beim Ändern des Bezeichners
Da das gespeicherte `w`-Feld direkt auf den Bezeichner abbildet, kann eine Umbenennung dazu führen, dass bereits gespeicherte Dokumente beim Laden nicht mehr erkannt werden. Ist eine Migration nötig, behandeln Sie in der `claim`-Funktion auch den alten Bezeichner mit.
:::

---

## Weiter lesen

- [Einen Inline-Mark bauen](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Einen Block und ein Absatzattribut bauen](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Tasten, automatische Umwandlung, Einfügen](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI und Interaktion](./custom/ui) — `button` · `context` · `styles`, Anbindung von Benutzerdialogen

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
