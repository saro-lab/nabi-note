---
title: AI vibe coding
description: Ajude agentes de codificação a usar o NABI NOTE com precisão, apoiando-os na API pública atual e nos limites da documentação.
---

# AI vibe coding

O NABI NOTE fornece [`llms.txt`](/llms.txt) para ferramentas de IA e automação. Em vez de pedir que um agente adivinhe a biblioteca inteira, comece por esse índice e faça com que ele leia apenas os documentos necessários para a tarefa.

## Prompt inicial

Preencha o framework e os recursos de que você precisa.

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

Se o agente não conseguir abrir URLs, inclua `llms.txt` e os documentos vinculados relevantes na conversa.

## Aponte apenas para o que ele precisa

`llms.txt` é um índice compacto. Dar ao agente apenas as páginas relevantes costuma ser mais útil do que enviar todos os documentos de uma vez.

- montagem npm: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- configuração por CDN: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- seleção de wings: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- JSON armazenado, HTML e eventos de alteração: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- importação HTML, colar e limites de upload: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- wings personalizadas e renderização no servidor: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- visualizador, diff, estilos e capitulares: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- imports e tipos exatos: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## Inclua os requisitos do produto

Um agente não consegue inferir armazenamento, política de segurança ou comportamento de upload apenas pela tela de edição. Informe o framework real, as wings incluídas e excluídas, se JSON e HTML são armazenados, o contrato de requisição e resposta do endpoint de upload, limites de arquivo e se páginas publicadas precisam de SSR, comportamento de visualizador ou comparação de alterações.

Para qualquer ponto ainda não decidido, peça ao agente que explique as opções e seus impactos antes de implementar uma escolha.

## Revise o resultado

Revise o código gerado como qualquer outro código. Em especial, verifique se ele:

- carrega `nabi-note/nabi.css` tanto na edição quanto no conteúdo publicado;
- usa o mesmo `registry` para as wings selecionadas e todos os mounts;
- armazena `getJson()`, nunca `getEditorHtml()`;
- não escreve diretamente em `innerHTML` de um elemento de edição `.nabi-content`;
- desmonta todos os mounts quando a tela fecha;
- valida tipo MIME, tamanho, autorização e local de armazenamento no servidor de upload;
- usa a mesma ordem de wings e as mesmas opções que afetam HTML no servidor e no navegador;
- confirma nomes reais de exports por meio de checagem de tipos, testes e build.

Comportamento de IME e caret, além dos caminhos de salvar e carregar, precisam de verificação real mesmo quando a página parece funcionar uma vez. Teste entrada por composição em dispositivos móveis e também a restauração de documentos salvos.

## Prefira a versão instalada

Quando um projeto já tem `nabi-note` instalado, os exports de `package.json` e as declarações de tipo dessa instalação são mais diretamente relevantes do que um site feito para outra versão. Peça ao agente que verifique essa diferença de versão antes de escrever código.
