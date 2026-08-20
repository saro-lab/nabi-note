---
title: Код
---

# Код

## Описание

`codeWing` (id `code`) — **константа**, владеющая блоком кода (`<pre>`); её не
вызывают со скобками.

Это контейнер с `holds: 'inline'`, а его содержимое сам же `repair` держит
простым текстом — ни метки, ни другие крылья вмешаться не могут. Такого поля в
контракте отдельно нет — крыло само приводит своё содержимое в порядок.

Наберите на пустой строке ` ``` ` и нажмите пробел или Enter — получится блок
кода. Если дописать язык, как в ` ```ts `, он тоже будет подхвачен. Строки
сдвигают вправо и влево по `Tab`/`Shift+Tab` (если выделено несколько строк —
все разом). Enter наследует отступ предыдущей строки.

Контекстная строка появляется, только когда каретка стоит внутри кода: там поле
для ввода языка вручную, кнопка «Без языка» и кнопки часто используемых языков.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

Этот список — просто **быстрый путь**, а не перечень языков, которые знает
ядро. Язык, которого здесь нет, вписывают в первое поле вручную, и это значение
уходит подсветке как есть.

## Подсветка подключается к крылу

`highlight` — это **обработчик, возвращающий не цвет, а вид лексемы**. Он имеет
форму `(исходник, язык) => {text, type?}[]`, а `type` жёстко ограничен четырнадцатью
значениями — `keyword`, `string`, `number`, `comment`, `function`, `class`,
`variable`, `operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`,
`meta` (`CODE_TOKEN_TYPES`).

Цвет напрямую задаёт таблица стилей ядра через селектор
`[data-nabi-token="…"]` — **цвет есть только у пяти** (`comment`·`string`·
`keyword`·`number`·`literal`). У остальных видов есть только пометка, но нет
цветового правила, поэтому они выходят цветом обычного текста. Значение — не
переменная CSS, а фиксированный цвет, так что для другого цвета или тёмной темы
эти селекторы придётся переопределить самостоятельно.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Самого словаря грамматик в пакете нет — Prism, highlight.js, Shiki и им
подобное придётся подключать вам.

Подсветку **подключают к самому крылу** — отдельно монтировать её не нужно.
Соберите `attach` через `makeCodeAttach` и подставьте его в крыло кода, а
`mountSurface` подключит его сама. Демонстрация на этом сайте — как раз пример
такого подключения Shiki (`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// крыло — константа, меняем только работу подключения (`attach`)
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

Если передать `version`, подсветка повторится в тот момент, когда **документ
не менялся, а изменилась сама подсветка**. Так бывает у подсветок, которые
загружают грамматику асинхронно (Shiki делает это при первой встрече с языком):
грамматика приехала, но документ не изменился, поэтому `onChange` не
срабатывает, и без этого механизма цвет появится только после того, как вы
наберёте лишний символ.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// когда грамматика приехала с опозданием — увеличиваем счётчик, и подсветка повторится
grammarAge += 1
```

Сохранённое значение следует внешним соглашениям — это
`<pre data-nabi-lang="ts"><code class="language-ts">`, а цвет выходит атрибутом
`data-nabi-token` (а не строчным `style`).

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
