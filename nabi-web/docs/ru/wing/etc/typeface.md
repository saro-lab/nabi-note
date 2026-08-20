---
title: Шрифт
---

# Шрифт

## Описание

`typefaceWing` (имя `tf`) — это **инлайновая значимая марка**. Это готовая константа — добавьте её
в массив, и всё, передавать опции не нужно. На выходе рисуется как
`<span data-nabi-typeface="serif">`.

Значения — это четыре из `TYPEFACES`: `sans`, `serif`, `mono`, `cursive`.

- **Она вообще не хранит имён шрифтов.** Вы выбираете **обобщённое семейство**, а какой шрифт
  реально появится, решают значения, которые хост задаёт на четырёх токенах `--nabi-font`,
  `--nabi-font-serif`, `--nabi-font-mono` и `--nabi-font-cursive`.
- **Одно крыло** держит все четыре значения. Место выбора — `select` из четырёх полей на
  контекстной панели, а вход — одна кнопка панели инструментов: её нажатие применяет `serif`.
- **Текст без применённого значения носит `--nabi-typeface-base`.** Этот токен — базовый шрифт
  редактора, и если его не трогать, он следует за `--nabi-font`. Отдельного поля «по умолчанию»
  нет — **выберите уже применённое семейство, и оно снимется**, возвращаясь к этой базе.
- **Поля рисуются тем же шрифтом, который называют.** Поле serif набрано serif, поле monospace —
  monospace, так что видно, что выбираешь, даже не зная названий.
- **С одной лишь кареткой применяется ко всему абзацу.** В абзаце вообще без текста она вместо
  этого остаётся заряженной, и следующий набранный символ выходит этим шрифтом.

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Список крыльев строит вместе знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Шрифты, которые задаёт хост, — это одно место в CSS. Сложите несколько шрифтов в одно семейство —
и браузер пройдёт по списку для каждого символа, рисуя его первым шрифтом, в котором он есть, так
что на каком бы языке ни набирали текст, семейство сохранит свой облик.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## Демо

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
