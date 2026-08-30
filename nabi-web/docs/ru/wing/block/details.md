---
title: Раскрывающийся блок
description: Объединяет краткое содержание и текст и сохраняет начальное состояние раскрытия.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Раскрывающийся блок

Объединяет короткое содержание и текст в один блок. При создании через панель инструментов сначала введите содержание, а затем продолжите текст ниже.

Состояние раскрытия, заданное треугольником, сохраняется в документе и становится начальным состоянием на опубликованной странице. Во время редактирования содержимое оставляют раскрытым, чтобы его можно было изменить, но сохранённое значение состояния не меняется.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS-стили

Раскрывающийся блок можно оформить через `.nabi-content details`, а его заголовок — через `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

Атрибут `open` — это начальное состояние раскрытия, сохранённое автором. CSS может оформить это состояние, но не должен принудительно его менять.
