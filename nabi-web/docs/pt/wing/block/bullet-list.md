---
title: Lista com marcadores
---

# Lista com marcadores

## Descrição

`bulletListWing` (id `ul`, atalho `L`) é dono de `<ul>`. O item vem junto por
`parts`, então `li` não é registrado à parte — não é um array, é um registro.

```ts
parts: { li: { holds: 'blocks' } }
```

Pressionar o botão envolve numa lista o bloco em que o cursor está (ou os blocos
abrangidos pela seleção), e pressionar de novo desfaz, devolvendo o parágrafo.
Pressionar outro botão de lista troca para aquele tipo.

Digitar hífen e espaço no começo da linha (`- `) dá o mesmo resultado. **Não
precisa ser uma linha vazia** — só se olha o começo da linha antes do cursor,
então mesmo em `- depoistexto`, apertar espaço aciona, e o texto depois fica
dentro do item. Mas só funciona na **primeira linha** do parágrafo.

- `Tab` recua um nível, tornando o item filho do item irmão logo acima. No
  primeiro item não há onde recuar, então nada acontece — dentro da lista, `Tab`
  não insere espaço.
- `Shift+Tab` desrecua para irmão seguinte do pai — desrecuar no nível superior
  tira o item da lista e o transforma em parágrafo. Se a seleção abranger vários
  itens, todos os itens abrangidos se movem juntos.
- **Enter num item vazio desrecua.** Se era do nível superior, a lista termina
  ali e o cursor vai para um novo parágrafo logo abaixo. É assim que se sai da
  lista.
- **Backspace no começo do item o funde com o item anterior.** Se não houver
  item anterior para fundir, ele desrecua. Delete no fim do item, ao contrário,
  puxa o item seguinte para dentro.
- O interior do item é um bloco, então entra um parágrafo por dentro. Marcas
  (negrito etc.) e outros wings inline funcionam normalmente dentro desse
  parágrafo.
- Atributos que a tag trazia, como `type`, não sobrevivem. Se algo que não é um
  item entrar dentro da lista, não é descartado — é envolvido num item.
- A lista de tarefas divide a mesma tag (`<ul>`), mas é um wing diferente — o que
  as separa é um atributo marcador (se houver `data-nabi-list="task"`, é lista de
  tarefas).

## O aninhamento é marcação de verdade

A estrutura permanece tal e qual no valor salvo. Mas **como o item guarda
blocos, não texto**, o texto entra com uma camada de parágrafo, e uma lista
aninhada fica dentro de um parágrafo-invólucro.

```html
<li><p>a</p><div data-nabi-p><ul><li><p>b</p></li></ul></div></li>
```

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` vem junto automaticamente por `parts`, então não se põe no array à mão.

## Demo

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
