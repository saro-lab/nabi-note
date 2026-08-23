---
title: Einen eigenen Flügel bauen
description: Fehlt eine Formatierung, bauen Sie einen Flügel — füllen Sie einen Vertrag aus, den Rest macht der Kern.
---

# Einen eigenen Flügel bauen

Ein Flügel ist **ein einziges Objekt**. Es gibt keine Klasse zum Erweitern und keine
Registrierungs-Zeremonie — ihn in das Array zu legen, das Sie `createNabiWith` übergeben, **ist**
die Registrierung.

Fett, Tabellen und Upload sind gebaut, indem genau diese Felder ausgefüllt wurden, die hier stehen.
Ein selbst geschriebener Flügel läuft unter **genau denselben Bedingungen** wie ein mitgelieferter —
es gibt keine Abkürzung, die dem Kern vorbehalten ist.

---

## Der kleinste Flügel

Ein Inline-Mark, der `<kbd>` kennt.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // der Name dieses Flügels — das ist das `w` im gespeicherten Wert
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // der Weg hinaus
  }),
  // meldet sich als Besitzer von `<kbd>` in hereinkommendem HTML
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Jetzt bleibt `<kbd>` im Dokument. Es übersteht Einfügen, `setHtml()`, Speichern und erneutes Laden.

```
registriert       <p>Drücken: <kbd>Strg</kbd>+<kbd>S</kbd></p>   →   unverändert
nicht registriert <p>Drücken: <kbd>Strg</kbd></p>                →   <p>Drücken: Strg</p>
```

**Die beiden Felder blicken in entgegengesetzte Richtungen.** `toHtml` ist der Weg hinaus und
`claim` ist der Weg hinein. Lassen Sie `claim` weg, zeichnet es sich zwar gut, **kann aber nicht
zurückgelesen werden** — die Hülle wird in dem Moment abgestreift, in dem Sie speichern und wieder
laden.

`simpleMark` ist eine Abkürzung für Marks ohne Attribute. Für einen Mark, der einen Wert trägt, gibt
es `valueMark`, für einen Klotz `boxObject`, für eine Listenfamilie `listFamily` — darüber hinaus
schreiben Sie das `Wing`-Objekt von Hand.

---

## Flügel sind Konstanten

**Die meisten Flügel sind bereits fertige Konstanten** — `boldWing` und `headingWing` gehen direkt
in das Array. Nur die beiden, die Optionen brauchen, haben eine Fabrikfunktion.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

Wollen Sie nur „den anhängenden Teil" austauschen, breiten Sie die Konstante aus — Sie ändern ein
Feld, statt einen neuen Flügel zu bauen, was von beidem der einfachere Weg ist.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Registrierung und Reihenfolge

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**Die Array-Reihenfolge ist die Abfragereihenfolge.** Wenn entschieden wird, wem ein Stück Markup
gehört (`claim`), fragt der Kern in dieser Reihenfolge, und der erste Flügel, der antwortet, nimmt es
sich. Nimmt es niemand, wird die Hülle abgestreift.

In der Werkzeugleiste **kommt die Gruppe (`button.group`) zuerst**. Die Gruppenreihenfolge ist
festgenagelt, und diese Array-Reihenfolge entscheidet nur die Standreihenfolge *innerhalb* einer
Gruppe.

### Es stirbt genau an der Stelle der Registrierung

`createNabiWith` **wirft sofort** bei einem Flügel, der den Vertrag bricht. Es platzt nie spät.

| Was es fängt | Beispiel |
|---|---|
| Ein reserviertes Wort als Name verwendet | `w: 'p'` · `w: 'br'` |
| Derselbe Name zweimal registriert | `boldWing` zweimal |
| Ein knotenerrichtender Flügel ohne `toHtml` | `place: 'mark'` ohne Weg, ihn zu zeichnen |
| Ein Command-Name, der die Regel bricht | er muss Verb+Objekt in camelCase sein (`insertTable`) |
| Ein erforderlicher Partner fehlt | Upload braucht `img` oder `a` daneben (`requiresAnyOf`) |

---

## Commands sind reine Funktionen

Jeder Weg, der das Dokument ändert, führt durch einen einzigen Command. Ein Command **kennt weder
das DOM noch den Bildschirm.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // es kommt von außen, also prüfen — passt es nicht, nichts tun
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

| Argument | Was es ist |
|---|---|
| `doc` | Das Dokument, so wie es dasteht (ein Array von Blöcken). **Ändern Sie es nicht — antworten Sie mit einem neuen** |
| `sel` | Die Auswahl, so wie sie dasteht |
| `args` | Was auch immer die Schaltfläche oder die Kontextzeile übergeben hat. **Es kommt von außen, muss also geprüft werden** |
| `env` | Sortenwissen — was hält was, und was ist ein Klotz |

