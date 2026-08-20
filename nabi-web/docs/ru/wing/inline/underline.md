---
title: Подчёркнутый
---

# Подчёркнутый

## Описание

`underlineWing` — владелец (claim) тега `<u>`.

- На входе признаются и `<u>`, и `<ins>`, а на выходе всегда получается `<u>`.
  Ни один атрибут не сохраняется.
- Сочетание в режиме подсказок — `U`.
- Нажатие при выделенном тексте работает как переключатель.
- Подчёркивание и ссылка могут выглядеть на экране одинаково, но это отдельные
  метки: ссылкой владеет другое крыло (`a`) — обе метки могут лежать на одном и
  том же тексте.

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
