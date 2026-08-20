---
title: Einen Inline-Mark schreiben
description: place 'mark' — eine Formatierung, die über Zeichen gelegt wird. Sie schreiben den Weg hinaus (toHtml) und den Weg hinein (claim) zusammen.
---

# Einen Inline-Mark schreiben

`place: 'mark'` ist **eine Formatierung, die über Zeichen gelegt wird**. Sie nimmt keinen eigenen
Platz ein, bricht den Textfluss nicht, und Marks dürfen sich überlappen — Fett, Kursiv und
Hervorhebung sind allesamt diese Sorte.

---

## Ein Mark mit allem ausgefüllt

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { de: 'Taste' },
      shortcut: 'K',
      action: { kind: 'mark' },        // der Kern übernimmt das Umschalten — kein Command nötig
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Was `simpleMark` für Sie ausfüllt, sind zwei Dinge: `place: 'mark'` und `escapeKeys: ['Escape']`.
Alles andere geht unverändert durch.

---

## Die beiden Richtungen werden getrennt geschrieben

| | Richtung | Ohne es |
|---|---|---|
| `toHtml` | Dokument → HTML | **Die Registrierung stirbt.** Ein Flügel, der einen Knoten errichtet, muss einen Weg haben, ihn zu zeichnen |
| `claim` | HTML → Dokument | Es zeichnet sich, kann aber **nicht zurückgelesen werden.** Speichern und Laden streift die Hülle ab |

Die sechs Grund-Marks (`b`, `i`, `u`, `s`, `sub`, `sup`) und die vier Wert-Marks (`hl`, `tc`, `fs`,
`tf`) sind Tags, die **der Kern bereits kennt.** Deshalb trägt `boldWing` weder `toHtml` noch
`claim`. Einen selbst erfundenen Namen kennt der Kern nicht, Sie schreiben also beide.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| Argument | Was es ist |
|---|---|
| `node` | Der Knoten, so wie er dasteht. Attribute kommen aus `node.a?.['schlüssel']` |
| `children()` | Der gezeichnete Text des Inneren. **Er zeichnet sich, wenn aufgerufen**, rufen Sie es also nicht auf, geht das Innere nie hinaus |
| `ctx` | Die Werkzeuge zum sicheren Bauen |

Was `ctx` Ihnen gibt:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | Baut einen Klotz. Werte werden für Sie escaped |
| `ctx.escape(text)` | Escaped allein Text |
| `ctx.url(raw)` · `ctx.src(raw)` | Filtert eine Adresse. Eine Adresse, der nicht vertraut werden kann, ist **`null`** |
| `ctx.keys` | Ob dieses Rendern das des **Editors** ist (`getEditorHtml()`) |

::: warning Verketten Sie die Zeichenkette nie selbst
Schreiben Sie `` `<kbd>${node.a?.['t']}</kbd>` ``, wird Text im Dokument unverändert zu Markup.
Gehen Sie immer über `ctx.element` oder `ctx.escape`.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — das Element genau so, wie es angekommen ist |
| `inner(block)` | Liest das Innere. Bei einem Mark `false` (ein Platz für Zeichen), bei einem Block `true` |
| Antwort | Ein Array von Knoten, oder **`null`** (nicht meins → weiter zum nächsten Flügel) |

Flügel werden in Array-Reihenfolge gefragt, und **der erste, der die Hand hebt**, nimmt es sich.

Es gibt zwei Stellen, an denen `null` geantwortet wird — wenn es nicht mein Tag ist, und **wenn es
mein Tag ist, der Wert aber außerhalb der Liste liegt.** Im zweiten Fall streift `inner(false)`
allein die Hülle ab und hält den Text am Leben.

---

## Ein Mark, der einen Wert trägt

Für einen Mark, der **eines aus einer festen Liste wählt**, wie eine Farbe oder eine Größe,
verwenden Sie `valueMark`.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // das Attributfeld, in dem der Wert lebt
    values: [...LEVELS],             // nichts außerhalb wird angenommen
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // außerhalb der Liste — nur den Text behalten
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

Zwei Dinge, die `valueMark` für Sie auflegt:

- **`currentValue`** — der Wert an der Stelle, an der der Caret jetzt steht. Werkzeugleiste und
  Kontextzeile bemalen anhand dieser Antwort, welcher Platz an ist.
- **`repair`** — prüft den Wert an der JSON-Tür erneut. Außerhalb der Liste oder fehlend, antwortet
  es mit `null` und **entfernt den Knoten, Hülle und alles.** Ein von Hand bearbeiteter gespeicherter
  Wert wird genau hier gefangen.

::: tip Ein Command, das den Wert ändert
Für das „setze auf diesen Wert"-Command eines Wert-Marks gibt es noch keinen öffentlichen Helfer.
Das `action: { kind: 'mark' }`, das allein von einer Werkzeugleisten-Schaltfläche umschaltet,
funktioniert wie gezeigt, und brauchen Sie Wertauswahl, greifen Sie zu den vier mitgelieferten
Wert-Marks (Hervorhebung, Textfarbe, Schriftgröße, Schriftart) oder breiten Sie deren Deklarationen
aus.
:::

---

## `escapeKeys` — aus einem Mark heraustreten

Steht der Caret am Ende eines Marks, weiß nur die Person, ob das nächste Zeichen innerhalb oder
außerhalb davon gehört. `escapeKeys` ist diese Tür.

```ts
escapeKeys: ['Escape']    // der Standardwert für simpleMark und valueMark
```

**Der Caret bewegt sich nicht.** Das Drücken der Taste bewaffnet „das als Nächstes getippte Zeichen
verlässt diesen Mark". Tippen Sie ein Zeichen, ist die Bewaffnung verbraucht und weg.

```
<kbd>Strg</kbd>(Caret)  →  Escape  →  Tippen "+"  →  <kbd>Strg</kbd>+
```

Mehrere Flügel dürfen dieselbe Taste beanspruchen — die Bewaffnung greift nur, solange der Caret
wirklich innerhalb dieses Marks steht, sodass von den dort überlappenden Marks nur die passenden
gemeinsam abgehen. <kbd>Escape</kbd> dient auch dazu, eine bereits gesetzte Bewaffnung
**rückgängig zu machen**.

---

## Marks können keine Tasten besitzen

Schreiben Sie `onKey`, **erreicht es einen Mark nie.** Eine Caret-Position ist `{ path, offset }`,
und das Ende von `path` ist **der Halter, der die Zeichen trägt** — ein Mark ist ein Inline-Knoten
innerhalb dieses Halters, erscheint also überhaupt nie auf dem Pfad. Der Kern läuft diesen Pfad
hinauf, um zu entscheiden, wem eine Taste gehört, trifft also nie auf einen Mark.

Der Grund ist Überlappung. Drücken Sie <kbd>Enter</kbd> innerhalb eines Links innerhalb eines
Kursivs innerhalb eines Fett, gibt es keine Möglichkeit zu sagen, welchem der drei es gehört. Die
eine Tür, die ein Mark zu Tasten hat, ist `escapeKeys`.

---

## Weiterführende Seiten

- [Blöcke und Absatzattribute](../custom/block) — die Dinge, die einen Platz einnehmen
- [Tasten, automatische Umwandlung, Einfügen](../custom/input) — `onKey` und `inputRules`
- [UI und Verhalten](../custom/ui) — die Werkzeugleisten-Schaltfläche und die Kontextzeile

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
