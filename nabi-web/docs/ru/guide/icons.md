---
title: "Темы значков"
description: "Переменные CSS заменяют значки wings, предпросмотра, полноэкранного режима, панелей, сравнения и сортировки таблиц. Можно смешивать SVG, WebP и PNG; для неуказанных значков используются стандартные файлы."
---

# Темы значков

Переменные CSS заменяют значки wings, предпросмотра, полноэкранного режима, панелей, сравнения и сортировки таблиц. Можно смешивать SVG, WebP и PNG; для неуказанных значков используются стандартные файлы.

## Выбор файлов

Подключите CSS и добавьте класс темы редактору или общему родителю. Изображения сохраняют исходные цвета, прозрачность и пропорции.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

Используйте пути от корня, например `/icons/...`, или полные HTTPS URL. Относительные пути не обязательно отсчитываются от файла темы. При самостоятельном размещении CSS скопируйте ту же версию `dist/icons/` рядом с `nabi.css`. Если изображение не загрузится, значок будет пустым, но имя, подсказка и действие кнопки сохранятся.

## Поиск других значков

Добавьте `--nabi-icon-` перед значением `data-nabi-icon` элемента, чтобы получить переменную CSS. Например, `diff-close` использует `--nabi-icon-diff-close`. Правила ключей контекста, меню, сохранения, истории и других элементов, включая кодирование специальных символов, приведены в <a href="/llms/icons.md" target="_blank" rel="noopener">контракте значков</a>.

## Тёмная тема и панели

Изменение класса темы или переменной CSS обновляет значки без повторного mount. Стандартные значки следуют светлой/тёмной теме. Собственные файлы не наследуют `currentColor`; при необходимости задайте тёмные варианты, как выше. Панели внутри `body` также следуют теме значков и изменениям классов/стилей исходного редактора. Задавайте переменные редактору или общему родителю, а не только внутри панели инструментов.

## Отображение стандартных кнопок

`showPreview` и `showFullscreen` по умолчанию равны `true`. Значение `false` удаляет соответствующую кнопку, цель фокуса и события. Если оба значения равны `false`, пустая область инструментов тоже не создаётся.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Передавайте одинаковые параметры отображения в SSR и mount. Для изменения конфигурации вызовите `tools.unmount()` и выполните mount с новыми параметрами. Если обе кнопки не нужны, можно по-прежнему полностью опустить mount инструментов и их SSR-разметку. Прямые вызовы `openPreview()` и `setFullscreen()` остаются доступны.
