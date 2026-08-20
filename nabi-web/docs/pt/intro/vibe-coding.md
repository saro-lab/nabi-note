---
title: Vibe coding com IA
description: llms.txt
---

# Vibe coding com IA

**`llms.txt`** é uma especificação que os sites usam para entregar seu conteúdo a agentes de
IA (LLMs). Em vez de HTML, ela organiza a estrutura e o modo de uso de um projeto em markdown que
um agente lê direto. A especificação completa está em [llmstxt.org](https://llmstxt.org/).

Este site também abriu essa porta. Não há endereço para memorizar — como no exemplo abaixo,
**basta entregar o endereço ao agente** e ele segue o resto por conta própria.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf e outros já suportam o padrão llms.txt.

## Ao adotar por primeira vez

Ao trazer o nabi-note para um site que ainda não o usa, diga ao agente de uma vez o que você
quer ligado, se há modo claro/escuro, e como vai distribuir — o resto ele monta por conta
própria. **Só a última frase muda entre os três casos abaixo** — o resto pode ficar como está.

### npm + renderização no servidor (SSR) — renderizado no servidor (Node) a cada requisição

Isso cobre tanto um backend Node que você mesmo mantém quanto um framework de SSR como
Next.js, Nuxt ou SvelteKit — nos dois casos, o documento é renderizado no Node e enviado a
cada requisição.

```
Queremos trazer o nabi-note como nosso novo editor. Use https://nabi.saro.me/llms.txt
como manual. Nosso site tem modo claro/escuro, então ajuste o editor a ele. Ligue
todos os wings que já vêm por padrão.

Nós renderizamos no servidor com Nuxt, e queremos que o texto já esteja visível no
momento em que a pessoa chega na página. Instale com npm e conecte com SSR mais
hydrate.
```

### npm + montagem só no navegador (CSR) — tem bundler, mas não precisa de renderização no servidor

```
Queremos trazer o nabi-note como nosso novo editor. Use https://nabi.saro.me/llms.txt
como manual. Nosso site tem modo claro/escuro, então ajuste o editor a ele. Ligue
todos os wings que já vêm por padrão.

É um frontend feito com Vite, e não precisamos de renderização no servidor. Instale
com npm e monte só no navegador.
```

### CDN — página estática sem ferramenta de build

```
Queremos trazer o nabi-note como nosso novo editor. Use https://nabi.saro.me/llms.txt
como manual. Nosso site tem modo claro/escuro, então ajuste o editor a ele. Ligue
todos os wings que já vêm por padrão.

Esta página é HTML estático, sem ferramenta de build. Conecte com uma tag <script>.
```

::: tip Claro e escuro não precisam de instrução nenhuma
O `nabi.css` já traz os valores padrão do modo claro, a substituição `.dark` e uma
substituição explícita `.light`. Deixe a classe `dark`/`light` da página como está e o
editor segue sozinho. Para mudar a cor da marca, peça ao agente para ler também o
`llms/styling.md`.
:::

Os três exemplos só diferem nessa última frase — o agente encontra e lê,
respectivamente, `llms/ssr.md` (mais `llms/quickstart-npm.md`), `llms/quickstart-npm.md`
e `llms/quickstart-cdn.md`, e conecta daquele jeito.

## Ao mudar, adicionar ou remover uma funcionalidade

Com o nabi-note já em uso, é mais seguro pedir uma mudança ou adição como **pesquisa e um
plano primeiro, em vez de já pedir a implementação** — principalmente quando a funcionalidade
chega até o backend, onde é preciso saber o que preparar antes de escrever qualquer código.

### Exemplo — pesquisa e plano primeiro

```
Quero adicionar upload de arquivos. Leia https://nabi.saro.me/llms/wings.md e
https://nabi.saro.me/llms/api-reference.md, e descubra o que nosso backend
precisa para suportar o wing de upload (um endpoint para receber arquivos,
extensões e limites de tamanho permitidos, como deveria ser uma resposta de
falha). Não implemente ainda — só me mostre um plano do que precisa ser
preparado.
```

O agente vai encontrar no `llms/wings.md` que `upload` é um wing do tipo ferramenta que
recebe um `Uploader`, confirmar as assinaturas reais de `mountUpload`, `Uploader` e
`allowLocalUrls` no `llms/api-reference.md`, e montar um plano separando o que o backend
precisa expor do que o frontend decide por conta própria. Depois de revisar e aprovar o
plano, é só pedir para implementar.

### Um exemplo mais simples — pode pedir direto

Uma mudança pontual que não precisa de plano pode ser pedida direto.

```
Leia https://nabi.saro.me/llms/styling.md e mude só a cor de destaque e o
fundo do tema escuro para as cores da nossa marca.
```

::: tip Um wing que quebra o contrato é rejeitado já no registro
Ao pedir para o agente construir um wing novo, peça também para ele ler o
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md). Erros comuns — usar
uma palavra reservada como nome, ou um wing que produz nó sem `toHtml` — não falham
depois; **são rejeitados no exato momento do registro.** A seção "Morre já no próprio
registro" daquele documento lista o que é pego.
:::

::: tip Depois que estiver funcionando, deixe uma linha registrada
Depois da primeira integração, não é preciso repetir o endereço toda vez. Adicione uma
linha como esta ao arquivo de regras do projeto (`CLAUDE.md`, `.cursorrules`, etc.), e um
pedido tão curto quanto "faça X com nabi-note" já basta para o agente encontrar o
endereço por conta própria.

```md
Este projeto usa o `nabi-note` como editor. Confira
https://nabi.saro.me/llms.txt antes de trabalhar em algo relacionado a ele.
```
:::

## Próximas páginas

- [{{ t('menu_intro_index') }}](../intro) — as palavras que esta documentação usa
- [{{ t('menu_wing_custom') }}](../wing/custom) — construir você mesmo, como documento legível
  por humanos, uma formatação que ainda não existe

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
