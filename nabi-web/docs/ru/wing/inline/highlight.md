---
title: Маркер
---

# Маркер

## Описание

`highlightWing` — владелец (claim) конструкции `<mark data-color="...">`. Это
строчная метка со значением, поэтому она не включается и не выключается, а
выбирается по цвету — та же порода, что и цвет текста.

- Кнопка на панели инструментов (сочетание `H`, без аргументов) работает как
  переключатель: если выделенный участок целиком уже размечен маркером, разметка
  снимается, иначе накладывается цветом по умолчанию (жёлтым).
- Если каретка стоит внутри метки маркера, в контекстной панели появляются шесть
  образцов цвета (swatch) — нажатие меняет прямо на месте только цвет. Отдельной
  кнопки «стереть» у самого этого крыла нет — очистка форматирования это дело
  `clearFormatWing` (его нужно регистрировать отдельно).
- Команда срабатывает и тогда, когда текст не выделен, а стоит только каретка:
  если каретка уже внутри метки маркера, целью становится весь её узел (заново
  выделять участок не нужно).
- В сохранённом значении остаётся только имя цвета — вида `data-color="yellow"`.
  Строчный `style` наружу не выходит: за настоящий цвет фона отвечает не это
  крыло, а таблица стилей хоста (CSS).
- На входе (`claim`) смотрится только тег `<mark>`: если значения
  `data-color` нет или его нет в списке, метка ложится цветом по умолчанию
  (жёлтым) — сам смысл «это маркер» уже несёт тег, поэтому выбрасывать его не за
  что.

| Название цвета | Сохраняемое значение |
|---|---|
| Жёлтый | `yellow` |
| Зелёный | `green` |
| Голубой | `cyan` |
| Розовый | `pink` |
| Фиолетовый | `purple` |
| Оранжевый | `orange` |

Список цветов также экспортируется как `HIGHLIGHT_COLORS` (карта id → значение
цвета в CSS).

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
