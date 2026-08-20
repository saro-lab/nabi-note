---
title: UI und Verhalten
description: Werkzeugleisten-Schaltfläche (button), Kontextzeile (context), Stylesheets (styles) — die drei Stellen, an denen ein Flügel vor einer Person steht.
---

# UI und Verhalten

Es gibt drei Stellen, an denen ein Flügel vor einer Person steht.

| Feld | Wo |
|---|---|
| `button` · `buttons` | die **Werkzeugleiste** oben — die immer sichtbare Stelle |
| `context` | die **Kontextzeile** — die Stelle, die nur für das erscheint, was der Caret gerade berührt |
| `styles` | das **CSS**, das dieser Flügel trägt |

---

## Werkzeugleisten-Schaltflächen

```ts
button: {
  group: 'emphasis',                   // in welcher Gruppe sie steht — Pflicht
  svg: '<path d="…"/>',                // das Innere auf einem 16×16-Raster. Ohne eines steht sie als Text
  label: { de: 'Fett' },
  shortcut: 'B',                       // dieser Buchstabe im Hinweismodus
  accelerator: 'mod+b',                // die Strg/⌘-Kombination
  action: { kind: 'mark' },
}
```

Für mehrere Schaltflächen schreiben Sie ein Array in `buttons` — so stellt sich ein einzelner
Ausrichtungs-Flügel als links, mittig und rechts auf. Dann unterscheidet `name` sie voneinander, und
`value` sagt, für welchen Wert jede steht.

### `group` — die Gruppe entscheidet die Reihenfolge

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**Diese Reihenfolge ist festgenagelt.** Wo auch immer Sie einen Flügel im Array platzieren, seine
Schaltfläche steht am Platz ihrer Gruppe. Die Registrierungsreihenfolge ordnet die Dinge nur
**innerhalb** einer Gruppe. Verwenden Sie einen Namen, der nicht auf der Liste steht, erscheint ganz
am Ende eine neue Gruppe.

Leert sich eine Gruppe vollständig (alle ihre Schaltflächen versteckt), verschwindet diese Gruppe
vom Bildschirm — kein leerer Trenner bleibt zurück.

### `action` — was beim Drücken geschieht

| `kind` | Was es tut | Was dazugehört |
|---|---|---|
| `'mark'` | geht zum Mark-Umschalter des Kerns. **Sie müssen kein Command schreiben** | — |
| `'command'` | führt ein Command aus | `command` · `args?` |
| `'menu'` | öffnet eine Werteliste als Panel | `command` · `argKey` · `values` |
| `'grid'` | öffnet ein Zeilen×Spalten-Raster (eine Tabelle einfügen) | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | hebt Eingabefelder an und übergibt, was zurückkommt, dem Command | `command` · `fields` |
| `'file'` | öffnet die Dateiauswahl | `accept?` · `multiple?` |
| `'host'` | gibt an den Host weiter (`onHost` von `mountToolbar`) | — |

Lassen Sie `action` weg, bewirkt ein Druck auf die Schaltfläche gar nichts.

### `shortcut` und `accelerator`

| | Gestalt | Regel |
|---|---|---|
| `shortcut` | `'B'` | **ein lateinischer Großbuchstabe oder eine Ziffer** |
| `accelerator` | `'mod+b'` | `mod+` gefolgt von **einem Kleinbuchstaben** |

Beide **sterben bei der Registrierung, wenn zwei Flügel kollidieren.** Keiner von beiden hört später
still auf zu funktionieren.

Schreiben Sie ein separates `accelerated`, bewirkt der Beschleuniger etwas anderes — die
Schaltfläche öffnet ein Panel, während <kbd>Strg</kbd>+Taste sofort den Standardwert anwendet, zum
Beispiel.

---

## Wie eine Schaltfläche gedrückt aussieht

Es gibt nur eine Grundlage, um eine Schaltfläche als „gerade an" zu bemalen.

| `place` | Was es liest |
|---|---|
| `'mark'` | ist dieser Mark am Caret |
| `'attr'` | der `currentValue` des Absatzes, in dem der Caret steht |
| `'container'`·`'void'` | ist der Caret innerhalb oder auf diesem Klotz |
| `'tool'` | **immer aus** |

Ein Flügel mit mehreren Werten (Ausrichtung, Überschriften) schreibt auf jede Schaltfläche ein
`value`, und nur die Schaltfläche, die zu dem passt, was `currentValue` des Flügels beantwortet,
wird bemalt.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` antwortet mit einer Zeichenkette** — selbst ein numerischer Wert geht durch
`String()` zurück. `undefined` bedeutet „dieser Knoten trägt keinen meiner Werte".

---

## Schaltflächen verstecken sich selbst, wo sie nicht stehen können

| `place` | Wann sie sich versteckt |
|---|---|
| `'mark'` | an einer Stelle, an der nur Text lebt (etwa innerhalb eines Code-Kastens), wenn sie diese Stelle besitzt |
| `'attr'` | wenn der Caret auf einem Wrapper-Absatz steht, der einen Klotz hält. **Ausrichtung (`a`) ist die einzige Ausnahme** |
| `'void'`·`'container'` | an einer Stelle, an der nur Text lebt, oder wenn das `allows` des aktuellen Containers sie nicht annimmt |
| `'tool'` | versteckt sich nie |

Ausrichtung ist die Ausnahme aus dem Grund, den Sie zuvor gesehen haben — die Ausrichtung eines
Klotzes wird nicht vom Klotz getragen, sondern vom Wrapper-Absatz darum. Sie müssen „zentrieren"
drücken können, während Sie auf einem Bild stehen.

Schreiben Sie `allows`, und **die Werkzeugleiste folgt von selbst.** Dass die Tabellen-Schaltfläche
innerhalb eines Code-Kastens verschwindet, ist keine separat geschriebene Regel; es fällt aus genau
diesem einen Feld heraus.

---

## Die Kontextzeile

Die Zeile, die nur für das erscheint, was der Caret gerade berührt. Klicken Sie ein Bild an, steht
die Größensteuerung da; setzen Sie den Caret in einen Link, steht das Adressfeld da.

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
      attr: 't',                                    // der Attributplatz, aus dem der aktuelle Wert gelesen wird
      values: [
        { value: 'info', label: { de: 'Hinweis' } },
        { value: 'warn', label: { de: 'Warnung' } },
      ],
    },
  ],
}
```