Die Antwort ist `{ doc, selection }` oder **`null`**. **Antworten Sie mit `null`, wenn sich nichts
ändert** — dann antwortet `applyCommand` mit `false`, und kein Rückgängig-Punkt häuft sich an. Das
Dokument, mit dem Sie antworten, wird noch einmal von `cocoon` geglättet, sodass kein Command ein
Dokument hinterlassen kann, das die Regeln bricht.

Die aufrufende Seite geht immer über den Namen.

```ts
nabi.applyCommand('insertStamp', { text: 'OK' })   // boolean
```

---

## Jedes Feld, das Sie ausfüllen können

`Wing` hat einunddreißig Felder, und **nur zwei sind Pflicht** (`w` und `place`).

### Was es ist

| Feld | Bedeutung |
|---|---|
| `w` | Der Name dieses Flügels. Er wird zum `w` im gespeicherten Wert. Reservierte Wörter (`p`, `br`) sind nicht erlaubt |
| `place` | `'mark'` über Zeichen · `'void'` ein Klotz ohne Inneres · `'container'` ein Klotz mit Text darin · `'attr'` ein Absatzattribut · `'tool'` ein Werkzeug, das keine Spur im Dokument hinterlässt |
| `basic` | "Läuft es verdrahtet oder nicht?" — `false` standardmäßig. **Benutzerdefiniert auch**: Wenn eingestellt, passt es durch die `allBasic()`-Tür, aber was durch `.use(object)` kommt, das außerhalb der Liste steht, passt sich auch an |
| `holds` | Wie es sein Inneres hält — `'blocks'` oder `'inline'` |
| `singleParagraph` | Das Innere ist auf **einen** Absatz festgelegt (eine Tabellenzelle) |
| `boolAttrs` | Namen boolescher Attribute, deren einziger Wert `1` ist |
| `allows` | Die Namen der Flügel, die darin erlaubt sind. Weggelassen, alle |
| `noAlign` | Nur für Blöcke. Wenn gesetzt, empfängt der Wrapper-Absatz, der diesen Block trägt, keine Ausrichtung — die Ausrichtung ist in der Werkzeugleiste verborgen, der Befehl lehnt mit "keine Änderung" ab, bereits gesetzte Werte werden von `undo` gelöscht. Der Code-Block ist der erste Benutzer — `pre` erbt `text-align`, was den Kasten bewegt, statt die Zeilen zu verschieben. Wenn Mark, Tool oder Absatzattribut eingestellt ist, **stirbt die Registrierung** |
| `requiresAnyOf` | Einer davon muss daneben registriert sein |
| `parts` | Schaltflächenlose Struktur, die mitgebracht wird — Zeilen und Zellen einer Tabelle, eine Klappbox-Zusammenfassung |

### Werte

| Feld | Bedeutung |
|---|---|
| `attrKey` · `attrValues` | Der Feldname, auf den ein Absatzattribut schreibt, und die Werte, die es annimmt |
| `currentValue` | Ist es gerade an — Werkzeugleiste und Kontextzeile bemalen ihre Plätze anhand dieser Antwort |

### Die Wege hinein und hinaus

