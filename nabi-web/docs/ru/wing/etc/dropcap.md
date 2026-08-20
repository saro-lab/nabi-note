---
title: Буквица
---

# Буквица

## Описание

`dropCapWing` — это одноразрядный атрибут абзаца, который ставит
`data-nabi-dropcap="1"`. Новый вид блока он не создаёт, а лишь кладёт пометку
на уже существующий абзац.

- Значение только одно — включено или выключено: нажмите кнопку ещё раз, и
  атрибут снимется.
- **Ни опции, ни переменной, определяющей число охватываемых строк, нет.**
  Размер фиксирует одно-единственное правило `::first-letter` в таблице стилей
  ядра — `font-size: 5.9em; line-height: .83`. Сколько строк реально накроет
  буква, решает высота строки самого абзаца.
- Поскольку дотягивается она до одной только первой буквы, Enter обходится с
  этим атрибутом как с меткой: разделите абзац — и он не скопируется в обе
  половины, а уйдёт вслед за той самой буквой.

Чтобы изменить размер, переопределите это правило.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
