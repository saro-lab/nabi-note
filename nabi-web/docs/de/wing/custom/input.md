---
title: Tasten, automatische Umwandlung, Einfügen
description: Fangen Sie Tasten mit onKey ab, bauen Sie Formatierung allein aus Tippen mit inputRules, und fassen Sie den Bildschirm mit attach an.
---

# Tasten, automatische Umwandlung, Einfügen

Ein Flügel hat drei Türen zu dem, was ein Mensch tut — **Tasten** (`onKey`), **Tippen**
(`inputRules`) und **der Bildschirm** (`attach`).

---

## Der Weg, den eine Taste zurücklegt

Drücken Sie einmal <kbd>Enter</kbd>, wird es in dieser Reihenfolge angeboten. Wer es zuerst nimmt,
beendet die Reise.

```
① Werkzeugleisten-Kürzel   überall gehört (Dinge wie Strg+B)
② Automatische Umwandlung  inputRules — nur Enter und Leertaste
③ Das onKey des Flügels    an den Besitzer der Stelle, an der der Caret steht
④ Klotz anvisieren         Rücktaste ganz am Anfang eines Absatzes → wählt den Klotz davor als Ganzes
⑤ Kernregeln                Absätze spalten, löschen, den Caret bewegen
⑥ Der Browser                nur wenn niemand darüber es genommen hat
```

---

## `onKey` — eine Taste abfangen

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // nicht meine Sache — zurück an den Kern
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // Rücktaste ganz am Anfang des ersten Platzes — die Notiz auflösen
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| Argument | Was es ist |
|---|---|
| `intent` | `{ key, dir? }` — welche Taste |
| `doc` · `sel` · `env` | dieselben drei, die ein Command erhält |
| `owner` | `{ path, node }` — **der Knoten, als dessen Besitzer ich ausgewählt wurde** |

Die Antwort ist dasselbe `{ doc, selection }`, das ein Command zurückgibt, oder **`null`**. `null`
bedeutet „nehme es nicht", der Kern macht also weiter — sind Ihre Bedingungen nicht erfüllt, müssen
Sie mit `null` antworten.

### Welche Tasten ankommen

| `intent.key` | Wann |
|---|---|
| `'enter'` | <kbd>Enter</kbd> **und** <kbd>Shift</kbd>+<kbd>Enter</kbd>, beide |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | die beiden Löschtasten |
| `'arrow'` | Pfeile. Die Richtung ist `intent.dir` (`'left'`·`'right'`·`'up'`·`'down'`) |

Zeichentasten kommen nie an. Der Browser tippt Zeichen, und der Kern schreibt sie nieder.

### Es gibt genau einen Besitzer

Laufen Sie den Pfad des Caret **hinauf**; der erste Knoten, der kein Absatz ist, und der Flügel, dem
dieser Knoten gehört, ist der Besitzer.

```
Caret bei Pfad [1, 0, 0]                     Besitzer-Kandidat
  [1, 0, 0]  →  p        ein Absatz, also übersprungen
  [1, 0]     →  note     ← der Besitzer
  [1]        →  p (Wrapper)  wird nie erreicht
```

Also **gewinnt der innerste Container** — in einer Liste innerhalb einer Tabelle geht
<kbd>Tab</kbd> an die Liste. Auch ein Teil (`parts`) kann Besitzer sein, und ist er es, ist
`owner.node` der Knoten des Teils, während das ausgeführte `onKey` dem Flügel gehört, der ihn
deklariert hat. Deshalb ist es Konvention, zuerst nach `owner.node.w` zu verzweigen, um zu sehen,
welcher ausgewählt wurde.

Ein Mark kann nie Besitzer sein — der Grund steht auf der [Inline-Seite](./inline).

---

## `inputRules` — Formatierung allein aus Tippen bauen

Das ist es, was `# ` zu einer Überschrift und `> ` zu einem Zitat macht.

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| Feld | |
|---|---|
| `trigger` | `'space'` oder `'enter'` — gemessen in dem **Moment**, in dem diese Taste geschlagen wird |
| `pattern` | ein regulärer Ausdruck. `run` erhält den Treffer |
| `run` | `{ name, args? }` — das auszuführende Command |
| `scope` | `'block'` (der Standard) oder `'word'` |

### `'block'` — den Zeilenanfang ersetzen

