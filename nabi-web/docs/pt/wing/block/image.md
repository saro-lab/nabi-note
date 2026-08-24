---
title: Imagem
---

# Imagem

## Descrição

`imageWing` (identificador `img`) é dono do elemento de imagem (`<img>`). Como `hr` e `youtube`,
é um bloco `place: 'void'` sem nada dentro. Clique no botão da barra de ferramentas e aparece um
painel para digitar o endereço da imagem.

**O endereço é validado pelo esquema, não pela extensão do arquivo.** Só `http:`, `https:` e
caminhos relativos são permitidos — esquemas maliciosos como `javascript:` e endereços relativos
a protocolo (`//example.com/a.png`) são filtrados. Um endereço de API dinâmico que devolve uma
imagem sem extensão é suportado sem problema.

Como o cursor nunca entra numa imagem, clicar nela seleciona a imagem inteira e abre uma linha de
contexto dedicada:

| Controle | Descrição |
|---|---|
| Largura | um controle deslizante que ajusta a largura de `30%` a `100%` em passos de 10% (padrão `60%`) |
| Ver grande (lightbox) | amplia a imagem no tamanho original numa janela modal |

O alinhamento esquerda/centro/direita de uma imagem é uma propriedade do **parágrafo wrapper
(`<div data-nabi-p>`)** que a envolve, então ele é ajustado pelos botões de alinhamento da barra
de ferramentas principal.

Uma imagem recém-inserida fica centralizada (`data-nabi-align="c"`) por padrão.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Ela é salva como atributo semântico sem `style` inline — o tamanho e o alinhamento reais são
desenhados pelo `nabi.css`.

### Permitindo endereços locais (`allowLocalUrls`)

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Defina `allowLocalUrls: true` e endereços locais nos formatos `blob:` e `data:image/...` também
são permitidos — útil, por exemplo, para uma pré-visualização local antes de um upload de arquivo
(padrão `false`).

Se o endereço de uma imagem for inválido, ou um endereço blob tiver expirado e o carregamento
falhar, o hook `attach` do wing mostra automaticamente um espaço reservado de imagem quebrada.
Funciona sem configuração extra de montagem e, sendo uma interface só de tela, não afeta os dados
salvos.

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

Para permitir endereços `blob:`, use a função fábrica:

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
