---
title: Полужирный
---

# Полужирный

## Описание

`boldWing` — владелец (claim) тега `<b>`. Выделите текст и нажмите **B** на панели
инструментов или вызовите крыло из режима подсказок (двойное нажатие Shift, затем
`B`) — выбранный участок станет полужирным.

- На входе признаются и `<b>`, и `<strong>`, а на выходе всегда получается один
  только `<b>`. Ни один атрибут не сохраняется — `class`, `style`, `data-*`
  отпадают, остаётся голый тег.
- Нажатие при выделенном тексте работает как переключатель (`toggleMark`): если
  весь участок уже полужирный, форматирование снимается, иначе — накладывается.
  Само крыло не заводит отдельной команды — кнопка объявлена как `action:
  { kind: 'mark' }` и идёт прямиком в `toggleMark` ядра.
- Если крыло не зарегистрировано, `<b>` теряет оболочку и превращается в простой
  текст (так происходит с любым незарегистрированным тегом — это общее правило
  nabi).

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
