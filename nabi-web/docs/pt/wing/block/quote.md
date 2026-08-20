---
title: Citação
---

# Citação

## Descrição

`quoteWing` (id `quote`) é dono da caixa de citação (`<blockquote>`). É
`place: 'container'` e `holds: 'blocks'` — por dentro moram blocos. Como
qualquer outro objeto, a própria citação também usa um parágrafo-invólucro e
fica no nível superior.

**Ela não define `allows`.** O interior da citação segue a mesma regra do nível
superior, então tabela e imagem também podem entrar, cada uma com seu
parágrafo-invólucro — colar ou importar um HTML desse tipo preserva a
estrutura tal e qual.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["texto"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Só que **os botões de inserir não colocam nada dentro da citação.** Coisas como
imagem, tabela e divisor, que entram por `insertLump`, sempre se instalam no
**nível superior** — então mesmo com o cursor dentro da citação, o objeto novo
fica **depois** dela. Para colocar algo dentro, é preciso colar.

Pressionar o botão envolve em citação todos os blocos de nível superior que a
seleção abrange. Só desfaz quando tudo o que está selecionado **já é
citação** — se for uma mistura, envolve tudo de novo, mais uma camada.

Digitar `>` sozinho no começo da linha e depois espaço também torna aquela
linha uma citação — nessa conversão automática **o gatilho é o espaço** (não o
Enter), porque você continua escrevendo na mesma linha.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
