---
title: Таблица
description: Создаёт строки и столбцы, поддерживает редактирование ячеек и сортировку столбцов.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Таблица

Выберите число строк и столбцов на панели инструментов, чтобы создать таблицу. Внутри ячейки содержимое продолжается переносами строк, а не несколькими абзацами; Tab и Shift+Tab переходят к следующей и предыдущей ячейке.

Добавление и удаление строк и столбцов, объединение ячеек и переключение заголовочной ячейки работают относительно выбранной ячейки. Чтобы после сохранения таблицы как сортируемой сортировать столбцы на опубликованной странице, подключите `attachViewer()` из `nabi-note/viewer`. Таблицы с объединёнными ячейками не сортируются по столбцам.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS-стили

Таблица оформляется через `.nabi-content table`, а ячейки — через `.nabi-content :is(th, td)`. Не изменяйте структуру ячейки и кнопку сортировки, добавленную viewer.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Если viewer подключён, оставьте кнопку `.nabi-sort`. Принудительное переопределение `position` или правого padding ячейки может привести к наложению кнопки сортировки.
