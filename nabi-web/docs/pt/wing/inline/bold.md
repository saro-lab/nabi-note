---
title: Negrito
---

# Negrito

## Descrição

`boldWing` é o wing inline que cuida da formatação em negrito (`<b>`). Selecione
o texto e pressione **B** na barra de ferramentas, use o modo de dicas (dois
toques em Shift seguidos de `B`), ou o atalho (`Ctrl`/`⌘`+`B`).

- Na entrada, `<b>` e `<strong>` são reconhecidos igualmente; na saída, sempre
  sai a tag padrão `<b>`.
- Com o texto selecionado, funciona como alternância — se a seleção já está em
  negrito, é removido; caso contrário, é aplicado.
- Sem seleção, apenas com o cursor, o atalho reserva o negrito para o próximo
  texto digitado.
- Se o wing não estiver registrado, a tag `<b>` é removida automaticamente e só
  o texto puro é mantido.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
