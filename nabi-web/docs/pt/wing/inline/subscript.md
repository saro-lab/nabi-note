---
title: Subscrito
---

# Subscrito

## Descrição

`subscriptWing` é o dono (claim) de `<sub>`. Use-o em fórmulas químicas ou em
números escritos abaixo da linha.

- A única tag aceita é `<sub>`. Nenhum atributo sobrevive.
- Não há atalho no modo de dicas nem acelerador. O grupo na barra de ferramentas
  é `script`, lado a lado com o sobrescrito (na ordem de registro, o sobrescrito
  vem primeiro).
- Pressionar com o texto selecionado é uma alternância.
- A aparência vem da folha de estilo que este wing carrega em `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**Essa folha é compartilhada com o sobrescrito.** Os dois wings carregam o mesmo
texto, então mesmo que registre os dois, ela entra **uma única vez** no
documento (`collectSheets` remove as folhas repetidas). No valor salvo (HTML)
fica só a tag `<sub>`; o estilo em si não vai junto.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