Es schaut auf den **Anfang der Zeile** vor dem Caret. Bei einem Treffer löscht es dieses Präfix (und
das Auslöser-Zeichen) und führt das Command aus.

```
"> " tippen   →   das "&gt;" wird gelöscht und toggleQuote läuft
```

Es feuert nur auf der **ersten Zeile** eines Absatzes. Auf einer Zeile, die Sie mit
<kbd>Shift</kbd>+<kbd>Enter</kbd> erreicht haben, feuert es nicht — das hält Formatierung davon ab,
mitten in Prosa auszubrechen, die Sie schon schreiben.

### `'word'` — einen Mark über ein einzelnes Wort legen

Es schaut auf das **einzelne Wort** vor dem Caret. Bei einem Treffer wählt es dieses Wort aus, führt
das Command aus und setzt den Caret zurück, wo er war. Kein Text wird gelöscht — das ist die Gestalt
für Regeln, die einen Mark auflegen.

Trägt dieses Wort **bereits den Mark dieses Flügels, wird die Regel übersprungen.** Sie kann nicht
zweimal an derselben Stelle feuern.

### Gemeinsame Regeln

- Es läuft nur, während der Caret **kollabiert** ist. Leertaste bei einer Bereichsauswahl bewirkt
  nichts.
- Es läuft nur in einem gewöhnlichen Absatz — nie in einem Wrapper-Absatz, der einen Klotz hält.
- Regeln werden in der Array-Reihenfolge der Flügel gemessen, und die **erste erfolgreiche Regel**
  gewinnt.
- Antwortet das Command mit `null` (nichts zu tun), wird **zurückgerollt und zur nächsten Regel
  übergegangen.** Eine gescheiterte Eingaberegel hinterlässt keine Spur im Dokument.

---

## `attach` — den Bildschirm anfassen

Manchmal ist die Aufgabe nicht, das Dokument zu ändern, sondern zuzuhören, **was auf dem Bildschirm
geschieht** — Ziehauswahl von Tabellenzellen, Code einfärben, das Dreieck einer Klappbox anklicken.

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // mit einer Abbaufunktion antworten
}
```

`host` gibt Ihnen drei Dinge.

| | |
|---|---|
| `host.root` | das Element der Editier-Oberfläche |
| `host.nabi` | der Editor. Das Dokument zu ändern geschieht **über Commands** |
| `host.pathOfKey(id)` | wandelt ein `data-key` auf dem Bildschirm in einen Pfad ins Dokument um |

`mountSurface` heftet das `attach` jedes registrierten Flügels zusammen mit sich selbst an und ruft
die von Ihnen zurückgegebenen Abbaufunktionen auf, wenn es abgebaut wird. Dies ist **das eine und
einzige Haus, in dem Code lebt, der das DOM kennt** — fassen Sie `document` nie innerhalb eines
Commands, `toHtml` oder `repair` an.

::: tip Das Dokument über `data-key` finden
Der Editor-Build (`getEditorHtml()`) markiert jeden Knoten mit einem `data-key`. Finden Sie das
nächstgelegene `[data-key]` vom angeklickten Element aus und übergeben Sie es `host.pathOfKey()`,
um den Platz innerhalb des Dokuments zu bekommen.
:::

---

## Einfügen und anfängliches HTML

Einfügen, `setHtml()` und das Laden eines gespeicherten Werts gehen alle durch **dieselbe Tür**. Die
einzige Aufgabe des Flügels ist hier `claim` — es steht unter [`claim` auf der
Inline-Seite](./inline#claim).

```
Einfügen        ─┐
setHtml         ─┼→ parsen → das claim der Flügel → die Standard-Tag-Behandlung des Kerns → repair → cocoon → Dokument
anfängliches HTML ─┘
```

Ohne ein `claim` wird **diesem Tag die Hülle abgestreift, und nur der Text darin überlebt.** Diese
Regel ist der Grund, warum unbekanntes Markup, das aus dem Editor eines anderen kopiert wurde, nicht
unverändert im Dokument landet.

Der Weg über JSON (`setJson()`) trägt Knoten statt Tags, der Torwächter dort ist also `repair`, nicht
`claim`.

---

## Weiterführende Seiten

- [UI und Verhalten](../custom/ui) — Werkzeugleisten-Schaltflächen und die Kontextzeile
- [Einen Inline-Mark schreiben](../custom/inline) · [Blöcke und Absatzattribute](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
