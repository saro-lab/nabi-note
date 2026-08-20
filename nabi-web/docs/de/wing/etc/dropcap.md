---
title: Initiale
---

# Initiale

## Beschreibung

`dropCapWing` ist ein einwertiges Absatzattribut, das `data-nabi-dropcap="1"` auf einen Absatz
setzt. Es erzeugt keinen neuen Block; es legt nur eine Markierung auf einen bereits bestehenden
Absatz.

- Es ist ein **boolesches Attribut**: Der einzige Wert ist `1`. „Aus" ist nicht `0` — es ist, dass
  der Schlüssel überhaupt fehlt. Drücken Sie die Schaltfläche erneut, geht das Attribut ab.
- Weil seine Reichweite allein der erste Buchstabe ist, behandelt Enter es wie einen Mark: Spalten
  Sie den Absatz, wird es nicht in beide Hälften kopiert, sondern folgt diesem Buchstaben. Spalten
  Sie ganz am Anfang, geht die Initiale mit dem hinteren Teil; spalten Sie irgendwo später, bleibt
  sie beim vorderen.
- Es gibt keine Kontextzeile dafür. Eine Werkzeugleisten-Schaltfläche schaltet es bereits um, und
  eine zweite Stelle, die dasselbe sagt, wäre nur ein Weg, „aus" zweimal zu sagen.
- **Es gibt keine Option und keine Variable dafür, wie viele Zeilen sie umschließt.** Eine einzige
  `::first-letter`-Regel im Kern-Stylesheet legt die Größe fest — `font-size: 5.9em; line-height:
  .83`. Wie viele Zeilen der Buchstabe tatsächlich abdeckt, ergibt sich aus der Zeilenhöhe dieses
  Absatzes.

Um die Größe zu ändern, überschreiben Sie diese Regel:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
