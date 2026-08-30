---
title: Usar CDN
description: Carregue a versão de navegador do NABI NOTE sem ferramenta de build.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Usar CDN

Em uma página estática onde instalar um pacote não é prático, carregue a versão de navegador e seu CSS a partir de um CDN. A demonstração abaixo lê a versão do pacote durante o build do site e cria um editor pelo objeto global `NabiNote`.

<CdnDemo />

## Pontos a observar no NABI NOTE

- Em código publicado, fixe o CSS e o JavaScript do navegador na mesma versão. Uma URL sem versão, como `latest`, pode mudar de comportamento quando uma nova versão for publicada.
- O bundle de navegador expõe a API raiz por `window.NabiNote`. `nabi-note/ssr`, `nabi-note/viewer` e `nabi-note/diff` não são bundles globais separados.
- O salvamento de arquivos e o histórico local desta demonstração rodam no navegador do usuário. Envie a saída de `getJson()` para a API da sua aplicação se precisar de armazenamento no servidor ou sincronização de conta.
- Upload exige o wing `upload`, uma função real de upload e o wing de imagem ou de link necessário. Seu servidor de upload é responsável por validar os arquivos.
- A versão de navegador conecta internamente seu parser HTML. `setHtml()`, abrir um arquivo HTML e colar HTML não precisam de uma opção de parser nem de API privada.

Carregar por CDN muda apenas a forma de carregar a biblioteca. O formato de armazenamento e a validação de entrada são os mesmos do pacote npm; veja também [Uso básico](/pt/guide/getting-started).
