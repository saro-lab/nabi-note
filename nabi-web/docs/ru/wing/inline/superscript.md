---
title: Надстрочный
---

# Надстрочный

## Описание

`superscriptWing` — владелец (claim) тега `<sup>`. Он нужен для степеней в
единицах измерения и для номеров сносок.

- Признаётся один-единственный тег — `<sup>`. Атрибуты не сохраняются.
- Сочетания в режиме подсказок и акселератора нет (это одно из крыльев, у которых значок не
  появляется, — как у загрузки файлов). Его группа на панели инструментов — `script`, где оно
  стоит рядом с подстрочным, но по порядку регистрации идёт первым.
- Нажатие при выделенном тексте работает как переключатель.
- Внешний вид задаёт таблица стилей, которую крыло несёт как `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**Эта таблица стилей — единый набор, общий с подстрочным.** Оба крыла несут одинаковый текст,
поэтому регистрация обоих всё равно вставляет его в документ **один раз** (`collectSheets`
отбрасывает уже виденные таблицы стилей). В сохранённом значении (HTML) остаётся только тег
`<sup>`, сами стили туда не попадают.

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
