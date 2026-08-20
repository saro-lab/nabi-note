---
title: Спойлер
---

# Спойлер

## Описание

`detailsWing` (id `details`, сочетание `D`) владеет складным блоком
(`<details>` + `<summary>`). Заголовок приходит вместе с ним через `parts` —
регистрировать его отдельно не нужно, это не массив, а запись.

```ts
parts: { summary: { holds: 'inline' } }
```

По нажатию кнопки блоки, задетые кареткой, оборачиваются в новый спойлер, а
пустая строка заголовка встаёт впереди. Enter в строке заголовка переводит
каретку в содержимое (сам заголовок при этом не разделяется).

**Редактор рисует блок точно таким, каким он будет сохранён.** Блок, сохранённый
свёрнутым, свёрнут и в редакторе, а нажатие на треугольник тут же его
разворачивает или сворачивает — это нажатие и меняет сохранённое значение
(`o`). Если каретка была внутри блока в момент сворачивания, она выходит
наружу.

::: tip Контекстной строки здесь нет
Раньше существовали две кнопки — **Сохранить открытым** и **Сохранить
свёрнутым**. Пока экран всегда рисовал блок развёрнутым, это был единственный
способ сказать, в каком виде он будет сохранён. Теперь экран рисует ровно то,
что сохранено, а треугольник это меняет — так что говорить одно и то же дважды
стало незачем, и кнопки убрали.
:::

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
