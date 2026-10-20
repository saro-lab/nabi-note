---
title: Сравнение
description: Сравните два документа рядом и перенесите выбранное прежнее содержимое в текущий документ.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Сравнение

Расположите два сохранённых документа рядом, чтобы увидеть изменения. Сравнение открывается без редактора; callback позволяет перенести выбранное прежнее содержимое в текущий документ.

## Перенос выбранного прежнего содержимого

Отдельное окно сравнения по умолчанию доступно только для чтения и не показывает кнопки применения **&gt;&gt;**. Подключите обработчик `onMerge`, чтобы показать эти кнопки.

Слева прежний документ, справа текущий. **&gt;&gt;** рядом с изменением переносит прежнее содержимое соответствующего абзаца или группы строк. Посимвольного выбора нет. Можно также восстановить удалённое или убрать добавленное в текущий документ содержимое.

Пример ниже доступен только для чтения. Посмотрите, как изменились время встречи и список вещей, которые нужно принести. **Начать заново** восстанавливает исходный пример.

<CompareDemo />

## Отдельное окно сравнения

Импортируйте из `nabi-note/diff`. В `before` и `after` передайте сохранённый NABI TREE JSON или HTML-строки. Создайте registry с теми же wings, что у исходного редактора, чтобы полностью прочитать и показать таблицы, списки, изображения и прочее содержимое.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ru',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

По умолчанию видны изменения и окружающий контекст. Кнопка сворачивания раскрывает документы целиком; предыдущая/следующая перемещают по изменениям. Если изменений нет, виден весь документ. Без `onMerge` сравнение доступно только для чтения.

## Слияние по клику через callback

Нажатие передаёт предложенный результат в `onMerge`. Подключение callback не сохраняет документ автоматически. Сервис должен принять предложение и вызвать `update()`, чтобы обновить сравнение.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ru',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` — NABI TREE JSON только с выбранным изменением. `before` и `after` — документы в момент клика; `changeId` обозначает изменение, `revision` — состояние сравнения. Передайте эту `revision` третьим аргументом `update()`: если сравнение уже изменилось, метод вернёт `false`, не применяя предложение.

Повторные клики блокируются на время асинхронного callback. Обновление другими документами или демонтаж отменяет `signal`. При сохранении на сервер проверяйте сигнал и версию документа, чтобы устаревший результат не перезаписал новый документ.

## Открытие сравнения из редактора

Подключите wing `diff` и `mountDiffWing()`, чтобы открывать сравнение с панели. База — последний загруженный документ. Обычное редактирование и отмена действий её не меняют.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'ru',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

По умолчанию `merge` равен `true`, поэтому выбранное прежнее содержимое можно применить к редактору. Действие можно отменить, база сохраняется. Изменения исходного редактора при открытом сравнении вызывают пересчёт. Укажите `merge: false` для режима только для чтения.

При удалении окна вызовите `toolbar.unmount()` и `comparison.unmount()`. Чтобы учесть версию начала редактирования и автоматически объединить обе стороны, используйте [Слияние](./merge).
