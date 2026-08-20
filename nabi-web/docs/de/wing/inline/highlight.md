---
title: Textmarker
---

# Textmarker

## Beschreibung

`highlightWing` (Name `hl`) ist der Eigentümer (claim) von `<mark data-color="...">`. Weil es ein
Inline-Mark mit einem Wert ist, ist es kein Umschalter zum Ein- und Ausschalten, sondern eine
Verzweigung, in der man eine Farbe wählt — dieselbe Faser wie bei der Textfarbe.

- **Die Werkzeugleisten-Schaltfläche (Kürzel `H`) setzt Gelb** — sie schickt `{ c: 'yellow' }` an
  `setHighlight`. Es ist keine Schaltfläche, die ohne Argument läuft.
- Deshalb ist das Umschalten dieser Schaltfläche **ein Umschalten für Gelb**. Nur wenn der gewählte
  Bereich **vollständig gelb** ist, wird es abgenommen — drücken Sie sie auf einem vollständig
  grünen Bereich, wechselt er stattdessen zu Gelb, und Sie müssen noch einmal drücken, um ihn
  abzunehmen.
- Steht der Caret innerhalb eines Textmarker-Marks, erscheinen in der Kontextzeile sechs Farbmuster —
  ein Druck darauf wechselt an Ort und Stelle nur die Farbe. Ein eigenes „Löschen"-Feld hat dieser
  Flügel nicht — dieselbe Farbe erneut drücken nimmt sie ab, und das Löschen der Formatierung ist
  Sache von `clearFormatWing` (das eigens registriert werden muss).
- **Mit nur einem Caret und einer Auswahl gibt es zwei Zweige.** Steht der Caret bereits in einem
  Textmarker-Mark, wird der gesamte von diesem Mark bedeckte Text zum Ziel (Sie müssen den Bereich
  nicht erneut auswählen). Außerhalb eines Marks gibt es keinen Text zum Markieren, es bleibt also
  **bewaffnet** zurück, und das nächste getippte Zeichen kommt in dieser Farbe heraus.
- Im gespeicherten Wert bleibt nur der Farbname zurück — etwa `data-color="yellow"`. Ein
  Inline-`style` geht nicht hinaus. Die tatsächliche Hintergrundfarbe zeichnet das Stylesheet, das
  dieser Flügel über `styles` trägt (es teilt sich einen Satz mit der Textfarbe), und der Farbwert
  selbst steckt im Kern-Token `--nabi-hl-*` — der Host überschreibt dieses Token, um ihn zu ändern.
- **Ein Wert außerhalb der Liste landet nirgends.** Das Command läuft überhaupt nicht, und in
  hereinkommendem HTML wird ein `<mark>` mit einem `data-color` außerhalb der Liste entkleidet, sodass
  **nur der Text übrig bleibt.** Dasselbe gilt für ein `<mark>` ganz ohne `data-color` — die Farbe ist
  der Wert, ein Textmarker ohne Wert hat also keinen Platz zu stehen.
- Dasselbe gilt für einen von Hand bearbeiteten gespeicherten Wert — trifft `repair` auf einen Wert
  außerhalb der Liste, entfernt es diesen Knoten samt Hülle.

| Farbname | Gespeicherter Wert |
|---|---|
| Gelb | `yellow` |
| Grün | `green` |
| Hellblau | `cyan` |
| Rosa | `pink` |
| Lila | `purple` |
| Orange | `orange` |

Diese sechs werden als `HIGHLIGHT_COLORS` exportiert — kein Farbwert, sondern ein **Array von
Namen** (`readonly string[]`). Den Farbwert trägt das Stylesheet.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
