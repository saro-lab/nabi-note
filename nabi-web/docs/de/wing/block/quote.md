---
title: Zitat
description: Gruppiere zitierten Text oder trenne Kontext über mehrere Absätze hinweg.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Zitat

Gruppiere zitierten Text oder trenne Kontext über mehrere Absätze hinweg. Tippe `>` gefolgt von einem Leerzeichen in einem leeren Absatz oder wechsle ausgewählte Absätze über die Symbolleiste in ein Zitat um.

Ein Zitat kann gewöhnliche Absätze sowie Blöcke wie Listen und Bilder enthalten. Das erneute Umschalten desselben Bereichs entpackt ihn wieder in äußere Absätze.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS-Stile

Stilisieren Sie Zitate mit `.nabi-content blockquote`, indem Sie Rahmen und Abstände ändern.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Behalte die Absatzstruktur innerhalb von `blockquote` bei und ändere nur das Erscheinungsbild wie äußere Abstände, Rahmen und Farbe.
