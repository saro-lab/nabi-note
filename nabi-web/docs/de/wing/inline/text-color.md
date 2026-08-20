---
title: Textfarbe
---

# Textfarbe

## Beschreibung

`textColorWing` (Name `tc`) ist der Eigentümer (claim) von `<span data-color="...">`. Es gehört zur
selben Sorte wie der Textmarker: Weil es ein Inline-Mark mit einem Wert ist, wird nicht ein- und
ausgeschaltet, sondern eine Farbe gewählt.

- **Die Werkzeugleisten-Schaltfläche (Kürzel `C`) setzt Grün** — sie schickt `{ c: 'green' }` an
  `setTextColor`. Es ist keine Schaltfläche, die ohne Argument läuft.
- Deshalb ist das Umschalten dieser Schaltfläche **ein Umschalten für Grün**. Es wird nur abgenommen,
  wenn der gewählte Bereich vollständig grün ist; ist eine andere Farbe gesetzt, wechselt er zu Grün.
- Steht der Caret innerhalb eines Textfarben-Marks, erscheinen in der Kontextzeile fünf Farbmuster —
  ein Druck darauf wechselt an Ort und Stelle nur die Farbe (Marks stapeln sich nicht übereinander).
  Ein eigenes „Löschen"-Feld hat dieser Flügel nicht — dieselbe Farbe erneut drücken nimmt sie ab,
  alles andere ist Sache von `clearFormatWing`.
- **Mit nur einem Caret und einer Auswahl gibt es zwei Zweige.** Innerhalb eines Marks ist der
  gesamte von diesem Mark bedeckte Text das Ziel, außerhalb eines Marks bleibt es **bewaffnet**, und
  das nächste getippte Zeichen trägt diese Farbe.
- Im gespeicherten Wert bleibt nur der Farbname zurück — etwa `data-color="green"`. Ein
  Inline-`style` geht nicht hinaus. Den Farbwert trägt das Kern-Token `--nabi-tc-*`, und das
  Stylesheet teilt sich einen Satz mit dem Textmarker.
- Beim Einlesen (`claim`) wird nur auf ein `<span>`-Tag gesehen, das zugleich ein Attribut
  `data-color` trägt. Ein `<span>` ganz ohne `data-color` wird von diesem Flügel nicht beansprucht,
  also entkleidet und fällt zu reinem Text herab, und **trägt es das Attribut, sein Wert liegt aber
  außerhalb der Liste, wird es ebenfalls entkleidet und nur der Text bleibt.**
- Auch ein Wert außerhalb der Liste in einem von Hand bearbeiteten gespeicherten Wert entfernt
  `repair` samt Hülle.
- Textmarker und Textfarbe sind verschiedene Marks und können daher auf demselben Text zugleich
  liegen — deshalb schreibt das Stylesheet des Textmarkers kein `color`.

| Farbname | Gespeicherter Wert |
|---|---|
| Grün | `green` |
| Koralle | `coral` |
| Violett | `violet` |
| Bernstein | `amber` |
| Blau | `blue` |

Diese fünf werden als `TEXT_COLORS` exportiert — kein Farbwert, sondern ein **Array von Namen**
(`readonly string[]`).

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
