---
title: YouTube
---

# YouTube

## Описание

`youtubeWing` (id `youtube`, без сочетания клавиш) владеет встроенным
проигрывателем YouTube (`<iframe>`). Это, как `hr` и `img`, **объект без
содержимого** (`place: 'void'`). По нажатию кнопки открывается слой ввода
адреса, и проходят только адреса YouTube вида `watch?v=`, `youtu.be/`,
`/embed/`, `/shorts/`, `/v/`, `/live/` (включая префиксы `www.`, `m.`, `music.`
и домен `youtube-nocookie.com`) — решение принимается не поиском подстроки, а
разбором через `URL()`, поэтому адрес вроде `youtube.com.evil.test` не пройдёт.

Присланный адрес не принимается на веру — сохраняется только
одиннадцатизначный id видео. Сам адрес в сохранённом значении не остаётся:
остаётся лишь `{"w":"youtube","a":{"v":"<id>","w":"70"}}`, а на выходе всегда
заново собирается один и тот же вид —
`https://www.youtube-nocookie.com/embed/<id>`.

По той же причине, что и у `hr`, каретка внутрь не заходит, а нажатие
Backspace или Delete прямо перед блоком или сразу за ним убирает его целиком.
Встроенный контент, не являющийся YouTube, при импорте **отбрасывается
целиком** — чужой документ внутрь своего документа не встраивается.

## Контекстная строка

Щелчок по видео поднимает два поля.

| Раздел | Поле |
|---|---|
| Ширина | шесть ступеней — `50` `60` `70` `80` `90` `100` (по умолчанию `70`) — это шкала, на которой видно и текущее значение |
| Адрес | слой ввода, уже заполненный id текущего видео |

**Полей «слева» · «по центру» · «справа» здесь нет.** Место занимает не само
видео, а **абзац-обёртка**, в которую оно вложено, — этим и занимается кнопка
выравнивания на панели инструментов. Только что вставленное видео встаёт с
обёрткой, выровненной по центру (`c`).

Поэтому на выходе ширина ложится на видео, а выравнивание — на обёртывающий его
абзац.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

Строчный `style` наружу не выходит. Если хост хочет вставлять видео из своего
интерфейса, он вызывает команду напрямую —
`applyCommand('insertYoutube', { v: адрес, w: '80' })`, а чтобы поменять только
ширину — `applyCommand('setYoutubeWidth', { w: '80' })`. Значение ширины вне
списка отклоняется.

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
