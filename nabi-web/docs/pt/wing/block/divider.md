---
title: Separador
---

# Separador

## Descrição

`dividerWing` (id `hr`) é dono de um único `<hr>`. **`place: 'void'`** — é um
objeto sem interior, então não há onde o cursor entrar. Pressionar Backspace ou
Delete imediatamente antes ou depois do separador apaga o bloco inteiro de uma
vez, e selecionar um trecho que o contenha dá o mesmo resultado.

Pressionar o botão faz o separador entrar **com seu próprio
parágrafo-invólucro**. Não nasce junto um parágrafo vazio à parte — o cursor
fica em cima desse parágrafo-invólucro, logo depois do separador.

Onde ele se instala depende de o parágrafo em que o cursor estava ter texto ou
não.

| Onde o cursor estava | Resultado |
|---|---|
| Parágrafo com texto | Entra **depois** desse parágrafo |
| Parágrafo vazio | **Substitui** esse parágrafo — não sobra uma linha vazia |

Ao substituir um parágrafo vazio, o alinhamento que aquele parágrafo carregava
sobrevive.

Escrever três ou mais hifens (`---`) sozinhos no começo da linha e pressionar
Enter dá o mesmo resultado — nessa conversão automática, **o gatilho é o
Enter**.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
