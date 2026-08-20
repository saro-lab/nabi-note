---
title: Изображение
---

# Изображение

## Описание

`imageWing` (id `img`) владеет изображением (`<img>`). Это, как `hr` и
`youtube`, **объект без содержимого**. По нажатию кнопки открывается слой ввода
адреса.

**Адрес отсеивается по схеме, а не по расширению.** Проходят только `http:`,
`https:` и относительные пути — адрес вида `//example.com/a.png` (без указанной
схемы) отклоняется. Оканчивается ли адрес на `.png`, **не проверяется вовсе** —
слишком часто картинку отдают по адресу без расширения.

Каретка внутрь изображения не заходит, поэтому щелчок по картинке выделяет её
целиком и поднимает контекстную строку.

| Раздел | Поле |
|---|---|
| Ширина | восемь ступеней от `30` до `100` с шагом десять (по умолчанию `60`) — это шкала, на которой видно и текущее значение |
| Просмотр | одна картинка крупно — документ при этом не меняется |

**В контекстной строке только эти два поля.** Полей «слева» · «по центру» ·
«справа» здесь нет — место занимает не сама картинка, а **абзац-обёртка**, в
которую она вложена, — этим и занимается кнопка выравнивания на панели
инструментов.

**Только что вставленная картинка стоит по центру** — `insertLump` надевает на
абзац-обёртку выравнивание `c`.

На выходе ширина ложится на картинку, а выравнивание — на обёртывающий её
абзац.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Значения выравнивания — `l`·`c`·`r`. Строчный `style` наружу не выходит —
настоящий вид рисует таблица стилей, которая читает эти атрибуты внутри
`.nabi-content` с подключённым `nabi.css`.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Если включить `allowLocalUrls`, разрешаются также адреса `blob:` и
`data:image/...` — включайте это только в демонстрациях и сценариях загрузки,
где файл показывается без сервера. По умолчанию выключено.

Когда картинка сломана (адрес мёртв, ссылка истекла, blob исчез), заполнитель
появляется сам — эту работу крыло объявляет через `attach`, и `mountSurface`
подключает `attach` зарегистрированных крыльев сама. **Отдельно монтировать
ничего не нужно.** Эта пометка существует только на экране и никогда не
попадает в сохранённое значение.

`allowLocalUrls` можно включить в двух местах — для всего редактора
(`createNabiWith(wings, { allowLocalUrls: true })`) или только для крыла
изображения (`makeImageWing({ allowLocalUrls: true })`).

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Чтобы полученный при загрузке файл (адрес `blob:`) так и оставался открытым:

```ts
makeImageWing({ allowLocalUrls: true })
```

## Демо

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
