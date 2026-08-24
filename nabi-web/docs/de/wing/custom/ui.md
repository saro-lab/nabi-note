---
title: UI und Verhalten
description: Anleitung zur Anbindung von Werkzeugleisten-Schaltflächen (button), Kontextzeile (context), Stylesheets (styles) und Dialogen mit der Person (ask).
---

# UI und Verhalten

Ein Flügel stellt seine Benutzeroberfläche an drei festen Stellen bereit: der **Haupt-Werkzeugleiste** (`button`/`buttons`), der **Kontextzeile** (`context`) und dem **flügeleigenen CSS** (`styles`).

---

## Werkzeugleisten-Schaltflächen (`button` / `buttons`)

```ts
button: {
  group: 'emphasis',                   // in welcher Gruppe sie steht — Pflicht
  svg: '<path d="…"/>',                // SVG-Path-Zeichenkette innerhalb eines 16×16-viewBox
  label: { de: 'Fett' },
  shortcut: 'B',                       // dieser Buchstabe im Hinweismodus (Shift zweimal getippt)
  accelerator: 'mod+b',                // die Strg/⌘-Kombination
  action: { kind: 'mark' },            // Umschalten einer Inline-Mark
}
```

Bietet ein Flügel mehrere Schaltflächen an, definieren Sie sie als Array in `buttons` (zum Beispiel ein Textausrichtungs-Flügel mit drei Schaltflächen links/mittig/rechts). Jede Schaltfläche wird über `name` unterschieden, und `value` gibt an, welchen Wert diese Schaltfläche repräsentiert.

### Reihenfolge der Schaltflächengruppen (`group`)

Die Anzeigereihenfolge der Werkzeugleisten-Gruppen ist wie folgt festgelegt:

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

Unabhängig davon, wo Sie einen Flügel im Array deklarieren, wird seine Schaltfläche automatisch an der Position ihrer zugehörigen Gruppe platziert; innerhalb derselben Gruppe wird nur nach Registrierungsreihenfolge der Flügel sortiert. Geben Sie einen neuen, nicht in der Liste enthaltenen Gruppennamen an, wird am Ende der Werkzeugleiste eine neue Gruppe angefügt.

Sind im aktuellen Zustand alle Schaltflächen einer bestimmten Gruppe ausgeblendet, werden diese Gruppe und ihr Trennstrich automatisch mitversteckt.

### Arten von Schaltflächen-Aktionen (`action`)

| `kind` | Wirkung | Zusätzliche Eigenschaften |
|---|---|---|
| `'mark'` | schaltet eine Inline-Mark um (läuft über die Standardlogik des Kerns) | — |
| `'command'` | führt das angegebene Command aus | `command`, `args?` |
| `'menu'` | zeigt ein Dropdown zur Werteauswahl | `command`, `argKey`, `values` |
| `'grid'` | zeigt einen Zeilen×Spalten-Raster-Picker zum Einfügen einer Tabelle | `command`, `rowsKey`, `colsKey`, `max?` |
| `'prompt'` | hebt ein Eingabe-Popup an und übergibt den eingegebenen Wert dem Command | `command`, `fields` |
| `'file'` | öffnet den Dateiauswahl-Dialog | `accept?`, `multiple?` |
| `'host'` | wird an den Host-Callback weitergegeben (`onHost` von `mountToolbar`) | — |

Eine Schaltfläche ohne definiertes `action` tut bei einem Klick nichts.

### Tastenkürzel (`shortcut` und `accelerator`)

| Feld | Form | Regel |
|---|---|---|
| `shortcut` | `'B'` | **ein lateinischer Großbuchstabe oder eine einzelne Ziffer** |
| `accelerator` | `'mod+b'` | `mod+`-Präfix gefolgt von **einem Kleinbuchstaben** |

Deklarieren zwei verschiedene Flügel dasselbe Tastenkürzel, wird beim Initialisieren sofort eine Ausnahme ausgelöst.

Mit der Option `accelerated` können Sie festlegen, dass beim Ausführen über das Tastenkürzel eine andere Aktion abläuft (zum Beispiel: Klick auf die Schaltfläche öffnet ein Optionsmodal, während das Tastenkürzel den Standardwert sofort anwendet).

::: warning Tastenkürzel funktionieren nur innerhalb des zugewiesenen Editorbereichs
Tastenkürzel-Ereignisse erkennen nur Tasteneingaben, die innerhalb des an `mountToolbar({ surface })` übergebenen Editorbereichs auftreten. Existieren auf einer Seite mehrere Editoren, muss die Option `surface` unbedingt angegeben werden, um Interferenzen zwischen den Tastenereignissen zu vermeiden.
:::

---

## Regel für die Anzeige des aktiven (Pressed) Zustands

Ob eine Schaltfläche als „gerade aktiv (Pressed)" angezeigt wird, hängt vom Flügeltyp (`place`) ab:

| `place` | Kriterium für Aktivierung |
|---|---|
| `'mark'` | ob diese Inline-Mark an der aktuellen Cursorposition angewendet ist |
| `'attr'` | ob der `currentValue`-Rückgabewert des aktuellen Absatzknotens mit dem `value` der Schaltfläche übereinstimmt |
| `'container'` · `'void'` | ob der Cursor sich innerhalb oder auf diesem Blockobjekt befindet |
| `'tool'` | bleibt immer inaktiv |

