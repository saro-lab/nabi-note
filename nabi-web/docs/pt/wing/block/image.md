---
title: Imagem
---

# Imagem

## Descrição

`imageWing` (nome `img`) é dono da imagem (`<img>`). É **um bloco sem interior**, como `hr` e
`youtube`. Pressionar o botão abre um painel de entrada de endereço.

**O endereço é filtrado pelo esquema, não pela extensão.** Só `http:`, `https:` e caminhos
relativos passam; um endereço relativo a protocolo, como `//example.com/a.png`, é recusado. Se
termina em `.png` **ninguém verifica** — é comum um endereço servir uma imagem sem extensão
nenhuma.

Como o cursor não entra dentro da imagem, clicar nela seleciona a imagem inteira e faz a linha
de contexto aparecer.

| Grupo | Campos |
|---|---|
| Largura | oito campos de dez em dez, de `30` a `100` (padrão `60`) — é uma escala, e o valor atual aparece junto |
| Ver | Só a figura, em tamanho grande — não altera o documento |

**A linha de contexto só tem esses dois.** Os campos de esquerda, centro e direita não estão
aqui — o lugar da imagem não é responsabilidade dela mesma, e sim do **parágrafo wrapper que a
envolve**, e esse trabalho é feito pelo botão de alinhamento da barra de ferramentas.

**Uma imagem recém-inserida fica centralizada** — porque `insertLump` veste o alinhamento `c`
no parágrafo wrapper ao construí-lo.

Ao sair, a largura gruda na imagem, e o alinhamento, no parágrafo que a envolve.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Os valores de alinhamento são `l`, `c`, `r`. Nenhum `style` inline sai — a aparência real é
desenhada pela folha de estilo que lê esses atributos dentro de um `.nabi-content` com
`nabi.css` aplicado.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Ligando `allowLocalUrls`, endereços `blob:` e `data:image/...` também são permitidos — ligue só
em cenários de demo e envio, onde o arquivo é pré-visualizado sem servidor. O padrão é
desligado.

Quando uma imagem quebra (endereço morto, expirado, ou um blob que sumiu), um espaço reservado
aparece sozinho — o wing carrega essa tarefa via `attach`, e `mountSurface` prende junto o
`attach` dos wings registrados. **Não há nada separado para montar.** Essa marca é só de tela e
nunca sobra no valor salvo.

`allowLocalUrls` pode ser ligado em dois lugares — no editor inteiro
(`createNabiWith(wings, { allowLocalUrls: true })`), ou só no wing de imagem
(`makeImageWing({ allowLocalUrls: true })`).

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e os montadores — isso é o `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Para deixar aberto, tal e qual, um arquivo recebido por envio (endereço `blob:`):

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
