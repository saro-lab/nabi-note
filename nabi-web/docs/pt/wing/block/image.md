---
title: Imagem
description: Insira uma URL de imagem e ajuste largura e alinhamento.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Imagem

Insira uma URL de imagem e ajuste sua largura e alinhamento. Por padrão, endereços são limitados a `http:`, `https:` ou caminhos do mesmo site, e uma nova imagem começa centralizada com 60% de largura.

A largura é salva apenas em passos fixos, e o alinhamento é salvo no parágrafo que envolve a imagem. Para usar prévias `blob:` ou `data:image/...`, permita URLs locais explicitamente tanto no wing de imagem quanto na montagem do editor. URLs de dados SVG não são permitidas.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Este wing insere um endereço no documento; ele não faz upload de arquivos. Para enviar arquivos a um servidor, conecte o [wing de upload](/pt/wing/etc/upload).

## Conectar um seletor de imagens

Use `panels.img` em `mountToolbar()` para substituir a entrada de URL padrão do botão de imagem pelo seletor de imagens do seu serviço. As chaves são nomes de slots da barra de ferramentas; as ferramentas omitidas mantêm suas entradas padrão.

`mode: 'modal'` abre uma janela sobre um fundo translúcido que cobre toda a página. `mode: 'inline'` abre perto do botão da ferramenta no computador e em tela cheia no celular. A largura da janela e `--nabi-mobile-breakpoint` determinam a exibição móvel; se esse limite for cruzado enquanto um painel `inline` estiver aberto, ele será fechado.

Os dois modos fornecem apenas um `root` vazio, sem título, campos ou botões. Adicione seu HTML ou sua interface em `render`, conecte o botão de fechar a `close()` e a seleção de imagens a `insertImage(url, 'pointer')`. As entradas existentes em formato de função (`img: renderer`) mantêm seu comportamento de exibição.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker` é uma função que você implementa no seu serviço. Ela cria sua interface de forma síncrona dentro do `root` recebido e retorna uma função de limpeza. Conecte `signal` a tarefas assíncronas, como carregar uma lista de imagens ou fazer upload, e passe a URL da imagem escolhida para `onSelect`. Esta API não transfere arquivos; as regras existentes para URLs de imagens continuam valendo.

`insertImage(src, by?)` equivale a `run('insertImage', { src }, by)`, incluindo o valor de retorno e as regras de restauração da seleção. Se `by` for omitido, será usado `'keyboard'`. Não defina `render` como uma função `async`.

Fechar o painel ou desmontar a barra de ferramentas interrompe `signal` e chama a função de limpeza. `run()` fecha o painel e aplica um comando uma única vez à seleção capturada na abertura. Se o painel já estiver fechado ou o conteúdo do documento tiver mudado desde a abertura, retorna `false` sem executar o comando.

## Estilos CSS

Estilize imagens com `.nabi-content img`. Mantenha intactos a largura e o alinhamento salvos, e altere apenas detalhes visuais como bordas ou sombras.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Mantenha as regras padrão de `max-inline-size`, `block-size`, largura e alinhamento. O tamanho da imagem é salvo no documento, então forçar uma largura CSS fixa pode conflitar com a largura escolhida pelo autor.
