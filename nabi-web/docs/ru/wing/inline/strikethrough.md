---
title: Зачёркнутый
---

# Зачёркнутый

## Описание

`strikeWing` — владелец (claim) тега `<s>`. Он нужен для значений, которые
отменены, но должны остаться на виду.

- На входе признаются все три тега — `<s>`, `<strike>` и `<del>`, — а на выходе
  всегда получается `<s>`. Ни один атрибут не сохраняется: время из
  `<del datetime="…">` тоже не остаётся.
- Сочетание в режиме подсказок — `S`. **Быстрой клавиши нет** — в отличие от
  полужирного, курсива и подчёркивания из той же группы `emphasis`, сочетание
  `Ctrl`/`⌘` за ним не закреплено.
- Нажатие при выделенном тексте работает как переключатель.
- Если крыло не зарегистрировано, `<s>` теряет оболочку и превращается в простой
  текст.

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
