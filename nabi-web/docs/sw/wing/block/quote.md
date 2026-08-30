---
title: Nukuu
description: Kusanya maandishi yaliyonukuliwa au tenga muktadha kwenye aya nyingi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Nukuu

Kusanya maandishi yaliyonukuliwa au tenga muktadha kwenye aya nyingi. Andika `>` ikifuatiwa na Space katika aya tupu, au badilisha aya zilizochaguliwa ziwe nukuu kutoka kwenye upau wa zana.

Nukuu inaweza kuwa na aya za kawaida pamoja na blokii kama orodha na picha. Kubadilisha eneo lilelile tena huondoa kifuniko na kulirudisha kuwa aya za nje.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## Mitindo ya CSS

Tia mtindo kwenye nukuu kwa `.nabi-content blockquote` kwa kubadilisha mipaka na nafasi.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Hifadhi muundo wa aya ndani ya `blockquote`, na ubadilishe uwasilishaji pekee kama nafasi ya nje, mipaka na rangi.
