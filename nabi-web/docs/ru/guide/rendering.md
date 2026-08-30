---
title: Настройка SSR
description: Безопасный рендеринг сохранённых документов NABI TREE в HTML на сервере и гидратация редактора в браузере.
---

# Настройка SSR

На сервере импортируйте только `nabi-note/ssr`, а не браузерные поверхности и UI. Он проверяет сохранённый JSON NABI TREE и превращает его в опубликованный HTML или HTML редактора, готовый к гидратации.

## Рендеринг опубликованного HTML

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('Не удалось прочитать сохранённый документ.')
```

`renderStoredHtml()` проверяет и нормализует свой JSON-ввод, а затем возвращает опубликованный HTML. `null` означает, что текущий registry не может прочитать этот ввод. На опубликованной странице подключите CSS пакета и `.nabi-content`.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

В браузере добавляйте `attachViewer()` из `nabi-note/viewer` только для интерактивной сортировки таблиц или подсветки кода. Обычному опубликованному содержимому нужен только CSS.

## Гидратация заранее отрендеренной разметки редактора

Чтобы редактор был виден уже при первой отрисовке, отрендерьте его на сервере через `renderStoredEditorHtml()` и передайте `hydrate: true` браузерной поверхности.

```ts
// сервер
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// браузер
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Сервер и браузер должны использовать один документ, одни и те же объявления wing в одинаковом порядке и параметры, влияющие на HTML. Вставляйте результат сервера без изменений как непосредственных потомков корневого элемента содержимого и не задавайте этому корню заранее `contenteditable`. При различии структуры поверхность отрисует новый HTML редактора.

## Предварительный рендеринг панели инструментов

`renderToolbarHtml()` и `renderViewToolsHtml()` могут заранее отрендерить элементы панели на сервере. Монтирование в браузере подключает эти элементы, когда совпадают registry, locale и порядок групп. Произвольный DOM хоста внутри корня панели не поддерживается.

Не используйте во время SSR браузерные API, такие как `injectSheets()`. Подключите собранный файл `nabi-note/nabi.css` или включите его в свой CSS bundle.
