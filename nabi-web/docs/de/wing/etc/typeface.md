---
title: Schriftart
---

# Schriftart

## Beschreibung

`typefaceWing` (Name `tf`) ist ein **Inline-Wert-Mark**. Er ist eine fertige Konstante — legen Sie
ihn in das Array, und Sie sind fertig, ohne Optionen zu übergeben. Auf dem Weg hinaus wird er als
`<span data-nabi-typeface="serif">` gezeichnet.

Die Werte sind die vier in `TYPEFACES` — `sans`, `serif`, `mono`, `cursive`.

- **Er trägt überhaupt keine Schriftnamen.** Was Sie wählen, ist eine **generische Familie**, und
  welche Schrift tatsächlich erscheint, entscheiden die Werte, die der Host auf die vier Token
  `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono` und `--nabi-font-cursive` legt.
- **Ein Flügel** trägt alle vier Werte. Der Platz, aus dem Sie wählen, ist ein `select` mit vier
  Feldern auf der Kontextzeile, und eine einzelne Werkzeugleisten-Schaltfläche ist der Weg hinein —
  sie zu drücken wendet `serif` an.
- **Text ohne Anwendung trägt `--nabi-typeface-base`.** Dieses Token ist die Grundschriftart des
  Editors, und unangetastet folgt es `--nabi-font`. Es gibt kein separates Feld für „Standard" —
  **wählen Sie die bereits eingeschaltete Familie erneut, geht sie ab**, zurück zu diesem Grund.
- **Die Felder sind in der Schrift gezeichnet, die sie benennen.** Das Serif-Feld steht in Serif, das
  Feld für feste Breite in fester Breite, sodass Sie sehen, was Sie wählen, ohne die Namen zu kennen.
- **Mit nur einem Caret greift er auf den ganzen Absatz.** In einem Absatz ganz ohne Text ist er
  stattdessen bewaffnet, und das nächste getippte Zeichen kommt in dieser Schrift heraus.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Die Schriften, die der Host aufsetzt, sind ein einziger Platz in CSS. Stapeln Sie mehrere Schriften
auf einer Familie, geht der Browser die Liste pro Zeichen durch und zeichnet jedes mit der ersten
Schrift, die es hat — welche Sprache also auch getippt wird, die Familie behält ihre Gestalt.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## Demo

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
