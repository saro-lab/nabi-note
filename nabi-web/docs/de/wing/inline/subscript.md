---
title: Tiefgestellt
---

# Tiefgestellt

## Beschreibung

`subscriptWing` ist der Eigentümer (claim) von `<sub>`. Es dient chemischen
Formeln oder Nummern, die nach unten gesetzt werden.

- Anerkannt wird ein einziges Tag: `<sub>`. Attribute überleben nicht.
- Weder ein Hinweismodus-Kürzel noch ein Beschleuniger existiert dafür. Die
  Werkzeugleisten-Gruppe ist `script`, neben Hochgestellt (Hochgestellt steht in
  der Registrierungsreihenfolge zuerst).
- Wird die Taste bei ausgewähltem Text gedrückt, ist es ein Umschalter.
- Das Aussehen liefert das Stylesheet, das dieser Flügel über `Wing.styles` trägt.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**Dieses Stylesheet ist ein Satz, den sich Tief- und Hochgestellt teilen.** Beide
Flügel tragen denselben Text, registrieren Sie also beide, landet er im Dokument
trotzdem nur **einmal** (`collectSheets` filtert Stylesheets mit gleichem Inhalt
heraus). Im gespeicherten Wert (HTML) bleibt nur das Tag `<sub>` zurück, der Stil
selbst reist nicht mit.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
