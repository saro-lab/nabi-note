---
title: Link
---

# Link

## Beschreibung

`linkWing` (ID `a`) ist der Inline-Mark-Flügel, der Hyperlinks (`<a href>`) verarbeitet.

Klicken Sie auf die Symbolleisten-Schaltfläche, öffnet sich ein Popup zur Eingabe der Link-URL. Es kann nur eine sichere URL eingegeben werden, die mit `http:` oder `https:` beginnt — eine bösartige Skript-URL wie `javascript:` wird nach der XSS-Sicherheitsrichtlinie automatisch herausgefiltert.

Das Link-Popup nimmt **Link-URL** und **Anzeigetext** zusammen entgegen. Lassen Sie das Textfeld leer, wird die URL selbst zum Anzeigetext.

## Einen Link über die Kontextleiste bearbeiten

Steht der Caret bereits innerhalb eines vorhandenen Links, zeigt die dynamische Kontextleiste Inline-Textfelder zum sofortigen Bearbeiten:

| Feld | Beschreibung |
|---|---|
| Link-Adresse (`href`) | Ändert nur die Ziel-URL des Links (der Anzeigetext bleibt erhalten) |
| Anzeigename | Ändert nur den im Text angezeigten Namen (die URL bleibt erhalten) |

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
