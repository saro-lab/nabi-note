---
title: Alinhamento
---

# Alinhamento

## Descrição

`alignWing` (id `align`) é **um só** wing que carrega os três — esquerda, centro
e direita. Na barra de ferramentas ele é uma constante: não é uma fábrica
`align()` que junta tudo, cada valor tem o seu próprio botão. Ele pendura no
bloco o atributo `data-nabi-align`.

- É um **atributo de bloco**: a tag fica como está e só o atributo é acrescentado.
  Como em `<p data-nabi-align="center">`, o parágrafo em si não muda.
- **Aplica-se a parágrafos e a títulos.** `<h2 data-nabi-align="c">` também
  funciona — um título também é uma linha de texto comum. Dos quatro atributos de
  parágrafo, só o alinhamento é assim; tamanho da letra, tipo de letra e
  capitular continuam exclusivos dos parágrafos.
- Só existe um valor por vez — com o alinhamento à esquerda aplicado, pressionar
  o de centro faz o da esquerda cair e o do centro grudar. Pressionar de novo o
  valor já aplicado faz o atributo cair por inteiro (voltando ao alinhamento
  padrão).
- **Enter transmite o alinhamento para os dois lados sem mudança.** Ao partir um
  parágrafo, os dois saem com o mesmo alinhamento — diferente do título (`h`),
  que cai no lado vazio, e da capitular (`dc`), que só segue um dos lados, o
  alinhamento não tem essa exceção.
- Os três são **três botões** (`buttons`) de um único wing — não dá para ligar e
  desligar cada um à parte; basta pôr o próprio `alignWing` no array de wings.
- **Este wing também cuida do lugar de tabela, imagem e YouTube.** O objeto mora
  dentro do parágrafo-invólucro que o contém, e é esse parágrafo que carrega o
  alinhamento — então "imagem alinhada ao centro" é, na verdade, "imagem dentro
  de um parágrafo alinhado ao centro". Por isso a linha de contexto de imagem e
  tabela não tem nenhum campo de alinhamento, e só o alinhamento não desaparece
  da barra de ferramentas quando o cursor está sobre um objeto.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