### Wann sie erscheint

**Alles, was der Caret berührt**, öffnet seine eigene Zeile.

- die Container auf dem Pfad des Caret (innerster zuerst, äußerster zuletzt)
- der anvisierte Klotz (etwa ein Bild, ausgewählt während man auf seinem Wrapper-Absatz steht)
- die **Marks** am Caret — anders als Werkzeugleisten-Schaltflächen bekommen Marks durchaus eine
  Kontextzeile
- ein Flügel für ein **Absatzattribut**, dessen Wert der Absatz des Caret gerade trägt

Setzen Sie den Caret in einen Link innerhalb einer Tabelle, erscheinen Link-Zeile und Tabellen-Zeile
gemeinsam.

### Die sieben Sorten von `ContextControl`

| `kind` | Was | Was dazugehört |
|---|---|---|
| `'button'` | ein Druck, ein Command | `command` · `args?` |
| `'toggle'` | zwei Zustände, an und aus | `command` · `token` |
| `'select'` | eines aus einer Liste | `command` · `argKey` · `values` · `attr?` |
| `'range'` | eine Skala verschieben (Größenänderung) | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | ein einzelnes Textfeld (eine Link-Adresse) | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | mehrere Felder als Panel | `command` · `fields` |
| `'lightbox'` | groß ansehen | `src` · `alt?` |

Alle sieben teilen `name` (Pflicht) · `label?` · `svg?` · `tip?` · `visible?`.

`visible: (node) => boolean` ist die Tür, um **ein Steuerelement innerhalb desselben Flügels zu
verstecken** — etwa „Verbindung lösen" nur auf bereits verbundenen Zellen zu zeigen.

Schreiben Sie `attr`, wird der aktuelle Wert direkt aus diesem Attributplatz zum Bemalen gelesen.
`'toggle'` vergleicht mit `token` gegen die Zeichenkette, die `currentValue` beantwortet hat.

---

## `styles` — das CSS, das ein Flügel trägt

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

Vier Regeln.

- **Alles unter `.nabi-content` eingrenzen.** Es darf nicht in den Rest der Host-Seite ausbluten.
- **Schriftgrößen in `rem` oder `em`** schreiben.
- **Dunkel nur an der Klasse `.dark` erkennen.** Tun Sie es mit einer Media Query, wird allein der
  Editor dunkel auf einem Host, der Hell gewählt hat.
- **Breit und schmal mit einer Container Query messen.** Der Maßstab ist die Breite der Stelle, an
  der der Editor sitzt, nicht die Breite des Bildschirms.

Wollen Sie nur das, was Sie registriert haben, sammeln und injizieren Sie die Stylesheets selbst.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

Ein Stylesheet mit demselben Text wird **einmal** geladen — mehrere Flügel können sich dasselbe CSS
teilen, und nur eine Kopie landet im Dokument. Die Antwort ist eine Abbaufunktion, und sie entfernt
**nur, was dieser Aufruf neu hinzugefügt hat**.

---

## Die Person fragen

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` nimmt ein `boolean` oder ein `Promise<boolean>` — stecken Sie das `confirm` des Browsers
selbst ein, oder heben Sie ein eigenes Panel an und antworten Sie später.

::: warning Lassen Sie es weg, ist die Antwort immer „nein"
Liefern Sie kein `ask`, geht ein stiller Standard ein. `message` geht nirgendwohin, und `confirm`
antwortet mit `false`. Die Überlegung ist, dass es besser ist, wenn **ein Fragen-dann-Löschen still
nicht funktioniert**, als dass es still geschieht. Das „wirklich löschen?" der lokalen Historie geht
durch diese Tür.
:::

::: tip Commands können nicht fragen
Ein Command ist eine reine Funktion; es kennt weder den Bildschirm noch die Zeit. Fragen Sie außerhalb
des Commands und rufen Sie das Command auf, **sobald die Antwort da ist**. Innerhalb eines Flügels
ist `attach` die Stelle dafür, wo Sie es über `host.nabi.$ask` erreichen.
:::

---

## Weiterführende Seiten

- [Einen Inline-Mark schreiben](../custom/inline) · [Blöcke und Absatzattribute](../custom/block) ·
  [Tasten, automatische Umwandlung, Einfügen](../custom/input)
- [Theming und CSS-Variablen](../../style/custom) — die Variablennamen, auf die die Stylesheets bauen

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
