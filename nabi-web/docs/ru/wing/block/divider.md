---
title: Разделитель
---

# Разделитель

## Описание

`dividerWing` (id `hr`) владеет одним-единственным тегом `<hr>`. **`place:
'void'`** — это объект без содержимого, поэтому каретке некуда внутрь заходить.
Нажатие Backspace или Delete прямо перед разделителем или сразу за ним убирает
этот блок целиком; выделение диапазоном даёт тот же результат.

По нажатию кнопки разделитель встаёт, **надевая собственный абзац-обёртку**.
Отдельный пустой абзац при этом не создаётся — каретка садится над этой
обёрткой, сразу за разделителем.

Место, куда он встанет, зависит от того, был ли в абзаце с кареткой текст.

| Где была каретка | Результат |
|---|---|
| В абзаце с текстом | встаёт **после** этого абзаца |
| В пустом абзаце | **занимает место** этого абзаца — лишней пустой строки не остаётся |

Если разделитель занимает место пустого абзаца, выравнивание, которое было на
этом абзаце, сохраняется.

Тот же результат даёт набранная в начале строки цепочка из трёх и более дефисов
(`---`) с последующим Enter — здесь автозамену **запускает Enter**.

## Пример использования

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// список крыльев вместе строит знание о видах, команды и сборщики — это и есть `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Демо

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
