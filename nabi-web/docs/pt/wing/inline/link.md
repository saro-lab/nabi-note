---
title: Link
---

# Link

## Descrição

`linkWing` (id `a`) é a wing de marca em linha que trata hiperlinks (`<a href>`).

Ao clicar no botão da barra de ferramentas, abre-se um popup para digitar a URL do link. Só é possível inserir uma URL segura que comece com `http:` ou `https:` — uma URL de script malicioso como `javascript:` é filtrada automaticamente pela política de segurança contra XSS.

O popup do link recebe juntos a **URL do link** e o **texto exibido**. Se deixar o campo de texto vazio, a própria URL passa a ser o texto exibido.

## Editar um link pela linha de contexto

Quando o cursor já está dentro de um link existente, a linha de contexto dinâmica mostra campos de texto embutidos para editá-lo na hora:

| Campo | Descrição |
|---|---|
| Endereço do link (`href`) | Muda só a URL de destino do link (o texto exibido é mantido) |
| Nome exibido | Muda só o texto exibido no corpo (a URL é mantida) |

## Exemplo de uso

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
