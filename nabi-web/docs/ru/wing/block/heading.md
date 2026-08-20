---
title: Заголовок
---

# Заголовок

## Описание

`headingWing` (id `h`) — единственное крыло, которое держит все шесть уровней. Заголовок —
это не отдельный узел, а **атрибут абзаца**: в хранилище он выглядит как
`{"w":"p","a":{"h":2}}`, а на выходе становится `<h2>`.

Поскольку заголовком становится сам абзац, вместе с ним действуют и другие атрибуты
абзаца — выравнивание, буквица (`<h2 data-nabi-align="c">`).

## Одна кнопка на панели, уровень — в контекстной строке

**На панели инструментов только одна кнопка — `H`.** Нажатие в абзаце превращает его в
заголовок 1-го уровня, а если каретка стоит внутри заголовка, в контекстной строке
появляются поля `Заголовок`·`H1`–`H6` — текущий уровень виден по нажатому полю, нажатие
другого поля переводит заголовок на этот уровень. Нажатие поля `Заголовок` возвращает
абзац к обычному виду.

Наберите на пустой строке столько `#`, каков нужный уровень (для 2-го уровня — `##`), и
нажмите пробел — строка сама станет заголовком этого уровня, а набранные `#` и пробел
исчезнут.

## Пример использования

Выбор уровня рисует `mountContextToolbar`.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Можно выставить и напрямую командой.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // сделать заголовком 2-го уровня
nabi.applyCommand('setHeading', { value: 2 })  // тот же уровень ещё раз — возврат к обычному абзацу
```

Если выделено несколько абзацев, действие применяется **ко всем выделенным абзацам**.
Такие объекты, как таблица или список, занимающие место абзаца, пропускаются — заголовок
является атрибутом именно текстового абзаца.

## Демо

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
