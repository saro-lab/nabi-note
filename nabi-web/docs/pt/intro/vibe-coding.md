---
title: Vibe coding com IA
description: Explica como adotar e desenvolver o NABI NOTE com um assistente de código de IA, usando o llms.txt.
---

# Vibe coding com IA

**`llms.txt`** é uma especificação padrão criada para que um site comunique de forma eficiente a estrutura e o uso de um projeto a agentes de IA (LLMs).
Em vez de marcação HTML, ela fornece a especificação e a API do projeto como um documento markdown limpo, fácil de uma IA processar. A especificação completa está em [llmstxt.org](https://llmstxt.org/).

O site oficial do NABI NOTE também tem suporte completo a `llms.txt`. Não é preciso copiar a documentação inteira à mão — **basta passar a URL abaixo ao agente de IA**, e ele mesmo explora a documentação para realizar a tarefa.

```
https://nabi.saro.me/llms.txt
```

Ferramentas atuais de código com IA, como Cursor, Claude Code, OpenAI Codex e Windsurf, já suportam o padrão `llms.txt`.

## Ao adotar por primeira vez

Ao trazer o NABI NOTE para um projeto por primeira vez, basta informar as funcionalidades desejadas, se o modo claro/escuro deve ser suportado, e o ambiente de implantação (SSR/CSR/CDN) — o agente de IA escreve o código ideal a partir disso.

### npm + renderização no servidor (SSR) — Next.js, Nuxt, SvelteKit etc.

```
Queremos trazer o nabi-note como o novo editor do nosso site. O manual está
em https://nabi.saro.me/llms.txt. Nosso site tem modo claro/escuro, então
ajuste o tema do editor a ele. Ative todos os wings que já vêm por padrão.

Nosso serviço faz renderização no servidor com Nuxt. Para não haver
nenhum flash na primeira visita, instale via npm e conecte com SSR +
hydrate, de forma que venha pré-renderizado do servidor.
```

### npm + apenas no cliente (CSR) — Vite, CRA, ambientes SPA

```
Queremos trazer o nabi-note como o novo editor do nosso site. O manual está
em https://nabi.saro.me/llms.txt. Nosso site tem modo claro/escuro, então
ajuste o tema do editor a ele. Ative todos os wings que já vêm por padrão.

É um ambiente de frontend SPA baseado em Vite, não precisamos de
renderização no servidor. Instale como pacote npm e monte só no lado do
navegador.
```

### CDN — ambiente de HTML estático

```
Queremos trazer o nabi-note como o novo editor do nosso site. O manual está
em https://nabi.saro.me/llms.txt. Nosso site tem modo claro/escuro, então
ajuste o tema do editor a ele. Ative todos os wings que já vêm por padrão.

Esta página é HTML estático sem ferramenta de build. Conecte com tags
<script> e <link>.
```

::: tip O tema (claro/escuro) se ajusta automaticamente
O `nabi.css` já traz embutidos o padrão claro, a classe `.dark` e uma classe `.light` explícita. Ao alternar o `class="dark"` no elemento raiz da página, o tema do editor muda automaticamente junto. Para personalizar com as cores da sua marca, peça também para o agente ler o `llms/styling.md`.
:::

## Ao adicionar ou personalizar uma funcionalidade

Ao adicionar ou alterar uma funcionalidade em um editor já integrado, é mais seguro **pedir primeiro uma investigação e um plano de implementação**. Isso vale especialmente para funcionalidades que envolvem uma API de backend (como upload de arquivos), cujos requisitos precisam ser esclarecidos antes.

### Exemplo de prompt — investigação e planejamento

```
Quero integrar a funcionalidade de upload de arquivos. Leia
https://nabi.saro.me/llms/wings.md e
https://nabi.saro.me/llms/api-reference.md e investigue primeiro como devem
ficar a especificação da API de backend (endpoint, extensões/limites de
tamanho permitidos, formato da resposta JSON etc.) e o código de integração
do frontend necessários para ativar o wing de upload.
Não escreva código ainda — mostre primeiro os requisitos a preparar e um
plano de implementação.
```

### Exemplo de prompt — mudança de estilo simples

```
Leia https://nabi.saro.me/llms/styling.md e redefina a cor de destaque do
editor e a cor de fundo do tema escuro como variáveis CSS, de acordo com as
cores da nossa marca.
```

::: tip Um wing que viola a especificação lança uma exceção imediatamente no registro
Ao pedir para o agente escrever um novo wing personalizado, peça também para ele ler o [`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md). Erros comuns, como conflito com palavra reservada ou método obrigatório ausente, não são descobertos tardiamente em tempo de execução — são **detectados imediatamente como exceção no momento do registro inicial**.
:::

::: tip Registre no arquivo de regras do projeto
Ao adicionar esta frase ao documento de diretrizes do seu projeto (`CLAUDE.md`, `.cursorrules`, `AGENT.md` etc.), basta depois pedir algo como "adicione a funcionalidade ~ ao editor" para que a IA consulte o `llms.txt` por conta própria.

```md
Este projeto usa o `nabi-note` como editor WYSIWYG. Para tarefas
relacionadas, confira primeiro https://nabi.saro.me/llms.txt.
```
:::

## Próximos documentos

- [{{ t('menu_intro_index') }}](../intro) — introdução e arquitetura do NABI NOTE
- [{{ t('menu_wing_custom') }}](../wing/custom) — guia de criação de wings personalizados

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
