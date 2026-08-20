---
title: Link
---

# Link

## Descrição

`linkWing` (id `a`) é o dono de `<a href>`. Ao pressionar o botão, uma
camada de entrada de endereço abre perto do cursor, e a confirmação só é
habilitada para endereços que comecem com `http`/`https` — essa própria
verificação por lista branca é a defesa contra XSS (esquemas como `javascript:`
nem chegam a passar). Um `href` que não passa na validação não é salvo, e nesse
caso o conteúdo sai como texto puro, sem a tag `<a>`.

A camada tem dois campos — o endereço e o texto a exibir. Se você deixar o campo
de texto vazio, o endereço vira o texto; e se houver apenas o cursor, sem texto
selecionado, a marca de link inteira em que o cursor está vira o alvo (mesma
regra do realce e da cor do texto).

## Links já existentes se editam na linha de contexto

Quando o cursor pousa dentro de um link, a linha de contexto exibe **dois campos
de texto** — não botões que abrem uma camada, mas campos de entrada que ficam na
própria linha (`kind: 'text'`). Eles aparecem já preenchidos com o valor atual, e
o que você digitar é aplicado ao pressionar Enter ou ao clicar em outro lugar. Se
o valor continuar o mesmo, nada acontece.

| Campo | O que faz |
|---|---|
| Endereço | Troca só o endereço. O texto exibido permanece. |
| Texto exibido | Troca só o texto exibido. O endereço e a marca de anexo permanecem. |

**Em anexos (links de arquivo) o campo de endereço não aparece** — aquele
endereço foi definido pelo envio, não é um valor para se corrigir à mão. O campo
de nome aparece igual para links comuns e para anexos. Nome vazio não é aceito —
criar um link sem nome não é renomear, é apagar.

## O anexo é um bloco só na tela

O anexo é tratado por inteiro. Ao clicar, o cursor não desce para dentro dele —
**o link inteiro é selecionado**, e pressionar backspace ou delete logo ao lado
**apaga o link por inteiro**. Corrigir é trabalho da linha de contexto, não do
cursor.

Isso é mantido pelo `attach` do wing, e o `mountSurface` já o prende junto —
**não há nada a montar à parte.**

## A marca de anexo

Um link que entrou por um envio de arquivo recebe a marca `data-nabi-file` (o
valor é a extensão) — é essa marca que faz a folha de estilo desenhar uma caixa
de clipe em vez de um sublinhado. Trocando o nome ou trocando o endereço, a marca
vai junto. Limpar formatação também não desmonta os anexos — tirar a casca
deixaria o anexo como uma linha morta de texto puro.

`linkWing` é uma **constante** — não se chama com parênteses, e não há opção
para passar.

::: warning `allowLocalUrls` não alcança o link
O interruptor que abre endereços `blob:`/`data:` só vale **para a imagem**. A
saída é sempre estrita: a porta que `getHtml()` usa para filtrar endereços
(`ctx.url`) olha a lista branca do mesmo jeito, não importa o que o host tenha
ligado.

Por isso, um anexo de link que carrega um endereço `blob:` **cai como texto
puro no momento de exportar.** É por isso que o envio não deve deixar o endereço
temporário como está — depois de enviado, é preciso trocá-lo pelo endereço real
recebido para que ele fique no documento.
:::

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
