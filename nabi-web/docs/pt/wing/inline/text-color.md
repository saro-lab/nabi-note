---
title: Cor do texto
---

# Cor do texto

## Descrição

`textColorWing` (id `tc`) é o dono (claim) de `<span data-color="...">`. É da
mesma linhagem do realce: por ser uma marca inline que carrega um valor, não se
liga e desliga — escolhe-se uma cor.

- **O botão da barra de ferramentas (atalho `C`) aplica verde** — ele chama
  `setTextColor` levando `{ c: 'green' }`. Não é um botão que roda sem
  argumento.
- Por isso a alternância deste botão é **uma alternância sobre o verde**. Ela só
  tira a marca quando o trecho selecionado está inteiro em verde; se outra cor
  já estiver aplicada, ele troca para verde.
- Quando o cursor está dentro de uma marca de cor do texto, a barra de
  ferramentas de contexto exibe cinco amostras de cor — pressionar uma troca só
  a cor, ali mesmo (as marcas não se empilham). Este wing não tem um campo
  "limpar" próprio — pressionar de novo a mesma cor tira a marca, e o resto é
  papel do `clearFormatWing`.
- **Escolher só com o cursor, sem seleção, tem dois caminhos.** Dentro de uma
  marca, todo o texto que ela cobre vira o alvo; fora dela, fica **reservado**,
  e o próximo caractere digitado já nasce com aquela cor.
- No valor salvo fica só o nome da cor — algo como `data-color="green"`.
  Nenhum `style` inline sai. O valor da cor vem dos tokens do núcleo
  `--nabi-tc-*`, e a folha de estilo é compartilhada com o realce.
- Na entrada (`claim`) ele só reconhece uma tag `<span>` que também tenha o
  atributo `data-color`. Um `<span>` sem `data-color` não é reivindicado por
  este wing, perde a casca e cai como texto puro — **e se o atributo existir mas
  o valor estiver fora da lista, ele também perde a casca e sobra só o texto.**
- O mesmo vale para um valor fora da lista num valor salvo corrigido à mão — o
  `repair` remove o nó inteiro, casca e tudo.
- Realce e cor do texto são marcas diferentes, então podem incidir juntas sobre
  o mesmo texto — é por isso que a folha do realce não define `color`.

| Nome da cor | Valor salvo |
|---|---|
| Verde | `green` |
| Coral | `coral` |
| Violeta | `violet` |
| Âmbar | `amber` |
| Azul | `blue` |

Essas cinco são exportadas como `TEXT_COLORS` — não são os valores de cor, e sim
o **array de nomes** (`readonly string[]`).

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
