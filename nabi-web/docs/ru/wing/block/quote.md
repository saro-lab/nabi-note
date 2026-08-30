---
title: Цитата
description: Объединяет цитату или отдельный контекст в несколько абзацев.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Цитата

Объединяет цитату или отдельный контекст в несколько абзацев. В пустом абзаце введите пробел после `>` либо переключите выбранные абзацы в цитату на панели инструментов.

В цитату можно помещать не только обычные абзацы, но и блоки вроде списков и изображений. Повторное переключение того же диапазона вернёт его к внешним абзацам.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS-стили

Для цитаты через `.nabi-content blockquote` можно изменить границу и отступы.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Сохраняйте структуру абзацев внутри `blockquote`; меняйте только представление, например внешние отступы, границу и цвет.
