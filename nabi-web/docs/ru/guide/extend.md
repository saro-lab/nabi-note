---
title: Пользовательские wings
description: Контракт и порядок реализации долговечной возможности документа.
---

# Пользовательские wings

Пользовательская wing — не просто кнопка панели. Это декларативное расширение, объединяющее сохранённую структуру документа, команды, преобразование HTML и Markdown, правила импорта и поведение представления. Registry проверяет его ещё до появления редактора, не допуская неверные структуры в документ.

## Начинайте с самого узкого factory

Для большинства форматирования не нужна полная декларация. Используйте `simpleMark()` для inline mark без значения, `valueMark()` для mark с ограниченным набором значений, `boxObject()` для блока без потомков и `listFamily()` для списка.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Реализация разных видов wing

У каждого примера ниже своя сохраняемая форма. Сначала зарегистрируйте один, затем проверьте `getJson()` и `getHtml()`. Добавляйте команды и кнопки только после того, как структура заработает.

### 1. Inline mark без значения: акцент

Когда возможность лишь оборачивает текст, используйте `simpleMark()`. В документе сохраняется `exStrong`, а HTML выводится как `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

При `clearable: true` команда очистки форматирования удаляет и этот mark. До добавления кнопки применяйте его через `nabi.applyCommand()` или другую пользовательскую команду. Один селектор `.nabi-content strong` оформляет редактор и опубликованный текст.

### 2. Inline mark со значением: тон состояния

Для цвета, размера или состояния из разрешённого набора используйте `valueMark()`. Значение хранится в `a.v`; значения вне списка удаляются при `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Сохранённая форма: `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. CSS обращается к сохранённому значению и меняет также опубликованный вид. Не удаляйте значения из существующего списка бездумно: прежние документы могут потерять их при чтении.

### 3. Блок без потомков: разделитель

Для самостоятельного объекта без потомков — изображения, видео или разделителя — используйте `boxObject()`.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Для объекта со значениями вроде URL или ширины объявите проверку в `attrs`, а обязательные значения поместите в `requires`. Непроверяемое значение отклоняйте через `null`, а не молча подставляйте значение по умолчанию.

### 4. Блок с несколькими абзацами: выноска

Для блока с содержимым документа объявите `container`. `holds: 'blocks'` разрешает абзацы, списки и объектные блоки.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Одна декларация ещё не умеет оборачивать выбранные абзацы. Перед публикацией возможности в UI добавьте чистую команду в `commands` и вызывающую её `button`.

### 5. Связанная пара списка и элемента

Если список и его элемент должны всегда встречаться вместе, используйте `listFamily()`.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` исправляет блок внутри списка, оборачивая его в элемент. Для значения элемента, например отметки выполнения, добавьте `itemDecl` и `repairItem`.

### Регистрация в одном упорядоченном наборе

На сервере и в браузере используйте одинаковые декларации в одном порядке.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'ru' })
```

## Имена и структура документа

Имена, попадающие в документ, должны соответствовать `ex[A-Z0-9]...`. Имя вроде `exCallout` не позволит будущей официальной wing изменить смысл сохранённого содержимого.

`place` задаёт форму хранения: `mark` оборачивает inline-содержимое, `void` — блок без потомков, `container` содержит потомков, `attr` меняет свойства абзаца, а `tool` не создаёт узел документа. Для `container` нужны `holds: 'blocks' | 'inline'` и `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` и `parts` задают структурные ограничения. Для каждого объявленного `parts` также нужен соответствующий `partHtml`. Ограничивайте значения выбирающей wing через `attrKey` и `attrValues`.

## Все параметры декларации

Объявляйте только необходимые поля: factory уже заполняет часть из них.

| Область | Параметры | Назначение |
| --- | --- | --- |
| Основа | `w`, `place`, `basic`, `styles` | Имя, вид структуры, участие в базовом каталоге, CSS по умолчанию |
| Структура | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Вид потомков, поведение Enter, разрешённые и логические атрибуты |
| Структура | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Внутренние части, разрешённые потомки, запрет выравнивания, зависимость wing |
| Значения | `attrKey`, `attrValues`, `currentValue` | Ключ и список значения, определение текущего значения |
| Команды и ввод | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Команды, клавиши, Escape/двойные клавиши, автоформатирование |
| Поведение поверхности | `attach` | DOM-поведение и очистка поверхности |
| Преобразование | `toHtml`, `partHtml`, `toMd`, `partMd` | Вывод HTML и Markdown |
| Импорт и исправление | `claim`, `ioFilter`, `repair`, `partRepair` | Импорт HTML, файлы, проверка и исправление JSON |
| UI | `button`, `buttons`, `context` | Элементы панели и контекстного UI |
| Очистка форматирования | `clearable` | Удаляется ли wing при очистке форматирования |

`w` и `place` обязательны всегда. Создающим узлы wings `mark`, `void` и `container` также нужен `toHtml()`. Контейнеру нужен `holds`, а каждой объявленной части — соответствующий `partHtml`.

## Держите HTML, Markdown и JSON вместе

`toHtml()` рендерит сохранённый узел в HTML, а `toMd()` экспортирует Markdown. Без Markdown builder созданный HTML сохраняется, чтобы не потерять данные. При импорте `claim()` должен распознавать только ваш элемент и проверенные атрибуты.

`repair()` запускается при загрузке JSON и после команд. Для неверного атрибута верните исправленный узел, а для неудержимого узла — `null`. Стройте HTML через `ctx.element()`, `ctx.escape()` и `ctx.url()`; не склеивайте теги, атрибуты или URL в обход этих проверок.

## Отделяйте команды от поведения представления

Команда — чистая функция документа и выделения, возвращающая следующий документ и выделение внутри него. Она не читает и не меняет DOM и возвращает `null`, если корректное изменение невозможно. Называйте команды в lower camel case с глагола, например `insertNote`.

DOM-поведение, например перетаскивание выделения таблицы, помещайте в `attach(host)`. Сразу регистрируйте очистку каждого listener и изменённого атрибута через `host.onDispose()`, чтобы она выполнилась даже при ошибке настройки. Не меняйте DOM композируемого текста и сопоставление выделения поверхности.

Панель и контекстные элементы объявляйте через `button`, `buttons` и `context`. Дублирование правил их команд в UI приложения может рассинхронизировать UI и модель документа.

## CSS-стили

Обязательный базовый CSS wing помещайте в `styles`. Стили встроенных wings уже входят в `nabi-note/nabi.css`. В браузере для стилей выбранного registry можно использовать `collectSheets()` и `injectSheets()`; при SSR подключайте CSS-файл.

В редакторе и публикации используйте одинаковые классы и data-атрибуты, но не меняйте структуру `[data-key]`, `display` и `white-space` редактора. CSS должен менять только вид, а не сопоставление каретки.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Обращайтесь только к классам и data-атрибутам, создаваемым `toHtml()`. Изменения сервиса сужайте, например до `.article-body .ex-callout`.

## Проверяйте весь контракт

Убедитесь, что сохранённый JSON повторно загружается с той же структурой и HTML. Проверьте отклонение неверных имён, дублированных команд, отсутствующих builder и неудовлетворённых зависимостей. Покройте неверный импорт HTML и ввод `repair()`, обработку выделения командами, SSR-вывод и стилизованный опубликованный вид.

Полные типы и аргументы factory смотрите в установленных декларациях и [английском справочнике API](https://nabi.saro.me/llms/api-reference.md).
