---
title: Подстрочный
---

# Подстрочный

## Описание

`subscriptWing` — владелец (claim) тега `<sub>`. Он нужен для химических формул и
для номеров, которые пишут внизу строки.

- Признаётся один-единственный тег — `<sub>`. Атрибуты не сохраняются.
- Сочетания в режиме подсказок и акселератора нет. Его группа на панели инструментов —
  `script`, где оно стоит рядом с надстрочным (тот идёт первым по порядку регистрации).
- Нажатие при выделенном тексте работает как переключатель.
- Внешний вид задаёт таблица стилей, которую крыло несёт как `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**Эта таблица стилей — единый набор, общий с надстрочным.** Оба крыла несут одинаковый текст,
поэтому регистрация обоих всё равно вставляет его в документ **один раз** (`collectSheets`
отбрасывает уже виденные таблицы стилей). В сохранённом значении (HTML) остаётся только тег
`<sub>`, сами стили туда не попадают.

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
