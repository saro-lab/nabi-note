---
title: Цвет текста
---

# Цвет текста

## Описание

`textColorWing` — владелец (claim) конструкции `<span data-color="...">`. Это та
же порода, что и маркер: строчная метка со значением, которую не включают и не
выключают, а выбирают по цвету.

- Кнопка на панели инструментов (сочетание `C`, без аргументов) работает как
  переключатель.
- Если каретка стоит внутри метки цвета текста, в контекстной панели появляются
  пять образцов цвета (swatch) — нажатие меняет прямо на месте только цвет
  (метки не наслаиваются друг на друга). Отдельной кнопки «стереть» у самого
  этого крыла нет — это дело `clearFormatWing`.
- Даже если выделения нет и стоит только каретка, при выборе цвета целью
  становится весь узел метки, внутри которой каретка находится.
- В сохранённом значении остаётся только имя цвета — вида `data-color="green"`.
  Строчный `style` наружу не выходит.
- На входе (`claim`) признаются только теги `<span>`, у которых есть атрибут
  `data-color`: `<span>` вовсе без `data-color` это крыло не заявляет своим,
  поэтому такая оболочка снимается и текст выпадает простым. Если атрибут есть, а
  значения в списке ниже нет, метка ложится цветом по умолчанию (зелёным) — то же
  правило, что у маркера: тег уже несёт смысл «текст с цветом», выбрасывать его
  не за что.
- Маркер и цвет текста — разные метки, поэтому их можно наложить на один и тот же
  текст.

| Название цвета | Сохраняемое значение |
|---|---|
| Зелёный | `green` |
| Коралловый | `coral` |
| Фиолетовый | `violet` |
| Янтарный | `amber` |
| Синий | `blue` |

Список цветов также экспортируется как `TEXT_COLORS` (карта id → значение цвета в
CSS).

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
