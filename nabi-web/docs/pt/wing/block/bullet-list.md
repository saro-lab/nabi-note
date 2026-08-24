---
title: Lista com marcadores
---

# Lista com marcadores

## Descrição

`bulletListWing` (id `ul`, atalho `L`) cuida das listas não ordenadas (`<ul>`). O item da lista (`<li>`) é incorporado pelo atributo `parts`, então não é preciso registrar `li` separadamente.

```ts
parts: { li: { holds: 'blocks' } }
```

Clicar no botão da barra de ferramentas transforma em lista com marcadores o bloco em que o cursor está (ou todos os blocos selecionados); clicar de novo restaura parágrafos normais. Clicar em outro botão de lista (numerada, lista de tarefas etc.) troca imediatamente para aquele tipo de lista.

Digitar `- ` (um hífen e um espaço) no começo de um parágrafo também o converte em lista automaticamente. Como só se verifica o padrão de caracteres imediatamente antes do cursor, digitar o espaço depois de `- texto` ainda converte corretamente, e o que já estava escrito permanece como conteúdo do item (isso só funciona na primeira linha de um parágrafo, porém).

### Atalhos e comportamento de edição

- <kbd>Tab</kbd>: recua o item atual um nível, tornando-o filho do item imediatamente acima. No primeiro item não há item-pai para recuar, então nada acontece — e dentro de uma lista, <kbd>Tab</kbd> nunca insere um espaço.
- <kbd>Shift</kbd>+<kbd>Tab</kbd>: desrecua o item atual um nível. Desrecuar um item de nível superior o retira da lista e o transforma em parágrafo normal. Com vários itens selecionados, toda a seleção se move junto.
- **<kbd>Enter</kbd> num item vazio**: desrecua-o. Se era um item vazio de nível superior, a lista termina ali e um novo parágrafo aparece abaixo.
- **<kbd>Backspace</kbd> bem no começo de um item**: funde seu conteúdo ao final do item anterior. Se não houver item anterior para fundir, desrecua em vez disso. Já <kbd>Delete</kbd> bem no final de um item traz o item seguinte para a linha atual.
- Como um item (`li`) é um contêiner de bloco, ele guarda um parágrafo (`p`), e qualquer formatação em linha — negrito, itálico etc. — pode ser usada livremente dentro dele.
- Atributos não padronizados da tag são removidos na normalização, e qualquer coisa que não seja `li` encontrada dentro de uma lista é automaticamente envolvida num item `li` para corrigir a estrutura.
- A lista de tarefas compartilha a mesma tag `<ul>`, mas os dois wings se distinguem pela presença ou não do atributo `data-nabi-list="task"`.

## Marcação e estrutura de aninhamento

A estrutura aninhada da árvore Nabi é transportada diretamente para o HTML. Como um item de lista (`li`) guarda blocos, não texto, o texto dentro de um item é envolvido num parágrafo `<p>`, e uma sublista aninhada é colocada com segurança dentro de um parágrafo-invólucro (`<div data-nabi-p>`).

```html
<li><p>Item pai</p><div data-nabi-p><ul><li><p>Item filho</p></li></ul></div></li>
```

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Monta o registry e a instância nabi a partir da lista de wings registradas.
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` é registrado automaticamente via `parts`, então nunca é passado diretamente no array.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
