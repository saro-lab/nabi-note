---
title: Основное использование
description: Создание браузерного редактора NABI NOTE, сохранение и восстановление документов.
---

# Основное использование

Это руководство описывает редактор с клиентским рендерингом (CSR) в браузере: выбор wings, монтирование редактора и UI, сохранение и восстановление JSON NABI TREE.

## Установка и базовая разметка

```bash
npm install nabi-note
```

Подключите одну таблицу стилей для редактора и опубликованного содержимого. Не добавляйте `contenteditable` самостоятельно: им управляет `mountSurface()`.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Монтирование редактора

`allBasic()` выбирает официальные wings, не требующие подключения к сервису. Wings загрузки, файлового хранилища или сравнения документов добавляйте по их отдельным руководствам.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'ru',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'ru',
  placeholder: 'Начните писать.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ru',
})
```

`locale` управляет текстом панели и подсказок; передавайте одно значение во все UI mount. `placeholder` показывается только в пустом редакторе. `onError` получает изолированные ошибки команд и callback. `undoLimit` задаёт число записей отмены (по умолчанию 200). `typingMergeMs` задаёт интервал объединения последовательного ввода в один шаг отмены; значение `0` сохраняет каждую вставку отдельно.

Каждому редактору нужны собственные, не пересекающиеся корни содержимого и панели. Если редакторов несколько, передайте каждой панели её поверхность через `surface`, чтобы фокус и сочетания клавиш не пересекались.

## Выбор wings

Оставьте только нужные возможности с помощью `use()` и `drop()`. Параметры каждой wing описаны на её странице.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'ru' })
```

Для меньшего bundle передайте массив только нужных wings, например `boldWing` и `imageWing`. Неизвестные имена, неверные параметры и отсутствующие зависимости вызывают ошибку сразу при создании редактора.

## Сохранение и загрузка

Если документ будут редактировать снова, сохраняйте результат `getJson()` как JSON NABI TREE. `getHtml()` предназначен для публикации. Никогда не сохраняйте редакторский результат `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('Не удалось прочитать сохранённый документ.')

const publishedHtml = nabi.getHtml()
```

Внешний HTML импортируется через `setHtml()`. Браузерный редактор уже содержит HTML parser, поэтому отдельная опция не нужна. При неверном непустом вводе `setJson()` и `setHtml()` возвращают `false`, не меняя текущий документ.

```ts
nabi.setHtml('<p>Импортированный документ</p>')
```

И JSON, и HTML считаются недоверенным вводом. NABI NOTE читает их через зарегистрированные wings и разрешённые правила, но это не заменяет авторизацию загрузки и политику безопасности сервиса.

## Основные API

| Задача | API |
| --- | --- |
| Создание редактора | `createNabiWith`, `wings` |
| Монтирование поверхности и панели | `mountSurface`, `mountToolbar` |
| Сохранение и восстановление | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Наблюдение за изменениями | `nabi.onChange(listener)` |
| Отмена и повтор | `nabi.undo()`, `nabi.redo()` |
| Рендеринг HTML на сервере | `renderStoredHtml` из `nabi-note/ssr` |
| Поведение опубликованной страницы | `attachViewer` из `nabi-note/viewer` |
| Сравнение документов | `diffDocs` из `nabi-note/diff` |

Точные типы и все аргументы сначала ищите в объявлениях установленного пакета. Средства автоматизации также могут использовать [английский справочник API](https://nabi.saro.me/llms/api-reference.md).

## Размонтирование

Размонтируйте в порядке, обратном созданию. Не меняйте `innerHTML` корня редактирования напрямую; используйте публичные API `setJson()`, `setHtml()` или `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