Bei Flügeln mit mehreren Werten (Überschrift, Ausrichtung usw.) wird nur die Schaltfläche als aktiv eingefärbt, deren `value` mit der von `currentValue` zurückgegebenen Zeichenkette übereinstimmt.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

---

## Regel für das automatische Verstecken von Schaltflächen

Der Editor-Kern blendet zugehörige Werkzeugleisten-Schaltflächen automatisch aus, wenn eine Formatierung nicht angewendet werden kann:

- In **Bereichen mit eingeschränkter Formatierung**, etwa innerhalb eines Code-Blocks, werden Inline-Mark- und andere Block-erzeugende Schaltflächen automatisch versteckt.
- Im Wrapper-Absatz eines Blockobjekts (Bild, Tabelle usw.) werden Absatzattribute wie Überschrift versteckt (die Textausrichtung (`a`) bleibt jedoch als Ausnahme erhalten, um die Ausrichtung des Objekts zu ermöglichen).
- Schaltflächen von Flügeln, die nicht in der `allows`-Erlaubnisliste des übergeordneten Containers enthalten sind, werden automatisch versteckt.

---

## Dynamische Kontextzeile (`context`)

Eine Hilfswerkzeugleiste, die auf das Element am aktuellen Cursor spezialisierte Einstellungswerkzeuge bereitstellt (zum Beispiel: Größenregler bei Bildklick, URL-Eingabeformular bei Linkklick, Zeile/Spalte-hinzufügen-Schaltflächen bei Cursor innerhalb einer Tabelle).

```ts
context: {
  title: { de: 'Notiz' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { de: 'Ton' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // Attributschlüssel des Knotens, aus dem der aktuelle Wert gelesen wird
      values: [
        { value: 'info', label: { de: 'Hinweis' } },
        { value: 'warn', label: { de: 'Warnung' } },
      ],
    },
  ],
}
```

### Arten von Kontextzeilen-Steuerelementen (`ContextControl`)

| `kind` | Form des Steuerelements | Wichtige Eigenschaften |
|---|---|---|
| `'button'` | einfacher Schaltflächenklick | `command`, `args?` |
| `'toggle'` | Umschalter (AN/AUS) | `command`, `token` |
| `'select'` | Dropdown-Auswahlmenü | `command`, `argKey`, `values`, `attr?` |
| `'range'` | Schieberegler (z. B. Breitenanpassung) | `command`, `argKey`, `values`, `rest?`, `readout?` |
| `'text'` | Textfeld (z. B. Link-URL) | `command`, `argKey`, `initial?`, `placeholder?`, `validate?` |
| `'prompt'` | zusammengesetztes Formular-Popup | `command`, `fields` |
| `'lightbox'` | Bild-Vergrößerungs-Popup | `src`, `alt?` |

Alle Steuerelemente unterstützen gemeinsam `name` (Pflicht), `label?`, `svg?`, `tip?`, `visible?`. Über die Funktion `visible(node)` lässt sich die Anzeige eines Steuerelements dynamisch an eine bestimmte Bedingung knüpfen (zum Beispiel: die Schaltfläche „Verbindung lösen" nur anzeigen, wenn Zellen verbunden sind).

---

## Flügeleigene Stile (`styles`)

Ein Flügel kann sein benötigtes CSS selbst mitbringen.

```ts
styles: `
  .nabi-content aside[data-nabi-note] {
    border-left: 3px solid var(--nabi-accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
`
```

Über `collectSheets(registry)` und `injectSheets(document, sheets)` lassen sich ausschließlich die Stile der registrierten Flügel dynamisch in das Dokument einschleusen; derselbe Stil-String wird nicht doppelt eingeschleust.

---

## Anbindung von Dialogen mit der Person (`ask`)

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

- `message`: zeigt einen einfachen Hinweis (`(text: string) => void`)
- `confirm`: Bestätigen/Abbrechen-Auswahlfenster (`(text: string) => boolean | Promise<boolean>`)
- `choose`: Mehrfachoptionen-Auswahlfenster (`(question: string, options: ChooseOption[]) => number | Promise<number>`)

Die `ChooseOption`-Struktur ist `{ label: string, icon?: string }`, der Rückgabewert ist der 0-basierte Index der gewählten Option (`-1` beim Abbrechen).

::: warning Standardverhalten ohne angegebenen ask-Handler
Wird kein `ask`-Handler übergeben, ist der Standard-Rückgabewert von `confirm` sicherheitshalber `false` (Abbruch).
Bei `choose` wird ohne Handler standardmäßig die erste Kandidatin (Index `0`) gewählt. Die UI zur Formatwahl beim Einfügen und Ähnliches wird beim Mounten von `mountToolbar` automatisch an die im Kern eingebaute, dedizierte UI gebunden — in einer gewöhnlichen Umgebung müssen Sie `choose` also normalerweise nicht selbst implementieren.
:::

---

## Weiterführende Dokumente

- [Einen Inline-Mark schreiben](../custom/inline) · [Blöcke und Absatzattribute erstellen](../custom/block) · [Tasten, automatische Umwandlung, Einfügen](../custom/input)
- [Theming anpassen](../../style/custom) — Leitfaden zu CSS-Variablen und Themes

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
