---
title: Sobrescrito
---

# Sobrescrito

## Descrição

`superscriptWing` é o dono (claim) de `<sup>`. Use-o em expoentes de unidades ou
em números de nota de rodapé.

- A única tag aceita é `<sup>`. Nenhum atributo sobrevive.
- Não há atalho no modo de dicas nem acelerador (é um dos wings que não exibem
  badge, como o de envio de arquivo). O grupo na barra de ferramentas é
  `script`, lado a lado com o subscrito, mas na ordem de registro este vem
  primeiro.
- Pressionar com o texto selecionado é uma alternância.
- A aparência vem da folha de estilo que este wing carrega em `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**Essa folha é compartilhada com o subscrito.** Os dois wings carregam o mesmo
texto, então mesmo que registre os dois, ela entra **uma única vez** no
documento (`collectSheets` remove as folhas repetidas). No valor salvo (HTML)
fica só a tag `<sup>`; o estilo em si não vai junto.

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// a lista de wings monta junto o conhecimento de tipos, os comandos e o montador — isso é o `registry`
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
