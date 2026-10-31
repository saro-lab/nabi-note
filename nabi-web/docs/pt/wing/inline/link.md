---
title: Link
description: Conecta endereços web seguros e mostra anexos enviados.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Link

Selecione texto e associe um endereço a ele. Se você inserir um endereço sem selecionar texto, o próprio endereço é inserido como texto do link. Digitar um endereço `http://` ou `https://` e depois pressionar Espaço ou Enter também o transforma em link.

Links guardam apenas `http:`, `https:` e caminhos do mesmo site que começam com `.` ou `/`. Endereços cuja origem não possa ser identificada claramente, como `javascript:` ou `//example.com`, são rejeitados. Links de anexos criados por uploads também guardam informações de arquivo e não podem ser criados manualmente como links comuns.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Colar URLs

Se todo o conteúdo colado, sem os espaços em branco no início e no fim, for uma URL `http://` ou `https://` válida, ele será inserido imediatamente como link. URLs dentro de frases, textos com várias URLs e caminhos relativos seguem o comportamento de colagem existente. Em blocos de código e editores sem o wing de links, o conteúdo continua como texto. Dados internos válidos da área de transferência copiados do editor têm prioridade para preservar a formatação original.

Use o callback `onPasteUrl` de `mountSurface()` para escolher o texto exibido do link.

| Argumento | Valor |
| --- | --- |
| `url` | A URL completa sem os espaços em branco no início e no fim |
| `isSameOrigin` | Se o protocolo, o host e a porta da URL correspondem à origem do documento que contém o editor |
| `path` | O caminho que começa com `/`, incluindo a consulta e o fragmento. Exemplo: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

Uma string retornada que não contenha apenas espaços em branco passa a ser o texto exibido. Se o callback estiver ausente, retornar um valor vazio ou que não seja uma string, ou falhar, a URL colada permanece como texto exibido. As strings retornadas nunca são interpretadas como HTML e não alteram o endereço do link.

O callback também aceita funções `async` e promises. O link com a URL é inserido imediatamente enquanto a resposta está pendente; um resultado válido recebido depois altera apenas o texto exibido desse link. Um resultado tardio é ignorado se o link tiver sido editado ou excluído, um novo documento tiver sido carregado ou a superfície tiver sido desmontada.

## Estilos CSS

Estilize links comuns com `.nabi-content a`, e links de anexo separadamente com `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

As partes `::before` e `::after` de links de anexo são usadas para mostrar o ícone do arquivo e a extensão, então normalmente é melhor não substituir nem remover seu `content`.
