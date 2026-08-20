---
title: Schriftgröße
---

# Schriftgröße

## Beschreibung

`fontSizeWing` (Name `fs`) ist ein **Inline-Wert-Mark**. Es ist eine Formatierung, die über den Text
gelegt wird, kein Absatzattribut. Auf dem Weg hinaus wird es als `<span data-nabi-size="lg">`
gezeichnet.

Es gibt vier Werte — `xs`, `sm`, `lg`, `xl` — und die Standardgröße ist kein fünfter Wert, sondern
**das Fehlen des Attributs**.

- Es bildet ein Paar mit der Schriftart (`tf`) — ein Flügel trägt jeden Wert, und der Platz, aus dem
  Sie wählen, ist die Kontextzeile. Die Schriftart legt allerdings vier Felder aus, während die
  Größe eine einzige Skala verwendet.
- **Das Kontext-Steuerelement ist eine Skala (`range`).** Größe ist ein geordneter Wert (klein →
  groß), also gibt es statt ausgelegter Felder einen einzigen Griff zum Schieben. Der geltende Wert
  zeigt sich als Position des Griffs, und sein Name reitet auf dem Namensschild mit.

- **Der erste Platz auf der Skala ist „Standard"** — zuerst statt in der Mitte, weil die Liste von
  klein nach groß läuft und der Platz davor „nichts angewandt" gehört. Bewegen Sie den Griff dorthin,
  schreibt es keinen `base`-Wert; es **nimmt den Mark ab**.
- **Die Feldbeschriftungen folgen der Locale** — auf Deutsch „Standard · Sehr klein · Klein · Groß ·
  Sehr groß".
- Drücken Sie die Werkzeugleisten-Schaltfläche, erhalten Sie **`lg` (Groß)**. Die Skala läuft von
  klein nach groß, es allein zu lassen würde also den ersten Platz, `xs`, anwenden — und niemand
  drückt eine Größen-Schaltfläche in der Absicht, den Text kleiner zu machen.
- **Mit nur einem Caret greift es auf den ganzen Absatz.** Es ist selten, dass man ein einzelnes Wort
  in der Größe ändern will, ohne ausgewählten Bereich zielt es also auf den Absatz (Hervorhebung und
  Textfarbe zielen im Gegensatz dazu auf die Mark-Strecke, in der man gerade steht).
- Drücken Sie sie in einem Absatz ganz ohne Text, ist sie **bewaffnet** — das nächste getippte
  Zeichen kommt in dieser Größe heraus.
- Wenden Sie denselben Wert erneut an, geht er ab.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
