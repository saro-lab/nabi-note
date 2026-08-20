---
title: Курсив
---

# Курсив

## Описание

`italicWing` — владелец (claim) тега `<i>`. Он нужен там, где текст меняет
интонацию: незнакомые слова, цитаты и тому подобное.

- На входе признаются и `<i>`, и `<em>`, а на выходе всё сводится к одному `<i>`.
  Ни один атрибут не сохраняется.
- Сочетание в режиме подсказок (двойное нажатие Shift) — `I`. Оно ловится по
  физической клавише (`KeyI`), поэтому работает и на корейской раскладке.
- Нажатие при выделенном тексте работает как переключатель.
- Если крыло не зарегистрировано, `<i>` теряет оболочку и превращается в простой
  текст.

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
