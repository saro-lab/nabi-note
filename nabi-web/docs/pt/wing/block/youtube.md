---
title: YouTube
---

# YouTube

## Descrição

`youtubeWing` (id `youtube`, sem atalho) é dono do incorporado do YouTube
(`<iframe>`). É um **objeto sem interior** (`place: 'void'`), como `hr` e
`img`. Pressionar o botão abre uma camada de entrada de endereço, e só passam
endereços do YouTube nas formas `watch?v=`, `youtu.be/`, `/embed/`,
`/shorts/`, `/v/` e `/live/` (incluindo os prefixos `www.`, `m.` e `music.`, e o
domínio `youtube-nocookie.com`) — o julgamento não é por busca de substring, e
sim por análise com `URL()`, então um endereço como `youtube.com.evil.test` não
passa.

Ele não confia no endereço recebido como veio: extrai apenas o **id de 11
caracteres** do vídeo e salva só isso. O endereço não fica no valor salvo — o
que sobra é só `{"w":"youtube","a":{"v":"<id>","w":"70"}}`, e na saída ele é
remontado numa forma única, `https://www.youtube-nocookie.com/embed/<id>`.

Pelo mesmo motivo do `hr`, o cursor não entra dentro dele, e pressionar
Backspace ou Delete imediatamente antes ou depois o apaga inteiro. Um
incorporado que não seja do YouTube é **descartado por inteiro** na entrada —
não se instala um documento estranho dentro do nosso.

## Linha de contexto

Clicar no vídeo exibe dois campos.

| Tipo | Campo |
|---|---|
| Largura | Seis passos `50` `60` `70` `80` `90` `100` (padrão `70`) — é uma régua, e o valor atual aparece junto |
| Endereço | Uma camada de entrada já preenchida com o id do vídeo atual |

**Não há campos de esquerda, centro e direita aqui.** O lugar do vídeo não é
carregado pelo vídeo, e sim pelo **parágrafo-invólucro que o contém** — quem
faz esse trabalho são os botões de alinhamento da barra de ferramentas. Um
vídeo recém-inserido nasce com o parágrafo-invólucro alinhado ao centro (`c`).

Por isso, na saída, a largura fica no vídeo e o alinhamento fica no parágrafo
que o envolve.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

Nenhum `style` inline sai. Se o host quiser inserir pela própria interface,
chama o comando diretamente — `applyCommand('insertYoutube', { v: endereço, w:
'80' })`; para só trocar a largura, `applyCommand('setYoutubeWidth', { w: '80'
})`. Uma largura fora da lista é recusada.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
