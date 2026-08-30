---
title: CSS-темы
description: Настройка цветов, шрифтов, размеров и тёмной темы редактора и опубликованного содержимого через CSS-переменные.
---

# CSS-темы

NABI NOTE использует один CSS для редактирования и публикации. Один раз подключите таблицу стилей пакета, затем переопределите только нужные переменные в контейнере сервиса.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Разместите общие токены на общем родителе, чтобы редактор и опубликованный вид сохраняли единый визуальный язык.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Основные переменные

| Назначение | Переменные |
| --- | --- |
| Текст и фон | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Границы и акцент | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Скругления и тени | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Семейства шрифтов | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Поверхность редактирования | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Закреплённая панель и предпросмотр | `--nabi-sticky-top`, `--nabi-preview-width` |
| Сенсорные элементы | `--nabi-touch-font-size`, `--nabi-touch-control-size` |

Токены выделения и цвета текста называются `--nabi-hl-<name>` и `--nabi-tc-<name>`. Например, изменение `--nabi-hl-yellow` меняет показ сохранённого жёлтого выделения без изменения данных документа.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Тёмная тема

По умолчанию используется светлая тема. Добавьте `.dark` к `html` или `body` либо задайте `data-nabi-theme="dark"` отдельному редактору или опубликованному содержимому.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

`data-nabi-theme="light"` позволяет отказаться от `.dark` предка. Переключением темы управляет приложение; пакет не следует `prefers-color-scheme` автоматически.

```css
.dark .brand-note {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Оформляйте и опубликованное содержимое

Опубликованному HTML также нужны `.nabi-content` и тот же CSS. Таблицы, блоки кода, изображения, списки задач и буквицы отображаются без JavaScript. Подключайте `nabi-note/viewer` только для поведения вроде сортировки таблиц или подсветки кода.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

Параметры макета, которыми пакет не управляет, например ширину текста и высоту строки, задавайте в классе сервиса.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Не изменяйте структуру редактора

Не меняйте `display` или `white-space` узлов `[data-key]` в редакторе, не добавляйте псевдоэлементы внутрь редактируемого текста и не отключайте pointer-поведение обёрток объектов. Такие правила могут нарушить геометрию каретки и сопоставление документа.

Опубликованная буквица использует `::first-letter`, а редактор — реальный элемент `[data-nabi-dropcap-letter]`. Не добавляйте ещё одно правило `::first-letter` внутри `.nabi-editing` и не заменяйте этот элемент.
