---
title: Unterstrichen
---

# Unterstrichen

## Beschreibung

`underlineWing` ist der Eigentümer (claim) von `<u>`.

- Das einzige anerkannte Tag ist `<u>`. Auch beim Hinausgehen ist es immer `<u>`,
  und kein einziges Attribut überlebt. **`<ins>` wird nicht angenommen** — es wird
  entkleidet und nur der Text bleibt. Anders als Fett (`<b>`·`<strong>`) oder
  Durchgestrichen (`<s>`·`<strike>`·`<del>`) ist dies kein Mark, das ein Paar von
  Tags gemeinsam annimmt.
- Das Hinweismodus-Kürzel ist `U`, der Beschleuniger ist `Strg`/`⌘`+`U` (`mod+u`).
- Wird die Taste bei ausgewähltem Text gedrückt, ist es ein Umschalter.
- Ohne Registrierung wird `<u>` entkleidet und fällt zu reinem Text herab.
- Unterstreichung und Link können auf dem Bildschirm dieselbe Gestalt annehmen,
  sind aber getrennte Marks, die verschiedenen Flügeln gehören (`a`) — auf
  demselben Text können beide zugleich liegen.

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
