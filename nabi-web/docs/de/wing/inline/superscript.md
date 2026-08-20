---
title: Hochgestellt
---

# Hochgestellt

## Beschreibung

`superscriptWing` ist der Eigentümer (claim) von `<sup>`. Es dient Potenzen von
Einheiten oder Fußnotenziffern.

- Anerkannt wird ein einziges Tag: `<sup>`. Attribute überleben nicht.
- Weder ein Hinweismodus-Kürzel noch ein Beschleuniger existiert dafür (einer der
  Flügel, bei denen wie beim Hochladen kein Abzeichen aufblendet). Die
  Werkzeugleisten-Gruppe ist `script`, neben Tiefgestellt, wobei dieser hier in der
  Registrierungsreihenfolge zuerst steht.
- Wird die Taste bei ausgewähltem Text gedrückt, ist es ein Umschalter.
- Das Aussehen liefert das Stylesheet, das dieser Flügel über `Wing.styles` trägt.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**Dieses Stylesheet ist ein Satz, den sich Tief- und Hochgestellt teilen.** Beide
Flügel tragen denselben Text, registrieren Sie also beide, landet er im Dokument
trotzdem nur **einmal** (`collectSheets` filtert Stylesheets mit gleichem Inhalt
heraus). Im gespeicherten Wert (HTML) bleibt nur das Tag `<sup>` zurück, der Stil
selbst reist nicht mit.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
