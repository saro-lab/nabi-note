---
title: Lista numerada
---

# Lista numerada

## Descrição

`orderedListWing` (id `ol`, atalho `N`) processa a lista numerada (`<ol>`). O item de lista (`<li>`) já vem embutido pelo atributo `parts` e não precisa ser registrado separadamente.

```ts
parts: { oli: { holds: 'blocks' } }
```

Clicar no botão transforma em lista numerada o bloco em que o cursor está (ou todos os blocos abrangidos pela seleção); clicar de novo restaura o parágrafo comum. Clicar em outro botão de lista troca imediatamente para aquele tipo.

Digitar `1. ` (um número, ponto, espaço) no começo de um parágrafo também converte automaticamente para lista numerada. O número inicial é livre e reconhecido até nove algarismos.

### Atalhos e comportamento de edição

- Recuar/desrecuar com `Tab`/`Shift+Tab`, terminar a lista com `Enter` num item vazio, e fundir com o item anterior usando `Backspace` no começo de um item funcionam exatamente como na [lista com marcadores](./bullet-list).
- O número de cada item é renderizado dinamicamente pelo navegador através da tag HTML `<ol>` — inserir ou apagar um item no meio recalcula automaticamente a numeração.
- Estruturas de listas aninhadas são renderizadas de forma segura por meio de um parágrafo-invólucro (`<div data-nabi-p>`).

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
