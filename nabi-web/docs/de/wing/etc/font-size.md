---
title: Schriftgröße
---

# Schriftgröße

## Beschreibung

`fontSizeWing` (Kennung `fs`) ist ein wertbasiertes Inline-Mark-Wing, das die Schriftgröße eines Textabschnitts anpasst (`<span data-nabi-size="lg">`).

Es unterstützt vier Stufen — `xs`, `sm`, `lg`, `xl` — und die Standardgröße ist einfach das Fehlen des Attributs, kein fünfter Wert.

- Ein Klick auf die Haupt-Symbolleisten-Schaltfläche wendet standardmäßig **`lg` (Groß)** an.
- Steht der Cursor innerhalb einer Schriftgrößen-Markierung, zeigt die dynamische Kontext-Symbolleiste einen Schieberegler (`range`), mit dem Sie bequem zwischen Standard, Sehr klein, Klein, Groß und Sehr groß wählen können. Schieben Sie den Regler auf Standard, wird die Markierung entfernt.
- Wählen Sie eine Größe nur mit dem Cursor — ohne Textauswahl —, wird die Formatierung auf den ganzen Absatz angewendet.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