| Feld | Bedeutung |
|---|---|
| `toHtml` · `partHtml` | Der Weg hinaus |
| `toMd` | Optional. **Ohne Fallback zu `toHtml`**, die "HTML-gemischte Markdown"-Gestalt ist dort. Sie müssen ihn nur dann definieren, wenn Sie Markdown direkt schreiben können |
| `partMd` | Optional, wie `toMd` aber für Teile — Zeilen und Zellen einer Tabelle |
| `claim` | Entscheidet, wem dieses Tag in hereinkommendem HTML gehört |
| `ioFilter` | Dieser Flügel **bringt die Einfügen, Speichern und Öffnen seines eigenen Formats mit** (`.nabi` ist die eingebaute Stelle). Die Details sind in [IO-Filter einstecken](#io-filter-einstecken) unten |
| `repair` · `partRepair` | Glättet diesen Knoten an der JSON-Tür. Antworten Sie mit `null`, wird er samt Hülle entfernt |

### Hände und Tasten

| Feld | Bedeutung |
|---|---|
| `commands` | Die Commands, die dieser Flügel aufsetzt |
| `onKey` | Fängt Tasten zuerst ab, während der Caret im Knoten dieses Flügels steht |
| `escapeKeys` | Tasten, die das als Nächstes getippte Zeichen aus diesem Mark heraustreten lassen |
| `doubleKeys` | `{ keyname: commandname }` — die angegebene Taste zweimal **innerhalb von 350ms** tippen führt den Command aus. Die Priorität ist am niedrigsten — er wartet, bis alle anderen Arbeiten mit dieser Taste vorbei sind. Bei der Registrierung **wird überprüft auf Tastenkollisionen und Real-Command** — bei Verletzung stirbt die Registrierung. Bedeutung ist getrennt von `escapeKeys` (das ist "die nächste Eingabe aus dem Mark heraustreten lassen") |
| `inputRules` | Automatische Umwandlung, allein durch Tippen angetrieben |
| `attach` | Für wenn der Bildschirm angefasst werden muss — das Ziehen einer Tabellenzelle, das Einfärben von Code |

### Aussehen

| Feld | Bedeutung |
|---|---|
| `button` · `buttons` | Eine Werkzeugleisten-Schaltfläche oder mehrere |
| `context` | Die Deklaration der Kontextzeile |
| `styles` | Das CSS, das dieser Flügel trägt |

---

## IO-Filter einstecken

**Ein IO-Filter ist kein Flügel.** Er steht nur an den Türen, durch die das Dokument geht — Einfügen,
Speichern und Öffnen — übernimmt ein Format und erhebt keinen eigenen Knoten im Dokument. Der
Vertrag ist ein einziges `IoFilter`.

| Feld | Bedeutung |
|---|---|
| `id` · `label` | Der Name des Filters und der im Fenster gezeigte Name. Ein kollidierendes `id` **stirbt genau dort, wo Sie es registrieren** |
| `paste` | Schaut sich die Zwischenablage (`PasteData`) an und bietet einen Kandidaten an. `null`, wenn es nicht das eigene ist, und `build()` gräbt nur, wenn die Person diesen Platz wählt |
| `save` | `{ extension, write, lossy?, mime? }` — `write` bekommt ein `DocSource` und nimmt, was von `json()`, `html()` und `md()` es braucht. `lossy` ist, was "(Verlust)" auf dem Speicherfenster setzt |
| `read` | Nimmt einen Namen und eine Zeichenkette und liest sie in einen Nabi-Baum. **`null`, wenn es nicht sein eigenes ist**, und es geht zum nächsten Filter über |

**Alle drei Türen sind optional** — ein Filter, der nur Einfügen kennt, oder nur liest, ist
in Ordnung. Die Stellen zum Einstecken sind `ioFilters` auf `mountSurface` und `mountFile`,
`createNabiWith(wings, { ioFilters })`, und das `ioFilter`-Feld in der Tabelle oben, und
**wer zuerst steht, gewinnt** — mount → Host → Flügel → eingebaut (`nabi`, `html`, `html-open`,
`markdown`). Die Öffnungsliste kommt von `readExtensions(filters)`, das **einen Filter ohne
Speicherkammer nicht zählen kann** (die eingebaute `.html` ist eine solche Stelle, daher fügt der
Standardspeicher sie von Hand hinzu, um vier zu machen).

Markdown allein kann ein Filter nicht machen — welche Zeichen ein Knoten geschrieben wird, ist
von **dem Flügel** bekannt, der `toMd` und `partMd` oben trägt. Lassen Sie sie weg und der Knoten
fällt auf `toHtml` zurück, gemischt in das md als HTML; und der md-Parser hebt auch **nur die
Syntax auf, die ein registrierter Flügel aufnehmen kann**.

---

## `w` — den Namen wählen

`w` ist **eine Zeichenkette, die sich bei jedem Knoten des gespeicherten Werts wiederholt.** Kürzer
ist besser — deshalb sind die mitgelieferten Flügel so kurz wie `b`, `hl` und `tf`. Aber eine
Kollision mit dem Namen eines anderen bringt die Registrierung zum Absturz, geben Sie also einem
selbst geschriebenen einen Namen, der lang genug ist, um nicht zu kollidieren, auch wenn er etwas
länger ausfällt.

Er muss nicht mit dem HTML-Tag-Namen übereinstimmen — das Tag auf dem Weg hinaus entscheidet
`toHtml`.

::: warning Ihn später umbenennen
Das `w` im gespeicherten Wert **ist** dieser Name, ihn umzubenennen bedeutet also, dass **bereits
gespeicherte Dokumente nicht mehr gelesen werden können.** Müssen Sie es tun, akzeptieren Sie den
alten Namen für eine Übergangszeit weiterhin über `claim` mit.
:::

---

## Weiterführende Seiten

- [Inline-Marks](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Blöcke und Absatzattribute](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Tasten, automatische Umwandlung, Einfügen](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI und Verhalten](./custom/ui) — `button` · `context` · `styles`, und die Person fragen

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
